# Soft Modernity Design Tokens

Token-optimized reference for the Family Gifting Dashboard design system. All values are canonical and pre-configured in `apps/web/tailwind.config.ts`.

---

## Color Palette

### Background Colors

```yaml
bg-base:      "#FAF8F5"    # Creamy off-white base (NEVER pure white)
bg-subtle:    "#F5F2ED"    # Slightly darker for contrast
bg-elevated:  "#FFFFFF"    # Pure white for elevated cards only

surface-primary:     "#FFFFFF"               # Floating cards, modals
surface-secondary:   "rgba(255,255,255,0.6)" # Glassy surfaces
surface-tertiary:    "rgba(242,238,230,0.5)" # Subtle backgrounds
surface-translucent: "rgba(250,248,245,0.8)" # Glassmorphism base
```

### Text Colors (Warm Ink)

```yaml
text-primary:   "#2D2520"  # Warm dark brown - headings
text-secondary: "#5C534D"  # Medium warm grey - body
text-tertiary:  "#8A827C"  # Light warm grey - captions
text-disabled:  "#C4BDB7"  # Disabled state
text-inverse:   "#FFFFFF"  # Text on dark backgrounds
```

### Primary Accent (Holiday Coral)

```yaml
primary-50:  "#FEF3F1"
primary-100: "#FDE5E0"
primary-200: "#FBC9BC"
primary-300: "#F5A894"
primary-400: "#EE8F76"
primary-500: "#E8846B"  # Main coral - buttons, CTAs
primary-600: "#D66A51"  # Hover state
primary-700: "#B95440"
primary-800: "#9A4234"
primary-900: "#7D352B"
```

### Status: Idea/Shortlisted (Muted Mustard)

```yaml
status-idea-50:  "#FDF9F0"
status-idea-100: "#FAF1DC"
status-idea-200: "#F4E0B3"
status-idea-300: "#E8CC85"
status-idea-400: "#DCB85E"
status-idea-500: "#D4A853"  # Mustard yellow
status-idea-600: "#B88F45"
status-idea-700: "#967538"
status-idea-800: "#735A2B"
status-idea-900: "#523F1F"
```

### Status: Purchased/Gifted (Soft Sage)

```yaml
status-success-50:  "#F3F7F2"
status-success-100: "#E4EDE2"
status-success-200: "#C5D8C1"
status-success-300: "#A0BD9B"
status-success-400: "#8AAA84"
status-success-500: "#7BA676"  # Sage green
status-success-600: "#668B61"
status-success-700: "#51704E"
status-success-800: "#3D543B"
status-success-900: "#2A3928"
```

### Status: Urgent/Attention (Muted Terracotta)

```yaml
status-warning-50:  "#FEF5F3"
status-warning-100: "#FCE9E5"
status-warning-200: "#F6CEC5"
status-warning-300: "#EBAB9D"
status-warning-400: "#DD9179"
status-warning-500: "#C97B63"  # Terracotta
status-warning-600: "#AC6350"
status-warning-700: "#8D4E40"
status-warning-800: "#6D3C31"
status-warning-900: "#4F2B23"
```

### Status: Buying/Ordered (Muted Lavender)

```yaml
status-progress-50:  "#F7F5F9"
status-progress-100: "#EDE8F2"
status-progress-200: "#D6CBDF"
status-progress-300: "#B9A7C7"
status-progress-400: "#A08DB4"
status-progress-500: "#8A78A3"  # Lavender
status-progress-600: "#70628A"
status-progress-700: "#594E6E"
status-progress-800: "#433B53"
status-progress-900: "#2F2A3A"
```

### Borders & Dividers

```yaml
border-subtle: "#E8E3DC"  # Soft borders
border-medium: "#D4CDC4"  # Default borders
border-strong: "#B8AFA4"  # Emphasized borders
border-focus:  "#E8846B"  # Focus rings (coral)

glass-border:        "rgba(255,255,255,0.4)"  # Glassmorphism borders
glass-border-strong: "rgba(255,255,255,0.6)"  # Emphasized glass
```

### Overlays

```yaml
overlay-light:  "rgba(45,37,32,0.08)"  # Subtle overlays
overlay-medium: "rgba(45,37,32,0.16)"  # Modal backgrounds
overlay-strong: "rgba(45,37,32,0.48)"  # Strong emphasis
```

### Neutral Warm Scale (Tailwind warm-*)

```yaml
warm-50:  "#FAF8F5"
warm-100: "#F5F2ED"
warm-200: "#EBE7E0"
warm-300: "#D4CDC4"
warm-400: "#C4BDB7"
warm-500: "#A69C94"
warm-600: "#8A827C"
warm-700: "#5C534D"
warm-800: "#3D3632"
warm-900: "#2D2520"
```

---

## Typography

### Font Stack

