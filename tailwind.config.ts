import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Space Grotesk', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        ocean: {
          950: '#050D1A',
          900: '#0A1628',
          800: '#0D2137',
          700: '#122A47',
          600: '#1A3D5E',
          500: '#1E4D7B',
        },
        signal: {
          cyan: '#00E5FF',
          'cyan-dim': '#00B8CC',
          'cyan-glow': 'rgba(0, 229, 255, 0.15)',
        },
        alert: {
          red: '#FF3B30',
          'red-dim': '#CC2F26',
          orange: '#FF9500',
          yellow: '#FFD60A',
          green: '#30D158',
          'green-dim': '#26A847',
        },
        mesh: {
          active: '#FFD60A',
          done: '#30D158',
          origin: '#FF3B30',
        },
      },
      animation: {
        'pulse-ring': 'pulseRing 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'glow-pulse': 'glowPulse 2s ease-in-out infinite',
        'slide-up': 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-in-right': 'slideInRight 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        'fade-in': 'fadeIn 0.3s ease-out',
        'sos-flash': 'sosFlash 0.6s ease-in-out',
      },
      keyframes: {
        pulseRing: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(2.5)', opacity: '0' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 8px rgba(0, 229, 255, 0.3)' },
          '50%': { boxShadow: '0 0 24px rgba(0, 229, 255, 0.7)' },
        },
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          from: { transform: 'translateX(32px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        sosFlash: {
          '0%': { backgroundColor: 'transparent' },
          '50%': { backgroundColor: 'rgba(255, 59, 48, 0.12)' },
          '100%': { backgroundColor: 'transparent' },
        },
      },
      backdropBlur: {
        xs: '4px',
      },
      boxShadow: {
        panel: '0 4px 32px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255,255,255,0.04) inset',
        'panel-cyan': '0 0 0 1px rgba(0, 229, 255, 0.2), 0 4px 32px rgba(0, 0, 0, 0.6)',
        'panel-red': '0 0 0 1px rgba(255, 59, 48, 0.4), 0 4px 32px rgba(255, 59, 48, 0.15)',
        'panel-green': '0 0 0 1px rgba(48, 209, 88, 0.4), 0 4px 32px rgba(48, 209, 88, 0.15)',
        'glow-cyan': '0 0 20px rgba(0, 229, 255, 0.35)',
        'glow-red': '0 0 20px rgba(255, 59, 48, 0.5)',
        'glow-green': '0 0 20px rgba(48, 209, 88, 0.5)',
        'cell-hover': '0 0 12px rgba(0, 229, 255, 0.4)',
      },
    },
  },
  plugins: [],
};

export default config;
