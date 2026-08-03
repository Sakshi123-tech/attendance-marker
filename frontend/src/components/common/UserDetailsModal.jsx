import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import CustomDropdown from './CustomDropdown';
import { ROLES, DEPARTMENTS } from './constants';

const inputCls =
  'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';

const UserDetailsModal = ({ user, onClose }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    department: '',
    role: '',
  });

  // Sync form data whenever a new user is opened
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        department: user.department || '',
        role: user.role || '',
      });
    }
  }, [user]);

  if (!user) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-slate-900/10" onClick={onClose} />

      {/* Panel */}
      <div className="fixed right-0 top-0 h-full w-[500px] z-[9999] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-slate-400 hover:text-slate-800 transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className="px-8 pt-10 pb-6">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-14 h-14 rounded-full bg-[#f97316] flex items-center justify-center text-white font-bold text-xl shadow-sm">
                {user.fullName?.substring(0, 2).toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900 leading-tight">{user.fullName}</h2>
                <p className="text-[13px] font-medium text-slate-500 mt-0.5">
                  Role - {user.role === 'ADMIN' ? 'Admin' : user.role === 'HR' ? 'HR' : 'Employee'}
                </p>
              </div>
            </div>

            <div className="space-y-2.5 text-[13px]">
              <div className="grid grid-cols-[140px_1fr] items-center">
                <span className="font-bold text-slate-900">Account created</span>
                <span className="text-slate-600 font-medium">{user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'}</span>
              </div>
              <div className="grid grid-cols-[140px_1fr] items-center">
                <span className="font-bold text-slate-900">Last Edited</span>
                <span className="text-slate-600 font-medium">{user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '—'}</span>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="px-8 pb-8">
            <div className="border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
              <h3 className="text-blue-600 font-bold text-sm mb-6">User Details</h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-5">
                {/* Employee ID — read only */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">Employee ID</label>
                  <p className="text-sm text-slate-600 py-3">{user.employeeId}</p>
                </div>

                {/* Email — read only */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">Username / Email</label>
                  <p className="text-sm text-slate-600 py-3 truncate">{user.email}</p>
                </div>

                {/* Name — editable */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">Name</label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    className={inputCls}
                  />
                </div>

                {/* Department */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">Department</label>
                  <CustomDropdown
                    value={formData.department}
                    options={
                      formData.department && !DEPARTMENTS.includes(formData.department)
                        ? [formData.department, ...DEPARTMENTS]
                        : DEPARTMENTS
                    }
                    onChange={(val) => setFormData(prev => ({ ...prev, department: val }))}
                    placeholder="Select Department"
                  />
                </div>

                {/* Role */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-semibold text-slate-800">Role</label>
                  <CustomDropdown
                    value={formData.role}
                    options={ROLES}
                    onChange={(val) => setFormData(prev => ({ ...prev, role: val }))}
                    placeholder="Select Role"
                  />
                </div>


              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-slate-200 flex items-center justify-between bg-white">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-sm font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg transition-all shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

export default UserDetailsModal;
