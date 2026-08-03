import React from 'react';

const LoadingSpinner = ({ text = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-slate-400 font-medium">{text}</p>
    </div>
  );
};

export default LoadingSpinner;
