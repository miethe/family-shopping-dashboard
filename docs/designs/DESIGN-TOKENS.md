# Design Tokens

> Canonical values for the Family Gifting Dashboard design system.
> For philosophy and usage, see DESIGN-GUIDE.md.

---

## Colors

### Background Colors

```css
--color-bg-base: #FAF8F5;              /* Creamy off-white base */
--color-bg-subtle: #F5F2ED;            /* Slightly darker for contrast */
--color-bg-elevated: #FFFFFF;          /* Pure white for elevated cards */
```

### Text Colors ("Warm Ink")

```css
--color-text-primary: #2D2520;         /* Warm dark brown for headings */
--color-text-secondary: #5C534D;       /* Medium warm grey for body */
--color-text-tertiary: #8A827C;        /* Light warm grey for captions */
--color-text-disabled: #C4BDB7;        /* Disabled state */
--color-text-inverse: #FFFFFF;         /* Text on dark backgrounds */
```

### Surface Colors

```css
--color-surface-primary: #FFFFFF;      /* Floating cards, modals */
--color-surface-secondary: #F5F2ED;    /* Secondary panels */
--color-surface-tertiary: #EBE7E0;     /* Subtle backgrounds */
--color-surface-translucent: rgba(250, 248, 245, 0.8);
```

### Primary Accent ("Holiday Coral")

```css
--color-primary-50: #FEF3F1;
--color-primary-100: #FDE5E0;
--color-primary-200: #FBC9BC;
--color-primary-300: #F5A894;
--color-primary-400: #EE8F76;
--color-primary-500: #E8846B;         /* Primary coral — buttons, CTAs */
--color-primary-600: #D66A51;
--color-primary-700: #B95440;
--color-primary-800: #9A4234;
--color-primary-900: #7D352B;
```

### Status: Idea / Shortlisted ("Muted Mustard")

```css
--color-status-idea-50: #FDF9F0;
--color-status-idea-100: #FAF1DC;
--color-status-idea-200: #F4E0B3;
--color-status-idea-300: #E8CC85;
--color-status-idea-400: #DCB85E;
--color-status-idea-500: #D4A853;     /* Mustard yellow */
--color-status-idea-600: #B88F45;
--color-status-idea-700: #967538;
--color-status-idea-800: #735A2B;
--color-status-idea-900: #523F1F;
```

### Status: Purchased / Gifted ("Soft Sage")

```css
--color-status-success-50: #F3F7F2;
--color-status-success-100: #E4EDE2;
--color-status-success-200: #C5D8C1;
--color-status-success-300: #A0BD9B;
--color-status-success-400: #8AAA84;
--color-status-success-500: #7BA676;   /* Sage green */
--color-status-success-600: #668B61;
--color-status-success-700: #51704E;
--color-status-success-800: #3D543B;
--color-status-success-900: #2A3928;
```

### Status: Urgent / Attention ("Muted Terracotta")

```css
--color-status-warning-50: #FEF5F3;
--color-status-warning-100: #FCE9E5;
--color-status-warning-200: #F6CEC5;
--color-status-warning-300: #EBAB9D;
--color-status-warning-400: #DD9179;
--color-status-warning-500: #C97B63;   /* Terracotta */
--color-status-warning-600: #AC6350;
--color-status-warning-700: #8D4E40;
--color-status-warning-800: #6D3C31;
--color-status-warning-900: #4F2B23;
```

### Status: Buying / Ordered ("Muted Lavender")

```css
--color-status-progress-50: #F7F5F9;
--color-status-progress-100: #EDE8F2;
--color-status-progress-200: #D6CBDF;
--color-status-progress-300: #B9A7C7;
--color-status-progress-400: #A08DB4;
--color-status-progress-500: #8A78A3;  /* Lavender */
--color-status-progress-600: #70628A;
--color-status-progress-700: #594E6E;
--color-status-progress-800: #433B53;
--color-status-progress-900: #2F2A3A;
```

### Semantic Colors

#### Borders & Dividers

```css
--color-border-subtle: #E8E3DC;        /* Soft borders */
--color-border-medium: #D4CDC4;        /* Default borders */
--color-border-strong: #B8AFA4;        /* Emphasized borders */
--color-border-focus: #E8846B;         /* Focus rings (coral) */
```

#### Overlays

```css
--color-overlay-light: rgba(45, 37, 32, 0.08);    /* Subtle overlays */
--color-overlay-medium: rgba(45, 37, 32, 0.16);   /* Modals */
--color-overlay-strong: rgba(45, 37, 32, 0.48);   /* Strong emphasis */
```

