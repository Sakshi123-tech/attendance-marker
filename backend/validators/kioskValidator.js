const validator = require('validator');
const AppError = require('../utils/AppError');

/**
 * Middleware: Validate Kiosk registration/creation payload
 */
const validateKioskCreate = (req, res, next) => {
  const { name, location, ipAddress } = req.body;

  if (!name || !location) {
    return next(new AppError('Please provide all required kiosk fields: name and location.', 400));
  }

  // ipAddress is optional — only validate format if provided
  if (ipAddress && !validator.isIP(ipAddress)) {
    return next(new AppError('Please provide a valid IP address for the kiosk device.', 400));
  }

  // Sanitize
  req.body.name = name.trim();
  req.body.location = location.trim();
  req.body.ipAddress = ipAddress ? ipAddress.trim() : '';

  next();
};

/**
 * Middleware: Validate Kiosk update payload
 */
const validateKioskUpdate = (req, res, next) => {
  const { name, location, ipAddress } = req.body;

  // If IP address is present, validate it
  if (ipAddress && !validator.isIP(ipAddress)) {
    return next(new AppError('Please provide a valid IP address for the kiosk device.', 400));
  }

  // Clean inputs if present
  if (name) req.body.name = name.trim();
  if (location) req.body.location = location.trim();
  if (ipAddress) req.body.ipAddress = ipAddress.trim();

  next();
};

module.exports = {
  validateKioskCreate,
  validateKioskUpdate
};
