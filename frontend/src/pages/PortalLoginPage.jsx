import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import GlobalInput from '../components/common/GlobalInput';

const PORTAL_CONFIG = {
  'super-admin': {
    label: 'Super Admin Portal',
    allowedRole: 'SUPER_ADMIN',
    dashboardPath: '/super-admin',
  },
  'admin': {
    label: 'Admin Portal',
    allowedRole: 'ADMIN',
    dashboardPath: '/admin',
  },
  'hr': {
    label: 'HR Portal',
    allowedRole: 'HR',
    dashboardPath: '/hr',
  },
  'employee': {
    label: 'Employee Portal',
    allowedRole: 'EMPLOYEE',
    dashboardPath: '/employee',
  },
};

/* ── Top error banner (like second image) ── */
const ErrorBanner = ({ title, message, onClose }) => (
  <div className="fixed top-0 left-0 right-0 z-50 flex justify-center px-4 pt-3">
    <div className="w-full max-w-md bg-red-600 text-white rounded-lg px-5 py-3 flex items-start justify-between shadow-lg">
      <div>
        <p className="font-bold text-sm">{title}</p>
        <p className="text-[13px] text-red-100 mt-0.5">{message}</p>
      </div>
      <button onClick={onClose} className="ml-4 mt-0.5 text-white/80 hover:text-white transition-colors shrink-0">
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  </div>
);

const PortalLoginPage = ({ portal }) => {
  const { login, logout, isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const config = PORTAL_CONFIG[portal];

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [banner, setBanner] = useState(null); // { title, message }
  const [emailError, setEmailError] = useState(''); // Inline error for forgot password

  const isDisabled = !email.trim() || !password.trim() || loading;

  useEffect(() => {
    if (isAuthenticated && role === config.allowedRole) {
      navigate(config.dashboardPath, { replace: true });
    }
  }, [isAuthenticated, role, navigate, config.dashboardPath]);

  const handleForgotPasswordClick = (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setEmailError('Please fill email first');
      return;
    }
    navigate('/forgot-password');
  };

  // Auto-dismiss banner after 5 seconds
  useEffect(() => {
    if (!banner) return;
    const t = setTimeout(() => setBanner(null), 5000);
    return () => clearTimeout(t);
  }, [banner]);

  const showBanner = (title, message) => setBanner({ title, message });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDisabled) return;
    setBanner(null);
    setLoading(true);
    try {
      if (isAuthenticated && role !== config.allowedRole) {
        await logout();
      }

      const user = await login(email, password);

      if (user.role !== config.allowedRole) {
        showBanner('Unauthorized Access', 'This account is not authorized to access the selected system.');
        await logout();
        return;
      }

      navigate(config.dashboardPath);
    } catch {
      showBanner('Invalid Credential', 'Please enter the valid credential and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: '#f0f0f0' }}>

      {/* Top error banner */}
      {banner && (
        <ErrorBanner
          title={banner.title}
          message={banner.message}
          onClose={() => setBanner(null)}
        />
      )}

      {/* Card */}
      <div className="bg-white rounded-2xl shadow-md w-full max-w-lg px-8 py-9 mx-4">

        {/* Title */}
        <p className="text-slate-500 text-sm mb-1">Welcome !</p>
        <h1 className="text-[22px] font-bold text-slate-900 mb-6">
          Log in to {config.label}
        </h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4" autoComplete="off">

          {/* Email / Username */}
          <div className="space-y-1">
            <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span>Email Address</span>
              {emailError && <span className="text-red-500 font-medium text-[11px] animate-in slide-in-from-right-2">{emailError}</span>}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError(''); // Clear inline error on change
              }}
              autoComplete="off"
              placeholder="Colamit@2045"
              disabled={loading}
              className="w-full border border-slate-300 rounded-lg px-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <GlobalInput
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="••••••••••••••"
                disabled={loading}
                className="w-full border border-slate-300 rounded-lg px-4 py-2.5 pr-11 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>

            <div className="flex justify-end mt-1.5">
              <button 
                type="button" 
                onClick={handleForgotPasswordClick}
                className="text-xs text-red-500 hover:text-red-600 transition-colors font-medium bg-transparent border-none p-0 cursor-pointer"
              >
                Forgot Password ?
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors mt-1 flex items-center justify-center gap-2 ${
              isDisabled ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Signing In...</span>
              </>
            ) : (
              'Continue'
            )}
          </button>
        </form>

        {/* Back link */}
        <div className="text-center mt-5">
          <Link to="/login" className="text-xs text-slate-400 hover:text-slate-600 transition-colors">
            ← Back to Portal Selection
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PortalLoginPage;
