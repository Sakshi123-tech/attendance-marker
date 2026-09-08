const crypto = require('crypto');
const User = require('../models/User');
const SystemLog = require('../models/SystemLog');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendTokenResponse } = require('../utils/jwtUtils');
const { sendPasswordResetEmail } = require('../services/emailService');
const auditService = require('../services/auditService');

/**
 * Helper to resolve user permissions for standard payloads
 */
const getRolePermissions = (role) => {
  const permissionsMap = {
    SUPER_ADMIN: ['all'],
    ADMIN: ['manage_hr', 'manage_employees', 'view_reports', 'view_logs'],
    HR: ['manage_employees', 'view_reports'],
    EMPLOYEE: ['view_own_attendance'],
    KIOSK: ['mark_attendance']
  };
  return permissionsMap[role] || [];
};

/**
 * @desc    Authenticate User & Sign-in (JWT HttpOnly Cookie)
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // 1. Verify credentials present
  if (!email || !password) {
    return next(new AppError('Please provide both email and password.', 400));
  }

  // 2. Query user with password hash explicit select
  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new AppError('Invalid email or password.', 401));
  }

  // 3. Verify user is active
  if (!user.isActive) {
    return next(new AppError('Please contact to your administrative . your account has been disabled', 403));
  }

  // 4. Verify invitation setup has been finished
  if (user.mustSetupPassword) {
    return next(new AppError('Please complete your account onboarding setup before logging in.', 403));
  }

  // 5. Verify password hash matches
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new AppError('Invalid email or password.', 401));
  }

  // 6. Update lastLoginAt
  user.lastLoginAt = Date.now();
  await user.save({ validateBeforeSave: false });

  // 7. Log audit event
  auditService.logAuditAction('LOGIN', user._id, { email: user.email, role: user.role });

  // 8. Send token cookies response
  sendTokenResponse(user, 200, req, res);
});

/**
 * @desc    Verify Onboarding Token
 * @route   GET /api/v1/auth/verify-token/:token
 * @access  Public
 */
const verifySetupToken = catchAsync(async (req, res, next) => {
  const { token } = req.params;

  const user = await User.findOne({ invitationToken: token });

  if (!user) {
    return next(new AppError('Invalid invitation token.', 400));
  }

  if (!user.mustSetupPassword) {
    return res.status(200).json({
      status: 'success',
      alreadyRegistered: true,
      message: 'You are already registered.'
    });
  }

  res.status(200).json({
    status: 'success',
    alreadyRegistered: false
  });
});

/**
 * @desc    Complete Onboarding by setting up a password
 * @route   POST /api/v1/auth/setup-account
 * @access  Public
 */
const setupAccount = catchAsync(async (req, res, next) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password) {
    return next(new AppError('Invalid setup parameters. Token and password are required.', 400));
  }

  if (confirmPassword && password !== confirmPassword) {
    return next(new AppError('Passwords do not match.', 400));
  }

  // 1. Find user matching token
  const user = await User.findOne({ invitationToken: token });

  if (!user) {
    return next(new AppError('Onboarding token is invalid.', 400));
  }

  // If already registered
  if (!user.mustSetupPassword) {
    return next(new AppError('You are already registered. Please proceed to login.', 400));
  }

  // 2. Double check if deactivated
  if (!user.isActive) {
    return next(new AppError('Your account is deactivated. Onboarding setup aborted.', 403));
  }

  // 3. Update credentials and remove onboarding expiry (but keep token so we can identify them)
  user.password = password;
  user.mustSetupPassword = false;
  user.isEmailVerified = true;
  user.invitationExpiresAt = null; // Removed expiry, keep the token

  await user.save();

  // 4. Log audit event
  auditService.logAuditAction('USER_ACTIVATED', user._id, { email: user.email, role: user.role });

  // 5. Issue token response and log user in automatically
  sendTokenResponse(user, 200, req, res);
});

