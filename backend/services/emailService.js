const nodemailer = require('nodemailer');

/**
 * Configure Nodemailer Transporter
 * Integrates with SMTP configuration provided in environment variables
 */
const createTransporter = () => {
  if (process.env.RESEND_API) {
    // Use Resend SMTP if API key is provided
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 465,
      secure: true,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API
      }
    });
  }

  // Fallback to generic SMTP (like Gmail)
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Send onboarding email to new Admin, HR, or Employee
 * 
 * @param {Object} user - Target user object
 * @param {String} setupUrl - Path or URL to set up credentials
 */
const getFromAddress = () => {
  if (process.env.RESEND_API) {
    return '"Smart Attendance System" <onboarding@resend.dev>';
  }
  return `"Smart Attendance System" <${process.env.EMAIL_USER}>`;
};

const sendOnboardingEmail = async (user, setupUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: getFromAddress(),
    to: user.email,
    subject: 'Welcome! Complete Your Smart Attendance Account Setup',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Welcome to the Team, ${user.fullName}!</h2>
        <p>Hello,</p>
        <p>An account has been created for you on the <strong>AI-Powered Smart Attendance & Access Management System</strong>.</p>
        <p>Your designated role is: <strong>${user.role}</strong></p>
        <p>Your unique Employee ID is: <strong>${user.employeeId}</strong></p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${setupUrl}" style="background-color: #3498db; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Set Up Your Password & Face ID</a>
        </div>
        
        <p style="color: #7f8c8d; font-size: 13px;">This setup link is secure, single-use, and will expire shortly. Please do not share this email with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="text-align: center; color: #95a5a6; font-size: 12px;">Automated onboarding transmission. Please do not reply directly.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Onboarding email sent successfully to ${user.email}. MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Error sending onboarding email: ${error.message}`);
    console.log(`\n\n--- [DEVELOPMENT FALLBACK] SETUP URL FOR ${user.email} ---\n${setupUrl}\n---------------------------------------------------------\n\n`);
    return false;
  }
};

/**
 * Send automated attendance reports to Admin/HR
 * 
 * @param {String} recipientEmail - Target recipient email
 * @param {String} reportType - 'Weekly Late' or 'Monthly Summary'
 * @param {Object} reportData - Report stats and details
 */
const sendAttendanceReport = async (recipientEmail, reportType, reportData) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: getFromAddress(),
    to: recipientEmail,
    subject: `Automated Report: ${reportType} Attendance Analysis`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">${reportType} Report</h2>
        <p>Dear Administrator / HR Specialist,</p>
        <p>Please find the automatically compiled system report for <strong>${reportType}</strong> analytics.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f2f2f2; border-bottom: 1px solid #e0e0e0;">
              <th style="padding: 10px; text-align: left;">Metric</th>
              <th style="padding: 10px; text-align: right;">Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">Total Active Employees</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${reportData.totalEmployees || 0}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">Total Checked-In Days</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">${reportData.totalCheckIns || 0}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0;">Late Arrivals Detected</td>
              <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold; color: #e74c3c;">${reportData.totalLate || 0}</td>
            </tr>
          </tbody>
        </table>

        <p>Full dashboards and audit logs are accessible via the main Super Admin console.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="text-align: center; color: #95a5a6; font-size: 11px;">Generated by AI-Powered Attendance Analytics Scheduler.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] ${reportType} report dispatched to ${recipientEmail}. MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Error sending ${reportType} report: ${error.message}`);
    return false;
  }
};

/**
 * Send password reset recovery link to target email
 * 
 * @param {Object} user - Target user object
 * @param {String} resetUrl - Recovery path containing token
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: getFromAddress(),
    to: user.email,
    subject: 'Password Reset Request - Smart Attendance System',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #2c3e50; text-align: center;">Reset Your Password</h2>
        <p>Hello ${user.fullName},</p>
        <p>You are receiving this email because a password reset request was initiated for your account.</p>
        <p>Click the link below to set a new password. This link is only active for 1 hour.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #e74c3c; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        
        <p>If you did not make this request, you can safely ignore this email and your password will remain unchanged.</p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="text-align: center; color: #95a5a6; font-size: 12px;">Automated security notification. Please do not reply directly.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email] Password reset email sent successfully to ${user.email}. MessageID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`[Email] Error sending password reset email: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendOnboardingEmail,
  sendAttendanceReport,
  sendPasswordResetEmail
};
