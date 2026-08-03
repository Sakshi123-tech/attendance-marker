import React, { useState, useEffect } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { BarChart2, AlertCircle } from 'lucide-react';
import { fetchAllAttendance } from '../../../api/attendanceApi';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#f59e0b', '#ef4444', '#10b981', '#3b82f6', '#8b5cf6'];

const DepartmentAnalyticsPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchAllAttendance();
        setRecords(data);
      } catch (err) {
        setError('Failed to load attendance data for analytics.');
        toast.error('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Group records by department
  const deptMap = {};
  records.forEach(r => {
    const dept = r.employee?.department || r.department || 'Unknown';
    if (!deptMap[dept]) deptMap[dept] = { department: dept, ON_TIME: 0, LATE: 0, ABSENT: 0 };
    deptMap[dept][r.status] = (deptMap[dept][r.status] || 0) + 1;
  });

  const deptData = Object.values(deptMap);

  // Overall totals for pie
  const totalOnTime = records.filter(r => r.status === 'ON_TIME').length;
  const totalLate = records.filter(r => r.status === 'LATE').length;
  const totalAbsent = records.filter(r => r.status === 'ABSENT').length;
  const pieData = [
    { name: 'On Time', value: totalOnTime, color: '#10b981' },
    { name: 'Late', value: totalLate, color: '#f59e0b' },
    { name: 'Absent', value: totalAbsent, color: '#ef4444' },
  ];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xl text-sm">
          <p className="text-slate-800 font-bold mb-2">{label}</p>
          {payload.map((p, i) => (
            <p key={i} style={{ color: p.color }} className="font-medium">{p.name}: {p.value}</p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-slate-500">
        <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p>Loading analytics data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Department Analytics</h2>
        <p className="text-sm text-slate-500 mt-1">Department-wise attendance breakdown and overall trend analysis.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Department Summary Cards */}
      {deptData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {deptData.map((dept, i) => (
            <div key={dept.department} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: COLORS[i % COLORS.length] + '18', color: COLORS[i % COLORS.length] }}>
                  <BarChart2 size={16} />
                </div>
                <h3 className="text-slate-800 font-semibold">{dept.department}</h3>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-emerald-50 rounded-lg p-2">
                  <p className="text-emerald-600 text-lg font-black">{dept.ON_TIME || 0}</p>
                  <p className="text-emerald-500 text-[10px] font-medium">ON TIME</p>
                </div>
                <div className="bg-amber-50 rounded-lg p-2">
                  <p className="text-amber-600 text-lg font-black">{dept.LATE || 0}</p>
                  <p className="text-amber-500 text-[10px] font-medium">LATE</p>
                </div>
                <div className="bg-red-50 rounded-lg p-2">
                  <p className="text-red-600 text-lg font-black">{dept.ABSENT || 0}</p>
                  <p className="text-red-500 text-[10px] font-medium">ABSENT</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {deptData.length === 0 && !loading && (
        <div className="bg-white border border-slate-200 border-dashed rounded-xl p-12 text-center text-slate-400 shadow-sm">
          <BarChart2 size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="font-medium text-slate-600">No analytics data available</p>
          <p className="text-sm mt-1">Attendance records will appear here once employees start checking in.</p>
        </div>
      )}

      {/* Charts Row */}
      {deptData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Department Breakdown</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deptData} margin={{ top: 0, right: 0, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="department" tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis tick={{ fill: '#64748b', fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
                <Bar dataKey="ON_TIME" name="On Time" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="LATE" name="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="ABSENT" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-6">Overall Attendance Distribution</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#94a3b8' }}>
                  {pieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontSize: '12px', color: '#64748b' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentAnalyticsPage;
