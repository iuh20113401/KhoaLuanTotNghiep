const express = require('express');
const diemDanhController = require('../controller/diemDanhController');
const authController = require('../controller/authController');

const diemDanhRouter = express.Router();

diemDanhRouter.use(authController.protect);
diemDanhRouter
  .route('/')
  .post(
    authController.restrictTo(1, 2, 3, 4),
    diemDanhController.taoMaDiemDanh,
  );
diemDanhRouter.route('/:id/diemDanh').post(diemDanhController.diemDanh);

exports.default = diemDanhRouter;
