const express = require('express');
const tieuChiController = require('../controller/tieuChiController');
const authController = require('../controller/authController');

const tieuChiRouter = express.Router();

tieuChiRouter.use(authController.protect);

tieuChiRouter
  .route('/')
  .get(tieuChiController.getAllTieuChi)
  .post(authController.restrictTo(2), tieuChiController.taoTieuChi);
tieuChiRouter
  .route('/TieuChiDoAn')
  .get(tieuChiController.getTieuChiDoAn)
  .patch(authController.restrictTo(2), tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/huongDan')
  .get(tieuChiController.getTieuChiHuongDan)
  .patch(authController.restrictTo(2), tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/PhanBien')
  .get(tieuChiController.getTieuChiPhanBien)
  .patch(authController.restrictTo(2), tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/hoiDong')
  .get(tieuChiController.getTieuChi)
  .patch(authController.restrictTo(2), tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/thucTap/GiangVien')
  .get(tieuChiController.getTieuChiThucTapGiangVien)
  .patch(authController.restrictTo(2), tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/thucTap/DoanhNghiep')
  .get(tieuChiController.getTieuChiThucTapChoDoanhNghiep)
  .patch(authController.restrictTo(2), tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/:id')
  .get(tieuChiController.getTieuChi)
  .patch(authController.restrictTo(2), tieuChiController.updateTieuChi);
module.exports = tieuChiRouter;
