const express = require('express');
const chatController = require('../controller/chatController');
const authController = require('../controller/authController');

const router = express.Router();
router.use(authController.protect);
router
  .route('/messages/:partnerId')
  .get(chatController.getMessagesBetweenUsers);

module.exports = router;
