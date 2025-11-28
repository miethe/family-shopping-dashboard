# Design Implementation Guide

Technical setup and configuration for implementing the Family Gifting Dashboard design system.

> **Reference Docs**
> - For design specifications and visual guidelines, see [DESIGN-GUIDE.md](./DESIGN-GUIDE.md)
> - For design decisions and philosophy, see [asthetic-v1.md](./asthetic-v1.md)
> - For implementation planning, see [DESIGN-IMPLEMENTATION-PLAN.md](./DESIGN-IMPLEMENTATION-PLAN.md)

---

## CSS Variables Setup

All design tokens should be defined as CSS custom properties in your root stylesheet. These variables establish the foundation for the design system.

### Root Variables

```css
:root {
  /* === COLORS === */

  /* Backgrounds */
  --color-bg-base: #FAF8F5;
  --color-bg-subtle: #F5F2ED;
  --color-bg-elevated: #FFFFFF;
  --color-surface-primary: #FFFFFF;
  --color-surface-secondary: #F5F2ED;
  --color-surface-translucent: rgba(250, 248, 245, 0.8);

  /* Text */
  --color-text-primary: #2D2520;
  --color-text-secondary: #5C534D;
  --color-text-tertiary: #8A827C;

  /* Primary (Coral) */
  --color-primary-500: #E8846B;
  --color-primary-600: #D66A51;
  --color-primary-700: #B95440;

  /* Status: Idea (Mustard) */
  --color-status-idea-500: #D4A853;

  /* Status: Success (Sage) */
  --color-status-success-500: #7BA676;

  /* === SPACING === */
  /* 8px base grid */
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */

  /* === SHADOWS === */
  --shadow-low: 0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03);
  --shadow-medium: 0 4px 16px rgba(45, 37, 32, 0.08), 0 1px 4px rgba(45, 37, 32, 0.04);
  --shadow-high: 0 8px 32px rgba(45, 37, 32, 0.12), 0 2px 8px rgba(45, 37, 32, 0.06);

  /* === BORDER RADIUS === */
  --radius-small: 0.5rem;   /* 8px */
  --radius-medium: 0.75rem; /* 12px */
  --radius-large: 1rem;     /* 16px */
  --radius-xlarge: 1.25rem; /* 20px */
  --radius-2xlarge: 1.5rem; /* 24px */
  --radius-3xlarge: 2rem;   /* 32px */

  /* === TYPOGRAPHY === */
  --font-family: 'SF Pro Rounded', -apple-system, system-ui, sans-serif;
  --font-size-display-large: 3rem;      /* 48px */
  --font-size-heading-1: 1.5rem;        /* 24px */
  --font-size-body-large: 1rem;         /* 16px */

  /* === TRANSITIONS === */
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --easing-out: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Respect user's reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-fast: 0.01ms;
    --duration-normal: 0.01ms;
  }

  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

### Usage Pattern

Reference CSS variables in your stylesheets:

```css
.button {
  background-color: var(--color-primary-500);
  padding: var(--spacing-4) var(--spacing-6);
  border-radius: var(--radius-large);
  box-shadow: var(--shadow-low);
  transition: all var(--duration-fast) var(--easing-out);
}

.button:hover {
  background-color: var(--color-primary-600);
  box-shadow: var(--shadow-medium);
}
```

---

## Tailwind Configuration

Extend Tailwind CSS with design tokens from your CSS variables.

### tailwind.config.ts

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm backgrounds (neutral palette)
        'bg-base': '#FAF8F5',
        'bg-subtle': '#F5F2ED',
        'bg-elevated': '#FFFFFF',

        // Text colors
        'text-primary': '#2D2520',
        'text-secondary': '#5C534D',
        'text-tertiary': '#8A827C',

        // Warm scale (neutrals)
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

        // Status colors
        'status-idea': {
          50: '#FEFCF5',
          500: '#D4A853',
          600: '#C29A3F',
          800: '#8B6C1F',
          900: '#6B5416',
        },

        'status-success': {
          50: '#F6F9F6',
          500: '#7BA676',
          600: '#6B9563',
          800: '#4A6D45',
          900: '#3A5535',
        },

        'status-warning': {
          500: '#C97651',
          600: '#B5633D',
        },

        'status-progress': {
          500: '#9D8FBD',
          600: '#8B7BA8',
        },
      },

      fontFamily: {
        sans: [
          'SF Pro Rounded',
          '-apple-system',
          'BlinkMacSystemFont',
          'system-ui',
          'sans-serif',
        ],
        fallback: ['Nunito', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },

      fontSize: {
        'display-large': ['3rem', { lineHeight: '3.5rem', fontWeight: '800' }],
        'display-medium': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '800' }],
        'heading-1': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'heading-2': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }],
        'heading-3': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }],
        'body-large': ['1rem', { lineHeight: '1.5rem' }],
        'body-small': ['0.875rem', { lineHeight: '1.25rem' }],
        'label-large': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
        'label-small': ['0.75rem', { lineHeight: '1rem', fontWeight: '600' }],
      },

      boxShadow: {
        'low': '0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03)',
        'medium': '0 4px 16px rgba(45, 37, 32, 0.08), 0 1px 4px rgba(45, 37, 32, 0.04)',
        'high': '0 8px 32px rgba(45, 37, 32, 0.12), 0 2px 8px rgba(45, 37, 32, 0.06)',
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
        'safe-area-inset-top': 'env(safe-area-inset-top)',
        'safe-area-inset-bottom': 'env(safe-area-inset-bottom)',
        'safe-area-inset-left': 'env(safe-area-inset-left)',
        'safe-area-inset-right': 'env(safe-area-inset-right)',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(1rem)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },

      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-in': 'slide-in-right 300ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'pulse': 'pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}

export default config
```

