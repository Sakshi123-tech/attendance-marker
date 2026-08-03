import React, { useState, useEffect } from 'react';
import { CalendarDays, CheckCircle, XCircle, Clock, User, FileText } from 'lucide-react';
import { fetchLeaveRequests, updateLeaveStatus, fetchLeaveBalances } from '../../../api/leaveApi';

const LeaveManagement = () => {
  const [activeTab, setActiveTab] = useState('REQUESTS');
  const [requests, setRequests] = useState([]);
  const [balances, setBalances] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'REQUESTS') {
        const data = await fetchLeaveRequests();
        setRequests(data);
      } else {
        const data = await fetchLeaveBalances();
        setBalances(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, status) => {
    await updateLeaveStatus(id, status);
    loadData(); // Reload requests
  };

  const StatusBadge = ({ status }) => {
    const map = {
      APPROVED: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      PENDING: 'bg-amber-50 text-amber-600 border-amber-100',
      REJECTED: 'bg-red-50 text-red-600 border-red-100',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${map[status] || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  const TypeBadge = ({ type }) => {
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border bg-indigo-50 text-indigo-600 border-indigo-100">
        {type}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leave Management</h2>
          <p className="text-sm text-slate-500 mt-1">Review employee leave requests and track balances.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-xl w-max border border-slate-200">
        <button
          onClick={() => setActiveTab('REQUESTS')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'REQUESTS'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <Clock size={16} />
            <span>Leave Requests</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('BALANCES')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'BALANCES'
              ? 'bg-white text-indigo-600 shadow-sm border border-slate-200'
              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} />
            <span>Employee Balances</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        {activeTab === 'REQUESTS' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4">Leave Type</th>
                  <th className="px-6 py-4">Dates</th>
                  <th className="px-6 py-4">Reason</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading requests...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No leave requests found.</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold">
                            {req.employeeName.charAt(0)}
                          </div>
                          <span className="text-slate-900 font-medium text-sm">{req.employeeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4"><TypeBadge type={req.type} /></td>
                      <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                        {req.startDate} <span className="text-slate-400 font-normal mx-1">to</span> {req.endDate}
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                      <td className="px-6 py-4 text-right">
                        {req.status === 'PENDING' ? (
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => handleAction(req.id, 'APPROVED')} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-transparent hover:border-emerald-200" title="Approve">
                              <CheckCircle size={18} />
                            </button>
                            <button onClick={() => handleAction(req.id, 'REJECTED')} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200" title="Reject">
                              <XCircle size={18} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'BALANCES' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
                  <th className="px-6 py-4">Employee</th>
                  <th className="px-6 py-4 text-center">Casual</th>
                  <th className="px-6 py-4 text-center">Sick</th>
                  <th className="px-6 py-4 text-center">Paid</th>
                  <th className="px-6 py-4 text-center">WFH</th>
                  <th className="px-6 py-4 text-center">Maternity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">Loading balances...</td></tr>
                ) : balances.length === 0 ? (
                  <tr><td colSpan="6" className="px-6 py-10 text-center text-slate-500">No balance records found.</td></tr>
                ) : (
                  balances.map((bal, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <User size={16} className="text-slate-400" />
                          <span className="text-slate-900 font-medium text-sm">{bal.employeeName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center text-slate-700 font-mono text-sm">{bal.CASUAL}</td>
                      <td className="px-6 py-4 text-center text-slate-700 font-mono text-sm">{bal.SICK}</td>
                      <td className="px-6 py-4 text-center text-slate-700 font-mono text-sm">{bal.PAID}</td>
                      <td className="px-6 py-4 text-center text-slate-700 font-mono text-sm">{bal.WFH}</td>
                      <td className="px-6 py-4 text-center text-slate-700 font-mono text-sm">{bal.MATERNITY}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveManagement;
