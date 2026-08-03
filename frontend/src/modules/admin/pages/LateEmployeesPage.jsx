import React, { useState, useEffect } from 'react';
import { Clock, Download, AlertCircle } from 'lucide-react';
import { fetchAllAttendance } from '../../../api/attendanceApi';
import { downloadCSV } from '../../../api/reportApi';
import SearchBar from '../../../components/common/SearchBar';
import EmptyState from '../../../components/common/EmptyState';
import Button from '../../../components/common/Button';
import toast from 'react-hot-toast';

const LateEmployeesPage = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    loadLateRecords();
  }, []);

  const loadLateRecords = async () => {
    try {
      setLoading(true);
      const data = await fetchAllAttendance({ status: 'LATE' });
      setRecords(data);
    } catch (err) {
      toast.error('Failed to load late arrival data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExporting(true);
      const filters = { status: 'LATE' };
      if (dateFrom) filters.startDate = dateFrom;
      if (dateTo) filters.endDate = dateTo;
      await downloadCSV(filters);
      toast.success('CSV downloaded successfully');
    } catch (err) {
      toast.error('Export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const filtered = records.filter(r => {
    const name = r.employee?.fullName || '';
    const matchesSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
    if (!matchesSearch) return false;
    if (dateFrom && new Date(r.checkInTime) < new Date(dateFrom)) return false;
    if (dateTo && new Date(r.checkInTime) > new Date(new Date(dateTo).setHours(23, 59, 59))) return false;
    return true;
  });

  // Group by employee to count late arrivals
  const lateCountMap = {};
  records.forEach(r => {
    const empId = r.employee?._id || r.employeeId;
    if (empId) lateCountMap[empId] = (lateCountMap[empId] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Late Arrivals</h2>
          <p className="text-sm text-slate-500 mt-1">Track employees who checked in after their scheduled time.</p>
        </div>
        <Button onClick={handleExportCSV} loading={exporting} icon={Download} variant="secondary">
          Export CSV
        </Button>
      </div>

      {/* Summary badge */}
      {!loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-600">
          <AlertCircle size={18} className="shrink-0" />
          <p className="text-sm font-medium">{records.length} late arrival records found in the system.</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search by employee name..." />
        <div className="flex gap-2 items-center">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-amber-500"
          />
          <span className="text-slate-500 text-sm">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-slate-700 text-sm focus:outline-none focus:border-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
                <th className="px-6 py-4">Employee</th>
                <th className="px-6 py-4">Department</th>
                <th className="px-6 py-4">Arrival Time</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Total Lates</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(5)].map((_, j) => (
                      <td key={j} className="px-6 py-4"><div className="h-4 bg-slate-200 animate-pulse rounded w-28" /></td>
                    ))}
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" className="py-2">
                  <EmptyState icon={Clock} title="No Late Records" message="No late arrivals match your current filters." />
                </td></tr>
              ) : (
                filtered.map((record, i) => {
                  const empId = record.employee?._id || record.employeeId;
                  const lateCount = lateCountMap[empId] || 1;
                  return (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 text-xs font-bold shadow-sm">
                            {(record.employee?.fullName || 'U').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-slate-900 font-medium text-sm">{record.employee?.fullName || 'Unknown'}</p>
                            <p className="text-slate-500 text-xs">{record.employee?.employeeId || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">{record.employee?.department || '—'}</td>
                      <td className="px-6 py-4 text-amber-600 text-sm font-mono font-semibold">
                        {record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {record.attendanceDate || (record.checkInTime ? new Date(record.checkInTime).toLocaleDateString() : '—')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-xs font-bold">
                          {lateCount}×
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LateEmployeesPage;
