import React from 'react';

interface VianLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  light?: boolean;
}

export const VianLogo: React.FC<VianLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  light = false,
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const textClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const primaryColor = light ? '#ffffff' : '#001A8C';
  const textColor = light ? 'text-white' : 'text-[#001A8C]';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {/* SVG Monogram replica matching the official Vian Capital brand asset */}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${iconSizes[size]} shrink-0`}
      >
        {/* Outer Circular arc with V overlapping */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke={primaryColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray="210 50"
          strokeDashoffset="10"
        />
        {/* Distinctive 'V' intersecting the circle */}
        <path
          d="M26 30 L50 78 L74 22"
          stroke={primaryColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={`font-black tracking-tight ${textColor} ${textClasses[size]}`}
            style={{ letterSpacing: '-0.02em' }}
          >
            VIAN
          </span>
          <span
            className={`font-semibold tracking-widest text-[9px] sm:text-[11px] uppercase ${
              light ? 'text-slate-300' : 'text-[#001A8C]'
            }`}
            style={{ letterSpacing: '0.22em' }}
          >
            CAPITAL
          </span>
        </div>
      )}
    </div>
  );
};
