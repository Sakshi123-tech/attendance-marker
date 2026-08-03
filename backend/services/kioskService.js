const crypto = require('crypto');
const Kiosk = require('../models/Kiosk');
const AppError = require('../utils/AppError');
const auditService = require('./auditService');

/**
 * Service to manage Kiosk terminal creation, validation, and heartbeats.
 */
const kioskService = {
  /**
   * Register a new Kiosk terminal
   */
  createKiosk: async (creatorId, kioskData) => {
    const { name, location, ipAddress } = kioskData;

    // 1. Enforce Max 1 Kiosk limit globally
    const kioskCount = await Kiosk.countDocuments();
    if (kioskCount >= 1) {
      throw new AppError('Maximum kiosk limit reached. Only 1 kiosk is allowed per installation.', 403);
    }

    // 2. Verify kiosk name uniqueness
    const nameExists = await Kiosk.findOne({ name });
    if (nameExists) {
      throw new AppError('A kiosk terminal with that name is already registered.', 400);
    }

    // 2. Generate a crypto-secure device secret
    const deviceSecret = crypto.randomBytes(32).toString('hex');

    // 3. Create kiosk device record in DB
    const newKiosk = await Kiosk.create({
      name,
      location,
      ipAddress,
      deviceSecret,
      createdBy: creatorId
    });

    // 4. Fire audit log event
    auditService.logAuditAction('KIOSK_CREATED', creatorId, {
      kioskId: newKiosk._id,
      name: newKiosk.name,
      location: newKiosk.location
    });

    return newKiosk;
  },

  /**
   * List all registered Kiosks
   */
  listKiosks: async () => {
    return await Kiosk.find().sort({ name: 1 });
  },

  /**
   * Retrieve a kiosk by its database ID
   */
  getKioskById: async (id) => {
    const kiosk = await Kiosk.findById(id);
    if (!kiosk) {
      throw new AppError('No kiosk terminal found with that ID.', 404);
    }
    return kiosk;
  },

  /**
   * Update kiosk parameters
   */
  updateKiosk: async (actorId, id, updateData) => {
    const { name, location, ipAddress, isActive } = updateData;

    const kiosk = await Kiosk.findById(id);
    if (!kiosk) {
      throw new AppError('No kiosk terminal found with that ID.', 404);
    }

    // If changing name, check unique constraints
    if (name && name !== kiosk.name) {
      const nameExists = await Kiosk.findOne({ name });
      if (nameExists) {
        throw new AppError('A kiosk terminal with that name is already registered.', 400);
      }
      kiosk.name = name;
    }

    if (location) kiosk.location = location;
    if (ipAddress) kiosk.ipAddress = ipAddress;
    if (isActive !== undefined) kiosk.isActive = isActive;

    await kiosk.save();

    // Fire audit event
    auditService.logAuditAction('KIOSK_UPDATED', actorId, {
      kioskId: kiosk._id,
      updates: { name, location, ipAddress, isActive }
    });

    return kiosk;
  },

  /**
   * Remove a kiosk from DB
   */
  deleteKiosk: async (actorId, id) => {
    const deletedKiosk = await Kiosk.findByIdAndDelete(id);

    if (!deletedKiosk) {
      throw new AppError('No kiosk terminal found with that ID.', 404);
    }

    // Fire audit event
    auditService.logAuditAction('KIOSK_DELETED', actorId, {
      kioskId: id,
      name: deletedKiosk.name
    });

    return deletedKiosk;
  },

  /**
   * Update a kiosk's heartbeat timestamp
   */
  recordHeartbeat: async (kioskId) => {
    const kiosk = await Kiosk.findById(kioskId);
    if (!kiosk) {
      throw new AppError('No kiosk terminal found with that ID.', 404);
    }

    if (!kiosk.isActive) {
      throw new AppError('Heartbeat rejected. This kiosk device has been deactivated.', 403);
    }

    kiosk.lastHeartbeat = Date.now();
    await kiosk.save({ validateBeforeSave: false });

    return kiosk;
  }
};

module.exports = kioskService;
