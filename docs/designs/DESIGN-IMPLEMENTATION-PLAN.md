# Design Implementation Plan: Soft Modernity Aesthetic Update

**Document Version**: 1.0
**Date**: 2025-11-27
**Status**: Ready for Implementation
**Target Completion**: 4-6 weeks

---

## Executive Summary

This plan outlines the transformation of the Family Gifting Dashboard web app from a basic blue-primary design to the "Soft Modernity" aesthetic defined in `DESIGN-GUIDE.md` and `aesthetic-v1.md`. The update positions the app as an Apple-featured-quality experience with warm colors, hyper-rounded corners, diffused shadows, and sophisticated micro-interactions.

**Key Changes**:
- Color palette shift from blue to warm tones (coral primary, sage success, mustard idea)
- Border radius increase (12px → 16-32px for cards, buttons, modals)
- Shadow system overhaul (flat → diffused with warm undertones)
- Typography refinement (system fonts → SF Pro Rounded/Nunito)
- Layout updates (translucent sidebar, bottom nav, stat cards)
- Component-level styling (buttons, cards, badges, avatars, inputs)

**Complexity**: Large (L) - ~20-25 tasks, 4-6 weeks, multiple components
**Workflow Track**: Full Track (Opus-level planning + specialist execution)

---

## Current State Assessment

### Existing Design System

| Aspect | Current | Target | Gap |
|--------|---------|--------|-----|
| **Primary Color** | Blue #3b82f6 | Coral #E8846B | Complete replacement |
| **Backgrounds** | White #FFFFFF | Warm cream #FAF8F5 | System-wide change |
| **Text Color** | Black #0a0a0a | Warm brown #2D2520 | All text elements |
| **Border Radius** | 8px (md) | 16-32px (varies) | Component overhaul |
| **Shadows** | Basic box-shadow | Diffused warm shadows | Shadow system redesign |
| **Typography** | System default | SF Pro Rounded/Nunito | Font family addition |
| **Status Colors** | Blue variants | Mustard/Sage/Terracotta | New palette entirely |
| **Layout** | Flex nav | Translucent sidebar (desktop) | Navigation restructure |
| **Components** | CVA-based | CVA + new variants | Extensive updates |

### Current Component Inventory

**UI Components** (14 files):
- `button.tsx` - Primary button with variants (default, destructive, outline, secondary, ghost, link)
- `card.tsx` - Card with variants (default, elevated, interactive) and sub-components
- `badge.tsx` - Status badge component
- `avatar.tsx` - User avatar with optional status ring
- `input.tsx`, `textarea.tsx` - Form inputs
- `dialog.tsx` - Modal/dialog component
- `tabs.tsx` - Tabbed interface
- `skeleton.tsx` - Loading placeholder
- `spinner.tsx` - Loading spinner
- `toast.tsx`, `toaster.tsx`, `use-toast.tsx` - Toast notifications

**Layout Components** (6 files):
- `Shell.tsx` - Main app shell with responsive layout
- `Header.tsx` - Mobile header
- `DesktopNav.tsx` - Desktop sidebar
- `MobileNav.tsx` - Mobile bottom nav
- `PageHeader.tsx` - Page title section
- `icons.tsx` - Icon exports

### Design Debt

1. **Color System**: Blue-based palette requires complete replacement
2. **Shadow System**: Flat/basic shadows lack warmth and depth
3. **Border Radius**: Inconsistent sizing, too sharp for Soft Modernity
4. **Typography**: System fonts instead of rounded sans-serif
5. **Spacing**: Some inconsistencies with 8px grid
6. **Status Colors**: No semantic color mapping (idea, purchased, urgent)
7. **Layout**: Desktop sidebar not translucent, limited depth perception
8. **Components**: Buttons and cards lack gradient and elevation options

---

## Implementation Phases

### Phase 1: Foundation (Design Tokens & Configuration)

**Duration**: 3-4 days
**Complexity**: Small-Medium
**Dependencies**: None
**Deliverables**: Color system, typography, spacing, shadow system

#### 1.1 Update Tailwind Configuration

**File**: `apps/web/tailwind.config.ts`

