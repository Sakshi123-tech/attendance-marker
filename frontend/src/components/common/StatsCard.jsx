import React from 'react';

const StatsCard = ({
  title,
  value,
  icon: Icon,
  watermarkIcon: WatermarkIcon,
  colorClass,
  accentColor = '#3b82f6',
  bgGradient = 'bg-white',
  trend,
  loading = false
}) => {
  const DisplayWatermark = WatermarkIcon || Icon;

  return (
    <div
      className={`rounded-2xl p-5 md:p-6 min-h-[135px] flex items-center justify-between border border-slate-200/90 shadow-xs relative overflow-hidden transition-all duration-200 hover:shadow-md ${bgGradient}`}
      style={{
        borderLeftWidth: '4px',
        borderLeftStyle: 'solid',
        borderLeftColor: accentColor
      }}
    >
      {/* Background Watermark Icon Illustration */}
      {DisplayWatermark && (
        <div
          className="absolute -right-2 -bottom-2 pointer-events-none select-none"
          style={{ color: accentColor, opacity: 0.10 }}
        >
          <DisplayWatermark size={92} strokeWidth={1.5} />
        </div>
      )}

      {/* Card Content */}
      <div className="relative z-10 flex flex-col justify-between h-full py-0.5 w-full">
        <div>
          <p className="text-slate-500 text-xs font-semibold tracking-wide mb-1.5">{title}</p>

          {loading ? (
            <div className="h-9 w-20 bg-slate-200/70 animate-pulse rounded-lg my-1"></div>
          ) : (
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">{value}</h3>
          )}
        </div>

        {trend && !loading && (
          <div className="flex flex-wrap items-center gap-1.5 mt-2.5 text-xs font-medium">
            <span className={trend.colorClass || (trend.isPositive ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold')}>
              {trend.text || `${trend.isPositive ? '↑' : '↓'} ${trend.value}%`}
            </span>
            <span className="text-slate-400 font-normal text-[11px] truncate">
              {trend.label || 'No change from last month'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;
