const { createObjectCsvStringifier } = require('csv-writer');
const PDFDocument = require('pdfkit');
const reportService = require('../services/reportService');
const attendanceService = require('../services/attendanceService');
const catchAsync = require('../utils/catchAsync');
const auditService = require('../services/auditService');

/**
 * @desc    Get weekly late arrival alerts list
 * @route   GET /api/v1/reports/weekly
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const getWeeklyReport = catchAsync(async (req, res, next) => {
  const data = await reportService.generateWeeklyLateReport();
  res.status(200).json({
    status: 'success',
    results: data.length,
    data
  });
});

/**
 * @desc    Get monthly summary aggregates for all active employees
 * @route   GET /api/v1/reports/monthly
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const getMonthlyReport = catchAsync(async (req, res, next) => {
  const data = await reportService.generateMonthlySummary();
  res.status(200).json({
    status: 'success',
    results: data.length,
    data
  });
});

/**
 * @desc    Get attendance rate percentages and filters
 * @route   GET /api/v1/reports/analytics
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const getAnalytics = catchAsync(async (req, res, next) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    department: req.query.department
  };

  const data = await reportService.generateAttendanceAnalytics(filters);

  // Fire audit log
  auditService.logAuditAction('REPORT_GENERATED', req.user._id, filters);

  res.status(200).json({
    status: 'success',
    data
  });
});

/**
 * @desc    Export attendance data as CSV attachment
 * @route   GET /api/v1/reports/export/csv
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const exportCSV = catchAsync(async (req, res, next) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    department: req.query.department,
    status: req.query.status
  };

  // 1. Fetch filtered records
  const records = await attendanceService.getAttendanceHistory(filters);

  // 2. Setup CSV Writer Stringifier
  const csvStringifier = createObjectCsvStringifier({
    header: [
      { id: 'employee', title: 'Employee' },
      { id: 'date', title: 'Date' },
      { id: 'status', title: 'Status' },
      { id: 'checkInTime', title: 'Check-In Time' }
    ]
  });

  // 3. Map records
  const mappedData = records.map(rec => ({
    employee: rec.employeeId ? rec.employeeId.fullName : 'Unknown Employee',
    date: rec.attendanceDate,
    status: rec.attendanceStatus,
    checkInTime: rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : 'N/A'
  }));

  // 4. Generate CSV
  const header = csvStringifier.getHeaderString();
  const body = csvStringifier.stringifyRecords(mappedData);
  const csvString = header + body;

  // 5. Fire audit log
  auditService.logAuditAction('CSV_EXPORTED', req.user._id, { count: records.length });

  // 6. Set headers and stream response
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance_export.csv"');
  res.status(200).send(csvString);
});

/**
 * @desc    Export attendance summary as PDF attachment
 * @route   GET /api/v1/reports/export/pdf
 * @access  Private (SUPER_ADMIN, ADMIN, HR)
 */
const exportPDF = catchAsync(async (req, res, next) => {
  const filters = {
    startDate: req.query.startDate,
    endDate: req.query.endDate,
    department: req.query.department,
    status: req.query.status
  };

  // 1. Fetch filtered records
  const records = await attendanceService.getAttendanceHistory(filters);

  // 2. Set headers for PDF streaming
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename="attendance_report.pdf"');

  // 3. Create PDF kit document
  const doc = new PDFDocument({ margin: 50 });
  doc.pipe(res);

  // 4. Draw Header
  doc.fillColor('#2c3e50').fontSize(22).text('Smart Attendance Report', { align: 'center' });
  doc.fontSize(10).fillColor('#7f8c8d').text(`Generated on: ${new Date().toLocaleString()}`, { align: 'center' });
  doc.moveDown(2);

  // 5. Draw Filters summary box
  doc.fillColor('#2c3e50').fontSize(12).text('Report Criteria:', { underline: true });
  doc.fontSize(10).fillColor('#34495e').text(`- Department: ${filters.department || 'All'}`);
  doc.text(`- Date Range: ${filters.startDate || 'Beginning'} to ${filters.endDate || 'Today'}`);
  doc.text(`- Records Found: ${records.length}`);
  doc.moveDown(2);

  // 6. Generate simple visual list table
  doc.fontSize(12).fillColor('#2c3e50').text('Check-In Records Summary', { underline: true });
  doc.moveDown(0.5);

  let y = doc.y;
  // Table headers
  doc.fontSize(10).fillColor('#7f8c8d');
  doc.text('Employee', 50, y);
  doc.text('Department', 200, y);
  doc.text('Date', 320, y);
  doc.text('Check-In', 420, y);
  doc.text('Status', 500, y);

  doc.strokeColor('#bdc3c7').lineWidth(1).moveTo(50, y + 15).lineTo(550, y + 15).stroke();
  doc.moveDown(1);

  // Print records
  doc.fillColor('#2c3e50');
  records.forEach((rec) => {
    // If y exceeds page margin, add a page
    if (doc.y > 700) {
      doc.addPage();
      y = 50;
      doc.strokeColor('#bdc3c7').lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
      doc.moveDown(1);
    }

    const currentY = doc.y;
    const name = rec.employeeId ? rec.employeeId.fullName : 'Unknown';
    const dept = rec.employeeId ? rec.employeeId.department : 'N/A';
    const date = rec.attendanceDate;
    const time = rec.checkInTime ? new Date(rec.checkInTime).toLocaleTimeString() : 'N/A';
    const status = rec.attendanceStatus;

    doc.text(name, 50, currentY);
    doc.text(dept, 200, currentY);
    doc.text(date, 320, currentY);
    doc.text(time, 420, currentY);

    if (status === 'LATE') {
      doc.fillColor('#c0392b');
    } else if (status === 'ABSENT') {
      doc.fillColor('#7f8c8d');
    } else {
      doc.fillColor('#27ae60');
    }
    doc.text(status, 500, currentY);
    doc.fillColor('#2c3e50'); // Reset color

    doc.moveDown(1);
  });

  // 7. Fire audit log
  auditService.logAuditAction('PDF_EXPORTED', req.user._id, { count: records.length });

  // 8. End PDF Generation
  doc.end();
});

module.exports = {
  getWeeklyReport,
  getMonthlyReport,
  getAnalytics,
  exportCSV,
  exportPDF
};
