import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { Zap, Lock, Mail, Send, ArrowLeft, CheckCircle, X } from 'lucide-react';

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
 * ForgotPasswordPage
 * Collects target email and dispatches a reset token generation request to the backend
 */
const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Please provide your account email address.');
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Error occurred while processing request.');
    } finally {
      setLoading(false);
    }
  };

  const isDisabled = !email.trim() || loading;

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f4f7ff] p-4 relative overflow-hidden">
      {/* Abstract Background Shapes */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-200/40 rounded-full mix-blend-multiply filter blur-3xl opacity-70 translate-x-1/3 translate-y-1/3"></div>

      {/* Wrapper for Card and Toast to keep positioning relative */}
      <div className="relative w-full max-w-2xl mt-16">
        {/* Error Toast */}
        {error && <ErrorBanner message={error} onClose={() => setError('')} />}

        {/* Main Card */}
        <div className="w-full bg-white rounded-3xl shadow-xl p-8 sm:p-10 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="text-indigo-600">
            <Zap size={24} className="fill-indigo-600" />
          </div>
          <span className="text-xl font-bold tracking-wide text-slate-900">Attendece marker </span>
        </div>

        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center border-4 border-white shadow-sm">
            <Lock size={28} className="text-indigo-600" />
          </div>
        </div>

        {/* Text Content */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Forgot Password?</h2>
          <p className="text-sm text-slate-500 leading-relaxed px-4">
            Enter your registered email address, and we'll send you a secure link to reset your password.
          </p>
        </div>

        {/* Success State Screen */}
        {success ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                <CheckCircle size={24} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-emerald-800 mb-1">Link Sent Successfully</h3>
                <p className="text-sm text-emerald-600/90 leading-relaxed">
                  We've sent a secure password reset link to <br/>
                  <span className="font-medium">{email}</span>
                </p>
              </div>
            </div>
            <Link
              to="/login"
              className="w-full flex items-center justify-center py-3.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm shadow-indigo-200 transition-all duration-200"
            >
              Return to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email input field */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-800 placeholder-slate-400 outline-none transition-all duration-200 shadow-sm"
                  placeholder="name@company.com"
                  disabled={loading}
                />
              </div>
            </div>

            {/* Action buttons */}
            <button
              type="submit"
              disabled={isDisabled}
              className={`w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-medium text-sm shadow-md transition-all duration-200 mt-4 ${
                isDisabled 
                  ? 'bg-blue-300 text-white cursor-not-allowed shadow-none' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/20'
              }`}
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Sending Link...</span>
                </>
              ) : (
                <>
                  <Send size={18} />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-white px-3 text-slate-400 font-medium">OR</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
