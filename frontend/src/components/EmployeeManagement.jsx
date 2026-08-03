import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Ban, MoreVertical, Mail, Briefcase, Shield, AlertCircle, Trash2 } from 'lucide-react';
import { fetchEmployees, createEmployee, updateEmployee, deactivateEmployee, deleteEmployeePermanent } from '../api/employeeApi';
import { useAuth } from '../context/AuthContext';
import ConfirmPopup from './ConfirmPopup';

const EmployeeManagement = ({ title, description, allowedRolesToManage }) => {
  const { role: currentUserRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Confirm Popup State
  const [confirmPopup, setConfirmPopup] = useState({
    isOpen: false,
    employeeId: null,
    employeeName: ''
  });

  const [deletePopup, setDeletePopup] = useState({
    isOpen: false,
    employeeId: null,
    employeeName: ''
  });

  // Form State
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    role: allowedRolesToManage[0] || 'EMPLOYEE',
    department: '',
    employeeId: ''
  });

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchEmployees();
      // Filter out employees that the current view is not supposed to manage
      // If allowedRolesToManage is provided, only show users with those roles.
      const filteredData = allowedRolesToManage
        ? data.filter(emp => allowedRolesToManage.includes(emp.role))
        : data;
      setEmployees(filteredData);
    } catch (err) {
      console.error('Failed to load employees:', err);
      setError(err.response?.data?.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (employee = null) => {
    setFormError(null);
    if (employee) {
      setIsEditMode(true);
      setSelectedEmployee(employee);
      setFormData({
        fullName: employee.fullName,
        email: employee.email,
        role: employee.role,
        department: employee.department,
        employeeId: employee.employeeId
      });
    } else {
      setIsEditMode(false);
      setSelectedEmployee(null);
      setFormData({
        fullName: '',
        email: '',
        role: allowedRolesToManage[0] || 'EMPLOYEE',
        department: '',
        employeeId: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployee(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    try {
      if (isEditMode) {
        // Only fullName, department, employeeId are allowed to be updated per backend
        const updatePayload = {
          fullName: formData.fullName,
          department: formData.department,
          employeeId: formData.employeeId
        };
        await updateEmployee(selectedEmployee._id, updatePayload);
      } else {
        await createEmployee(formData);
      }
      await loadEmployees();
      handleCloseModal();
    } catch (err) {
      console.error('Save failed:', err);
      setFormError(err.response?.data?.message || 'Failed to save employee data');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteClick = (emp) => {
    setConfirmPopup({
      isOpen: true,
      employeeId: emp._id,
      employeeName: emp.fullName
    });
  };

  const confirmDeactivate = async () => {
    const id = confirmPopup.employeeId;
    setConfirmPopup({ isOpen: false, employeeId: null, employeeName: '' });

    try {
      await deactivateEmployee(id);
      await loadEmployees();
    } catch (err) {
      console.error('Deactivation failed:', err);
      setError(err.response?.data?.message || 'Failed to deactivate account');
    }
  };

  const handleDeleteClickPermanent = (emp) => {
    setDeletePopup({
      isOpen: true,
      employeeId: emp._id,
      employeeName: emp.fullName
    });
  };

  const confirmDelete = async () => {
    const id = deletePopup.employeeId;
    setDeletePopup({ isOpen: false, employeeId: null, employeeName: '' });

    try {
      await deleteEmployeePermanent(id);
      await loadEmployees();
    } catch (err) {
      console.error('Deletion failed:', err);
      setError(err.response?.data?.message || 'Failed to delete account permanently');
    }
  };

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'ALL' || emp.role === filterRole;

    return matchesSearch && matchesRole;
  });

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'ADMIN': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HR': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'KIOSK': return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    }
  };

  const isFormValid = isEditMode
    ? formData.fullName.trim() !== '' && formData.employeeId.trim() !== ''
    : formData.fullName.trim() !== '' && formData.email.trim() !== '' && formData.employeeId.trim() !== '';

  return (
    <div className="space-y-6">
      {/* Header Area */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title || 'Employee Management'}</h2>
          <p className="text-sm text-slate-500 mt-1">{description || 'Manage personnel, assign roles, and handle access.'}</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20"
        >
          <Plus size={18} />
          <span>Add New</span>
        </button>
      </div>

      {/* Controls Area */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-400"
          />
        </div>
        <div className="sm:w-48">
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none"
          >
            <option value="ALL">All Roles</option>
            {allowedRolesToManage?.map(role => (
              <option key={role} value={role}>{role.replace('_', ' ')}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400">
          <AlertCircle size={20} className="shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-medium">
                <th className="px-6 py-4 whitespace-nowrap">Employee</th>
                <th className="px-6 py-4 whitespace-nowrap">Contact & ID</th>
                <th className="px-6 py-4 whitespace-nowrap">Role & Dept</th>
                <th className="px-6 py-4 whitespace-nowrap">Status</th>
                <th className="px-6 py-4 whitespace-nowrap text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                      <p>Loading records...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center bg-slate-50 rounded-lg p-8 mx-auto max-w-md border border-slate-200 border-dashed">
                      <Briefcase size={40} className="text-slate-400 mb-3" />
                      <p className="text-slate-700 font-medium">No employees found</p>
                      <p className="text-sm text-slate-500 mt-1">Try adjusting your filters or search term.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
                          {emp.fullName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-slate-900 font-medium">{emp.fullName}</p>
                          <p className="text-xs text-slate-500 mt-0.5">Joined {new Date(emp.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1 text-sm">
                        <div className="flex items-center gap-1.5 text-slate-700">
                          <Mail size={14} className="text-slate-400" />
                          <span>{emp.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-500 text-xs">
                          <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-indigo-700 border border-slate-200">ID: {emp.employeeId}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2 items-start">
                        <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border ${getRoleBadgeColor(emp.role)}`}>
                          {emp.role.replace('_', ' ')}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <Briefcase size={12} />
                          <span>{emp.department}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {emp.isActive ? (
                        <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-medium">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          Active
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          Disabled
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => handleOpenModal(emp)}
                          className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-colors"
                          title="Edit Employee"
                        >
                          <Edit2 size={16} />
                        </button>
                        {emp.role !== 'SUPER_ADMIN' && emp._id !== currentUserRole.id && (
                          <>
                            {emp.isActive && (
                              <button
                                onClick={() => handleDeleteClick(emp)}
                                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                title="Disable User"
                              >
                                <Ban size={16} />
                              </button>
                            )}
                            <button
                              onClick={() => handleDeleteClickPermanent(emp)}
                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors ml-1"
                              title="Delete Permanently"
                            >
                              <Trash2 size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                {isEditMode ? <Edit2 size={20} className="text-indigo-500" /> : <Plus size={20} className="text-emerald-500" />}
                {isEditMode ? 'Edit Employee Profile' : 'Register New Employee'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors p-1"
              >
                &times; {/* Simple close icon */}
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 flex items-start gap-2">
                  <AlertCircle size={16} className="shrink-0 mt-0.5" />
                  <p>{formError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Jane Doe"
                  />
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    disabled={isEditMode} // Cannot edit email after creation
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="jane.doe@company.com"
                  />
                  {isEditMode && <p className="text-xs text-slate-500">Email cannot be changed.</p>}
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Employee ID</label>
                  <input
                    type="text"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono text-sm"
                    placeholder="EMP-001"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleInputChange}
                    disabled={isEditMode} // Usually shouldn't change role from this simple UI, or restrict it
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {allowedRolesToManage.map(r => (
                      <option key={r} value={r}>{r.replace('_', ' ')}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-sm font-medium text-slate-700">Department</label>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="e.g. Engineering, Sales, HR"
                  />
                </div>
              </div>

              {!isEditMode && (
                <div className="bg-indigo-50 border border-indigo-100 p-3 rounded-lg flex gap-3 mt-4">
                  <Shield size={20} className="text-indigo-500 shrink-0" />
                  <div className="text-sm text-indigo-800">
                    <p className="font-semibold mb-0.5">Automated Onboarding</p>
                    <p>Upon registration, an invitation link will be dispatched to their email to securely set up their password and verify their account.</p>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading || !isFormValid}
                  className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {formLoading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                  {isEditMode ? 'Save Changes' : 'Register Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Popup for Deactivation */}
      <ConfirmPopup
        isOpen={confirmPopup.isOpen}
        title="Disable User Account"
        message={`Are you sure you want to disable the account for ${confirmPopup.employeeName}? They will no longer be able to log in to the system.`}
        confirmText="Disable Account"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDeactivate}
        onCancel={() => setConfirmPopup({ isOpen: false, employeeId: null, employeeName: '' })}
      />

      {/* Confirmation Popup for Permanent Deletion */}
      <ConfirmPopup
        isOpen={deletePopup.isOpen}
        title="Permanently Delete User"
        message={`CRITICAL: Are you absolutely sure you want to permanently delete ${deletePopup.employeeName}? This action cannot be undone and frees up their slot.`}
        confirmText="Delete Permanently"
        cancelText="Cancel"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={() => setDeletePopup({ isOpen: false, employeeId: null, employeeName: '' })}
      />
    </div>
  );
};

export default EmployeeManagement;
