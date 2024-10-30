const Mongoose = require('mongoose');
const ThucTap = require('../model/ThucTapModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');
const { upload } = require('./uploadController');
const caiDat = require('../model/CaiDatModel');

exports.getAllThucTap = catchAsync(async (req, res, next) => {
  let { namHoc, hocKy } = req.query;
  if (!namHoc && !hocKy) {
    const caiDatInfo = await caiDat.find();
    [{ namHoc, hocKy }] = caiDatInfo;
  }
  hocKy = parseInt(hocKy, 10);
  const results = await ThucTap.aggregate([
    {
      // Join với bảng User để lấy thông tin sinhVien1
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
        pipeline: [
          {
            $project: {
              _id: 1,
              hoTen: 1,
              email: 1,
              soDienThoai: 1,
              maSo: 1,
              lop: 1,
            },
          },
        ],
      },
    },
    {
      // Unwind để xử lý mảng sinhVien1Info
      $unwind: '$userInfo',
    },
    {
      // Join với bảng User để lấy thông tin sinhVien1
      $lookup: {
        from: 'sinhviens',
        localField: 'userInfo._id',
        foreignField: 'userId',
        as: 'sinhVienInfo',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien1Info
      $unwind: '$sinhVienInfo',
    },
    { $match: { namHoc, hocKy } },
    {
      $project: {
        _id: 1,
        'sinhVienInfo._id': 1,
        maDoAn: 1,
        tenDoAn: 1,
        'sinhVienInfo.diem.diemThucTap': 1,
        userInfo: 1,
        tenCongTy: 1,
        diaChiCongTy: 1,
        emailCongTy: 1,
        tenNguoiDaiDien: 1,
        tenNguoiGiamSat: 1,
        soDienThoaiNguoiGiamSat: 1,
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
exports.getThucTap = Factory.getOne(ThucTap, [
  {
    path: 'userId',
    select: 'maSo hoTen hinhAnh email soDienThoai',
  },
  {
    path: 'giangVien',
    select: 'maSo hoTen hinhAnh email soDienThoai',
  },
]);
exports.deleteThucTap = Factory.deleteOne(ThucTap);
exports.updateThucTap = Factory.updateOne(ThucTap);

exports.taoNoiDungThucTap = catchAsync(async (req, res) => {
  const data = await ThucTap.create({ ...req.body, userId: req.user._id });
  res.status(201).json({
    status: 'success',
    data: { data },
  });
});
exports.themComment = catchAsync(async (req, res, next) => {
  const result = await ThucTap.findByIdAndUpdate(req.params.id, {
    $push: { comment: req.body },
  });
  if (!result) {
    next(
      new ApiError(
        'Không tìm thầy hồ sơ thực tập này hoặc có lỗi trong quá trình thực thi',
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
    const thucTapInfo = await ThucTap.findById(req.params.id);

    if (!thucTapInfo) {
      return res.status(404).json({
        success: false,
        data: { message: 'Không tìm thấy hồ sơ thực tập' },
      });
    }

    // Add the file info to the taiLieu array
    thucTapInfo.taiLieu.push({
      tenTaiLieu: req.file.originalname,
      loaiTaiLieu: req.file.mimetype,
      dungLuong: `${(req.file.size / 1024).toFixed(2)} KB`,
      duongDan: req.file.path,
    });

    // Save the document
    await thucTapInfo.save();

    res.status(200).json({ success: true, data: { thucTapInfo } });
  });
});
exports.getDanhSachThucTapTheoGiangVien = catchAsync(async (req, res, next) => {
  let { namHoc, hocKy } = req.query;
  if (!namHoc && !hocKy) {
    const caiDatInfo = await caiDat.find();
    [{ namHoc, hocKy }] = caiDatInfo;
  }
  hocKy = parseInt(hocKy, 10);
  const result = await ThucTap.aggregate([
    {
      // Join với bảng User để lấy thông tin sinhVien1
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'userInfo',
        pipeline: [
          {
            $project: {
              _id: 1,
              hoTen: 1,
              email: 1,
              soDienThoai: 1,
              maSo: 1,
              lop: 1,
            },
          },
        ],
      },
    },
    {
      // Unwind để xử lý mảng sinhVien1Info
      $unwind: '$userInfo',
    },
    {
      // Join với bảng User để lấy thông tin sinhVien1
      $lookup: {
        from: 'sinhviens',
        localField: 'userInfo._id',
        foreignField: 'userId',
        as: 'sinhVienInfo',
      },
    },
    {
      // Unwind để xử lý mảng sinhVien1Info
      $unwind: '$sinhVienInfo',
    },
    {
      // Lọc các kết quả dựa trên ID giảng viên
      $match: {
        giangVien: req.user._id,
        namHoc,
        hocKy,
      },
    },

    {
      $project: {
        _id: 1,
        'sinhVienInfo._id': 1,
        maDoAn: 1,
        tenDoAn: 1,
        'sinhVienInfo.diem.diemThucTap': 1,
        userInfo: 1,
        tenCongTy: 1,
        diaChiCongTy: 1,
        emailCongTy: 1,
        tenNguoiDaiDien: 1,
        tenNguoiGiamSat: 1,
        soDienThoaiNguoiGiamSat: 1,
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

exports.phanCongGiangVienGiamSat = catchAsync(async (req, res, next) => {
  const bulkOperations = req.body.map((thucTapData) => {
    const { _id, giangVien } = thucTapData;

    return {
      updateOne: {
        filter: { _id: new Mongoose.Types.ObjectId(_id) }, // Match document by _id
        update: {
          $set: {
            giangVien: new Mongoose.Types.ObjectId(giangVien),
          },
        },
      },
    };
  });
  const result = await ThucTap.bulkWrite(bulkOperations);

  res.status(200).json({ status: 'success', data: { result } });
});
