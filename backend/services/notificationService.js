const nodemailer = require('nodemailer');
const socketManager = require('../sockets/socketManager');
const emailTemplates = require('../templates/emailTemplates');
const auditService = require('./auditService');

/**
 * Configure SMTP Transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Service to manage system notifications, real-time socket events, and report emails.
 */
const notificationService = {
  /**
   * Email Weekly Late Report to Admin/HR recipients
   */
  sendWeeklyLateReport: async (recipients, lateEmployees) => {
    if (!recipients || recipients.length === 0) return;

    const transporter = createTransporter();
    const htmlContent = emailTemplates.weeklyLateReport(lateEmployees);

    const mailOptions = {
      from: `"Smart Attendance System" <${process.env.EMAIL_USER}>`,
      to: recipients.join(','),
      subject: 'Weekly Late Arrival Alert Summary',
      html: htmlContent
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Notification] Weekly Late Report emailed to: ${recipients.join(', ')}. MsgID: ${info.messageId}`);
      
      // Fire audit log
      auditService.logAuditAction('LATE_REPORT_SENT', 'SYSTEM', { recipients });
      
      // Emit socket notification
      socketManager.emitEvent('report:generated', {
        type: 'weekly_late',
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error(`[Notification] Error emailing weekly late report: ${error.message}`);
      return false;
    }
  },

  /**
   * Email Monthly Summary Report with PDF attachment
   */
  sendMonthlySummary: async (recipients, monthName, pdfBuffer) => {
    if (!recipients || recipients.length === 0 || !pdfBuffer) return;

    const transporter = createTransporter();
    const htmlContent = emailTemplates.monthlySummaryEmail(monthName);

    const mailOptions = {
      from: `"Smart Attendance System" <${process.env.EMAIL_USER}>`,
      to: recipients.join(','),
      subject: `Monthly Attendance Summary Report - ${monthName}`,
      html: htmlContent,
      attachments: [
        {
          filename: `Attendance_Summary_${monthName}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`[Notification] Monthly Report emailed with PDF to: ${recipients.join(', ')}. MsgID: ${info.messageId}`);
      
      // Fire audit log
      auditService.logAuditAction('MONTHLY_REPORT_SENT', 'SYSTEM', { recipients, month: monthName });
      
      // Emit socket notification
      socketManager.emitEvent('report:generated', {
        type: 'monthly_summary',
        month: monthName,
        timestamp: new Date()
      });

      return true;
    } catch (error) {
      console.error(`[Notification] Error emailing monthly report: ${error.message}`);
      return false;
    }
  },

  /**
   * Broadcast real-time alerts and trigger socket events
   */
  sendAttendanceAlert: (alertType, data) => {
    // Standard alert types: 'employee:late', 'employee:absent'
    if (['employee:late', 'employee:absent'].includes(alertType)) {
      socketManager.emitEvent(alertType, data);
      console.log(`[Notification] Real-Time Alert [${alertType}] Broadcasted: ${JSON.stringify(data)}`);
    } else {
      console.warn(`[Notification] Warning: Untracked alert type received: ${alertType}`);
    }
  }
};

module.exports = notificationService;
