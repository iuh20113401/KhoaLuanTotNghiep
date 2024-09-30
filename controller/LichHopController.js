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
    giangVien: req.params._id,
  });

  res.status(200).json({
    status: 'success',
    data: { danhSachLichHop },
  });
});

exports.getLichHopChoSinhVien = catchAsync(async (req, res, next) => {
  const { userId } = req.params;
  const sinhVien = await SinhVien.findOne({ userId });

  if (!sinhVien) {
    next(new ApiError('Không thể tìm thấy mã người dùng này', 400));
  }

  // Lấy đồ án và thực tập
  const { doAn, thucTap } = sinhVien;

  // Lấy giảng viên hướng dẫn từ đồ án
  const doAnDetails = await DoAn.findById(doAn).populate('giangVien');

  // Lấy giảng viên hướng dẫn từ thực tập
  const thucTapDetails = await ThucTap.findById(thucTap).populate('giangVien');

  // Lấy lịch họp của cả giảng viên đồ án và thực tập
  const lichHop = await LichHop.find({
    giangVien: {
      $in: [doAnDetails.giangVien._id, thucTapDetails.giangVien._id],
    },
  }).populate({ path: 'giangVien' });

  return lichHop;
});
