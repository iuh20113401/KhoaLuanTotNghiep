const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const userRouter = express.Router();

userRouter.route('/login').post(authController.login);
userRouter.route('/logout').get(authController.logout);
userRouter.use(authController.protect);
userRouter
  .route('/me')
  .get(userController.getMe)
  .patch(userController.capNhatThongTinTaiKhoan);
userRouter.route('/me/hinhAnh').patch(userController.capNhatHinhAnh);
userRouter.route('/danhSachTroChuyen').get(userController.layDanhSachTroChuyen);
userRouter
  .route('/sinhVien')
  .get(userController.layDanhSachSinhVien)
  .post(authController.restrictTo(4), userController.taoMotSinhVien);
userRouter
  .route('/nhieuSinhVien')
  .post(authController.restrictTo(3, 4), userController.insertMany);
userRouter
  .route('/giangVien')
  .get(authController.restrictTo(4), userController.layDanhSachGiangVien)
  .post(authController.restrictTo(4), userController.taoMotGiangVien);
userRouter
  .route('/NhieuSinhVien')
  .post(authController.restrictTo(3, 4), userController.insertMany);
userRouter
  .route('/NhieuGiangVien')
  .post(authController.restrictTo(4), userController.insertManyGiangVien);

userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(authController.restrictTo(4), userController.capNhatMatKhauMacDinh);
module.exports = userRouter;
