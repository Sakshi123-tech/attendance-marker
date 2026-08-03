const rateLimit = require('express-rate-limit');
const AppError = require('../utils/AppError');

/**
 * Global API Rate Limiter
 * Restricts overall traffic to mitigate general Denial of Service (DoS) attempts.
 */
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Limit each IP to 200 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, next) => {
    next(new AppError('Too many requests from this IP. Please try again after 15 minutes!', 429));
  }
});

/**
 * Authentication Route Rate Limiter
 * Specifically targets login, password setup, and onboarding to block brute-force attacks.
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 authentication attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next) => {
    next(new AppError('Too many authentication attempts. Please try again after 15 minutes!', 429));
  }
});

module.exports = {
  globalLimiter,
  authLimiter
};