**Changes**:
- Replace blue `primary` palette with coral color spectrum
- Add `warm` color palette (neutrals with warm undertones)
- Add status color palettes: `status-idea` (mustard), `status-success` (sage), `status-warning` (terracotta), `status-progress` (lavender)
- Add background colors: `bg-base` (#FAF8F5), `bg-subtle` (#F5F2ED)
- Update shadow definitions with diffused, warm-toned shadows
- Add custom border radius values (small, medium, large, xlarge, 2xlarge, 3xlarge)
- Configure font family to include SF Pro Rounded and Nunito fallbacks
- Add animation keyframes for micro-interactions

**Code Snippet**:
```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    screens: {
      'xs': '375px',
      'sm': '640px',
      'md': '768px',
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
        'translucent': `
          0 4px 24px rgba(45, 37, 32, 0.10),
          0 0 0 1px rgba(45, 37, 32, 0.04),
          inset 0 0 0 1px rgba(255, 255, 255, 0.2)
        `.trim(),
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
      },

      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-in-right': 'slideInRight 300ms ease-out',
        'scale-in': 'scaleIn 200ms ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
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
```

**Acceptance Criteria**:
- [ ] All color palettes defined in Tailwind config
- [ ] Typography scale matches design guide (display, heading, body, label)
- [ ] Shadow system has 5+ levels with warm undertones
- [ ] Border radius values available (small through 3xlarge)
- [ ] Spacing values use 8px grid
- [ ] Animation keyframes defined
- [ ] No TypeScript errors in config

#### 1.2 Update Global Styles

**File**: `apps/web/app/globals.css`

**Changes**:
- Replace CSS variables with new warm color palette
- Update background and foreground colors to warm tones
- Add animation keyframe definitions
- Update font-family to support SF Pro Rounded
- Add reduced motion media query for accessibility
- Update safe area utilities
- Add container queries support

**Code Snippet**:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@300;400;500;600;700;800&display=swap');

:root {
  /* Colors - Backgrounds */
  --color-bg-base: #FAF8F5;
  --color-bg-subtle: #F5F2ED;
  --color-bg-elevated: #FFFFFF;
  --color-surface-primary: #FFFFFF;
  --color-surface-secondary: #F5F2ED;
  --color-surface-tertiary: #EBE7E0;
  --color-surface-translucent: rgba(250, 248, 245, 0.8);

  /* Colors - Text */
  --color-text-primary: #2D2520;
  --color-text-secondary: #5C534D;
  --color-text-tertiary: #8A827C;
  --color-text-disabled: #C4BDB7;
  --color-text-inverse: #FFFFFF;

  /* Colors - Primary Coral */
  --color-primary-50: #FEF3F1;
  --color-primary-100: #FDE5E0;
  --color-primary-200: #FBC9BC;
  --color-primary-300: #F5A894;
  --color-primary-400: #EE8F76;
  --color-primary-500: #E8846B;
  --color-primary-600: #D66A51;
  --color-primary-700: #B95440;
  --color-primary-800: #9A4234;
  --color-primary-900: #7D352B;

  /* Spacing */
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-3: 0.75rem;  /* 12px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-5: 1.25rem;  /* 20px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */

  /* Shadows */
  --shadow-subtle: 0 1px 2px rgba(45, 37, 32, 0.04), 0 0 0 1px rgba(45, 37, 32, 0.02);
  --shadow-low: 0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03);
  --shadow-medium: 0 4px 16px rgba(45, 37, 32, 0.08), 0 1px 4px rgba(45, 37, 32, 0.04);
  --shadow-high: 0 8px 32px rgba(45, 37, 32, 0.12), 0 2px 8px rgba(45, 37, 32, 0.06);
  --shadow-extra-high: 0 16px 48px rgba(45, 37, 32, 0.16), 0 4px 16px rgba(45, 37, 32, 0.08);

  /* Radii */
  --radius-small: 0.5rem;    /* 8px */
  --radius-medium: 0.75rem;  /* 12px */
  --radius-large: 1rem;      /* 16px */
  --radius-xlarge: 1.25rem;  /* 20px */
  --radius-2xlarge: 1.5rem;  /* 24px */
  --radius-3xlarge: 2rem;    /* 32px */

  /* Typography */
  --font-family-base: 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, system-ui, 'Nunito', sans-serif;
  --font-size-display-large: 3rem;       /* 48px */
  --font-size-heading-1: 1.5rem;         /* 24px */
  --font-size-body-large: 1rem;          /* 16px */
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg-base: #0a0a0a;
    --color-text-primary: #FFFFFF;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html,
body {
  height: 100%;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

body {
  color: var(--color-text-primary);
  background: var(--color-bg-base);
  font-family: var(--font-family-base);
  line-height: 1.5;
}

/* Safe area utilities */
.safe-area-inset {
  padding-top: env(safe-area-inset-top);
  padding-left: env(safe-area-inset-left);
  padding-right: env(safe-area-inset-right);
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.safe-area-left {
  padding-left: env(safe-area-inset-left);
}

.safe-area-right {
  padding-right: env(safe-area-inset-right);
}

/* Dynamic viewport height for iOS */
.h-screen-safe {
  height: 100dvh;
}

/* Touch target enforcement */
.touch-target {
  min-height: 44px;
  min-width: 44px;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* Scrollbar styling */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-bg-base);
}

::-webkit-scrollbar-thumb {
  background: var(--color-border-medium);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-border-strong);
}

/* Focus ring styling */
:focus-visible {
  outline: 2px solid var(--color-primary-500);
  outline-offset: 2px;
}
```

**Acceptance Criteria**:
- [ ] CSS variables updated to warm color palette
- [ ] Font imports include SF Pro Rounded and Nunito
- [ ] Animation keyframes defined in CSS
- [ ] Safe area utilities functional
- [ ] Reduced motion media query present
- [ ] Global background is warm cream (#FAF8F5)
- [ ] Text color is warm brown (#2D2520)
- [ ] No color value hardcodes in utility classes

#### 1.3 Update Typography Tokens

**File**: `apps/web/lib/typography.ts` (NEW)

**Purpose**: Centralized typography token definitions for consistent scaling

**Code Snippet**:
```typescript
export const typography = {
  displayLarge: {
    fontSize: '3rem',
    lineHeight: '3.5rem',
    fontWeight: 800,
    letterSpacing: '-0.02em',
  },
  displayMedium: {
    fontSize: '2.25rem',
    lineHeight: '2.75rem',
    fontWeight: 800,
    letterSpacing: '-0.01em',
  },
  displaySmall: {
    fontSize: '1.75rem',
    lineHeight: '2.25rem',
    fontWeight: 700,
  },
  heading1: {
    fontSize: '1.5rem',
    lineHeight: '2rem',
    fontWeight: 700,
  },
  heading2: {
    fontSize: '1.25rem',
    lineHeight: '1.75rem',
    fontWeight: 600,
  },
  heading3: {
    fontSize: '1.125rem',
    lineHeight: '1.625rem',
    fontWeight: 600,
  },
  bodyLarge: {
    fontSize: '1rem',
    lineHeight: '1.5rem',
    fontWeight: 400,
  },
  bodyMedium: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 400,
  },
  bodySmall: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 500,
  },
  labelLarge: {
    fontSize: '0.875rem',
    lineHeight: '1.25rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  labelSmall: {
    fontSize: '0.75rem',
    lineHeight: '1rem',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
} as const;
```

**Acceptance Criteria**:
- [ ] All typography tokens defined with size, line-height, weight
- [ ] Tokens match design guide specifications
- [ ] Export available for component usage
- [ ] No TypeScript errors

#### 1.4 Create Color Constants

**File**: `apps/web/lib/colors.ts` (NEW)

**Purpose**: Centralized color palette for consistent usage across components

**Code Snippet**:
```typescript
export const colors = {
  // Backgrounds
  bgBase: '#FAF8F5',
  bgSubtle: '#F5F2ED',
  bgElevated: '#FFFFFF',

  // Surfaces
  surfacePrimary: '#FFFFFF',
  surfaceSecondary: '#F5F2ED',
  surfaceTertiary: '#EBE7E0',
  surfaceTranslucent: 'rgba(250, 248, 245, 0.8)',

  // Text
  textPrimary: '#2D2520',
  textSecondary: '#5C534D',
  textTertiary: '#8A827C',
  textDisabled: '#C4BDB7',
  textInverse: '#FFFFFF',

  // Primary (Coral)
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

  // Status: Idea (Mustard)
  statusIdea: {
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

  // Status: Success (Sage)
  statusSuccess: {
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

  // Status: Warning (Terracotta)
  statusWarning: {
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

  // Status: Progress (Lavender)
  statusProgress: {
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
  borderSubtle: '#E8E3DC',
  borderMedium: '#D4CDC4',
  borderStrong: '#B8AFA4',
  borderFocus: '#E8846B',

  // Overlays
  overlayLight: 'rgba(45, 37, 32, 0.08)',
  overlayMedium: 'rgba(45, 37, 32, 0.16)',
  overlayStrong: 'rgba(45, 37, 32, 0.48)',
} as const;

export type ColorKey = keyof typeof colors;
```

**Acceptance Criteria**:
- [ ] All color palettes defined as constants
- [ ] TypeScript types properly exported
- [ ] No hardcoded color strings in constants
- [ ] Exported and usable in components

---

### Phase 2: Core Components (UI Styling)

**Duration**: 5-7 days
**Complexity**: Medium-Large
**Dependencies**: Phase 1 complete
**Deliverables**: Updated Button, Card, Badge, Avatar, Input, Dialog components

#### 2.1 Update Button Component

**File**: `apps/web/components/ui/button.tsx`

**Changes**:
- Update primary variant to use coral color (#E8846B) instead of blue
- Add new secondary variant (ghost with warm border)
- Update shadows to use diffused warm shadow system
- Increase border radius (md → large/16px)
- Add elevation on hover (shadow-low → shadow-medium)
- Update focus ring styling
- Add new size options (extra-large for hero buttons)
- Implement smooth transitions with ease-out timing

**Key Updates**:
```typescript
const buttonVariants = cva(
  // Base: increased touch target, better transitions
  'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px] min-w-[44px]',
  {
    variants: {
      variant: {
        // Primary: Coral with elevation
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 shadow-low hover:shadow-medium active:shadow-subtle focus:ring-primary-500 focus:ring-offset-bg-base',

        // Secondary: Ghost with warm border
        secondary: 'bg-transparent text-warm-900 border-2 border-warm-300 hover:bg-warm-100 hover:border-warm-400 active:bg-warm-200 focus:ring-primary-500',

        // Ghost: Minimal background
        ghost: 'bg-transparent text-warm-900 hover:bg-warm-100 active:bg-warm-200 focus:ring-primary-500',

        // Tertiary: Text only
        tertiary: 'bg-transparent text-primary-600 hover:text-primary-700 hover:bg-warm-100 active:bg-warm-200 focus:ring-primary-500 focus:ring-offset-1',

        // Danger: Terracotta for destructive actions
        destructive: 'bg-status-warning-500 text-white hover:bg-status-warning-600 active:bg-status-warning-700 shadow-low hover:shadow-medium focus:ring-status-warning-500',
      },
      size: {
        sm: 'px-4 py-2 text-body-small rounded-medium h-8',
        md: 'px-6 py-3 text-label-large rounded-large h-11',
        lg: 'px-8 py-4 text-heading-3 rounded-xlarge h-13',
        xl: 'px-10 py-5 text-display-small rounded-2xlarge h-16',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);
```

**Acceptance Criteria**:
- [ ] Primary button uses coral color (#E8846B)
- [ ] Hover state increases shadow (low → medium)
- [ ] Active state decreases shadow (medium → subtle)
- [ ] Border radius is 16px (large) for default
- [ ] All variants have proper focus ring styling
- [ ] Touch target minimum is 44px
- [ ] Transitions are smooth (200ms ease-out)
- [ ] No blue colors remain in button variants
- [ ] New size variants available (sm, md, lg, xl)

#### 2.2 Update Card Component

**File**: `apps/web/components/ui/card.tsx`

**Changes**:
- Update background from white to surface-primary with warm undertones
- Increase border radius (lg → xlarge/20px for default)
- Update shadows to use new diffused system
- Add interactive variant with hover elevation and scale
- Add stat card variant (larger with gradients)
- Add flat card variant (secondary surface with subtle shadow)
- Update border colors to use warm palette
- Add transitions for interactive states

**Key Updates**:
```typescript
const cardVariants = cva(
  'bg-surface-primary rounded-xlarge border transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        // Default: Elevated with soft shadow
        default: 'border-border-subtle shadow-low',

        // Elevated: Hover elevation on interactive cards
        elevated: 'border-border-subtle shadow-low hover:shadow-medium',

        // Interactive: Clickable with scale effect
        interactive: 'border-border-subtle shadow-low hover:shadow-medium hover:border-border-medium active:shadow-subtle cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]',

        // Stat Card: Large with gradient background
        stat: 'border-2 shadow-medium p-8 bg-gradient-to-br',

        // Flat: Minimal elevation
        flat: 'bg-surface-secondary border-border-subtle shadow-subtle',
      },
      padding: {
        none: 'p-0',
        sm: 'p-5',
        md: 'p-6',
        lg: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'md',
    },
  }
);
```

**Acceptance Criteria**:
- [ ] Card background is surface-primary (white)
- [ ] Default border radius is 20px (xlarge)
- [ ] Shadow system uses diffused warm shadows
- [ ] Hover state increases shadow and border visibility
- [ ] Active state decreases shadow slightly
- [ ] Interactive cards have subtle scale effect (1% zoom)
- [ ] Stat variant supports gradient backgrounds
- [ ] Flat variant uses secondary surface
- [ ] All padding options available (none, sm, md, lg)

#### 2.3 Update Badge Component

**File**: `apps/web/components/ui/badge.tsx`

**Changes**:
- Create semantic status badge variants (idea, purchased, urgent, progress)
- Update colors to match status palette (mustard, sage, terracotta, lavender)
- Add dot indicator with status color
- Increase border radius (rounded-full → 8px/small)
- Update padding and typography
- Add text transform for labels (uppercase)
- Implement proper spacing and alignment

**Code Snippet**:
```typescript
const badgeVariants = cva(
  'inline-flex items-center gap-1.5 px-3 py-1.5 text-label-small font-semibold rounded-small border transition-all duration-200',
  {
    variants: {
      variant: {
        // Idea/Shortlisted - Mustard
        idea: 'bg-status-idea-100 text-status-idea-800 border-status-idea-300',

        // Purchased/Gifted - Sage
        purchased: 'bg-status-success-100 text-status-success-800 border-status-success-300',

        // Buying/Ordered - Lavender
        progress: 'bg-status-progress-100 text-status-progress-800 border-status-progress-300',

        // Urgent - Terracotta
        urgent: 'bg-status-warning-100 text-status-warning-800 border-status-warning-300',
      },
    },
    defaultVariants: {
      variant: 'idea',
    },
  }
);

export function Badge({ variant, children, ...props }: BadgeProps) {
  const getIndicatorColor = (variant: BadgeVariant) => {
    const colors = {
      idea: 'bg-status-idea-600',
      purchased: 'bg-status-success-600',
      progress: 'bg-status-progress-600',
      urgent: 'bg-status-warning-600',
    };
    return colors[variant];
  };

  return (
    <span className={badgeVariants({ variant, ...props })}>
      <span className={`w-1.5 h-1.5 rounded-full ${getIndicatorColor(variant)}`} />
      {children}
    </span>
  );
}
```

**Acceptance Criteria**:
- [ ] Status variants map to correct colors (idea=mustard, purchased=sage, etc.)
- [ ] Dot indicator color matches status color
- [ ] Border radius is 8px (small)
- [ ] Padding is 12px horizontal, 6px vertical
- [ ] Text is uppercase with proper letter spacing
- [ ] Font size is 12px (label-small)
- [ ] All four status types have variants

#### 2.4 Update Avatar Component

**File**: `apps/web/components/ui/avatar.tsx`

**Changes**:
- Update border color to white
- Add status ring support with warm gradient
- Implement proper sizing scale (24px to 80px)
- Add optional status indicator dot
- Update shadow styling
- Add fallback styling for initials/text

**Code Snippet**:
```typescript
interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  status?: 'active' | 'inactive' | 'away';
  badge?: number;
  withRing?: boolean;
}

const sizeMap = {
  xs: 'w-6 h-6',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-14 h-14',
  xl: 'w-20 h-20',
};

export function Avatar({
  src,
  alt,
  size = 'md',
  status,
  badge,
  withRing = false,
  ...props
}: AvatarProps) {
  return (
    <div className="relative inline-block" {...props}>
      {/* Status ring background */}
      {withRing && (
        <div className="absolute inset-0 -m-0.5 rounded-full bg-gradient-to-br from-status-success-400 to-status-success-600 animate-pulse" />
      )}

      {/* Avatar image */}
      <img
        src={src}
        alt={alt}
        className={cn(
          sizeMap[size],
          'rounded-full border-2 border-white shadow-low relative object-cover'
        )}
      />

      {/* Status indicator */}
      {status && (
        <span
          className={cn(
            'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
            status === 'active' && 'bg-status-success-500',
            status === 'away' && 'bg-status-idea-500',
            status === 'inactive' && 'bg-border-medium'
          )}
        />
      )}

      {/* Badge (e.g., gift count) */}
      {badge && (
        <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center border-2 border-white shadow-medium">
          {badge}
        </span>
      )}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Avatar border is white (2px)
- [ ] Shadow is soft (shadow-low)
- [ ] Size scale available (xs through xl)
- [ ] Status ring uses gradient (sage green)
- [ ] Status indicator dots positioned correctly
- [ ] Badge positioning at bottom-right
- [ ] All sizes scale properly from 24px to 80px

#### 2.5 Update Input Component

**File**: `apps/web/components/ui/input.tsx`

**Changes**:
- Update background to white (surface-primary)
- Update border to warm palette
- Increase border radius (rounded → medium/12px)
- Update focus state styling (border color change + glow effect)
- Update placeholder color to warm-400
- Add proper padding (16px horizontal, 12px vertical)
- Update label styling
- Add error state styling

**Key Updates**:
```typescript
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helpText, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block mb-2 text-body-small font-semibold text-warm-800 uppercase tracking-wide">
            {label}
          </label>
        )}

        <input
          ref={ref}
          className={cn(
            // Base
            'w-full px-4 py-3 bg-white text-body-large text-warm-900 font-normal placeholder-warm-400',

            // Border
            'border-2 border-border-medium rounded-medium shadow-subtle',

            // Focus
            'focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200',

            // Transitions
            'transition-all duration-200 ease-out',

            // Error state
            error && 'border-status-warning-500 focus:ring-status-warning-200',

            // Disabled
            'disabled:bg-warm-100 disabled:text-warm-500 disabled:border-warm-300',

            className
          )}
          {...props}
        />

        {helpText && (
          <p className={cn(
            'mt-1 text-body-small',
            error ? 'text-status-warning-600' : 'text-warm-600'
          )}>
            {helpText}
          </p>
        )}
      </div>
    );
  }
);
```

**Acceptance Criteria**:
- [ ] Input background is white (surface-primary)
- [ ] Border is 2px warm palette color
- [ ] Border radius is 12px (medium)
- [ ] Focus state has blue glow (ring-2 ring-primary-200)
- [ ] Placeholder color is warm-400
- [ ] Padding is 16px x 12px
- [ ] Label text is uppercase with tracking
- [ ] Error state styling implemented
- [ ] Transitions are smooth (200ms)

#### 2.6 Create Status Pill Component

**File**: `apps/web/components/ui/status-pill.tsx` (NEW)

**Purpose**: Semantic status indicator with color-coded variants

**Code Snippet**:
```typescript
interface StatusPillProps extends React.HTMLAttributes<HTMLSpanElement> {
  status: 'idea' | 'shortlisted' | 'buying' | 'ordered' | 'purchased' | 'delivered' | 'gifted' | 'urgent';
  withDot?: boolean;
}

const statusConfig = {
  idea: { bg: 'bg-status-idea-100', text: 'text-status-idea-800', border: 'border-status-idea-300', dot: 'bg-status-idea-600' },
  shortlisted: { bg: 'bg-status-idea-100', text: 'text-status-idea-800', border: 'border-status-idea-300', dot: 'bg-status-idea-600' },
  buying: { bg: 'bg-status-progress-100', text: 'text-status-progress-800', border: 'border-status-progress-300', dot: 'bg-status-progress-600' },
  ordered: { bg: 'bg-status-progress-100', text: 'text-status-progress-800', border: 'border-status-progress-300', dot: 'bg-status-progress-600' },
  purchased: { bg: 'bg-status-success-100', text: 'text-status-success-800', border: 'border-status-success-300', dot: 'bg-status-success-600' },
  delivered: { bg: 'bg-status-success-100', text: 'text-status-success-800', border: 'border-status-success-300', dot: 'bg-status-success-600' },
  gifted: { bg: 'bg-status-success-100', text: 'text-status-success-800', border: 'border-status-success-300', dot: 'bg-status-success-600' },
  urgent: { bg: 'bg-status-warning-100', text: 'text-status-warning-800', border: 'border-status-warning-300', dot: 'bg-status-warning-600' },
};

export function StatusPill({ status, withDot = true, className, ...props }: StatusPillProps) {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 text-label-small font-semibold rounded-small border transition-all duration-200',
        config.bg,
        config.text,
        config.border,
        className
      )}
      {...props}
    >
      {withDot && (
        <span className={cn('w-1.5 h-1.5 rounded-full', config.dot)} />
      )}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
```

**Acceptance Criteria**:
- [ ] All 8 status types have correct color mapping
- [ ] Dot indicator color matches status
- [ ] Styling consistent with badge component
- [ ] Transitions smooth for status changes

---

### Phase 3: Layout Components

**Duration**: 4-5 days
**Complexity**: Medium
**Dependencies**: Phase 1-2 complete
**Deliverables**: Updated Shell, DesktopNav, MobileNav, PageHeader

#### 3.1 Update Shell Layout

**File**: `apps/web/components/layout/Shell.tsx`

**Changes**:
- Update background to warm cream (#FAF8F5)
- Update mobile header background with safe area support
- Implement translucent sidebar on desktop (backdrop blur)
- Update bottom nav with translucent effect
- Adjust padding and margins for warm spacing
- Update border colors to warm palette

**Key Updates**:
```typescript
export function Shell({ children }: ShellProps) {
  return (
    <div className="flex h-screen flex-col md:flex-row overflow-hidden bg-bg-base">
      {/* Mobile Header - Hidden on desktop */}
      <div className="md:hidden sticky top-0 z-50 bg-surface-primary safe-area-top border-b border-border-subtle">
        <Header />
      </div>

      {/* Desktop Sidebar - Translucent with blur */}
      <div className="hidden md:flex md:w-60 md:flex-shrink-0 md:flex-col">
        <DesktopNav />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto bg-bg-base">
        {/* Content wrapper with padding and safe areas */}
        <div className="pb-20 md:pb-0">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation - Hidden on desktop, translucent */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-translucent backdrop-blur-lg border-t border-border-subtle shadow-high safe-area-bottom">
        <MobileNav />
      </div>

      {/* Quick Add FAB */}
      <QuickAddButton variant="fab" />
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Main background is warm cream (#FAF8F5)
- [ ] Mobile header has safe area support
- [ ] Desktop sidebar has translucent effect (backdrop blur)
- [ ] Bottom nav is translucent with blur
- [ ] Borders are warm palette colors
- [ ] Responsive behavior maintained
- [ ] Safe area padding for mobile devices

#### 3.2 Update DesktopNav Sidebar

**File**: `apps/web/components/layout/DesktopNav.tsx`

**Changes**:
- Make sidebar translucent with backdrop blur
- Update background to surface-translucent with 80% opacity
- Add subtle inset border highlight
- Update text colors to warm palette
- Update active nav item styling (coral accent)
- Increase padding for breathing room
- Update shadows to translucent system
- Add smooth transitions for nav items

**Key Updates**:
```typescript
export function DesktopNav() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-60 bg-surface-translucent backdrop-blur-lg border-r border-border-subtle shadow-translucent overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-6 flex-shrink-0">
        <h1 className="text-heading-2 font-bold text-warm-900">
          Family Gifting
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.id}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.href)}
          />
        ))}
      </nav>

      {/* Footer (optional) */}
      <div className="p-6 flex-shrink-0 border-t border-border-subtle">
        <UserMenu />
      </div>
    </aside>
  );
}

