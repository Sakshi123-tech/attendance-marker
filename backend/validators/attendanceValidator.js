const AppError = require('../utils/AppError');

/**
 * Middleware: Validate Kiosk Face Check-In Payload
 * Only requires liveEmbedding — identity is resolved server-side by face matching.
 */
const validateCheckIn = (req, res, next) => {
  const { liveEmbedding } = req.body;

  if (!liveEmbedding) {
    return next(new AppError('Please provide a liveEmbedding (face descriptor or image data).', 400));
  }

  // Accept either:
  // 1. A base64 image string (prototype / mock flow)
  // 2. A real 128D float array (production face-api.js flow)
  const isBase64Image = typeof liveEmbedding === 'string' && liveEmbedding.startsWith('data:image');
  const isEmbeddingArray = Array.isArray(liveEmbedding) && liveEmbedding.length > 0 && liveEmbedding.every(n => typeof n === 'number');

  if (!isBase64Image && !isEmbeddingArray) {
    return next(new AppError('liveEmbedding must be a base64 image string or a numeric face descriptor array.', 400));
  }

  next();
};

module.exports = {
  validateCheckIn
};
