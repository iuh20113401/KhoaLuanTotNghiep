const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');
const User = require('../model/userModel');
const SinhVien = require('../model/sinhVien');

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRED_IN,
  });
const createSendToken = (newUser, statusCode, res) => {
  const token = signToken(newUser._id);
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIES_EXPIRES * 60 * 24 * 60 * 1000,
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'None';
  }

  // Corrected from 'cookies' to 'cookie'
  res.cookie('jwt', token, options);

  // Ensure the password is not returned
  newUser.password = undefined;

  // Send the response
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user: newUser,
    },
  });
};

// Only for rendered pages, no errors!
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      let currentUser = await User.findById(decoded.id).select(
        '_id maSo hoTen ngaySinh gioiTinh soDienThoai vaiTro hinhAnh',
      );
      if (!currentUser) {
        return next();
      }

      // If the user has 'vaiTro' equal to 0, merge the SinhVien data
      if (currentUser.vaiTro === 0) {
        const sinhVien = await SinhVien.findOne({ userId: req.user._id });

        // Combine user and sinhVien, but keep the user's _id
        currentUser = {
          ...currentUser._doc,
          ...sinhVien._doc,
          _id: decoded.id,
        };
      }
      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};
exports.login = catchAsync(async (req, res, next) => {
  const { maSo, password } = req.body;
  // 1) Check if email and password exist
  if (!maSo || !password) {
    return next(new ApiError('Vui lòng nhập đầy đủ mã số và password', 400));
  }
  // 2) Check if user exists && password is correct
  let user = await User.findOne({ maSo }).select('+password');
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new ApiError('Mã số hoặc password không đúng!', 401));
  }
  // If the user has 'vaiTro' equal to 0, merge the SinhVien data
  if (user.vaiTro === 0) {
    const sinhVien = await SinhVien.findOne({ userId: user._id });

    // Combine user and sinhVien, but keep the user's _id
    user = {
      ...user._doc,
      ...sinhVien._doc,
      _id: user._id,
    };
  }
  // 3) If everything ok, send token to client
  createSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  const options = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === 'production') {
    options.secure = true;
    options.sameSite = 'None';
  }
  res.cookie('jwt', 'loggedout', options);
  res.status(200).json({ status: 'success', data: { status: 'success' } });
};

exports.protect = catchAsync(async (req, res, next) => {
  // 1) Getting token and check of it's there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    return next(
      new ApiError('You are not logged in! Please log in to get access.', 401),
    );
  }
  // 2) Verification token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Check if user still exists
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new ApiError(
        'The user belonging to this token does no longer exist.',
        401,
      ),
    );
  }

  // GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
  next();
});

exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
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
