import React from 'react';
import { Link } from 'react-router-dom';

const PORTALS = [
  {
    key: 'super-admin',
    label: 'Super Admin',
    desc: 'System control & configuration',
    path: '/super-admin/login',
    gradient: 'from-violet-600 to-purple-600',
    shadow: 'shadow-violet-500/20',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    )
  },
  {
    key: 'admin',
    label: 'Admin',
    desc: 'Attendance & employee management',
    path: '/admin/login',
    gradient: 'from-indigo-600 to-blue-600',
    shadow: 'shadow-indigo-500/20',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    )
  },
  {
    key: 'hr',
    label: 'HR',
    desc: 'Human resources & leave management',
    path: '/hr/login',
    gradient: 'from-emerald-600 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    )
  },
  {
    key: 'employee',
    label: 'Employee',
    desc: 'View attendance, leaves & profile',
    path: '/employee/login',
    gradient: 'from-orange-500 to-amber-500',
    shadow: 'shadow-orange-500/20',
    icon: (
      <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  }
];

const PortalSelectionPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/8 blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/8 blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-2xl">
        {/* Brand Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 mx-auto mb-5">
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Attendance AI</h1>
          <p className="text-slate-500 mt-2 font-medium">Select your portal to continue</p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {PORTALS.map((portal) => (
            <Link
              key={portal.key}
              to={portal.path}
              className={`group bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-xl ${portal.shadow} hover:-translate-y-1 transition-all duration-300 flex items-center gap-5`}
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-tr ${portal.gradient} flex items-center justify-center shadow-lg ${portal.shadow} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                {portal.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-lg leading-tight">{portal.label} Portal</h3>
                <p className="text-sm text-slate-500 mt-0.5 leading-snug">{portal.desc}</p>
              </div>
              <svg className="w-5 h-5 text-slate-300 group-hover:text-slate-600 group-hover:translate-x-1 transition-all duration-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400 mt-8">
          Smart Attendance Management System • Enterprise Edition
        </p>
      </div>
    </div>
  );
};

export default PortalSelectionPage;
