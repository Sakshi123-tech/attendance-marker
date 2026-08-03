const Attendance = require('../models/Attendance');
const User = require('../models/User');
const AppError = require('../utils/AppError');

/**
 * Service to calculate attendance analytics, compile summaries, and generate reporting objects.
 */
const reportService = {
  /**
   * Find employees with 3 or more late check-ins during the current week
   */
  generateWeeklyLateReport: async () => {
    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? 6 : currentDay - 1;
    
    // Monday at 00:00:00
    const startOfWeek = new Date(now.setDate(now.getDate() - distanceToMonday));
    startOfWeek.setHours(0, 0, 0, 0);

    // Aggregate query to group and filter lates
    const lateStats = await Attendance.aggregate([
      {
        $match: {
          checkInTime: { $gte: startOfWeek },
          attendanceStatus: 'LATE'
        }
      },
      {
        $group: {
          _id: '$employeeId',
          lateCount: { $sum: 1 }
        }
      },
      {
        $match: {
          lateCount: { $gte: 3 }
        }
      }
    ]);

    const results = [];
    for (const stat of lateStats) {
      const user = await User.findById(stat._id).select('fullName email department');
      if (user) {
        results.push({
          fullName: user.fullName,
          email: user.email,
          department: user.department,
          lateCount: stat.lateCount
        });
      }
    }

    return results;
  },

  /**
   * Calculate Present, Late, Absent, and Percentages for all active employees for current month
   */
  generateMonthlySummary: async () => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Fetch active employees
    const employees = await User.find({ role: 'EMPLOYEE', isActive: true });
    
    const summary = [];
    for (const emp of employees) {
      // Find all records for this employee during the month
      const records = await Attendance.find({
        employeeId: emp._id,
        checkInTime: { $gte: startOfMonth, $lte: endOfMonth }
      });

      let presentDays = 0;
      let lateDays = 0;
      let absentDays = 0;

      records.forEach(rec => {
        if (rec.attendanceStatus === 'ON_TIME') {
          presentDays++;
        } else if (rec.attendanceStatus === 'LATE') {
          presentDays++;
          lateDays++;
        } else if (rec.attendanceStatus === 'ABSENT') {
          absentDays++;
        }
      });

      const totalDays = presentDays + absentDays;
      const attendancePercentage = totalDays > 0 
        ? Math.round((presentDays / totalDays) * 100) 
        : 100;

      summary.push({
        fullName: emp.fullName,
        email: emp.email,
        department: emp.department,
        presentDays,
        lateDays,
        absentDays,
        attendancePercentage
      });
    }

    return summary;
  },

  /**
   * Compile high-level attendance percentage analytics across date range
   */
  generateAttendanceAnalytics: async (filters) => {
    const { startDate, endDate, department } = filters;
    const query = {};

    // 1. Build date query
    if (startDate || endDate) {
      query.checkInTime = {};
      if (startDate) query.checkInTime.$gte = new Date(startDate);
      if (endDate) query.checkInTime.$lte = new Date(endDate);
    }

    // 2. Build user filter mapping
    let userQuery = {};
    if (department) {
      userQuery.department = department;
    }
    const matchingUsers = await User.find(userQuery).select('_id');
    const userIds = matchingUsers.map(u => u._id);
    query.employeeId = { $in: userIds };

    // 3. Count matching user records
    const totalEmployees = await User.countDocuments({ role: 'EMPLOYEE', isActive: true });
    const totalAttendanceRecords = await Attendance.countDocuments(query);

    const presentCount = await Attendance.countDocuments({
      ...query,
      attendanceStatus: { $in: ['ON_TIME', 'LATE'] }
    });

    const lateCount = await Attendance.countDocuments({
      ...query,
      attendanceStatus: 'LATE'
    });

    const absentCount = await Attendance.countDocuments({
      ...query,
      attendanceStatus: 'ABSENT'
    });

    // 4. Calculate rate percentages
    const totalExpected = presentCount + absentCount;
    
    const attendanceRate = totalExpected > 0 
      ? parseFloat(((presentCount / totalExpected) * 100).toFixed(2)) 
      : 100.0;

    const lateRate = presentCount > 0 
      ? parseFloat(((lateCount / presentCount) * 100).toFixed(2)) 
      : 0.0;

    const absentRate = totalExpected > 0 
      ? parseFloat(((absentCount / totalExpected) * 100).toFixed(2)) 
      : 0.0;

    return {
      attendanceRate,
      lateRate,
      absentRate,
      totalEmployees,
      totalAttendanceRecords
    };
  }
};

module.exports = reportService;
