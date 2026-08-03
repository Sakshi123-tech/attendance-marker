const { verifyToken } = require('../utils/jwtUtils');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/AppError');
const User = require('../models/User');

/**
 * Route protection middleware to authenticate incoming JWT.
 * Reads token from signed cookies (httpOnly) or Authorization Bearer header.
 */
const protect = catchAsync(async (req, res, next) => {
  let token;

  // 1. Attempt to extract JWT from Signed Cookies or Cookies
  if (req.signedCookies && req.signedCookies.token) {
    token = req.signedCookies.token;
  } else if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } 
  // 2. Fallback to Authorization Header
  else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 3. Reject if token does not exist
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to get access.', 401));
  }

  try {
    // 4. Verify token signatures
    const decoded = verifyToken(token);

    // 5. Fetch associated user and check if active
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError('The user belonging to this token no longer exists.', 401));
    }

    // 6. Check if user is deactivated
    if (!currentUser.isActive) {
      return next(new AppError('This user account has been deactivated. Please contact your administrator.', 403));
    }

    // 7. Grant access and bind user details to request object
    req.user = currentUser;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired authentication token. Please log in again.', 401));
  }
});

/**
 * Role-Based Access Control (RBAC) middleware.
 * Restricts access to routes to specified authorization roles.
 * 
 * @param {...String} roles - Array of authorized roles (e.g. 'SUPER_ADMIN', 'HR')
 */
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // Ensure req.user has been bound by protect middleware
    if (!req.user) {
      return next(new AppError('Authentication context missing. Protect middleware must precede authorization.', 500));
    }

    // Check if user role is authorized
    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};

module.exports = {
  protect,
  authorizeRoles
};
