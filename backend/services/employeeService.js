const crypto = require('crypto');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { sendOnboardingEmail } = require('./emailService');
const auditService = require('./auditService');

/**
 * Service to manage employee records, creation privileges, role caps, and invites.
 */
const employeeService = {
  /**
   * Register a new user and dispatch onboarding link
   */
  createEmployee: async (creator, employeeData) => {
    const { fullName, email, role, department, employeeId } = employeeData;

    // 1. Enforce hierarchical creator restrictions
    if (creator.role === 'HR' && role !== 'EMPLOYEE') {
      throw new AppError('HR users are only authorized to create EMPLOYEE accounts.', 403);
    }
    if (creator.role === 'EMPLOYEE' || creator.role === 'KIOSK') {
      throw new AppError('You do not have permission to register new users.', 403);
    }
    if (role === 'SUPER_ADMIN') {
      throw new AppError('Registering additional SUPER_ADMIN users is strictly prohibited.', 400);
    }

    // 2. Enforce structural system caps on roles
    if (role === 'ADMIN') {
      const adminCount = await User.countDocuments({ role: 'ADMIN' });
      if (adminCount >= 3) {
        throw new AppError('System Limit Exceeded: Maximum of 3 ADMIN users allowed.', 400);
      }
    }
    if (role === 'HR') {
      const hrCount = await User.countDocuments({ role: 'HR' });
      if (hrCount >= 3) {
        throw new AppError('System Limit Exceeded: Maximum of 3 HR users allowed.', 400);
      }
    }

    // 3. Verify unique constraints (Email and Employee ID)
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      throw new AppError('A user account with this email address already exists.', 400);
    }

    const idExists = await User.findOne({ employeeId });
    if (idExists) {
      throw new AppError('A user account with this Employee ID already exists.', 400);
    }

    // 4. Generate random crypto setup token and temporary password
    const invitationToken = crypto.randomBytes(32).toString('hex');
    const invitationExpiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
    const tempPassword = crypto.randomBytes(16).toString('hex') + 'A1!'; // Must satisfy minlength/complexity

    // 5. Create user record in DB
    const newUser = await User.create({
      fullName,
      email,
      password: tempPassword,
      role,
      department: department || 'General',
      employeeId,
      mustSetupPassword: true,
      isActive: true, // Needs to be true so they can access setup URL
      isEmailVerified: false,
      invitationToken,
      invitationExpiresAt,
      createdBy: creator._id
    });

    // 6. Send onboarding email
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:3000';
    const setupUrl = `${clientUrl}/setup-account?token=${invitationToken}`;
    
    // We intentionally run it asynchronously or await it.
    // In production, we log email failure but keep the user record.
    const emailSent = await sendOnboardingEmail(newUser, setupUrl);
    if (!emailSent) {
      console.warn(`[EmployeeService] Warning: Onboarding email failed to dispatch to ${email}.`);
    }

    // 7. Fire audit log hook
    auditService.logAuditAction('USER_CREATED', creator._id, {
      targetUserId: newUser._id,
      targetEmail: newUser.email,
      targetRole: newUser.role,
      targetEmployeeId: newUser.employeeId
    });

    // Hide password field before returning user
    newUser.password = undefined;
    return newUser;
  },

  /**
   * Update employee profile
   */
  updateEmployee: async (employeeIdToUpdate, updateData) => {
    // Only allow safe fields to be modified directly here
    const allowedFields = ['fullName', 'department', 'employeeId'];
    const filteredUpdate = {};
    
    Object.keys(updateData).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredUpdate[key] = updateData[key];
      }
    });

    // If updating employeeId, check unique constraints
    if (filteredUpdate.employeeId) {
      const idExists = await User.findOne({ employeeId: filteredUpdate.employeeId, _id: { $ne: employeeIdToUpdate } });
      if (idExists) {
        throw new AppError('Another user account with this Employee ID already exists.', 400);
      }
    }

    const updatedUser = await User.findByIdAndUpdate(employeeIdToUpdate, filteredUpdate, {
      new: true,
      runValidators: true
    });

    if (!updatedUser) {
      throw new AppError('No employee found with that ID.', 404);
    }

    return updatedUser;
  },

  /**
   * Deactivate a user (marking isActive as false)
   */
  deactivateEmployee: async (actorId, employeeIdToDeactivate) => {
    const targetUser = await User.findById(employeeIdToDeactivate);

    if (!targetUser) {
      throw new AppError('No employee found with that ID.', 404);
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      throw new AppError('Deactivating the SUPER_ADMIN account is prohibited.', 400);
    }

    targetUser.isActive = false;
    await targetUser.save();

    // Fire audit log hook
    auditService.logAuditAction('USER_DEACTIVATED', actorId, {
      targetUserId: targetUser._id,
      targetRole: targetUser.role
    });

    return targetUser;
  },

  /**
   * List all users
   */
  listEmployees: async () => {
    return await User.find({}).sort({ createdAt: -1 });
  },

  /**
   * Permanently delete a user
   */
  deleteEmployeePermanent: async (actorId, employeeIdToDelete) => {
    const targetUser = await User.findById(employeeIdToDelete);

    if (!targetUser) {
      throw new AppError('No employee found with that ID.', 404);
    }

    if (targetUser.role === 'SUPER_ADMIN') {
      throw new AppError('Deleting the SUPER_ADMIN account is prohibited.', 400);
    }

    await User.findByIdAndDelete(employeeIdToDelete);

    // Fire audit log hook
    auditService.logAuditAction('USER_DELETED', actorId, {
      targetUserId: targetUser._id,
      targetRole: targetUser.role
    });

    return targetUser;
  }
};

module.exports = employeeService;
