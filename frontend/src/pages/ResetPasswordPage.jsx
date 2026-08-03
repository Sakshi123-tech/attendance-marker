import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { ArrowLeft, Eye, EyeOff, CheckCircle, X, AlertTriangle } from 'lucide-react';

/* ── Top error banner (like login page) ── */
const ErrorBanner = ({ message, onClose }) => (
  <div className="absolute -top-20 left-0 right-0 z-50 flex justify-center animate-in slide-in-from-top-4 duration-300">
    <div className="w-full bg-red-600 text-white rounded-lg px-5 py-3 flex items-center justify-between shadow-lg">
      <div className="flex-1 text-center pr-4">
        <p className="font-bold text-sm">Error</p>
        <p className="text-[13px] text-red-100 mt-0.5">{message}</p>
      </div>
      <button onClick={onClose} className="text-white/80 hover:text-white transition-colors shrink-0">
        <X size={16} strokeWidth={2.5} />
      </button>
    </div>
  </div>
);

/**
 * ResetPasswordPage
 * Reads recovery token from query params, accepts new passwords, and dispatches reset request
 */
const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  // Input states
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing token parameter. Please open the link directly from your email.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please fill in both password fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/recover-password', {
        token,
        password,
        confirmPassword
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while resetting password.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = loading || !password || !confirmPassword;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7ff] p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/3 translate-y-1/3"></div>

      {/* Wrapper for Card and Toast to keep positioning relative */}
      <div className="relative w-full max-w-[480px] mt-16">
        {/* Error Toast */}
        {error && <ErrorBanner message={error} onClose={() => setError('')} />}

        {/* Main Card */}
        <div className="w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
        {/* Title */}
        <div className="flex items-start gap-4 mb-8">
          <div>
            <h2 className="text-[22px] font-semibold text-slate-800">Reset Your Password</h2>
            <p className="text-sm text-slate-500 mt-1">Create a new password to regain access to your account.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New password input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-100/80 focus:bg-slate-100 focus:ring-1 focus:ring-blue-400 rounded-lg py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 pr-10"
                placeholder="Enter New Password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Confirm password input */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-slate-100/80 focus:bg-slate-100 focus:ring-1 focus:ring-blue-400 rounded-lg py-3 px-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 pr-10"
                placeholder="Re Enter New Password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
        <div className="flex justify-center w-full pt-2">
          <button
            type="submit"
            disabled={isDisabled}
            className={`w-full flex items-center justify-center py-3 px-4 rounded-lg font-semibold text-sm transition-all duration-200 ${
              isDisabled 
                ? 'bg-blue-300 text-white cursor-not-allowed shadow-none' 
                : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md shadow-blue-500/20'
            }`}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <span>Reset Password</span>
            )}
          </button>
        </div>
        </form>

        {/* Success Modal Popup */}
        {success && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl relative animate-in zoom-in-95 duration-200">
              <button
                onClick={() => navigate('/login')}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-3 mb-2 mt-2">
                <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
                  <CheckCircle size={16} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Password Updated Succesfully</h3>
              </div>

              <p className="text-sm text-slate-600 mb-6 pl-9">
                You can now log in with your new password.
              </p>

              <Link
                to="/login"
                className="w-full block text-center py-2.5 px-4 bg-[#0d6efd] hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Continue to login
              </Link>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
