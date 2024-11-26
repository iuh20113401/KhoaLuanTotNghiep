const Mongoose = require('mongoose');

const doAn = require('../model/doAnModel');
const User = require('../model/userModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');
const fieldObj = require('../utils/filterObj');
const { upload } = require('./uploadController');
const SinhVien = require('../model/sinhVien');
const caiDat = require('../model/CaiDatModel');
const { getHocKyQuery } = require('../utils/getHocKyQuery');
const APIFeature = require('../utils/apiFeatures');
const { default: mongoose } = require('mongoose');

exports.updateDoAn = Factory.updateOne(doAn);

exports.getAllDoAn = catchAsync(async (req, res, next) => {
  const { namHoc, hocKy } = await getHocKyQuery(req);

  if (!namHoc || !hocKy) {
    return next(
      new ApiError('Invalid or missing academic year/semester.', 400),
    );
  }

  const commonFields = 'maSo hoTen hinhAnh soDienThoai email ngaySinh';

  const feature = await new APIFeature(doAn.find({ namHoc, hocKy }), req.query)
    .filter()
    .sort('maDoAn')
    .fields()
    .panigation();

  const { query } = feature;
  console.log(query);
  const results = await query
    .populate([
      { path: 'deTai', select: 'tenDeTai moTa kyNangCanCo ketQuaCanDat' },
      { path: 'giangVien', select: commonFields },
      { path: 'sinhVien1', select: commonFields },
      { path: 'sinhVien2', select: commonFields },
      { path: 'giangVienPhanBien1', select: commonFields },
      { path: 'giangVienPhanBien2', select: commonFields },
      { path: 'sinhVien1Info', select: 'thucTap doAn diem -_id' },
      { path: 'sinhVien2Info', select: 'thucTap doAn diem -_id' },
    ])
    .select('-__v');

  res.status(200).json({
    status: 'success',
    results: results.length,
    data: { results },
  });
});
exports.getDoAn = catchAsync(async (req, res, next) => {
  const result = await doAn.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien1',
        foreignField: '_id',
        as: 'user1Info',
      },
    },
    {
      $unwind: '$user1Info',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'giangVien',
        foreignField: '_id',
        as: 'giangVienInfo',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'giangVienPhanBien1',
        foreignField: '_id',
        as: 'giangVienPhanBien1Info',
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'giangVienPhanBien2',
        foreignField: '_id',
        as: 'giangVienPhanBien2Info',
      },
    },
    {
      $unwind: '$giangVienInfo',
    },
    {
      $unwind: '$giangVienPhanBien1Info',
    },
    {
      $unwind: '$giangVienPhanBien2Info',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien2',
        foreignField: '_id',
        as: 'user2Info',
      },
    },
    {
      $unwind: {
        path: '$user2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'sinhviens',
        localField: 'user1Info._id',
        foreignField: 'userId',
        as: 'sinhVien1Info',
      },
    },
    {
      $unwind: '$sinhVien1Info',
    },
    {
      $lookup: {
        from: 'sinhviens',
        localField: 'user2Info._id',
        foreignField: 'userId',
        as: 'sinhVien2Info',
      },
    },
    {
      $unwind: {
        path: '$sinhVien2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'detais',
        localField: 'deTai',
        foreignField: '_id',
        as: 'deTaiInfo',
      },
    },
    {
      $unwind: '$deTaiInfo',
    },
    {
      $match: {
        _id: new mongoose.Types.ObjectId(req.params.id),
      },
    },

    {
      $project: {
        _id: 1,
        maDoAn: 1,
        tenDoAn: 1,
        taiLieu: 1,
        trangThai: 1,
        deTai: '$deTaiInfo',
        giangVien: '$giangVienInfo',
        giangVienPhanBien1: '$giangVienPhanBien1Info',
        giangVienPhanBien2: '$giangVienPhanBien2Info',
        sinhVien1: {
          maSo: '$user1Info.maSo',
          hoTen: '$user1Info.hoTen',
          hinhAnh: '$user1Info.hinhAnh',
          soDienThoai: '$user1Info.soDienThoai',
          email: '$user1Info.email',
          ngaySinh: '$user1Info.ngaySinh',
          diemDanh: '$sinhVien1Info.diemDanh',
          diem: '$sinhVien1Info.diem',
        },
        sinhVien2: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            },
            then: {
              maSo: '$user2Info.maSo',
              hoTen: '$user2Info.hoTen',
              hinhAnh: '$user2Info.hinhAnh',
              soDienThoai: '$user2Info.soDienThoai',
              email: '$user2Info.email',
              ngaySinh: '$user2Info.ngaySinh',
              diemDanh: '$sinhVien2Info.diemDanh',
              diem: '$sinhVien2Info.diem',
            },
            else: '$$REMOVE',
          },
        },
      },
    },
  ]);
  console.log(
    await doAn.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(req.params.id),
        },
      },
    ]),
    req.params.id,
    result,
  );
  res.status(200).json({ message: 'success', data: { result: result[0] } });
});
// exports.getDoAn = Factory.getOne(doAn, [
//   {
//     path: 'deTai',
//     select: 'tenDeTai moTa kyNangCanCo ketQuaCanDat',
//   },
//   {
//     path: 'giangVien',
//     select: 'maSo hoTen hinhAnh soDienThoai email ngaySinh',
//   },
//   {
//     path: 'sinhVien1',
//     select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
//   },
//   {
//     path: 'sinhVien2',
//     select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
//   },
//   {
//     path: 'giangVienPhanBien1',
//     select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
//   },
//   {
//     path: 'giangVienPhanBien2',
//     select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
//   },
// ]);
exports.deleteDoAn = Factory.deleteOne(doAn);

