import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * LoginPage authentication screen
 * Collects email & password, dispatches user login, and navigates depending on user role
 */
const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Field validation check
  const validateForm = () => {
    if (!email || !password) {
      setError('Please provide both email and password.');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please provide a valid email address.');
      return false;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await login(email, password);
      
      // Perform dynamic role redirect routing
      switch (user.role) {
        case 'SUPER_ADMIN':
          navigate('/super-admin');
          break;
        case 'ADMIN':
          navigate('/admin');
          break;
        case 'HR':
          navigate('/hr');
          break;
        case 'EMPLOYEE':
          navigate('/employee');
          break;
        case 'KIOSK':
          navigate('/kiosk');
          break;
        default:
          navigate('/unauthorized');
      }
    } catch (err) {
      const serverMessage = err.response?.data?.message || 'Invalid credentials or connection failure.';
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Subtitle */}
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-900">Welcome Back</h2>
        <p className="text-xs text-slate-500 mt-1">Provide credentials to enter control node</p>
      </div>

      {/* Error Alert Box */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/25 rounded-xl p-3.5 flex items-start space-x-2.5 text-xs text-red-400 animate-headShake">
          <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email Address */}
        <div className="space-y-1">
          <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
              placeholder="name@company.com"
              disabled={loading}
            />
          </div>
        </div>

        {/* Password field */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Security Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-semibold text-indigo-500 hover:text-indigo-600 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
        </div>

        {/* Submit trigger button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/10 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Authenticating Session...</span>
            </>
          ) : (
            <span>Sign In to System</span>
          )}
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
