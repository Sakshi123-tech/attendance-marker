const SystemLog = require('../models/SystemLog');

const auditService = {
  logAuditAction: async (action, userId, details = {}) => {
    try {
      const timestamp = new Date().toISOString();
      
      // Determine type based on action string
      let type = 'SYSTEM';
      const actionUpper = action.toUpperCase();
      
      if (['LOGIN', 'LOGOUT', 'PASSWORD_RESET', 'USER_ACTIVATED', 'FAILED_LOGIN_ATTEMPT'].includes(actionUpper)) {
        type = 'AUTH';
      } else if (['USER_CREATED', 'ACCOUNT_DEACTIVATED', 'ACCOUNT_ACTIVATED', 'USER_DELETED'].includes(actionUpper)) {
        type = 'USER_MGMT';
      } else if (actionUpper.includes('SECURITY')) {
        type = 'SECURITY';
      }

      // Check for type override in details
      if (details.typeOverride) {
        type = details.typeOverride;
        delete details.typeOverride;
      }

      const target = details.target || details.email || '';
      const ip = details.ip || '';
      
      // Remove these from details so we don't duplicate
      if (details.target) delete details.target;
      if (details.ip) delete details.ip;

      const newLog = await SystemLog.create({
        type,
        action: actionUpper,
        user: userId === 'SYSTEM' || !userId ? null : userId,
        target,
        ip,
        details
      });

      console.log(`[AUDIT-LOG DB] [${actionUpper}] -> User: ${userId || 'SYSTEM'} | Time: ${timestamp}`);
      return newLog;
    } catch (err) {
      console.error('Failed to write audit log to DB:', err);
    }
  }
};

module.exports = auditService;
