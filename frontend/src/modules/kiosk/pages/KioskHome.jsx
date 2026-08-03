import React, { useState, useEffect } from 'react';
import CameraView from '../components/CameraView';
import RecognitionResult from '../components/RecognitionResult';
import { verifyDevice, checkIn } from '../../../api/kioskApi';
import {
  AlertTriangle, RefreshCw, ShieldAlert, UserCheck, LogOut,
  Wifi, WifiOff, Camera, Lock, Clock as ClockIcon
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';

/* ── Office hours config ── */
const OFFICE_OPEN_HOUR = 9;   // 12 AM
const OFFICE_CLOSE_HOUR = 18;  // 12 AM (next day)

const isOfficeOpen = (d) => { const h = d.getHours(); return h >= OFFICE_OPEN_HOUR && h < OFFICE_CLOSE_HOUR; };

/* ── Live clock hook ── */
const useClock = () => {
  const [now, setNow] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);
  return now;
};

/* ════════════════════════════════════
   TOP NAVIGATION BAR
════════════════════════════════════ */
const TopBar = ({ kioskInfo, isOnline, now, onLogout }) => {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-slate-100 bg-white shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm">
          <UserCheck size={20} className="text-white" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 leading-none">Attendance AI</p>
          <p className="text-xs text-slate-400 mt-0.5">{kioskInfo?.location || 'Main'} Reception Terminal</p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-3">
        {isOnline ? (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            ONLINE
          </span>
        ) : (
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 text-red-600 text-xs font-bold tracking-wide">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            OFFLINE
          </span>
        )}
        <span className="text-slate-300">|</span>
        {isOnline ? <Wifi size={16} className="text-slate-400" /> : <WifiOff size={16} className="text-red-400" />}
      </div>

      {/* Clock + Logout */}
      <div className="flex items-center gap-5">
        <div className="text-right">
          <p className="text-sm font-bold text-slate-800 tabular-nums">
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
          <p className="text-xs text-slate-400">
            {now.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 rounded-xl text-xs font-semibold transition-all active:scale-95"
        >
          <LogOut size={14} />
          Logout
        </button>
      </div>
    </div>
  );
};

/* ════════════════════════════════════
   FOOTER STATUS BAR
════════════════════════════════════ */
const FooterBar = ({ isOnline, isCameraReady }) => (
  <div className="flex items-center justify-between px-8 py-3 border-t border-slate-100 bg-slate-50 shrink-0">
    <div className="flex items-center gap-6">
      <span className="flex items-center gap-1.5 text-xs text-slate-500">
        <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500' : 'bg-red-500'}`} />
        {isOnline ? 'Device Online' : 'Device Offline'}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-slate-500">
        <Camera size={12} className={isCameraReady ? 'text-emerald-500' : 'text-slate-400'} />
        {isCameraReady ? 'Camera Active' : 'Camera Standby'}
      </span>
    </div>
    <span className="text-xs text-slate-400 font-mono">v1.0.0</span>
  </div>
);

