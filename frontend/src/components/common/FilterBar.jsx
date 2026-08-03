import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, RotateCcw } from 'lucide-react';
import { ROLES } from './constants';
import { useAuth } from '../../context/AuthContext';

/* ── Role chip filter dropdown ── */
const RoleFilterDropdown = ({ selectedRoles, onChange, onDone }) => {
  const { role: currentUserRole } = useAuth();
  
  const toggle = (r) =>
    onChange(selectedRoles.includes(r) ? selectedRoles.filter((x) => x !== r) : [...selectedRoles, r]);

  const allowedRoles = ROLES.filter(r => {
    if (currentUserRole === 'SUPER_ADMIN') return r === 'ADMIN';
    if (currentUserRole === 'ADMIN') return r === 'HR' || r === 'EMPLOYEE';
    if (currentUserRole === 'HR') return r === 'EMPLOYEE';
    return false;
  });

  return (
    <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl p-4 min-w-[210px]">
      <p className="text-xs font-semibold text-slate-600 mb-3">Select Role</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {allowedRoles.map((r) => (
          <button
            key={r}
            onClick={() => toggle(r)}
            className={`px-4 py-1.5 text-sm rounded-full border font-medium transition-colors ${
              selectedRoles.includes(r)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-slate-600 border-slate-300 hover:border-blue-400'
            }`}
          >
            {r}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-slate-400 mb-3">*You can choose multiple roles</p>
      <button
        onClick={onDone}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
      >
        Done
      </button>
    </div>
  );
};

/* ── Status filter dropdown ── */
const StatusFilterDropdown = ({ value, onChange, onClose, options = ['ALL', 'Active', 'Deactive'] }) => (
  <div className="absolute top-full left-0 mt-1 z-30 bg-white border border-slate-200 rounded-xl shadow-xl py-1 min-w-[130px]">
    {options.map((s) => (
      <button
        key={s}
        onClick={() => { onChange(s); onClose(); }}
        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
          value === s ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
        }`}
      >
        {s === 'ALL' ? 'All Status' : s}
      </button>
    ))}
  </div>
);

const FilterBar = ({
  search,
  setSearch,
  selectedRoles,
  setSelectedRoles,
  statusFilter,
  setStatusFilter,
  statusOptions,
  onReset,
  onApply
}) => {
  const { role: currentUserRole } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  const roleRef = useRef(null);
  const statusRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) setShowRoleDropdown(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatusDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex flex-wrap items-center gap-4 mb-4">
      {/* Search */}
      <div className="relative w-72">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-lg text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm font-medium"
        />
      </div>

      {/* Button Group Container */}
      <div className="flex items-stretch bg-white border border-slate-200 rounded-lg shadow-sm">
        
        {/* Role filter */}
        {currentUserRole !== 'HR' && (
          <div ref={roleRef} className="relative flex">
            <button
              onClick={() => { setShowRoleDropdown((p) => !p); setShowStatusDropdown(false); }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-r border-slate-200 rounded-l-lg"
            >
              Role
              {selectedRoles.length > 0 && (
                <span className="ml-0.5 bg-blue-600 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {selectedRoles.length}
                </span>
              )}
              <ChevronDown size={14} className="text-slate-500" />
            </button>
            {showRoleDropdown && (
              <RoleFilterDropdown
                selectedRoles={selectedRoles}
                onChange={setSelectedRoles}
                onDone={() => setShowRoleDropdown(false)}
              />
            )}
          </div>
        )}

        {/* Status filter */}
        <div ref={statusRef} className="relative flex">
          <button
            onClick={() => { setShowStatusDropdown((p) => !p); setShowRoleDropdown(false); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-r border-slate-200"
          >
            Status
            {statusFilter !== 'ALL' && (
              <span className={`ml-0.5 text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${['Active', 'REGISTERED'].includes(statusFilter) ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-600'}`}>
                {statusFilter}
              </span>
            )}
            <ChevronDown size={14} className="text-slate-500" />
          </button>
          {showStatusDropdown && (
            <StatusFilterDropdown value={statusFilter} onChange={setStatusFilter} onClose={() => setShowStatusDropdown(false)} options={statusOptions} />
          )}
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors border-r border-slate-200"
        >
          <RotateCcw size={14} />
          Reset Filters
        </button>

        {/* Apply */}
        <button
          onClick={() => { setShowRoleDropdown(false); setShowStatusDropdown(false); onApply(); }}
          className="px-6 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-r-[7px]"
        >
          Apply all filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
