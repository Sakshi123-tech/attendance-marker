import React, { useState, useEffect, useMemo } from 'react';
import { fetchMyHistory } from '../../../api/attendanceApi';
import Table from '../../../components/common/Table';
import { Calendar, Filter } from 'lucide-react';

const MyAttendance = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await fetchMyHistory();
        setRecords(data);
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredRecords = useMemo(() => {
    if (filterStatus === 'ALL') return records;
    return records.filter(r => r.status === filterStatus);
  }, [records, filterStatus]);

  const StatusBadge = ({ status }) => {
    const map = {
      ON_TIME: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      LATE: 'bg-amber-50 text-amber-600 border-amber-100',
      ABSENT: 'bg-red-50 text-red-600 border-red-100',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const columns = [
    { 
      header: 'Date', 
      accessor: 'date',
      render: (val) => <span className="font-medium text-slate-900">{new Date(val).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span> 
    },
    { 
      header: 'Check-in Time', 
      accessor: 'checkInTime',
      render: (val) => val ? <span className="font-mono text-slate-600">{new Date(val).toLocaleTimeString()}</span> : <span className="text-slate-400">-</span> 
    },
    { 
      header: 'Status', 
      accessor: 'status',
      render: (val) => <StatusBadge status={val} /> 
    },
    { 
      header: 'Kiosk', 
      accessor: 'kioskLocation',
      render: (val) => <span className="text-slate-500 text-sm">{val || 'System Generated'}</span> 
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">My Attendance</h2>
          <p className="text-sm text-slate-500 mt-1">Review your historical attendance logs and timings.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700">
          <Filter size={18} className="text-slate-400" />
          <span>Filter by Status:</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          {['ALL', 'ON_TIME', 'LATE', 'ABSENT'].map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                filterStatus === status
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <Table 
          columns={columns} 
          data={filteredRecords} 
          loading={loading}
          emptyMessage={
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <Calendar className="w-12 h-12 mb-4 text-slate-300" />
              <p className="text-lg font-medium text-slate-900">No records found</p>
              <p className="text-sm">No attendance records match the selected filter.</p>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default MyAttendance;
