import React, { useState, useEffect } from 'react';
import { fetchMyHistory } from '../../../api/attendanceApi';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const AttendanceCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [attendanceData, setAttendanceData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const records = await fetchMyHistory();
        
        // Convert to a dictionary: { "YYYY-MM-DD": "STATUS" }
        const dataMap = {};
        records.forEach(r => {
          // Adjust timezone issues by getting local date string
          const dateStr = new Date(r.date).toLocaleDateString('en-CA'); // YYYY-MM-DD format
          dataMap[dateStr] = r.status;
        });
        
        // Let's add some mock holidays for demonstration
        dataMap['2026-08-15'] = 'HOLIDAY';
        dataMap['2026-10-02'] = 'HOLIDAY';

        setAttendanceData(dataMap);
      } catch (err) {
        console.error('Error fetching calendar data', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const changeMonth = (offset) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + offset);
      return newDate;
    });
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const getStatusColor = (status, dateObj) => {
    // Check if it's a weekend
    const day = dateObj.getDay();
    if (day === 0 || day === 6) {
      return 'bg-slate-100 border-slate-200 text-slate-400';
    }
    
    switch (status) {
      case 'ON_TIME': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'LATE': return 'bg-amber-50 border-amber-200 text-amber-700';
      case 'ABSENT': return 'bg-red-50 border-red-200 text-red-700';
      case 'HOLIDAY': return 'bg-blue-50 border-blue-200 text-blue-700';
      default: return 'bg-white border-slate-100 text-slate-700 hover:border-indigo-200';
    }
  };

  const getStatusText = (status, dateObj) => {
    const day = dateObj.getDay();
    if (day === 0 || day === 6) return 'Weekend';
    switch (status) {
      case 'ON_TIME': return 'Present';
      case 'LATE': return 'Late';
      case 'ABSENT': return 'Absent';
      case 'HOLIDAY': return 'Holiday';
      default: return '';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Attendance Calendar</h2>
          <p className="text-sm text-slate-500 mt-1">Visual overview of your monthly attendance patterns.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Calendar Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <button 
            onClick={() => changeMonth(-1)}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <CalendarIcon size={20} className="text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-800 uppercase tracking-wider">
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </h3>
          </div>
          <button 
            onClick={() => changeMonth(1)}
            className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-center gap-6 p-4 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-400"></div>Present</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-amber-400"></div>Late</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-red-400"></div>Absent</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-400"></div>Holiday</div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-200"></div>Weekend</div>
        </div>

        {/* Grid */}
        <div className="p-6">
          <div className="grid grid-cols-7 gap-2 mb-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
            <div>Sun</div><div>Mon</div><div>Tue</div><div>Wed</div><div>Thu</div><div>Fri</div><div>Sat</div>
          </div>
          
          <div className="grid grid-cols-7 gap-2">
            {/* Empty slots for first day offset */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="h-24 rounded-xl border border-transparent"></div>
            ))}
            
            {/* Actual days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
              // Format correctly to match our dictionary key YYYY-MM-DD
              const dateStr = dateObj.toLocaleDateString('en-CA');
              const status = attendanceData[dateStr];
              const colorClass = getStatusColor(status, dateObj);
              const label = getStatusText(status, dateObj);
              const isToday = new Date().toDateString() === dateObj.toDateString();

              return (
                <div 
                  key={day} 
                  className={`h-24 rounded-xl border p-2 flex flex-col justify-between transition-all ${colorClass} ${isToday ? 'ring-2 ring-indigo-500 ring-offset-2' : ''}`}
                >
                  <span className={`text-sm font-bold ${isToday ? 'text-indigo-600' : ''}`}>{day}</span>
                  {label && (
                    <span className="text-[10px] font-bold uppercase tracking-wider opacity-80 truncate">
                      {label}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
