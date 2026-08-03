import React from 'react';
import { RefreshCcw } from 'lucide-react';
import errorImg from '../../assets/error 1.png';

const ErrorState = ({ title = "An unexpected error occurred while loading this page.", message = "Please try again.", onRetry }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white rounded-lg p-12 mx-auto w-full h-full min-h-[300px]">
      <div className="mb-6 flex justify-center w-full">
        <img src={errorImg} alt="Error" className="w-32 h-32 object-contain mx-auto" />
      </div>
      <p className="text-slate-800 font-medium text-base text-center max-w-sm mb-1">{title}</p>
      <p className="text-sm text-slate-500 text-center mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-colors shadow-sm"
        >
          <RefreshCcw size={16} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
