import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Shield, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Clock,
  LogIn, LogOut, Key, AlertTriangle, RefreshCw, ChevronRight,
  ArrowLeft, UserCheck, User, Mail, Hash, ShieldCheck,
  Activity, Check, Sparkles, ExternalLink
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import axiosInstance from '../../api/axios';
import RoleBadge from './RoleBadge';

/* ─────────────────────────────────────────────────────────────
   Password Strength Calculator
───────────────────────────────────────────────────────────── */
const getPasswordStrength = (pw) => {
  if (!pw) return { score: 0, label: '', color: '', percent: 0 };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[0-9]/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;

  const configs = [
    { score: 0, label: '', color: 'bg-slate-200', percent: 0 },
    { score: 1, label: 'Very Weak', color: 'bg-red-500', percent: 20 },
    { score: 2, label: 'Weak', color: 'bg-orange-500', percent: 40 },
    { score: 3, label: 'Fair', color: 'bg-amber-500', percent: 60 },
    { score: 4, label: 'Strong', color: 'bg-blue-600', percent: 80 },
    { score: 5, label: 'Very Strong', color: 'bg-emerald-600', percent: 100 },
  ];
  return configs[s] || configs[5];
};

/* ─────────────────────────────────────────────────────────────
   Action Metadata for Activity Logs
───────────────────────────────────────────────────────────── */
const ACTION_META = {
  LOGIN: {
    label: 'Successful Login',
    Icon: LogIn,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  LOGOUT: {
    label: 'Logout',
    Icon: LogOut,
    color: 'text-slate-600',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700'
  },
  PASSWORD_RESET: {
    label: 'Password Updated',
    Icon: Key,
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800'
  },
  USER_ACTIVATED: {
    label: 'Account Activated',
    Icon: UserCheck,
    color: 'text-violet-700',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    badge: 'bg-violet-100 text-violet-800'
  },
  FAILED_LOGIN_ATTEMPT: {
    label: 'Failed Login Attempt',
    Icon: AlertTriangle,
    color: 'text-rose-700',
    bg: 'bg-rose-50',
    border: 'border-rose-200',
    badge: 'bg-rose-100 text-rose-800'
  },
};

const getActionMeta = (action) =>
  ACTION_META[action] || {
    label: action,
    Icon: Shield,
    color: 'text-slate-700',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    badge: 'bg-slate-100 text-slate-700'
  };

const formatTime = (dateStr) => {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24 && now.getDate() === date.getDate()) return `Today, ${timeStr}`;
  if (diffDays === 1 || (diffHours < 48 && now.getDate() - date.getDate() === 1)) return `Yesterday, ${timeStr}`;
  if (diffDays < 7) return `${diffDays}d ago, ${timeStr}`;
  return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) + ` at ${timeStr}`;
};

