import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmPopup = ({ 
  isOpen, 
  title, 
  message, 
  confirmText = 'Confirm', 
  cancelText = 'Cancel', 
  onConfirm, 
  onCancel,
  type = 'danger' // 'danger' | 'warning' | 'info'
}) => {
  if (!isOpen) return null;

  const getColors = () => {
    switch (type) {
      case 'danger':
        return {
          iconBg: 'bg-red-500/10',
          iconText: 'text-red-500',
          btnBg: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
        };
      case 'warning':
        return {
          iconBg: 'bg-amber-500/10',
          iconText: 'text-amber-500',
          btnBg: 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-500',
        };
      default:
        return {
          iconBg: 'bg-indigo-500/10',
          iconText: 'text-indigo-500',
          btnBg: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500',
        };
    }
  };

  const colors = getColors();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${colors.iconBg} ${colors.iconText}`}>
              <AlertTriangle size={24} />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{message}</p>
            </div>
            <button 
              onClick={onCancel}
              className="shrink-0 p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white ${colors.btnBg}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmPopup;
