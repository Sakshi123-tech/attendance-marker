import React from 'react';

const StatsCard = ({ title, value, icon: Icon, colorClass, trend, loading = false }) => {
  return (
    <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 flex items-center justify-between backdrop-blur-sm hover:bg-slate-800/80 transition-colors">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-slate-700 animate-pulse rounded"></div>
        ) : (
          <h3 className="text-3xl font-bold text-slate-100">{value}</h3>
        )}
        {trend && !loading && (
          <p className={`text-xs mt-2 font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}% from yesterday
          </p>
        )}
      </div>
      <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${colorClass}`}>
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

export default StatsCard;
