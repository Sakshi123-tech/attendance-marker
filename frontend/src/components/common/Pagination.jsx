import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Global Pagination Component
 * Matches reference image: "Showing 1–09 of 78 < 1 ∨ >"
 *
 * @param {number} currentPage - Current active page (1-indexed)
 * @param {number} totalItems  - Total number of items
 * @param {number} pageSize    - Items per page
 * @param {function} onPageChange - Callback with new page number
 * @param {number[]} pageSizeOptions - Optional array of page size choices
 * @param {function} onPageSizeChange - Callback when page size changes
 */
const Pagination = ({
  currentPage = 1,
  totalItems = 0,
  pageSize = 9,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const start = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

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
      <span className="whitespace-nowrap">
        Showing{' '}
        <span className="font-semibold text-slate-800">
          {start}–{String(end).padStart(2, '0')}
        </span>{' '}
        of{' '}
        <span className="font-semibold text-slate-800">{totalItems}</span>
      </span>

      {/* Prev Arrow */}
      <button
        onClick={handlePrev}
        disabled={currentPage === 1}
        className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={14} />
      </button>

      {/* Page number dropdown */}
      <div className="relative">
        <select
          value={currentPage}
          onChange={(e) => onPageChange(Number(e.target.value))}
          className="appearance-none pl-2 pr-6 py-1 text-sm font-semibold border border-slate-200 rounded bg-white hover:bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
        >
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
        <ChevronRight
          size={12}
          className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none"
        />
      </div>

      {/* Next Arrow */}
      <button
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
};

export default Pagination;
