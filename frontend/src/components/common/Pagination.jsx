import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

/**
 * Global Pagination Component with sleek Shadcn-style rounded Page selector
 */
const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 9,
  onPageChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (totalItems === 0) return null;

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="flex items-center justify-end gap-3 text-sm text-slate-600 select-none">
      {/* Showing X–Y of Z */}
      <span className="whitespace-nowrap text-xs text-slate-500 font-medium">
        Showing{' '}
        <span className="font-bold text-slate-800">
          {start}–{String(end).padStart(2, '0')}
        </span>{' '}
        of{' '}
        <span className="font-bold text-slate-800">{totalItems}</span>
      </span>

      {/* Prev Arrow */}
      <button
        type="button"
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
      >
        <ChevronLeft size={14} className="text-slate-600" />
      </button>

      {/* Custom Shadcn-style Page number dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 transition-colors shadow-2xs cursor-pointer"
        >
          <span>{currentPage}</span>
          <ChevronDown size={11} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div 
            className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 min-w-[60px] max-h-44 overflow-y-auto no-scrollbar bg-white rounded-xl shadow-xl border border-slate-100 z-50 p-1 animate-in fade-in-0 zoom-in-95 duration-150"
            style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12)' }}
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onPageChange(p);
                  setIsOpen(false);
                }}
                className={`w-full text-center py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                  p === currentPage 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Next Arrow */}
      <button
        type="button"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shadow-2xs"
      >
        <ChevronRight size={14} className="text-slate-600" />
      </button>
    </div>
  );
};

export default Pagination;
