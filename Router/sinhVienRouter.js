const express = require('express');
const sinhVienController = require('../controller/sinhVienController');
const authController = require('../controller/authController');

const sinhVienRouter = express.Router();

sinhVienRouter.use(authController.protect);
sinhVienRouter
  .route('/DanhSachSinhVien/GiangVien')
  .get(sinhVienController.getSinhVienDoAnTheoGiangVien);
sinhVienRouter
  .route('/DanhSachSinhVienThucTap/GiangVien')
  .get(sinhVienController.getSinhVienThucTapTheoGiangVien);
sinhVienRouter
  .route('/DanhSachSinhVien/ToanBo')
  .get(sinhVienController.getAllThongTinSinhVien);
sinhVienRouter
  .route('/:id/diemHuongDan')
  .patch(sinhVienController.updateDiemHuongDan);
sinhVienRouter
  .route('/:id/diemThucTap')
  .patch(sinhVienController.updateDiemThucTap);
sinhVienRouter
  .route('/:id/LoiMoi')
  .post(sinhVienController.guiLoiMoi)
  .patch(sinhVienController.updateDiemThucTap);
sinhVienRouter.route('/:id').get(sinhVienController.getSinhVien);
module.exports = sinhVienRouter;
