import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import apiClient from '../api/axios';

/**
 * SetupAccountPage
 * Fully standalone page (no AuthLayout wrapper needed).
 * Accessed by new employees to set their password via invitation link.
 */
const SetupAccountPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setupAccount } = useAuth();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tokenStatus, setTokenStatus] = useState('checking'); // checking, valid, invalid, registered

  useEffect(() => {
    if (!token) {
      setTokenStatus('invalid');
      setError('Missing onboarding token. Please verify the URL link from your email.');
      return;
    }

    const checkToken = async () => {
      try {
        const res = await apiClient.get(`/auth/verify-token/${token}`);
        if (res.data.alreadyRegistered) {
          setTokenStatus('registered');
        } else {
          setTokenStatus('valid');
        }
      } catch (err) {
        setTokenStatus('invalid');
        setError(err.response?.data?.message || 'Invalid or expired invitation link.');
      }
    };
    
    checkToken();
  }, [token]);

  const getPasswordStrength = () => {
    if (!password) return null;
    if (password.length < 6) return { level: 'weak', color: 'bg-red-500', label: 'Too short' };
    if (password.length < 8) return { level: 'fair', color: 'bg-amber-500', label: 'Fair' };
    if (/[A-Z]/.test(password) && /[0-9]/.test(password)) return { level: 'strong', color: 'bg-emerald-500', label: 'Strong' };
    return { level: 'good', color: 'bg-indigo-500', label: 'Good' };
  };
  const strength = getPasswordStrength();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Missing onboarding token. Please verify the URL link from your email.');
      return;
    }
    if (!password || !confirmPassword) {
      setError('Please fill in all password fields.');
      return;
    }
    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please try again.');
      return;
    }

    setLoading(true);
    try {
      const user = await setupAccount(token, password, confirmPassword);
      switch (user.role) {
        case 'SUPER_ADMIN': navigate('/super-admin'); break;
        case 'ADMIN':       navigate('/admin'); break;
        case 'HR':          navigate('/hr'); break;
        case 'EMPLOYEE':    navigate('/employee'); break;
        case 'KIOSK':       navigate('/kiosk'); break;
        default:            navigate('/unauthorized');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error setting up account. The invitation link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/8 blur-[140px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/8 blur-[140px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-2xl shadow-slate-200">

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 mb-4">
              <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div className="px-3 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-bold tracking-widest mb-3">
              ACCOUNT ACTIVATION
            </div>
            <h1 className="text-2xl font-bold text-slate-900 text-center">Set Your Password</h1>
            <p className="text-sm text-slate-500 text-center mt-1.5 leading-snug">
              Welcome aboard! Create a secure password to activate your account and get started.
            </p>
          </div>

          {/* Invalid token warning */}
          {tokenStatus === 'invalid' && error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3 mb-6">
              <svg className="w-5 h-5 text-red-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800">Invalid Link</p>
                <p className="text-xs text-red-700 mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {tokenStatus === 'checking' && (
            <div className="py-12 flex flex-col items-center justify-center">
              <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="mt-4 text-sm font-medium text-slate-500">Verifying your link...</p>
            </div>
          )}

          {tokenStatus === 'registered' && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-emerald-100">
                <svg className="w-8 h-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-slate-900">Already Registered</h2>
              <p className="text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
                You have already set up your password and your account is active. You can proceed to log in.
              </p>
              <button
                onClick={() => navigate('/')}
                className="w-full py-3 px-4 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 font-semibold rounded-xl transition-colors"
              >
                Go to Login Page
              </button>
            </div>
          )}

          {/* Form */}
          {tokenStatus === 'valid' && (
            <form onSubmit={handleSubmit} className="space-y-5">
            {/* Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Choose Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-3 px-4 pr-11 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-200"
                  placeholder="Minimum 6 characters"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Strength bar */}
              {strength && (
                <div className="space-y-1 pt-1">
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all duration-500 ${strength.color} ${strength.level === 'weak' ? 'w-1/4' : strength.level === 'fair' ? 'w-2/4' : strength.level === 'good' ? 'w-3/4' : 'w-full'}`}></div>
                  </div>
                  <p className={`text-[10px] font-semibold ${strength.level === 'weak' ? 'text-red-500' : strength.level === 'fair' ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Confirm Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={`w-full bg-slate-50 border focus:ring-1 rounded-xl py-3 px-4 text-sm placeholder-slate-400 outline-none transition-all duration-200 text-slate-900 ${
                  confirmPassword && confirmPassword !== password
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : confirmPassword && confirmPassword === password
                    ? 'border-emerald-300 focus:border-emerald-500 focus:ring-emerald-500'
                    : 'border-slate-200 focus:border-indigo-500 focus:ring-indigo-500'
                }`}
                placeholder="Re-enter your password"
                disabled={loading}
              />
              {confirmPassword && confirmPassword !== password && (
                <p className="text-[10px] text-red-500 font-semibold">Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === password && (
                <p className="text-[10px] text-emerald-600 font-semibold">✓ Passwords match</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !token}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:opacity-90 text-white rounded-xl font-semibold text-sm shadow-lg shadow-indigo-500/20 focus:outline-none transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Activating Account...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </>
              )}
            </button>
          </form>
          )}

          {/* Tips */}
          {tokenStatus === 'valid' && (
            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Password Tips</p>
              <ul className="space-y-1">
                {['At least 6 characters long', 'Mix uppercase and lowercase letters', 'Include a number or symbol'].map(tip => (
                  <li key={tip} className="text-xs text-slate-500 flex items-center gap-2">
                    <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0"></div>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          Smart Attendance Management System • Secure Onboarding
        </p>
      </div>
    </div>
  );
};

export default SetupAccountPage;