---

## Component Library Structure

Organize components following a consistent directory structure.

### Directory Layout

```
src/
├── components/
│   ├── ui/
│   │   ├── Button.tsx          # Base interactive component
│   │   ├── Card.tsx            # Container component
│   │   ├── Input.tsx           # Form input
│   │   ├── StatusPill.tsx      # Status indicator
│   │   ├── Avatar.tsx          # User avatar
│   │   ├── Modal.tsx           # Modal dialog
│   │   ├── Badge.tsx           # Label/tag
│   │   └── index.ts            # Barrel export
│   │
│   ├── layout/
│   │   ├── Sidebar.tsx         # Desktop sidebar
│   │   ├── Header.tsx          # Page header
│   │   ├── MobileNav.tsx       # Bottom navigation (mobile)
│   │   ├── PageContainer.tsx   # Page wrapper
│   │   └── index.ts
│   │
│   └── features/
│       ├── dashboard/
│       │   ├── StatCard.tsx
│       │   ├── AvatarCarousel.tsx
│       │   └── index.ts
│       ├── gifts/
│       │   ├── GiftCard.tsx
│       │   ├── GiftKanban.tsx
│       │   └── index.ts
│       └── [feature]/
│           └── index.ts
│
├── styles/
│   ├── globals.css             # Global styles, resets, CSS variables
│   ├── animations.css          # Animation keyframes
│   └── typography.css          # Font-face definitions
│
└── lib/
    └── tokens/
        ├── colors.ts           # Color constants
        ├── spacing.ts          # Spacing scale
        ├── typography.ts       # Font scale
        └── index.ts
```

---

## Font Loading Strategy

Provide optimal font support across platforms.

### SF Pro Rounded (macOS/iOS)

SF Pro Rounded is the native system font on macOS and iOS devices. Define it as the first fallback:

```css
@font-face {
  font-family: 'SF Pro Rounded';
  src: local(-apple-system), local(BlinkMacSystemFont);
  /* System font, no download needed */
}
```

### Nunito (Fallback for Other Platforms)

Use Nunito as the fallback for non-Apple devices. Load from Google Fonts:

