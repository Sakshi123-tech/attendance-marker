import React, { useState, useEffect } from 'react';
import { Activity, Search, Filter, ShieldAlert, UserPlus, LogIn, CheckCircle } from 'lucide-react';
import Table from '../../../components/common/Table';
import SearchBar from '../../../components/common/SearchBar';
import Button from '../../../components/common/Button';

import { fetchSystemLogs } from '../../../api/systemLogApi';

const SystemLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      loadLogs();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm, filterType]);

  const loadLogs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await fetchSystemLogs({ type: filterType, search: searchTerm, page, limit: 50 });
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (err) {
      console.error('Failed to load system logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'SECURITY': return <ShieldAlert size={16} className="text-red-400" />;
      case 'USER_MGMT': return <UserPlus size={16} className="text-blue-400" />;
      case 'AUTH': return <LogIn size={16} className="text-emerald-400" />;
      default: return <Activity size={16} className="text-indigo-400" />;
    }
  };

  const columns = [
    {
      header: 'Event Type',
      render: (row) => (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-50 rounded-lg border border-slate-200">
            {getTypeIcon(row.type)}
          </div>
          <span className="text-slate-700 font-medium text-sm">{row.type}</span>
        </div>
      )
    },
    {
      header: 'Action',
      render: (row) => (
        <div className="text-sm">
          <p className="text-slate-800 font-medium">{row.action}</p>
          {row.target && <p className="text-xs text-slate-500 mt-0.5">Target: {row.target}</p>}
        </div>
      )
    },
    {
      header: 'Actor / User',
      render: (row) => (
        <div className="text-sm">
          <p className="text-slate-700">{row.user ? `${row.user.fullName} (${row.user.email})` : 'SYSTEM'}</p>
          <p className="text-xs text-slate-500 mt-0.5 font-mono">{row.ip}</p>
        </div>
      )
    },
    {
      header: 'Timestamp',
      tdClassName: 'text-right',
      render: (row) => (
        <div className="text-sm text-slate-500">
          {new Date(row.createdAt).toLocaleString()}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">System Audit Logs</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor system events, administrative actions, and security alerts.</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <SearchBar value={searchTerm} onChange={setSearchTerm} placeholder="Search events or users..." />
        
        <div className="sm:w-48">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
          >
            <option value="ALL">All Events</option>
            <option value="SECURITY">Security</option>
            <option value="USER_MGMT">User Management</option>
            <option value="AUTH">Authentication</option>
            <option value="SYSTEM">System</option>
          </select>
        </div>
      </div>

      <Table 
        columns={columns} 
        data={logs} 
        loading={loading}
        keyField="_id"
        emptyState={
          <div className="flex flex-col items-center justify-center p-12 text-slate-500">
            <Activity size={48} className="text-slate-300 mb-4" />
            <p>No audit logs found matching your criteria.</p>
          </div>
        }
      />
    </div>
  );
};

export default SystemLogsPage;
