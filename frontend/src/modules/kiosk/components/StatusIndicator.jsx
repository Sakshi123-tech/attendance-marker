import React from 'react';
import { Wifi, WifiOff, Camera, CameraOff, Server, ServerCrash } from 'lucide-react';

const StatusIndicator = ({ isOnline, isCameraReady, isBackendOnline }) => {
  return (
    <div className="flex items-center gap-4 bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-6 py-3 shadow-2xl">
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Wifi size={18} className="text-emerald-400" />
        ) : (
          <WifiOff size={18} className="text-red-400 animate-pulse" />
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Net</span>
      </div>
      <div className="w-px h-4 bg-slate-700/50"></div>
      
      <div className="flex items-center gap-2">
        {isBackendOnline ? (
          <Server size={18} className="text-emerald-400" />
        ) : (
          <ServerCrash size={18} className="text-amber-400 animate-pulse" />
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">API</span>
      </div>
      <div className="w-px h-4 bg-slate-700/50"></div>
      
      <div className="flex items-center gap-2">
        {isCameraReady ? (
          <Camera size={18} className="text-emerald-400" />
        ) : (
          <CameraOff size={18} className="text-red-400 animate-pulse" />
        )}
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Cam</span>
      </div>
    </div>
  );
};

export default StatusIndicator;
