const multer = require('multer');
const path = require('path');
const express = require('express');
const thongBaoController = require('../controller/ThongBaoController');
const authController = require('../controller/authController');
const { uploadHinhAnh } = require('../controller/uploadController');

const thongBaoRouter = express.Router();

thongBaoRouter.use(authController.protect);
thongBaoRouter
  .route('/')
  .get(thongBaoController.getAllThongBao)
  .post(thongBaoController.taoThongBao);
thongBaoRouter.post('/upload', thongBaoController.uploadHinhAnh);
thongBaoRouter.route('/sinhVien').get(thongBaoController.getThongBaoKeHoach);
thongBaoRouter.route('/GiangVien').get(thongBaoController.getThongBaoKeHoach);
thongBaoRouter
  .route('/keHoach')
  .get(thongBaoController.getThongBaoKeHoach)
  .post(uploadHinhAnh, thongBaoController.themHoacCapNhatThongBao);
thongBaoRouter
  .route('/:id')
  .get(thongBaoController.getThongBao)
  .patch(thongBaoController.updateThongBao);
module.exports = thongBaoRouter;
