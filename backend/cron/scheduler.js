const User = require('../models/User');
const { sendAttendanceReport } = require('../services/emailService');

/**
 * Safe timeout/interval helpers to prevent TimeoutOverflowWarning for delays > 2147483647 ms
 */
const setSafeTimeout = (callback, delay, state = { id: null }) => {
  const MAX_INT = 2147483647;
  if (delay > MAX_INT) {
    state.id = setTimeout(() => {
      setSafeTimeout(callback, delay - MAX_INT, state);
    }, MAX_INT);
  } else {
    state.id = setTimeout(callback, delay);
  }
  return state;
};

const setSafeInterval = (callback, delay) => {
  const state = { id: null };
  const loop = () => {
    setSafeTimeout(() => {
      callback();
      loop();
    }, delay, state);
  };
  loop();
  return {
    clear: () => clearTimeout(state.id)
  };
};

/**
 * Smart Attendance Automated Scheduler (Cron Simulator)
 * Executes weekly and monthly administrative reports
 */
const initScheduler = () => {
  console.log('[Scheduler] Cron background reporting intervals initialized successfully');

  // 1. Weekly late report scheduler interval (Simulated every 7 days)
  // In dynamic systems, this runs a daily check or a specific cron string (e.g., Sunday midnight)
  const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  setSafeInterval(async () => {
    try {
      console.log('[Scheduler] Initiating weekly late attendance analysis...');
      await runWeeklyLateReport();
    } catch (err) {
      console.error(`[Scheduler] Weekly report error: ${err.message}`);
    }
  }, ONE_WEEK_MS);

  // 2. Monthly attendance summary scheduler interval (Simulated every 30 days)
  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
  setSafeInterval(async () => {
    try {
      console.log('[Scheduler] Initiating monthly attendance summary analysis...');
      await runMonthlySummaryReport();
    } catch (err) {
      console.error(`[Scheduler] Monthly report error: ${err.message}`);
    }
  }, ONE_MONTH_MS);
};

/**
 * Execute Weekly Late Report analysis and email target administrators
 */
const runWeeklyLateReport = async () => {
  // Query all active HR and ADMIN addresses to receive reports
  const recipients = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, isActive: true }).select('email');
  
  if (recipients.length === 0) return;

  const totalEmployees = await User.countDocuments({ role: 'EMPLOYEE', isActive: true });

  // Dummy analytics for the initial structure - will fetch from real database aggregation
  const reportData = {
    totalEmployees: totalEmployees || 12,
    totalCheckIns: 56,
    totalLate: 4 // Sample stats
  };

  for (const admin of recipients) {
    await sendAttendanceReport(admin.email, 'Weekly Late Attendance', reportData);
  }
};

/**
 * Execute Monthly Summary Report analysis and email target administrators
 */
const runMonthlySummaryReport = async () => {
  const recipients = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN'] }, isActive: true }).select('email');
  
  if (recipients.length === 0) return;

  const totalEmployees = await User.countDocuments({ role: 'EMPLOYEE', isActive: true });

  const reportData = {
    totalEmployees: totalEmployees || 12,
    totalCheckIns: 240,
    totalLate: 18
  };

  for (const admin of recipients) {
    await sendAttendanceReport(admin.email, 'Monthly Attendance Summary', reportData);
  }
};

module.exports = {
  initScheduler,
  runWeeklyLateReport,
  runMonthlySummaryReport
};
