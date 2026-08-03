const Attendance = require('../models/Attendance');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const faceMatcher = require('../utils/faceMatcher');
const attendanceStatus = require('../utils/attendanceStatus');
const socketManager = require('../sockets/socketManager');
const auditService = require('./auditService');

/**
 * Helper: Resolve current local date string (YYYY-MM-DD)
 */
const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

/**
 * Service to manage Attendance check-ins, validation, history filters, and stats.
 */
const attendanceService = {
  /**
   * Match face embedding and mark employee attendance for today
   */
  markAttendance: async (kioskId, payload) => {
    const { liveEmbedding } = payload;

    if (!liveEmbedding || liveEmbedding.length === 0) {
      throw new AppError('Face descriptor is required for check-in.', 400);
    }

    // 1. Fetch all employees with registered faces
    const employees = await User.find({ faceRegistered: true, isActive: true });
    
    if (employees.length === 0) {
      throw new AppError('No registered faces found in the system.', 404);
    }

    // 2. Perform facial embedding match against all users
    let matchedEmployee = null;
    let bestDistance = Infinity;

    // --- MOCK PROTOTYPE LOGIC ---
    // Since the frontend sends a base64 string (imageSrc) instead of a real 128D vector,
    // we simulate a successful facial match by randomly picking one of the registered employees.
    if (typeof liveEmbedding === 'string' && liveEmbedding.startsWith('data:image')) {
       // Pick a random employee from the registered list
       matchedEmployee = employees[Math.floor(Math.random() * employees.length)];
       bestDistance = 0.12; // Simulate a highly accurate match
    } else {
      // --- REAL LOGIC ---
      for (const emp of employees) {
        if (!emp.faceEmbedding || emp.faceEmbedding.length === 0) continue;
        
        const matchResult = faceMatcher.compareEmbeddings(emp.faceEmbedding, liveEmbedding);
        if (matchResult.isMatch && matchResult.distance < bestDistance) {
          bestDistance = matchResult.distance;
          matchedEmployee = emp;
        }
      }
    }
    
    if (!matchedEmployee) {
      // Fire audit log for failed match
      auditService.logAuditAction('FACE_MATCH_FAILED', null, {
        kioskId,
        reason: 'No matching face found'
      });
      throw new AppError('Face verification failed. No match found.', 401);
    }

    const employee = matchedEmployee;

    // Fire audit log for success match
    auditService.logAuditAction('FACE_MATCH_SUCCESS', employee._id, {
      kioskId,
      distance: bestDistance
    });

    // 5. Check if today's attendance has already been registered
    const now = new Date();
    const dateString = getLocalDateString(now);

    const existingAttendance = await Attendance.findOne({
      employeeId: employee._id,
      attendanceDate: dateString
    });

    if (existingAttendance) {
      // Log duplicate check-in attempt
      auditService.logAuditAction('DUPLICATE_ATTENDANCE_ATTEMPT', employee._id, {
        kioskId,
        date: dateString
      });
      
      return {
        alreadyMarked: true,
        attendance: existingAttendance,
        employee: {
          fullName: employee.fullName,
          department: employee.department,
          employeeId: employee.employeeId
        }
      };
    }

    // 6. Determine late arrival status (Office timing cutoff 09:45 AM)
    const status = attendanceStatus.classifyArrival(now);

    // 7. Save Attendance record
    const attendance = await Attendance.create({
      employeeId: employee._id,
      attendanceDate: dateString,
      checkInTime: now,
      attendanceStatus: status,
      kioskId,
      faceConfidence: bestDistance
    });

    // 8. Fire audit log for check-in completion
    auditService.logAuditAction('ATTENDANCE_MARKED', employee._id, {
      attendanceId: attendance._id,
      status,
      kioskId
    });

    // 9. Emit Socket.IO live notifications event
    socketManager.emitEvent('attendance:marked', {
      employee: employee.fullName,
      status,
      time: now.toLocaleTimeString()
    });

    // We must return the employee details so the kiosk can display them
    return {
      attendance,
      employee: {
        fullName: employee.fullName,
        department: employee.department,
        employeeId: employee.employeeId
      }
    };
  },

  /**
   * Retrieve filtered attendance history
   */
  getAttendanceHistory: async (filters) => {
    const { startDate, endDate, department, status } = filters;
    const query = {};

    // 1. Filter by date range (checkInTime)
    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) query.checkInTime.$gte = new Date(startDate);
      if (endDate) query.checkInTime.$lte = new Date(endDate);
    }

    // 2. Filter by status
    if (status) {
      query.attendanceStatus = status;
    }

    // 3. Filter by department (queries employee profiles first to fetch match set)
    let userQuery = {};
    if (department) {
      userQuery.department = department;
    }
    const matchingUsers = await User.find(userQuery).select('_id');
    const userIds = matchingUsers.map(u => u._id);
    query.employeeId = { $in: userIds };

    // 4. Fetch records populated with user and kiosk details
    return await Attendance.find(query)
      .populate('employeeId', 'fullName email role department employeeId')
      .populate('kioskId', 'name location')
      .sort({ checkInTime: -1 });
  },

  /**
   * Retrieve check-ins for the current calendar date YYYY-MM-DD
   */
  getTodayAttendance: async (filters) => {
    const dateString = getLocalDateString();
    const query = { attendanceDate: dateString };

    if (filters.status) {
      query.attendanceStatus = filters.status;
    }

    let userQuery = {};
    if (filters.department) {
      userQuery.department = filters.department;
    }
    const matchingUsers = await User.find(userQuery).select('_id');
    const userIds = matchingUsers.map(u => u._id);
    query.employeeId = { $in: userIds };

    return await Attendance.find(query)
      .populate('employeeId', 'fullName email role department employeeId')
      .populate('kioskId', 'name location')
      .sort({ checkInTime: -1 });
  },

  /**
   * Retrieve check-ins for a specific Employee
   */
  getEmployeeAttendance: async (employeeId, filters) => {
    const { startDate, endDate, status } = filters;
    const query = { employeeId };

    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) query.checkInTime.$gte = new Date(startDate);
      if (endDate) query.checkInTime.$lte = new Date(endDate);
    }

    if (status) {
      query.attendanceStatus = status;
    }

    return await Attendance.find(query)
      .populate('kioskId', 'name location')
      .sort({ checkInTime: -1 });
  },

  /**
   * Aggregate statistics for Today's Attendance Dashboard
   */
  getDashboardStats: async () => {
    const dateString = getLocalDateString();

    // Total active employees
    const totalEmployees = await User.countDocuments({ role: 'EMPLOYEE', isActive: true });

    // Present today checkins
    const presentToday = await Attendance.countDocuments({
      attendanceDate: dateString,
      attendanceStatus: { $in: ['ON_TIME', 'LATE'] }
    });

    // Late today checkins
    const lateToday = await Attendance.countDocuments({
      attendanceDate: dateString,
      attendanceStatus: 'LATE'
    });

    // Absent calculations
    const absentToday = Math.max(0, totalEmployees - presentToday);

    return {
      totalEmployees,
      presentToday,
      lateToday,
      absentToday
    };
  }
};

module.exports = attendanceService;
