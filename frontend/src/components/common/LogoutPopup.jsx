import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';

const LogoutPopup = ({ isOpen, onConfirm, onCancel }) => {
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
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-[9998] bg-slate-900/20 backdrop-blur-sm" onClick={onCancel} />

      {/* Modal */}
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 relative animate-in fade-in zoom-in-95 duration-200">

          {/* Close */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} strokeWidth={2.5} />
          </button>

          {/* Icon + Title */}
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
              <LogOut size={18} className="text-red-600" />
            </div>
            <h2 className="text-[16px] font-bold text-slate-900">Confirm Logout</h2>
          </div>

          {/* Message */}
          <p className="text-[13px] text-slate-600 mb-6 leading-relaxed">
            Are you sure you want to logout? You will be redirected to the login page.
          </p>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl transition-colors"
            >
              Yes, Logout
            </button>
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>

        </div>
      </div>
    </>,
    document.body
  );
};

export default LogoutPopup;