### Neutral Warm Scale

```css
warm-50: #FAF8F5;
warm-100: #F5F2ED;
warm-200: #EBE7E0;
warm-300: #D4CDC4;
warm-400: #C4BDB7;
warm-500: #A69C94;
warm-600: #8A827C;
warm-700: #5C534D;
warm-800: #3D3632;
warm-900: #2D2520;
```

---

## Typography

### Font Stack

**Primary (Apple Ecosystem):**
```css
font-family: 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

**Fallback (Web/Cross-platform):**
```css
font-family: 'Nunito', 'Inter', system-ui, -apple-system, sans-serif;
```

### Type Scale

| Token | Size | Line Height | Weight | Font-Weight |
|-------|------|-------------|--------|-------------|
| `text-display-large` | 48px / 3rem | 56px / 1.167 | Heavy | 800 |
| `text-display-medium` | 36px / 2.25rem | 44px / 1.222 | Heavy | 800 |
| `text-display-small` | 28px / 1.75rem | 36px / 1.286 | Bold | 700 |
| `text-heading-1` | 24px / 1.5rem | 32px / 1.333 | Bold | 700 |
| `text-heading-2` | 20px / 1.25rem | 28px / 1.4 | Semibold | 600 |
| `text-heading-3` | 18px / 1.125rem | 26px / 1.444 | Semibold | 600 |
| `text-body-large` | 16px / 1rem | 24px / 1.5 | Regular | 400 |
| `text-body-medium` | 14px / 0.875rem | 20px / 1.429 | Regular | 400 |
| `text-body-small` | 12px / 0.75rem | 16px / 1.333 | Medium | 500 |
| `text-label-large` | 14px / 0.875rem | 20px / 1.429 | Semibold | 600 |
| `text-label-small` | 12px / 0.75rem | 16px / 1.333 | Semibold | 600 |

---

## Spacing Scale (8px Base Grid)

| Token | Value | Rem |
|-------|-------|-----|
| `spacing-1` | 4px | 0.25rem |
| `spacing-2` | 8px | 0.5rem |
| `spacing-3` | 12px | 0.75rem |
| `spacing-4` | 16px | 1rem |
| `spacing-5` | 20px | 1.25rem |
| `spacing-6` | 24px | 1.5rem |
| `spacing-8` | 32px | 2rem |
| `spacing-10` | 40px | 2.5rem |
| `spacing-12` | 48px | 3rem |
| `spacing-16` | 64px | 4rem |
| `spacing-20` | 80px | 5rem |
| `spacing-24` | 96px | 6rem |

---

## Border Radius

```css
--radius-small: 8px;        /* Pills, badges, small buttons */
--radius-medium: 12px;      /* Inputs, standard buttons */
--radius-large: 16px;       /* Default cards */
--radius-xlarge: 20px;      /* Large cards */
--radius-2xlarge: 24px;     /* Hero cards, stats cards */
--radius-3xlarge: 32px;     /* Extra large containers */
--radius-full: 9999px;      /* Avatars, circular elements */
```

---

## Shadows

### Shadow System ("Diffused Elevation")

```css
--shadow-subtle:
  0 1px 2px rgba(45, 37, 32, 0.04),
  0 0 0 1px rgba(45, 37, 32, 0.02);

--shadow-low:
  0 2px 8px rgba(45, 37, 32, 0.06),
  0 0 0 1px rgba(45, 37, 32, 0.03);

--shadow-medium:
  0 4px 16px rgba(45, 37, 32, 0.08),
  0 1px 4px rgba(45, 37, 32, 0.04);

--shadow-high:
  0 8px 32px rgba(45, 37, 32, 0.12),
  0 2px 8px rgba(45, 37, 32, 0.06);

--shadow-extra-high:
  0 16px 48px rgba(45, 37, 32, 0.16),
  0 4px 16px rgba(45, 37, 32, 0.08);

--shadow-translucent:
  0 4px 24px rgba(45, 37, 32, 0.10),
  0 0 0 1px rgba(45, 37, 32, 0.04),
  inset 0 0 0 1px rgba(255, 255, 255, 0.2);
```

### Elevation Hierarchy

```
Level 0 (Base):     No shadow — background
Level 1 (Flat):     shadow-subtle — minimal cards
Level 2 (Default):  shadow-low — most cards
Level 3 (Raised):   shadow-medium — hover, dropdowns
Level 4 (Floating): shadow-high — modals, sheets
Level 5 (Overlay):  shadow-extra-high — fullscreen overlays
```

---

## Animations

### Durations

```css
--duration-fast: 150ms;           /* Fast interactions */
--duration-default: 200ms;        /* Default interactions */
--duration-slow: 300ms;           /* Slower, more dramatic */
--duration-page: 400ms;           /* Page transitions */
```

### Easing Functions

```css
/* Entering elements (start fast, slow down) */
--ease-out: cubic-bezier(0.16, 1, 0.3, 1);

