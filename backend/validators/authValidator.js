const validator = require('validator');
const AppError = require('../utils/AppError');

/**
 * Middleware: Validate user login payload
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('Please provide both email and password!', 400));
  }

  if (!validator.isEmail(email)) {
    return next(new AppError('Please provide a valid email address!', 400));
  }

  // Clean inputs
  req.body.email = email.trim().toLowerCase();

  next();
};

/**
 * Middleware: Validate account setup payload (for onboarding Employees/HR)
 */
const validateSetupAccount = (req, res, next) => {
  const { password, confirmPassword } = req.body;

  if (!password) {
    return next(new AppError('Please provide a password!', 400));
  }

  if (!validator.isLength(password, { min: 8 })) {
    return next(new AppError('Password must be at least 8 characters long!', 400));
  }

  if (confirmPassword && password !== confirmPassword) {
    return next(new AppError('Passwords do not match. Please verify your entries!', 400));
  }

  next();
};

/**
 * Middleware: Validate employee creation payload
 */
const validateCreateEmployee = (req, res, next) => {
  const { fullName, email, role, employeeId } = req.body;

  if (!fullName || !email || !role || !employeeId) {
    return next(new AppError('Please provide all required fields: fullName, email, role, and employeeId!', 400));
  }

  if (!validator.isEmail(email)) {
    return next(new AppError('Please provide a valid email address!', 400));
  }

  const validRoles = ['ADMIN', 'HR', 'EMPLOYEE', 'KIOSK'];
  if (!validRoles.includes(role)) {
    return next(new AppError('Invalid user role specified! Must be ADMIN, HR, EMPLOYEE, or KIOSK.', 400));
  }

  // Clean inputs
  req.body.fullName = fullName.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.employeeId = employeeId.trim();
  req.body.role = role;

  next();
};

module.exports = {
  validateLogin,
  validateSetupAccount,
  validateCreateEmployee
};
