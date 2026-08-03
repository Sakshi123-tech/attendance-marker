import React from 'react';
import { Outlet } from 'react-router-dom';

/**
 * Authentication Layout Wrapper
 * Employs gradient backgrounds, animated glassmorphism panels, and modern typography
 */
const AuthLayout = () => {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 overflow-hidden font-sans">
      {/* Background Decorative Ambient Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Main Glassmorphic Wrapper Container */}
      <div className="relative w-full max-w-md mx-4 z-10">
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-2xl shadow-slate-200">
          
          {/* Header Brand Logo and Title */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-blue-500 shadow-lg shadow-indigo-500/20 mb-3">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 009 11.571V9a4 4 0 00-8 0v1.754a18.86 18.86 0 01-3.136 9.726M15.347 12A6 6 0 117.92 6H9.17a6.002 6.002 0 01-2.083 4.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 bg-clip-text text-transparent">
              Smart Attendance
            </h1>
            <p className="text-xs text-slate-500 font-medium tracking-wide mt-1">
              SECURE ACCESS MANAGEMENT GATEWAY
            </p>
          </div>

          {/* Target authentication screens outlet */}
          <Outlet />

        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