/* ════════════════════════════════════
   ACTIVE / OPEN STATE
════════════════════════════════════ */
const ActiveState = ({ now, onStart }) => (
  <div className="flex-1 flex flex-col items-center justify-center px-12 py-10 gap-8 bg-white">
    {/* Large Clock */}
    <div className="text-center">
      <p className="text-7xl font-black text-slate-800 tabular-nums tracking-tighter leading-none">
        {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </p>
      <p className="text-slate-500 font-medium mt-2 text-base">
        {now.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>

    {/* Avatar + Title */}
    <div className="flex flex-col items-center gap-4">
      <div className="w-36 h-36 rounded-full bg-indigo-50 border-[6px] border-white shadow-xl flex items-center justify-center">
        <UserCheck size={64} className="text-indigo-600" />
      </div>
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-800">Tap to Check In</h2>
        <p className="text-slate-500 mt-1">Mark your attendance using Face Recognition</p>
      </div>
    </div>

    {/* CTA Button */}
    <button
      onClick={onStart}
      className="flex items-center gap-3 px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-indigo-600/30 transition-all active:scale-95"
    >
      <Camera size={22} />
      Start Face Scan
    </button>
  </div>
);

/* ════════════════════════════════════
   CLOSED STATE (outside office hours)
════════════════════════════════════ */
const ClosedState = ({ now }) => (
  <div className="flex-1 flex flex-col items-center justify-center gap-6 px-8 bg-white animate-in fade-in duration-500">
    {/* Lock icon */}
    <div className="relative flex items-center justify-center w-48 h-48 shrink-0">
      <div className="absolute inset-0 bg-red-50 rounded-full" />
      <div className="absolute w-32 h-32 bg-red-100 rounded-full" />
      <div className="relative w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center z-10">
        <Lock size={44} className="text-red-500" />
      </div>
    </div>

    {/* Title */}
    <div className="text-center">
      <h2 className="text-4xl font-black text-slate-800">Attendance Closed</h2>
      <p className="text-slate-500 mt-2">Attendance is available only during office hours.</p>
    </div>

    {/* Info cards — 2 columns */}
    <div className="flex gap-4 w-full max-w-lg">
      <div className="flex-1 bg-white border border-red-100 rounded-2xl px-5 py-4 text-center shadow-sm">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Office Hours</p>
        <p className="text-xl font-black text-red-500 whitespace-nowrap">09:00 AM – 06:00 PM</p>
      </div>
      <div className="flex-1 bg-white border border-slate-100 rounded-2xl px-5 py-4 text-center shadow-sm">
        <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-2">Current Time</p>
        <p className="text-xl font-black text-red-400 tabular-nums whitespace-nowrap">
          {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>

    {/* Notice */}
    <div className="flex items-start gap-3 w-full max-w-lg bg-red-50 border border-red-100 rounded-xl px-5 py-4 text-sm text-red-600">
      <ClockIcon size={16} className="shrink-0 mt-0.5" />
      <span>The kiosk is currently unavailable for attendance. Please return during working hours.</span>
    </div>
  </div>
);

/* ════════════════════════════════════
   MAIN COMPONENT
════════════════════════════════════ */
const KioskHome = () => {
  const { logout } = useAuth();
  const now = useClock();
  const [deviceStatus, setDeviceStatus] = useState('VERIFYING');
  const [kioskInfo, setKioskInfo] = useState(null);
  const [appState, setAppState] = useState('IDLE');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [result, setResult] = useState(null);

  /* Online/offline listener + device verify */
  useEffect(() => {
    const on = () => setIsOnline(true);
    const off = () => setIsOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    (async () => {
      try {
        const res = await verifyDevice();
        setKioskInfo(res.success ? res : null);
        setDeviceStatus(res.success ? 'AUTHORIZED' : 'UNAUTHORIZED');
      } catch { setDeviceStatus('UNAUTHORIZED'); }
    })();
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);

  useEffect(() => {
    if (!isOnline) setAppState('OFFLINE');
    else if (appState === 'OFFLINE') setAppState('IDLE');
  }, [isOnline]);

  useEffect(() => {
    if (appState === 'PREPARING' && isCameraReady) setAppState('DETECTING');
  }, [appState, isCameraReady]);

  const handleFaceDetected = React.useCallback(async (imageSrc) => {
    if (appState !== 'DETECTING') return;
    setAppState('MATCHING');
    try {
      const res = await checkIn(imageSrc);
      setResult({ ...res, snapshot: imageSrc });
      setAppState('SUCCESS');
    } catch (err) {
      setResult({ error: err.message, snapshot: imageSrc });
      setAppState('ERROR');
    }
    setTimeout(() => { setResult(null); setAppState('IDLE'); setIsCameraReady(false); }, 5000);
  }, [appState]);

  /* ── Loading screen ── */
  if (deviceStatus === 'VERIFYING') return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
      <p className="text-slate-500 font-semibold">Verifying Device...</p>
    </div>
  );

  /* ── Unauthorized screen ── */
  if (deviceStatus === 'UNAUTHORIZED') return (
    <div className="fixed inset-0 bg-red-50 flex flex-col items-center justify-center gap-6 px-8">
      <div className="w-24 h-24 rounded-full bg-white shadow-lg flex items-center justify-center">
        <ShieldAlert size={44} className="text-red-500" />
      </div>
      <div className="text-center">
        <h1 className="text-3xl font-black text-red-800 mb-2">Unauthorized Device</h1>
        <p className="text-red-600 max-w-md text-sm">This device is not registered. Please contact your administrator.</p>
      </div>
    </div>
  );

  const officeOpen = isOfficeOpen(now);
  const isCameraActive = !['IDLE', 'OFFLINE'].includes(appState);

  return (
    <div className="fixed inset-0 bg-[#eef1f9] flex flex-col font-sans overflow-hidden">

      {/* Soft background blobs */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-200/30 rounded-full blur-[140px] -translate-x-1/3 -translate-y-1/3 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-200/30 rounded-full blur-[140px] translate-x-1/3 translate-y-1/3 pointer-events-none" />

      {/* Main White Sheet — fills most of the viewport */}
      <div className="relative z-10 flex flex-col flex-1 mx-8 my-6 bg-white rounded-3xl shadow-xl overflow-hidden">

        {/* Top Nav */}
        <TopBar
          kioskInfo={kioskInfo}
          isOnline={isOnline}
          isCameraReady={isCameraReady}
          now={now}
          onLogout={logout}
        />

        {/* Body */}
        {appState === 'OFFLINE' ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 text-center">
            <AlertTriangle size={72} className="text-red-400 animate-pulse" />
            <h2 className="text-3xl font-black text-slate-700">Connection Lost</h2>
            <p className="text-slate-500 max-w-md">The kiosk has lost connection to the server. Waiting to reconnect...</p>
          </div>
        ) : isCameraActive ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6 px-12 bg-white">
            <CameraView state={appState} setCameraReady={setIsCameraReady} onDetect={handleFaceDetected} />
            {appState === 'PREPARING' && (
              <p className="text-indigo-600 font-bold flex items-center gap-2 animate-pulse">
                <RefreshCw size={16} className="animate-spin" /> Opening Camera...
              </p>
            )}
            {appState === 'DETECTING' && (
              <p className="text-slate-600 font-bold text-lg animate-pulse">Please stand in front of the camera</p>
            )}
          </div>
        ) : !officeOpen ? (
          <ClosedState now={now} />
        ) : (
          <ActiveState now={now} onStart={() => setAppState('PREPARING')} />
        )}

        {/* Footer */}
        <FooterBar isOnline={isOnline} isCameraReady={isCameraReady} />
      </div>

      {/* Result Overlays */}
      {(appState === 'SUCCESS' || appState === 'ERROR') && (
        <RecognitionResult
          status={result?.status || 'ERROR'}
          employee={result?.employee}
          time={result?.time}
          errorMsg={result?.error}
          snapshot={result?.snapshot}
        />
      )}
    </div>
  );
};

export default KioskHome;
