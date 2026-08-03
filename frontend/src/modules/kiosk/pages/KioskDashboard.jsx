import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Fingerprint, Camera, ShieldAlert, Wifi } from 'lucide-react';

/**
 * Kiosk Dashboard Landing Page
 * Displays welcome info, hardware status parameters, and configuration fields
 */
const KioskDashboard = () => {
  const { user, role } = useAuth();

  const stats = [
    { name: 'Kiosk Socket Connection', value: 'ESTABLISHED', desc: 'Real-time WebSocket Connection', icon: Wifi, color: 'text-indigo-400', bg: 'bg-indigo-500/10 border-indigo-500/20' },
    { name: 'On-board camera status', value: 'INTEGRATED', desc: 'Camera Input Operational', icon: Camera, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    { name: 'Attendance Actions Handled', value: '256 Checks', desc: 'Total Registrations Logged', icon: Fingerprint, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    { name: 'Security Verification Status', value: 'VERIFIED', desc: 'Device Key Authorized', icon: ShieldAlert, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800/80 p-8">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            Terminal Endpoint
          </span>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Kiosk Device: {user?.fullName || 'Device Terminal'}
          </h2>
          <p className="text-sm text-slate-400 max-w-xl">
            This viewport displays state telemetry for Kiosk Device <strong className="text-slate-205">{user?.employeeId || 'KIOSK-DEV'}</strong>. In production, this client runs on dedicated kiosk hardware to capture and verify face templates.
          </p>
        </div>
      </div>

      {/* Grid of Key Kiosk Parameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className={`rounded-2xl border p-6 bg-slate-900/50 backdrop-blur-md flex items-center justify-between transition-all duration-300 hover:-translate-y-1 ${stat.bg}`}
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-wider text-slate-450 uppercase">{stat.name}</p>
                <p className="text-2xl font-black text-white">{stat.value}</p>
                <p className="text-[10px] text-slate-500 font-medium">{stat.desc}</p>
              </div>
              <div className={`p-3 rounded-xl bg-slate-950/80 border border-slate-800 ${stat.color}`}>
                <Icon className="w-5 h-5" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Hardware / Software Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800/80 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Kiosk Device Information
          </h3>
          <div className="border border-slate-800 rounded-xl divide-y divide-slate-800 font-mono text-xs overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 bg-slate-900/40">
              <span className="text-slate-400">Model Name / Build Version:</span>
              <span className="text-slate-200 font-semibold">Attendance-Kiosk-v1.0 (React 19)</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-slate-900/40">
              <span className="text-slate-400">Server Authentication Mode:</span>
              <span className="text-indigo-400 font-semibold">CORS Enabled HttpOnly Cookie JWT</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-slate-900/40">
              <span className="text-slate-400">Status Check:</span>
              <span className="text-emerald-400 font-semibold">OPERATIONAL</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-slate-900 border border-slate-800/80 p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Device Metadata
          </h3>
          <div className="bg-slate-950/50 border border-slate-850 p-5 rounded-xl space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-400">
                KSK
              </div>
              <div>
                <p className="text-xs font-bold text-white">{user?.fullName}</p>
                <p className="text-[10px] text-slate-500 uppercase font-mono">{role}</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-slate-800 text-[11px] font-medium text-slate-400">
              <p>Device Key ID: <span className="text-slate-200 font-mono">{user?.employeeId}</span></p>
              <p>Email Registered: <span className="text-slate-200">{user?.email}</span></p>
              <p>Device DB Reference: <span className="text-slate-200 font-mono text-[10px]">{user?._id}</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default KioskDashboard;
