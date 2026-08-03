const Kiosk = require('../models/Kiosk');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');

/**
 * Kiosk Device Authentication Middleware
 * Enforces hardware handshakes: validates x-kiosk-id, x-kiosk-secret headers,
 * checks device active status, and verifies request IP matches registered address.
 */
const authenticateKiosk = catchAsync(async (req, res, next) => {
  const kioskId = req.headers['x-kiosk-id'];
  const kioskSecret = req.headers['x-kiosk-secret'];

  // 1. Verify headers are present
  if (!kioskId || !kioskSecret) {
    return next(new AppError('Kiosk authentication headers missing. Please provide x-kiosk-id and x-kiosk-secret.', 401));
  }

  // 2. Fetch Kiosk device
  const kiosk = await Kiosk.findById(kioskId);
  if (!kiosk) {
    return next(new AppError('Unauthorized: Kiosk device registration not found.', 401));
  }

  // 3. Verify Kiosk is active
  if (!kiosk.isActive) {
    return next(new AppError('Access Denied: This kiosk terminal has been deactivated.', 403));
  }

  // 4. Verify hardware secret matches
  if (kiosk.deviceSecret !== kioskSecret) {
    return next(new AppError('Unauthorized: Invalid kiosk credentials.', 401));
  }

  // 5. Verify approved client IP Address source (only if an IP was registered for this kiosk)
  if (kiosk.ipAddress && kiosk.ipAddress.trim() !== '') {
    const rawClientIp = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    
    // Normalize loopbacks and mapped IPv4 addresses
    let clientIp = rawClientIp.trim();
    if (clientIp.includes(',')) {
      clientIp = clientIp.split(',')[0].trim(); // Extract first proxy hop if multiple present
    }
    if (clientIp.startsWith('::ffff:')) {
      clientIp = clientIp.replace('::ffff:', '');
    }
    if (clientIp === '::1') {
      clientIp = '127.0.0.1';
    }

    let kioskIp = kiosk.ipAddress.trim();
    if (kioskIp.startsWith('::ffff:')) {
      kioskIp = kioskIp.replace('::ffff:', '');
    }
    if (kioskIp === '::1') {
      kioskIp = '127.0.0.1';
    }

    // Enforce IP match
    if (clientIp !== kioskIp) {
      return next(new AppError(`Forbidden: Request IP (${clientIp}) does not match registered Kiosk IP (${kiosk.ipAddress}).`, 403));
    }
  }

  // Attach resolved kiosk to request details and proceed
  req.kiosk = kiosk;
  next();
});

module.exports = {
  authenticateKiosk
};
