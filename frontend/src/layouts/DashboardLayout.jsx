import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Clock,
  FileText,
  Settings,
  ShieldAlert,
  LogOut,
  Menu,
  X,
  User,
  ChevronRight,
  UserCheck,
  Fingerprint,
  BarChart3,
  AlertTriangle,
  Monitor,
  Calendar,
  Bell,
  FolderOpen
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/ui/breadcrumb';
import LogoutPopup from '../components/common/LogoutPopup';

/**
 * Premium Dashboard Layout Wrapper
 * Implements collapsible sidebar, context-sensitive links, breadcrumbs, live clock, profile menu, and logout functions.
 */
const DashboardLayout = () => {
  const { user, role, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Real-time ticking clock for dashboard header
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Define sidebar navigation structures for each role
  const getSidebarLinks = () => {
    switch (role) {
      case 'SUPER_ADMIN':
        return [
          { name: 'Dashboard', path: '/super-admin', icon: LayoutDashboard },
          {
            name: 'Users',
            icon: Users,
            isGroup: true,
            children: [
              { name: 'Create New User', path: '/super-admin/admins/create' },
              { name: 'User List', path: '/super-admin/admins/list' },
            ],
          },
          { name: 'Kiosk Monitoring', path: '/super-admin/kiosks', icon: Monitor },
          { name: 'Register My Face', path: '/super-admin/register-my-face', icon: Fingerprint },
          { name: 'System Logs', path: '/super-admin/logs', icon: ShieldAlert },
          { name: 'Settings', path: '/super-admin/settings', icon: Settings },
        ];
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
          {
            name: 'Employees',
            icon: Users,
            isGroup: true,
            children: [
              { name: 'Create New User', path: '/admin/employees/create' },
              { name: 'User List', path: '/admin/employees/list' },
            ],
          },
          { name: 'Attendance Monitor', path: '/admin/attendance', icon: Clock },
          { name: 'Late Employees', path: '/admin/late-employees', icon: AlertTriangle },
          { name: 'Face Registration', path: '/admin/face-registration', icon: Fingerprint },
          { name: 'Register My Face', path: '/admin/register-my-face', icon: Fingerprint },
          { name: 'Department Analytics', path: '/admin/department', icon: BarChart3 },
          { name: 'Kiosk Monitoring', path: '/admin/kiosks', icon: Monitor },
          { name: 'Reports', path: '/admin/reports', icon: FileText },
          { name: 'Settings', path: '/admin/settings', icon: Settings },
        ];
      case 'HR':
        return [
          { name: 'Dashboard', path: '/hr', icon: LayoutDashboard },
          { name: 'Employee Directory', path: '/hr/employees/list', icon: Users },
          { name: 'Attendance', path: '/hr/attendance', icon: UserCheck },
          { name: 'Attendance History', path: '/hr/attendance-history', icon: Clock },
          { name: 'Face Registration', path: '/hr/face-registration', icon: Fingerprint },
          { name: 'Register My Face', path: '/hr/register-my-face', icon: Fingerprint },
          { name: 'Leave Management', path: '/hr/leaves', icon: FileText },
          { name: 'Department Overview', path: '/hr/department', icon: BarChart3 },
          { name: 'Reports', path: '/hr/reports', icon: FileText },
        ];
      case 'EMPLOYEE':
        return [
          { name: 'Dashboard', path: '/employee', icon: LayoutDashboard },
          { name: 'My Attendance', path: '/employee/my-attendance', icon: UserCheck },
          { name: 'Attendance Calendar', path: '/employee/calendar', icon: Calendar },
          { name: 'Register Face', path: '/employee/register-face', icon: Fingerprint },
          { name: 'Leave Management', path: '/employee/leaves', icon: FileText },
          { name: 'Notifications', path: '/employee/notifications', icon: Bell },
          { name: 'Documents', path: '/employee/documents', icon: FolderOpen },
          { name: 'Profile', path: '/employee/profile', icon: User },
          { name: 'Settings', path: '/employee/settings', icon: Settings },
        ];
      case 'KIOSK':
        return [
          { name: 'Kiosk Status', path: '/kiosk', icon: Fingerprint },
          { name: 'Kiosk Settings', path: '/kiosk/settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const navLinks = getSidebarLinks();

  // Resolve user initials for avatar
  const getInitials = () => {
    if (!user || !user.fullName) return 'U';
    return user.fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage className="capitalize text-slate-500 font-medium">
              {role?.toLowerCase().replace('_', ' ')}
            </BreadcrumbPage>
          </BreadcrumbItem>
          {pathnames.slice(1).map((value, index) => (
            <React.Fragment key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="capitalize text-slate-900 font-semibold">
                  {value.replace('-', ' ')}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    );
  };

  return (
    <div className="h-screen bg-slate-50 text-slate-900 flex font-sans overflow-hidden">

      {/* 1. Mobile Sidebar Backdrop Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 2. Side Navigation Panel */}
      <aside
        style={{ backgroundColor: '#31353D', borderColor: '#3e434d' }}
        className={`fixed top-0 bottom-0 left-0 w-64 border-r z-40 transition-transform duration-300 transform lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:relative lg:flex lg:flex-col`}
      >
        {/* Sidebar Header Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-[#3e434d]">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-blue-500 flex items-center justify-center shadow-md shadow-indigo-500/20">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.571V9a4 4 0 00-8 0v1.754a18.86 18.86 0 01-3.136 9.726M15.347 12A6 6 0 117.92 6H9.17a6.002 6.002 0 01-2.083 4.5" />
              </svg>
            </div>
            <div>
              <span className="font-bold text-sm text-white">
                Attendance AI
              </span>
              <span className="block text-[9px] text-slate-400 font-semibold tracking-widest uppercase">
                Enterprise v1.0
              </span>
            </div>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-md text-slate-400 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Menu Item Navigation Links */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 no-scrollbar">
          {navLinks.map((link) => {
            const Icon = link.icon;

            /* ── Group item (e.g. "Users >") ── */
            if (link.isGroup) {
              const isAnyChildActive = link.children?.some((c) =>
                location.pathname.startsWith(c.path)
              );
              return (
                <div key={link.name}>
                  {/* Group header — not clickable, just label */}
                  <div
                    className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium ${
                      isAnyChildActive
                        ? 'bg-white/10 text-white'
                        : 'text-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-4 h-4 ${isAnyChildActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                      <span>{link.name}</span>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 ${isAnyChildActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                  </div>
                  {/* Sub-links */}
                  <div className="mt-0.5 ml-7 space-y-0.5">
                    {link.children?.map((child) => {
                      const isChildActive = location.pathname === child.path;
                      return (
                        <Link
                          key={child.path}
                          to={child.path}
                          onClick={() => setSidebarOpen(false)}
                          className={`block px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
                            isChildActive
                              ? 'bg-indigo-500/20 text-indigo-300 font-semibold'
                              : 'text-slate-400 hover:bg-white/5 hover:text-white'
                          }`}
                        >
                          {child.name}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            }

            /* ── Regular link ── */
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group text-sm font-medium ${isActive
                    ? 'bg-indigo-500/20 text-indigo-300 shadow-sm border border-indigo-500/20'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-200'}`} />
                  <span>{link.name}</span>
                </div>
                {link.badge && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${isActive ? 'bg-indigo-500/20 text-indigo-300' : 'bg-white/10 text-slate-400'}`}>
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Bottom Account Widget */}
        <div className="p-4 border-t border-[#3e434d] bg-[#2a2d35]">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-sm font-semibold text-indigo-400 shadow-sm">
              {getInitials()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-white truncate">
                {user?.fullName || 'User Profile'}
              </p>
              <p className="text-[10px] text-slate-400 truncate font-mono uppercase tracking-wider">
                {role?.replace('_', ' ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-slate-300 rounded-xl border border-white/10 hover:border-red-500/30 transition-all duration-200 text-xs font-medium"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>

          <LogoutPopup
            isOpen={showLogoutPopup}
            onConfirm={() => { setShowLogoutPopup(false); handleLogout(); }}
            onCancel={() => setShowLogoutPopup(false)}
          />
        </div>
      </aside>

      {/* 3. Main Dashboard Display Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Header Ribbon bar */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
            >
              <Menu className="w-5 h-5" />
            </button>
            {/* Dynamic Breadcrumbs */}
            <div className="hidden sm:block">{getBreadcrumbs()}</div>
          </div>

          <div className="flex items-center space-x-6">
            {/* Real-time Ticking Clock */}
            <div className="flex items-center space-x-2 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 py-1.5 px-3 rounded-full">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span className="font-mono">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <span className="text-[9px] text-slate-300">|</span>
              <span className="text-[10px] font-semibold text-slate-500">
                {time.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>

            {/* Quick Profile Icon Indicator */}
            <div className="relative">
              <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-semibold text-slate-600 cursor-pointer shadow-sm">
                {getInitials()}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Content Area */}
        <main className="flex-1 overflow-hidden flex flex-col bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
