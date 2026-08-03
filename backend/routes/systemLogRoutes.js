const express = require('express');
const { getSystemLogs } = require('../controllers/systemLogController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

// System logs are highly sensitive and should only be accessible to SUPER_ADMIN
router.use(protect);
router.use(authorizeRoles('SUPER_ADMIN'));

router.get('/', getSystemLogs);

module.exports = router;
