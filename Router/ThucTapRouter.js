const express = require('express');
const thucTapController = require('../controller/ThucTapController');
const authController = require('../controller/authController');

const thucTapRouter = express.Router();

thucTapRouter.use(authController.protect);
thucTapRouter
  .route('/')
  .get(authController.restrictTo(1, 2, 3, 4), thucTapController.getAllThucTap)
  .post(thucTapController.taoNoiDungThucTap);
thucTapRouter
  .route('/DanhSachThucTap/GiangVien')
  .get(
    authController.restrictTo(1, 2, 3, 4),
    thucTapController.getDanhSachThucTapTheoGiangVien,
  );
thucTapRouter
  .route('/GiangVienGiamSat')
  .post(
    authController.restrictTo(3),
    thucTapController.phanCongGiangVienGiamSat,
  );
thucTapRouter.route('/:id/comment').post(thucTapController.themComment);
thucTapRouter.route('/:id/taiLieu').post(thucTapController.taiTaiLieu);
thucTapRouter
  .route('/:id')
  .get(thucTapController.getThucTap)
  .patch(thucTapController.updateThucTap);
module.exports = thucTapRouter;
