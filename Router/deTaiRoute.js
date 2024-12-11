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
//lấy danh sách đề tài với trạng thái là 0 (chờ duyệt) cho giảng viên
deTaiRouter
  .route('/DanhSachDeTai/ChoDuyet')
  .get(
    authController.restrictTo(1, 2, 3, 4),
    deTaiController.getDanhSachDeTaiChoDuyet,
  );
//lấy danh sách đề tài với trạng thái là 1 (chờ đăng ký) cho giảng viên

deTaiRouter
  .route('/DanhSachDeTai/DaDuyet')
  .get(
    authController.restrictTo(1, 2, 3, 4),
    deTaiController.getDanhSachDeTaiDaDuyet,
  );
//lấy danh sách đề tài với trạng thái là 1 (chờ đăng ký) cho sinh viên
deTaiRouter
  .route('/DanhSachDeTai/DangKy')
  .get(deTaiController.getDanhSachDeTaiDanhKy);
deTaiRouter
  .route('/duyetdetai/:id')
  .patch(authController.restrictTo(3), deTaiController.duyetDeTai);
deTaiRouter
  .route('/:id')
  .get(deTaiController.getDeTai)
  .patch(authController.restrictTo(1, 2, 3, 4), deTaiController.updateDeTai)
  .delete(authController.restrictTo(1, 2, 3, 4), deTaiController.xoaDeTai);
module.exports = deTaiRouter;