function NavLink({ href, icon, label, isActive }: NavLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-4 py-3 rounded-large font-semibold text-label-large transition-all duration-200 ease-out',
        isActive
          ? 'bg-primary-100 text-primary-600 shadow-subtle'
          : 'text-warm-700 hover:bg-warm-100 hover:text-warm-900'
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
```

**Acceptance Criteria**:
- [ ] Sidebar background is translucent surface-translucent
- [ ] Backdrop blur effect is 12px (blur-lg)
- [ ] Border is 1px subtle
- [ ] Shadow is translucent system shadow
- [ ] Active nav items use coral color
- [ ] Nav items have rounded corners (16px)
- [ ] Smooth transitions (200ms)
- [ ] Text is warm palette colors

#### 3.3 Update MobileNav Bottom Navigation

**File**: `apps/web/components/layout/MobileNav.tsx`

**Changes**:
- Make translucent with backdrop blur (like sidebar)
- Update background to surface-translucent
- Ensure proper safe area for home indicator
- Update active state styling (coral background)
- Increase touch targets (44px minimum)
- Update icon and label colors to warm palette
- Add subtle transitions

**Key Updates**:
```typescript
export function MobileNav() {
  return (
    <nav className="bg-surface-translucent backdrop-blur-lg border-t border-border-subtle">
      <div className="flex items-center justify-around px-2 py-2">
        {navItems.map((item) => (
          <NavButton
            key={item.id}
            href={item.href}
            icon={item.icon}
            label={item.label}
            isActive={isActive(item.href)}
          />
        ))}
      </div>
    </nav>
  );
}

function NavButton({ href, icon, label, isActive }: NavButtonProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex flex-col items-center gap-1 px-4 py-2 rounded-medium min-h-[44px] min-w-[44px] transition-all duration-200 ease-out',
        isActive
          ? 'text-primary-600 bg-primary-100'
          : 'text-warm-600 hover:bg-warm-100'
      )}
    >
      {icon}
      <span className="text-xs font-semibold text-center">{label}</span>
    </Link>
  );
}
```

**Acceptance Criteria**:
- [ ] Bottom nav is translucent with blur
- [ ] Safe area inset for home indicator
- [ ] Touch targets are 44px minimum
- [ ] Active state uses coral color
- [ ] Icons and labels visible
- [ ] Smooth transitions (200ms)

#### 3.4 Update PageHeader Component

**File**: `apps/web/components/layout/PageHeader.tsx`

**Changes**:
- Update background color
- Increase padding for breathing room
- Update typography to use warm colors
- Add optional breadcrumb support
- Update divider/border colors
- Add action area with proper spacing

**Code Snippet**:
```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="px-6 py-8 bg-bg-base border-b border-border-subtle">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <h1 className="text-display-medium font-heavy text-warm-900 mb-2">
            {title}
          </h1>
          {subtitle && (
            <p className="text-body-large text-warm-600">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <div className="flex-shrink-0">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Background is warm cream
- [ ] Title uses display-medium (48px)
- [ ] Subtitle is body-large
- [ ] Colors are warm palette
- [ ] Action area properly spaced
- [ ] Responsive on mobile/desktop

---

### Phase 4: Feature Components & Patterns

**Duration**: 5-6 days
**Complexity**: Medium
**Dependencies**: Phase 1-3 complete
**Deliverables**: Stat cards, avatar carousel, gift cards, kanban columns

#### 4.1 Create Stat Card Component

**File**: `apps/web/components/features/dashboard/StatCard.tsx` (NEW)

**Purpose**: Large colored cards for dashboard statistics with gradient backgrounds

**Code Snippet**:
```typescript
interface StatCardProps {
  count: number | string;
  label: string;
  color: 'primary' | 'idea' | 'success' | 'warning';
  icon?: React.ReactNode;
}

const colorConfig = {
  primary: 'from-primary-50 to-primary-100 border-primary-200 text-primary-600',
  idea: 'from-status-idea-50 to-status-idea-100 border-status-idea-200 text-status-idea-600',
  success: 'from-status-success-50 to-status-success-100 border-status-success-200 text-status-success-600',
  warning: 'from-status-warning-50 to-status-warning-100 border-status-warning-200 text-status-warning-600',
};

export function StatCard({ count, label, color, icon }: StatCardProps) {
  return (
    <div className={cn(
      'p-8 rounded-2xlarge shadow-medium border-2 bg-gradient-to-br',
      colorConfig[color]
    )}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-display-large font-heavy mb-2">
            {count}
          </div>
          <div className="text-body-small font-semibold uppercase tracking-wide">
            {label}
          </div>
        </div>
        {icon && (
          <div className="text-4xl opacity-50">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Large number display (display-large)
- [ ] Gradient background based on color
- [ ] Small label (body-small, uppercase)
- [ ] Padding is 32px (spacing-8)
- [ ] Border radius is 24px (2xlarge)
- [ ] Border is 2px color-specific
- [ ] Shadow is medium
- [ ] Optional icon support

#### 4.2 Create Avatar Carousel Component

**File**: `apps/web/components/features/dashboard/AvatarCarousel.tsx` (NEW)

**Purpose**: Horizontal scrolling carousel of people with status rings and gift counts

**Code Snippet**:
```typescript
interface AvatarCarouselProps {
  people: Array<{
    id: string;
    name: string;
    avatar: string;
    giftCount: number;
  }>;
}

export function AvatarCarousel({ people }: AvatarCarouselProps) {
  return (
    <div className="p-6 bg-surface-primary rounded-xlarge shadow-low border border-border-subtle">
      <h2 className="text-heading-2 font-bold text-warm-900 mb-6">
        Family Members
      </h2>

      <div className="flex gap-8 overflow-x-auto pb-2">
        {people.map((person) => (
          <div key={person.id} className="flex-shrink-0 text-center">
            {/* Avatar with status ring */}
            <div className="relative inline-block mb-4">
              {/* Status ring gradient */}
              <div className="absolute inset-0 -m-1 rounded-full bg-gradient-to-br from-status-success-400 to-status-success-600 animate-pulse" />

              {/* Avatar */}
              <img
                src={person.avatar}
                alt={person.name}
                className="relative w-20 h-20 rounded-full border-4 border-white shadow-low object-cover"
              />

              {/* Gift count badge */}
              <span className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary-500 text-white text-xs font-bold flex items-center justify-center border-3 border-white shadow-medium">
                {person.giftCount}
              </span>
            </div>

            <div className="text-body-small font-semibold text-warm-900 max-w-[80px] truncate">
              {person.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Horizontal scroll layout
- [ ] Avatar size 80px with white border (4px)
- [ ] Status ring with sage gradient
- [ ] Gift count badge (coral background)
- [ ] Card has shadow-low
- [ ] Border radius is xlarge (20px)
- [ ] Names displayed below avatars
- [ ] Smooth scrolling experience

#### 4.3 Create Gift Card Component

**File**: `apps/web/components/features/gifts/GiftCard.tsx` (NEW)

**Purpose**: Card for individual gift items with image, title, price, and status

**Code Snippet**:
```typescript
interface GiftCardProps {
  id: string;
  image?: string;
  title: string;
  price: number;
  status: 'idea' | 'shortlisted' | 'buying' | 'ordered' | 'purchased' | 'gifted';
  personAvatar?: string;
  onStatusChange?: (status: string) => void;
}

export function GiftCard({
  id,
  image,
  title,
  price,
  status,
  personAvatar,
  onStatusChange,
}: GiftCardProps) {
  return (
    <div className="p-4 bg-surface-primary rounded-large shadow-low hover:shadow-medium border border-border-subtle cursor-pointer transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]">
      {/* Image */}
      {image && (
        <img
          src={image}
          alt={title}
          className="w-full h-32 object-cover rounded-medium mb-3"
        />
      )}

      {/* Content */}
      <h3 className="text-heading-3 font-semibold text-warm-900 mb-3 line-clamp-2">
        {title}
      </h3>

      {/* Footer */}
      <div className="flex items-center justify-between gap-3">
        <span className="text-body-medium font-semibold text-warm-700">
          ${price.toFixed(2)}
        </span>

        <div className="flex items-center gap-2">
          {personAvatar && (
            <img
              src={personAvatar}
              alt="Person"
              className="w-6 h-6 rounded-full border border-white shadow-low"
            />
          )}

          <StatusPill status={status} />
        </div>
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Card size appropriate for grid layout
- [ ] Image display with rounded corners
- [ ] Title is heading-3
- [ ] Price formatted with dollar sign
- [ ] Status pill displayed
- [ ] Person avatar shown
- [ ] Hover state with elevation
- [ ] Click/scale interaction

#### 4.4 Create Kanban Column Component

**File**: `apps/web/components/features/lists/KanbanColumn.tsx` (NEW)

**Purpose**: Column for kanban board showing status groups with draggable cards

**Code Snippet**:
```typescript
interface KanbanColumnProps {
  status: 'idea' | 'shortlisted' | 'buying' | 'purchased' | 'gifted';
  title: string;
  count: number;
  gifts: Array<{
    id: string;
    title: string;
    image?: string;
    price: number;
    personAvatar?: string;
  }>;
  onCardClick?: (giftId: string) => void;
}

const statusColors = {
  idea: { bg: 'from-status-idea-100 to-status-idea-50', border: 'border-status-idea-400', text: 'text-status-idea-900' },
  shortlisted: { bg: 'from-status-idea-100 to-status-idea-50', border: 'border-status-idea-400', text: 'text-status-idea-900' },
  buying: { bg: 'from-status-progress-100 to-status-progress-50', border: 'border-status-progress-400', text: 'text-status-progress-900' },
  purchased: { bg: 'from-status-success-100 to-status-success-50', border: 'border-status-success-400', text: 'text-status-success-900' },
  gifted: { bg: 'from-status-success-100 to-status-success-50', border: 'border-status-success-400', text: 'text-status-success-900' },
};

export function KanbanColumn({
  status,
  title,
  count,
  gifts,
  onCardClick,
}: KanbanColumnProps) {
  const colors = statusColors[status];

  return (
    <div className="flex-shrink-0 w-80">
      {/* Header */}
      <div className={cn(
        'px-4 py-3 bg-gradient-to-r rounded-t-large border-b-4',
        colors.bg,
        colors.border
      )}>
        <h3 className={cn('text-heading-3 font-semibold', colors.text)}>
          {title}
          <span className="ml-2 text-body-small opacity-75">
            ({count})
          </span>
        </h3>
      </div>

      {/* Cards container */}
      <div className={cn(
        'p-4 space-y-3 rounded-b-large min-h-[400px]',
        'bg-opacity-30',
        colors.bg
      )}>
        {gifts.map((gift) => (
          <div
            key={gift.id}
            onClick={() => onCardClick?.(gift.id)}
            className="cursor-pointer"
          >
            <GiftCard
              {...gift}
              status={status}
            />
          </div>
        ))}

        {gifts.length === 0 && (
          <div className="flex items-center justify-center h-40 text-body-medium text-warm-500">
            No gifts yet
          </div>
        )}
      </div>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Column width is 320px (w-80)
- [ ] Header has gradient background and border
- [ ] Count displayed in header
- [ ] Cards stack vertically with spacing
- [ ] Minimum height for empty state
- [ ] Proper rounded corners
- [ ] Gift cards clickable
- [ ] Responsive color scheme

---

### Phase 5: Polish & Animations

**Duration**: 3-4 days
**Complexity**: Small-Medium
**Dependencies**: Phase 1-4 complete
**Deliverables**: Micro-interactions, loading states, error handling, animation refinements

#### 5.1 Add Animation Keyframes

**File**: Update `app/globals.css`

**Changes**:
- Define smooth animation keyframes
- Add easing function variables
- Create micro-interaction animations (scale, fade, slide)
- Implement loading spinner animation
- Add status change animation

**Additions**:
```css
/* Easing functions */
:root {
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Status change animation */
@keyframes statusChange {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

.animate-status-change {
  animation: statusChange 300ms var(--ease-spring);
}

/* Hover elevation */
@keyframes elevate {
  0% {
    transform: translateY(0);
  }
  100% {
    transform: translateY(-2px);
  }
}

.hover:animate-elevate {
  animation: elevate 200ms var(--ease-out) forwards;
}
```

**Acceptance Criteria**:
- [ ] Animation keyframes defined for all interactions
- [ ] Easing functions match design guide
- [ ] Duration times appropriate (150-300ms)
- [ ] Micro-interactions feel smooth
- [ ] No jank or janky transitions

#### 5.2 Update Component Interactions

**Changes**:
- Add hover elevation to interactive cards
- Add press/active scale effects
- Add loading state animations
- Add error state styling
- Add success state feedback

**Code Pattern**:
```typescript
// Card hover elevation
className={cn(
  'transition-all duration-200 ease-out',
  'shadow-low hover:shadow-medium hover:-translate-y-0.5 active:shadow-subtle active:translate-y-0'
)}

// Button press animation
className={cn(
  'transition-all duration-200 ease-out',
  'active:scale-95'
)}

// Loading spinner
className={cn(
  'animate-spin',
  'border-4 border-warm-200 border-t-primary-500'
)}
```

**Acceptance Criteria**:
- [ ] All interactive elements have hover states
- [ ] Elevation transitions are smooth
- [ ] Loading states are visible
- [ ] Error states are clearly indicated
- [ ] Success feedback is provided

#### 5.3 Create Loading & Error Components

**File**: Update component patterns

**Changes**:
- Add skeleton loading state components
- Create error boundary fallbacks
- Add retry functionality
- Create empty state displays
- Add connection status indicators

**Code Snippet**:
```typescript
// Loading skeleton
export function CardSkeleton() {
  return (
    <div className="p-6 bg-surface-primary rounded-xlarge animate-pulse">
      <div className="h-6 bg-warm-200 rounded-medium w-3/4 mb-3" />
      <div className="h-4 bg-warm-200 rounded-medium w-full mb-2" />
      <div className="h-4 bg-warm-200 rounded-medium w-5/6" />
    </div>
  );
}

// Error state
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-5xl mb-4">⚠️</div>
      <h3 className="text-heading-2 font-bold text-warm-900 mb-2">
        Something went wrong
      </h3>
      <p className="text-body-medium text-warm-600 mb-6 max-w-md">
        {message}
      </p>
      <Button onClick={onRetry}>
        Try Again
      </Button>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Skeleton loaders use warm color palette
- [ ] Error states are clearly visible
- [ ] Retry buttons present and functional
- [ ] Empty states provide helpful messaging
- [ ] Connection status visible when relevant

---

## Implementation Sequence & Dependencies

```
Phase 1: Foundation
├── 1.1 Tailwind Config
├── 1.2 Global Styles
├── 1.3 Typography Tokens
└── 1.4 Color Constants
    ↓
Phase 2: Core Components
├── 2.1 Button Update
├── 2.2 Card Update
├── 2.3 Badge Creation
├── 2.4 Avatar Update
├── 2.5 Input Update
└── 2.6 Status Pill Creation
    ↓
Phase 3: Layout Components
├── 3.1 Shell Update
├── 3.2 DesktopNav Update
├── 3.3 MobileNav Update
└── 3.4 PageHeader Update
    ↓
Phase 4: Feature Components
├── 4.1 Stat Card Creation
├── 4.2 Avatar Carousel Creation
├── 4.3 Gift Card Creation
└── 4.4 Kanban Column Creation
    ↓
Phase 5: Polish & Animations
├── 5.1 Animation Keyframes
├── 5.2 Component Interactions
└── 5.3 Loading/Error States
```

---

## Testing & Validation Strategy

### Unit Tests
- Component rendering with new color props
- Typography scale application
- Shadow/border radius consistency
- Responsive class application

### Integration Tests
- Component composition (nested cards, buttons in cards, etc.)
- Form submission with new styling
- Navigation transitions
- Modal animations

### Visual Tests
- Color contrast verification (WCAG AA)
- Responsive behavior across breakpoints
- Hover/focus/active states
- Mobile safe area rendering
- iOS Safari compatibility

### E2E Tests
- User workflows (add gift, change status, etc.)
- Real-time updates with new styling
- Form validation visual feedback
- Loading state duration

---

## Risk Assessment

### Risk: Large Codebase Changes
**Severity**: Medium
**Mitigation**:
- Implement phase by phase
- Use feature flags for gradual rollout
- Test thoroughly before each phase
- Maintain backward compatibility

### Risk: Color Accessibility
**Severity**: Medium
**Mitigation**:
- Run WCAG contrast checker
- Test with color blindness simulator
- Include alt text for color-coded elements
- Use patterns + color (not color alone)

### Risk: Performance Impact
**Severity**: Low
**Mitigation**:
- Monitor Tailwind bundle size
- Optimize shadow CSS
- Test animation performance on low-end devices
- Use CSS variables for efficient repaints

### Risk: iOS Safari Issues
**Severity**: Medium
**Mitigation**:
- Test extensively on Safari
- Use env() for safe areas
- Test backdrop blur compatibility
- Verify viewport units (100dvh)

### Risk: Translucent Sidebar Issues
**Severity**: Medium
**Mitigation**:
- Test backdrop blur support
- Provide fallback background color
- Test on Windows with transparency
- Consider performance implications

---

## Success Criteria

### Design System
- All colors match design guide specifications
- Typography scale properly applied
- Shadow system consistent throughout
- Border radius scaling correct

### Component Quality
- All 14+ UI components updated
- CVA variants working correctly
- Responsive behavior maintained
- Accessibility standards met (WCAG AA)

### Layout
- Desktop sidebar translucent and functional
- Mobile bottom nav properly styled
- Responsive transitions smooth
- Safe areas respected on iOS

### User Experience
- App feels warm and inviting
- Interactions are smooth and responsive
- Loading/error states visible
- Colors semantically meaningful

### Technical
- No TypeScript errors
- Tailwind build size acceptable
- No performance regressions
- Cross-browser compatibility

---

## Rollout Plan

### Week 1-2: Foundation & Components
- Complete Phase 1 (config, tokens, styles)
- Complete Phase 2 (button, card, badge, avatar, input)
- Internal testing and QA

### Week 3: Layout & Features
- Complete Phase 3 (shell, nav components)
- Complete Phase 4 (stat cards, carousels, gift cards)
- Internal testing

### Week 4: Polish & Refinement
- Complete Phase 5 (animations, interactions)
- Fix edge cases and issues
- Performance optimization
- Browser testing

### Week 5: Pre-Release
- Final QA pass
- Accessibility audit
- iOS/Android testing
- Documentation updates

### Week 6: Gradual Release
- Deploy to staging
- User testing feedback
- Fix final issues
- Release to production

---

## Maintenance & Future Work

### Post-Launch
- Monitor performance metrics
- Collect user feedback
- Fix any accessibility issues
- Optimize animations on low-end devices

### Future Enhancements
- Add dark mode support (secondary priority)
- Implement custom fonts loading optimization
- Add more animation variants
- Create Storybook documentation
- Build design token CLI tools

### Deprecations
- Remove old blue primary color palette
- Deprecate gray color system (use warm palette)
- Remove old shadow definitions
- Standardize on new border radius scale

---

## File Change Summary

| File | Changes | Priority | Complexity |
|------|---------|----------|-----------|
| `tailwind.config.ts` | Complete rewrite with new palettes | P0 | M |
| `app/globals.css` | CSS variables, animations, utilities | P0 | M |
| `lib/typography.ts` | NEW - Typography tokens | P0 | L |
| `lib/colors.ts` | NEW - Color constants | P0 | L |
| `components/ui/button.tsx` | Variant updates, coral primary | P0 | M |
| `components/ui/card.tsx` | Shadow/radius/bg updates | P0 | M |
| `components/ui/badge.tsx` | Status color mapping | P0 | M |
| `components/ui/avatar.tsx` | Status ring, sizing updates | P0 | M |
| `components/ui/input.tsx` | Border/shadow/focus updates | P0 | M |
| `components/ui/status-pill.tsx` | NEW - Status component | P1 | M |
| `components/layout/Shell.tsx` | Background, spacing updates | P1 | M |
| `components/layout/DesktopNav.tsx` | Translucent sidebar | P1 | M |
| `components/layout/MobileNav.tsx` | Translucent bottom nav | P1 | M |
| `components/layout/PageHeader.tsx` | Typography, spacing updates | P1 | M |
| `components/features/dashboard/StatCard.tsx` | NEW - Stat cards | P1 | M |
| `components/features/dashboard/AvatarCarousel.tsx` | NEW - Avatar carousel | P1 | M |
| `components/features/gifts/GiftCard.tsx` | NEW - Gift card | P1 | M |
| `components/features/lists/KanbanColumn.tsx` | NEW - Kanban columns | P1 | M |

---

## Conclusion

This implementation plan transforms the Family Gifting Dashboard from a basic blue-themed web app into an Apple-featured-quality experience with the "Soft Modernity" aesthetic. The phased approach ensures stability while the modular design allows for parallel work on different components.

The plan prioritizes:
1. **Foundation first** - Color system and tokens before components
2. **Core components** - UI foundations before layout
3. **Layout consistency** - Desktop and mobile parity
4. **Polish last** - Animations and refinements after structure
5. **Accessibility throughout** - WCAG compliance in every phase

Expected completion: **4-6 weeks** with estimated **20-25 total tasks**.

---

**Document Status**: Ready for Implementation
**Next Step**: Begin Phase 1 - Foundation (Design Tokens & Configuration)
**Questions?** Refer to DESIGN-GUIDE.md and aesthetic-v1.md for design specifications.
