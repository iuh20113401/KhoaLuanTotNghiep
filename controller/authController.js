const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');

const singToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED_IN,
  });
const createSendToken = (newUser, statusCode, res) => {
  const token = singToken(newUser._id);
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES * 60 * 24 * 60 * 1000,
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') options.secure = true;
  res.cookie('jwt', token, options);
  newUser.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
};

exports.singin = catchAsync(async (req, res, next) => {
  const { maSo, password } = req.body;
  //check email and password not empty
  if (!maSo || !password) {
    return next(new ApiError('Vui lòng nhập mã số và mật khẩu', 401));
  }
  // get user
  const user = await User.findOne({ maSo }).select('+password');
  console.log(await User.find(), user, maSo, password);
  const correct = user && (await user.correctPassword(password, user.password));
  if (!correct) {
    return next(new ApiError('Mã số hoặc mật khẩu không đúng', 401));
  }
  const token = singToken(user._id);
  req.user = user;
  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: user,
    },
  });
});
exports.logout = catchAsync((req, res) => {
  // // Clear the cookie by setting an expired date in the past
  // res.cookie('jwt', 'loggedout', {
  //   expires: new Date(Date.now() + 10 * 1000), // Expire after 10 seconds
  //   httpOnly: true,
  // });

  res.status(200).json({
    status: 'success',
    data: { message: 'You have been logged out successfully!' },
  });
});
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new ApiError('You are not logged in! Please log in to get access.', 401),
    );
  }
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id);
  if (!user) {
    return next(
      new ApiError('The user belong to this token is not exist!', 401),
    );
  }

  if (user.changePasswordAfter(decoded.iat)) {
    return next(
      new ApiError(
        'The user has changed the password. Please log in again',
        401,
      ),
    );
  }
  req.user = user;
  next();
});
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log(
      !roles.includes(req.user.vaiTro),
      !roles.includes(req.user.boMon.vaiTro),
      !roles.includes(req.user.vaiTro) &&
        !roles.includes(req.user.boMon.vaiTro),
    );
    if (
      !roles.includes(req.user.vaiTro) &&
      !roles.includes(req.user.boMon.vaiTro)
    ) {
      return next(
        new ApiError('You do not have permission to do this action.', 401),
      );
    }
    next();
  };
