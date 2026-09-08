import React, { useState, useEffect, useCallback } from 'react';
import { Fingerprint, CheckCircle, Clock } from 'lucide-react';
import { fetchEmployees } from '../../../api/employeeApi';
import DataTable from '../../../components/common/DataTable';
import Pagination from '../../../components/common/Pagination';
import FilterBar from '../../../components/common/FilterBar';
import { useAuth } from '../../../context/AuthContext';
import RoleBadge from '../../../components/common/RoleBadge';
import toast from 'react-hot-toast';

const PAGE_SIZE = 9;



const FaceRegistrationPage = () => {
  const { role: currentUserRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, REGISTERED, PENDING
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState('asc');

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
      toast.error('Failed to load employee data');
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
      const matchStatus = statusFilter === 'ALL' || 
                          (statusFilter === 'REGISTERED' && e.faceRegistered) || 
                          (statusFilter === 'PENDING' && !e.faceRegistered);
      return matchSearch && matchRole && matchStatus;
    })
    .sort((a, b) => {
      if (!sortKey) return 0;
      const va = (a[sortKey] || '').toString().toLowerCase();
      const vb = (b[sortKey] || '').toString().toLowerCase();
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
    });

  const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => { setCurrentPage(1); }, [search, selectedRoles, statusFilter, sortKey, sortDir]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedRoles([]);
    setStatusFilter('ALL');
    setCurrentPage(1);
  };

  /* ── Table columns ── */
  const columns = [
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
      key: 'department',
      header: 'Department',
      sortable: true,
      className: 'w-[15%]',
      render: (row) => <span className="text-slate-600 text-sm">{row.department || '—'}</span>,
    },
    {
      key: 'role',
      header: 'Role',
      sortable: true,
      className: 'w-[10%]',
      render: (row) => <RoleBadge role={row.role} />,
    },
    {
      key: 'faceRegistered',
      header: 'Face Status',
      sortable: true,
      className: 'w-[15%]',
      render: (row) => (
        row.faceRegistered ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full text-[10px] font-bold">
            <CheckCircle size={12} /> Registered
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 rounded-full text-[10px] font-bold">
            <Clock size={12} /> Pending
          </span>
        )
      ),
    },
    {
      key: 'faceRegisteredAt',
      header: 'Registered On',
      sortable: true,
      className: 'w-[15%]',
      render: (row) => <span className="text-slate-500 text-sm">{row.faceRegisteredAt ? new Date(row.faceRegisteredAt).toLocaleDateString() : '—'}</span>,
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
        statusOptions={['ALL', 'REGISTERED', 'PENDING']}
        onReset={handleResetFilters}
      />

      {/* Main Table */}
      <div className="flex-1 overflow-auto bg-white">
        <DataTable
          columns={columns}
          data={paginated}
          loading={loading}
          emptyTitle="No Employees Found"
          emptyMessage={`No ${statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} employees ${selectedRoles.length > 0 ? `with role ${selectedRoles.join(' or ')}` : ''} ${search ? `matching "${search}"` : ''} found.`.replace(/\s+/g, ' ').trim()}
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
    </div>
  );
};

export default FaceRegistrationPage;
