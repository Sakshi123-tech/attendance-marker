import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ children, type = 'button', onClick, disabled, loading, variant = 'primary', className = '', icon: Icon }) => {
  const baseClasses = "px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900";
  
  const variants = {
    primary: "bg-indigo-500 hover:bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 focus:ring-indigo-500 disabled:opacity-50",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 focus:ring-slate-500 disabled:opacity-50",
    danger: "bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20 focus:ring-red-500 disabled:opacity-50",
    ghost: "bg-transparent hover:bg-slate-800 text-slate-300 hover:text-white focus:ring-slate-500 disabled:opacity-50"
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
    >
      {loading && <Loader2 className="animate-spin" size={16} />}
      {!loading && Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

export default Button;