/* Exiting elements (start slow, speed up) */
--ease-in: cubic-bezier(0.7, 0, 0.84, 0);

/* Smooth both ways */
--ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);

/* Bouncy (for delight) */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);
```

### Keyframe Animations

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(16px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
```

---

## Breakpoints

```css
--breakpoint-sm: 640px;              /* Small tablets */
--breakpoint-md: 768px;              /* Tablets */
--breakpoint-lg: 1024px;             /* Laptops */
--breakpoint-xl: 1280px;             /* Desktops */
--breakpoint-2xl: 1536px;            /* Large desktops */
```

---

## Layout

### Max Content Widths

```css
--max-content-width: 1280px;          /* 80rem - Max content width */
--max-reading-width: 640px;           /* 40rem - Comfortable reading width */
--max-form-width: 512px;              /* 32rem - Form max width */
```

### Grid Systems

| Breakpoint | Columns | Gutters |
|-----------|---------|---------|
| Desktop | 12 columns | 24px |
| Tablet | 8 columns | 16px |
| Mobile | 4 columns | 16px |

### Component Sizing

#### Button Heights

```css
--button-height-small: 32px;          /* Small buttons */
--button-height-medium: 44px;         /* Default buttons (touch target) */
--button-height-large: 52px;          /* Large buttons */
```

#### Button Padding

```css
--button-padding-horizontal: 16px;    /* All sizes */
--button-padding-vertical-small: 8px;
--button-padding-vertical-medium: 12px;
--button-padding-vertical-large: 16px;
```

#### Input Heights

```css
--input-height: 48px;                 /* Including border */
--input-padding-horizontal: 16px;
--input-padding-vertical: 12px;
```

#### Avatar Sizes

```css
--avatar-xs: 24px;                    /* Extra small */
--avatar-sm: 32px;                    /* Small */
--avatar-md: 40px;                    /* Medium (default) */
--avatar-lg: 56px;                    /* Large */
--avatar-xl: 80px;                    /* Extra large */
```

#### Card Padding

```css
--card-padding-small: 20px;           /* spacing-5 */
--card-padding-medium: 24px;          /* spacing-6 */
--card-padding-large: 32px;           /* spacing-8 */
```

#### Sidebar Width

```css
--sidebar-width: 240px;               /* Fixed on desktop */
```

---

## Touch Targets (Mobile)

```css
--touch-target-minimum: 44px;         /* Minimum 44×44px */
--icon-size: 24px;                    /* Standard icon size */
--icon-touch-area: 44px;              /* Touch area for icon-only buttons */
```

---

## Safe Areas (iOS/macOS)

```css
--safe-area-inset-top: env(safe-area-inset-top);
--safe-area-inset-right: env(safe-area-inset-right);
--safe-area-inset-bottom: env(safe-area-inset-bottom);
--safe-area-inset-left: env(safe-area-inset-left);
```

---

## CSS Custom Properties Setup

