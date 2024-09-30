const express = require('express');
const bieuMauChungController = require('../controller/bieuMauChung');
const authController = require('../controller/authController');

const bieuMauChungRouter = express.Router();
bieuMauChungRouter.use(authController.protect);
bieuMauChungRouter
  .route('/')
  .get(bieuMauChungController.getBieuMauChung)
  .post(bieuMauChungController.taiBieuMau);
bieuMauChungRouter
  .route('/:giangVien')
  .get(bieuMauChungController.getBieuMauDoAn);

module.exports = bieuMauChungRouter;
