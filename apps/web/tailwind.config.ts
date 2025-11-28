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
        // Warm backgrounds
        'bg-base': '#FAF8F5',
        'bg-subtle': '#F5F2ED',
        'bg-elevated': '#FFFFFF',
        'surface-primary': '#FFFFFF',
        'surface-secondary': '#F5F2ED',
        'surface-tertiary': '#EBE7E0',

        // Warm text
        warm: {
          50: '#FAF8F5',
          100: '#F5F2ED',
          200: '#EBE7E0',
          300: '#D4CDC4',
          400: '#C4BDB7',
          500: '#A69C94',
          600: '#8A827C',
          700: '#5C534D',
          800: '#3D3632',
          900: '#2D2520',
        },

        // Primary coral
        primary: {
          50: '#FEF3F1',
          100: '#FDE5E0',
          200: '#FBC9BC',
          300: '#F5A894',
          400: '#EE8F76',
          500: '#E8846B',
          600: '#D66A51',
          700: '#B95440',
          800: '#9A4234',
          900: '#7D352B',
        },

        // Status: Idea/Shortlisted (Mustard)
        'status-idea': {
          50: '#FDF9F0',
          100: '#FAF1DC',
          200: '#F4E0B3',
          300: '#E8CC85',
          400: '#DCB85E',
          500: '#D4A853',
          600: '#B88F45',
          700: '#967538',
          800: '#735A2B',
          900: '#523F1F',
        },

        // Status: Purchased/Gifted (Sage)
        'status-success': {
          50: '#F3F7F2',
          100: '#E4EDE2',
          200: '#C5D8C1',
          300: '#A0BD9B',
          400: '#8AAA84',
          500: '#7BA676',
          600: '#668B61',
          700: '#51704E',
          800: '#3D543B',
          900: '#2A3928',
        },

        // Status: Urgent/Warning (Terracotta)
        'status-warning': {
          50: '#FEF5F3',
          100: '#FCE9E5',
          200: '#F6CEC5',
          300: '#EBAB9D',
          400: '#DD9179',
          500: '#C97B63',
          600: '#AC6350',
          700: '#8D4E40',
          800: '#6D3C31',
          900: '#4F2B23',
        },

        // Status: Progress/Buying (Lavender)
        'status-progress': {
          50: '#F7F5F9',
          100: '#EDE8F2',
          200: '#D6CBDF',
          300: '#B9A7C7',
          400: '#A08DB4',
          500: '#8A78A3',
          600: '#70628A',
          700: '#594E6E',
          800: '#433B53',
          900: '#2F2A3A',
        },

        // Borders
        'border-subtle': '#E8E3DC',
        'border-medium': '#D4CDC4',
        'border-strong': '#B8AFA4',

        // Overlays
        'overlay-light': 'rgba(45, 37, 32, 0.08)',
        'overlay-medium': 'rgba(45, 37, 32, 0.16)',
        'overlay-strong': 'rgba(45, 37, 32, 0.48)',
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
        'display-large': ['3rem', { lineHeight: '3.5rem', fontWeight: '800' }],
        'display-medium': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '800' }],
        'display-small': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }],
        'heading-1': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'heading-2': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
        'heading-3': ['1.125rem', { lineHeight: '1.625rem', fontWeight: '600' }],
        'body-large': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
        'body-medium': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'body-small': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
        'label-large': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'label-small': ['0.75rem', { lineHeight: '1rem', fontWeight: '600' }],
      },

      boxShadow: {
        'subtle': '0 1px 2px rgba(45, 37, 32, 0.04), 0 0 0 1px rgba(45, 37, 32, 0.02)',
        'low': '0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03)',
        'medium': '0 4px 16px rgba(45, 37, 32, 0.08), 0 1px 4px rgba(45, 37, 32, 0.04)',
        'high': '0 8px 32px rgba(45, 37, 32, 0.12), 0 2px 8px rgba(45, 37, 32, 0.06)',
        'extra-high': '0 16px 48px rgba(45, 37, 32, 0.16), 0 4px 16px rgba(45, 37, 32, 0.08)',
        'translucent': '0 4px 24px rgba(45, 37, 32, 0.10), 0 0 0 1px rgba(45, 37, 32, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.2)',
      },

      borderRadius: {
        'small': '0.5rem',    // 8px
        'medium': '0.75rem',  // 12px
        'large': '1rem',      // 16px
        'xlarge': '1.25rem',  // 20px
        '2xlarge': '1.5rem',  // 24px
        '3xlarge': '2rem',    // 32px
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
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(1rem)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },

      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 1.5s infinite',
      },

      minHeight: {
        'touch': '44px',
      },

      minWidth: {
        'touch': '44px',
      },
    },
  },
  plugins: [],
}
export default config
