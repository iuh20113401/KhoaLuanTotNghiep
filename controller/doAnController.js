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

exports.updateDoAn = Factory.updateOne(doAn);
exports.getAllDoAn = Factory.getAll(doAn, [
  {
    path: 'deTai',
    select: 'tenDeTai moTa kyNangCanCo ketQuaCanDat',
  },
  {
    path: 'giangVien',
    select: 'maSo hoTen hinhAnh soDienThoai email ngaySinh',
  },
  {
    path: 'sinhVien1',
    select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
  },
  {
    path: 'sinhVien2',
    select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
  },
  {
    path: 'giangVienPhanBien1',
    select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
  },
  {
    path: 'giangVienPhanBien2',
    select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
  },
  {
    path: 'sinhVien1Info',
    select: 'thucTap doAn diem -_id',
  },
  {
    path: 'sinhVien2Info',
    select: 'thucTap doAn diem -_id',
  },
]);

exports.getDoAn = Factory.getOne(doAn, [
  {
    path: 'deTai',
    select: 'tenDeTai moTa kyNangCanCo ketQuaCanDat',
  },
  {
    path: 'giangVien',
    select: 'maSo hoTen hinhAnh soDienThoai email ngaySinh',
  },
  {
    path: 'sinhVien1',
    select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
  },
  {
    path: 'sinhVien2',
    select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
  },
  {
    path: 'giangVienPhanBien1',
    select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
  },
  {
    path: 'giangVienPhanBien2',
    select: 'maSo hinhAnh hoTen soDienThoai email ngaySinh',
  },
]);
exports.deleteDoAn = Factory.deleteOne(doAn);

exports.taoDoAn = catchAsync(async (req, res, next) => {
  let caiDatInfo = await caiDat.find();
  caiDatInfo = caiDatInfo[0];
  console.log(caiDatInfo);
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

exports.getDanhSachDoAnTheoGiangVien = catchAsync(async (req, res, next) => {
  let { namHoc, hocKy } = req.query;
  if (!namHoc && !hocKy) {
    const caiDatInfo = await caiDat.find();
    [{ namHoc, hocKy }] = caiDatInfo;
  }
  hocKy = parseInt(hocKy, 10);
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
            if: { $ne: ['$user2Info', null] }, // Check if sinhVien2Info is not null
            then: {
              maSo: '$user2Info.maSo',
              hoTen: '$user2Info.hoTen',
            },
            else: '$$REMOVE',
          },
        },
        sinhVien2Info: {
          $cond: {
            if: { $ne: ['$user2Info', null] }, // Check if sinhVien2Info is not null
            then: {
              sinhVienId: '$sinhVien2Info._id',
              diem: '$sinhVien2Info.diem',
            },
            else: '$$REMOVE', // Exclude from the result if it's null
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

exports.getDanhSachDoAnPhanBien = catchAsync(async (req, res, next) => {
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
      },
    },
    {
      $project: {
        _id: 1,
        maDoAn: 1,
        tenDoAn: 1,
        sinhVien: [
          {
            maSo: '$user1Info.maSo',
            hoTen: '$user1Info.hoTen',
            sinhVienId: '$sinhVien1Info._id',
            diem: '$sinhVien1Info.diem',
          },
          {
            $cond: {
              if: { $ne: ['$user2Info', null] }, // Check if sinhVien2Info is not null
              then: {
                maSo: '$user2Info.maSo',
                hoTen: '$user2Info.hoTen',
                sinhVienId: '$sinhVien2Info._id',
                diem: '$sinhVien2Info.diem',
              },
              else: '$$REMOVE', // Exclude from the result if it's null
            },
          },
        ],
        giangVienPhanBien: {
          $cond: {
            if: { $eq: ['$giangVienPhanBien1', req.user._id] },
            then: '1',
            else: {
              $cond: {
                if: { $eq: ['$giangVienPhanBien2', req.user._id] },
                then: '2',
                else: null,
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
        sinhVien: [
          {
            maSo: '$user1Info.maSo',
            hoTen: '$user1Info.hoTen',
            sinhVienInfo: '$sinhVien1Info',
          },
          {
            $cond: {
              if: { $ne: ['$user2Info', null] },
              then: {
                maSo: '$user2Info.maSo',
                hoTen: '$user2Info.hoTen',
                sinhVienInfo: '$sinhVien2Info',
              },
              else: null,
            },
          },
        ],
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
exports.getDanhSachDoAnDat = catchAsync(async (req, res, next) => {
  const doAnList = await doAn.find({ trangThai: { $in: [2, 7] } }).populate({
    path: 'sinhVien1 sinhVien2 giangVien',
    select: 'maSo hoTen email lop',
  });

  res.status(200).json({
    status: 'success',
    data: {
      doAn: doAnList,
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
exports.getDanhSachDoAnDatPhanBien = catchAsync(async (req, res, next) => {
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
        diemTrungBinhTong: { $gte: 5 },
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
        sinhVien: [
          {
            maSo: '$user1Info.maSo',
            hoTen: '$user1Info.hoTen',
            sinhVienId: '$sinhVien1Info._id',
            diem: '$sinhVien1Info.diem',
          },
          {
            $cond: {
              if: { $ne: ['$user2Info', null] }, // Kiểm tra sinhVien2Info có null không
              then: {
                maSo: '$user2Info.maSo',
                hoTen: '$user2Info.hoTen',
                sinhVienId: '$sinhVien2Info._id',
                diem: '$sinhVien2Info.diem',
              },
              else: '$$REMOVE', // Bỏ qua nếu nó là null
            },
          },
        ],
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
exports.getDanhSachDoAnHoiDong = catchAsync(async (req, res, next) => {
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
        sinhVien: [
          {
            maSo: '$user1Info.maSo',
            hoTen: '$user1Info.hoTen',
            sinhVienId: '$sinhVien1Info._id',
            diem: '$sinhVien1Info.diem',
          },
          {
            $cond: {
              if: { $ne: ['$user2Info', null] },
              then: {
                maSo: '$user2Info.maSo',
                hoTen: '$user2Info.hoTen',
                sinhVienId: '$sinhVien2Info._id',
                diem: '$sinhVien2Info.diem',
              },
              else: '$$REMOVE',
            },
          },
        ],
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
      result,
    },
  });
});
