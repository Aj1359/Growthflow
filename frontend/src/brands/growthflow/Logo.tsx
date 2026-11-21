import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showWordmark?: boolean;
}

export function GrowthFlowLogo({ className = '', size = 'md', showWordmark = true }: LogoProps) {
  const iconDimensions = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  }[size];

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Icon: stylized G with WhatsApp bubble and rising orange arrow */}
      <div className={`relative shrink-0 ${iconDimensions}`}>
        <img
          src="/growthflow-logo.png"
          alt="GrowthFlow Logo"
          className="w-full h-full object-contain filter drop-shadow-sm"
          onError={(e) => {
            // Fallback inline SVG if image file is loading
            e.currentTarget.style.display = 'none';
          }}
        />
        {/* Inline SVG Fallback matching uploaded logo */}
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Outer G arc in dark teal */}
          <path
            d="M50 10C27.9 10 10 27.9 10 50C10 72.1 27.9 90 50 90C67.6 90 82.5 78.6 87.7 63H60V50H95C95.5 52.5 96 55.2 96 58C96 80.1 78.1 98 56 98C30 98 8 76 8 50C8 24 30 2 56 2C68 2 78.9 6.5 87 14L77 24C71.3 18.5 63.8 15 55 15"
            fill="url(#gfTealGrad)"
          />
          {/* Inner green chat bubble */}
          <circle cx="45" cy="48" r="18" fill="#10B981" />
          <path d="M38 58L34 66L42 63" fill="#10B981" />
          {/* Inner phone glyph */}
          <path
            d="M41 42C40.5 42 40 42.5 40 43C40 47.5 43.5 51 48 51C48.5 51 49 50.5 49 50L48 48C47.8 47.6 47.3 47.4 47 47.6L45.5 48.2C44 47.5 43 46 42.5 44.5L43.2 43C43.4 42.7 43.2 42.2 42.8 42L41 42Z"
            fill="white"
          />
          {/* 3 Green Rising Chart Bars on Left */}
          <rect x="14" y="66" width="6" height="12" rx="1.5" fill="#0D9488" />
          <rect x="22" y="60" width="6" height="18" rx="1.5" fill="#0F766E" />
          <rect x="30" y="53" width="6" height="25" rx="1.5" fill="#0F766E" />
          {/* Sweeping Orange Upward Arrow */}
          <path
            d="M32 72C48 70 65 62 76 40L72 37L94 30L91 53L86 48C74 68 54 78 32 72Z"
            fill="url(#gfOrangeGrad)"
          />
          <defs>
            <linearGradient id="gfTealGrad" x1="10" y1="10" x2="90" y2="90" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0F766E" />
              <stop offset="1" stopColor="#064E3B" />
            </linearGradient>
            <linearGradient id="gfOrangeGrad" x1="30" y1="70" x2="95" y2="30" gradientUnits="userSpaceOnUse">
              <stop stopColor="#F59E0B" />
              <stop offset="1" stopColor="#EA580C" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Wordmark: "Growth" in dark teal + "Flow" in orange */}
      {showWordmark && (
        <div className="flex items-baseline tracking-tight font-black">
          <span className={`${textSizes} text-[#0D4A43] font-extrabold tracking-tight`}>
            Growth
          </span>
          <span className={`${textSizes} text-[#F59E0B] font-extrabold tracking-tight`}>
            Flow
          </span>
        </div>
      )}
    </div>
  );
}
