const kioskService = require('../services/kioskService');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Register a new kiosk terminal
 * @route   POST /api/v1/kiosks/create
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
const createKiosk = catchAsync(async (req, res, next) => {
  const newKiosk = await kioskService.createKiosk(req.user._id, req.body);
  res.status(201).json({
    status: 'success',
    data: {
      kiosk: newKiosk
    }
  });
});

/**
 * @desc    List all registered kiosks
 * @route   GET /api/v1/kiosks
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
const listKiosks = catchAsync(async (req, res, next) => {
  const kiosks = await kioskService.listKiosks();
  res.status(200).json({
    status: 'success',
    results: kiosks.length,
    data: {
      kiosks
    }
  });
});

/**
 * @desc    Retrieve details for an individual kiosk
 * @route   GET /api/v1/kiosks/:id
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
const getKioskById = catchAsync(async (req, res, next) => {
  const kiosk = await kioskService.getKioskById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: {
      kiosk
    }
  });
});

/**
 * @desc    Update kiosk configuration details
 * @route   PUT /api/v1/kiosks/:id
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
const updateKiosk = catchAsync(async (req, res, next) => {
  const updatedKiosk = await kioskService.updateKiosk(req.user._id, req.params.id, req.body);
  res.status(200).json({
    status: 'success',
    data: {
      kiosk: updatedKiosk
    }
  });
});

/**
 * @desc    Remove a kiosk terminal
 * @route   DELETE /api/v1/kiosks/:id
 * @access  Private (SUPER_ADMIN, ADMIN)
 */
const deleteKiosk = catchAsync(async (req, res, next) => {
  await kioskService.deleteKiosk(req.user._id, req.params.id);
  res.status(200).json({
    status: 'success',
    message: 'Kiosk terminal registration successfully deleted.'
  });
});

/**
 * @desc    Update active heartbeat timestamp for a kiosk terminal
 * @route   POST /api/v1/kiosks/heartbeat
 * @access  Kiosk Authentication (Requires x-kiosk-id & x-kiosk-secret handshakes)
 */
const heartbeat = catchAsync(async (req, res, next) => {
  // Kiosk middleware resolves device to req.kiosk
  const kiosk = await kioskService.recordHeartbeat(req.kiosk._id);
  res.status(200).json({
    status: 'success',
    message: 'Heartbeat registered.',
    data: {
      lastHeartbeat: kiosk.lastHeartbeat
    }
  });
});

module.exports = {
  createKiosk,
  listKiosks,
  getKioskById,
  updateKiosk,
  deleteKiosk,
  heartbeat
};
