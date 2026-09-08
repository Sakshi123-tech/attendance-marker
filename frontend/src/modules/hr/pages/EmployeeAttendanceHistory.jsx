import React, { useState, useEffect } from 'react';
import { Calendar, User, Search, Clock, AlertCircle } from 'lucide-react';
import { fetchEmployees } from '../../../api/employeeApi';
import { fetchEmployeeAttendance } from '../../../api/attendanceApi';
import CustomDropdown from '../../../components/common/CustomDropdown';
import { useAuth } from '../../../context/AuthContext';

const EmployeeAttendanceHistory = () => {
  const { role: currentUserRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [stats, setStats] = useState({
    present: 0,
    late: 0,
    absent: 0,
    totalWorkingDays: 0
  });

  useEffect(() => {
    const loadEmployees = async () => {
      try {
        const data = await fetchEmployees();
        
        const allowedRoles = (() => {
          if (currentUserRole === 'SUPER_ADMIN') return ['ADMIN'];
          if (currentUserRole === 'ADMIN') return ['HR', 'EMPLOYEE'];
          if (currentUserRole === 'HR') return ['EMPLOYEE']; 
          return [];
        })();
        
        const filteredData = data.filter(e => allowedRoles.includes(e.role));
        
        // Sort alphabetically
        filteredData.sort((a, b) => a.fullName.localeCompare(b.fullName));
        setEmployees(filteredData);
      } catch (err) {
        console.error('Failed to load employees', err);
      }
    };
    loadEmployees();
  }, []);

  useEffect(() => {
    if (!selectedEmployeeId) {
      setAttendance([]);
      setStats({ present: 0, late: 0, absent: 0, totalWorkingDays: 0 });
      return;
    }

    const loadAttendance = async () => {
      setLoading(true);
      setError(null);
      try {
        const records = await fetchEmployeeAttendance(selectedEmployeeId);
        setAttendance(records);
        
        // Calculate stats
        let p = 0;
        let l = 0;
        let a = 0;
        records.forEach(r => {
          if (r.status === 'ON_TIME') p++;
          else if (r.status === 'LATE') l++;
          else if (r.status === 'ABSENT') a++;
        });
        
        setStats({
          present: p,
          late: l,
          absent: a,
          totalWorkingDays: p + l + a
        });
      } catch (err) {
        console.error(err);
        setError('Failed to fetch attendance history for the selected employee.');
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, [selectedEmployeeId]);

  const StatusBadge = ({ status }) => {
    const map = {
      ON_TIME: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      LATE: 'bg-amber-50 text-amber-600 border-amber-100',
      ABSENT: 'bg-red-50 text-red-600 border-red-100',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Attendance History</h2>
          <p className="text-sm text-slate-500 mt-1">Review detailed monthly logs for specific employees.</p>
        </div>
      </div>

      {/* Employee Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center">
        <div className="w-full sm:w-96">
          <CustomDropdown
            value={selectedEmployeeId}
            onChange={setSelectedEmployeeId}
            placeholder="Select an Employee..."
            options={employees.map((emp) => ({
              value: emp._id,
              label: `${emp.fullName} (${emp.employeeId})`
            }))}
            icon={User}
            className="w-full"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-red-600">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {selectedEmployeeId && !error && (
        <>
          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Days</p>
              <p className="text-2xl font-bold text-slate-900">{stats.totalWorkingDays}</p>
            </div>
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Present</p>
              <p className="text-2xl font-bold text-emerald-700">{stats.present}</p>
            </div>
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider mb-1">Late</p>
              <p className="text-2xl font-bold text-amber-700">{stats.late}</p>
            </div>
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 shadow-sm">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider mb-1">Absent</p>
              <p className="text-2xl font-bold text-red-700">{stats.absent}</p>
            </div>
          </div>

          {/* Logs Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <Calendar size={18} className="text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Attendance Log</h3>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
                    <th className="px-6 py-3">Date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3">Check-in Time</th>
                    <th className="px-6 py-3">Recorded At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i}>
                        {[...Array(4)].map((_, j) => (
                          <td key={j} className="px-6 py-4">
                            <div className="h-4 bg-slate-100 animate-pulse rounded w-24"></div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : attendance.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-10 text-center text-slate-500 text-sm">
                        No attendance records found for this employee.
                      </td>
                    </tr>
                  ) : (
                    attendance.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-3 text-slate-900 font-medium text-sm">
                          {new Date(record.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
                        </td>
                        <td className="px-6 py-3"><StatusBadge status={record.status} /></td>
                        <td className="px-6 py-3 text-slate-600 text-sm font-mono">
                          {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '-'}
                        </td>
                        <td className="px-6 py-3 text-slate-500 text-sm font-mono">
                          {record.kioskLocation || 'System Generated'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!selectedEmployeeId && (
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Select an Employee</h3>
          <p className="text-slate-500 max-w-sm mx-auto mt-2 text-sm">Choose an employee from the dropdown above to view their detailed attendance history and statistics.</p>
        </div>
      )}
    </div>
  );
};

export default EmployeeAttendanceHistory;