```html
<!-- In your app layout or <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

Or use `next/font` in Next.js:

```typescript
// app/layout.tsx
import { Nunito } from 'next/font/google'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-nunito',
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={nunito.variable}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
```

---

## PWA Configuration

Configure the app as a Progressive Web App for installation and offline support.

### manifest.json

Create `public/manifest.json`:

```json
{
  "name": "Family Gifting Dashboard",
  "short_name": "Gift Dashboard",
  "description": "Collaborative gift planning for families",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#E8846B",
  "background_color": "#FAF8F5",
  "icons": [
    {
      "src": "/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192x192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/screenshot-540x720.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshots/screenshot-1280x720.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

### HTML Head Configuration

Add to your app's layout/head:

```html
<!-- PWA Configuration -->
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
<meta name="theme-color" content="#E8846B" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
<meta name="apple-mobile-web-app-title" content="Gift Dashboard" />

<!-- Icons -->
<link rel="icon" type="image/png" href="/icons/favicon-32x32.png" sizes="32x32" />
<link rel="apple-touch-icon" href="/icons/apple-touch-icon-180x180.png" />

<!-- Manifest -->
<link rel="manifest" href="/manifest.json" />
```

### Icon Requirements

Prepare the following icons:

| Size | Purpose | File |
|------|---------|------|
| 192×192px | Android home screen, PWA install | `icon-192x192.png` |
| 512×512px | Android splash screen | `icon-512x512.png` |
| 192×192px | Maskable (adaptive) icon | `icon-maskable-192x192.png` |
| 512×512px | Maskable (adaptive) icon | `icon-maskable-512x512.png` |
| 180×180px | iOS home screen (Apple touch icon) | `apple-touch-icon-180x180.png` |
| 32×32px | Favicon | `favicon-32x32.png` |

**Design Notes for Icons:**
- Use coral primary color (#E8846B) as the background
- Ensure legibility at small sizes
- Maskable icons should have a 10% padding zone (safe area)
- Include the design system's visual identity (rounded, warm aesthetic)

---

## CVA (Class Variance Authority) Setup

Manage component variants using CVA for type-safe, maintainable component APIs.

### Button Component Example

```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  // Base styles applied to all buttons
  'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500 shadow-low hover:shadow-medium',
        secondary: 'bg-transparent text-warm-900 border-2 border-warm-300 hover:bg-warm-100 hover:border-warm-400 active:bg-warm-200 focus:ring-primary-500',
        ghost: 'bg-transparent text-primary-600 hover:bg-warm-100 hover:text-primary-700 active:bg-warm-200 focus:ring-primary-500',
      },
      size: {
        small: 'px-4 py-2 text-label-small rounded-medium h-8',
        medium: 'px-6 py-3 text-label-large rounded-large h-11',
        large: 'px-8 py-4 text-heading-3 rounded-xlarge h-13',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'medium',
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
)

Button.displayName = 'Button'

export { Button, buttonVariants }
```

### Card Component Example

```typescript
// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const cardVariants = cva(
  'bg-surface-primary rounded-xlarge border transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'border-warm-200 shadow-low',
        elevated: 'border-warm-200 shadow-low hover:shadow-medium',
        interactive: 'border-warm-200 shadow-low hover:shadow-medium hover:border-warm-300 cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
        flat: 'bg-surface-secondary border-warm-200 shadow-none',
      },
      padding: {
        none: 'p-0',
        small: 'p-4',
        medium: 'p-6',
        large: 'p-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      padding: 'medium',
    },
  }
)

interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
)

Card.displayName = 'Card'

export { Card, cardVariants }
```

---

## Animation Utilities

Define animation keyframes and transitions for consistent motion.

### animations.css

```css
/* Fade in animation */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Slide from right animation */
@keyframes slideInRight {
  from {
    transform: translateX(1rem);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Scale up animation */
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pulse animation (subtle) */
@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

/* Utility classes */
.animate-fade-in {
  animation: fadeIn 200ms ease-out;
}

.animate-slide-in {
  animation: slideInRight 300ms ease-out;
}

.animate-scale-in {
  animation: scaleIn 200ms ease-out;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Animation Principles

- **Duration**: Keep animations brief (200-300ms for interactions)
- **Easing**: Use `ease-out` for natural-feeling motion
- **Purpose**: Every animation should provide feedback or guidance
- **Restraint**: Subtle animations enhance; avoid distracting effects
- **Accessibility**: Respect `prefers-reduced-motion` setting

---

## Development Checklist

Use this checklist when implementing design system components and features.

### Initial Setup

- [ ] Install Tailwind CSS and configure with design tokens
- [ ] Set up CSS custom properties in `globals.css`
- [ ] Configure font loading (SF Pro Rounded + Nunito fallback)
- [ ] Set up CVA for component variants
- [ ] Create base UI components (Button, Card, Input, etc.)
- [ ] Configure PWA manifest and icons
- [ ] Add viewport and safe area configuration

### Per-Component Implementation

- [ ] Implement all defined variants using CVA
- [ ] Add proper TypeScript types and exports
- [ ] Test accessibility (keyboard navigation, ARIA labels, focus indicators)
- [ ] Verify touch targets are minimum 44×44px
- [ ] Test responsive behavior across breakpoints
- [ ] Add hover, active, and focus states
- [ ] Define loading states if interactive
- [ ] Add animations (fade, scale, slide) as appropriate
- [ ] Test with `prefers-reduced-motion` enabled
- [ ] Document in Storybook with examples
- [ ] Include usage examples in code comments

### Quality Assurance

- [ ] Visual design matches DESIGN-GUIDE specifications
- [ ] Color contrast meets WCAG AA minimum (4.5:1)
- [ ] Typography follows scale and weights defined
- [ ] Spacing uses 8px grid consistently
- [ ] Shadows match design token definitions
- [ ] Border radius values are consistent
- [ ] Interactive elements have visible focus rings
- [ ] Mobile safe area insets respected on iPhone notch/Dynamic Island
- [ ] Component tested on real iOS device (if PWA)
- [ ] All animations perform smoothly (60fps on mobile)

### Documentation

- [ ] Component has JSDoc comments explaining usage
- [ ] Props documented with type descriptions
- [ ] Examples provided for each variant
- [ ] Accessibility notes included
- [ ] Links to DESIGN-GUIDE for visual specifications

---

## Implementation Resources

### Key Files to Create/Update

1. **globals.css** — CSS variables and resets
2. **tailwind.config.ts** — Design token configuration
3. **components/ui/** — Base component library
4. **public/manifest.json** — PWA manifest
5. **public/icons/** — App icons and touch icons

### Related Documentation

- [DESIGN-GUIDE.md](./DESIGN-GUIDE.md) — Visual specifications and design system rules
- [DESIGN-IMPLEMENTATION-PLAN.md](./DESIGN-IMPLEMENTATION-PLAN.md) — Component build timeline
- [asthetic-v1.md](./asthetic-v1.md) — Design philosophy and inspiration

### External References

- [Tailwind CSS Docs](https://tailwindcss.com/docs) — Configuration and utilities
- [CVA Documentation](https://cva.style/) — Component variant patterns
- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/) — PWA best practices
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/) — Accessibility standards

---

**Last Updated**: 2025-11-28
