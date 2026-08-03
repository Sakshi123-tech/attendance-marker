import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Maps role to its portal login path
 */
const ROLE_LOGIN_MAP = {
  SUPER_ADMIN: '/super-admin/login',
  ADMIN: '/admin/login',
  HR: '/hr/login',
  EMPLOYEE: '/employee/login',
  KIOSK: '/kiosk-setup',
};

/**
 * Maps URL prefix to the expected role
 */
const PREFIX_ROLE_MAP = {
  '/super-admin': 'SUPER_ADMIN',
  '/admin': 'ADMIN',
  '/hr': 'HR',
  '/employee': 'EMPLOYEE',
  '/kiosk': 'KIOSK',
};

/**
 * Route protector checking authorization and RBAC role alignment.
 * - If not logged in: redirects to the correct portal login (based on current URL prefix).
 * - If logged in with wrong role: redirects to /unauthorized.
 *
 * @param {Array<String>} allowedRoles - Roles allowed to view this route
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  const location = useLocation();

  // Premium loading view
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <div className="relative flex items-center justify-center">
          <div className="absolute w-20 h-20 bg-indigo-500 rounded-full opacity-10 animate-ping"></div>
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-6 text-sm font-medium tracking-wide text-slate-500 animate-pulse">
          Establishing Secure Handshake...
        </p>
      </div>
    );
  }

  // Detect which portal the user is trying to access based on URL
  const portalPrefix = Object.keys(PREFIX_ROLE_MAP).find(prefix =>
    location.pathname.startsWith(prefix)
  );
  const requiredRole = portalPrefix ? PREFIX_ROLE_MAP[portalPrefix] : null;
  const loginRedirect = requiredRole ? ROLE_LOGIN_MAP[requiredRole] : '/login';

  // Redirect if unauthenticated — go to that portal's login page
  if (!isAuthenticated) {
    return <Navigate to={loginRedirect} replace state={{ from: location }} />;
  }

  // Redirect to unauthorized if user role is not allowed
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
