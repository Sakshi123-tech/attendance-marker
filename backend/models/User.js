const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please provide your full name'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Please provide your email address'],
      unique: true,
      lowercase: true,
      trim: true,
      validate: [validator.isEmail, 'Please provide a valid email address']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false // Ensures password is not accidentally returned in query results
    },
    role: {
      type: String,
      enum: {
        values: ['SUPER_ADMIN', 'ADMIN', 'HR', 'EMPLOYEE', 'KIOSK'],
        message: 'Role must be either: SUPER_ADMIN, ADMIN, HR, EMPLOYEE, or KIOSK'
      },
      default: 'EMPLOYEE'
    },
    department: {
      type: String,
      trim: true,
      default: 'General'
    },
    employeeId: {
      type: String,
      required: [true, 'Please provide an employee ID'],
      unique: true,
      trim: true
    },
    faceEmbedding: {
      type: [Number], // Dynamic array of floats representing 128D face features
      default: []
    },
    faceRegistered: {
      type: Boolean,
      default: false
    },
    faceRegisteredAt: {
      type: Date,
      default: null
    },
    isActive: {
      type: Boolean,
      default: true
    },
    isEmailVerified: {
      type: Boolean,
      default: false
    },
    mustSetupPassword: {
      type: Boolean,
      default: false
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    invitationToken: {
      type: String,
      default: null
    },
    invitationExpiresAt: {
      type: Date,
      default: null
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpiresAt: {
      type: Date,
      default: null
    },
    lastLoginAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true // Automatically generates createdAt and updatedAt fields
  }
);

// Mongoose Pre-save Hook: Hash password before saving if it is new or modified
userSchema.pre('save', async function (next) {
  // Only hash password if it was actually modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Generate a salt with a cost factor of 12
    const salt = await bcrypt.genSalt(12);
    // Hash the password along with the salt
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Method: Compare a candidate password with the stored hashed password
 * @param {String} candidatePassword - Plain text password from the login request
 * @returns {Boolean} True if matched, false otherwise
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
