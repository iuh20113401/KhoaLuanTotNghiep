const tieuChi = require('../model/tieuChiModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');

exports.taoTieuChi = Factory.createOne(tieuChi);
exports.getAllTieuChi = Factory.getAll(tieuChi);
exports.getTieuChi = Factory.getOne(tieuChi);
exports.deleteTieuChi = Factory.deleteOne(tieuChi);
exports.updateTieuChi = Factory.updateOne(tieuChi);

exports.getTieuChiDoAn = catchAsync(async (req, res, next) => {
  const query = tieuChi.findOne({
    ten: 'Tiêu chí đồ án',
  });
  const result = await query;
  res.status(200).json({ status: 'success', data: { result } });
});
exports.getTieuChiHuongDan = catchAsync(async (req, res, next) => {
  const query = tieuChi.findOne({
    ten: 'Tiêu chí đồ án',
  });
  let result = await query;
  result = result.LO.filter((lo) => lo.isHuongDan === true);
  res.status(200).json({ status: 'success', data: { result } });
});
exports.getTieuChiPhanBien = catchAsync(async (req, res, next) => {
  const query = tieuChi.findOne({
    ten: 'Tiêu chí đồ án',
  });
  let result = await query;
  result = result.LO.filter((lo) => lo.isPhanBien === true);

  res.status(200).json({ status: 'success', data: { result } });
});
exports.getTieuChiThucTapChoDoanhNghiep = catchAsync(async (req, res, next) => {
  const query = tieuChi.findOne({
    ten: 'Tiêu chí danh cho doanh nghiệp',
  });
  const result = await query;
  res.status(200).json({ status: 'success', data: { result } });
});
exports.getTieuChiThucTapGiangVien = catchAsync(async (req, res, next) => {
  const query = tieuChi.findOne({
    ten: 'Tiêu chí danh cho giảng viên giám sát thực tập',
  });
  const result = await query;
  res.status(200).json({ status: 'success', data: { result } });
});