exports.taoDoAn = catchAsync(async (req, res, next) => {
  let caiDatInfo = await caiDat.find();
  caiDatInfo = caiDatInfo[0];
  const result = await doAn.create({ ...req.body, sinhVien1: req.user._id });
  res.status(201).json({
    status: 'success',
    data: { doAn: result },
  });
});

exports.themSinhVien2 = catchAsync(async (req, res, next) => {
  const result = await doAn.findByIdAndUpdate(req.params.id, {
    sinhVien2: req.user._id,
  });
  const result2 = await SinhVien.findOneAndUpdate(
    { userId: req.user._id },
    {
      doAn: req.params.id,
    },
  );
  if (!result || !result2) {
    return next(new ApiError('Lỗi', 401));
  }
  res.status(200).json({
    status: 'success',
    data: {
      doAn: result,
    },
  });
});

exports.themComment = catchAsync(async (req, res, next) => {
  const result = await doAn.findByIdAndUpdate(req.params.id, {
    $push: { comment: req.body },
  });
  if (!result) {
    next(
      new ApiError(
        'Không tìm thầy đồ án hoặc có lỗi trong quá trình thực thi',
        401,
      ),
    );
  }
  res.status(200).json({
    status: 'success',
    data: {
      result,
    },
  });
});
//lấy danh sách đồ án cho giảng viên
exports.getDanhSachDoAnTheoGiangVien = catchAsync(async (req, res, next) => {
  // eslint-disable-next-line prefer-const
  const { hocKy, namHoc } = await getHocKyQuery(req);

  const results = await doAn.aggregate([
    {
      // Join với bảng User để lấy thông tin sinhVien1
      $lookup: {
        from: 'users',
        localField: 'sinhVien1',
        foreignField: '_id',
        as: 'user1Info',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien1Info
      $unwind: '$user1Info',
    },
    {
      // Join với bảng User để lấy thông tin sinhVien2
      $lookup: {
        from: 'users',
        localField: 'sinhVien2',
        foreignField: '_id',
        as: 'user2Info',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien2Info
      $unwind: {
        path: '$user2Info',
        preserveNullAndEmptyArrays: true, // Giữ lại các đối tượng mà không có sinhVien2
      },
    },
    {
      // Join với bảng User để lấy thông tin sinhVien1
      $lookup: {
        from: 'sinhviens',
        localField: 'user1Info._id',
        foreignField: 'userId',
        as: 'sinhVien1Info',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien1Info
      $unwind: '$sinhVien1Info',
    },
    {
      // Join với bảng User để lấy thông tin sinhVien2
      $lookup: {
        from: 'sinhviens',
        localField: 'user2Info._id',
        foreignField: 'userId',
        as: 'sinhVien2Info',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien2Info
      $unwind: {
        path: '$sinhVien2Info',
        preserveNullAndEmptyArrays: true, // Giữ lại các đối tượng mà không có sinhVien2
      },
    },
    {
      // Join với bảng deTai để lấy thông tin đề tài
      $lookup: {
        from: 'detais',
        localField: 'deTai',
        foreignField: '_id',
        as: 'deTaiInfo',
      },
    },
    {
      // Unwind để xử lý mảng deTaiInfo
      $unwind: '$deTaiInfo',
    },
    {
      // Lọc các kết quả dựa trên ID giảng viên
      $match: {
        'deTaiInfo.giangVien': req.user._id,
        namHoc,
        hocKy,
      },
    },
    {
      // Group by maDoAn and aggregate the huongDan information
      $group: {
        _id: '$_id',
        maDoAn: { $first: '$maDoAn' },
        tenDoAn: { $first: '$tenDoAn' },
        trangThai: { $first: '$trangThai' },
        user1Info: { $first: '$user1Info' },
        sinhVien1Info: { $first: '$sinhVien1Info' },
        user2Info: { $first: '$user2Info' },
        sinhVien2Info: { $first: '$sinhVien2Info' },
        huongDan: { $first: '$huongDan' },
        totalHuongDan: { $first: { $size: '$huongDan' } }, // Tính tổng số huongDan
        completedHuongDan: {
          $sum: {
            $size: {
              $filter: {
                input: '$huongDan',
                as: 'hd',
                cond: { $eq: ['$$hd.trangThai', true] }, // Đếm các huongDan hoàn thành
              },
            },
          },
        },
      },
    },
    {
      // Calculate the completion percentage
      $project: {
        _id: 1,
        maDoAn: 1,
        tenDoAn: 1,
        trangThai: 1,
        sinhVien1Info: {
          sinhVienId: '$sinhVien1Info._id',
          diem: '$sinhVien1Info.diem',
        },
        sinhVien1: {
          maSo: '$user1Info.maSo',
          hoTen: '$user1Info.hoTen',
        },
        sinhVien2: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            },
            then: {
              maSo: '$user2Info.maSo',
              hoTen: '$user2Info.hoTen',
            },
            else: '$$REMOVE',
          },
        },
        sinhVien2Info: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              sinhVienId: '$sinhVien2Info._id',
              diem: '$sinhVien2Info.diem',
            },
            else: '$$REMOVE',
          },
        },
        huongDan: 1,
        totalHuongDan: 1,
        completedHuongDan: 1,
        completionPercentage: {
          $cond: {
            if: { $eq: ['$totalHuongDan', 0] },
            then: 0,
            else: {
              $multiply: [
                { $divide: ['$completedHuongDan', '$totalHuongDan'] },
                100,
              ],
            },
          },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      results,
    },
  });
});
// lấy danh sách đồ án phản biện cho giảng viên
exports.getDanhSachDoAnPhanBien = catchAsync(async (req, res, next) => {
  const { hocKy, namHoc } = await getHocKyQuery(req);

  const results = await doAn.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien1',
        foreignField: '_id',
        as: 'user1Info',
      },
    },
    {
      $unwind: '$user1Info',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien2',
        foreignField: '_id',
        as: 'user2Info',
      },
    },
    {
      $unwind: {
        path: '$user2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'sinhviens',
        localField: 'user1Info._id',
        foreignField: 'userId',
        as: 'sinhVien1Info',
      },
    },
    {
      $unwind: '$sinhVien1Info',
    },
    {
      $lookup: {
        from: 'sinhviens',
        localField: 'user2Info._id',
        foreignField: 'userId',
        as: 'sinhVien2Info',
      },
    },
    {
      $unwind: {
        path: '$sinhVien2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'detais',
        localField: 'deTai',
        foreignField: '_id',
        as: 'deTaiInfo',
      },
    },
    {
      $unwind: '$deTaiInfo',
    },
    {
      $match: {
        $or: [
          { giangVienPhanBien1: req.user._id },
          { giangVienPhanBien2: req.user._id },
        ],
        hocKy,
        namHoc,
      },
    },
    {
      $project: {
        _id: 1,
        maDoAn: 1,
        tenDoAn: 1,
        taiLieuPhanBien: 1,
        sinhVien1Info: {
          sinhVienId: '$sinhVien1Info._id',
          diem: '$sinhVien1Info.diem',
        },
        sinhVien1: {
          maSo: '$user1Info.maSo',
          hoTen: '$user1Info.hoTen',
        },
        sinhVien2: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              maSo: '$user2Info.maSo',
              hoTen: '$user2Info.hoTen',
            },
            else: '$$REMOVE',
          },
        },
        sinhVien2Info: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              sinhVienId: '$sinhVien2Info._id',
              diem: '$sinhVien2Info.diem',
            },
            else: '$$REMOVE',
          },
        },
        giangVienPhanBien: {
          $cond: {
            if: { $eq: ['$giangVienPhanBien1', req.user._id] },
            then: '1',
            else: {
              $cond: {
                if: { $eq: ['$giangVienPhanBien2', req.user._id] },
                then: '2',
                else: '$$REMOVE',
              },
            },
          },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      results,
    },
  });
});
//Tạo tài liệu đồ án
exports.taiTaiLieu = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ status: false, data: { message: err.message } });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, data: { message: 'No file uploaded' } });
    }

    // Update the doAn document
    const DoAn = await doAn.findById(req.params.id);

    if (!DoAn) {
      return res
        .status(404)
        .json({ success: false, data: { message: 'Không tìm thấy đồ án' } });
    }

    // Add the file info to the taiLieu array
    DoAn.taiLieu.push({
      tenTaiLieu: req.file.originalname,
      loaiTaiLieu: req.file.mimetype,
      dungLuong: `${(req.file.size / 1024).toFixed(2)} KB`,
      duongDan: req.file.path,
    });

    // Save the document
    await DoAn.save();

    res.status(200).json({ success: true, data: DoAn });
  });
});
//Tạo tài liệu cho giảng viên phản biện đồ án
exports.taiTaiLieuPhanBien = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ status: false, data: { message: err.message } });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, data: { message: 'No file uploaded' } });
    }

    // Update the doAn document
    const DoAn = await doAn.findById(req.params.id);

    if (!DoAn) {
      return res
        .status(404)
        .json({ success: false, data: { message: 'Không tìm thấy đồ án' } });
    }

    // Add the file info to the taiLieu array
    DoAn.taiLieuPhanBien?.push({
      tenTaiLieu: req.file.originalname,
      loaiTaiLieu: req.file.mimetype,
      dungLuong: `${(req.file.size / 1024).toFixed(2)} KB`,
      duongDan: req.file.path,
    });

    // Save the document
    await DoAn.save();

    res.status(200).json({ success: true, data: DoAn });
  });
});
// Xóa tài liệu phản biện
exports.xoaTaiLieuPhanBien = catchAsync(async (req, res, next) => {
  // Update the doAn document
  const DoAn = await doAn.findById(req.params.id);

  if (!DoAn) {
    return res
      .status(404)
      .json({ success: false, data: { message: 'Không tìm thấy đồ án' } });
  }
  if (DoAn.taiLieuPhanBien?.length < 0)
    return res
      .status(404)
      .json({ success: false, data: { message: 'Không tìm thấy tài liệu' } });

  DoAn.taiLieuPhanBien = DoAn.taiLieuPhanBien.filter(
    (tl) => tl._id.toString() !== req.params.taiLieuId,
  );
  // Save the document
  await DoAn.save();

  res.status(200).json({ success: true, data: DoAn });
});
//Tạo tài liệu cho giảng viên hội đồng đồ án

