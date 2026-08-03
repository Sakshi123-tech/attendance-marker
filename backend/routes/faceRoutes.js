const express = require('express');
const { registerFace, getFaceStatus } = require('../controllers/faceController');
const { protect } = require('../middleware/authMiddleware');
const { validateFaceRegister } = require('../validators/faceValidator');

const router = express.Router();

// Apply auth protection across all face registration paths
router.use(protect);

router.post('/register', validateFaceRegister, registerFace);
router.get('/status', getFaceStatus);

module.exports = router;
