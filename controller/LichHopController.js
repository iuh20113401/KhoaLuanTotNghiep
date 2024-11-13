const LichHop = require('../model/LichHop');
const SinhVien = require('../model/sinhVien');
const DoAn = require('../model/doAnModel');
const ThucTap = require('../model/ThucTapModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');

exports.taoLichHop = Factory.createOne(LichHop);
exports.getALlLichHop = Factory.getAll(LichHop);
exports.getLichHop = Factory.getOne(LichHop);
exports.deleteLichHop = Factory.deleteOne(LichHop);
exports.updateLichHop = Factory.updateOne(LichHop);

exports.getLichHopThuocGiangVien = catchAsync(async (req, res, next) => {
  const danhSachLichHop = await LichHop.find({
    giangVien: req.params.id,
  });

  res.status(200).json({
    status: 'success',
    data: { danhSachLichHop },
  });
});

exports.getLichHopChoSinhVien = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const sinhVien = await SinhVien.findOne({ userId: id });

  if (!sinhVien) {
    next(new ApiError('Không thể tìm thấy mã người dùng này', 400));
  }
  const { doAn, thucTap } = sinhVien;

  const doAnDetails = await DoAn.findById(doAn).populate('giangVien');

  const thucTapDetails = await ThucTap.findById(thucTap).populate('giangVien');
  const lichHop = await LichHop.find({
    giangVien: {
      $in: [doAnDetails?.giangVien._id, thucTapDetails?.giangVien._id],
    },
  }).populate('giangVien');

  res.status(200).json({
    status: 'success',
    data: { danhSachLichHop: lichHop },
  });
});
