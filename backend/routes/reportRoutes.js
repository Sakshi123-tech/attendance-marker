const express = require('express');
const { getWeeklyReport, getMonthlyReport, getAnalytics, exportCSV, exportPDF } = require('../controllers/reportController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply auth protection and restrict report queries to Admin/HR roles
router.use(protect);
router.use(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'HR'));

// Reporting Endpoints
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/analytics', getAnalytics);

// Data Export Endpoints
router.get('/export/csv', exportCSV);
router.get('/export/pdf', exportPDF);

module.exports = router;