```css
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

  /* Colors - Primary (Coral) */
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

  /* Colors - Status Idea (Mustard) */
  --color-status-idea-50: #FDF9F0;
  --color-status-idea-100: #FAF1DC;
  --color-status-idea-200: #F4E0B3;
  --color-status-idea-300: #E8CC85;
  --color-status-idea-400: #DCB85E;
  --color-status-idea-500: #D4A853;
  --color-status-idea-600: #B88F45;
  --color-status-idea-700: #967538;
  --color-status-idea-800: #735A2B;
  --color-status-idea-900: #523F1F;

  /* Colors - Status Success (Sage) */
  --color-status-success-50: #F3F7F2;
  --color-status-success-100: #E4EDE2;
  --color-status-success-200: #C5D8C1;
  --color-status-success-300: #A0BD9B;
  --color-status-success-400: #8AAA84;
  --color-status-success-500: #7BA676;
  --color-status-success-600: #668B61;
  --color-status-success-700: #51704E;
  --color-status-success-800: #3D543B;
  --color-status-success-900: #2A3928;

  /* Colors - Status Warning (Terracotta) */
  --color-status-warning-50: #FEF5F3;
  --color-status-warning-100: #FCE9E5;
  --color-status-warning-200: #F6CEC5;
  --color-status-warning-300: #EBAB9D;
  --color-status-warning-400: #DD9179;
  --color-status-warning-500: #C97B63;
  --color-status-warning-600: #AC6350;
  --color-status-warning-700: #8D4E40;
  --color-status-warning-800: #6D3C31;
  --color-status-warning-900: #4F2B23;

  /* Colors - Status Progress (Lavender) */
  --color-status-progress-50: #F7F5F9;
  --color-status-progress-100: #EDE8F2;
  --color-status-progress-200: #D6CBDF;
  --color-status-progress-300: #B9A7C7;
  --color-status-progress-400: #A08DB4;
  --color-status-progress-500: #8A78A3;
  --color-status-progress-600: #70628A;
  --color-status-progress-700: #594E6E;
  --color-status-progress-800: #433B53;
  --color-status-progress-900: #2F2A3A;

  /* Colors - Borders & Dividers */
  --color-border-subtle: #E8E3DC;
  --color-border-medium: #D4CDC4;
  --color-border-strong: #B8AFA4;
  --color-border-focus: #E8846B;

  /* Colors - Overlays */
  --color-overlay-light: rgba(45, 37, 32, 0.08);
  --color-overlay-medium: rgba(45, 37, 32, 0.16);
  --color-overlay-strong: rgba(45, 37, 32, 0.48);

  /* Typography */
  --font-family: 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --font-size-display-large: 3rem;      /* 48px */
  --font-size-display-medium: 2.25rem;  /* 36px */
  --font-size-display-small: 1.75rem;   /* 28px */
  --font-size-heading-1: 1.5rem;        /* 24px */
  --font-size-heading-2: 1.25rem;       /* 20px */
  --font-size-heading-3: 1.125rem;      /* 18px */
  --font-size-body-large: 1rem;         /* 16px */
  --font-size-body-medium: 0.875rem;    /* 14px */
  --font-size-body-small: 0.75rem;      /* 12px */

  /* Spacing */
  --spacing-1: 0.25rem;    /* 4px */
  --spacing-2: 0.5rem;     /* 8px */
  --spacing-3: 0.75rem;    /* 12px */
  --spacing-4: 1rem;       /* 16px */
  --spacing-5: 1.25rem;    /* 20px */
  --spacing-6: 1.5rem;     /* 24px */
  --spacing-8: 2rem;       /* 32px */
  --spacing-10: 2.5rem;    /* 40px */
  --spacing-12: 3rem;      /* 48px */
  --spacing-16: 4rem;      /* 64px */
  --spacing-20: 5rem;      /* 80px */
  --spacing-24: 6rem;      /* 96px */

  /* Border Radius */
  --radius-small: 0.5rem;    /* 8px */
  --radius-medium: 0.75rem;  /* 12px */
  --radius-large: 1rem;      /* 16px */
  --radius-xlarge: 1.25rem;  /* 20px */
  --radius-2xlarge: 1.5rem;  /* 24px */
  --radius-3xlarge: 2rem;    /* 32px */
  --radius-full: 9999px;

  /* Shadows */
  --shadow-subtle: 0 1px 2px rgba(45, 37, 32, 0.04), 0 0 0 1px rgba(45, 37, 32, 0.02);
  --shadow-low: 0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03);
  --shadow-medium: 0 4px 16px rgba(45, 37, 32, 0.08), 0 1px 4px rgba(45, 37, 32, 0.04);
  --shadow-high: 0 8px 32px rgba(45, 37, 32, 0.12), 0 2px 8px rgba(45, 37, 32, 0.06);
  --shadow-extra-high: 0 16px 48px rgba(45, 37, 32, 0.16), 0 4px 16px rgba(45, 37, 32, 0.08);
  --shadow-translucent: 0 4px 24px rgba(45, 37, 32, 0.10), 0 0 0 1px rgba(45, 37, 32, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.2);

  /* Animations */
  --duration-fast: 150ms;
  --duration-default: 200ms;
  --duration-slow: 300ms;
  --duration-page: 400ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in: cubic-bezier(0.7, 0, 0.84, 0);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1);

  /* Breakpoints */
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;

  /* Layout */
  --max-content-width: 1280px;
  --max-reading-width: 640px;
  --max-form-width: 512px;
  --sidebar-width: 240px;

  /* Touch targets */
  --touch-target-minimum: 44px;
  --icon-size: 24px;
  --icon-touch-area: 44px;

  /* Safe areas */
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}
```

---

**Reference:** See DESIGN-GUIDE.md for philosophy, component usage, and implementation patterns.

**Last Updated:** 2025-11-27
