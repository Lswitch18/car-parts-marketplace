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
      },
      fontFamily: {
        display: ['Sora', 'sans-serif'],
        sans: ['Raleway', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'neon-glow': 'linear-gradient(to right, var(--daig-blue), var(--daig-purple))',
      }
    },
  },
  plugins: [],
}