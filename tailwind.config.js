/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'rgb(var(--color-primary))',
          dark: 'var(--color-primary-dark)',
          light: 'var(--color-primary-light)',
        },
        daig: {
          blue: 'var(--daig-blue)',
          purple: 'var(--daig-purple)',
          cyan: 'var(--daig-cyan)',
        },
        text: 'rgb(var(--color-text))',
        background: 'rgb(var(--color-background))',
        surface: 'rgb(var(--color-surface))',
        border: 'var(--color-border)',
        'text-secondary': 'var(--color-text-secondary)',
        error: 'var(--color-error)',
        warning: 'var(--color-warning)',
        info: 'var(--color-info)',
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
        'neon-glow': 'linear-gradient(to right, var(--daig-blue), var(--daig-purple))',
        'neon-gradient': 'linear-gradient(135deg, #00f5ff 0%, #ff00ff 50%, #00ff88 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px rgba(0, 245, 255, 0.3), 0 0 40px rgba(0, 245, 255, 0.1)',
        'neon-magenta': '0 0 20px rgba(255, 0, 255, 0.3), 0 0 40px rgba(255, 0, 255, 0.1)',
        'neon-green': '0 0 20px rgba(0, 255, 136, 0.3), 0 0 40px rgba(0, 255, 136, 0.1)',
        'neon-yellow': '0 0 20px rgba(255, 238, 0, 0.3), 0 0 40px rgba(255, 238, 0, 0.1)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 245, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.6)' },
        }
      }
    },
  },
  plugins: [],
}