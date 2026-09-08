import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, RotateCcw, Check } from 'lucide-react';
import { ROLES } from './constants';
import { useAuth } from '../../context/AuthContext';

/* ── Role chip filter dropdown ── */
const RoleFilterDropdown = ({ selectedRoles = [], onChange, onDone }) => {
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
    <div
      className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl p-4 min-w-[220px] animate-in fade-in-0 zoom-in-95 duration-150"
      style={{ boxShadow: '0 12px 35px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)' }}
    >
      <p className="text-xs font-bold text-slate-700 mb-3">Select Role</p>
      <div className="flex flex-wrap gap-2 mb-2">
        {allowedRoles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => toggle(r)}
            className={`px-3.5 py-1.5 text-xs rounded-full border font-semibold transition-all cursor-pointer ${selectedRoles.includes(r)
                ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-blue-400 hover:bg-white'
              }`}
          >
            {r}
          </button>
        ))}
      </div>
      <p className="text-[11px] text-slate-400 mb-3 font-medium">*You can choose multiple roles</p>
      <button
        type="button"
        onClick={onDone}
        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
      >
        Done
      </button>
    </div>
  );
};

/* ── Status filter dropdown ── */
const StatusFilterDropdown = ({ value, onChange, onClose, options = ['ALL', 'Active', 'Deactive'] }) => (
  <div
    className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 min-w-[150px] animate-in fade-in-0 zoom-in-95 duration-150"
    style={{ boxShadow: '0 12px 35px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)' }}
  >
    <div className="flex flex-col gap-0.5">
      {options.map((s) => {
        const isSelected = value === s;
        const label = s === 'ALL' ? 'All Status' : s;
        return (
          <button
            key={s}
            type="button"
            onClick={() => { onChange(s); onClose(); }}
            className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${isSelected
                ? 'bg-blue-50/90 text-blue-600 font-semibold shadow-2xs'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
          >
            <span className="truncate">{label}</span>
            {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
          </button>
        );
      })}
    </div>
  </div>
);

/* ── Face status filter dropdown ── */
const FaceStatusFilterDropdown = ({ value, onChange, onClose }) => {
  const options = [
    { value: 'ALL', label: 'All Face Status' },
    { value: 'REGISTERED', label: 'Registered' },
    { value: 'PENDING', label: 'Pending' },
  ];

  return (
    <div
      className="absolute top-full left-0 mt-1.5 z-50 bg-white border border-slate-100 rounded-2xl shadow-xl p-1.5 min-w-[160px] animate-in fade-in-0 zoom-in-95 duration-150"
      style={{ boxShadow: '0 12px 35px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)' }}
    >
      <div className="flex flex-col gap-0.5">
        {options.map((opt) => {
          const isSelected = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); onClose(); }}
              className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${isSelected
                  ? 'bg-blue-50/90 text-blue-600 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
            >
              <span className="truncate">{opt.label}</span>
              {isSelected && <Check size={14} className="text-blue-600 shrink-0" />}
            </button>
          );
        })}
      </div>
    </div>
  );
};

const FilterBar = ({
  search,
  setSearch,
  selectedRoles = [],
  setSelectedRoles,
  statusFilter,
  setStatusFilter,
  statusOptions,
  faceStatusFilter,
  setFaceStatusFilter,
  onReset
}) => {
  const { role: currentUserRole } = useAuth();
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showFaceStatusDropdown, setShowFaceStatusDropdown] = useState(false);

  const roleRef = useRef(null);
  const statusRef = useRef(null);
  const faceStatusRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (roleRef.current && !roleRef.current.contains(e.target)) setShowRoleDropdown(false);
      if (statusRef.current && !statusRef.current.contains(e.target)) setShowStatusDropdown(false);
      if (faceStatusRef.current && !faceStatusRef.current.contains(e.target)) setShowFaceStatusDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const hasRoleFilter = currentUserRole !== 'HR' && currentUserRole !== 'SUPER_ADMIN';
  const hasFaceStatusFilter = faceStatusFilter !== undefined && setFaceStatusFilter !== undefined;

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
          className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-xs font-medium"
        />
      </div>

      {/* Button Group Container */}
      <div className="flex items-stretch bg-white border border-slate-200 rounded-xl shadow-xs">

        {/* Role filter (Only shown when not Super Admin and not HR) */}
        {hasRoleFilter && (
          <div ref={roleRef} className="relative flex">
            <button
              type="button"
              onClick={() => { setShowRoleDropdown((p) => !p); setShowStatusDropdown(false); setShowFaceStatusDropdown(false); }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-r border-slate-200 rounded-l-xl cursor-pointer"
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
            type="button"
            onClick={() => { setShowStatusDropdown((p) => !p); setShowRoleDropdown(false); setShowFaceStatusDropdown(false); }}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-r border-slate-200 cursor-pointer ${!hasRoleFilter ? 'rounded-l-xl' : ''}`}
          >
            Status
            {statusFilter !== 'ALL' && (
              <span className={`ml-0.5 text-[10px] px-2 py-0.5 rounded-full font-bold ${['Active', 'REGISTERED'].includes(statusFilter) ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-600'}`}>
                {statusFilter}
              </span>
            )}
            <ChevronDown size={14} className="text-slate-500" />
          </button>
          {showStatusDropdown && (
            <StatusFilterDropdown
              value={statusFilter}
              onChange={(s) => { setStatusFilter(s); setShowStatusDropdown(false); }}
              onClose={() => setShowStatusDropdown(false)}
              options={statusOptions}
            />
          )}
        </div>

        {/* Face Status filter (Admin and HR only) */}
        {hasFaceStatusFilter && (
          <div ref={faceStatusRef} className="relative flex">
            <button
              type="button"
              onClick={() => { setShowFaceStatusDropdown((p) => !p); setShowRoleDropdown(false); setShowStatusDropdown(false); }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors border-r border-slate-200 cursor-pointer"
            >
              Face Status
              {faceStatusFilter !== 'ALL' && (
                <span className={`ml-0.5 text-[10px] px-2 py-0.5 rounded-full font-bold ${faceStatusFilter === 'REGISTERED' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {faceStatusFilter === 'REGISTERED' ? 'Registered' : 'Pending'}
                </span>
              )}
              <ChevronDown size={14} className="text-slate-500" />
            </button>
            {showFaceStatusDropdown && (
              <FaceStatusFilterDropdown
                value={faceStatusFilter}
                onChange={(f) => { setFaceStatusFilter(f); setShowFaceStatusDropdown(false); }}
                onClose={() => setShowFaceStatusDropdown(false)}
              />
            )}
          </div>
        )}

        {/* Reset */}
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50 transition-colors rounded-r-xl cursor-pointer"
        >
          <RotateCcw size={14} />
          Reset Filters
        </button>
      </div>
    </div>
  );
};

export default FilterBar;
