import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * /super-admin/admins → redirect to the new User List page
 */
const SuperAdminAdmins = () => {
  return <Navigate to="/super-admin/admins/list" replace />;
};

export default SuperAdminAdmins;
