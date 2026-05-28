import React from 'react';

/**
 * DAIG Logo — Digital A.I. Garage
 *
 * The gear IS the letter G:
 *   • The G body is a thick arc (outer r=32, inner r=20) + a crossbar shelf
 *   • 13 metallic teeth protrude from the OUTER arc of the G (r 32 → 40)
 *   • The opening on the right side of the G has NO teeth (that's the gap)
 *   • A neon ring (r=46) pulses around the whole icon
 *
 * SVG coordinate system (y-axis DOWN):
 *   screen angle 0°  = right,  90° = down,  180° = left,  270° = up
 *   sweep-flag 1 = clockwise on screen
 *
 * G arc spans screen angles ~5° to ~305° (CCW around the left / top / bottom).
 * Gap: screen angles ~305° to ~360°/0° (upper-right opening + crossbar area).
 *
 * Key points (center 50,50):
 *   Outer gap top  : screen 308° → (50 + 32·cos308°, 50 + 32·sin308°) ≈ (69.9, 24.8) → rounded (70, 25)
 *   Outer gap bot  : screen 0°   → (82, 50)
 *   Inner gap top  : screen 308° → (50 + 20·cos308°, 50 + 20·sin308°) ≈ (62.4, 34.3) → rounded (62, 34)
 *   Inner gap bot  : screen 0°   → (70, 50)
 */

