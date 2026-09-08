import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Users, UserCheck, Clock, UserMinus, AlertCircle, Calendar } from 'lucide-react';
import { fetchAttendanceStats, fetchTodayAttendance } from '../../../api/attendanceApi';
import StatsCard from '../../../components/common/StatsCard';
import DashboardWelcomeBanner from '../../../components/common/DashboardWelcomeBanner';

const StatusBadge = ({ status }) => {
  const map = {
    ON_TIME: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    LATE: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    ABSENT: 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status] || 'bg-slate-500/10 text-slate-500 border-slate-500/20'}`}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsData, todayData] = await Promise.all([
          fetchAttendanceStats(),
          fetchTodayAttendance()
        ]);
        setStats(statsData);
        setRecentActivity(todayData.slice(0, 8));
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
        setError('Unable to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const statCards = [
    { 
      title: 'Total Employees', 
      value: stats?.totalEmployees ?? 0, 
      icon: Users,
      watermarkIcon: Users,
      colorClass: 'text-blue-600 bg-blue-100', 
      accentColor: '#3b82f6',
      bgGradient: 'bg-gradient-to-br from-blue-50/70 via-white to-blue-50/20',
      trend: { text: '↑ 0%', label: 'No change from last month', isPositive: true }
    },
    { 
      title: 'Present Today', 
      value: stats?.presentToday ?? 0, 
      icon: Calendar,
      watermarkIcon: Calendar,
      colorClass: 'text-emerald-600 bg-emerald-100', 
      accentColor: '#10b981',
      bgGradient: 'bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/20',
      trend: { text: '→ 0%', label: 'No change from last month', colorClass: 'text-slate-500 font-semibold' }
    },
    { 
      title: 'Late Arrivals', 
      value: stats?.lateToday ?? 0, 
      icon: Clock,
      watermarkIcon: Clock,
      colorClass: 'text-amber-600 bg-amber-100', 
      accentColor: '#f59e0b',
      bgGradient: 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/20',
      trend: { text: '→ 0%', label: 'No change from last month', colorClass: 'text-slate-500 font-semibold' }
    },
    { 
      title: 'Absent Today', 
      value: stats?.absentToday ?? 0, 
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
      {/* Welcome Banner */}
      <DashboardWelcomeBanner
        badge="Administrative Console"
        title={`Welcome back, ${user?.fullName || 'Administrator'}!`}
        subtitle="You are logged in as an Administrator. Manage employees, monitor real-time attendance, and oversee operational data from this console."
      />

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
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

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <Calendar size={18} className="text-blue-500" />
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Today's Attendance Activity</h3>
          <span className="ml-auto text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-3.5">Employee</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Check-in Time</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Kiosk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-3.5">
                        <div className="h-4 bg-slate-200/70 animate-pulse rounded w-24"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentActivity.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-400 text-sm">
                    No attendance records found for today.
                  </td>
                </tr>
              ) : (
                recentActivity.map((record, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {(record.employee?.fullName || record.employeeName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-900 font-medium text-sm">{record.employee?.fullName || record.employeeName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600 text-sm">{record.employee?.department || record.department || '-'}</td>
                    <td className="px-6 py-3.5 text-slate-600 text-sm font-mono">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-3.5"><StatusBadge status={record.status} /></td>
                    <td className="px-6 py-3.5 text-slate-500 text-sm">{record.kiosk?.name || record.kioskLocation || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
