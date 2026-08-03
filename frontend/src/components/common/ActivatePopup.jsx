import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, X } from 'lucide-react';

const ActivatePopup = ({ isOpen, userName = '', onConfirm, onCancel }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-xl w-full max-w-[420px] p-6 relative animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onCancel}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 transition-colors"
        >
          <X size={20} strokeWidth={2.5} />
        </button>

        <div className="flex items-center gap-3 mb-3 mt-1">
          <AlertTriangle size={28} className="text-amber-500 fill-amber-500 stroke-white" />
          <h2 className="text-[22px] font-bold text-slate-900">Confirm Activate</h2>
        </div>

        <p className="text-slate-600 text-[15px] mb-8 leading-relaxed">
          Do you want to activate <span className="font-bold text-slate-900">{userName}'s</span> account and restore their access?
        </p>

        <div className="flex items-center gap-3">
          <button 
            onClick={onConfirm} 
            className="flex-1 py-2.5 bg-[#16a34a] hover:bg-green-700 text-white text-[15px] font-semibold rounded-lg transition-colors shadow-sm"
          >
            Confirm
          </button>
          <button 
            onClick={onCancel} 
            className="flex-1 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-[15px] font-semibold border border-slate-300 rounded-lg transition-colors shadow-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ActivatePopup;
