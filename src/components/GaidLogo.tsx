import React from 'react';

/**
 * DAIG Logo — Digital A.I. Garage
 * Displays the clean, flat logo image without neon effects.
 */
const GaidLogo: React.FC<{
  size?: number;
  className?: string;
  variant?: 'horizontal' | 'icon' | 'vertical';
  animated?: boolean;
}> = ({ size = 48, className = '', variant = 'horizontal' }) => {

  return (
    <div
      className={`daig-logo-wrap inline-flex items-center ${
        variant === 'vertical' ? 'flex-col' : 'flex-row'
      } gap-3 ${className}`}
    >
      <img
        src="/logo.png"
        alt="DAIG Logo"
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          borderRadius: '50%',
          flexShrink: 0
        }}
      />

      {variant !== 'icon' && (
        <div
          className={`flex flex-col leading-none ${
            variant === 'vertical' ? 'items-center' : 'items-start'
          }`}
        >
          <div
            style={{
              fontSize: size * 0.5,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 800,
              letterSpacing: '0.1em',
              lineHeight: 1,
              color: '#FFFFFF'
            }}
          >
            DAIG
          </div>
          <div
            style={{
              fontSize: size * 0.14,
              fontFamily: "'Sora', sans-serif",
              fontWeight: 500,
              letterSpacing: '0.2em',
              marginTop: size * 0.05,
              textTransform: 'uppercase',
              color: '#8892A4',
              whiteSpace: 'nowrap',
            }}
          >
            DIGITAL A.I. GARAGE
          </div>
        </div>
      )}
    </div>
  );
};

export default GaidLogo;
