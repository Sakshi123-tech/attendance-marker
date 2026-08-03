const AppError = require('../utils/AppError');

/**
 * Middleware: Validate face embedding registration payload
 */
const validateFaceRegister = (req, res, next) => {
  const { embedding } = req.body;

  if (!embedding) {
    return next(new AppError('Please provide a face embedding array.', 400));
  }

  if (!Array.isArray(embedding)) {
    return next(new AppError('Face embedding must be an array of numbers.', 400));
  }

  // standard face-api / face-net descriptors are 128 or 512 dimensions
  if (embedding.length === 0) {
    return next(new AppError('Face embedding array cannot be empty.', 400));
  }

  // Verify all elements are numbers
  const allNumbers = embedding.every(num => typeof num === 'number');
  if (!allNumbers) {
    return next(new AppError('Face embedding must contain only numbers.', 400));
  }

  next();
};

module.exports = {
  validateFaceRegister
};
