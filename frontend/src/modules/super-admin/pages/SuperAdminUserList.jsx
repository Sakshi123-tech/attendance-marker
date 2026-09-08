import React, { useState, useEffect, useCallback } from 'react';
import { Trash2, CheckCircle, Clock } from 'lucide-react';
import { fetchEmployees, deactivateEmployee, deleteEmployeePermanent } from '../../../api/employeeApi';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import DeactivatePopup from '../../../components/common/DeactivatePopup';
import ActivatePopup from '../../../components/common/ActivatePopup';
import DeletePopup from '../../../components/common/DeletePopup';
import FilterBar from '../../../components/common/FilterBar';
import UserDetailsModal from '../../../components/common/UserDetailsModal';
import { useAuth } from '../../../context/AuthContext';
import RoleBadge from '../../../components/common/RoleBadge';

const PAGE_SIZE = 9;

/* ─── Toggle Switch ── */
const ToggleSwitch = ({ active, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex items-center w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none cursor-pointer ${
      active ? 'bg-emerald-500' : 'bg-slate-300'
    }`}
    aria-label="Toggle status"
  >
    <span
      className={`inline-block w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200 ${
        active ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

/* ─── Main Page ── */
const SuperAdminUserList = () => {
  const { role: currentUserRole } = useAuth();
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [faceStatusFilter, setFaceStatusFilter] = useState('ALL');

  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);

  const [panelUser, setPanelUser] = useState(null);
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [activateTarget, setActivateTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const loadEmployees = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees();

      const allowedRoles = (() => {
        if (currentUserRole === 'SUPER_ADMIN') return ['ADMIN'];
        if (currentUserRole === 'ADMIN') return ['HR', 'EMPLOYEE'];
        if (currentUserRole === 'HR') return ['EMPLOYEE'];
        return [];
      })();

      setEmployees(data.filter((e) => allowedRoles.includes(e.role)));
    } catch (err) {
      console.error('Failed to load:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserRole]);

  useEffect(() => { loadEmployees(); }, [loadEmployees]);

  const filtered = employees
    .filter((e) => {
      const q = search.toLowerCase();
      const matchSearch = !q || e.fullName?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.employeeId?.toLowerCase().includes(q);
      const matchRole = selectedRoles.length === 0 || selectedRoles.includes(e.role);
      const matchStatus = statusFilter === 'ALL' || (statusFilter === 'Active' && e.isActive) || (statusFilter === 'Deactive' && !e.isActive);
      const matchFace = isSuperAdmin || faceStatusFilter === 'ALL' || 
                        (faceStatusFilter === 'REGISTERED' && e.faceRegistered) || 
                        (faceStatusFilter === 'PENDING' && !e.faceRegistered);
      return matchSearch && matchRole && matchStatus && matchFace;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const va = (a[sortKey] || '').toString().toLowerCase();
      const vb = (b[sortKey] || '').toString().toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [search, selectedRoles, statusFilter, faceStatusFilter, sortKey, sortDir]);

  const handleToggle = (emp) => {
    if (emp.isActive) setDeactivateTarget(emp);
    else setActivateTarget(emp);
  };

  const confirmDeactivate = async () => {
    try {
      await deactivateEmployee(deactivateTarget._id);
      await loadEmployees();
    } catch (err) {
      console.error(err);
    } finally {
      setDeactivateTarget(null);
    }
  };

  const confirmActivate = async () => {
    setEmployees((prev) => prev.map((e) => e._id === activateTarget._id ? { ...e, isActive: true } : e));
    setActivateTarget(null);
  };

  const confirmDelete = async () => {
    try {
      await deleteEmployeePermanent(deleteTarget._id);
      setPanelUser(null);
      await loadEmployees();
    } catch (err) {
      console.error(err);
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedRoles([]);
    setStatusFilter('ALL');
    setFaceStatusFilter('ALL');
    setCurrentPage(1);
  };

  /* ── Table columns configuration ── */
  const columns = isSuperAdmin
    ? [
        {
          key: 'employeeId',
          header: 'ID',
          sortable: true,
          className: 'w-[10%]',
          render: (row) => <span className="text-slate-500 font-mono text-xs">{row.employeeId}</span>,
        },
        {
          key: 'fullName',
          header: 'Employee Name',
          sortable: true,
          className: 'w-[20%]',
          render: (row) => <span className="font-semibold text-slate-800 text-sm">{row.fullName}</span>,
        },
        {
          key: 'email',
          header: 'Contact',
          sortable: true,
          className: 'w-[25%]',
          render: (row) => <span className="text-blue-600 text-xs hover:underline cursor-pointer">{row.email}</span>,
        },
        {
          key: 'role',
          header: 'Role',
          sortable: true,
          className: 'w-[10%]',
          render: (row) => <RoleBadge role={row.role} />,
        },
        {
          key: 'department',
          header: 'Department',
          sortable: true,
          className: 'w-[15%]',
          render: (row) => <span className="text-slate-600 text-sm">{row.department || '—'}</span>,
        },
        {
          key: 'status',
          header: 'Status',
          sortable: false,
          className: 'w-[10%]',
          render: (row) => (
            <div className="flex items-center gap-2">
              <span className={`text-sm font-semibold ${row.isActive ? 'text-emerald-500' : 'text-red-500'}`}>
                {row.isActive ? 'Active' : 'Deactive'}
              </span>
              <ToggleSwitch active={row.isActive} onChange={() => handleToggle(row)} />
            </div>
          ),
        },
        {
          key: 'delete',
          header: 'Delete',
          className: 'w-[10%] text-center',
          tdClassName: 'text-center',
          render: (row) => (
            <button
              onClick={() => setDeleteTarget(row)}
              className="inline-flex items-center justify-center w-7 h-7 rounded border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
              title="Delete User"
            >
              <Trash2 size={13} />
            </button>
          ),
        },
      ]
    : [
        {
          key: 'employeeId',
          header: 'ID',
          sortable: true,
          className: 'w-[8%]',
          render: (row) => <span className="text-slate-500 font-mono text-xs">{row.employeeId}</span>,
        },
        {
          key: 'fullName',
          header: 'Employee Name',
          sortable: true,
          className: 'w-[18%]',
          render: (row) => <span className="font-semibold text-slate-800 text-sm">{row.fullName}</span>,
        },
        {
          key: 'email',
          header: 'Contact',
          sortable: true,
          className: 'w-[20%]',
          render: (row) => <span className="text-blue-600 text-xs hover:underline cursor-pointer">{row.email}</span>,
        },
        {
          key: 'department',
          header: 'Department',
          sortable: true,
          className: 'w-[13%]',
          render: (row) => <span className="text-slate-600 text-sm">{row.department || '—'}</span>,
        },
        {
          key: 'role',
          header: 'Role',
          sortable: true,
          className: 'w-[9%]',
          render: (row) => <RoleBadge role={row.role} />,
        },
        {
          key: 'faceRegistered',
          header: 'Face Status',
          sortable: true,
          className: 'w-[12%]',
          render: (row) => (
            row.faceRegistered ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[10px] font-bold">
                <CheckCircle size={11} /> Registered
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[10px] font-bold">
                <Clock size={11} /> Pending
              </span>
            )
          ),
        },
        {
          key: 'faceRegisteredAt',
          header: 'Registered On',
          sortable: true,
          className: 'w-[10%]',
          render: (row) => (
            <span className="text-slate-500 text-xs font-mono">
              {row.faceRegisteredAt ? new Date(row.faceRegisteredAt).toLocaleDateString() : '—'}
            </span>
          ),
        },
        {
          key: 'status',
          header: 'Status',
          sortable: false,
          className: 'w-[10%]',
          render: (row) => (
            <div className="flex items-center gap-2">
              <span className={`text-xs font-semibold ${row.isActive ? 'text-emerald-600' : 'text-rose-600'}`}>
                {row.isActive ? 'Active' : 'Deactive'}
              </span>
              <ToggleSwitch active={row.isActive} onChange={() => handleToggle(row)} />
            </div>
          ),
        },
        {
          key: 'delete',
          header: 'Delete',
          className: 'w-[6%] text-center',
          tdClassName: 'text-center',
          render: (row) => (
            <button
              onClick={() => setDeleteTarget(row)}
              className="inline-flex items-center justify-center w-7 h-7 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
              title="Delete User"
            >
              <Trash2 size={13} />
            </button>
          ),
        },
      ];

  return (
    <div className="flex flex-col flex-1 min-h-0 space-y-4">
      {/* Floating Filter Bar */}
      <FilterBar
        search={search}
        setSearch={setSearch}
        selectedRoles={selectedRoles}
        setSelectedRoles={setSelectedRoles}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        faceStatusFilter={!isSuperAdmin ? faceStatusFilter : undefined}
        setFaceStatusFilter={!isSuperAdmin ? setFaceStatusFilter : undefined}
        onReset={handleResetFilters}
      />

      {/* Main Table */}
      <div className="flex-1 overflow-auto bg-white rounded-2xl border border-slate-200 shadow-xs">
        <DataTable
          columns={columns}
          data={paginated}
          loading={loading}
          emptyTitle="No Users Found"
          emptyMessage={`No ${statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} users ${!isSuperAdmin && faceStatusFilter !== 'ALL' ? `with face status ${faceStatusFilter.toLowerCase()}` : ''} ${selectedRoles.length > 0 ? `with role ${selectedRoles.join(' or ')}` : ''} ${search ? `matching "${search}"` : ''} found.`.replace(/\s+/g, ' ').trim()}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={(key, dir) => { setSortKey(key); setSortDir(dir); }}
          keyField="_id"
        />
      </div>

      {/* Floating Pagination */}
      <div className="flex justify-end pt-2">
        <Pagination
          currentPage={currentPage}
          totalItems={filtered.length}
          pageSize={PAGE_SIZE}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* ── Side Panel ── */}
      <UserDetailsModal
        user={panelUser}
        onClose={() => setPanelUser(null)}
      />

      {/* ── Popups ── */}
      <DeactivatePopup isOpen={!!deactivateTarget} userName={deactivateTarget?.fullName || ''} onConfirm={confirmDeactivate} onCancel={() => setDeactivateTarget(null)} />
      <ActivatePopup isOpen={!!activateTarget} userName={activateTarget?.fullName || ''} onConfirm={confirmActivate} onCancel={() => setActivateTarget(null)} />
      <DeletePopup isOpen={!!deleteTarget} userName={deleteTarget?.fullName || ''} onConfirm={confirmDelete} onCancel={() => setDeleteTarget(null)} />
    </div>
  );
};

export default SuperAdminUserList;
