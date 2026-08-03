const User = require('../models/User');
const AppError = require('../utils/AppError');
const auditService = require('./auditService');

/**
 * Service to manage Employee facial profile registrations
 */
const faceService = {
  /**
   * Register a user's face embedding
   */
  registerFace: async (user, embedding) => {
    // 1. Enforce role restrictions (Kiosks cannot register faces)
    if (user.role === 'KIOSK') {
      throw new AppError('Kiosk devices are not permitted to register user faces.', 403);
    }

    // 2. Ensure face has not been registered already (registration allowed only once)
    if (user.faceRegistered) {
      throw new AppError('Face embedding has already been registered for this account.', 400);
    }

    // 2.5 Ensure the face embedding is unique across all users
    const faceMatcher = require('../utils/faceMatcher');
    const existingUsers = await User.find({ faceRegistered: true });
    
    for (const existingUser of existingUsers) {
      // Don't compare with self (though we already checked user.faceRegistered above, just to be safe)
      if (existingUser._id.toString() === user._id.toString()) continue;

      const matchResult = faceMatcher.compareEmbeddings(existingUser.faceEmbedding, embedding);
      if (matchResult.isMatch) {
        throw new AppError(`This face is already registered to another employee account (${existingUser.fullName}).`, 400);
      }
    }

    // 3. Update face parameters in the database
    // We fetch fresh document to make sure we modify correctly
    const freshUser = await User.findById(user._id);
    if (!freshUser) {
      throw new AppError('User account not found.', 404);
    }

    freshUser.faceEmbedding = embedding;
    freshUser.faceRegistered = true;
    freshUser.faceRegisteredAt = Date.now();

    await freshUser.save();

    // 4. Log audit event
    auditService.logAuditAction('FACE_REGISTERED', freshUser._id, { email: freshUser.email });

    return {
      success: true,
      message: 'Face registered successfully'
    };
  },

  /**
   * Resolve face status metadata
   */
  getFaceStatus: async (userId) => {
    const user = await User.findById(userId).select('faceRegistered faceRegisteredAt');
    if (!user) {
      throw new AppError('User account not found.', 404);
    }

    return {
      faceRegistered: user.faceRegistered,
      registeredAt: user.faceRegisteredAt
    };
  }
};

module.exports = faceService;
