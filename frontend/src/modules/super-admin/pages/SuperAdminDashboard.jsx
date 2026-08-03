import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Users, UserCheck, Clock, UserMinus, AlertCircle } from 'lucide-react';
import { fetchDashboardStats } from '../../../api/dashboardApi';
import StatsCard from '../../../components/common/StatsCard';

const SuperAdminDashboard = () => {
  const { user, role } = useAuth();
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getStats = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardStats();
        setStatsData(data);
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
        setError('Unable to load attendance statistics.');
      } finally {
        setLoading(false);
      }
    };

    getStats();
  }, []);

  const statCards = [
    { 
      title: 'Total Employees', 
      value: statsData?.totalEmployees || 0, 
      icon: Users, 
      colorClass: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' 
    },
    { 
      title: 'Present Today', 
      value: statsData?.presentToday || 0, 
      icon: UserCheck, 
      colorClass: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' 
    },
    { 
      title: 'Late Today', 
      value: statsData?.lateToday || 0, 
      icon: Clock, 
      colorClass: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' 
    },
    { 
      title: 'Absent Today', 
      value: statsData?.absentToday || 0, 
      icon: UserMinus, 
      colorClass: 'text-red-400 bg-red-500/10 border border-red-500/20' 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-white via-indigo-50 to-white border border-slate-200 p-8 shadow-sm">
        <div className="absolute right-0 top-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider">
            System Control Centre
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.fullName}!
          </h2>
          <p className="text-sm text-slate-600 max-w-xl">
            You are authenticated as a <strong className="text-slate-900">Super Administrator</strong>. You hold full system privileges, enabling system config modifications, root audits, and server provisioning actions.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Grid of Key System Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <StatsCard 
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            colorClass={stat.colorClass}
            loading={loading}
          />
        ))}
      </div>

      {/* Quick Setup Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            System Security Diagnostics
          </h3>
          <div className="border border-slate-200 rounded-xl divide-y divide-slate-200 font-mono text-xs overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3 bg-slate-50">
              <span className="text-slate-500">Database Handshake:</span>
              <span className="text-emerald-600 font-semibold">ONLINE (MongoDB)</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-slate-50">
              <span className="text-slate-500">Socket Connection:</span>
              <span className="text-emerald-600 font-semibold">ESTABLISHED (WebSocket)</span>
            </div>
            <div className="flex justify-between items-center px-4 py-3 bg-slate-50">
              <span className="text-slate-500">Session Handshake API:</span>
              <span className="text-indigo-600 font-semibold">HttpOnly Cookie JWT</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Identity Card
          </h3>
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center font-bold text-indigo-700 text-lg shadow-sm">
                SA
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-500 uppercase font-mono">{role}</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-slate-200 text-xs font-medium text-slate-500">
              <p>Email: <span className="text-slate-900">{user?.email}</span></p>
              <p>Permissions: <span className="text-slate-900 font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">ALL_ACCESS</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
