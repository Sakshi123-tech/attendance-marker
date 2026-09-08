import React, { useState, useEffect } from 'react';
import { Search, Calendar, Clock, UserCheck, UserMinus, Users, ChevronRight } from 'lucide-react';
import { fetchTodayAttendance, fetchAllAttendance } from '../../../api/attendanceApi';
import EmptyState from '../../../components/common/EmptyState';
import CustomDropdown from '../../../components/common/CustomDropdown';
import { DEPARTMENTS } from '../../../components/common/constants';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    ON_TIME: { cls: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', dot: 'bg-emerald-500' },
    LATE:    { cls: 'bg-amber-500/10 text-amber-600 border-amber-500/20',   dot: 'bg-amber-500' },
    ABSENT:  { cls: 'bg-rose-500/10 text-rose-600 border-rose-500/20',     dot: 'bg-rose-500' },
  };
  const s = styles[status] || { cls: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-400' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status?.replace('_', ' ')}
    </span>
  );
};

/* ── Calendar Vector Banner Illustration ── */
const CalendarBannerGraphic = () => (
  <svg 
    viewBox="0 0 220 150" 
    className="w-full h-full object-contain pointer-events-none select-none"
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient id="calHalo" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.35" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="calHeaderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="100%" stopColor="#2563eb" />
      </linearGradient>
      <linearGradient id="calClockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#60a5fa" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>
      <filter id="calShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="5" stdDeviation="6" floodColor="#3b82f6" floodOpacity="0.12" />
      </filter>
    </defs>

    <ellipse cx="110" cy="75" rx="80" ry="50" fill="url(#calHalo)" />

    {/* Calendar Body */}
    <g transform="translate(35, 18)" filter="url(#calShadow)">
      {/* Back calendar card */}
      <rect x="0" y="0" width="92" height="85" rx="12" fill="#ffffff" stroke="#e2e8f0" strokeWidth="1.5" />
      
      {/* Top Header Bar */}
      <path d="M0 12 C0 5.373 5.373 0 12 0 L80 0 C86.627 0 92 5.373 92 12 L92 24 L0 24 Z" fill="url(#calHeaderGrad)" />
      
      {/* Rings */}
      <rect x="18" y="-5" width="5" height="10" rx="2.5" fill="#cbd5e1" />
      <rect x="68" y="-5" width="5" height="10" rx="2.5" fill="#cbd5e1" />

      {/* Grid boxes / Days representation */}
      <g fill="#e2e8f0">
        <rect x="12" y="34" width="11" height="9" rx="2" />
        <rect x="29" y="34" width="11" height="9" rx="2" />
        <rect x="46" y="34" width="11" height="9" rx="2" />
        <rect x="63" y="34" width="11" height="9" rx="2" fill="#93c5fd" />

        <rect x="12" y="48" width="11" height="9" rx="2" />
        <rect x="29" y="48" width="11" height="9" rx="2" fill="#60a5fa" />
        <rect x="46" y="48" width="11" height="9" rx="2" />
        <rect x="63" y="48" width="11" height="9" rx="2" />

        <rect x="12" y="62" width="11" height="9" rx="2" />
        <rect x="29" y="62" width="11" height="9" rx="2" />
        <rect x="46" y="62" width="11" height="9" rx="2" />
        <rect x="63" y="62" width="11" height="9" rx="2" />
      </g>
    </g>

    {/* Overlapping Clock Graphic */}
    <g transform="translate(100, 55)" filter="url(#calShadow)">
      <circle cx="24" cy="24" r="22" fill="url(#calClockGrad)" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="2" fill="#ffffff" />
      <path d="M24 12 L24 24 L32 24" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Decorative Green Leaves on Right */}
    <g transform="translate(145, 70)">
      <path d="M8 35 C8 22 25 15 30 5 C31 18 22 30 10 37 Z" fill="#818cf8" opacity="0.8" />
      <path d="M6 37 C6 26 -4 18 -6 8 C-8 20 -1 33 6 39 Z" fill="#6366f1" opacity="0.6" />
    </g>
  </svg>
);

const AttendanceMonitorPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('today');
  const [departments, setDepartments] = useState(DEPARTMENTS);

  useEffect(() => {
    loadAttendance();
  }, [dateFilter]);

  const loadAttendance = async () => {
    try {
      setLoading(true);
      let data;
      if (dateFilter === 'today') {
        data = await fetchTodayAttendance();
      } else {
        data = await fetchAllAttendance(dateFilter !== 'all' ? { date: dateFilter } : {});
      }
      setRecords(data || []);
      
      const deptsFromRecords = (data || []).map(r => r.employee?.department || r.department).filter(Boolean);
      const uniqueDepts = Array.from(new Set([...DEPARTMENTS, ...deptsFromRecords]));
      setDepartments(uniqueDepts);
    } catch (err) {
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const filtered = records.filter(r => {
    const name = r.employee?.fullName || r.employeeName || '';
    const dept = r.employee?.department || r.department || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = departmentFilter === 'ALL' || dept === departmentFilter;
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    return matchesSearch && matchesDept && matchesStatus;
  });

  const summary = {
    total: records.length,
    onTime: records.filter(r => r.status === 'ON_TIME').length,
    late: records.filter(r => r.status === 'LATE').length,
    absent: records.filter(r => r.status === 'ABSENT').length,
  };

  const statCards = [
    {
      title: 'Total Records',
      value: summary.total,
      icon: Users,
      accentColor: '#3b82f6',
      iconBg: 'bg-blue-100 text-blue-600',
      bgGradient: 'bg-gradient-to-br from-blue-50/70 via-white to-blue-50/20',
      arrowBg: 'bg-blue-50 text-blue-500'
    },
    {
      title: 'On Time',
      value: summary.onTime,
      icon: Clock,
      accentColor: '#10b981',
      iconBg: 'bg-emerald-100 text-emerald-600',
      bgGradient: 'bg-gradient-to-br from-emerald-50/70 via-white to-emerald-50/20',
      arrowBg: 'bg-emerald-50 text-emerald-500'
    },
    {
      title: 'Late',
      value: summary.late,
      icon: Clock,
      accentColor: '#f59e0b',
      iconBg: 'bg-amber-100 text-amber-600',
      bgGradient: 'bg-gradient-to-br from-amber-50/70 via-white to-amber-50/20',
      arrowBg: 'bg-amber-50 text-amber-500'
    },
    {
      title: 'Absent',
      value: summary.absent,
      icon: UserMinus,
      accentColor: '#ef4444',
      iconBg: 'bg-rose-100 text-rose-600',
      bgGradient: 'bg-gradient-to-br from-rose-50/70 via-white to-rose-50/20',
      arrowBg: 'bg-rose-50 text-rose-500'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-50/90 via-[#f8faff] to-indigo-50/70 border border-slate-200/90 p-6 md:p-7 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Calendar Vector graphic positioned in the middle-right so it NEVER overlaps with the toggle buttons */}
        <div className="absolute right-48 lg:right-56 top-1/2 -translate-y-1/2 w-48 md:w-56 h-32 pointer-events-none opacity-85 hidden sm:block">
          <CalendarBannerGraphic />
        </div>

        {/* Left Content */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-xs shrink-0">
            <Calendar size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Monitoring</h2>
            <p className="text-sm text-slate-500 mt-0.5 font-normal">Live view of employee check-ins, statuses, and kiosk activity.</p>
          </div>
        </div>

        {/* Date Filter Pills - On far right with explicit z-index and no overlap */}
        <div className="relative z-20 flex items-center bg-white/95 backdrop-blur-xs p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              dateFilter === 'today' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              dateFilter === 'all' 
                ? 'bg-blue-600 text-white shadow-xs' 
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            All Records
          </button>
        </div>
      </div>

      {/* 2. Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div 
              key={i} 
              className={`rounded-2xl p-5 flex items-center justify-between border border-slate-200/90 shadow-xs relative overflow-hidden transition-all duration-200 hover:shadow-md ${card.bgGradient}`}
              style={{
                borderLeftWidth: '4px',
                borderLeftStyle: 'solid',
                borderLeftColor: card.accentColor
              }}
            >
              {/* Left icon and stats */}
              <div className="flex items-center gap-3.5 relative z-10">
                <div className={`w-11 h-11 rounded-full flex items-center justify-center shrink-0 ${card.iconBg}`}>
                  <Icon size={20} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-slate-500 text-xs font-semibold tracking-wide">{card.title}</p>
                  {loading ? (
                    <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1" />
                  ) : (
                    <p className="text-2xl font-extrabold text-slate-900 mt-0.5">{card.value}</p>
                  )}
                </div>
              </div>

              {/* Right Chevron */}
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${card.arrowBg} opacity-80`}>
                <ChevronRight size={14} />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by employee name..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50/60 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          />
        </div>
        
        <CustomDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'ALL', label: 'All Status' },
            { value: 'ON_TIME', label: 'On Time' },
            { value: 'LATE', label: 'Late' },
            { value: 'ABSENT', label: 'Absent' }
          ]}
          className="sm:w-44"
        />

        <CustomDropdown
          value={departmentFilter}
          onChange={setDepartmentFilter}
          options={[
            { value: 'ALL', label: 'All Departments' },
            ...departments.map((d) => ({ value: d, label: d }))
          ]}
          className="sm:w-48"
        />
      </div>

      {/* 4. Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Check-in Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Kiosk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4">
                        <div className="h-4 bg-slate-200/70 animate-pulse rounded w-28" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-8">
                    <EmptyState 
                      icon={Calendar} 
                      title="No Records Found" 
                      message="No attendance records match your current filters." 
                    />
                  </td>
                </tr>
              ) : (
                filtered.map((record, i) => (
                  <tr key={i} className="hover:bg-slate-50/70 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shadow-2xs">
                          {(record.employee?.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-semibold text-sm">{record.employee?.fullName || 'Unknown'}</p>
                          <p className="text-slate-400 text-xs font-mono">{record.employee?.employeeId || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-medium">{record.employee?.department || record.department || '—'}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-mono">
                      {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '—'}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={record.status} /></td>
                    <td className="px-6 py-4 text-slate-500 text-sm">{record.kiosk?.name || record.kioskName || '—'}</td>
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

export default AttendanceMonitorPage;