const GaidLogo: React.FC<{
  size?: number;
  className?: string;
  variant?: 'horizontal' | 'icon' | 'vertical';
  animated?: boolean;
}> = ({ size = 48, className = '', variant = 'horizontal', animated = true }) => {
  const uid = React.useId().replace(/:/g, '');

  /*
   * Gear teeth — placed at screen-clockwise angles from 5° to 305°.
   * Step ≈ 23.3° → 13 teeth distributed around the C-arc.
   * No tooth in the gap area (305° → 360° → 5°).
   */
  const TEETH_ANGLES = [5, 28, 51, 75, 98, 121, 144, 167, 190, 213, 237, 260, 283];

  /*
   * G body path (filled area between outer arc, crossbar, and inner arc):
   *
   *   M 70 25           ← outer gap top  (screen 308°, r=32)
   *   A 32 32 0 1 0 82 50   ← LARGE CCW outer arc → outer gap bottom (screen 0°)
   *   L 82 60           ← crossbar right outer, going DOWN
   *   L 70 60           ← crossbar bottom going LEFT (to inner radius)
   *   L 70 50           ← crossbar inner left, going UP to inner arc start
   *   A 20 20 0 0 0 62 34   ← SMALL CCW inner arc → inner gap top (screen 308°)
   *   Z                 ← close: line from inner-top to outer-top (top rim of gap)
   */
  const G_PATH = 'M 70 25 A 32 32 0 1 0 82 50 L 82 60 L 70 60 L 70 50 A 20 20 0 0 0 62 34 Z';

  return (
    <div
      className={`daig-logo-wrap inline-flex items-center ${
        variant === 'vertical' ? 'flex-col' : 'flex-row'
      } gap-3 ${className}`}
    >
      {/* ══════════════════════════════════════
          Icon SVG — Gear-G
      ══════════════════════════════════════ */}
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
          {/* Soft neon glow for the ring */}
          <filter id={`glow-${uid}`} x="-45%" y="-45%" width="190%" height="190%">
            <feGaussianBlur in="SourceGraphic" stdDeviation="2.8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Blue → cyan → purple ring gradient */}
          <linearGradient id={`ring-${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#0D75FF" />
            <stop offset="48%"  stopColor="#00E5FF" />
            <stop offset="100%" stopColor="#7000FF" />
          </linearGradient>

          {/* Metallic chrome gradient for G body + teeth */}
          <linearGradient id={`metal-${uid}`} x1="15%" y1="0%" x2="85%" y2="100%">
            <stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="1" />
            <stop offset="25%"  stopColor="#DCE8F8"  stopOpacity="1" />
            <stop offset="58%"  stopColor="#9CAEC4"  stopOpacity="1" />
            <stop offset="100%" stopColor="#EAF0FA"  stopOpacity="1" />
          </linearGradient>

          {/* Very subtle highlight on teeth */}
          <linearGradient id={`tooth-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#FFFFFF"  stopOpacity="0.9" />
            <stop offset="40%"  stopColor="#C8D8EE"  stopOpacity="1"   />
            <stop offset="100%" stopColor="#8AA0B8"  stopOpacity="1"   />
          </linearGradient>

          {/* Deep space background */}
          <radialGradient id={`bg-${uid}`} cx="48%" cy="38%" r="70%">
            <stop offset="0%"   stopColor="#16162A" />
            <stop offset="100%" stopColor="#06060E" />
          </radialGradient>
        </defs>

        {/* ── Dark background ── */}
        <circle cx="50" cy="50" r="49.5" fill={`url(#bg-${uid})`} />

        {/* ── Neon ring (animated pulse) ── */}
        <circle
          cx="50" cy="50" r="46"
          stroke={`url(#ring-${uid})`}
          strokeWidth="2.2"
          fill="none"
          filter={`url(#glow-${uid})`}
          style={animated ? { animation: 'daig-ring-pulse 3.5s ease-in-out infinite' } : {}}
        />
        {/* Inner subtle ring */}
        <circle
          cx="50" cy="50" r="43.5"
          stroke="rgba(13,117,255,0.14)"
          strokeWidth="0.5"
          fill="none"
        />

        {/* ══════════════════════════════════════
            GEAR TEETH  (only on the C-arc, no teeth in the G gap)
            Each rect: base at r=31.5, tip at r=40.5, ±5px wide
            transform: first rotate around origin, then translate to center
        ══════════════════════════════════════ */}
        {TEETH_ANGLES.map((deg) => (
          <rect
            key={deg}
            x="31.5"
            y="-5"
            width="9"
            height="10.5"
            rx="2"
            fill={`url(#tooth-${uid})`}
            transform={`translate(50 50) rotate(${deg})`}
          />
        ))}

        {/* ══════════════════════════════════════
            G BODY
            Thick arc (outer r=32, inner r=20) + crossbar
        ══════════════════════════════════════ */}
        <path
          d={G_PATH}
          fill={`url(#metal-${uid})`}
        />

        {/* Embedded keyframes */}
        <style>{`
          @keyframes daig-ring-pulse {
            0%, 100% { opacity: 1;    }
            50%       { opacity: 0.5;  }
          }
        `}</style>
      </svg>

      {/* ══════════════════════════════════════
          WORDMARK
      ══════════════════════════════════════ */}
      {variant !== 'icon' && (
        <div
          className={`flex flex-col leading-none ${
            variant === 'vertical' ? 'items-center' : 'items-start'
          }`}
        >
          {/* DAIG */}
          <div
            style={{
              fontSize: size * 0.6,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              letterSpacing: '0.1em',
              lineHeight: 1,
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            {/* D — neon blue */}
            <span
              style={{
                background: 'linear-gradient(175deg, #6EB5FF 0%, #0D75FF 52%, #4d9cff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              D
            </span>
            {/* AIG — metallic chrome */}
            <span
              style={{
                background: 'linear-gradient(175deg, #FFFFFF 0%, #C8D8F4 38%, #9AAEC6 70%, #E8F0FA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 1px 2px rgba(13,117,255,0.2))',
              }}
            >
              AIG
            </span>
          </div>

          {/* DIGITAL A.I. GARAGE */}
          <div
            style={{
              fontSize: size * 0.148,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.26em',
              marginTop: size * 0.07,
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: '#8892A4' }}>DIGITAL{'\u00A0'}</span>
            <span style={{ color: '#0D75FF' }}>A.I.</span>
            <span style={{ color: '#8892A4' }}>{'\u00A0'}GARAGE</span>
          </div>

          {/* Tagline (vertical only) */}
          {variant === 'vertical' && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginTop: size * 0.1,
                fontSize: size * 0.092,
                fontFamily: "'Sora', sans-serif",
                fontWeight: 400,
                letterSpacing: '0.15em',
                color: '#4B5563',
                textTransform: 'uppercase',
              }}
            >
              <span
                style={{
                  width: '14px',
                  height: '1.5px',
                  background: 'linear-gradient(90deg, #0D75FF, #7000FF)',
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
