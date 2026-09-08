import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Link } from 'react-router-dom';
import { 
  Calendar, CheckCircle, Clock, 
  Fingerprint, FileText, User, AlertCircle 
} from 'lucide-react';
import { fetchMyHistory } from '../../../api/attendanceApi';
import StatsCard from '../../../components/common/StatsCard';
import DashboardWelcomeBanner from '../../../components/common/DashboardWelcomeBanner';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Derived stats
  const [metrics, setMetrics] = useState({
    todayStatus: 'NOT_CHECKED_IN',
    todayCheckIn: null,
    totalWorkingDays: 0,
    presentCount: 0,
    lateCount: 0,
    absentCount: 0,
    attendancePercent: 0,
    latePercent: 0
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const records = await fetchMyHistory();
        setHistory(records);

        // Calculate metrics
        let present = 0;
        let late = 0;
        let absent = 0;
        let todayStatus = 'NOT_CHECKED_IN';
        let todayCheckIn = null;
        
        const todayStr = new Date().toDateString();

        records.forEach(r => {
          if (r.status === 'ON_TIME') present++;
          if (r.status === 'LATE') late++;
          if (r.status === 'ABSENT') absent++;

          const rDate = new Date(r.date).toDateString();
          if (rDate === todayStr) {
            todayStatus = r.status;
            todayCheckIn = r.checkInTime;
          }
        });

        const total = present + late + absent;
        const attendancePercent = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
        const latePercent = (present + late) > 0 ? Math.round((late / (present + late)) * 100) : 0;

        setMetrics({
          todayStatus,
          todayCheckIn,
          totalWorkingDays: total,
          presentCount: present + late,
          lateCount: late,
          absentCount: absent,
          attendancePercent,
          latePercent
        });
      } catch (err) {
        console.error('Error fetching employee dashboard data:', err);
        setError('Unable to load attendance data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const StatusBadge = ({ status }) => {
    const map = {
      ON_TIME: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      LATE: 'bg-amber-100 text-amber-700 border-amber-200',
      ABSENT: 'bg-red-100 text-red-700 border-red-200',
      NOT_CHECKED_IN: 'bg-slate-100 text-slate-600 border-slate-200'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${map[status] || map.NOT_CHECKED_IN}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const quickActions = [
    { name: 'Register Face', icon: Fingerprint, path: '/employee/register-face', color: 'text-indigo-600 bg-indigo-50 border-indigo-100' },
    { name: 'Apply Leave', icon: FileText, path: '/employee/leaves', color: 'text-emerald-600 bg-emerald-50 border-emerald-100' },
    { name: 'My Attendance', icon: Calendar, path: '/employee/my-attendance', color: 'text-blue-600 bg-blue-50 border-blue-100' },
    { name: 'My Profile', icon: User, path: '/employee/profile', color: 'text-purple-600 bg-purple-50 border-purple-100' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Welcome & Today Status */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-2/3">
          <DashboardWelcomeBanner
            badge="Employee Portal"
            title={`Hello, ${user?.fullName || 'Employee'}!`}
            subtitle="Welcome to your personal dashboard. Manage your attendance, leaves, and profile settings from here."
          />
        </div>

        <div className="lg:w-1/3 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col justify-center items-center text-center shadow-xs">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Today's Status</h3>
          <StatusBadge status={metrics.todayStatus} />
          {metrics.todayCheckIn ? (
            <p className="mt-4 text-3xl font-black text-slate-800 font-mono">
              {new Date(metrics.todayCheckIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          ) : (
            <p className="mt-4 text-xl font-bold text-slate-400">Not Checked In</p>
          )}
          <p className="text-xs text-slate-400 mt-2 font-medium">Check-in Time</p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Attendance %" 
          value={`${metrics.attendancePercent}%`} 
          icon={CheckCircle} 
          watermarkIcon={CheckCircle}
          colorClass="text-emerald-600 bg-emerald-100" 
          accentColor="#10b981" 
          bgGradient="bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/20"
          trend={{ text: '↑ 0%', label: 'Current period', isPositive: true }}
          loading={loading} 
        />
        <StatsCard 
          title="Late %" 
          value={`${metrics.latePercent}%`} 
          icon={Clock} 
          watermarkIcon={Clock}
          colorClass="text-amber-600 bg-amber-100" 
          accentColor="#f59e0b" 
          bgGradient="bg-gradient-to-br from-amber-50/70 via-white to-amber-50/20"
          trend={{ text: '→ 0%', label: 'Current period', colorClass: 'text-slate-500 font-semibold' }}
          loading={loading} 
        />
        <StatsCard 
          title="Total Working Days" 
          value={metrics.totalWorkingDays} 
          icon={Calendar} 
          watermarkIcon={Calendar}
          colorClass="text-blue-600 bg-blue-100" 
          accentColor="#3b82f6" 
          bgGradient="bg-gradient-to-br from-blue-50/70 via-white to-blue-50/20"
          trend={{ text: '↑ 0%', label: 'Total recorded', isPositive: true }}
          loading={loading} 
        />
        <StatsCard 
          title="Days Absent" 
          value={metrics.absentCount} 
          icon={AlertCircle} 
          watermarkIcon={AlertCircle}
          colorClass="text-rose-600 bg-rose-100" 
          accentColor="#ef4444" 
          bgGradient="bg-gradient-to-br from-rose-50/70 via-white to-rose-50/20"
          trend={{ text: '→ 0%', label: 'Days unexcused', colorClass: 'text-slate-500 font-semibold' }}
          loading={loading} 
        />
      </div>

      {/* Bottom Grid: Quick Actions & Upcoming Holidays */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 flex-1">
            {quickActions.map((action, i) => {
              const Icon = action.icon;
              return (
                <Link key={i} to={action.path} className={`group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${action.color}`}>
                  <Icon className="w-8 h-8 mb-3 opacity-80 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-semibold">{action.name}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upcoming Holidays */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden flex flex-col shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Upcoming Holidays</h3>
            <span className="text-xs text-slate-500 font-medium">Current Year</span>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex flex-col items-center justify-center text-blue-700">
                    <span className="text-[10px] font-bold uppercase leading-none">Aug</span>
                    <span className="text-sm font-black leading-none mt-0.5">15</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Independence Day</p>
                    <p className="text-xs text-slate-500">National Holiday</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">38 Days</span>
              </div>
              
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex flex-col items-center justify-center text-emerald-700">
                    <span className="text-[10px] font-bold uppercase leading-none">Oct</span>
                    <span className="text-sm font-black leading-none mt-0.5">02</span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">Gandhi Jayanti</p>
                    <p className="text-xs text-slate-500">National Holiday</p>
                  </div>
                </div>
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">Upcoming</span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default EmployeeDashboard;
