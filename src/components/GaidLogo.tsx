import React from 'react';

/**
 * DAIG Logo — Digital A.I. Garage
 * Inspired by reference: gear with G inside + blue neon ring + metallic DAIG lettering
 * Variants: 'horizontal' | 'vertical' | 'icon'
 */
const GaidLogo: React.FC<{
  size?: number;
  className?: string;
  variant?: 'horizontal' | 'icon' | 'vertical';
  animated?: boolean;
}> = ({ size = 48, className = '', variant = 'horizontal', animated = true }) => {
  const uid = React.useId().replace(/:/g, '');

  return (
    <div
      className={`daig-logo-wrap inline-flex items-center ${
        variant === 'vertical' ? 'flex-col' : 'flex-row'
      } gap-3 ${className}`}
    >
      {/* ── Icon: Gear + G + Neon Ring ── */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
        aria-hidden="true"
      >
        <defs>
          {/* Blue neon glow for the ring */}
          <filter id={`neon-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="blur1" />
            <feGaussianBlur stdDeviation="5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Metallic gear gradient */}
          <linearGradient id={`gear-metal-${uid}`} x1="20%" y1="0%" x2="80%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="35%" stopColor="#D0D8E8" stopOpacity="1" />
            <stop offset="65%" stopColor="#A8B4C8" stopOpacity="1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="1" />
          </linearGradient>

          {/* Inner shadow for gear depth */}
          <radialGradient id={`gear-bg-${uid}`} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#1A1A28" />
            <stop offset="100%" stopColor="#0A0A10" />
          </radialGradient>
        </defs>

        {/* Dark background fill */}
        <circle cx="50" cy="50" r="49" fill={`url(#gear-bg-${uid})`} />

        {/* Outer neon ring — glowing blue */}
        <circle
          cx="50"
          cy="50"
          r="46"
          stroke="#0D75FF"
          strokeWidth="2.5"
          fill="none"
          filter={`url(#neon-${uid})`}
          style={
            animated
              ? { animation: 'daig-ring-pulse 4s ease-in-out infinite' }
              : {}
          }
        />
        {/* Inner ring thin line for depth */}
        <circle cx="50" cy="50" r="43.5" stroke="rgba(13,117,255,0.3)" strokeWidth="0.8" fill="none" />

        {/* ── Gear group (spins slowly) ── */}
        <g
          style={
            animated
              ? {
                  transformOrigin: '50px 50px',
                  animation: 'daig-gear-spin 30s linear infinite',
                }
              : {}
          }
        >
          {/* 8 gear teeth — rectangles rotated around center */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect
              key={deg}
              x="44"
              y="11"
              width="12"
              height="13"
              rx="2"
              fill={`url(#gear-metal-${uid})`}
              transform={`rotate(${deg}, 50, 50)`}
            />
          ))}

          {/* Gear outer ring body */}
          <circle
            cx="50"
            cy="50"
            r="30"
            fill={`url(#gear-metal-${uid})`}
          />

          {/* Dark inner circle — where G sits */}
          <circle cx="50" cy="50" r="22" fill={`url(#gear-bg-${uid})`} />

          {/* ── G letter ── clean Helvetica-style G */}
          {/* 
            G shape: outer arc from ~135° to ~360° (clockwise),
            then horizontal bar inward, then inner arc back.
            Using path data for precise G letterform.
          */}
          <path
            d="
              M 50 29
              A 21 21 0 1 0 71 50
              L 71 50
              L 71 45
              L 56 45
              L 56 51
              L 65 51
              A 15 15 0 1 1 50 35
              Z
            "
            fill={`url(#gear-metal-${uid})`}
            strokeLinejoin="round"
          />
        </g>

        {/* Embedded keyframe animations */}
        <style>{`
          @keyframes daig-gear-spin {
            from { transform: rotate(0deg); }
            to   { transform: rotate(360deg); }
          }
          @keyframes daig-ring-pulse {
            0%, 100% { opacity: 1; }
            50%       { opacity: 0.65; }
          }
        `}</style>
      </svg>

      {/* ── Text block ── */}
      {variant !== 'icon' && (
        <div
          className={`flex flex-col leading-none ${
            variant === 'vertical' ? 'items-center' : 'items-start'
          }`}
        >
          {/* DAIG — metallic chrome look */}
          <div
            style={{
              fontSize: size * 0.62,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              letterSpacing: '0.12em',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'baseline',
              background:
                'linear-gradient(180deg, #FFFFFF 0%, #C8D4E8 40%, #A0B0C8 70%, #FFFFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: 'drop-shadow(0 1px 2px rgba(13,117,255,0.3))',
            }}
          >
            {/* D — slight blue tint */}
            <span
              style={{
                background:
                  'linear-gradient(180deg, #6EB5FF 0%, #0D75FF 45%, #4d9cff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              D
            </span>
            <span>AIG</span>
          </div>

          {/* DIGITAL A.I. GARAGE subtitle */}
          {(variant === 'horizontal' || variant === 'vertical') && (
            <div
              style={{
                fontSize: size * 0.155,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 500,
                letterSpacing: '0.28em',
                marginTop: size * 0.08,
                textTransform: 'uppercase' as const,
                display: 'flex',
                alignItems: 'center',
                gap: '0',
                whiteSpace: 'nowrap' as const,
                color: '#8892A4',
              }}
            >
              <span style={{ color: '#B0BAD0' }}>DIGITAL{'\u00A0'}</span>
              <span style={{ color: '#0D75FF' }}>A.I.</span>
              <span style={{ color: '#B0BAD0' }}>{'\u00A0'}GARAGE</span>
            </div>
          )}

          {/* Extra badge for vertical variant */}
          {variant === 'vertical' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: size * 0.1,
                fontSize: size * 0.1,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 400,
                letterSpacing: '0.18em',
                color: '#6B7280',
                textTransform: 'uppercase' as const,
              }}
            >
              <span
                style={{
                  width: '14px',
                  height: '2px',
                  background: '#0D75FF',
                  display: 'inline-block',
                  borderRadius: '2px',
                }}
              />
              SMART AUTOMOTIVE ECOSYSTEM
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GaidLogo;
