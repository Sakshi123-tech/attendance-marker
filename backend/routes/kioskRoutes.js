const express = require('express');
const { createKiosk, listKiosks, getKioskById, updateKiosk, deleteKiosk, heartbeat } = require('../controllers/kioskController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const { authenticateKiosk } = require('../middleware/kioskMiddleware');
const { validateKioskCreate, validateKioskUpdate } = require('../validators/kioskValidator');

const router = express.Router();

// Public/Kiosk Authenticated Route (uses hardware handshake instead of user auth)
router.post('/heartbeat', authenticateKiosk, heartbeat);

// Protected Admin Routes (Require active User login with ADMIN or SUPER_ADMIN roles)
router.use(protect);
router.use(authorizeRoles('SUPER_ADMIN', 'ADMIN'));

router.post('/create', validateKioskCreate, createKiosk);
router.get('/', listKiosks);
router.get('/:id', getKioskById);
router.put('/:id', validateKioskUpdate, updateKiosk);
router.delete('/:id', deleteKiosk);

module.exports = router;
