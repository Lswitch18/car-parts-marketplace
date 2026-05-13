import React from 'react';

/**
 * DAIG Logo — Digital A.I. Garage
 * Engrenagem com letra G integrada + círculo neon azul luminoso
 * Conforme Brand Book DAIG v1.0 Maio/2024
 */
const GaidLogo: React.FC<{
  size?: number;
  className?: string;
  variant?: 'horizontal' | 'icon' | 'vertical';
  animated?: boolean;
}> = ({ size = 40, className = '', variant = 'horizontal', animated = true }) => {
  return (
    <div className={`daig-logo-wrap flex items-center ${variant === 'vertical' ? 'flex-col' : 'flex-row'} gap-3 ${className}`}>
      {/* Ícone: Engrenagem G + Círculo Neon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          {/* Gradiente azul DAIG */}
          <linearGradient id="daig-blue-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E90FF" />
            <stop offset="100%" stopColor="#0D50CC" />
          </linearGradient>

          {/* Gradiente prata para engrenagem */}
          <linearGradient id="gear-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E5E8ED" />
            <stop offset="50%" stopColor="#B0B8C8" />
            <stop offset="100%" stopColor="#8892A4" />
          </linearGradient>

          {/* Filtro glow neon azul */}
          <filter id="neon-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Glow para o círculo externo */}
          <filter id="ring-glow" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur1" />
            <feGaussianBlur stdDeviation="6" result="blur2" />
            <feMerge>
              <feMergeNode in="blur2" />
              <feMergeNode in="blur1" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* === Círculo externo neon === */}
        <circle
          cx="50"
          cy="50"
          r="44"
          stroke="#0D75FF"
          strokeWidth="3.5"
          fill="none"
          filter="url(#ring-glow)"
          style={animated ? {
            animation: 'daig-ring-pulse 3s ease-in-out infinite',
          } : {}}
        />

        {/* Círculo interno (track) */}
        <circle cx="50" cy="50" r="40" fill="rgba(13, 117, 255, 0.06)" />

        {/* === Engrenagem === */}
        <g
          style={animated ? {
            transformOrigin: '50px 50px',
            animation: 'daig-gear-spin 12s linear infinite',
          } : {}}
          filter="url(#neon-glow)"
        >
          {/* Dentes da engrenagem (8 dentes) */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect
              key={deg}
              x="46"
              y="8"
              width="8"
              height="12"
              rx="2"
              fill="url(#gear-grad)"
              transform={`rotate(${deg}, 50, 50)`}
            />
          ))}

          {/* Corpo da engrenagem */}
          <circle cx="50" cy="50" r="30" fill="#1A1E28" />
          <circle cx="50" cy="50" r="30" stroke="url(#gear-grad)" strokeWidth="1.5" fill="none" />

          {/* Letra G integrada */}
          <path
            d="M58 32C55 30 52 29 50 29C40.6 29 33 36.6 33 46C33 55.4 40.6 63 50 63C55.2 63 59.8 60.8 63 57.2V46H50V52H57V55C55.4 56.2 52.8 57 50 57C44 57 39 52 39 46C39 40 44 35 50 35C52.8 35 55.4 36 57.4 38L58 32Z"
            fill="url(#daig-blue-grad)"
          />
        </g>

        {/* Ponto central */}
        <circle cx="50" cy="50" r="4" fill="#0D75FF" filter="url(#neon-glow)" />

        <style>{`
          @keyframes daig-gear-spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes daig-ring-pulse {
            0%, 100% { opacity: 1; stroke-width: 3.5; }
            50% { opacity: 0.7; stroke-width: 2.5; }
          }
        `}</style>
      </svg>

      {/* Texto DAIG */}
      {variant !== 'icon' && (
        <div className="flex flex-col leading-none" style={{ fontFamily: "'Sora', sans-serif" }}>
          <span
            style={{
              fontSize: size * 0.55,
              fontWeight: 800,
              letterSpacing: '0.12em',
              background: 'linear-gradient(90deg, #FFFFFF 0%, #AACCFF 60%, #0D75FF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
            }}
          >
            DAIG
          </span>
          {variant === 'horizontal' && (
            <span
              style={{
                fontSize: size * 0.17,
                fontWeight: 400,
                letterSpacing: '0.2em',
                color: '#7B8497',
                marginTop: 3,
                fontFamily: "'Raleway', sans-serif",
                textTransform: 'uppercase',
              }}
            >
              Digital A.I. Garage
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default GaidLogo;
