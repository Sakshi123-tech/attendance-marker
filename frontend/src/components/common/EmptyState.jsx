import React from 'react';
import defaultEmptyImg from '../../assets/Empty state.png';

const EmptyState = ({ title, message, imageSrc = defaultEmptyImg }) => {
  return (
    <div className="flex flex-col items-center justify-center bg-white p-8 mx-auto w-full max-w-md">
      <img src={imageSrc} alt="Empty" className="w-32 h-32 object-contain mx-auto mb-6 opacity-75" />
      <p className="text-slate-900 font-bold text-lg">{title}</p>
      {message && <p className="text-sm text-slate-500 mt-2 text-center max-w-sm">{message}</p>}
    </div>
  );
};

export default EmptyState;