exports.taiTaiLieuHoiDong = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ status: false, data: { message: err.message } });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, data: { message: 'No file uploaded' } });
    }

    // Update the doAn document
    const DoAn = await doAn.findById(req.params.id);

    if (!DoAn) {
      return res
        .status(404)
        .json({ success: false, data: { message: 'Không tìm thấy đồ án' } });
    }

    // Add the file info to the taiLieu array
    DoAn.taiLieuHoiDong?.push({
      tenTaiLieu: req.file.originalname,
      loaiTaiLieu: req.file.mimetype,
      dungLuong: `${(req.file.size / 1024).toFixed(2)} KB`,
      duongDan: req.file.path,
    });

    // Save the document
    await DoAn.save();

    res.status(200).json({ success: true, data: DoAn });
  });
});
// Xoa tai lieu hội đồng
exports.xoaTaiLieuHoiDong = catchAsync(async (req, res, next) => {
  // Update the doAn document
  const DoAn = await doAn.findById(req.params.id);

  if (!DoAn) {
    return res
      .status(404)
      .json({ success: false, data: { message: 'Không tìm thấy đồ án' } });
  }
  if (DoAn.taiLieuHoiDong?.length < 0)
    return res
      .status(404)
      .json({ success: false, data: { message: 'Không tìm thấy tài liệu' } });

  DoAn.taiLieuHoiDong = DoAn.taiLieuHoiDong.filter(
    (tl) => tl._id.toString() !== req.params.taiLieuId,
  );
  // Save the document
  await DoAn.save();

  res.status(200).json({ success: true, data: DoAn });
});
// lấy thông tin sinh viên theo đồ án
exports.getThongTinSinhVienTheoDoAn = catchAsync(async (req, res, next) => {
  const result = await doAn.aggregate([
    {
      $match: {
        _id: new Mongoose.Types.ObjectId(req.params.id),
      },
    },
    {
      // Join với bảng User để lấy thông tin sinhVien1
      $lookup: {
        from: 'users',
        localField: 'sinhVien1',
        foreignField: '_id',
        as: 'user1Info',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien1Info
      $unwind: '$user1Info',
    },
    {
      // Join với bảng User để lấy thông tin sinhVien2
      $lookup: {
        from: 'users',
        localField: 'sinhVien2',
        foreignField: '_id',
        as: 'user2Info',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien2Info
      $unwind: {
        path: '$user2Info',
        preserveNullAndEmptyArrays: true, // Giữ lại các đối tượng mà không có sinhVien2
      },
    },
    {
      // Join với bảng User để lấy thông tin sinhVien1
      $lookup: {
        from: 'sinhviens',
        localField: 'user1Info._id',
        foreignField: 'userId',
        as: 'sinhVien1Info',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien1Info
      $unwind: '$sinhVien1Info',
    },
    {
      // Join với bảng User để lấy thông tin sinhVien2
      $lookup: {
        from: 'sinhvien2',
        localField: 'user2Info._id',
        foreignField: 'userId',
        as: 'sinhVien2Info',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien2Info
      $unwind: {
        path: '$sinhVien2Info',
        preserveNullAndEmptyArrays: true, // Giữ lại các đối tượng mà không có sinhVien2
      },
    },
    {
      // Calculate the completion percentage
      $project: {
        sinhVien1Info: {
          sinhVienId: '$sinhVien1Info._id',
          diem: '$sinhVien1Info.diem',
        },
        sinhVien1: {
          maSo: '$user1Info.maSo',
          hoTen: '$user1Info.hoTen',
        },
        sinhVien2: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              maSo: '$user2Info.maSo',
              hoTen: '$user2Info.hoTen',
            },
            else: '$$REMOVE',
          },
        },
        sinhVien2Info: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              sinhVienId: '$sinhVien2Info._id',
              diem: '$sinhVien2Info.diem',
            },
            else: '$$REMOVE', // Exclude from the result if it's null
          },
        },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      sinhVien: [...result[0].sinhVien],
    },
  });
});
// lấy danh sách đồ án đạt cuối kỳ
exports.getDanhSachDoAnDatCuoiKy = catchAsync(async (req, res, next) => {
  const { hocKy, namHoc } = await getHocKyQuery(req);
  console.log({ hocKy, namHoc, trangThai: { $in: [2, 7, 8] } });
  const doAnList = await doAn
    .find({ hocKy, namHoc, trangThai: { $in: [2, 7, 8] } })
    .populate({
      path: 'sinhVien1 sinhVien2 giangVien',
      select: 'maSo hoTen email lop',
    });

  res.status(200).json({
    status: 'success',
    data: {
      danhSachDoAn: doAnList,
    },
  });
});
// lấy danh sách đồ án không đạt cuối kỳ
exports.getDanhSachDoAnKhongDatCuoiKy = catchAsync(async (req, res, next) => {
  const { hocKy, namHoc } = await getHocKyQuery(req);

  const doAnList = await doAn.find({ hocKy, namHoc, trangThai: 5 }).populate({
    path: 'sinhVien1 sinhVien2 giangVien',
    select: 'maSo hoTen email lop',
  });

  res.status(200).json({
    status: 'success',
    data: {
      danhSachDoAn: doAnList,
    },
  });
});
exports.themNhieuGiangVienPhanBien = catchAsync(async (req, res, next) => {
  const bulkOperations = req.body.map((doAnData) => {
    const { _id, giangVienPhanBien1, giangVienPhanBien2 } = doAnData;

    return {
      updateOne: {
        filter: { _id: new Mongoose.Types.ObjectId(_id) }, // Match document by _id
        update: {
          $set: {
            giangVienPhanBien1: new Mongoose.Types.ObjectId(giangVienPhanBien1),
            giangVienPhanBien2: new Mongoose.Types.ObjectId(giangVienPhanBien2),
          },
        },
      },
    };
  });
  const result = await doAn.bulkWrite(bulkOperations);

  res.status(200).json({ status: 'success', data: { result } });
});

