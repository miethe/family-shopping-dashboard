import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '375px',   // iPhone SE
      'sm': '640px',
      'md': '768px',   // iPad
      'lg': '1024px',
      'xl': '1280px',
    },
    extend: {
      colors: {
        // Warm backgrounds - Refined for depth
        'bg-base': '#FBF9F6', // Slightly lighter/warmer
        'bg-subtle': '#F2EEE6',
        'bg-elevated': '#FFFFFF',
        'surface-primary': '#FFFFFF',
        'surface-secondary': 'rgba(255, 255, 255, 0.6)', // Glassy
        'surface-tertiary': 'rgba(242, 238, 230, 0.5)',

        // Warm text
        warm: {
          50: '#FBF9F6',
          100: '#F2EEE6',
          200: '#E6E0D6',
          300: '#D1C8BC',
          400: '#BDB3A6',
          500: '#9E9285',
          600: '#807569',
          700: '#635A50',
          800: '#474039',
          900: '#2B2622',
        },

        // Primary coral - Vibrant & Modern
        primary: {
          50: '#FFF0ED',
          100: '#FFE1DB',
          200: '#FFC2B8',
          300: '#FFA394',
          400: '#FF8570',
          500: '#FF664D', // More vibrant core
          600: '#E64D33',
          700: '#CC3A21',
          800: '#B32D17',
          900: '#8C1F0D',
        },

        // Status colors refined
        'status-idea': {
          50: '#FFFCF0',
          100: '#FFF6D6',
          500: '#F5BE47',
          700: '#B8861B',
        },
        'status-success': {
          50: '#F2FCF4',
          100: '#DDF5E1',
          500: '#57C264',
          700: '#3A8F45',
        },
        'status-warning': {
          50: '#FFF5F2',
          100: '#FFE0D6',
          500: '#FF7D57',
          700: '#CC4E29',
        },
        'status-progress': {
          50: '#F7F5FC',
          100: '#EBE6F7',
          500: '#9B82CF',
          700: '#6B529E',
        },

        // Borders
        'border-subtle': 'rgba(0, 0, 0, 0.04)',
        'border-medium': 'rgba(0, 0, 0, 0.08)',
        'border-strong': 'rgba(0, 0, 0, 0.12)',
        
        // Glass borders
        'glass-border': 'rgba(255, 255, 255, 0.4)',
        'glass-border-strong': 'rgba(255, 255, 255, 0.6)',

        // Overlays
        'overlay-light': 'rgba(0, 0, 0, 0.02)',
        'overlay-medium': 'rgba(0, 0, 0, 0.05)',
        'overlay-strong': 'rgba(0, 0, 0, 0.4)',
      },

      fontFamily: {
        sans: [
          'SF Pro Rounded',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'Nunito',
          'sans-serif',
        ],
      },

      fontSize: {
        'display-large': ['3.5rem', { lineHeight: '1.1', letterSpacing: '-0.02em', fontWeight: '800' }],
        'display-medium': ['2.5rem', { lineHeight: '1.15', letterSpacing: '-0.015em', fontWeight: '800' }],
        'display-small': ['2rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-1': ['1.75rem', { lineHeight: '1.2', letterSpacing: '-0.01em', fontWeight: '700' }],
        'heading-2': ['1.5rem', { lineHeight: '1.3', letterSpacing: '-0.01em', fontWeight: '600' }],
        'heading-3': ['1.25rem', { lineHeight: '1.4', letterSpacing: '-0.005em', fontWeight: '600' }],
        'body-large': ['1.0625rem', { lineHeight: '1.6', fontWeight: '400' }],
        'body-medium': ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }],
        'body-small': ['0.8125rem', { lineHeight: '1.4', fontWeight: '500' }],
        'label-large': ['0.9375rem', { lineHeight: '1.4', fontWeight: '600' }],
        'label-small': ['0.75rem', { lineHeight: '1.3', fontWeight: '600', letterSpacing: '0.01em' }],
      },

      boxShadow: {
        'subtle': '0 2px 8px -2px rgba(0, 0, 0, 0.05), 0 0 1px rgba(0, 0, 0, 0.04)',
        'low': '0 4px 12px -2px rgba(0, 0, 0, 0.08), 0 0 1px rgba(0, 0, 0, 0.04)',
        'medium': '0 8px 24px -4px rgba(0, 0, 0, 0.12), 0 0 1px rgba(0, 0, 0, 0.04)',
        'high': '0 16px 48px -8px rgba(0, 0, 0, 0.16), 0 0 1px rgba(0, 0, 0, 0.04)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-inset': 'inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        'glow': '0 0 20px rgba(255, 102, 77, 0.3)',
      },

      borderRadius: {
        'small': '0.625rem',    // 10px
        'medium': '0.875rem',   // 14px
        'large': '1.25rem',     // 20px
        'xlarge': '1.75rem',    // 28px
        '2xlarge': '2.25rem',   // 36px
        '3xlarge': '3rem',      // 48px
      },

      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUpFade: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        springIn: {
          '0%': { transform: 'scale(0.9)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },

      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up-fade': 'slideUpFade 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        'spring-in': 'springIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'shimmer': 'shimmer 2s infinite',
      },

      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}
export default config
