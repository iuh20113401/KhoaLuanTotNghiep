const express = require('express');
const doAnController = require('../controller/doAnController');
const authController = require('../controller/authController');

const doAnRouter = express.Router();

doAnRouter.use(authController.protect);
doAnRouter.route('/').get(doAnController.getAllDoAn);
doAnRouter.route('/').post(doAnController.taoDoAn);
doAnRouter.route('/huyDoAn').post(doAnController.deleteDoAn);
doAnRouter
  .route('/DanhSachDoAn/GiangVien')
  .get(doAnController.getDanhSachDoAnTheoGiangVien);

doAnRouter
  .route('/DanhSachDoAn/DatCuoiKy')
  .get(doAnController.getDanhSachDoAnDatCuoiKy)
  .post(doAnController.themNhieuGiangVienPhanBien);
doAnRouter
  .route('/DanhSachDoAn/DatPhanBien')
  .get(doAnController.getDanhSachDoAnDatPhanBien)
  .post(doAnController.themNhieuGiangVienHoiDong);
doAnRouter
  .route('/DanhSachDoAn/PhanBien')
  .get(doAnController.getDanhSachDoAnPhanBien);
doAnRouter
  .route('/DanhSachDoAn/HoiDong')
  .get(doAnController.getDanhSachDoAnHoiDong);
doAnRouter.route('/:id/SinhVien2').post(doAnController.themSinhVien2);
doAnRouter
  .route('/:id/sinhVien')
  .get(doAnController.getThongTinSinhVienTheoDoAn);
doAnRouter.route('/:id/comment').post(doAnController.themComment);
doAnRouter.route('/:id/taiLieu').post(doAnController.taiTaiLieu);
doAnRouter
  .route('/:id/taiLieuPhanBien')
  .post(doAnController.taiTaiLieuPhanBien);
doAnRouter.route('/:id/taiLieuHoiDong').post(doAnController.taiTaiLieuHoiDong);
doAnRouter
  .route('/:id/GiangVienPhanBien')
  .post(doAnController.themGiangVienPhanBien);
doAnRouter
  .route('/:id/taiLieuPhanBien/:taiLieuId')
  .delete(doAnController.xoaTaiLieuPhanBien);
doAnRouter
  .route('/:id/taiLieuHoiDong/:taiLieuId')
  .delete(doAnController.taiTaiLieuHoiDong);
doAnRouter
  .route('/:id')
  .get(doAnController.getDoAn)
  .post(doAnController.updateDoAn);

module.exports = doAnRouter;
