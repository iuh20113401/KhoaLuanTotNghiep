const ApiError = require('../utils/ApiError');

const handleCastError = (err) => {
  const message = `Invalid: ${err.path}: ${err.value}`;
  return new ApiError(message, 400);
};
const handleDuplicateError = (err) => {
  const { name } = err.keyValue;
  const message = `Duplicate name: ${name}`;
  return new ApiError(message, 400);
};
const handleValidationError = (err) => {
  const error = Object.values(err.errors)
    .map((el) => el.message)
    .join('. ');
  const message = `Validation failed: ${error}`;
  return new ApiError(message, 400);
};
const handleInvalidSignature = () =>
  new ApiError('Invalid token! Please log in again', 401);
const handleExpiredToken = () =>
  new ApiError('Token expired! Please log in again!', 401);
const sendErrDev = (res, err) => {
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack,
  });
};
const sendErrPro = (res, err) => {
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    res.status(500).json({
      status: 'error',
      message: 'something want very wrong!',
    });
  }
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  console.log({ ...err });
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrDev(res, err);
  } else {
    // asign new variable to change it later
    let error = { ...err, message: err.message };
    if (err.name === 'CastError') error = handleCastError(error);
    if (err.code === 11000) error = handleDuplicateError(error);
    if (err.name === 'ValidationError') error = handleValidationError(error);
    if (err.name === 'JsonWebTokenError') error = handleInvalidSignature();
    if (err.name === 'TokenExpiredError') error = handleExpiredToken();
    sendErrPro(res, error);
  }
};
