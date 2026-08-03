const express = require('express');
const { createEmployee, updateEmployee, deactivateEmployee, listEmployees, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { validateCreateEmployee } = require('../validators/authValidator');

const router = express.Router();

// Apply authentication shield across all employee routes
router.use(protect);

// Apply Role-Based Access Control: restrict employee management to SUPER_ADMIN, ADMIN, and HR
router.use(authorizeRoles('SUPER_ADMIN', 'ADMIN', 'HR'));

// Employee Management Endpoints
router.post('/create', validateCreateEmployee, createEmployee);
router.put('/update/:id', updateEmployee, updateEmployee);
router.put('/deactivate/:id', deactivateEmployee);
router.delete('/delete/:id', deleteEmployee);
router.get('/list', listEmployees);

module.exports = router;
