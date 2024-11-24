const express = require('express');
const hoiDongController = require('../controller/hoiDongController');
const authController = require('../controller/authController');

const hoiDongRouter = express.Router();

hoiDongRouter.use(authController.protect);
hoiDongRouter
  .route('/')
  .get(hoiDongController.layDanhSachHoiDong)
  .post(hoiDongController.taoHoiDong);

module.exports = hoiDongRouter;
