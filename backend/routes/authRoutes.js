const express = require('express');
const { login, setupAccount, verifySetupToken, getMe, logout, forgotPassword, resetPassword, recoverPassword, getMyActivity } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validateLogin, validateSetupAccount } = require('../validators/authValidator');
const { authLimiter } = require('../middleware/rateLimiter');

const router = express.Router();

// Apply auth rate limiter globally across all authorization routes
router.use(authLimiter);

// Public Routes
router.post('/login', validateLogin, login);
router.post('/setup-account', validateSetupAccount, setupAccount);
router.get('/verify-token/:token', verifySetupToken);
router.post('/forgot-password', forgotPassword);
router.post('/recover-password', recoverPassword);

// Protected Routes (Require active JWT token)
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.post('/reset-password', protect, resetPassword);
router.get('/my-activity', protect, getMyActivity);

module.exports = router;
