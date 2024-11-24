const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const userRouter = express.Router();

userRouter.route('/login').post(authController.login);
userRouter.route('/logout').get(authController.logout);
userRouter.use(authController.protect);
userRouter
  .route('/sinhVien')
  .get(userController.layDanhSachSinhVien)
  .post(userController.taoMotSinhVien);
userRouter.route('/nhieuSinhVien').post(userController.insertMany);
userRouter
  .route('/giangVien')
  .get(userController.layDanhSachGiangVien)
  .post(userController.taoMotGiangVien);
userRouter.route('/NhieuSinhVien').post(userController.insertMany);
userRouter.route('/NhieuGiangVien').post(userController.insertManyGiangVien);
userRouter
  .route('/me')
  .get(userController.getMe)
  .patch(userController.capNhatThongTinTaiKhoan);
userRouter.route('/me/hinhAnh').patch(userController.capNhatHinhAnh);
userRouter.route('/danhSachTroChuyen').get(userController.layDanhSachTroChuyen);
userRouter
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.capNhatMatKhauMacDinh);
module.exports = userRouter;
