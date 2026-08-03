const mongoose = require('mongoose');

const kioskSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a kiosk name'],
      unique: true,
      trim: true
    },
    location: {
      type: String,
      required: [true, 'Please provide a kiosk location'],
      trim: true
    },
    ipAddress: {
      type: String,
      required: false,
      default: '',
      trim: true
    },
    deviceSecret: {
      type: String,
      required: [true, 'Device secret is required'],
      unique: true
    },
    isActive: {
      type: Boolean,
      default: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Creator reference is required']
    },
    lastHeartbeat: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Kiosk = mongoose.model('Kiosk', kioskSchema);

module.exports = Kiosk;
