const cron = require('node-cron');
const PDFDocument = require('pdfkit');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const reportService = require('../services/reportService');
const notificationService = require('../services/notificationService');
const auditService = require('../services/auditService');

/**
 * Resolve local date string (YYYY-MM-DD)
 */
const getLocalDateString = (date = new Date()) => {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - (offset * 60 * 1000));
  return localDate.toISOString().split('T')[0];
};

/**
 * Helper: Generate PDF Buffer for Monthly Summary
 */
const generateMonthlyPDFBuffer = (summaryData, monthName) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    doc.on('data', chunk => buffers.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(buffers)));
    doc.on('error', err => reject(err));

    // Draw header
    doc.fillColor('#2c3e50').fontSize(20).text(`Smart Attendance Monthly Summary`, { align: 'center' });
    doc.fontSize(12).fillColor('#7f8c8d').text(`Report Month: ${monthName} | Generated: ${new Date().toDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Render list
    doc.fontSize(12).fillColor('#2c3e50').text('Employee Attendance Roster', { underline: true });
    doc.moveDown(0.5);

    let y = doc.y;
    doc.fontSize(9).fillColor('#7f8c8d');
    doc.text('Employee', 40, y);
    doc.text('Department', 180, y);
    doc.text('Presents', 280, y);
    doc.text('Lates', 340, y);
    doc.text('Absents', 400, y);
    doc.text('Rate (%)', 460, y);

    doc.strokeColor('#bdc3c7').lineWidth(1).moveTo(40, y + 15).lineTo(540, y + 15).stroke();
    doc.moveDown(1);

    doc.fillColor('#2c3e50');
    summaryData.forEach(row => {
      if (doc.y > 720) {
        doc.addPage();
        y = 40;
        doc.strokeColor('#bdc3c7').lineWidth(1).moveTo(40, y).lineTo(540, y).stroke();
        doc.moveDown(1);
      }

      const currentY = doc.y;
      doc.text(row.fullName, 40, currentY);
      doc.text(row.department, 180, currentY);
      doc.text(row.presentDays.toString(), 280, currentY);
      doc.text(row.lateDays.toString(), 340, currentY);
      doc.text(row.absentDays.toString(), 400, currentY);
      doc.text(`${row.attendancePercentage}%`, 460, currentY);

      doc.moveDown(1);
    });

    doc.end();
  });
};

/**
 * Configure Scheduled Background Cron Tasks
 */
const initCronJobs = () => {
  console.log('[Scheduler] node-cron reporting & automation engine loaded successfully');

  // 1. Daily Absentee Generator - runs daily at 11:59 PM (cron: 59 23 * * *)
  cron.schedule('59 23 * * *', async () => {
    try {
      console.log('[Scheduler] Executing daily absence calculations...');
      const dateString = getLocalDateString();

      // Get all active employees
      const activeEmployees = await User.find({ role: 'EMPLOYEE', isActive: true });
      
      // Get all marked user check-ins today
      const todaysAttendances = await Attendance.find({ attendanceDate: dateString });
      const markedUserIds = new Set(todaysAttendances.map(a => a.employeeId.toString()));

      let absentCount = 0;

      for (const emp of activeEmployees) {
        if (!markedUserIds.has(emp._id.toString())) {
          // Verify to prevent Mongoose schema validation duplicate errors
          const alreadyCreated = await Attendance.findOne({ employeeId: emp._id, attendanceDate: dateString });
          if (!alreadyCreated) {
            // Create ABSENT log entry
            await Attendance.create({
              employeeId: emp._id,
              attendanceDate: dateString,
              checkInTime: new Date(),
              attendanceStatus: 'ABSENT',
              kioskId: null, // No kiosk was used
              faceConfidence: 0.0 // Mapped confidence to 0
            });

            absentCount++;

            // Emit Socket notification
            notificationService.sendAttendanceAlert('employee:absent', {
              employee: emp.fullName,
              email: emp.email,
              department: emp.department,
              time: new Date().toLocaleTimeString()
            });
          }
        }
      }

      console.log(`[Scheduler] Absence calculations completed. Auto-registered: ${absentCount} absents.`);
      
      if (absentCount > 0) {
        auditService.logAuditAction('AUTO_ABSENT_GENERATED', 'SYSTEM', { count: absentCount, date: dateString });
      }
    } catch (error) {
      console.error(`[Scheduler] Daily Absent Job Exception: ${error.message}`);
    }
  });

  // 2. Weekly Late Reporter - runs every Friday at 6:00 PM (cron: 0 18 * * 5)
  cron.schedule('0 18 * * 5', async () => {
    try {
      console.log('[Scheduler] Generating weekly late summaries...');
      
      const lateEmployees = await reportService.generateWeeklyLateReport();
      const adminUsers = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'HR'] }, isActive: true }).select('email');
      const recipients = adminUsers.map(adm => adm.email);

      if (recipients.length > 0 && lateEmployees.length > 0) {
        await notificationService.sendWeeklyLateReport(recipients, lateEmployees);
      }
    } catch (error) {
      console.error(`[Scheduler] Weekly Late Reporter Exception: ${error.message}`);
    }
  });

  // 3. Monthly Report Dispatcher - runs daily at 11:50 PM near month-ends, checking last-day matches (cron: 50 23 28-31 * *)
  cron.schedule('50 23 28-31 * *', async () => {
    try {
      const now = new Date();
      const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
      
      // If tomorrow is day 1, today is indeed the last day of the month
      const isLastDay = tomorrow.getDate() === 1;
      if (!isLastDay) return;

      console.log('[Scheduler] Month-end detected. Generating monthly summaries...');

      const summaryData = await reportService.generateMonthlySummary();
      const adminUsers = await User.find({ role: { $in: ['ADMIN', 'SUPER_ADMIN', 'HR'] }, isActive: true }).select('email');
      const recipients = adminUsers.map(adm => adm.email);

      const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      const monthName = `${months[now.getMonth()]} ${now.getFullYear()}`;

      if (recipients.length > 0 && summaryData.length > 0) {
        // Compile PDF buffer
        const pdfBuffer = await generateMonthlyPDFBuffer(summaryData, monthName);
        // Send email with attachment
        await notificationService.sendMonthlySummary(recipients, monthName, pdfBuffer);
      }
    } catch (error) {
      console.error(`[Scheduler] Monthly Summary Scheduler Exception: ${error.message}`);
    }
  });
};

module.exports = {
  initCronJobs
};
