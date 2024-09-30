const express = require('express');
const diemDanhController = require('../controller/diemDanhController');
const authController = require('../controller/authController');

const diemDanhRouter = express.Router();

diemDanhRouter.use(authController.protect);
diemDanhRouter.route('/').post(diemDanhController.taoMaDiemDanh);
diemDanhRouter.route('/:id/diemDanh').post(diemDanhController.diemDanh);

exports.default = diemDanhRouter;
