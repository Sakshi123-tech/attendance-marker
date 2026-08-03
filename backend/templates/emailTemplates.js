/**
 * HTML Email Templates Generator
 */
const emailTemplates = {
  /**
   * Weekly Late Report HTML template
   */
  weeklyLateReport: (lateEmployees, generatedDate = new Date().toDateString()) => {
    let tableRows = '';
    
    if (lateEmployees.length === 0) {
      tableRows = `
        <tr>
          <td colspan="4" style="padding: 12px; text-align: center; color: #7f8c8d; border-bottom: 1px solid #e0e0e0;">
            No late arrivals detected this week. Excellent job!
          </td>
        </tr>
      `;
    } else {
      lateEmployees.forEach(emp => {
        tableRows += `
          <tr>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: left; color: #2c3e50;">${emp.fullName}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: left; color: #7f8c8d;">${emp.email}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: left; color: #2980b9;">${emp.department}</td>
            <td style="padding: 12px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold; color: #c0392b;">${emp.lateCount}</td>
          </tr>
        `;
      });
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 3px solid #2980b9; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0; font-size: 24px;">Smart Attendance System</h2>
          <span style="color: #7f8c8d; font-size: 13px;">Automated Late Arrival Analytics</span>
        </div>
        
        <p style="color: #34495e;">Dear Administrator / HR Specialist,</p>
        <p style="color: #34495e;">Please find below the list of employees with **3 or more late arrivals** recorded during this calendar week.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 25px 0; font-size: 14px;">
          <thead>
            <tr style="background-color: #f8f9fa; border-bottom: 2px solid #bdc3c7;">
              <th style="padding: 12px; text-align: left; color: #34495e;">Employee</th>
              <th style="padding: 12px; text-align: left; color: #34495e;">Email</th>
              <th style="padding: 12px; text-align: left; color: #34495e;">Department</th>
              <th style="padding: 12px; text-align: right; color: #34495e;">Late Count</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin-bottom: 25px;">
          <p style="margin: 0; color: #7f8c8d; font-size: 12px;">
            <strong>Analysis Period:</strong> Monday to Friday (Current Week)<br>
            <strong>Generated On:</strong> ${generatedDate}
          </p>
        </div>

        <p style="color: #7f8c8d; font-size: 12px; line-height: 1.5;">
          This is an automated report dispatched by the Smart Attendance Engine. To view detailed check-in timestamps, logs, and trends, please access the Super Admin Dashboard.
        </p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="text-align: center; color: #bdc3c7; font-size: 11px; margin: 0;">&copy; Smart Attendance Portal</p>
      </div>
    `;
  },

  /**
   * Monthly Summary Email HTML template
   */
  monthlySummaryEmail: (monthName, generatedDate = new Date().toDateString()) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff;">
        <div style="text-align: center; border-bottom: 3px solid #27ae60; padding-bottom: 15px; margin-bottom: 20px;">
          <h2 style="color: #2c3e50; margin: 0; font-size: 24px;">Smart Attendance System</h2>
          <span style="color: #7f8c8d; font-size: 13px;">Monthly Summary Reports Release</span>
        </div>
        
        <p style="color: #34495e;">Dear Administrator / HR Specialist,</p>
        <p style="color: #34495e;">The system has automatically generated the complete **Monthly Attendance Summary Report** for **${monthName}**.</p>
        
        <p style="color: #34495e;">We have attached a fully detailed PDF document containing each employee's metrics:
          <ul style="color: #34495e; line-height: 1.6;">
            <li>Total Present Days</li>
            <li>Total Late Days</li>
            <li>Total Absent Days</li>
            <li>Aggregated Attendance Percentage</li>
          </ul>
        </p>

        <div style="background-color: #f1f9f5; border-left: 4px solid #27ae60; padding: 15px; margin: 25px 0; border-radius: 0 4px 4px 0;">
          <p style="margin: 0; color: #27ae60; font-weight: bold; font-size: 14px;">PDF Attachment Available</p>
          <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 12px;">
            Please open the attached PDF file: <strong>Attendance_Summary_${monthName}.pdf</strong>
          </p>
        </div>

        <p style="color: #7f8c8d; font-size: 12px; line-height: 1.5;">
          This email and the attached report were generated on ${generatedDate}. Please review and archive the summary.
        </p>
        <hr style="border: 0; border-top: 1px solid #e0e0e0; margin: 20px 0;">
        <p style="text-align: center; color: #bdc3c7; font-size: 11px; margin: 0;">&copy; Smart Attendance Portal</p>
      </div>
    `;
  }
};

module.exports = emailTemplates;
