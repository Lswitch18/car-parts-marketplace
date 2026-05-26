/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // DAIG brand palette — direct hex values (no rgb(var(--hex)) bug)
        primary: {
          DEFAULT: '#0D75FF',
          dark: '#0050c2',
          light: '#4d9cff',
        },
        daig: {
          blue: '#0D75FF',
          purple: '#7000FF',
          cyan: '#00E5FF',
        },
        // Semantic tokens matching CSS vars
        background: '#000000',
        surface: '#0A0A0F',
        border: 'rgba(13,117,255,0.15)',
        text: {
          DEFAULT: '#FFFFFF',
          secondary: '#B0B5C0',
          muted: '#6B7280',
        },
        error: '#FF4B4B',
        warning: '#FFB800',
        success: '#00D97E',
        info: '#0D75FF',
        // Neon colors for Logistix
        neon: {
          cyan: '#00f5ff',
          magenta: '#ff00ff',
          green: '#00ff88',
          yellow: '#ffee00',
          purple: '#a855f7',
          blue: '#3b82f6',
          red: '#ef4444',
          orange: '#ff6b35',
        },
        dark: {
          bg: '#0a0a0f',
          card: '#12121a',
          cardHover: '#1a1a2e',
          border: '#2a2a3e',
        }
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans: ['Raleway', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-glow': 'linear-gradient(to right, #0D75FF, #7000FF)',
        'neon-gradient': 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 50%, #00ff88 100%)',
      },
      boxShadow: {
        'neon-blue': '0 0 20px rgba(13,117,255,0.4), 0 0 40px rgba(13,117,255,0.15)',
        'neon-cyan': '0 0 20px rgba(0,245,255,0.3), 0 0 40px rgba(0,245,255,0.1)',
        'neon-magenta': '0 0 20px rgba(255,0,255,0.3), 0 0 40px rgba(255,0,255,0.1)',
        'neon-green': '0 0 20px rgba(0,255,136,0.3), 0 0 40px rgba(0,255,136,0.1)',
        'neon-yellow': '0 0 20px rgba(255,238,0,0.3), 0 0 40px rgba(255,238,0,0.1)',
        'glass': '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'slide-up': 'slideUp 0.5s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(13,117,255,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(13,117,255,0.6)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0%)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      }
    },
  },
  plugins: [],
}