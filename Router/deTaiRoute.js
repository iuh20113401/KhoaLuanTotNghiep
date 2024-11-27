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
  .get(deTaiController.getAllDeTaiTheoGiangVien);
deTaiRouter
  .route('/DanhSachDeTai/ChoDuyet')
  .get(deTaiController.getDanhSachDeTaiChoDuyet);
deTaiRouter
  .route('/DanhSachDeTai/DaDuyet')
  .get(deTaiController.getDanhSachDeTaiDaDuyet);
deTaiRouter
  .route('/DanhSachDeTai/DangKy')
  .get(deTaiController.getDanhSachDeTaiDanhKy);
deTaiRouter.route('/duyetdetai/:id').patch(deTaiController.duyetDeTai);
deTaiRouter
  .route('/:id')
  .get(deTaiController.getDeTai)
  .patch(deTaiController.xoaTrangThai, deTaiController.updateDeTai)
  .delete(deTaiController.deleteDeTai);
module.exports = deTaiRouter;
