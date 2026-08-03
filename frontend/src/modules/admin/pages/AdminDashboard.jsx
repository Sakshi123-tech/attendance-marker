import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Users, UserCheck, Clock, UserMinus, AlertCircle, Calendar } from 'lucide-react';
import { fetchAttendanceStats, fetchTodayAttendance } from '../../../api/attendanceApi';
import StatsCard from '../../../components/common/StatsCard';

const StatusBadge = ({ status }) => {
  const map = {
    ON_TIME: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    LATE: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ABSENT: 'bg-red-500/10 text-red-400 border-red-500/20',
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status] || 'bg-slate-500/10 text-slate-400 border-slate-500/20'}`}>
      {status}
    </span>
  );
};

const AdminDashboard = () => {
  const { user, role } = useAuth();
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
    { title: 'Total Employees', value: stats?.totalEmployees ?? 0, icon: Users, colorClass: 'text-indigo-400 bg-indigo-500/10 border border-indigo-500/20' },
    { title: 'Present Today', value: stats?.presentToday ?? 0, icon: UserCheck, colorClass: 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20' },
    { title: 'Late Arrivals', value: stats?.lateToday ?? 0, icon: Clock, colorClass: 'text-amber-400 bg-amber-500/10 border border-amber-500/20' },
    { title: 'Absent Today', value: stats?.absentToday ?? 0, icon: UserMinus, colorClass: 'text-red-400 bg-red-500/10 border border-red-500/20' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-8 shadow-sm">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-50 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-600 border border-blue-100 uppercase tracking-wider">
            Administrative Console
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Welcome back, {user?.fullName}!
          </h2>
          <p className="text-sm text-slate-500 max-w-xl">
            You are logged in as an <strong className="text-slate-700">Administrator</strong>. Manage employees, monitor attendance, and oversee operational data from this console.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <StatsCard key={i} title={stat.title} value={stat.value} icon={stat.icon} colorClass={stat.colorClass} loading={loading} />
        ))}
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50">
          <Calendar size={18} className="text-blue-500" />
          <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Today's Attendance Activity</h3>
          <span className="ml-auto text-xs text-slate-500">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">Check-in Time</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Kiosk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-3">
                        <div className="h-4 bg-slate-700 animate-pulse rounded w-24"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : recentActivity.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-10 text-center text-slate-500 text-sm">
                    No attendance records found for today.
                  </td>
                </tr>
              ) : (
                recentActivity.map((record, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                          {(record.employee?.fullName || record.employeeName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <span className="text-slate-900 font-medium text-sm">{record.employee?.fullName || record.employeeName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-slate-600 text-sm">{record.employee?.department || record.department || '-'}</td>
                    <td className="px-6 py-3 text-slate-600 text-sm font-mono">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                    </td>
                    <td className="px-6 py-3"><StatusBadge status={record.status} /></td>
                    <td className="px-6 py-3 text-slate-500 text-sm">{record.kiosk?.name || record.kioskLocation || '-'}</td>
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


