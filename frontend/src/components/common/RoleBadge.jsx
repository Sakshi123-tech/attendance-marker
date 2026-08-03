import React from 'react';

const RoleBadge = ({ role }) => {
  const map = {
    SUPER_ADMIN: 'bg-purple-100 text-purple-700 border-purple-200',
    ADMIN: 'bg-rose-100 text-rose-700 border-rose-200',
    HR: 'bg-amber-100 text-amber-700 border-amber-200',
    EMPLOYEE: 'bg-blue-100 text-blue-700 border-blue-200',
  };
  
  if (!role) return null;

  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider border uppercase ${map[role] || 'bg-slate-100 text-slate-700'}`}>
      {role}
    </span>
  );
};

export default RoleBadge;
