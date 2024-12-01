const express = require('express');
const deTaiController = require('../controller/deTaiController');
const authController = require('../controller/authController');

const deTaiRouter = express.Router();
deTaiRouter.route('/').get(deTaiController.getAllDeTai);
deTaiRouter.use(authController.protect);
deTaiRouter.route('/').post(deTaiController.taoDeTai);
deTaiRouter.route('/danhMuc').get(deTaiController.getDanhMucDeTai);
deTaiRouter
  .route('/DanhSachDeTai/GiangVien')
  .get(
    authController.restrictTo(1, 2, 3, 4),
    deTaiController.getAllDeTaiTheoGiangVien,
  );
deTaiRouter
  .route('/DanhSachDeTai/ChoDuyet')
  .get(
    authController.restrictTo(1, 2, 3, 4),
    deTaiController.getDanhSachDeTaiChoDuyet,
  );
deTaiRouter
  .route('/DanhSachDeTai/DaDuyet')
  .get(
    authController.restrictTo(1, 2, 3, 4),
    deTaiController.getDanhSachDeTaiDaDuyet,
  );
deTaiRouter
  .route('/DanhSachDeTai/DangKy')
  .get(deTaiController.getDanhSachDeTaiDanhKy);
deTaiRouter
  .route('/duyetdetai/:id')
  .patch(authController.restrictTo(3), deTaiController.duyetDeTai);
deTaiRouter
  .route('/:id')
  .get(deTaiController.getDeTai)
  .patch(
    authController.restrictTo(1, 2, 3, 4),
    deTaiController.xoaTrangThai,
    deTaiController.updateDeTai,
  )
  .delete(authController.restrictTo(1, 2, 3, 4), deTaiController.xoaDeTai);
module.exports = deTaiRouter;
