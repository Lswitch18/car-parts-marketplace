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

  return (
    <div
      className={`daig-logo-wrap inline-flex items-center ${
        variant === 'vertical' ? 'flex-col' : 'flex-row'
      } gap-3 ${className}`}
    >
      {/* ══════════════════════════════════════
          Icon SVG — Gear-G
      ══════════════════════════════════════ */}
      <div 
        className="relative flex items-center justify-center rounded-full"
        style={{
          width: size,
          height: size,
          background: '#030305',
          flexShrink: 0
        }}
      >
        <svg viewBox="0 0 100 100" className="w-[85%] h-[85%]">
          <defs>
            <linearGradient id="gear-metallic" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#D8E5F6" />
              <stop offset="70%" stopColor="#647E9C" />
              <stop offset="100%" stopColor="#1E2E42" />
            </linearGradient>
          </defs>

          {/* Dynamic Gear Teeth */}
          {(() => {
            const teethAngles = [65, 95, 125, 155, 185, 215, 245, 275, 305];
            return teethAngles.map((deg) => {
              const rad = (deg * Math.PI) / 180;
              const radLeft = ((deg - 7) * Math.PI) / 180;
              const radRight = ((deg + 7) * Math.PI) / 180;
              const radTipLeft = ((deg - 4) * Math.PI) / 180;
              const radTipRight = ((deg + 4) * Math.PI) / 180;

              const p1 = `${50 + 31 * Math.cos(radLeft)},${50 + 31 * Math.sin(radLeft)}`;
              const p2 = `${50 + 39 * Math.cos(radTipLeft)},${50 + 39 * Math.sin(radTipLeft)}`;
              const p3 = `${50 + 39 * Math.cos(radTipRight)},${50 + 39 * Math.sin(radTipRight)}`;
              const p4 = `${50 + 31 * Math.cos(radRight)},${50 + 31 * Math.sin(radRight)}`;

              return (
                <polygon
                  key={deg}
                  points={`${p1} ${p2} ${p3} ${p4}`}
                  fill="url(#gear-metallic)"
                  stroke="#506c8f"
                  strokeWidth="0.5"
                />
              );
            });
          })()}

          {/* G body (Outer arc CCW, Inner arc CW) */}
          <path
            d="M 72.6 27.4 A 32 32 0 1 0 72.6 72.6 L 64.1 64.1 A 20 20 0 1 1 64.1 35.9 Z"
            fill="url(#gear-metallic)"
            stroke="#506c8f"
            strokeWidth="0.5"
          />

          {/* G horizontal crossbar shelf */}
          <path
            d="M 60 54 H 76 V 46 H 60 Z"
            fill="url(#gear-metallic)"
            stroke="#506c8f"
            strokeWidth="0.5"
          />

          {/* Inner decorative gear core */}
          <circle cx="50" cy="50" r="10" fill="none" stroke="#647E9C" strokeWidth="1.5" opacity="0.5" />
          <circle cx="50" cy="50" r="5" fill="#030305" stroke="#647E9C" strokeWidth="1" />
        </svg>
      </div>

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
            {/* D — metallic chrome */}
            <span
              style={{
                background: 'linear-gradient(175deg, #FFFFFF 0%, #C8D8F4 38%, #9AAEC6 70%, #E8F0FA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 1px 2px rgba(13,117,255,0.2))',
              }}
            >
              D
            </span>
            {/* A — metallic chrome */}
            <span
              style={{
                background: 'linear-gradient(175deg, #FFFFFF 0%, #C8D8F4 38%, #9AAEC6 70%, #E8F0FA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 1px 2px rgba(13,117,255,0.2))',
              }}
            >
              A
            </span>
            {/* I — metallic chrome */}
            <span
              style={{
                background: 'linear-gradient(175deg, #FFFFFF 0%, #C8D8F4 38%, #9AAEC6 70%, #E8F0FA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 1px 2px rgba(13,117,255,0.2))',
              }}
            >
              I
            </span>
            {/* G — metallic chrome */}
            <span
              style={{
                background: 'linear-gradient(175deg, #FFFFFF 0%, #C8D8F4 38%, #9AAEC6 70%, #E8F0FA 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                filter: 'drop-shadow(0 1px 2px rgba(13,117,255,0.2))',
              }}
            >
              G
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
            <span style={{ color: '#8892A4' }}>A.I.</span>
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
                  background: 'linear-gradient(90deg, #647E9C, #1E2E42)',
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
