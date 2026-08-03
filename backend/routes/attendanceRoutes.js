const express = require('express');
const { checkIn, getMyHistory, getEmployeeHistory, getTodayAttendance, getAllAttendance, getDashboardStats } = require('../controllers/attendanceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { authenticateKiosk } = require('../middleware/kioskMiddleware');
const { validateCheckIn } = require('../validators/attendanceValidator');

const router = express.Router();

// 1. Kiosk Authenticated Check-In Route (Requires hardware handshake headers, no user login)
router.post('/check-in', authenticateKiosk, validateCheckIn, checkIn);

// 2. User Protected routes (Require active user session)
router.use(protect);

// Employee accessibility: retrieve own history log
router.get('/my-history', getMyHistory);

// Admin / HR restricted routes: retrieve team logs and metrics
router.use(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'HR'));

router.get('/employee/:employeeId', getEmployeeHistory);
router.get('/today', getTodayAttendance);
router.get('/all', getAllAttendance);
router.get('/stats', getDashboardStats);

module.exports = router;
