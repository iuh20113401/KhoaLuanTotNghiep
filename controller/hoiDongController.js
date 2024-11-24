const hoiDong = require('../model/hoiDongModel');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const { getHocKyQuery } = require('../utils/getHocKyQuery');

exports.layDanhSachHoiDong = catchAsync(async (req, res, next) => {
  const { namHoc, hocKy } = await getHocKyQuery(req);
  const results = await hoiDong
    .find({ namHoc, hocKy })
    .populate({ path: 'giangVien', select: 'hoTen maSo ' });

  return res
    .status(200)
    .json({ status: 'success', data: { danhSachHoiDong: results } });
});
exports.taoHoiDong = catchAsync(async (req, res, next) => {
  const { namHoc, hocKy } = await getHocKyQuery(req);

  // Kiểm tra nếu thiếu `namHoc` hoặc `hocKy`
  if (!namHoc || !hocKy) {
    return next(new ApiError('Năm học hoặc học kỳ không hợp lệ.', 400));
  }

  // Tách các loại hội đồng từ `req.body`
  const hoiDongOral = req.body.filter((hd) => hd.loai === 1);
  const hoiDongPoster = req.body.filter((hd) => hd.loai === 2);

  // Mảng để lưu các hội đồng
  const hoiDongsToInsert = [];

  // Xử lý hội đồng Oral (loại 1)
  hoiDongOral.forEach((hd) => {
    if (hd.danhSachHoiDong && hd.danhSachHoiDong.length > 0) {
      hd.danhSachHoiDong.forEach((thanhVien, stt) => {
        hoiDongsToInsert.push({
          stt, // Sử dụng id từ body hoặc mặc định là 0
          giangVien: thanhVien.chuTich, // Chủ tịch
          vaiTro: 1, // 1 = Chủ tịch
          hocKy,
          namHoc,
          loai: 1, // Hội đồng Oral
        });
        hoiDongsToInsert.push({
          stt,
          giangVien: thanhVien.thuKy, // Thư ký
          vaiTro: 2, // 2 = Thư ký
          hocKy,
          namHoc,
          loai: 1,
        });
        hoiDongsToInsert.push({
          stt,
          giangVien: thanhVien.uyVien, // Ủy viên
          vaiTro: 3, // 3 = Ủy viên
          hocKy,
          namHoc,
          loai: 1,
        });
      });
    }
  });

  // Xử lý hội đồng Poster (loại 2)
  hoiDongPoster.forEach((hd) => {
    if (hd.danhSachHoiDong && hd.danhSachHoiDong.length > 0) {
      hd.danhSachHoiDong.forEach((thanhVien, stt) => {
        hoiDongsToInsert.push({
          stt, // Sử dụng id từ body hoặc mặc định là 0
          giangVien: thanhVien.gv1, // Giáo viên 1
          vaiTro: 1, // 4 = Giáo viên phản biện 1
          hocKy,
          namHoc,
          loai: 2, // Hội đồng Poster
        });
        hoiDongsToInsert.push({
          stt,
          giangVien: thanhVien.gv2, // Giáo viên 2
          vaiTro: 2, // 5 = Giáo viên phản biện 2
          hocKy,
          namHoc,
          loai: 2,
        });
      });
    }
  });

  // Chèn dữ liệu hội đồng vào cơ sở dữ liệu
  if (hoiDongsToInsert.length > 0) {
    await hoiDong.insertMany(hoiDongsToInsert);
  }

  return res.status(200).json({
    status: 'success',
    message: 'Hội đồng đã được tạo thành công.',
    data: null,
  });
});
