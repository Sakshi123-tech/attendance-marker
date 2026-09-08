import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

/**
 * Shadcn-Style Custom DatePicker Component
 * Renders a clean floating calendar popover with smooth month/year navigation.
 *
 * Props:
 *   value       – ISO date string (e.g. "2026-09-08") or ""
 *   onChange    – callback with formatted date string "YYYY-MM-DD" or ""
 *   placeholder – trigger placeholder text
 *   className   – optional styling class for the trigger
 */
const DatePicker = ({
  value = '',
  onChange,
  placeholder = 'Pick a date',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse initial selected date or default to today
  const selectedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialDate = selectedDate || new Date();

  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());

  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const formatDateString = (year, month, day) => {
    const mm = String(month + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    return `${year}-${mm}-${dd}`;
  };

  const handleSelectDay = (day) => {
    const formatted = formatDateString(viewYear, viewMonth, day);
    onChange(formatted);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange('');
    setIsOpen(false);
  };

  const handleToday = () => {
    const today = new Date();
    const formatted = formatDateString(today.getFullYear(), today.getMonth(), today.getDate());
    onChange(formatted);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setIsOpen(false);
  };

  // Generate day cells for calendar grid
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  const today = new Date();
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDay = isCurrentMonth ? today.getDate() : null;

  const isSelectedMonth = selectedDate && selectedDate.getFullYear() === viewYear && selectedDate.getMonth() === viewMonth;
  const selectedDay = isSelectedMonth ? selectedDate.getDate() : null;

  const displayLabel = selectedDate
    ? selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : placeholder;

  return (
    <div className={`relative inline-block ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between gap-2.5 px-3.5 py-2.5 bg-white border ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' : 'border-slate-200 hover:border-slate-300 shadow-2xs'
        } rounded-xl text-sm font-medium text-slate-700 transition-all duration-150 cursor-pointer select-none`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <CalendarIcon size={16} className="text-slate-400 shrink-0" />
          <span className={`truncate ${selectedDate ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
            {displayLabel}
          </span>
        </div>
        {value && (
          <span
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 transition-colors"
          >
            <X size={13} />
          </span>
        )}
      </button>

      {/* Floating Popover Calendar Card */}
      {isOpen && (
        <div
          className="absolute left-0 sm:left-auto sm:right-0 top-full mt-2 bg-white rounded-2xl border border-slate-100 p-4 shadow-2xl z-50 min-w-[280px] animate-in fade-in-0 zoom-in-95 duration-150"
          style={{ boxShadow: '0 16px 40px -10px rgba(0, 0, 0, 0.15), 0 4px 14px -2px rgba(0, 0, 0, 0.05)' }}
        >
          {/* Header Navigation */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
            <span className="font-bold text-sm text-slate-800 tracking-tight">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Names Header */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1.5">
            {DAYS_OF_WEEK.map((d) => (
              <span key={d} className="text-[11px] font-bold text-slate-400 uppercase tracking-wider py-0.5">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center text-sm">
            {/* Previous month padding days */}
            {Array.from({ length: firstDayIndex }).map((_, i) => {
              const prevDay = daysInPrevMonth - firstDayIndex + i + 1;
              return (
                <span key={`prev-${i}`} className="w-8 h-8 flex items-center justify-center text-xs text-slate-300 font-normal">
                  {prevDay}
                </span>
              );
            })}

            {/* Current month days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const isSelected = selectedDay === day;
              const isToday = todayDay === day;

              return (
                <button
                  key={`curr-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`w-8 h-8 flex items-center justify-center text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-600 text-white font-bold shadow-xs'
                      : isToday
                      ? 'border border-blue-500/40 text-blue-600 font-bold hover:bg-blue-50'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Footer Quick Actions */}
          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-100 text-xs font-semibold">
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleToday}
              className="text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
