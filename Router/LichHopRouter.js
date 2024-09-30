const express = require('express');
const lichHopController = require('../controller/LichHopController');
const authController = require('../controller/authController');

const lichHopRouter = express.Router();
lichHopRouter.use(authController.protect);
lichHopRouter
  .route('/')
  .get(lichHopController.getALlLichHop)
  .post(lichHopController.taoLichHop);
lichHopRouter
  .route('/SinhVien/:id')
  .get(lichHopController.getLichHopChoSinhVien);
lichHopRouter
  .route('/GiangVien/:id')
  .get(lichHopController.getLichHopThuocGiangVien);

module.exports = lichHopRouter;
