import React from 'react';
import GlobalInput from './GlobalInput';

const FormInput = ({ label, name, type = 'text', value, onChange, required, disabled, placeholder, helpText }) => {
  return (
    <div className="space-y-1.5 w-full">
      {label && <label className="text-sm font-semibold text-slate-700">{label}</label>}
      <GlobalInput
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed shadow-sm"
        placeholder={placeholder}
      />
      {helpText && <p className="text-xs text-slate-500">{helpText}</p>}
    </div>
  );
};

export default FormInput;
