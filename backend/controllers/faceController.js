const faceService = require('../services/faceService');
const catchAsync = require('../utils/catchAsync');

/**
 * @desc    Register user's 128D face features embedding
 * @route   POST /api/v1/face/register
 * @access  Private (Authenticated Users except KIOSK)
 */
const registerFace = catchAsync(async (req, res, next) => {
  const result = await faceService.registerFace(req.user, req.body.embedding);
  res.status(200).json(result);
});

/**
 * @desc    Retrieve user's face registration status
 * @route   GET /api/v1/face/status
 * @access  Private (Authenticated Users)
 */
const getFaceStatus = catchAsync(async (req, res, next) => {
  const status = await faceService.getFaceStatus(req.user._id);
  res.status(200).json({
    status: 'success',
    data: status
  });
});

module.exports = {
  registerFace,
  getFaceStatus
};
