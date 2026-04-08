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
        'sg-navy':        '#1f2d5c',
        'sg-navy-dark':   '#151f42',
        'sg-navy-light':  '#2a3d6f',
        'sg-coral':       '#ed5e68',
        'sg-coral-dark':  '#d13844',
        'sg-coral-light': '#ff8087',
        'sg-teal':        '#00a5a8',
        'sg-amber':       '#f39c12',
        'sg-red':         '#d63031',
        'sg-green':       '#00b894',
      },
      fontFamily: {
        sans: ['var(--font-public-sans)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow':     'pulse-slow 8s ease-in-out infinite',
        'slide-in-left':  'slideInLeft 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'fade-in':        'fadeIn 0.6s ease-out both',
        'fade-in-up':     'fadeInUp 0.6s ease-out both',
        'fade-in-down':   'fadeInDown 0.5s ease-out',
        'slide-up':       'slideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
        'pulse-dot':      'pulseDot 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)',   opacity: '0.15' },
          '50%':      { transform: 'scale(1.1)', opacity: '0.25' },
        },
        slideInLeft: {
          from: { opacity: '0', transform: 'translateX(-30px)' },
          to:   { opacity: '1', transform: 'translateX(0)' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to:   { opacity: '1' },
        },
        fadeInUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          from: { opacity: '0', transform: 'translateY(-20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },
    },
  },
  plugins: [],
}

export default config
