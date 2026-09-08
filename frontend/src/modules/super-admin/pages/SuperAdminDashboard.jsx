import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Users, UserCheck, Clock, UserMinus, AlertCircle, Shield, Database, Wifi, Code, Mail, Lock, Calendar } from 'lucide-react';
import { fetchDashboardStats } from '../../../api/dashboardApi';
import StatsCard from '../../../components/common/StatsCard';
import DashboardWelcomeBanner from '../../../components/common/DashboardWelcomeBanner';

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
      value: statsData?.totalEmployees ?? 0, 
      icon: Users,
      watermarkIcon: Users,
      colorClass: 'text-blue-600 bg-blue-100',
      accentColor: '#3b82f6',
      bgGradient: 'bg-gradient-to-br from-blue-50/70 via-white to-blue-50/20',
      trend: { text: '↑ 0%', label: 'No change from last month', isPositive: true }
    },
    { 
      title: 'Present Today', 
      value: statsData?.presentToday ?? 0, 
      icon: Calendar,
      watermarkIcon: Calendar,
      colorClass: 'text-emerald-600 bg-emerald-100',
      accentColor: '#10b981',
      bgGradient: 'bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/20',
      trend: { text: '→ 0%', label: 'No change from last month', colorClass: 'text-slate-500 font-semibold' }
    },
    { 
      title: 'Late Today', 
      value: statsData?.lateToday ?? 0, 
      icon: Clock,
      watermarkIcon: Clock,
      colorClass: 'text-amber-600 bg-amber-100',
      accentColor: '#f59e0b',
      bgGradient: 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/20',
      trend: { text: '→ 0%', label: 'No change from last month', colorClass: 'text-slate-500 font-semibold' }
    },
    { 
      title: 'Absent Today', 
      value: statsData?.absentToday ?? 0, 
      icon: UserMinus,
      watermarkIcon: UserMinus,
      colorClass: 'text-rose-600 bg-rose-100',
      accentColor: '#ef4444',
      bgGradient: 'bg-gradient-to-br from-rose-50/70 via-white to-rose-50/20',
      trend: { text: '↑ 100%', label: 'Compared to last month', isPositive: false }
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner Card */}
      <DashboardWelcomeBanner 
        badge="System Control Centre"
        title={`Welcome back, ${user?.fullName || 'Super Administrator'}!`}
        subtitle="You are authenticated as a Super Administrator. You hold full system privileges, enabling system config modifications, root audits, and server provisioning actions."
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Grid of Key System Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StatsCard 
            key={i}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            watermarkIcon={stat.watermarkIcon}
            colorClass={stat.colorClass}
            accentColor={stat.accentColor}
            bgGradient={stat.bgGradient}
            trend={stat.trend}
            loading={loading}
          />
        ))}
      </div>

      {/* Quick Setup Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              System Security Diagnostics
            </h3>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              System Healthy
            </span>
          </div>
          <div className="border border-slate-200 rounded-lg divide-y divide-slate-200 text-sm overflow-hidden">
            <div className="flex justify-between items-center px-4 py-3">
              <div className="flex items-center gap-3">
                <Database size={16} className="text-slate-400" />
                <span className="text-slate-500">Database Handshake:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-600 font-semibold">ONLINE (MongoDB)</span>
              </div>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <div className="flex items-center gap-3">
                <Wifi size={16} className="text-slate-400" />
                <span className="text-slate-500">Socket Connection:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-emerald-600 font-semibold">ESTABLISHED (WebSocket)</span>
              </div>
            </div>
            <div className="flex justify-between items-center px-4 py-3">
              <div className="flex items-center gap-3">
                <Code size={16} className="text-slate-400" />
                <span className="text-slate-500">Session Handshake API:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-indigo-600 font-semibold">HttpOnly Cookie JWT</span>
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white border border-slate-200 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Shield size={16} className="text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Identity Card
            </h3>
          </div>
          <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-blue-500 flex items-center justify-center font-bold text-white text-lg shadow-md">
                SA
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">{user?.fullName}</p>
                <p className="text-xs text-slate-500 uppercase font-mono">{role}</p>
              </div>
            </div>
            <div className="space-y-1.5 pt-3 border-t border-slate-200 text-xs font-medium text-slate-500">
              <p className="flex items-center gap-2">
                <Mail size={12} className="text-slate-400" />
                Email: <span className="text-indigo-600 underline">{user?.email}</span>
              </p>
              <p className="flex items-center gap-2">
                <Lock size={12} className="text-slate-400" />
                Permissions: <span className="text-slate-900 font-mono text-[10px] bg-slate-200 px-1 py-0.5 rounded">ALL_ACCESS</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;