exports.themGiangVienPhanBien = catchAsync(async (req, res, next) => {
  const { idGiangVien1, idGiangVien2 } = req.body;
  let thongTinGiangVien = await User.find({
    _id: [idGiangVien1, idGiangVien2],
  });

  thongTinGiangVien = thongTinGiangVien.map((gv) =>
    fieldObj(gv._doc, 'maSo', 'hoTen', 'soDienThoai', 'email'),
  );
  const result = await doAn.findByIdAndUpdate(req.params.id, {
    giangVienPhanBien1: thongTinGiangVien[0],
    giangVienPhanBien2: thongTinGiangVien[1],
  });
  res.status(200).json({
    status: 'success',
    data: {
      result,
    },
  });
});
// lấy danh sách đồ án đạt phản biện
exports.getDanhSachDoAnDatPhanBien = catchAsync(async (req, res, next) => {
  const { hocKy, namHoc } = await getHocKyQuery(req);
  const doAnList = await doAn.aggregate([
    {
      // Liên kết với bảng sinh viên (sinhVien1 và sinhVien2)
      $lookup: {
        from: 'sinhviens',
        localField: 'sinhVien1',
        foreignField: 'userId',
        as: 'sinhVien1Info',
        pipeline: [
          {
            $project: { _id: 1, diem: 1, doAn: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'sinhviens',
        localField: 'sinhVien2',
        foreignField: 'userId',
        as: 'sinhVien2Info',
        pipeline: [
          {
            $project: { _id: 1, diem: 1, doAn: 1 },
          },
        ],
      },
    },
    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$sinhVien1Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$sinhVien2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien1',
        foreignField: '_id',
        as: 'user1Info',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien2',
        foreignField: '_id',
        as: 'user2Info',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'giangVien',
        foreignField: '_id',
        as: 'giangVienInfo',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'giangVienPhanBien1',
        foreignField: '_id',
        as: 'giangVienPhanBien1Info',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'giangVienPhanBien2',
        foreignField: '_id',
        as: 'giangVienPhanBien2Info',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },

    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$user1Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$user2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$giangVienInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$giangVienPhanBien1Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$giangVienPhanBien2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      // Lọc chỉ lấy những đồ án mà sinh viên 1 và sinh viên 2 đều có điểm phản biện 1 và 2
      $match: {
        hocKy,
        namHoc,
        $or: [
          {
            'sinhVien1Info.diem.diemPhanBien.diemPhanBien1.diemTong': {
              $ne: null,
            },
            'sinhVien1Info.diem.diemPhanBien.diemPhanBien2.diemTong': {
              $ne: null,
            },
          },
          {
            'sinhVien2Info.diem.diemPhanBien.diemPhanBien1.diemTong': {
              $ne: null,
            },
            'sinhVien2Info.diem.diemPhanBien.diemPhanBien2.diemTong': {
              $ne: null,
            },
          },
        ],
      },
    },
    {
      // Tính điểm trung bình của cả 2 sinh viên (nếu có sinhVien2)
      $addFields: {
        diemTrungBinhSinhVien1: {
          $avg: [
            '$sinhVien1Info.diem.diemPhanBien.diemPhanBien1.diemTong',
            '$sinhVien1Info.diem.diemPhanBien.diemPhanBien2.diemTong',
          ],
        },
        diemTrungBinhSinhVien2: {
          $cond: {
            if: { $ne: ['$sinhVien2Info', null] }, // Kiểm tra sinhVien2Info có tồn tại hay không
            then: {
              $avg: [
                '$sinhVien2Info.diem.diemPhanBien.diemPhanBien1.diemTong',
                '$sinhVien2Info.diem.diemPhanBien.diemPhanBien2.diemTong',
              ],
            },
            else: '$$REMOVE', // Nếu không có sinhVien2, để giá trị null
          },
        },
        diemTrungBinhTong: {
          $cond: {
            if: { $ne: ['$sinhVien2Info', null] }, // Nếu có sinhVien2
            then: {
              $avg: [
                {
                  $avg: [
                    '$sinhVien1Info.diem.diemPhanBien.diemPhanBien1.diemTong',
                    '$sinhVien1Info.diem.diemPhanBien.diemPhanBien2.diemTong',
                  ],
                },
                {
                  $avg: [
                    '$sinhVien2Info.diem.diemPhanBien.diemPhanBien1.diemTong',
                    '$sinhVien2Info.diem.diemPhanBien.diemPhanBien2.diemTong',
                  ],
                },
              ],
            },
            else: {
              $avg: [
                '$sinhVien1Info.diem.diemPhanBien.diemPhanBien1.diemTong',
                '$sinhVien1Info.diem.diemPhanBien.diemPhanBien2.diemTong',
              ], // Chỉ tính cho sinhVien1 nếu không có sinhVien2
            },
          },
        },
      },
    },
    {
      // Lọc những đồ án có điểm trung bình >= 5
      $match: {
        diemTrungBinhTong: { $gte: 3 },
      },
    },
    {
      // Sắp xếp theo điểm trung bình tổng (diemTrungBinhTong)
      $sort: {
        diemTrungBinhTong: -1, // Sắp xếp theo thứ tự giảm dần
      },
    },
    {
      $project: {
        _id: 1,
        tenDoAn: 1,
        maDoAn: 1,
        giangVienHoiDong: 1,
        giangVienInfo: 1,
        giangVienPhanBien1Info: 1,
        giangVienPhanBien2Info: 1,
        diemTrungBinhTong: 1,
        sinhVien1Info: {
          sinhVienId: '$sinhVien1Info._id',
          diem: '$sinhVien1Info.diem',
        },
        sinhVien1: {
          maSo: '$user1Info.maSo',
          hoTen: '$user1Info.hoTen',
        },
        sinhVien2: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              maSo: '$user2Info.maSo',
              hoTen: '$user2Info.hoTen',
            },
            else: '$$REMOVE',
          },
        },
        sinhVien2Info: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              sinhVienId: '$sinhVien2Info._id',
              diem: '$sinhVien2Info.diem',
            },
            else: '$$REMOVE', // Exclude from the result if it's null
          },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      DanhSachDoAn: doAnList,
    },
  });
});
// lấy danh sách không đạt phản biện
exports.getDanhSachDoAnKhongDatPhanBien = catchAsync(async (req, res, next) => {
  const { hocKy, namHoc } = await getHocKyQuery(req);
  const doAnList = await doAn.aggregate([
    {
      // Liên kết với bảng sinh viên (sinhVien1 và sinhVien2)
      $lookup: {
        from: 'sinhviens',
        localField: 'sinhVien1',
        foreignField: 'userId',
        as: 'sinhVien1Info',
        pipeline: [
          {
            $project: { _id: 1, diem: 1, doAn: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'sinhviens',
        localField: 'sinhVien2',
        foreignField: 'userId',
        as: 'sinhVien2Info',
        pipeline: [
          {
            $project: { _id: 1, diem: 1, doAn: 1 },
          },
        ],
      },
    },
    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$sinhVien1Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$sinhVien2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien1',
        foreignField: '_id',
        as: 'user1Info',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien2',
        foreignField: '_id',
        as: 'user2Info',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'giangVien',
        foreignField: '_id',
        as: 'giangVienInfo',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'giangVienPhanBien1',
        foreignField: '_id',
        as: 'giangVienPhanBien1Info',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: 'giangVienPhanBien2',
        foreignField: '_id',
        as: 'giangVienPhanBien2Info',
        pipeline: [
          {
            $project: { _id: 0, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },

    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$user1Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $unwind: {
        path: '$user2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$giangVienInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$giangVienPhanBien1Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      // Giải nén thông tin sinh viên
      $unwind: {
        path: '$giangVienPhanBien2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      // Lọc chỉ lấy những đồ án mà sinh viên 1 và sinh viên 2 đều có điểm phản biện 1 và 2
      $match: {
        hocKy,
        namHoc,
        $or: [
          {
            'sinhVien1Info.diem.diemPhanBien.diemPhanBien1.diemTong': {
              $ne: null,
            },
            'sinhVien1Info.diem.diemPhanBien.diemPhanBien2.diemTong': {
              $ne: null,
            },
          },
          {
            'sinhVien2Info.diem.diemPhanBien.diemPhanBien1.diemTong': {
              $ne: null,
            },
            'sinhVien2Info.diem.diemPhanBien.diemPhanBien2.diemTong': {
              $ne: null,
            },
          },
        ],
      },
    },
    {
      // Tính điểm trung bình của cả 2 sinh viên (nếu có sinhVien2)
      $addFields: {
        diemTrungBinhSinhVien1: {
          $avg: [
            '$sinhVien1Info.diem.diemPhanBien.diemPhanBien1.diemTong',
            '$sinhVien1Info.diem.diemPhanBien.diemPhanBien2.diemTong',
          ],
        },
        diemTrungBinhSinhVien2: {
          $cond: {
            if: { $ne: ['$sinhVien2Info', null] }, // Kiểm tra sinhVien2Info có tồn tại hay không
            then: {
              $avg: [
                '$sinhVien2Info.diem.diemPhanBien.diemPhanBien1.diemTong',
                '$sinhVien2Info.diem.diemPhanBien.diemPhanBien2.diemTong',
              ],
            },
            else: null, // Nếu không có sinhVien2, để giá trị null
          },
        },
        diemTrungBinhTong: {
          $cond: {
            if: { $ne: ['$sinhVien2Info', null] }, // Nếu có sinhVien2
            then: {
              $avg: [
                {
                  $avg: [
                    '$sinhVien1Info.diem.diemPhanBien.diemPhanBien1.diemTong',
                    '$sinhVien1Info.diem.diemPhanBien.diemPhanBien2.diemTong',
                  ],
                },
                {
                  $avg: [
                    '$sinhVien2Info.diem.diemPhanBien.diemPhanBien1.diemTong',
                    '$sinhVien2Info.diem.diemPhanBien.diemPhanBien2.diemTong',
                  ],
                },
              ],
            },
            else: {
              $avg: [
                '$sinhVien1Info.diem.diemPhanBien.diemPhanBien1.diemTong',
                '$sinhVien1Info.diem.diemPhanBien.diemPhanBien2.diemTong',
              ], // Chỉ tính cho sinhVien1 nếu không có sinhVien2
            },
          },
        },
      },
    },
    {
      // Lọc những đồ án có điểm trung bình >= 5
      $match: {
        diemTrungBinhTong: { $lt: 3 },
      },
    },
    {
      // Sắp xếp theo điểm trung bình tổng (diemTrungBinhTong)
      $sort: {
        diemTrungBinhTong: -1, // Sắp xếp theo thứ tự giảm dần
      },
    },
    {
      $project: {
        _id: 1,
        tenDoAn: 1,
        maDoAn: 1,
        giangVienInfo: 1,
        giangVienPhanBien1Info: 1,
        giangVienPhanBien2Info: 1,
        diemTrungBinhTong: 1,
        sinhVien1Info: {
          sinhVienId: '$sinhVien1Info._id',
          diem: '$sinhVien1Info.diem',
        },
        sinhVien1: {
          maSo: '$user1Info.maSo',
          hoTen: '$user1Info.hoTen',
        },
        sinhVien2: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              maSo: '$user2Info.maSo',
              hoTen: '$user2Info.hoTen',
            },
            else: '$$REMOVE',
          },
        },
        sinhVien2Info: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              sinhVienId: '$sinhVien2Info._id',
              diem: '$sinhVien2Info.diem',
            },
            else: '$$REMOVE', // Exclude from the result if it's null
          },
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      DanhSachDoAn: doAnList,
    },
  });
});
exports.themNhieuGiangVienHoiDong = catchAsync(async (req, res, next) => {
  const bulkOperations = req.body.map((doAnData) => {
    const { _id, loai, giangVien } = doAnData;

    return {
      updateOne: {
        filter: { _id: new Mongoose.Types.ObjectId(_id) }, // Match document by _id
        update: {
          $set: {
            giangVienHoiDong: {
              loai: loai,
              giangVien,
            },
          },
        },
      },
    };
  });
  const result = await doAn.bulkWrite(bulkOperations);

  res.status(200).json({ status: 'success', data: { result } });
});
//lấy danh sách đồ án cần phản biện
exports.getDanhSachDoAnHoiDong = catchAsync(async (req, res, next) => {
  const { namHoc, hocKy } = await getHocKyQuery(req);
  const results = await doAn.aggregate([
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien1',
        foreignField: '_id',
        as: 'user1Info',
      },
    },
    {
      $unwind: '$user1Info',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'sinhVien2',
        foreignField: '_id',
        as: 'user2Info',
      },
    },
    {
      $unwind: {
        path: '$user2Info',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'sinhviens',
        localField: 'user1Info._id',
        foreignField: 'userId',
        as: 'sinhVien1Info',
      },
    },
    {
      $unwind: '$sinhVien1Info',
    },
    {
      $lookup: {
        from: 'sinhviens',
        localField: 'user2Info._id',
        foreignField: 'userId',
        as: 'sinhVien2Info',
      },
    },
    {
      $unwind: {
        path: '$sinhVien2Info',
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $match: {
        namHoc,
        hocKy,
        'giangVienHoiDong.giangVien': {
          $elemMatch: { userId: req.user._id },
        },
      },
    },
    {
      $project: {
        _id: 1,
        maDoAn: 1,
        tenDoAn: 1,
        taiLieuHoiDong: 1,
        sinhVien1Info: {
          sinhVienId: '$sinhVien1Info._id',
          diem: '$sinhVien1Info.diem',
        },
        sinhVien1: {
          maSo: '$user1Info.maSo',
          hoTen: '$user1Info.hoTen',
        },
        sinhVien2: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            },
            then: {
              maSo: '$user2Info.maSo',
              hoTen: '$user2Info.hoTen',
            },
            else: '$$REMOVE',
          },
        },
        sinhVien2Info: {
          $cond: {
            if: {
              $or: [{ $eq: ['$user2Info', null] }, { $eq: ['$user2Info', {}] }],
            }, // Check if sinhVien2Info is not null
            then: {
              sinhVienId: '$sinhVien2Info._id',
              diem: '$sinhVien2Info.diem',
            },
            else: '$$REMOVE',
          },
        },
        stt: {
          $arrayElemAt: [
            '$giangVienHoiDong.giangVien.stt',
            {
              $indexOfArray: [
                '$giangVienHoiDong.giangVien.userId',
                req.user._id,
              ],
            },
          ],
        },
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      results,
    },
  });
});
