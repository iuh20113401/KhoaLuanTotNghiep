const Factory = require('./handlerFactory');
const SinhVien = require('../model/sinhVien');
const user = require('../model/userModel');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const doAn = require('../model/doAnModel');
const caiDat = require('../model/CaiDatModel');

exports.getAllSinhVien = Factory.getAll(SinhVien);

exports.taoSinhVien = Factory.createOne(SinhVien);
exports.deleteSinhVien = Factory.deleteOne(SinhVien);
exports.updateSinhVien = Factory.updateOne(SinhVien);
exports.getSinhVien = catchAsync(async (req, res, next) => {
  const query = SinhVien.findOne({ userId: req.params.id });

  const result = await query.select('-__v');

  if (!result) {
    next(new ApiError('Invalid id', 404));
    return;
  }
  res.status(200).json({ status: 'success', data: { sinhVien: result } });
});
exports.updateDiemHuongDan = catchAsync(async (req, res, next) => {
  const updateFields = {};
  if (req.body.ketQua) updateFields['diem.ketQua'] = req.body.ketQua;
  if (req.body.diemHuongDan)
    updateFields['diem.diemHuongDan'] = req.body.diemHuongDan;
  if (req.body.diemPhanBien?.diemPhanBien1)
    updateFields['diem.diemPhanBien.diemPhanBien1'] =
      req.body.diemPhanBien.diemPhanBien1;
  if (req.body.diemPhanBien?.diemPhanBien2)
    updateFields['diem.diemPhanBien.diemPhanBien2'] =
      req.body.diemPhanBien.diemPhanBien2;
  if (req.body.diemHoiDong?.diemHoiDong1)
    updateFields['diem.diemHoiDong.diemHoiDong1'] =
      req.body.diemHoiDong?.diemHoiDong1;
  if (req.body.diemHoiDong?.diemHoiDong2)
    updateFields['diem.diemHoiDong.diemHoiDong2'] =
      req.body.diemHoiDong?.diemHoiDong2;
  if (req.body.diemHoiDong?.diemHoiDong3)
    updateFields['diem.diemHoiDong.diemHoiDong3'] =
      req.body.diemHoiDong?.diemHoiDong3;
  if (Object.keys(updateFields).length === 0) {
    return next(new ApiError('Không có trường nào để cập nhật.', 400));
  }

  const doc = await SinhVien.findByIdAndUpdate(
    req.params.id,
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!doc) {
    return next(new ApiError('Không có thông tin với mã số này.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
exports.updateDiemThucTap = catchAsync(async (req, res, next) => {
  const updateFields = {};

  if (req.body.diemThucTap.diemDoanhNghiep)
    updateFields['diem.diemThucTap.diemDoanhNghiep'] =
      req.body.diemThucTap.diemDoanhNghiep;
  if (req.body.diemThucTap.diemGiangVien)
    updateFields['diem.diemThucTap.diemGiangVien'] =
      req.body.diemThucTap.diemGiangVien;

  if (Object.keys(updateFields).length === 0) {
    return next(new ApiError('Không có trường nào để cập nhật.', 400));
  }

  const doc = await SinhVien.findByIdAndUpdate(
    req.params.id,
    {
      $set: updateFields,
    },
    {
      new: true,
      runValidators: true,
    },
  );

  if (!doc) {
    return next(new ApiError('Không có thông tin với mã số này.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      data: doc,
    },
  });
});
exports.getSinhVienDoAnTheoGiangVien = catchAsync(async (req, res, next) => {
  let { namHoc, hocKy } = req.query;
  if (!namHoc && !hocKy) {
    const caiDatInfo = await caiDat.find();
    [{ namHoc, hocKy }] = caiDatInfo;
  }
  const results = await SinhVien.aggregate([
    {
      $lookup: {
        from: 'doans',
        localField: 'doAn',
        foreignField: '_id',
        as: 'doAnInfo',
      },
    },
    {
      $unwind: '$doAnInfo',
    },
    {
      $lookup: {
        from: 'detais',
        localField: 'doAnInfo.deTai',
        foreignField: '_id',
        as: 'deTaiInfo',
      },
    },
    {
      $unwind: '$deTaiInfo',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'Info',
        pipeline: [
          {
            $project: { _id: 1, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $unwind: '$Info',
    },
    {
      $match: {
        'doAnInfo.giangVien': req.user._id,
        'doAnInfo.namHoc': namHoc,
        'doAnInfo.hocKy': hocKy,
      },
    },
    {
      $project: {
        _id: 0,
        'doAnInfo.maDoAn': 1,
        'doAnInfo.tenDoAn': 1,
        'deTaiInfo._id': 1,
        'deTaiInfo.tenDeTai': 1,
        diemDanh: 1,
        Info: 1,
        diem: 1,
      },
    },
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      danhSachSinhVien: results,
    },
  });
});
exports.getSinhVienThucTapTheoGiangVien = catchAsync(async (req, res, next) => {
  const results = await SinhVien.aggregate([
    {
      $lookup: {
        from: 'thuctaps',
        localField: 'thucTap',
        foreignField: '_id',
        as: 'thucTapInfo',
      },
    },
    {
      $unwind: '$thucTapInfo',
    },
    {
      $lookup: {
        from: 'users',
        localField: 'userId',
        foreignField: '_id',
        as: 'Info',
        pipeline: [
          {
            $project: { _id: 1, hoTen: 1, email: 1, soDienThoai: 1, maSo: 1 },
          },
        ],
      },
    },
    {
      $unwind: '$Info',
    },
    {
      $match: {
        'thucTapInfo.giangVien': req.user._id,
      },
    },
    {
      $project: {
        _id: 0,
        thucTapInfo: 1,
        diemDanh: 1,
        Info: 1,
        diem: 1,
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
exports.getAllThongTinSinhVien = catchAsync(async (req, res, next) => {
  const results = await SinhVien.find()
    .populate({
      path: 'userId',
      select: 'maSo hoTen email soDienThoai',
    })
    .select('doAn thucTap pretest')
    .lean();
  const formattedResults = results.map((sinhVien) => {
    if (sinhVien.userId) {
      return {
        _id: sinhVien._id, // Original SinhVien _id
        _userId: sinhVien.userId._id, // Original SinhVien _id
        maSo: sinhVien.userId.maSo,
        ten: sinhVien.userId.hoTen,
        email: sinhVien.userId.email,
        soDienThoai: sinhVien.userId.soDienThoai,
        doAn: sinhVien.doAn,
        thucTap: sinhVien.thucTap,
        pretest: sinhVien.pretest,
      };
    }
    return {};
  });
  res.status(200).json({
    status: 'success',
    data: {
      danhSachSinhVien: formattedResults,
    },
  });
});

exports.guiLoiMoi = catchAsync(async (req, res, next) => {
  const nguoiNhan = await user.findOne({ maSo: req.body.maSo });
  const DoAn = await doAn
    .findOne({ sinhVien1: req.user._id })
    .populate({ path: 'giangVien' });
  if (!nguoiNhan)
    next(
      new ApiError('Không có sinh viên với mã số này! Vui lòng thử lại', 400),
    );
  const sinhVien = await SinhVien.findOneAndUpdate(
    { userId: nguoiNhan._id },
    {
      $push: {
        loiMoi: {
          nguoiGui: req.user._id,
          maSo: req.user.maSo,
          hoTen: req.user.hoTen,
          doAn: DoAn._id,
          tenDoAn: DoAn.tenDoAn,
          giangVien: DoAn.giangVien.hoTen,
          ...req.body,
        },
      },
    },
  );
  const sinhVien2 = await SinhVien.findOneAndUpdate(
    { userId: req.user._id },
    {
      $inc: { soLuongLoiMoi: 1 },
    },
  );
  res.status(200).json({
    status: 'success',
    data: {
      message: 'Gửi lời mời thành công',
    },
  });
});
