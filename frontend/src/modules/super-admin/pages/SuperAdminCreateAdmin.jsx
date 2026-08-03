import React, { useState } from 'react';
import { User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEmployee } from '../../../api/employeeApi';
import { ROLES, DEPARTMENTS } from '../../../components/common/constants';
import CustomDropdown from '../../../components/common/CustomDropdown';
import { useAuth } from '../../../context/AuthContext';

/* ── Reusable field wrapper ── */
const Field = ({ label, required, error, children }) => (
  <div className="flex flex-col gap-2">
    <label className="text-sm font-semibold text-slate-800">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {error && <span className="text-xs text-red-500">{error}</span>}
  </div>
);

const inputCls =
  'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all';

/* ── Page ── */
const SuperAdminCreateAdmin = () => {
  const { role: currentUserRole } = useAuth();
  
  const initialState = {
    employeeId: '',
    fullName: '',
    email: '',
    role: '',
    department: '',
  };
  
  const [formData, setFormData] = useState(initialState);
  const [touched, setTouched] = useState({});
  const [loading, setLoading] = useState(false);

  const isFormValid = formData.employeeId && formData.fullName && formData.email && formData.role && formData.department;

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleReset = () => {
    setFormData(initialState);
    setTouched({});
  };

  const handleSubmit = async () => {
    
    // Mark all fields as touched
    setTouched({
      employeeId: true,
      fullName: true,
      email: true,
      role: true,
      department: true
    });

    if (!isFormValid) {
      return;
    }
    setLoading(true);
    try {
      await createEmployee({
        employeeId: formData.employeeId,
        fullName: formData.fullName,
        email: formData.email,
        role: formData.role,
        department: formData.department,
      });
      toast.success('User created successfully', { position: 'top-center' });
      setFormData(initialState);
      setTouched({});
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Failed to create account. Please try again.';
      if (errorMsg.toLowerCase().includes('email') || errorMsg.toLowerCase().includes('exist')) {
        toast.error("This email ID already exists!", { position: 'top-right' });
      } else {
        toast.error(errorMsg, { position: 'top-right' });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-slate-50">
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm w-full mx-auto min-h-[600px] flex flex-col">
        {/* Card header */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center border border-slate-200">
            <User size={16} className="text-slate-600" />
          </div>
          <h2 className="text-base font-bold text-slate-800">User Details</h2>
        </div>

        {/* Fields grid */}
        <div className="p-6 grid grid-cols-2 gap-x-8 gap-y-6">
          {/* Row 1 */}
          <Field label="Employee ID" required error={touched.employeeId && !formData.employeeId ? 'Employee ID is required' : ''}>
            <input
              type="text"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter Employee ID"
              className={inputCls}
            />
          </Field>

          <Field label="Full Name" required error={touched.fullName && !formData.fullName ? 'Full Name is required' : ''}>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter Full Name"
              className={inputCls}
            />
          </Field>

          {/* Row 2 */}
          <Field label="Email Address" required error={touched.email && !formData.email ? 'Email Address is required' : ''}>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Enter Email Address"
              className={inputCls}
            />
          </Field>

          <Field label="Role" required error={touched.role && !formData.role ? 'Role is required' : ''}>
            <CustomDropdown
              value={formData.role}
              options={ROLES.filter(r => {
                if (currentUserRole === 'SUPER_ADMIN') return r === 'ADMIN';
                if (currentUserRole === 'ADMIN') return r === 'HR' || r === 'EMPLOYEE';
                return false;
              })}
              onChange={(val) => {
                handleSelectChange('role', val);
                setTouched(prev => ({...prev, role: true}));
              }}
              placeholder="Select Role"
            />
          </Field>

          {/* Row 3 */}
          <Field label="Department" required error={touched.department && !formData.department ? 'Department is required' : ''}>
            <CustomDropdown
              value={formData.department}
              options={DEPARTMENTS}
              onChange={(val) => {
                handleSelectChange('department', val);
                setTouched(prev => ({...prev, department: true}));
              }}
              placeholder="Select Department"
            />
          </Field>
        </div>

        {/* Divider + Action */}
        <div className="border-t border-slate-100 px-6 py-6 flex justify-end gap-3 mt-auto">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 rounded-lg text-sm font-semibold transition-colors min-w-[100px]"
          >
            Reset
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !isFormValid}
            className="px-10 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-80 disabled:bg-blue-300 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm min-w-[140px]"
          >
            {loading && (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            )}
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminCreateAdmin;
