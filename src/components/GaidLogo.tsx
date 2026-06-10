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
          boxShadow: animated ? '0 0 12px rgba(13, 117, 255, 0.5), inset 0 0 8px rgba(13, 117, 255, 0.3)' : '0 0 8px rgba(13, 117, 255, 0.4)',
          border: '1px solid rgba(13, 117, 255, 0.4)',
          animation: animated ? 'daig-logo-pulse 2.5s ease-in-out infinite' : 'none',
          overflow: 'hidden',
          background: '#050508',
          flexShrink: 0
        }}
      >
        <img
          src="/logo.png"
          alt="DAIG"
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
        <style>{`
          @keyframes daig-logo-pulse {
            0%, 100% {
              box-shadow: 0 0 12px rgba(13, 117, 255, 0.5), inset 0 0 8px rgba(13, 117, 255, 0.3);
              border-color: rgba(13, 117, 255, 0.4);
            }
            50% {
              box-shadow: 0 0 24px rgba(0, 229, 255, 0.9), inset 0 0 16px rgba(0, 229, 255, 0.6);
              border-color: rgba(0, 229, 255, 0.8);
            }
          }
          @keyframes neon-pulse {
            0%, 100% {
              text-shadow: 0 0 4px rgba(13, 117, 255, 0.3), 0 0 12px rgba(13, 117, 255, 0.1);
              opacity: 0.9;
            }
            50% {
              text-shadow: 0 0 8px rgba(13, 117, 255, 0.6), 0 0 24px rgba(13, 117, 255, 0.3), 0 0 48px rgba(13, 117, 255, 0.15);
              opacity: 1;
            }
          }
        `}</style>
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
            {/* A — neon blue */}
            <span
              style={{
                color: '#0D75FF',
                textShadow: '0 0 8px rgba(13,117,255,0.8), 0 0 24px rgba(13,117,255,0.4), 0 0 48px rgba(13,117,255,0.2)',
                animation: animated ? 'neon-pulse 2s ease-in-out infinite' : 'none',
              }}
            >
              A
            </span>
            {/* I — neon blue */}
            <span
              style={{
                color: '#0D75FF',
                textShadow: '0 0 8px rgba(13,117,255,0.8), 0 0 24px rgba(13,117,255,0.4), 0 0 48px rgba(13,117,255,0.2)',
                animation: animated ? 'neon-pulse 2s ease-in-out infinite' : 'none',
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
            <span style={{
              color: '#0D75FF',
              textShadow: '0 0 8px rgba(13,117,255,0.6), 0 0 24px rgba(13,117,255,0.3)',
              animation: animated ? 'neon-pulse 2s ease-in-out infinite' : 'none',
            }}>A.I.</span>
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
