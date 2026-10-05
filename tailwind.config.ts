import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#05070A',
        surface: {
          DEFAULT: '#090F0C',
          muted: '#0D1612',
          card: 'rgba(9, 17, 13, 0.85)',
          border: 'rgba(57, 255, 20, 0.2)',
          borderHover: 'rgba(57, 255, 20, 0.5)',
        },
        neon: {
          green: '#39FF14',
          dim: '#23a80d',
          glow: 'rgba(57, 255, 20, 0.35)',
        },
        amber: {
          DEFAULT: '#FF9F1C',
          glow: 'rgba(255, 159, 28, 0.35)',
        },
        reject: {
          DEFAULT: '#FF3B3B',
          glow: 'rgba(255, 59, 59, 0.35)',
        },
        muted: {
          DEFAULT: '#8A94A6',
          dark: '#4B5565',
          light: '#A0AEC0',
        },
      },
      fontFamily: {
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        space: ['var(--font-space-mono)', 'monospace'],
      },
      boxShadow: {
        'neon-sm': '0 0 10px rgba(57, 255, 20, 0.25)',
        'neon-md': '0 0 20px rgba(57, 255, 20, 0.35), inset 0 0 10px rgba(57, 255, 20, 0.1)',
        'neon-lg': '0 0 35px rgba(57, 255, 20, 0.45), inset 0 0 15px rgba(57, 255, 20, 0.15)',
        'amber-glow': '0 0 20px rgba(255, 159, 28, 0.35)',
        'reject-glow': '0 0 20px rgba(255, 59, 59, 0.35)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-slow': 'float 6s ease-in-out infinite',
        'scanline': 'scanline 8s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(1000%)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
