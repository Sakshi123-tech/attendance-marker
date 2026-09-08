import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Modern Shadcn-Style Custom Dropdown Component
 * Features sleek rounded floating card menu, smooth transitions, and active indicators.
 *
 * Props:
 *   value         – currently selected value (string or object value)
 *   options       – array of strings (e.g. ['Active', 'Deactive']) or objects (e.g. [{ value: 'ALL', label: 'All Status' }])
 *   onChange      – (val: string) => void
 *   placeholder   – text when no option is selected
 *   className     – trigger container custom classes
 *   menuClassName – dropdown menu custom classes
 *   icon          – optional leading Icon component
 */
const CustomDropdown = ({ 
  value, 
  options = [], 
  onChange, 
  placeholder = 'Select...', 
  className = '',
  menuClassName = '',
  icon: Icon
}) => {
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

  // Normalize options into { value, label } format
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return { value: opt.value, label: opt.label || opt.name || opt.value };
    }
    return { value: opt, label: opt };
  });

  const selectedOption = normalizedOptions.find((opt) => String(opt.value) === String(value));
  const displayText = selectedOption ? selectedOption.label : (value || placeholder);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full px-4 py-2.5 bg-white border ${
          isOpen ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' : 'border-slate-200 hover:border-slate-300 shadow-2xs'
        } rounded-xl text-sm font-medium text-slate-700 flex items-center justify-between gap-3 transition-all duration-150 cursor-pointer select-none text-left`}
      >
        <div className="flex items-center gap-2.5 truncate">
          {Icon && <Icon size={16} className="text-slate-400 shrink-0" />}
          <span className={`truncate ${selectedOption || value ? 'text-slate-800 font-semibold' : 'text-slate-400'}`}>
            {displayText}
          </span>
        </div>
        <ChevronDown
          size={15}
          className={`text-slate-400 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
        />
      </button>

      {/* Floating Dropdown Menu Card */}
      {isOpen && (
        <div 
          className={`absolute left-0 top-full mt-1.5 min-w-full w-max bg-white rounded-2xl shadow-xl border border-slate-100 z-50 p-1.5 animate-in fade-in-0 zoom-in-95 duration-150 ${menuClassName}`}
          style={{ boxShadow: '0 12px 35px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.05)' }}
        >
          <div className="flex flex-col gap-0.5 max-h-60 overflow-y-auto no-scrollbar">
            {normalizedOptions.map((opt) => {
              const isSelected = String(value) === String(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    onChange(opt.value);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/90 text-blue-600 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{opt.label}</span>
                  {isSelected && <Check size={15} className="text-blue-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
