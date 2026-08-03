import React, { useState, useEffect } from 'react';
import { Users, Wifi, WifiOff } from 'lucide-react';
import useSocket from '../../../hooks/useSocket';

const LiveActivity = () => {
  const [recentCheckIns, setRecentCheckIns] = useState([]);
  const { isConnected, socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleAttendanceMarked = (data) => {
      setRecentCheckIns(prev => {
        const updated = [
          {
            id: Date.now().toString(),
            name: data.employee,
            status: data.status,
            time: data.time
          },
          ...prev
        ];
        // Keep only the 10 most recent check-ins
        return updated.slice(0, 10);
      });
    };

    socket.on('attendance:marked', handleAttendanceMarked);

    return () => {
      socket.off('attendance:marked', handleAttendanceMarked);
    };
  }, [socket]);

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <Users className="text-indigo-500" />
          Live Check-ins
        </h2>
        
        {isConnected ? (
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs font-bold text-emerald-600 tracking-wider">LIVE</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 rounded-full border border-slate-200">
            <WifiOff size={12} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 tracking-wider">OFFLINE</span>
          </div>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {recentCheckIns.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center px-4">
            <Users size={48} className="opacity-20 mb-4" />
            <p className="font-medium text-slate-500">No recent check-ins.</p>
            <p className="text-sm mt-1">Check-ins will appear here in real-time as employees scan their faces.</p>
          </div>
        ) : (
          recentCheckIns.map((checkIn) => (
            <div 
              key={checkIn.id}
              className="p-4 rounded-2xl border border-slate-100 bg-slate-50 shadow-sm flex flex-col gap-3 animate-in slide-in-from-right-4 duration-300"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-lg border border-indigo-200">
                    {checkIn.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-slate-800 font-bold leading-tight">{checkIn.name}</h4>
                    <p className="text-xs text-slate-500 font-medium">{checkIn.time}</p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest uppercase border ${
                  checkIn.status === 'ON_TIME' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : 'bg-amber-50 text-amber-600 border-amber-200'
                }`}>
                  {checkIn.status === 'ON_TIME' ? 'On Time' : 'Late'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LiveActivity;
