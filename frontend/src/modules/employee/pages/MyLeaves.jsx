import React, { useState, useEffect } from 'react';
import { fetchLeaveRequests, fetchLeaveBalances, submitLeaveRequest } from '../../../api/leaveApi';
import { useAuth } from '../../../context/AuthContext';
import { CalendarDays, Plus, Clock, FileText, CheckCircle, XCircle } from 'lucide-react';
import FormInput from '../../../components/common/FormInput';
import Button from '../../../components/common/Button';
import CustomDropdown from '../../../components/common/CustomDropdown';
import DatePicker from '../../../components/common/DatePicker';

const MyLeaves = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [applyForm, setApplyForm] = useState({
    type: 'CASUAL',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch all requests and balances, filter for this employee 
      // (in a real app, API would do this based on JWT)
      const reqs = await fetchLeaveRequests();
      const myReqs = reqs.filter(r => r.employeeName === user?.fullName || r.employeeId === user?._id);
      setRequests(myReqs);

      const bals = await fetchLeaveBalances();
      const myBal = bals.find(b => b.employeeName === user?.fullName || b.employeeId === user?._id);
      setBalance(myBal || { CASUAL: 10, SICK: 5, PAID: 15, WFH: 20, MATERNITY: 0 }); // Fallback for mock
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await submitLeaveRequest({
        employeeId: user?._id,
        employeeName: user?.fullName,
        ...applyForm
      });
      setShowApplyModal(false);
      setApplyForm({ type: 'CASUAL', startDate: '', endDate: '', reason: '' });
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
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

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Leave Management</h2>
          <p className="text-sm text-slate-500 mt-1">Track your balances and apply for time off.</p>
        </div>
        <button 
          onClick={() => setShowApplyModal(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} />
          <span>Apply Leave</span>
        </button>
      </div>

      {/* Balances Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { label: 'Casual', val: balance?.CASUAL, color: 'text-blue-700 bg-blue-50 border-blue-100' },
          { label: 'Sick', val: balance?.SICK, color: 'text-amber-700 bg-amber-50 border-amber-100' },
          { label: 'Paid', val: balance?.PAID, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
          { label: 'WFH', val: balance?.WFH, color: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
          { label: 'Maternity', val: balance?.MATERNITY, color: 'text-purple-700 bg-purple-50 border-purple-100' },
        ].map(item => (
          <div key={item.label} className={`border rounded-xl p-4 flex flex-col items-center justify-center text-center ${item.color}`}>
            <span className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">{item.label}</span>
            <span className="text-2xl font-black">{loading ? '-' : item.val ?? 0}</span>
          </div>
        ))}
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <CalendarDays size={18} className="text-indigo-500" />
            <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">My Leave History</h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-semibold">
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Dates</th>
                <th className="px-6 py-4">Reason</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">Loading your requests...</td></tr>
              ) : requests.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-10 text-center text-slate-500">You have no leave requests.</td></tr>
              ) : (
                requests.map((req, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-sm text-slate-700">{req.type}</td>
                    <td className="px-6 py-4 text-slate-600 text-sm font-medium">
                      {req.startDate} <span className="text-slate-400 font-normal mx-1">to</span> {req.endDate}
                    </td>
                    <td className="px-6 py-4 text-slate-500 text-sm max-w-xs truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={req.status} /></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-bold text-slate-900">Apply for Leave</h3>
              <button onClick={() => setShowApplyModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleApply} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Leave Type</label>
                <CustomDropdown
                  value={applyForm.type}
                  onChange={(val) => setApplyForm({ ...applyForm, type: val })}
                  options={[
                    { value: 'CASUAL', label: 'Casual' },
                    { value: 'SICK', label: 'Sick' },
                    { value: 'PAID', label: 'Paid' },
                    { value: 'WFH', label: 'Work From Home (WFH)' },
                    { value: 'MATERNITY', label: 'Maternity' }
                  ]}
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Start Date</label>
                  <DatePicker
                    value={applyForm.startDate}
                    onChange={(val) => setApplyForm({ ...applyForm, startDate: val })}
                    placeholder="Select start date"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">End Date</label>
                  <DatePicker
                    value={applyForm.endDate}
                    onChange={(val) => setApplyForm({ ...applyForm, endDate: val })}
                    placeholder="Select end date"
                    className="w-full"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">Reason</label>
                <textarea 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                  rows="3"
                  value={applyForm.reason}
                  onChange={e => setApplyForm({...applyForm, reason: e.target.value})}
                  required
                  placeholder="Provide a brief reason..."
                ></textarea>
              </div>
              <div className="pt-4 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowApplyModal(false)}>Cancel</Button>
                <Button type="submit" variant="primary" className="flex-1" isLoading={submitting}>Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
    </div>
  );
};

export default MyLeaves;
