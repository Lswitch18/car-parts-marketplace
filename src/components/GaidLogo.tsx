import React from 'react';

/**
 * Componente GaidLogo
 * Renderiza uma engrenagem em formato de 'G' que gira e revela a palavra 'AID'.
 */
const GaidLogo: React.FC<{ size?: number; className?: string }> = ({ size = 120, className = '' }) => {
  return (
    <div className={`gaid-logo-container flex items-center justify-center ${className}`}>
      <svg
        width={size * 3}
        height={size}
        viewBox="0 0 300 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient id="gaid-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3498db" />
            <stop offset="100%" stopColor="#2c3e50" />
          </linearGradient>
          
          <style>
            {`
              .gear-g {
                transform-origin: 50px 50px;
                animation: spin-and-stop 2.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite alternate;
              }
              
              .aid-text {
                opacity: 0;
                transform: translateX(-20px);
                animation: fade-in-slide 2.5s ease-out infinite alternate;
              }

              @keyframes spin-and-stop {
                0% { transform: rotate(0deg); }
                40% { transform: rotate(360deg); }
                100% { transform: rotate(360deg); }
              }

              @keyframes fade-in-slide {
                0%, 40% { opacity: 0; transform: translateX(-20px); }
                60%, 100% { opacity: 1; transform: translateX(0px); }
              }
            `}
          </style>
        </defs>

        {/* Engrenagem em formato de G */}
        <g className="gear-g">
          <path
            d="M50 20C33.4 20 20 33.4 20 50C20 66.6 33.4 80 50 80C58.3 80 65.8 76.6 71.2 71.2L60.6 60.6C57.9 63.3 54.1 65 50 65C41.7 65 35 58.3 35 50C35 41.7 41.7 35 50 35C58.3 35 65 41.7 65 50V55H50V65H80V50C80 33.4 66.6 20 50 20Z"
            fill="url(#gaid-gradient)"
          />
          {/* Dentes da engrenagem */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <rect
              key={deg}
              x="45"
              y="10"
              width="10"
              height="10"
              rx="2"
              fill="url(#gaid-gradient)"
              transform={`rotate(${deg}, 50, 50)`}
            />
          ))}
        </g>

        {/* Texto AID */}
        <text
          x="95"
          y="68"
          className="aid-text font-display"
          style={{
            fontSize: '55px',
            fontWeight: 'bold',
            fill: '#2c3e50',
            fontFamily: 'system-ui, sans-serif'
          }}
        >
          AID
        </text>
      </svg>
    </div>
  );
};

export default GaidLogo;
