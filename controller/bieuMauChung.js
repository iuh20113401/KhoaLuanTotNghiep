const bieuMauChung = require('../model/bieuMauChung');
const catchAsync = require('../utils/catchAsync');
const { upload } = require('./uploadController');

exports.taiBieuMau = catchAsync(async (req, res, next) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ status: false, message: err });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: 'No file uploaded' });
    }
    const ten = req.file.originalname;
    const loaiTaiLieu = req.file.mimetype;
    const dungLuong = `${(req.file.size / 1024).toFixed(2)} KB`;
    const duongDan = req.file.path;
    // Update the doAn document
    const bieuMau = await bieuMauChung.create({
      ten,
      loaiTaiLieu,
      dungLuong,
      duongDan,
      nguoiTao: req.user._id,
      loai: req.body.loai,
    });

    res.status(200).json({ success: true, data: bieuMau });
  });
});
exports.getBieuMauDoAn = catchAsync(async (req, res, next) => {
  const danhSachBieuMau = await bieuMauChung.find({
    loai: 1,
    nguoiTao: req.params.giangVien,
  });
  res.status(200).json({ success: true, data: { danhSachBieuMau } });
});
exports.getBieuMauChung = catchAsync(async (req, res, next) => {
  const danhSachBieuMau = await bieuMauChung.find({
    loai: 0,
  });
  res.status(200).json({ success: true, data: { danhSachBieuMau } });
});
