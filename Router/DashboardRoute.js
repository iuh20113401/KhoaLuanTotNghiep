const express = require('express');
const dashBoardController = require('../controller/DashboardController');
const authController = require('../controller/authController');

const dashboardRouter = express.Router();
dashboardRouter.use(authController.protect);
dashboardRouter
  .route('/GiangVien')
  .get(dashBoardController.layThongTinDashboardGiangVien);
module.exports = dashboardRouter;
