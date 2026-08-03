const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    employeeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Employee reference is required']
    },
    attendanceDate: {
      type: String, // format: YYYY-MM-DD (simplifies date-only unique indexing and queries)
      required: [true, 'Attendance date is required']
    },
    checkInTime: {
      type: Date,
      required: [true, 'Check-in timestamp is required']
    },
    attendanceStatus: {
      type: String,
      enum: {
        values: ['ON_TIME', 'LATE', 'ABSENT'],
        message: 'Status must be either: ON_TIME, LATE, or ABSENT'
      },
      default: 'ON_TIME'
    },
    kioskId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Kiosk',
      required: [true, 'Kiosk device reference is required']
    },
    faceConfidence: {
      type: Number,
      required: [true, 'Face match confidence value is required']
    }
  },
  {
    timestamps: true
  }
);

// Composite Unique Index to prevent duplicate check-ins on the same calendar date
attendanceSchema.index({ employeeId: 1, attendanceDate: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);

module.exports = Attendance;
