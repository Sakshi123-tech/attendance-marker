import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Layout Wrappers
import DashboardLayout from '../layouts/DashboardLayout';

// Lazy-Loaded Authentication Pages
const PortalSelectionPage = lazy(() => import('../pages/PortalSelectionPage'));
const PortalLoginPage = lazy(() => import('../pages/PortalLoginPage'));
const ForgotPasswordPage = lazy(() => import('../pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../pages/ResetPasswordPage'));
const SetupAccountPage = lazy(() => import('../pages/SetupAccountPage'));
const UnauthorizedPage = lazy(() => import('../pages/UnauthorizedPage'));

// Lazy-Loaded Role Dashboards
const SuperAdminDashboard = lazy(() => import('../modules/super-admin/pages/SuperAdminDashboard'));
const AdminDashboard = lazy(() => import('../modules/admin/pages/AdminDashboard'));
const HRDashboard = lazy(() => import('../modules/hr/pages/HRDashboard'));
const EmployeeDashboard = lazy(() => import('../modules/employee/pages/EmployeeDashboard'));
const KioskHome = lazy(() => import('../modules/kiosk/pages/KioskHome'));
const KioskSetupPage = lazy(() => import('../modules/kiosk/pages/KioskSetupPage'));

// Lazy-Loaded Super Admin Pages
const SuperAdminAdmins = lazy(() => import('../modules/super-admin/pages/SuperAdminAdmins'));
const SuperAdminCreateAdmin = lazy(() => import('../modules/super-admin/pages/SuperAdminCreateAdmin'));
const SuperAdminUserList = lazy(() => import('../modules/super-admin/pages/SuperAdminUserList'));
const KioskListPage = lazy(() => import('../modules/super-admin/pages/KioskListPage'));
const SystemLogsPage = lazy(() => import('../modules/super-admin/pages/SystemLogsPage'));

// Lazy-Loaded Admin Sub-Module Pages
const AdminEmployees = lazy(() => import('../modules/admin/pages/AdminEmployees'));
const AttendanceMonitorPage = lazy(() => import('../modules/admin/pages/AttendanceMonitorPage'));
const LateEmployeesPage = lazy(() => import('../modules/admin/pages/LateEmployeesPage'));
const FaceRegistrationPage = lazy(() => import('../modules/admin/pages/FaceRegistrationPage'));
const DepartmentAnalyticsPage = lazy(() => import('../modules/admin/pages/DepartmentAnalyticsPage'));
const KioskMonitoringPage = lazy(() => import('../modules/admin/pages/KioskMonitoringPage'));
const ReportsPage = lazy(() => import('../modules/admin/pages/ReportsPage'));

// Lazy-Loaded HR Sub-Module Pages
const HREmployees = lazy(() => import('../modules/hr/pages/HREmployees'));
const EmployeeAttendanceHistory = lazy(() => import('../modules/hr/pages/EmployeeAttendanceHistory'));
const LeaveManagement = lazy(() => import('../modules/hr/pages/LeaveManagement'));

// Lazy-Loaded Employee Sub-Module Pages
const MyAttendance = lazy(() => import('../modules/employee/pages/MyAttendance'));
const AttendanceCalendar = lazy(() => import('../modules/employee/pages/AttendanceCalendar'));
const RegisterFace = lazy(() => import('../modules/employee/pages/RegisterFace'));
const MyLeaves = lazy(() => import('../modules/employee/pages/MyLeaves'));
const Notifications = lazy(() => import('../modules/employee/pages/Notifications'));
const Documents = lazy(() => import('../modules/employee/pages/Documents'));
const MyProfile = lazy(() => import('../modules/employee/pages/MyProfile'));
const Settings = lazy(() => import('../modules/employee/pages/Settings'));
const ChangePassword = lazy(() => import('../modules/employee/pages/ChangePassword'));

/**
 * Loading fallback view
 */
const ViewLoader = () => (
  <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-450">
    <div className="relative">
      <div className="absolute w-12 h-12 bg-indigo-500/10 rounded-full opacity-20 animate-ping"></div>
      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    <span className="mt-4 text-xs font-semibold tracking-wider text-slate-500 animate-pulse">
      Rendering module viewport...
    </span>
  </div>
);

/**
 * Root redirect - send to the correct portal dashboard or to /login selector
 */
const RootRedirect = () => {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-400">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  switch (role) {
    case 'SUPER_ADMIN': return <Navigate to="/super-admin" replace />;
    case 'ADMIN':       return <Navigate to="/admin" replace />;
    case 'HR':          return <Navigate to="/hr" replace />;
    case 'EMPLOYEE':    return <Navigate to="/employee" replace />;
    case 'KIOSK':       return <Navigate to="/kiosk" replace />;
    default:            return <Navigate to="/login" replace />;
  }
};

