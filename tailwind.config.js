/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          DEFAULT: '#0a0a0f',
          soft: '#11111a',
          card: '#171722',
          hover: '#1f1f2e',
        },
        accent: {
          pink: '#ec4899',
          purple: '#a855f7',
          cyan: '#06b6d4',
          gold: '#fbbf24',
        },
        ink: {
          DEFAULT: '#e5e7eb',
          mute: '#9ca3af',
          dim: '#6b7280',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        display: ['var(--font-space)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(ellipse at top, var(--tw-gradient-stops))',
        'gradient-manga': 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #06b6d4 100%)',
        'gradient-gold': 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(236, 72, 153, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(236, 72, 153, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
