import React from 'react';
import SecuritySettings from '../../../components/common/SecuritySettings';

/**
 * Employee Settings Page
 * Re-exports the unified, production-ready SecuritySettings component.
 * Contains only active, functional features:
 * - Password & Credentials
 * - Login Activity & Audit Logs
 * - Account Details & Permissions
 */
const Settings = () => {
  return <SecuritySettings />;
};

export default Settings;