/**
 * Central router map
 */
const AppRoutes = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      }
    >
      <Routes>
        {/* 1. Root Redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* 2. Portal Selection (main login chooser) */}
        <Route path="/login" element={<PortalSelectionPage />} />

        {/* 3. Individual Portal Login Pages */}
        <Route path="/super-admin/login" element={<PortalLoginPage portal="super-admin" />} />
        <Route path="/admin/login" element={<PortalLoginPage portal="admin" />} />
        <Route path="/hr/login" element={<PortalLoginPage portal="hr" />} />
        <Route path="/employee/login" element={<PortalLoginPage portal="employee" />} />

        {/* 4. Common Auth Utilities */}
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/setup-account" element={<SetupAccountPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        {/* 5. Kiosk Hardware Setup - Public */}
        <Route path="/kiosk-setup" element={<KioskSetupPage />} />

        {/* 6. Protected Role-Based Routes (Nested in DashboardLayout) */}
        <Route element={<DashboardLayout />}>

          {/* SUPER ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['SUPER_ADMIN']} />}>
            <Route path="/super-admin" element={<SuperAdminDashboard />} />
            <Route path="/super-admin/admins" element={<SuperAdminAdmins />} />
            <Route path="/super-admin/admins/create" element={<SuperAdminCreateAdmin />} />
            <Route path="/super-admin/admins/list" element={<SuperAdminUserList />} />
            <Route path="/super-admin/kiosks" element={<KioskListPage />} />
            <Route path="/super-admin/register-my-face" element={<RegisterFace />} />
            <Route path="/super-admin/logs" element={<SystemLogsPage />} />
            <Route path="/super-admin/settings" element={<div className="text-sm font-mono text-slate-500">Super Admin Settings Placeholder</div>} />
          </Route>

          {/* ADMIN */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/employees/create" element={<SuperAdminCreateAdmin />} />
            <Route path="/admin/employees/list" element={<SuperAdminUserList />} />
            <Route path="/admin/attendance" element={<AttendanceMonitorPage />} />
            <Route path="/admin/late-employees" element={<LateEmployeesPage />} />
            <Route path="/admin/face-registration" element={<FaceRegistrationPage />} />
            <Route path="/admin/department" element={<DepartmentAnalyticsPage />} />
            <Route path="/admin/kiosks" element={<KioskMonitoringPage />} />
            <Route path="/admin/register-my-face" element={<RegisterFace />} />
            <Route path="/admin/reports" element={<ReportsPage />} />
            <Route path="/admin/settings" element={<div className="text-sm font-mono text-slate-500">Admin Settings Placeholder</div>} />
          </Route>

          {/* HR */}
          <Route element={<ProtectedRoute allowedRoles={['HR']} />}>
            <Route path="/hr" element={<HRDashboard />} />
            <Route path="/hr/employees/create" element={<SuperAdminCreateAdmin />} />
            <Route path="/hr/employees/list" element={<SuperAdminUserList />} />
            <Route path="/hr/attendance" element={<AttendanceMonitorPage />} />
            <Route path="/hr/attendance-history" element={<EmployeeAttendanceHistory />} />
            <Route path="/hr/face-registration" element={<FaceRegistrationPage />} />
            <Route path="/hr/register-my-face" element={<RegisterFace />} />
            <Route path="/hr/leaves" element={<LeaveManagement />} />
            <Route path="/hr/department" element={<DepartmentAnalyticsPage />} />
            <Route path="/hr/reports" element={<ReportsPage />} />
          </Route>

          {/* EMPLOYEE */}
          <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
            <Route path="/employee" element={<EmployeeDashboard />} />
            <Route path="/employee/my-attendance" element={<MyAttendance />} />
            <Route path="/employee/calendar" element={<AttendanceCalendar />} />
            <Route path="/employee/register-face" element={<RegisterFace />} />
            <Route path="/employee/leaves" element={<MyLeaves />} />
            <Route path="/employee/notifications" element={<Notifications />} />
            <Route path="/employee/documents" element={<Documents />} />
            <Route path="/employee/profile" element={<MyProfile />} />
            <Route path="/employee/settings" element={<Settings />} />
            <Route path="/employee/change-password" element={<ChangePassword />} />
          </Route>

        </Route>

        {/* KIOSK - Outside DashboardLayout for full screen */}
        <Route element={<ProtectedRoute allowedRoles={['KIOSK']} />}>
          <Route path="/kiosk" element={<KioskHome />} />
        </Route>

        {/* Catch-All */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
