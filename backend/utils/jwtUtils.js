const jwt = require('jsonwebtoken');


const generateAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};


const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const sendTokenResponse = (user, statusCode, req, res) => {
  // 1. Generate access token with user identifier and role
  const token = generateAccessToken({ id: user._id, role: user.role });

  // 2. Set Cookie Options for enterprise-level security
  const cookieOptions = {
    // Expires converts JWT_EXPIRE (e.g., 7d) into milliseconds
    expires: new Date(
      Date.now() + parseInt(process.env.JWT_EXPIRE || '7', 10) * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // Prevents client-side scripts from reading the cookie (mitigates XSS)
    signed: true,   // Signs the cookie using COOKIE_SECRET to detect tempering
    sameSite: 'strict', // Mitigates Cross-Site Request Forgery (CSRF)
  };

  // Enable Secure flag (HTTPS only) in production environment
  if (process.env.NODE_ENV === 'production' || req.secure || req.headers['x-forwarded-proto'] === 'https') {
    cookieOptions.secure = true;
    cookieOptions.sameSite = 'none'; // Required for cross-site cookies
  }

  // 3. Attach token to cookie
  res.cookie('token', token, cookieOptions);

  // 4. Define dynamic permissions for RBAC validation
  const permissionsMap = {
    SUPER_ADMIN: ['all'],
    ADMIN: ['manage_hr', 'manage_employees', 'view_reports', 'view_logs'],
    HR: ['manage_employees', 'view_reports'],
    EMPLOYEE: ['view_own_attendance'],
    KIOSK: ['mark_attendance']
  };
  const permissions = permissionsMap[user.role] || [];

  // Exclude sensitive credentials fields
  const userResponseObj = {
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
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    permissions
  };

  // 5. Send cookie-only response, omitting plain-text token from body
  res.status(statusCode).json({
    status: 'success',
    data: {
      user: userResponseObj
    }
  });
};

module.exports = {
  generateAccessToken,
  verifyToken,
  sendTokenResponse,
};
