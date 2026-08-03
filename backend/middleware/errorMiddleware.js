const AppError = require('../utils/AppError');

/**
 * Handle Mongoose invalid ID errors (CastError)
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose duplicate key errors (11000)
 */
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg ? err.errmsg.match(/(["'])(\\?.)*?\1/)[0] : 'value';
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handle Mongoose validation errors
 */
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handle JSON Web Token invalid token errors
 */
const handleJWTError = () => new AppError('Invalid authentication token. Please log in again!', 401);

/**
 * Handle JSON Web Token expired token errors
 */
const handleJWTExpiredError = () => new AppError('Your login session has expired. Please log in again!', 401);

/**
 * Send detailed error details in Development
 */
const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

/**
 * Send clean, user-friendly error messages in Production
 */
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send user-friendly message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message
    });
  }
  
  // Programming or other unknown error: don't leak details to clients
  console.error('[ERROR] 💥 Unexpected Exception:', err);
  
  return res.status(500).json({
    status: 'error',
    message: 'Something went very wrong on our end!'
  });
};

/**
 * Centralized Global Error Handling Middleware
 */
const globalErrorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;
    error.name = err.name;
    error.code = err.code;

    // Handle database and JWT specific operational errors
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

/**
 * Route Not Found Middleware (404 Catcher)
 */
const notFound = (req, res, next) => {
  next(new AppError(`Can't find endpoint ${req.originalUrl} on this server!`, 404));
};

module.exports = {
  globalErrorHandler,
  notFound
};
