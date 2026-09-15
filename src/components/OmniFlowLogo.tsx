import React from 'react';

interface OmniFlowLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  themePreset?: string;
}

export const OmniFlowLogo: React.FC<OmniFlowLogoProps> = ({
  className = '',
  size = 40,
  showText = false,
  themePreset = 'dark'
}) => {
  // Determine dynamic color palette based on themePreset
  let primaryColor = '#00f2fe';
  let secondaryColor = '#e056fd';
  let accentColor = '#4facfe';
  let bgGradient = ['#1a1d2d', '#0f111a', '#08090f'];
  let borderColor = '#3d4461';

  if (themePreset === 'oled_black' || themePreset === 'dark') {
    primaryColor = '#00f2fe';
    secondaryColor = '#e056fd';
    accentColor = '#10b981';
    bgGradient = ['#0d1117', '#030712', '#000000'];
    borderColor = '#30363d';
  } else if (themePreset === 'midnight_navy') {
    primaryColor = '#38bdf8';
    secondaryColor = '#818cf8';
    accentColor = '#c084fc';
    bgGradient = ['#0f172a', '#090d16', '#020617'];
    borderColor = '#1e293b';
  } else if (themePreset === 'cyber_neon') {
    primaryColor = '#22c55e';
    secondaryColor = '#a855f7';
    accentColor = '#06b6d4';
    bgGradient = ['#0f172a', '#020617', '#000000'];
    borderColor = '#22c55e';
  } else if (themePreset === 'light' || themePreset === 'high_contrast') {
    primaryColor = '#0284c7';
    secondaryColor = '#7c3aed';
    accentColor = '#059669';
    bgGradient = ['#f8fafc', '#f1f5f9', '#e2e8f0'];
    borderColor = '#cbd5e1';
  } else if (themePreset === 'sunset') {
    primaryColor = '#f59e0b';
    secondaryColor = '#ec4899';
    accentColor = '#f97316';
    bgGradient = ['#451a03', '#291003', '#180801'];
    borderColor = '#78350f';
  } else if (themePreset === 'emerald') {
    primaryColor = '#10b981';
    secondaryColor = '#06b6d4';
    accentColor = '#34d399';
    bgGradient = ['#022c22', '#064e3b', '#021a14'];
    borderColor = '#047857';
  }

  const isLightMode = themePreset === 'light' || themePreset === 'high_contrast';

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_4px_16px_rgba(0,242,254,0.3)] transition-transform duration-300 hover:scale-105"
      >
        <defs>
          {/* Background Metallic Gradient */}
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={bgGradient[0]} />
            <stop offset="50%" stopColor={bgGradient[1]} />
            <stop offset="100%" stopColor={bgGradient[2]} />
          </linearGradient>

          {/* Border Metallic Highlight */}
          <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={borderColor} />
            <stop offset="100%" stopColor={bgGradient[2]} />
          </linearGradient>

          {/* Dynamic Primary Gradient */}
          <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} />
            <stop offset="100%" stopColor={accentColor} />
          </linearGradient>

          {/* Dynamic Secondary Gradient */}
          <linearGradient id="secondaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>

          {/* Glow Filter */}
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Squircle Canvas */}
        <rect
          x="6"
          y="6"
          width="188"
          height="188"
          rx="44"
          fill="url(#bgGrad)"
          stroke="url(#borderGrad)"
          strokeWidth="3"
        />

        {/* Outer Highlight Glow Rim */}
        <rect
          x="10"
          y="10"
          width="180"
          height="180"
          rx="40"
          fill="none"
          stroke={isLightMode ? '#000000' : '#ffffff'}
          strokeOpacity={isLightMode ? 0.06 : 0.08}
          strokeWidth="1.5"
        />

        {/* Infinity Spiral */}
        <g filter="url(#neonGlow)">
          <path
            d="M 100 82 C 78 52, 38 52, 38 82 C 38 112, 78 112, 100 82 C 122 52, 162 52, 162 82 C 162 112, 122 112, 100 82 Z"
            fill="none"
            stroke="url(#primaryGrad)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <path
            d="M 100 82 C 74 48, 32 48, 32 82 C 32 116, 74 116, 100 82 C 126 48, 168 48, 168 82 C 168 116, 126 116, 100 82 Z"
            fill="none"
            stroke="url(#secondaryGrad)"
            strokeWidth="3"
            strokeOpacity="0.85"
          />
          <path
            d="M 100 82 C 82 56, 44 56, 44 82 C 44 108, 82 108, 100 82 Z"
            fill="none"
            stroke={primaryColor}
            strokeWidth="2.5"
          />
        </g>

        {/* Embedded Clock Dial in Right Loop */}
        <g transform="translate(132, 82)">
          <circle r="22" fill={isLightMode ? '#f1f5f9' : '#0b0d14'} stroke="url(#secondaryGrad)" strokeWidth="2.5" />

          {/* Clock Ticks */}
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <line
              key={deg}
              x1="0"
              y1="-19"
              x2="0"
              y2="-16"
              stroke={isLightMode ? '#334155' : '#ffffff'}
              strokeOpacity="0.6"
              strokeWidth="1"
              transform={`rotate(${deg})`}
            />
          ))}

          {/* Clock Hands */}
          <line x1="0" y1="0" x2="-8" y2="-10" stroke={primaryColor} strokeWidth="2" strokeLinecap="round" />
          <line x1="0" y1="0" x2="10" y2="-6" stroke={isLightMode ? '#0f172a' : '#ffffff'} strokeWidth="2" strokeLinecap="round" />
          <circle r="2.5" fill={isLightMode ? '#0f172a' : '#ffffff'} />
        </g>

        {/* "OmniFlow" Text Label */}
        <text
          x="100"
          y="152"
          textAnchor="middle"
          fill={isLightMode ? '#0f172a' : '#ffffff'}
          fontSize="23"
          fontWeight="800"
          fontFamily="system-ui, -apple-system, sans-serif"
          letterSpacing="0.5"
        >
          OmniFlow
        </text>

        {/* Accent Underline */}
        <line
          x1="65"
          y1="164"
          x2="135"
          y2="164"
          stroke={primaryColor}
          strokeWidth="3.5"
          strokeLinecap="round"
          filter="url(#neonGlow)"
        />
      </svg>

      {showText && (
        <span className="font-extrabold text-lg text-[var(--color-text-primary)] tracking-tight">
          OmniFlow
        </span>
      )}
    </div>
  );
};
