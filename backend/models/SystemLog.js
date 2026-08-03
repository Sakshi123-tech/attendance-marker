const mongoose = require('mongoose');

const systemLogSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['SECURITY', 'USER_MGMT', 'SYSTEM', 'AUTH', 'OTHER'],
    required: true,
    default: 'SYSTEM'
  },
  action: {
    type: String,
    required: [true, 'Log action is required'],
    trim: true
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    default: null
  },
  target: {
    type: String,
    trim: true
  },
  ip: {
    type: String,
    trim: true
  },
  details: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true // Adds createdAt and updatedAt automatically
});

// Indexes for faster filtering and sorting
systemLogSchema.index({ createdAt: -1 });
systemLogSchema.index({ type: 1 });
systemLogSchema.index({ user: 1 });

const SystemLog = mongoose.model('SystemLog', systemLogSchema);

module.exports = SystemLog;
