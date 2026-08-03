const User = require('../models/User');

/**
 * Automatical Super Admin Bootstrapping Utility
 * Inspects database on server startup. If no Super Admin exists,
 * it provisions the default Super Admin account based on .env configurations.
 */
const bootstrapSuperAdmin = async () => {
  try {
    // 1. Check if a Super Admin already exists in the database
    const superAdminExists = await User.findOne({ role: 'SUPER_ADMIN' });

    if (superAdminExists) {
      console.log('[Bootstrap] Super Admin account already exists. Skipping initialization...');
      return;
    }

    // 2. Read bootstrap credentials from environment variables
    const adminName = process.env.SUPER_ADMIN_NAME || 'Super Admin';
    const adminEmail = process.env.SUPER_ADMIN_EMAIL;
    const adminPassword = process.env.SUPER_ADMIN_PASSWORD;
    const adminEmpId = process.env.SUPER_ADMIN_EMP_ID || 'EMP-0000';

    // Verify presence of required credentials
    if (!adminEmail || !adminPassword) {
      console.warn('[Bootstrap] Warning: Missing SUPER_ADMIN_EMAIL or SUPER_ADMIN_PASSWORD in environment. Bootstrapping aborted.');
      return;
    }

    // 3. Create the initial Super Admin account
    // Password will automatically be encrypted via User model's pre-save middleware
    await User.create({
      fullName: adminName,
      email: adminEmail,
      password: adminPassword,
      role: 'SUPER_ADMIN',
      employeeId: adminEmpId,
      isActive: true,
      isEmailVerified: true,
      mustSetupPassword: false,
      createdBy: null
    });

    console.log(`[Bootstrap] Success: Default Super Admin account successfully bootstrapped (${adminEmail})!`);
  } catch (error) {
    console.error(`[Bootstrap] Error provisioning default Super Admin: ${error.message}`);
  }
};

module.exports = bootstrapSuperAdmin;
