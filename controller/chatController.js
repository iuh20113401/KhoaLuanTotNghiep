const Message = require('../model/ChatModel');
const catchAsync = require('../utils/catchAsync');

exports.createMessage = catchAsync(async (req, res) => {
  const message = await Message.create(req.body);
  res.status(201).json({
    status: 'success',
    data: message,
  });
});

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chatRoom: req.params.chatRoom });
    res.status(200).json({
      status: 'success',
      data: messages,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};
exports.getMessagesBetweenUsers = catchAsync(async (req, res, next) => {
  const roomId = [req.user._id, req.params.partnerId].sort().join('_'); // Get the
  const messages = await Message.find({ chatRoom: roomId }).sort('createdAt');
  res.status(200).json({
    status: 'success',
    data: { messages },
  });
});
