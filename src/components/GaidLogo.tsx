import React from 'react';

/**
 * DAIG Logo — Digital A.I. Garage
 * Engrenagem com letra G integrada + círculo neon azul luminoso
 * Tipografia: DAIG com A azul, subtítulo com A.I. azul.
 */
const GaidLogo: React.FC<{
  size?: number;
  className?: string;
  variant?: 'horizontal' | 'icon' | 'vertical';
  animated?: boolean;
}> = ({ size = 40, className = '', variant = 'horizontal', animated = true }) => {
  return (
    <div className={`daig-logo-wrap flex items-center ${variant === 'vertical' ? 'flex-col' : 'flex-row'} gap-3 ${className}`}>
      {/* Ícone: Engrenagem G Branca + Círculo Neon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <filter id="neon-ring" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Círculo externo neon azul */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="#0D75FF"
          strokeWidth="4"
          fill="none"
          filter="url(#neon-ring)"
          style={animated ? {
            animation: 'daig-ring-pulse 3s ease-in-out infinite',
          } : {}}
        />

        {/* Círculo interno (base) */}
        <circle cx="50" cy="50" r="40" fill="transparent" />

        {/* === Engrenagem G Branca === */}
        <g
          style={animated ? {
            transformOrigin: '50px 50px',
            animation: 'daig-gear-spin 12s linear infinite',
          } : {}}
        >
          {/* Dentes da engrenagem (8 dentes) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect
              key={deg}
              x="45"
              y="12"
              width="10"
              height="10"
              rx="1"
              fill="#FFFFFF"
              transform={`rotate(${deg}, 50, 50)`}
            />
          ))}

          {/* Corpo da engrenagem com G vazado */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M50 22C34.5 22 22 34.5 22 50C22 65.5 34.5 78 50 78C65.5 78 78 65.5 78 50C78 34.5 65.5 22 50 22ZM50 70C39 70 30 61 30 50C30 39 39 30 50 30C58 30 65 35 68 42H58C56 38 53 36 50 36C42 36 36 42 36 50C36 58 42 64 50 64C56 64 61 60 63 55H50V48H70V50C70 61 61 70 50 70Z"
            fill="#FFFFFF"
          />
        </g>

        <style>{`
          @keyframes daig-gear-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes daig-ring-pulse {
            0%, 100% { opacity: 1; stroke-width: 4; }
            50% { opacity: 0.8; stroke-width: 3; }
          }
        `}</style>
      </svg>

      {/* Texto DAIG */}
      {variant !== 'icon' && (
        <div className={`flex flex-col ${variant === 'vertical' ? 'items-center' : 'items-start'} leading-none`} style={{ fontFamily: "'Sora', sans-serif" }}>
          
          {/* DAIG Principal */}
          <div style={{
            fontSize: size * 0.6,
            fontWeight: 800,
            letterSpacing: '0.15em',
            lineHeight: 1,
            color: '#FFFFFF',
            display: 'flex'
          }}>
            <span>D</span>
            <span style={{ color: '#0D75FF' }}>A</span>
            <span>IG</span>
          </div>
          
          {/* Subtítulo DIGITAL A.I. GARAGE */}
          {variant === 'vertical' || variant === 'horizontal' ? (
            <div style={{
              fontSize: size * 0.15,
              fontWeight: 500,
              letterSpacing: '0.25em',
              color: '#FFFFFF',
              marginTop: size * 0.1,
              fontFamily: "'Sora', sans-serif",
              textTransform: 'uppercase',
            }}>
              <span>DIGITAL </span>
              <span style={{ color: '#0D75FF' }}>A.I.</span>
              <span> GARAGE</span>
            </div>
          ) : null}

          {/* Subtítulo 2 - Ecosystem */}
          {variant === 'vertical' && (
            <div style={{
              fontSize: size * 0.11,
              fontWeight: 400,
              letterSpacing: '0.15em',
              color: '#8892A4',
              marginTop: size * 0.08,
              fontFamily: "'Sora', sans-serif",
              textTransform: 'uppercase',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ width: '12px', height: '2px', background: '#0D75FF', display: 'inline-block' }}></span>
              SMART AUTOMOTIVE ECOSYSTEM
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GaidLogo;
