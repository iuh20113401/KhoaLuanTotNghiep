const express = require('express');
const userController = require('../controller/userController');
const authController = require('../controller/authController');

const userRouter = express.Router();

userRouter.route('/login').post(authController.login);
userRouter.route('/logout').get(authController.logout);
userRouter.use(authController.protect);
userRouter.route('/NhieuUser').post(userController.insertMany);
userRouter.route('/me').get(userController.getMe);
userRouter.route('/GiangVien').get(userController.getAllGiangVien);
userRouter.route('/').get(userController.getAllUser);
userRouter.route('/').post(userController.taoUser);
userRouter.route('/danhSachTroChuyen').get(userController.layDanhSachTroChuyen);
userRouter.route('/:id').get(userController.getUser);
module.exports = userRouter;
