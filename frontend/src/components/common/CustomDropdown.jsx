import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Reusable custom dropdown — same as used in SuperAdminCreateAdmin.
 * Props:
 *   value       – currently selected value (string)
 *   options     – array of strings
 *   onChange    – (value: string) => void
 *   placeholder – placeholder text when nothing is selected
 */
const CustomDropdown = ({ value, options, onChange, placeholder }) => {
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

  return (
    <div className="relative" ref={dropdownRef}>
      <div
        className={`w-full px-4 py-3 bg-slate-50 border ${isOpen ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200'
          } rounded-lg text-sm text-slate-800 cursor-pointer flex justify-between items-center transition-all`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={value ? 'text-slate-800 font-medium' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <ChevronDown
          size={16}
          className={`text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </div>

      {isOpen && (
        <div className="absolute left-0 top-full mt-2 w-full bg-white rounded-xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] border border-slate-100 z-[99999] p-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onChange(opt);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${value === opt
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-transparent text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
