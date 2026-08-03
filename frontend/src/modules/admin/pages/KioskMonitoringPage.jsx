import React, { useState, useEffect } from 'react';
import { Monitor, MapPin, Wifi, WifiOff, Clock, Copy, CheckCheck, Eye, EyeOff } from 'lucide-react';
import { fetchKiosks } from '../../../api/kioskApi';

import toast from 'react-hot-toast';

const KioskMonitoringPage = () => {
  const [kiosk, setKiosk] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const data = await fetchKiosks();
        setKiosk(data && data.length > 0 ? data[0] : null);
      } catch (err) {
        toast.error('Failed to load kiosk data');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copyToClipboard = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const getLastSeen = (heartbeat) => {
    if (!heartbeat) return 'Never';
    const diff = Date.now() - new Date(heartbeat).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins} min ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(heartbeat).toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Kiosk System</h2>
        <p className="text-sm text-slate-500 mt-1">Real-time status of your attendance terminal.</p>
      </div>

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 animate-pulse shadow-sm">
          <div className="h-6 bg-slate-200 rounded w-48 mb-6" />
          <div className="h-4 bg-slate-200 rounded w-32 mb-4" />
          <div className="h-4 bg-slate-200 rounded w-24" />
        </div>
      ) : !kiosk ? (
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-gradient-to-b from-white to-slate-50/80 p-12 text-center shadow-xl shadow-slate-200/40 mt-8">
          {/* Background decorative blob */}
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-100 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse" style={{ animationDuration: '4s' }}></div>

          <div className="relative flex flex-col items-center z-10">
            {/* Animated Icon Wrapper */}
            <div className="w-24 h-24 mb-6 relative flex items-center justify-center">
              <div className="absolute inset-2 bg-white rounded-full animate-pulse opacity-80 shadow-md"></div>
              <div className="relative w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-indigo-500 shadow-lg shadow-slate-200/50 transition-transform hover:scale-105 duration-300">
                <Monitor size={28} strokeWidth={1.5} />
              </div>
            </div>

            {/* Text Content */}
            <h3 className="text-2xl font-extrabold text-slate-800 mb-3 tracking-tight">
              No Kiosk Assigned
            </h3>
            <p className="text-slate-500 max-w-sm mx-auto text-base leading-relaxed">
              You currently do not have a physical attendance terminal assigned to your administrative account. Please contact a <span className="font-medium text-slate-700">Super Administrator</span> for setup.
            </p>
          </div>
        </div>
      ) : (
        <div className={`bg-white border-2 rounded-2xl p-8 transition-all shadow-md ${kiosk.isActive ? 'border-emerald-200' : 'border-red-200'}`}>

          {/* Identity row */}
          <div className="flex items-start justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${kiosk.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                <Monitor size={28} />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{kiosk.name}</h3>
                <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                  <MapPin size={14} />
                  {kiosk.location || 'Unknown Location'}
                </div>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border ${kiosk.isActive ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-red-50 text-red-600 border-red-200'}`}>
              {kiosk.isActive ? <Wifi size={16} /> : <WifiOff size={16} />}
              {kiosk.isActive ? 'Online' : 'Offline'}
            </div>
          </div>

          {/* Info section */}
          <div className="space-y-4">

            {/* Last Heartbeat */}
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <Clock size={14} />
                Last Heartbeat
              </div>
              <p className="text-sm font-medium text-slate-900">{getLastSeen(kiosk.lastHeartbeat)}</p>
            </div>

            {/* Kiosk Device ID */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Kiosk Device ID</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="flex-1 font-mono text-sm text-slate-700 break-all">{kiosk._id}</span>
                <button
                  onClick={() => copyToClipboard(kiosk._id, 'id')}
                  className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Copy Device ID"
                >
                  {copiedField === 'id' ? <CheckCheck size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

            {/* Hardware Secret Token */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hardware Secret Token</label>
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
                <span className="flex-1 font-mono text-sm text-slate-700 break-all">
                  {showSecret ? (kiosk.deviceSecret || kiosk.secretKey || '—') : '•'.repeat(Math.min(32, (kiosk.deviceSecret || kiosk.secretKey || '').length || 20))}
                </span>
                <button
                  onClick={() => setShowSecret(s => !s)}
                  className="shrink-0 text-slate-400 hover:text-slate-700 transition-colors"
                  title={showSecret ? 'Hide secret' : 'Show secret'}
                >
                  {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                <button
                  onClick={() => copyToClipboard(kiosk.deviceSecret || kiosk.secretKey || '', 'secret')}
                  className="shrink-0 text-slate-400 hover:text-indigo-600 transition-colors"
                  title="Copy secret token"
                >
                  {copiedField === 'secret' ? <CheckCheck size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default KioskMonitoringPage;