```yaml
primary: "'SF Pro Rounded', -apple-system, BlinkMacSystemFont, system-ui, sans-serif"
fallback: "'Nunito', 'Inter', system-ui, -apple-system, sans-serif"
```

### Type Scale

```yaml
display-large:   # 48px / 3rem
  size: 3rem
  line: 3.5rem      # 56px / 1.167
  weight: 800       # Heavy
  tracking: -0.02em

display-medium:  # 36px / 2.25rem
  size: 2.25rem
  line: 2.75rem     # 44px / 1.222
  weight: 800       # Heavy
  tracking: -0.015em

display-small:   # 28px / 1.75rem
  size: 1.75rem
  line: 2.25rem     # 36px / 1.286
  weight: 700       # Bold
  tracking: -0.01em

heading-1:       # 24px / 1.5rem
  size: 1.5rem
  line: 2rem        # 32px / 1.333
  weight: 700       # Bold
  tracking: -0.01em

heading-2:       # 20px / 1.25rem
  size: 1.25rem
  line: 1.75rem     # 28px / 1.4
  weight: 600       # Semibold
  tracking: -0.01em

heading-3:       # 18px / 1.125rem
  size: 1.125rem
  line: 1.625rem    # 26px / 1.444
  weight: 600       # Semibold
  tracking: -0.005em

body-large:      # 16px / 1rem
  size: 1rem
  line: 1.5rem      # 24px / 1.5
  weight: 400       # Regular

body-medium:     # 14px / 0.875rem
  size: 0.875rem
  line: 1.25rem     # 20px / 1.429
  weight: 400       # Regular

body-small:      # 12px / 0.75rem
  size: 0.75rem
  line: 1rem        # 16px / 1.333
  weight: 500       # Medium

label-large:     # 14px / 0.875rem
  size: 0.875rem
  line: 1.25rem     # 20px / 1.429
  weight: 600       # Semibold

label-small:     # 12px / 0.75rem
  size: 0.75rem
  line: 1rem        # 16px / 1.333
  weight: 600       # Semibold
  tracking: 0.01em
```

---

## Spacing Scale (8px Base Grid)

```yaml
spacing-1:  0.25rem   # 4px
spacing-2:  0.5rem    # 8px
spacing-3:  0.75rem   # 12px
spacing-4:  1rem      # 16px
spacing-5:  1.25rem   # 20px
spacing-6:  1.5rem    # 24px
spacing-8:  2rem      # 32px
spacing-10: 2.5rem    # 40px
spacing-12: 3rem      # 48px
spacing-16: 4rem      # 64px
spacing-20: 5rem      # 80px
spacing-24: 6rem      # 96px
```

**Tailwind Classes**: `p-1` through `p-24`, `m-1` through `m-24`, `gap-1` through `gap-24`

---

## Border Radius

```yaml
small:    0.5rem    # 8px  - Pills, badges, small buttons
medium:   0.75rem   # 12px - Inputs, standard buttons
large:    1rem      # 16px - Default cards
xlarge:   1.25rem   # 20px - Large cards
2xlarge:  1.5rem    # 24px - Hero cards, stat cards
3xlarge:  2rem      # 32px - Extra large containers
full:     9999px    # Avatars, circular elements
```

**Tailwind Classes**: `rounded-small`, `rounded-medium`, `rounded-large`, `rounded-xlarge`, `rounded-2xlarge`, `rounded-3xlarge`, `rounded-full`

---

## Shadows (Diffused Elevation)

```yaml
subtle:  # Level 1 - Minimal cards
  "0 1px 2px rgba(45, 37, 32, 0.04), 0 0 0 1px rgba(45, 37, 32, 0.02)"

low:  # Level 2 - Most cards
  "0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03)"

medium:  # Level 3 - Hover, dropdowns
  "0 4px 16px rgba(45, 37, 32, 0.08), 0 1px 4px rgba(45, 37, 32, 0.04)"

high:  # Level 4 - Modals, sheets
  "0 8px 32px rgba(45, 37, 32, 0.12), 0 2px 8px rgba(45, 37, 32, 0.06)"

extra-high:  # Level 5 - Fullscreen overlays
  "0 16px 48px rgba(45, 37, 32, 0.16), 0 4px 16px rgba(45, 37, 32, 0.08)"

translucent:  # Glassmorphism
  "0 4px 24px rgba(45, 37, 32, 0.10), 0 0 0 1px rgba(45, 37, 32, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.2)"

glass:  # Glass panels
  "0 8px 32px 0 rgba(31, 38, 135, 0.07)"

glass-inset:  # Glass border highlight
  "inset 0 0 0 1px rgba(255, 255, 255, 0.1)"

glow:  # Accent glow (coral)
  "0 0 20px rgba(255, 102, 77, 0.3)"
```

**Tailwind Classes**: `shadow-subtle`, `shadow-low`, `shadow-medium`, `shadow-high`, `shadow-glass`

