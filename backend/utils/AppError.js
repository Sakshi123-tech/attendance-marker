
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    // Status is 'fail' for 4xx errors (client errors) and 'error' for 5xx errors (server errors)
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // Mark as operational error so we can distinguish it from programmer errors/exceptions
    this.isOperational = true;

    // Capture the stack trace, keeping the constructor call out of it
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