/**
 * @desc    Retrieve Current Authenticated User Profile with permissions
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = catchAsync(async (req, res, next) => {
  const user = req.user;
  const permissions = getRolePermissions(user.role);

  res.status(200).json({
    status: 'success',
    data: {
      user: {
        _id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        department: user.department,
        employeeId: user.employeeId,
        faceRegistered: user.faceRegistered,
        isActive: user.isActive,
        isEmailVerified: user.isEmailVerified,
        mustSetupPassword: user.mustSetupPassword,
        createdBy: user.createdBy,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        permissions
      }
    }
  });
});

/**
 * @desc    Log out, Clear cookies & record audit
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
const logout = catchAsync(async (req, res, next) => {
  // Fire audit log before session clears (requires req.user)
  if (req.user) {
    auditService.logAuditAction('LOGOUT', req.user._id, { email: req.user.email });
  }

  const cookieOptions = {
    expires: new Date(Date.now() + 1000),
    httpOnly: true,
    signed: true,
    sameSite: 'strict'
  };

  if (process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https') {
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none'; // Required for cross-site cookies
  }

  res.cookie('token', 'none', cookieOptions);

  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully.'
  });
});

/**
 * @desc    Forgot Password Request (Generate reset token and email link)
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return next(new AppError('Please provide an email address.', 400));
  }

  const user = await User.findOne({ email });

  if (!user || !user.isActive) {
    return next(new AppError('This email is invalid or does not exist. Please enter a valid email address.', 404));
  }

  // 1. Generate unhashed reset token and 1-hour expiry
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpiresAt = Date.now() + 60 * 60 * 1000; // 1 hour

  await user.save({ validateBeforeSave: false });

  // 2. Dispatch email containing token recovery link
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${clientUrl}/reset-password?token=${resetToken}`;
  
  await sendPasswordResetEmail(user, resetUrl);

  res.status(200).json({
    status: 'success',
    message: 'A password reset link has been sent to your email address.'
  });
});

/**
 * @desc    Change Password (Logged-In User)
 * @route   POST /api/v1/auth/reset-password
 * @access  Private
 */
const resetPassword = catchAsync(async (req, res, next) => {
  const { currentPassword, password, confirmPassword } = req.body;

  if (!currentPassword || !password) {
    return next(new AppError('Please provide current password and new password.', 400));
  }

  if (confirmPassword && password !== confirmPassword) {
    return next(new AppError('New passwords do not match.', 400));
  }

  // 1. Fetch user by active session ID and select the password field
  const user = await User.findById(req.user._id).select('+password');

  if (!user) {
    return next(new AppError('User session is invalid.', 401));
  }

  // 2. Verify current password matches database
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('The current password you entered is incorrect.', 401));
  }

  // 3. Update password
  user.password = password;
  await user.save();

  // 4. Log audit event
  auditService.logAuditAction('PASSWORD_RESET', user._id, { email: user.email, type: 'CHANGE_PASSWORD' });

  res.status(200).json({
    status: 'success',
    message: 'Your password has been successfully updated.'
  });
});

/**
 * @desc    Recover Password using email token (Forgotten Password Flow)
 * @route   POST /api/v1/auth/recover-password
 * @access  Public
 */
const recoverPassword = catchAsync(async (req, res, next) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password) {
    return next(new AppError('Reset token and new password are required.', 400));
  }

  if (confirmPassword && password !== confirmPassword) {
    return next(new AppError('Passwords do not match.', 400));
  }

  // 1. Find user matching token within active expiry window
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpiresAt: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('Reset token is invalid or has expired.', 400));
  }

  // 2. Verify user is active
  if (!user.isActive) {
    return next(new AppError('Your account is deactivated. Recovery aborted.', 403));
  }

  // 3. Update credentials and clear recovery fields
  user.password = password;
  user.resetPasswordToken = null;
  user.resetPasswordExpiresAt = null;
  
  await user.save();

  // 4. Log audit event
  auditService.logAuditAction('PASSWORD_RESET', user._id, { email: user.email, type: 'RECOVER_PASSWORD' });

  res.status(200).json({
    status: 'success',
    message: 'Your password has been successfully reset. You may now log in.'
  });
});

/**
 * @desc    Get current user's own authentication activity (login, logout, password changes)
 * @route   GET /api/v1/auth/my-activity
 * @access  Private (all authenticated roles)
 */
const getMyActivity = catchAsync(async (req, res, next) => {
  const logs = await SystemLog.find({
    user: req.user._id,
    type: 'AUTH'
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .select('action type createdAt details');

  res.status(200).json({
    status: 'success',
    data: { logs }
  });
});

module.exports = {
  login,
  setupAccount,
  verifySetupToken,
  getMe,
  logout,
  forgotPassword,
  resetPassword,
  recoverPassword,
  getMyActivity
};
