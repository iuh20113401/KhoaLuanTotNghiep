const mongoose = require('mongoose');
const deTai = require('../model/deTaiModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');
const caiDat = require('../model/CaiDatModel');
const doAn = require('../model/doAnModel');

exports.getAllDeTai = Factory.getAll(deTai);
exports.getDeTai = Factory.getOne(deTai, {
  path: 'giangVien',
  select: 'maSo hoTen email soDienThoai',
});
exports.updateDeTai = Factory.updateOne(deTai);
exports.xoaTrangThai = catchAsync(async (req, res, next) => {
  const excludeFields = ['trangThai'];
  excludeFields.forEach((el) => delete req.body[el]);
  next();
});
exports.xoaDeTai = catchAsync(async (req, res, next) => {
  const result = await deTai.findByIdAndUpdate(req.params.id, { trangThai: 3 });
  res.status(200).json({
    status: 'success',
    data: { deTai: result },
  });
});
exports.taoDeTai = catchAsync(async (req, res) => {
  const newDeTai = await deTai.create({ ...req.body });
  res.status(201).json({
    status: 'success',
    data: { deTai: newDeTai },
  });
});
exports.getAllDeTaiTheoGiangVien = catchAsync(async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.user._id)) {
    return res.status(400).send('Invalid ID format');
  }
  const deTais = await deTai
    .find({
      giangVien: req.user._id,
      trangThai: { $in: [0, 1, 2, 3, 4] },
    })
    .populate('sinhVien');
  res.status(200).json({
    status: 'success',
    data: { DanhSachDeTai: deTais },
  });
});
exports.getDanhMucDeTai = catchAsync(async (req, res, next) => {
  const danhMuc = await deTai.distinct('danhMuc');
  res.status(200).json({
    status: 'success',
    data: { danhMuc },
  });
});
exports.getDanhSachDeTaiDaDuyet = catchAsync(async (req, res, next) => {
  const DanhSachDeTai = await deTai.find({ trangThai: 1 }).populate({
    path: 'giangVien',
    select: 'maSo hoTen email soDienThoai',
  });
  res.status(200).json({
    status: 'success',
    data: { DanhSachDeTai },
  });
});
exports.getDanhSachDeTaiChoDuyet = catchAsync(async (req, res, next) => {
  const DanhSachDeTai = await deTai.find({ trangThai: 0 }).populate({
    path: 'giangVien',
    select: 'maSo hoTen email soDienThoai',
  });
  res.status(200).json({
    status: 'success',
    data: { DanhSachDeTai },
  });
});
exports.getDanhSachDeTaiDanhKy = catchAsync(async (req, res, next) => {
  const DanhSachDeTai = await deTai
    .find({ trangThai: 1, soLuongDoAn: { $lt: 2 } })
    .populate({
      path: 'giangVien',
      select: 'maSo hoTen email soDienThoai',
    });
  res.status(200).json({
    status: 'success',
    data: { DanhSachDeTai },
  });
});
exports.duyetDeTai = catchAsync(async (req, res, next) => {
  // Fetch the deTai document by ID
  const result = await deTai.findById(req.params.id).populate('giangVien');
  if (!result) {
    return next(new AppError('No deTai found with that ID', 404));
  }

  // Update trangThai
  result.trangThai = 1;

  if (result.sinhVien) {
    // Fetch caiDat information
    const caiDatInfo = await caiDat.findOne();
    if (!caiDatInfo) {
      return next(new AppError('CaiDat information not found', 404));
    }

    // Prepare new doAn data
    const newDoAn = {
      maDoAn: Math.floor(100000 + Math.random() * 900000), // Use a robust method for unique IDs if needed
      tenDoAn: result.tenDeTai,
      deTai: result._id,
      giangVien: result.giangVien._id,
      namHoc: caiDatInfo.namHoc,
      hocKy: caiDatInfo.hocKy,
      sinhVien1: result.sinhVien._id,
    };

    // Update deTai and create doAn in parallel
    const [updatedDeTai, createdDoAn] = await Promise.all([
      result.save(), // Save the updated deTai
      doAn.create(newDoAn), // Create the doAn
    ]);

    return res.status(200).json({
      status: 'success',
      data: {
        deTai: updatedDeTai,
        doAn: createdDoAn,
      },
    });
  }

  // If no sinhVien, only update trangThai
  const updatedDeTai = await result.save();

  return res.status(200).json({
    status: 'success',
    data: { deTai: updatedDeTai },
  });
});
