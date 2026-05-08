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
          DEFAULT: '#2563EB',
          dark: '#1D4ED8',
          light: '#60A5FA',
        },
        text: '#111827',
        background: '#F9FAFB',
        surface: '#FFFFFF',
        border: '#D1D5DB',
        'text-secondary': '#6B7280',
        error: '#DC2626',
        warning: '#F59E0B',
        info: '#93C5FD',
      },
      fontFamily: {
        display: ['Orbitron', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}