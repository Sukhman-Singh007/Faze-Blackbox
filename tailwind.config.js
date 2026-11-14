/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        faze: { red: '#E10600', bright: '#FF2A2A', dark: '#0A0A0B', charcoal: '#141416', panel: '#1A1A1E', line: '#2A2A30' },
      },
      fontFamily: { display: ['"Archivo Black"', 'system-ui', 'sans-serif'], sans: ['Inter', 'system-ui', 'sans-serif'], mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'] },
      boxShadow: { glow: '0 0 24px rgba(225,6,0,.45)', card: '0 10px 40px rgba(0,0,0,.6)' },
      animation: { pulseSlow: 'pulse 2.4s ease-in-out infinite', spinSlow: 'spin 14s linear infinite' },
    },
  },
  plugins: [],
}
