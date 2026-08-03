const attendanceService = require('../services/attendanceService');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Validate face matching and check-in employee from Kiosk terminal
 * @route   POST /api/v1/attendance/check-in
 * @access  Kiosk Authentication (Requires x-kiosk-id & x-kiosk-secret handshakes)
 */
const checkIn = catchAsync(async (req, res, next) => {
  try {
    // req.kiosk is resolved by authenticateKiosk middleware
    const result = await attendanceService.markAttendance(req.kiosk._id, req.body);

    if (result.alreadyMarked) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked',
        data: result
      });
    }

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @desc    Retrieve logged-in user's check-in history
 * @route   GET /api/v1/attendance/my-history
 * @access  Private (Employee, HR, Admin, Super Admin)
 */
const getMyHistory = catchAsync(async (req, res, next) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    status: req.query.status
  };

  const records = await attendanceService.getEmployeeAttendance(req.user._id, filters);

  res.status(200).json({
    status: 'success',
    results: records.length,
    data: {
      attendance: records
    }
  });
});

/**
 * @desc    Retrieve target employee's check-in history
 * @route   GET /api/v1/attendance/employee/:employeeId
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const getEmployeeHistory = catchAsync(async (req, res, next) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    status: req.query.status
  };

  const records = await attendanceService.getEmployeeAttendance(req.params.employeeId, filters);

  res.status(200).json({
    status: 'success',
    results: records.length,
    data: {
      attendance: records
    }
  });
});

/**
 * @desc    Retrieve today's active check-ins
 * @route   GET /api/v1/attendance/today
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const getTodayAttendance = catchAsync(async (req, res, next) => {
  const filters = {
    department: req.query.department,
    status: req.query.status
  };

  const records = await attendanceService.getTodayAttendance(filters);

  res.status(200).json({
    status: 'success',
    results: records.length,
    data: {
      attendance: records
    }
  });
});

/**
 * @desc    Retrieve all filtered check-ins
 * @route   GET /api/v1/attendance/all
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const getAllAttendance = catchAsync(async (req, res, next) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    status: req.query.status,
    department: req.query.department
  };

  const records = await attendanceService.getAttendanceHistory(filters);

  res.status(200).json({
    status: 'success',
    results: records.length,
    data: {
      attendance: records
    }
  });
});

/**
 * @desc    Get dashboard metrics for today's check-ins
 * @route   GET /api/v1/attendance/stats
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const getDashboardStats = catchAsync(async (req, res, next) => {
  const stats = await attendanceService.getDashboardStats();

  res.status(200).json({
    status: 'success',
    data: stats
  });
});

module.exports = {
  checkIn,
  getMyHistory,
  getEmployeeHistory,
  getTodayAttendance,
  getAllAttendance,
  getDashboardStats
};