/* ─────────────────────────────────────────────────────────────
   Back Navigation Header
───────────────────────────────────────────────────────────── */
const SectionHeader = ({ title, category = 'Settings', description, onBack }) => (
  <div className="mb-6 space-y-2">
    <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
      <button
        onClick={onBack}
        className="hover:text-indigo-600 transition-colors cursor-pointer flex items-center gap-1"
      >
        <span>{category}</span>
      </button>
      <span>/</span>
      <span className="text-slate-900">{title}</span>
    </div>

    <div className="flex items-center gap-3.5">
      <button
        onClick={onBack}
        className="group w-10 h-10 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-50 transition-all cursor-pointer shadow-xs shrink-0 active:scale-95"
        title="Back to Settings"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-0.5 transition-transform" />
      </button>
      <div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h2>
        {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
      </div>
    </div>
  </div>
);

/* ─────────────────────────────────────────────────────────────
   Section 1: Password & Security View
───────────────────────────────────────────────────────────── */
const PasswordView = ({ onBack }) => {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(form.newPassword);

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError(null);
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.currentPassword) {
      setError('Please enter your current password.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (form.newPassword === form.currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      await axiosInstance.post('/auth/reset-password', {
        currentPassword: form.currentPassword,
        password: form.newPassword,
        confirmPassword: form.confirmPassword,
      });
      setSuccess(true);
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password. Please check your current password.');
    } finally {
      setLoading(false);
    }
  };

  const requirements = [
    { label: 'At least 8 characters', met: form.newPassword.length >= 8 },
    { label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(form.newPassword) },
    { label: 'One number (0-9)', met: /[0-9]/.test(form.newPassword) },
    { label: 'One special character (!@#$...)', met: /[^A-Za-z0-9]/.test(form.newPassword) },
  ];

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <SectionHeader
        title="Password & Credentials"
        description="Update your account password and review security requirements."
        onBack={onBack}
      />

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Status Alerts */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3 text-rose-700 animate-in fade-in duration-200">
            <AlertCircle size={18} className="shrink-0 mt-0.5 text-rose-600" />
            <div className="text-sm font-medium">{error}</div>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3 text-emerald-800 animate-in fade-in duration-200">
            <CheckCircle size={18} className="shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="text-sm font-semibold">Password updated successfully!</p>
              <p className="text-xs text-emerald-700 mt-0.5">Your credentials are secure. Use your new password on your next login.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show.current ? 'text' : 'password'}
                name="currentPassword"
                value={form.currentPassword}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="Enter current password"
                className="w-full px-4 py-2.5 pr-11 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow(p => ({ ...p, current: !p.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg"
              >
                {show.current ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-2" />

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show.new ? 'text' : 'password'}
                name="newPassword"
                value={form.newPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Enter new password (min. 8 characters)"
                className="w-full px-4 py-2.5 pr-11 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow(p => ({ ...p, new: !p.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg"
              >
                {show.new ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password Strength Visualizer */}
            {form.newPassword && (
              <div className="space-y-2 pt-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Strength:</span>
                  <span className={
                    strength.score <= 2 ? 'text-rose-600' :
                    strength.score === 3 ? 'text-amber-600' :
                    strength.score === 4 ? 'text-blue-600' : 'text-emerald-600'
                  }>
                    {strength.label}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                  {[1, 2, 3, 4, 5].map(idx => (
                    <div
                      key={idx}
                      className={`h-full flex-1 rounded-full transition-all duration-300 ${
                        idx <= strength.score ? strength.color : 'bg-slate-200/70'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={show.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="new-password"
                placeholder="Re-enter new password"
                className="w-full px-4 py-2.5 pr-11 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-xs"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShow(p => ({ ...p, confirm: !p.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer rounded-lg"
              >
                {show.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {form.confirmPassword && (
              <div className="pt-1">
                {form.newPassword === form.confirmPassword ? (
                  <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1.5">
                    <CheckCircle size={13} /> Passwords match
                  </p>
                ) : (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1.5">
                    <AlertCircle size={13} /> Passwords do not match
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Requirements Checklist */}
          <div className="bg-slate-50/80 rounded-xl border border-slate-200/70 p-4 space-y-2">
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">Security Requirements</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {requirements.map(req => (
                <div
                  key={req.label}
                  className={`flex items-center gap-2 transition-colors ${
                    req.met ? 'text-emerald-700 font-medium' : 'text-slate-400'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    req.met ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'
                  }`}>
                    {req.met ? <Check size={11} strokeWidth={3} /> : <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />}
                  </div>
                  <span>{req.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer shadow-sm hover:shadow active:scale-98"
            >
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Update Password</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onBack}
              className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Section 2: Login Activity & Audit Logs View
───────────────────────────────────────────────────────────── */
const ActivityView = ({ onBack }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('ALL');

  const fetchLogs = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get('/auth/my-activity');
      setLogs(res.data?.data?.logs || []);
    } catch {
      setError('Unable to load login activity. Please check your network connection.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = logs.filter(log => {
    if (filter === 'SUCCESSFUL') return log.action === 'LOGIN';
    if (filter === 'FAILED') return log.action === 'FAILED_LOGIN_ATTEMPT';
    return true;
  });

  return (
    <div className="max-w-3xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <SectionHeader
        title="Login Activity & Audit Logs"
        description="Review your recent authentication attempts, logins, and logouts."
        onBack={onBack}
      />

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
        {/* Controls Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/50">
          {/* Filters */}
          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
            {[
              { val: 'ALL', label: `All (${logs.length})` },
              { val: 'SUCCESSFUL', label: 'Successful' },
              { val: 'FAILED', label: 'Failed' },
            ].map(({ val, label }) => (
              <button
                key={val}
                onClick={() => setFilter(val)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  filter === val
                    ? 'bg-white text-indigo-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            onClick={() => fetchLogs(true)}
            disabled={loading || refreshing}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-60 cursor-pointer shadow-xs active:scale-95"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin text-indigo-600' : ''} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh Logs'}</span>
          </button>
        </div>

        {/* Logs Content List */}
        <div className="p-4 sm:p-6 space-y-3">
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3, 4].map(idx => (
                <div key={idx} className="flex items-center gap-3.5 p-4 rounded-xl bg-slate-50 animate-pulse border border-slate-100">
                  <div className="w-9 h-9 bg-slate-200 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 bg-slate-200 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-200/70 rounded w-1/4" />
                  </div>
                  <div className="h-3 bg-slate-200 rounded w-20 shrink-0" />
                </div>
              ))}
            </div>
          )}

          {!loading && error && (
            <div className="flex flex-col items-center py-10 px-4 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-500">
                <AlertCircle size={24} />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Failed to load activity logs</p>
                <p className="text-xs text-slate-500 mt-0.5">{error}</p>
              </div>
              <button
                onClick={() => fetchLogs(false)}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer shadow-xs"
              >
                <RefreshCw size={13} />
                <span>Try Again</span>
              </button>
            </div>
          )}

          {!loading && !error && filteredLogs.length === 0 && (
            <div className="flex flex-col items-center py-12 px-4 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400">
                <Clock size={22} />
              </div>
              <p className="text-sm font-bold text-slate-800">No activity logs found</p>
              <p className="text-xs text-slate-500 max-w-sm">
                There are no recorded authentication events matching your selected filter.
              </p>
            </div>
          )}

          {!loading && !error && filteredLogs.map(log => {
            const meta = getActionMeta(log.action);
            const { Icon } = meta;

            return (
              <div
                key={log._id}
                className={`flex items-start sm:items-center justify-between gap-3 p-3.5 rounded-xl border transition-all ${meta.border} ${meta.bg}`}
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white border ${meta.border} shadow-xs`}>
                    <Icon size={16} className={meta.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-sm font-bold ${meta.color}`}>
                        {meta.label}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${meta.badge}`}>
                        AUTH
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 flex-wrap">
                      <span>{formatTime(log.createdAt)}</span>
                      {log.details?.ip && (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="font-mono text-[11px] text-slate-600 bg-white/70 px-1.5 py-0.5 rounded border border-slate-200/60">
                            IP: {log.details.ip}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="shrink-0 text-right">
                  <span className="text-xs font-semibold text-slate-500 hidden sm:inline-block">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Section 3: Account & Session Info View
───────────────────────────────────────────────────────────── */
const AccountView = ({ onBack, onNavigatePassword, onNavigateActivity }) => {
  const { user, role, logout } = useAuth();

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      <SectionHeader
        title="Account & Profile Details"
        description="View your verified account credentials, role permissions, and active session status."
        onBack={onBack}
      />

      {/* Main Account Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* User Identity Banner */}
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-indigo-500/20">
            {user?.fullName
              ? user.fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
              : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-bold text-slate-900 truncate">{user?.fullName || 'User'}</h3>
            <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              <RoleBadge role={role} />
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Account
              </span>
            </div>
          </div>
        </div>

        {/* Account Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Full Name</span>
            <p className="text-sm font-semibold text-slate-800">{user?.fullName || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</span>
            <p className="text-sm font-semibold text-slate-800 truncate">{user?.email || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Assigned Role</span>
            <p className="text-sm font-semibold text-slate-800">{role?.replace('_', ' ') || 'N/A'}</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">User ID</span>
            <p className="text-xs font-mono font-semibold text-slate-700 truncate">{user?._id || user?.id || 'N/A'}</p>
          </div>

          {user?.employeeId && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee ID</span>
              <p className="text-sm font-semibold text-slate-800">{user.employeeId}</p>
            </div>
          )}

          {user?.department && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Department</span>
              <p className="text-sm font-semibold text-slate-800">{user.department}</p>
            </div>
          )}
        </div>

        {/* Quick Shortcut Actions */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Quick Security Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={onNavigatePassword}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <Lock size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-700">Change Password</p>
                  <p className="text-[11px] text-slate-500">Update security key</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-0.5 transition-all" />
            </button>

            <button
              onClick={onNavigateActivity}
              className="flex items-center justify-between p-3.5 rounded-xl border border-slate-200 hover:border-violet-300 hover:bg-violet-50/40 text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                  <Activity size={15} />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 group-hover:text-violet-700">View Login History</p>
                  <p className="text-[11px] text-slate-500">Check recent sign-ins</p>
                </div>
              </div>
              <ChevronRight size={15} className="text-slate-400 group-hover:text-violet-600 group-hover:translate-x-0.5 transition-all" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Settings Landing Page: Clean Options Menu Cards
───────────────────────────────────────────────────────────── */
const SettingsHome = ({ user, role, onNavigate }) => {
  const options = [
    {
      key: 'password',
      Icon: Lock,
      iconColor: 'text-indigo-600',
      iconBg: 'bg-indigo-50',
      borderColor: 'group-hover:border-indigo-200',
      title: 'Password & Credentials',
      description: 'Change your account password and review strength requirements.',
      badgeText: 'Configured',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    },
    {
      key: 'activity',
      Icon: Clock,
      iconColor: 'text-violet-600',
      iconBg: 'bg-violet-50',
      borderColor: 'group-hover:border-violet-200',
      title: 'Login Activity & Audit Logs',
      description: 'Review your recent sign-ins, IP addresses, and authentication history.',
      badgeText: 'Live Logs',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    {
      key: 'account',
      Icon: UserCheck,
      iconColor: 'text-emerald-600',
      iconBg: 'bg-emerald-50',
      borderColor: 'group-hover:border-emerald-200',
      title: 'Account Details & Permissions',
      description: 'View your verified account profile, assigned role permissions, and active session.',
      badgeText: 'Verified',
      badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <div className="max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0">
            <Shield size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Account Settings</h2>
              <RoleBadge role={role} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Select an option below to manage your credentials, activity, and preferences.
            </p>
          </div>
        </div>

        {/* User Summary Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="truncate max-w-[140px] font-semibold text-slate-800">{user?.fullName || 'User'}</span>
        </div>
      </div>

      {/* Options Menu Cards */}
      <div className="space-y-3">
        {options.map(option => {
          const { Icon } = option;

          return (
            <button
              key={option.key}
              onClick={() => onNavigate(option.key)}
              className={`w-full bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md p-5 flex items-center gap-4 text-left transition-all duration-200 cursor-pointer group active:scale-[0.99] ${option.borderColor}`}
            >
              {/* Option Icon */}
              <div className={`w-12 h-12 ${option.iconBg} rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 duration-200`}>
                <Icon size={22} className={option.iconColor} />
              </div>

              {/* Title & Description */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {option.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wider ${option.badgeClass}`}>
                    {option.badgeText}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                  {option.description}
                </p>
              </div>

              {/* Right Chevron Indicator */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-300 group-hover:text-indigo-600 group-hover:bg-indigo-50 group-hover:translate-x-1 transition-all shrink-0">
                <ChevronRight size={18} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   Root Settings Component
   Converts dynamically into sub-pages based on user click
   Synchronized with URL params (?section=...)
───────────────────────────────────────────────────────────── */
const SecuritySettings = ({ defaultSection = 'home' }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, role } = useAuth();

  // Active section can come from URL parameter '?section=password|activity|account' or prop
  const currentSection = searchParams.get('section') || defaultSection;

  const navigateTo = (sectionKey) => {
    if (sectionKey === 'home') {
      searchParams.delete('section');
      setSearchParams(searchParams, { replace: false });
    } else {
      setSearchParams({ section: sectionKey });
    }
  };

  if (currentSection === 'password') {
    return <PasswordView onBack={() => navigateTo('home')} />;
  }

  if (currentSection === 'activity') {
    return <ActivityView onBack={() => navigateTo('home')} />;
  }

  if (currentSection === 'account') {
    return (
      <AccountView
        onBack={() => navigateTo('home')}
        onNavigatePassword={() => navigateTo('password')}
        onNavigateActivity={() => navigateTo('activity')}
      />
    );
  }

  return (
    <SettingsHome
      user={user}
      role={role}
      onNavigate={navigateTo}
    />
  );
};

export default SecuritySettings;
