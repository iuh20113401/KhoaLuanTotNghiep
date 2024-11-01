const ThongBao = require('../model/ThongBaoModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const Factory = require('./handlerFactory');
const { uploadHinhAnh } = require('./uploadController');

exports.getAllThongBao = catchAsync(async (req, res) => {
  const { loai } = req.query;

  let queryStr = { $in: null };
  queryStr.$in = loai.in;
  console.log(queryStr, queryStr.$in);

  queryStr = queryStr.$in.replace(/[[\]]/g, '').split(',').map(Number);

  console.log(queryStr);
  const data = await ThongBao.find({
    loai: queryStr,
    tieuDe: { $ne: 'Kế hoạch thực hiện' },
  });
  res.status(201).json({
    status: 'success',
    data: { data },
  });
});
exports.getThongBao = Factory.getOne(ThongBao);
exports.deleteThongBao = Factory.deleteOne(ThongBao);
exports.updateThongBao = Factory.updateOne(ThongBao);
exports.taoThongBao = catchAsync(async (req, res) => {
  const data = await ThongBao.create({ ...req.body, nguoiTao: req.user._id });
  res.status(201).json({
    status: 'success',
    data: { data },
  });
});

exports.themHoacCapNhatThongBao = catchAsync(async (req, res, next) => {
  const { noiDung, loai, hinhThuc } = req.body;
  const thongBaoTieuDe = 'Kế hoạch thực hiện';
  let thongBao = await ThongBao.findOne({ tieuDe: thongBaoTieuDe });

  let hinhAnh = noiDung;
  if (req.file) {
    hinhAnh = `/uploads/hinhanh/${req.file.filename}`; // Đường dẫn tới ảnh
  }

  if (!thongBao) {
    thongBao = await ThongBao.create({
      tieuDe: thongBaoTieuDe,
      noiDung: hinhAnh,
      loai,
      hinhThuc,
      nguoiTao: req.user._id,
    });
  } else {
    // Cập nhật thông báo
    thongBao.noiDung = hinhAnh || thongBao.noiDung;
    thongBao.loai = loai !== undefined ? loai : thongBao.loai;
    thongBao.hinhThuc = hinhThuc !== undefined ? hinhThuc : thongBao.hinhThuc;

    await thongBao.save();
  }
  return res.status(200).json({
    status: 'success',
    data: { thongBao },
  });
});
exports.getThongBaoKeHoach = catchAsync(async (req, res, next) => {
  const tieuDe = 'Kế hoạch thực hiện';

  // Tìm thông báo dựa trên tiêu đề
  const thongBao = await ThongBao.findOne({ tieuDe });

  if (!thongBao) {
    return next(new ApiError('Không tìm thấy thông báo với tiêu đề này', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { thongBao },
  });
});

exports.uploadHinhAnh = catchAsync(async (req, res, next) => {
  uploadHinhAnh(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err });
    }
    if (req.file === undefined) {
      return res.status(400).json({ message: 'No file selected' });
    }
    const imgPath = `/uploads/hinhanh/${req.file.filename}`;
    res.status(200).json({
      status: 'success',
      data: { message: 'File uploaded successfully', imgPath },
    });
  });
});
