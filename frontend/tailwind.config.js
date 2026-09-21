/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        coal: {
          DEFAULT: '#0a0a0a',
          50: '#1a1a1a',
          100: '#141414',
          200: '#0f0f0f',
        },
        offwhite: {
          DEFAULT: '#F5F0F5',
          warm: '#FDF8FB',
          pure: '#FAF7FA',
        },
        pink: {
          baby: '#FFC0CB',
          soft: '#FFD6DC',
          muted: '#F9B8C3',
          deep: '#E8A0AD',
          glow: 'rgba(255,192,203,0.35)',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: '#0a0a0a',
          foreground: '#F5F0F5',
        },
        accent: {
          DEFAULT: '#FFC0CB',
          foreground: '#0a0a0a',
        },
        success: { DEFAULT: '#10B981', foreground: '#FFFFFF' },
        warning: { DEFAULT: '#F59E0B', foreground: '#FFFFFF' },
        danger: { DEFAULT: '#EF4444', foreground: '#FFFFFF' },
        critical: { DEFAULT: '#7C3AED', foreground: '#FFFFFF' },
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
        lg: '12px',
        md: '8px',
        sm: '6px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'pink-sm': '0 2px 8px rgba(255,192,203,0.2)',
        'pink-md': '0 4px 20px rgba(255,192,203,0.3)',
        'pink-lg': '0 8px 40px rgba(255,192,203,0.35)',
        'pink-xl': '0 20px 60px rgba(255,192,203,0.4)',
        'coal-sm': '0 2px 8px rgba(10,10,10,0.15)',
        'coal-md': '0 4px 20px rgba(10,10,10,0.2)',
        'coal-lg': '0 8px 40px rgba(10,10,10,0.25)',
        glow: '0 0 30px rgba(255,192,203,0.5), 0 0 60px rgba(255,192,203,0.2)',
        'inner-pink': 'inset 0 1px 0 rgba(255,192,203,0.3)',
      },
      backgroundImage: {
        'gradient-coal': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%)',
        'gradient-pink': 'linear-gradient(135deg, #FFC0CB 0%, #FFD6DC 100%)',
        'gradient-glass': 'linear-gradient(135deg, rgba(253,248,251,0.9) 0%, rgba(245,240,245,0.8) 100%)',
        'gradient-dark-glass': 'linear-gradient(135deg, rgba(10,10,10,0.95) 0%, rgba(26,26,26,0.9) 100%)',
        'mesh-pink': 'radial-gradient(at 40% 20%, rgba(255,192,203,0.3) 0px, transparent 50%), radial-gradient(at 80% 0%, rgba(255,214,220,0.2) 0px, transparent 50%), radial-gradient(at 0% 50%, rgba(249,184,195,0.15) 0px, transparent 50%)',
      },
      animation: {
        'fade-in': 'fadeIn 0.6s ease-out both',
        'fade-in-up': 'fadeInUp 0.7s ease-out both',
        'fade-in-down': 'fadeInDown 0.6s ease-out both',
        'slide-in-left': 'slideInLeft 0.5s ease-out both',
        'slide-in-right': 'slideInRight 0.5s ease-out both',
        'scale-in': 'scaleIn 0.4s ease-out both',
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'pulse-pink': 'pulsePink 2.5s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'spin-slow': 'spin 8s linear infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'bounce-soft': 'bounceSoft 1.5s ease-in-out infinite',
        'draw-line': 'drawLine 1.2s ease-out forwards',
        'count-up': 'countUp 1s ease-out both',
        'stagger-1': 'fadeInUp 0.7s 0.1s ease-out both',
        'stagger-2': 'fadeInUp 0.7s 0.2s ease-out both',
        'stagger-3': 'fadeInUp 0.7s 0.3s ease-out both',
        'stagger-4': 'fadeInUp 0.7s 0.4s ease-out both',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeInDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulsePink: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(255,192,203,0.4)' },
          '50%': { boxShadow: '0 0 0 12px rgba(255,192,203,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', filter: 'blur(20px)' },
          '50%': { opacity: '1', filter: 'blur(30px)' },
        },
        bounceSoft: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        drawLine: {
          '0%': { strokeDashoffset: '1000' },
          '100%': { strokeDashoffset: '0' },
        },
        countUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      backdropBlur: {
        xs: '2px',
        '4xl': '80px',
      },
    },
  },
  plugins: [],
};
