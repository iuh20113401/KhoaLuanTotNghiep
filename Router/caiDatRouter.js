const express = require('express');
const caiDatController = require('../controller/CaiDatController');
const authController = require('../controller/authController');

const caiDatRouter = express.Router();

caiDatRouter.route('/').get(caiDatController.get);
caiDatRouter
  .route('/dangKyDeTai')
  .patch(authController.protect, caiDatController.capNhatDangKyDeTai);

caiDatRouter
  .route('/dangKyThucTap')
  .patch(authController.protect, caiDatController.capNhatDangKyThucTap);

caiDatRouter
  .route('/resetDeTai')
  .post(authController.protect, caiDatController.resetDeTai);

module.exports = caiDatRouter;
