const deTai = require('../model/deTaiModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');

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
exports.taoDeTai = catchAsync(async (req, res) => {
  const newDeTai = await deTai.create({ ...req.body, giangVien: req.user });
  res.status(201).json({
    status: 'success',
    data: { deTai: newDeTai },
  });
});
exports.getAllDeTaiTheoGiangVien = catchAsync(async (req, res, next) => {
  const deTais = await deTai.find({ giangVien: req.user._id });
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
  const danhMuc = await deTai.find({ trangThai: 1 }).populate({
    path: 'giangVien',
    select: 'maSo hoTen email soDienThoai',
  });
  res.status(200).json({
    status: 'success',
    data: { danhMuc },
  });
});
exports.getDanhSachDeTaiChoDuyet = catchAsync(async (req, res, next) => {
  const danhMuc = await deTai.find({ trangThai: 0 }).populate({
    path: 'giangVien',
    select: 'maSo hoTen email soDienThoai',
  });
  res.status(200).json({
    status: 'success',
    data: { danhMuc },
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
  const result = await deTai.findByIdAndUpdate(req.params.id, { trangThai: 1 });
  res.status(200).json({
    status: 'success',
    data: { deTai: result },
  });
});
