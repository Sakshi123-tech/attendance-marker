import React from 'react';

const ShieldBannerIllustration = () => (
  <svg 
    viewBox="0 0 420 220" 
    className="w-full h-full object-contain pointer-events-none select-none"
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      {/* Background Soft Halo */}
      <radialGradient id="haloGrad" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.35" />
        <stop offset="60%" stopColor="#818cf8" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
      </radialGradient>

      {/* Shield Gradient */}
      <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#3b82f6" />
        <stop offset="50%" stopColor="#2563eb" />
        <stop offset="100%" stopColor="#1d4ed8" />
      </linearGradient>

      {/* Shield Outer Glow */}
      <linearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#93c5fd" />
        <stop offset="100%" stopColor="#3b82f6" />
      </linearGradient>

      {/* Server Blocks Gradient */}
      <linearGradient id="serverGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c7d2fe" />
        <stop offset="100%" stopColor="#a5b4fc" />
      </linearGradient>

      <linearGradient id="serverGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#e0e7ff" />
        <stop offset="100%" stopColor="#c7d2fe" />
      </linearGradient>

      {/* Leaves Gradient */}
      <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#34d399" />
        <stop offset="100%" stopColor="#059669" />
      </linearGradient>

      {/* Orbit Gradient */}
      <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.1" />
        <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.8" />
        <stop offset="100%" stopColor="#93c5fd" stopOpacity="0.2" />
      </linearGradient>

      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>
      
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="8" stdDeviation="12" floodColor="#1e3a8a" floodOpacity="0.25" />
      </filter>
    </defs>

    {/* Background Soft Glow */}
    <ellipse cx="230" cy="110" rx="170" ry="95" fill="url(#haloGrad)" />

    {/* Elliptical Orbit Ring behind shield */}
    <ellipse 
      cx="210" 
      cy="115" 
      rx="120" 
      ry="42" 
      stroke="url(#orbitGrad)" 
      strokeWidth="3.5" 
      fill="none" 
      transform="rotate(-14 210 115)"
      strokeDasharray="450"
      strokeDashoffset="20"
    />

    {/* Server Stack / Data Storage Tower */}
    <g transform="translate(310, 65)">
      {/* Server Unit 1 (Top) */}
      <rect x="0" y="0" width="60" height="24" rx="5" fill="url(#serverGrad2)" filter="url(#shadow)" />
      <line x1="8" y1="12" x2="35" y2="12" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="48" cy="12" r="2.5" fill="#3b82f6" />
      <circle cx="53" cy="12" r="2.5" fill="#10b981" />

      {/* Server Unit 2 (Middle) */}
      <rect x="0" y="28" width="60" height="24" rx="5" fill="url(#serverGrad2)" filter="url(#shadow)" />
      <line x1="8" y1="40" x2="35" y2="40" stroke="#818cf8" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="48" cy="40" r="2.5" fill="#3b82f6" />
      <circle cx="53" cy="40" r="2.5" fill="#10b981" />

      {/* Server Unit 3 (Bottom) */}
      <rect x="0" y="56" width="60" height="24" rx="5" fill="url(#serverGrad1)" filter="url(#shadow)" />
      <line x1="8" y1="68" x2="35" y2="68" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="48" cy="68" r="2.5" fill="#3b82f6" />
      <circle cx="53" cy="68" r="2.5" fill="#10b981" />

      {/* Base Server Unit */}
      <rect x="-5" y="84" width="70" height="20" rx="4" fill="#a5b4fc" />
    </g>

    {/* Decorative Little Leaves / Plant at Base */}
    <g transform="translate(350, 130)">
      <path d="M12 40 C12 25 35 15 40 0 C42 18 30 35 15 42 Z" fill="url(#leafGrad)" />
      <path d="M10 42 C10 30 -5 20 -10 5 C-12 22 -2 38 10 44 Z" fill="url(#leafGrad)" opacity="0.8" />
      <path d="M14 42 C22 28 32 30 45 22 C38 35 26 42 14 44 Z" fill="url(#leafGrad)" opacity="0.9" />
    </g>

    {/* Small Star / Sparkle Decorations */}
    <g fill="#93c5fd">
      <path d="M110 50 Q115 50 115 45 Q115 50 120 50 Q115 50 115 55 Q115 50 110 50 Z" />
      <path d="M370 40 Q374 40 374 36 Q374 40 378 40 Q374 40 374 44 Q374 40 370 40 Z" />
      <circle cx="125" cy="155" r="3" fill="#60a5fa" opacity="0.6" />
      <circle cx="340" cy="45" r="2" fill="#818cf8" opacity="0.8" />
    </g>

    {/* Central 3D Shield */}
    <g transform="translate(160, 25)" filter="url(#shadow)">
      {/* Shield Outer Soft Border/Backing */}
      <path 
        d="M65 8 C105 8 125 22 125 72 C125 125 65 158 65 158 C65 158 5 125 5 72 C5 22 25 8 65 8 Z" 
        fill="#ffffff" 
        opacity="0.85"
      />
      {/* Shield Main Body */}
      <path 
        d="M65 12 C100 12 118 25 118 70 C118 118 65 148 65 148 C65 148 12 118 12 70 C12 25 30 12 65 12 Z" 
        fill="url(#shieldGrad)" 
      />
      
      {/* Shield Inner Highlight / Glass Reflection */}
      <path 
        d="M65 14 C96 14 112 26 112 68 C112 85 100 105 85 120 C75 100 70 65 65 14 Z" 
        fill="#ffffff" 
        opacity="0.18"
      />

      {/* User Avatar Silhouette inside Shield */}
      {/* Head */}
      <circle cx="65" cy="62" r="16" fill="#ffffff" />
      {/* Body / Shoulders */}
      <path 
        d="M40 104 C40 88 51 83 65 83 C79 83 90 88 90 104 C90 108 85 114 65 118 C45 114 40 108 40 104 Z" 
        fill="#ffffff" 
      />
    </g>

    {/* Foreground Orbit arc overlapping shield slightly */}
    <path 
      d="M110 135 C145 155 240 155 295 125" 
      stroke="url(#orbitGrad)" 
      strokeWidth="4" 
      strokeLinecap="round"
      fill="none" 
      transform="rotate(-8 210 130)"
    />
  </svg>
);

const DashboardWelcomeBanner = ({ 
  badge = 'System Control Centre',
  title = 'Welcome back!',
  subtitle,
  children
}) => {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#eef2ff] via-[#f8faff] to-[#e0f2fe] border border-slate-200/90 p-7 md:p-8 shadow-xs">
      {/* Right Side Illustration Container */}
      <div className="absolute right-0 top-0 bottom-0 w-64 md:w-80 lg:w-[440px] pointer-events-none flex items-center justify-end pr-2 md:pr-6 overflow-hidden">
        <div className="w-full h-full max-h-[190px]">
          <ShieldBannerIllustration />
        </div>
      </div>

      {/* Banner Text Content */}
      <div className="relative z-10 max-w-2xl space-y-2.5">
        <span className="inline-flex items-center px-3 py-1 rounded-md text-[11px] font-bold bg-indigo-100 text-indigo-700 border border-indigo-200 uppercase tracking-wider shadow-2xs">
          {badge}
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-sm text-slate-500 leading-relaxed font-normal">
            {subtitle}
          </p>
        )}
        {children}
      </div>
    </div>
  );
};

export default DashboardWelcomeBanner;