### Elevation Hierarchy

```yaml
Level 0 (Base):     no-shadow      # Background
Level 1 (Flat):     shadow-subtle  # Minimal cards
Level 2 (Default):  shadow-low     # Most cards
Level 3 (Raised):   shadow-medium  # Hover, dropdowns
Level 4 (Floating): shadow-high    # Modals, sheets
Level 5 (Overlay):  shadow-extra-high  # Fullscreen overlays
```

---

## Animations

### Durations

```yaml
fast:    150ms   # Fast interactions (hover, press)
default: 200ms   # Default interactions (most transitions)
slow:    300ms   # Slower, more dramatic (page transitions)
page:    400ms   # Page-level transitions
```

### Easing Functions

```yaml
ease-out:    cubic-bezier(0.16, 1, 0.3, 1)        # Entering elements (fast→slow)
ease-in:     cubic-bezier(0.7, 0, 0.84, 0)        # Exiting elements (slow→fast)
ease-in-out: cubic-bezier(0.65, 0, 0.35, 1)       # Smooth both ways
ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1)    # Bouncy (for delight)
```

### Keyframe Animations

```yaml
fadeIn:
  from: { opacity: 0 }
  to:   { opacity: 1 }

slideUpFade:
  from: { opacity: 0, transform: translateY(10px) }
  to:   { opacity: 1, transform: translateY(0) }

scaleIn:
  from: { opacity: 0, transform: scale(0.95) }
  to:   { opacity: 1, transform: scale(1) }

springIn:
  0%:   { transform: scale(0.9) }
  50%:  { transform: scale(1.05) }
  100%: { transform: scale(1) }

shimmer:
  100%: { transform: translateX(100%) }
```

**Tailwind Classes**: `animate-fade-in`, `animate-slide-up-fade`, `animate-scale-in`, `animate-spring-in`, `animate-shimmer`

---

## Breakpoints

```yaml
xs:  375px    # iPhone SE
sm:  640px    # Small tablets
md:  768px    # Tablets (sidebar shows, bottom nav hides)
lg:  1024px   # Laptops
xl:  1280px   # Desktops
2xl: 1536px   # Large desktops
```

**Tailwind Prefixes**: `xs:`, `sm:`, `md:`, `lg:`, `xl:`, `2xl:`

---

## Layout Tokens

### Max Content Widths

```yaml
max-content-width:  1280px  # 80rem - Max content width
max-reading-width:  640px   # 40rem - Comfortable reading
max-form-width:     512px   # 32rem - Form max width
```

### Grid Systems

```yaml
Desktop:
  columns: 12
  gutter: 24px

Tablet:
  columns: 8
  gutter: 16px

Mobile:
  columns: 4
  gutter: 16px
```

### Component Sizing

```yaml
Button Heights:
  small:  32px
  medium: 44px   # Default (touch target)
  large:  52px
  xlarge: 60px

Input Heights:
  standard: 48px  # Including border

Avatar Sizes:
  xs: 24px
  sm: 32px
  md: 40px   # Default
  lg: 56px
  xl: 80px

Card Padding:
  small:  20px   # spacing-5
  medium: 24px   # spacing-6
  large:  32px   # spacing-8

Sidebar Width:
  desktop: 240px  # Fixed on desktop
```

---

## Touch Targets (Mobile)

```yaml
minimum: 44px        # Minimum 44×44px touch area
icon-size: 24px      # Standard icon size
icon-touch-area: 44px  # Touch area for icon-only buttons
```

---

## Safe Areas (iOS/macOS)

```yaml
safe-area-inset-top:    env(safe-area-inset-top)
safe-area-inset-right:  env(safe-area-inset-right)
safe-area-inset-bottom: env(safe-area-inset-bottom)
safe-area-inset-left:   env(safe-area-inset-left)
```

**Tailwind Classes**: `pt-safe-area-inset-top`, `pb-safe-area-inset-bottom`, `pl-safe-area-inset-left`, `pr-safe-area-inset-right`

---

## CSS Custom Properties

All tokens available as CSS variables in `:root`:

```css
:root {
  /* Colors */
  --color-bg-base: #FAF8F5;
  --color-text-primary: #2D2520;
  --color-primary-500: #E8846B;

  /* Typography */
  --font-family: 'SF Pro Rounded', -apple-system, sans-serif;
  --font-size-body-large: 1rem;

  /* Spacing */
  --spacing-4: 1rem;
  --spacing-6: 1.5rem;

  /* Radius */
  --radius-large: 1rem;
  --radius-xlarge: 1.25rem;

  /* Shadows */
  --shadow-low: 0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03);

  /* Animations */
  --duration-default: 200ms;
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
}
```

---

**Reference**: See `apps/web/tailwind.config.ts` for complete implementation
**Version**: 1.0
**Last Updated**: 2025-11-28
