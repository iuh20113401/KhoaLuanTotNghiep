const express = require('express');
const tieuChiController = require('../controller/tieuChiController');
const authController = require('../controller/authController');

const tieuChiRouter = express.Router();

tieuChiRouter.use(authController.protect);
tieuChiRouter
  .route('/')
  .get(tieuChiController.getAllTieuChi)
  .post(tieuChiController.taoTieuChi);
tieuChiRouter
  .route('/TieuChiDoAn')
  .get(tieuChiController.getTieuChiDoAn)
  .patch(tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/huongDan')
  .get(tieuChiController.getTieuChiHuongDan)
  .patch(tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/PhanBien')
  .get(tieuChiController.getTieuChiPhanBien)
  .patch(tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/hoiDong')
  .get(tieuChiController.getTieuChi)
  .patch(tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/thucTap/GiangVien')
  .get(tieuChiController.getTieuChiThucTapGiangVien)
  .patch(tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/thucTap/DoanhNghiep')
  .get(tieuChiController.getTieuChiThucTapChoDoanhNghiep)
  .patch(tieuChiController.updateTieuChi);
tieuChiRouter
  .route('/:id')
  .get(tieuChiController.getTieuChi)
  .patch(tieuChiController.updateTieuChi);
module.exports = tieuChiRouter;
