import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, Clock, UserCheck, UserMinus, Users } from 'lucide-react';
import { fetchTodayAttendance, fetchAllAttendance } from '../../../api/attendanceApi';
import SearchBar from '../../../components/common/SearchBar';
import EmptyState from '../../../components/common/EmptyState';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const styles = {
    ON_TIME: { cls: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', dot: 'bg-emerald-500' },
    LATE:    { cls: 'bg-amber-500/10 text-amber-400 border-amber-500/20',   dot: 'bg-amber-500' },
    ABSENT:  { cls: 'bg-red-500/10 text-red-400 border-red-500/20',          dot: 'bg-red-500' },
  };
  const s = styles[status] || { cls: 'bg-slate-100 text-slate-500 border-slate-200', dot: 'bg-slate-500' };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${s.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
};

const AttendanceMonitorPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [departmentFilter, setDepartmentFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('today');
  const [departments, setDepartments] = useState([]);

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
      setRecords(data);
      // Extract unique departments
      const depts = [...new Set(data.map(r => r.employee?.department || r.department).filter(Boolean))];
      setDepartments(depts);
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Attendance Monitor</h2>
          <p className="text-sm text-slate-500 mt-1">Live view of employee check-ins, statuses, and kiosk activity.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${dateFilter === 'today' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-600 border-slate-200 hover:border-slate-300 bg-white'}`}
          >Today</button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${dateFilter === 'all' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'text-slate-600 border-slate-200 hover:border-slate-300 bg-white'}`}
          >All Records</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', val: summary.total, icon: Users, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
          { label: 'On Time', val: summary.onTime, icon: UserCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Late', val: summary.late, icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
          { label: 'Absent', val: summary.absent, icon: UserMinus, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
        ].map((s, i) => (
          <div key={i} className={`p-4 rounded-xl border flex items-center justify-between ${s.color} bg-white`}>
            <div>
              <p className="text-xs font-medium opacity-70">{s.label}</p>
              {loading ? <div className="h-7 w-12 bg-slate-200 animate-pulse rounded mt-1" /> : <p className="text-2xl font-black mt-0.5">{s.val}</p>}
            </div>
            <s.icon size={24} className="opacity-60" />
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by employee name..." />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-blue-500 sm:w-40">
          <option value="ALL">All Status</option>
          <option value="ON_TIME">On Time</option>
          <option value="LATE">Late</option>
          <option value="ABSENT">Absent</option>
        </select>
        <select value={departmentFilter} onChange={e => setDepartmentFilter(e.target.value)}
          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-blue-500 sm:w-44">
          <option value="ALL">All Departments</option>
          {departments.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Check-in Time</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Kiosk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-200 animate-pulse rounded w-28" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="py-2">
                  <EmptyState icon={Calendar} title="No Records Found" message="No attendance records match your current filters." />
                </td></tr>
              ) : (
                filtered.map((record, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold shadow-sm">
                          {(record.employee?.fullName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium text-sm">{record.employee?.fullName || 'Unknown'}</p>
                          <p className="text-slate-500 text-xs">{record.employee?.employeeId || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600 text-sm">{record.employee?.department || record.department || '—'}</td>
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
