const express = require('express');
const sinhVienController = require('../controller/sinhVienController');
const authController = require('../controller/authController');

const sinhVienRouter = express.Router();

sinhVienRouter.use(authController.protect);
sinhVienRouter
  .route('/DanhSachSinhVien/GiangVien')
  .get(
    authController.restrictTo(1, 2, 3, 4),
    sinhVienController.getSinhVienDoAnTheoGiangVien,
  );
sinhVienRouter
  .route('/DanhSachSinhVienThucTap/GiangVien')
  .get(
    authController.restrictTo(1, 2, 3, 4),
    sinhVienController.getSinhVienThucTapTheoGiangVien,
  );
sinhVienRouter
  .route('/DanhSachSinhVien/ToanBo')
  .get(
    authController.restrictTo(1, 2, 3, 4),
    sinhVienController.getAllThongTinSinhVien,
  );
sinhVienRouter
  .route('/:id/diemHuongDan')
  .patch(
    authController.restrictTo(1, 2, 3, 4),
    sinhVienController.updateDiemHuongDan,
  );
sinhVienRouter
  .route('/:id/diemThucTap')
  .patch(
    authController.restrictTo(1, 2, 3, 4),
    sinhVienController.updateDiemThucTap,
  );
sinhVienRouter
  .route('/:id/LoiMoi')
  .post(sinhVienController.guiLoiMoi)
  .patch(
    authController.restrictTo(1, 2, 3, 4),
    sinhVienController.updateDiemThucTap,
  );
sinhVienRouter.route('/:id').get(sinhVienController.getSinhVien);
module.exports = sinhVienRouter;
