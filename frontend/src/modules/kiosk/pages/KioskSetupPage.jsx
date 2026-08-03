import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { Monitor, ShieldCheck, AlertCircle, Eye, EyeOff, Fingerprint, Cpu } from 'lucide-react';

/**
 * KioskSetupPage
 * 
 * A production-grade hardware terminal setup screen.
 * The Admin physically walks to the kiosk tablet, opens this page,
 * enters the Kiosk ID and Hardware Secret generated from the Super Admin dashboard,
 * and this device is permanently authenticated as a KIOSK terminal.
 * 
 * After successful setup, the device is redirected to /kiosk and stays there.
 */
const KioskSetupPage = () => {
  const { loginKiosk } = useAuth();
  const navigate = useNavigate();

  const [kioskId, setKioskId] = useState('');
  const [kioskSecret, setKioskSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSetup = async (e) => {
    e.preventDefault();
    if (!kioskId.trim() || !kioskSecret.trim()) {
      setError('Both Kiosk ID and Hardware Secret are required.');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await loginKiosk(kioskId.trim(), kioskSecret.trim());
      setSuccess(true);
      // Brief success animation before redirecting
      setTimeout(() => {
        navigate('/kiosk', { replace: true });
      }, 1800);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        'Setup failed. Please verify the Kiosk ID and Hardware Secret and try again.';
      setError(msg);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-600/8 blur-[120px] pointer-events-none animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-blue-600/8 blur-[120px] pointer-events-none animate-pulse" style={{ animationDelay: '2s' }}></div>

      {/* Setup Card */}
      <div className="relative z-10 w-full max-w-md">

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-xl shadow-indigo-500/20 mb-4">
            <Monitor className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Kiosk Setup</h1>
          <p className="text-slate-500 text-sm mt-2 font-medium">
            Authenticate this device as a registered attendance terminal
          </p>
        </div>

        {/* Main Form Card */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-2xl p-8 shadow-2xl shadow-slate-200/50">

          {success ? (
            // Success State
            <div className="flex flex-col items-center text-center py-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center">
                <ShieldCheck className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Terminal Authenticated</h2>
                <p className="text-slate-500 text-sm mt-1">
                  This device is now registered. Launching kiosk mode...
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-lg">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-700 text-xs font-mono font-bold">DEVICE ACTIVE</span>
              </div>
            </div>
          ) : (
            // Form State
            <form onSubmit={handleSetup} className="space-y-5">

              {/* Info Banner */}
              <div className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-sm text-indigo-700">
                <Cpu className="w-4 h-4 shrink-0 mt-0.5" />
                <p>
                  Enter the credentials generated in the <strong>Super Admin → Kiosk Registrations</strong> panel.
                </p>
              </div>

              {/* Error Banner */}
              {error && (
                <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <p className="text-sm text-red-600 font-medium">{error}</p>
                </div>
              )}

              {/* Kiosk ID Field */}
              <div className="space-y-1.5">
                <label htmlFor="kioskId" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Kiosk Device ID
                </label>
                <div className="relative">
                  <Fingerprint className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="kioskId"
                    type="text"
                    value={kioskId}
                    onChange={(e) => setKioskId(e.target.value)}
                    placeholder="e.g. 6872a1b9f3d0e2c45a9b1234"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl py-3 pl-10 pr-4 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              </div>

              {/* Hardware Secret Field */}
              <div className="space-y-1.5">
                <label htmlFor="kioskSecret" className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Hardware Secret Token
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="kioskSecret"
                    type={showSecret ? 'text' : 'password'}
                    value={kioskSecret}
                    onChange={(e) => setKioskSecret(e.target.value)}
                    placeholder="Enter the hardware secret"
                    className="w-full bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 rounded-xl py-3 pl-10 pr-12 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    required
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecret((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                    tabIndex={-1}
                  >
                    {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:opacity-90 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Authenticating Device...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Activate Kiosk Terminal</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Security Footer */}
        <p className="text-center text-slate-400 text-xs mt-6 font-medium">
          🔒 This is a secure device registration screen. Do not share your credentials.
        </p>
      </div>
    </div>
  );
};

export default KioskSetupPage;
