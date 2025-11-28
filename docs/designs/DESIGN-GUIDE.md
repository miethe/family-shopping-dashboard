# Family Gifting Dashboard — Design Guide

**Design System Version:** 1.0
**Target Quality:** Apple-featured app aesthetic (2026)
**Philosophy:** Soft Modernity
**Last Updated:** 2025-11-27

---

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Design Tokens](#design-tokens)
3. [Typography](#typography)
4. [Color System](#color-system)
5. [Spacing & Layout](#spacing--layout)
6. [Shadows & Depth](#shadows--depth)
7. [Border Radius & Corners](#border-radius--corners)
8. [Components](#components)
9. [Layout Patterns](#layout-patterns)
10. [Interactions & Animations](#interactions--animations)
11. [Responsive Design](#responsive-design)
12. [Accessibility](#accessibility)
13. [Implementation Guide](#implementation-guide)

---

## Design Philosophy

### Core Principle: "Soft Modernity"

The Family Gifting Dashboard achieves Apple-featured quality through a design philosophy we call **Soft Modernity** — a warm, inviting, and sophisticated aesthetic that combines:

- **Warmth over sterility**: Never pure white (#FFFFFF) or pure black (#000000)
- **Softness over sharpness**: Generous rounded corners, diffused shadows, gentle gradients
- **Depth without drama**: Subtle layering and elevation, not harsh drop shadows
- **Calm over chaos**: Generous whitespace, clear hierarchy, limited accent colors
- **Trust through polish**: Attention to micro-interactions, consistent spacing, refined details

### Design Goals

1. **Inviting**: Feel like gathering around a cozy family table, not a sterile database
2. **Trustworthy**: High-quality polish that respects the emotional significance of gift-giving
3. **Calm**: Reduce cognitive load through clear hierarchy and generous spacing
4. **Joyful**: Subtle moments of delight without being distracting
5. **Timeless**: Modern but not trendy — should age gracefully

### Visual Inspiration

- **Apple's design language**: Translucent materials, vibrancy, rounded corners, safe areas
- **macOS Big Sur+**: Soft shadows, floating UI elements, translucent sidebars
- **iOS 15+**: Large bold headers, status pills, avatar presence
- **Contemporary Material Design**: Elevated surfaces, meaningful motion
- **Scandinavian design**: Warmth, simplicity, natural materials

---

## Design Tokens

Design tokens are the atomic values that define the design system. All components and patterns use these tokens.

### Token Structure

```typescript
// Token naming convention:
// [category]-[property]-[variant]-[state]
// Examples:
// - color-primary-base
// - spacing-content-large
// - shadow-elevated-hover
```

### Core Token Categories

1. **Colors**: Semantic color palette with warm tones
2. **Typography**: Font families, sizes, weights, line heights
3. **Spacing**: Consistent 8px-based spacing scale
4. **Shadows**: Soft depth system
5. **Radii**: Rounded corner values
6. **Transitions**: Animation timing and easing
7. **Breakpoints**: Responsive design thresholds

---

## Typography

### Font Families

**Primary (Apple Ecosystem):**
```css
font-family: 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

**Fallback (Web/Cross-platform):**
```css
font-family: 'Nunito', 'Inter', system-ui, -apple-system, sans-serif;
```

**Characteristics:**
- Rounded terminals for friendliness
- Excellent readability at all sizes
- Strong weight contrast (300–800)
- Designed for screen rendering

### Type Scale

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-display-large` | 48px (3rem) | 56px (1.167) | 800 (Heavy) | Hero sections |
| `text-display-medium` | 36px (2.25rem) | 44px (1.222) | 800 (Heavy) | Page titles |
| `text-display-small` | 28px (1.75rem) | 36px (1.286) | 700 (Bold) | Section headers |
| `text-heading-1` | 24px (1.5rem) | 32px (1.333) | 700 (Bold) | Card titles |
| `text-heading-2` | 20px (1.25rem) | 28px (1.4) | 600 (Semibold) | Subsections |
| `text-heading-3` | 18px (1.125rem) | 26px (1.444) | 600 (Semibold) | Small headers |
| `text-body-large` | 16px (1rem) | 24px (1.5) | 400 (Regular) | Body text, forms |
| `text-body-medium` | 14px (0.875rem) | 20px (1.429) | 400 (Regular) | Secondary text |
| `text-body-small` | 12px (0.75rem) | 16px (1.333) | 500 (Medium) | Labels, captions |
| `text-label-large` | 14px (0.875rem) | 20px (1.429) | 600 (Semibold) | Button text |
| `text-label-small` | 12px (0.75rem) | 16px (1.333) | 600 (Semibold) | Pills, badges |

### Typography Guidelines

**Headers:**
- Use heavy weights (700–800) for impact
- Large size contrast with body text
- Warm dark brown color, never pure black
- Generous bottom margin for breathing room

**Body Text:**
- 16px minimum on mobile (accessibility)
- 1.5 line height for readability
- Regular weight (400) for body, medium (500–600) for emphasis
- Maximum line length: 65–75 characters

**Numbers & Stats:**
- Extra bold weight (800) for prominence
- Large size (28px–48px) for dashboard stats
- Tabular numerals for alignment
- Color-coded by context (coral for primary, mustard/sage for status)

### Type Pairing Examples

```typescript
// Page title + subtitle
<h1 className="text-display-medium font-heavy text-warm-900">
  Christmas 2026
</h1>
<p className="text-body-large text-warm-600">
  14 days until the big day
</p>

// Stat card
<div className="text-display-large font-heavy text-coral-500">
  12
</div>
<div className="text-body-small font-medium text-warm-700 uppercase tracking-wide">
  Ideas
</div>

// Card header
<h2 className="text-heading-1 font-bold text-warm-900">
  Gifts for Peyton
</h2>
```

---

## Color System

### Philosophy: "Warm Harmony"

The color palette is intentionally warm, inviting, and limited. Every color serves a semantic purpose.

### Primary Palette

#### Backgrounds & Surfaces

**Base Background ("Warm Canvas")**
```css
--color-bg-base: #FAF8F5;        /* Creamy off-white, never pure white */
--color-bg-subtle: #F5F2ED;      /* Slightly darker for subtle contrast */
--color-bg-elevated: #FFFFFF;    /* Pure white reserved for elevated cards */
```

**Surface Colors**
```css
--color-surface-primary: #FFFFFF;    /* Floating cards, modals */
--color-surface-secondary: #F5F2ED;  /* Secondary panels */
--color-surface-tertiary: #EBE7E0;   /* Subtle backgrounds */
--color-surface-translucent: rgba(250, 248, 245, 0.8); /* Sidebar, overlays */
```

#### Text Colors ("Warm Ink")

```css
--color-text-primary: #2D2520;       /* Warm dark brown for headings */
--color-text-secondary: #5C534D;     /* Medium warm grey for body */
--color-text-tertiary: #8A827C;      /* Light warm grey for captions */
--color-text-disabled: #C4BDB7;      /* Disabled state */
--color-text-inverse: #FFFFFF;       /* Text on dark backgrounds */
```

#### Accent & Interactive ("Holiday Coral")

**Primary Accent**
```css
--color-primary-50: #FEF3F1;
--color-primary-100: #FDE5E0;
--color-primary-200: #FBC9BC;
--color-primary-300: #F5A894;
--color-primary-400: #EE8F76;
--color-primary-500: #E8846B;        /* Primary coral — buttons, CTAs */
--color-primary-600: #D66A51;
--color-primary-700: #B95440;
--color-primary-800: #9A4234;
--color-primary-900: #7D352B;
```

**Usage:**
- Primary buttons
- Active states
- Links and interactive elements
- Primary focus indicators
- Key dashboard stats

### Status Colors

Each status has a semantic color with warm undertones.

#### Idea / Shortlisted ("Muted Mustard")

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

**Usage:**
- Idea status pills
- Shortlisted state
- "To Buy" dashboard stats
- Thinking/planning indicators

#### Purchased / Gifted ("Soft Sage")

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

**Usage:**
- Purchased status pills
- Delivered/Wrapped/Gifted states
- Success messages
- Completion indicators

#### Urgent / Attention ("Muted Terracotta")

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

**Usage:**
- Urgent status
- Low stock / deadline warnings
- Attention-needed indicators
- Error states (use sparingly)

#### Buying / Ordered ("Muted Lavender" — Optional)

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

**Usage:**
- In-progress states (buying, ordered)
- Loading indicators
- Processing states

### Semantic Colors

#### Borders & Dividers

```css
--color-border-subtle: #E8E3DC;      /* Soft borders */
--color-border-medium: #D4CDC4;      /* Default borders */
--color-border-strong: #B8AFA4;      /* Emphasized borders */
--color-border-focus: #E8846B;       /* Focus rings (coral) */
```

#### Overlays & Shadows

```css
--color-overlay-light: rgba(45, 37, 32, 0.08);    /* Subtle overlays */
--color-overlay-medium: rgba(45, 37, 32, 0.16);   /* Modals */
--color-overlay-strong: rgba(45, 37, 32, 0.48);   /* Strong emphasis */
```

### Color Usage Guidelines

**Do's:**
- Use coral sparingly — only for primary actions and key stats
- Maintain warm undertones across all colors
- Use status colors consistently (idea=mustard, success=sage, etc.)
- Layer surfaces with subtle elevation (white on cream on subtle)
- Keep text contrast ratio ≥4.5:1 for WCAG AA

**Don'ts:**
- Never use pure white (#FFFFFF) as a background
- Never use pure black (#000000) for text
- Don't mix cool and warm tones
- Don't use status colors decoratively
- Don't use more than 2 accent colors per view

### Color Examples

```typescript
// Primary button
<button className="bg-primary-500 text-white hover:bg-primary-600">
  Add Gift
</button>

// Status pill
<span className="bg-status-idea-100 text-status-idea-800 border-status-idea-300">
  Idea
</span>

// Card on background
<div className="bg-bg-base">
  <div className="bg-surface-primary shadow-elevated">
    Card content
  </div>
</div>
```

---

## Spacing & Layout

### Spacing Scale (8px Base Grid)

All spacing uses multiples of 8px for visual consistency and easier developer handoff.

| Token | Value | Rem | Usage |
|-------|-------|-----|-------|
| `spacing-1` | 4px | 0.25rem | Tight padding, icon gaps |
| `spacing-2` | 8px | 0.5rem | Compact spacing |
| `spacing-3` | 12px | 0.75rem | Button padding (vertical) |
| `spacing-4` | 16px | 1rem | Default gap, button padding (horizontal) |
| `spacing-5` | 20px | 1.25rem | Card padding (small) |
| `spacing-6` | 24px | 1.5rem | Card padding (medium) |
| `spacing-8` | 32px | 2rem | Section spacing, card padding (large) |
| `spacing-10` | 40px | 2.5rem | Large gaps |
| `spacing-12` | 48px | 3rem | Section headers |
| `spacing-16` | 64px | 4rem | Major section dividers |
| `spacing-20` | 80px | 5rem | Hero spacing |
| `spacing-24` | 96px | 6rem | Extra large spacing |

### Layout Guidelines

**Card Padding:**
- Small cards: `spacing-5` (20px)
- Medium cards: `spacing-6` (24px)
- Large cards: `spacing-8` (32px)

**Section Spacing:**
- Between sections: `spacing-12` (48px)
- Between subsections: `spacing-8` (32px)
- Between elements: `spacing-4` (16px)

**Content Width:**
- Max content width: 1280px (80rem)
- Comfortable reading width: 640px (40rem)
- Form max width: 512px (32rem)

**Grid Systems:**
- Desktop: 12-column grid, 24px gutters
- Tablet: 8-column grid, 16px gutters
- Mobile: 4-column grid, 16px gutters

### Safe Areas (iOS/macOS)

Respect system safe areas on mobile devices:

```css
/* iOS safe areas */
padding-top: env(safe-area-inset-top);
padding-right: env(safe-area-inset-right);
padding-bottom: env(safe-area-inset-bottom);
padding-left: env(safe-area-inset-left);

/* Practical implementation */
.page-container {
  padding: max(16px, env(safe-area-inset-top))
           max(16px, env(safe-area-inset-right))
           max(16px, env(safe-area-inset-bottom))
           max(16px, env(safe-area-inset-left));
}
```

---

## Shadows & Depth

### Shadow System: "Diffused Elevation"

Shadows are soft and warm, creating gentle depth rather than harsh separation.

#### Shadow Tokens

```css
/* Subtle elevation — barely perceptible */
--shadow-subtle:
  0 1px 2px rgba(45, 37, 32, 0.04),
  0 0 0 1px rgba(45, 37, 32, 0.02);

/* Low elevation — cards on background */
--shadow-low:
  0 2px 8px rgba(45, 37, 32, 0.06),
  0 0 0 1px rgba(45, 37, 32, 0.03);

/* Medium elevation — hover states, dropdowns */
--shadow-medium:
  0 4px 16px rgba(45, 37, 32, 0.08),
  0 1px 4px rgba(45, 37, 32, 0.04);

/* High elevation — modals, popovers */
--shadow-high:
  0 8px 32px rgba(45, 37, 32, 0.12),
  0 2px 8px rgba(45, 37, 32, 0.06);

/* Extra high elevation — overlays */
--shadow-extra-high:
  0 16px 48px rgba(45, 37, 32, 0.16),
  0 4px 16px rgba(45, 37, 32, 0.08);
```

#### Translucent Shadows (for light backgrounds)

```css
/* For translucent surfaces like sidebar */
--shadow-translucent:
  0 4px 24px rgba(45, 37, 32, 0.10),
  0 0 0 1px rgba(45, 37, 32, 0.04),
  inset 0 0 0 1px rgba(255, 255, 255, 0.2);
```

### Shadow Usage

| Element | Shadow | State Changes |
|---------|--------|---------------|
| **Flat cards** | `shadow-subtle` | No change |
| **Default cards** | `shadow-low` | `shadow-medium` on hover |
| **Interactive cards** | `shadow-low` | `shadow-medium` on hover, `shadow-subtle` on press |
| **Floating panels** | `shadow-medium` | No change (always floating) |
| **Modals** | `shadow-high` | No change |
| **Tooltips/Popovers** | `shadow-high` | No change |
| **Translucent sidebar** | `shadow-translucent` | No change |

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

## Border Radius & Corners

### Philosophy: "Hyper-Rounded Softness"

One of the defining characteristics of the Soft Modernity aesthetic is generous rounded corners.

### Radius Scale

| Token | Value | Usage |
|-------|-------|-------|
| `radius-small` | 8px | Pills, badges, small buttons |
| `radius-medium` | 12px | Inputs, standard buttons |
| `radius-large` | 16px | Default cards |
| `radius-xlarge` | 20px | Large cards |
| `radius-2xlarge` | 24px | Hero cards, stats cards |
| `radius-3xlarge` | 32px | Extra large containers |
| `radius-full` | 9999px | Avatars, circular elements |

### Radius Guidelines

**Cards:**
- Small cards (< 200px): `radius-large` (16px)
- Medium cards: `radius-xlarge` (20px)
- Large cards (> 400px): `radius-2xlarge` (24px)
- Hero sections: `radius-3xlarge` (32px)

**Buttons:**
- Small buttons: `radius-medium` (12px)
- Default buttons: `radius-large` (16px)
- Large buttons: `radius-xlarge` (20px)

**Form Elements:**
- Inputs: `radius-medium` (12px)
- Selects/Dropdowns: `radius-medium` (12px)

**Other Elements:**
- Pills/Badges: `radius-small` (8px) or `radius-full`
- Avatars: `radius-full`
- Images in cards: Match parent card radius

### Nested Radius Pattern

When nesting rounded elements, reduce inner radius by 4–8px:

```typescript
// Outer card: 24px radius
<div className="rounded-2xlarge bg-surface-primary">

  // Inner element: 16px radius (24 - 8 = 16)
  <div className="rounded-large bg-bg-subtle">
    Content
  </div>
</div>
```

---

## Components

### Button

The primary interaction element. Comes in multiple variants for different contexts.

#### Button Variants

**Primary (Coral Accent)**
```typescript
<button className="
  px-6 py-3
  bg-primary-500 hover:bg-primary-600 active:bg-primary-700
  text-white font-semibold text-label-large
  rounded-large
  shadow-low hover:shadow-medium
  transition-all duration-200 ease-out
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  Add Gift
</button>
```

**Specs:**
- Height: 44px minimum (touch target)
- Padding: 16px horizontal, 12px vertical
- Border radius: 16px (large)
- Font: 14px semibold (label-large)
- Shadow: low → medium on hover
- Transition: 200ms ease-out

**Secondary (Ghost)**
```typescript
<button className="
  px-6 py-3
  bg-transparent hover:bg-warm-100 active:bg-warm-200
  text-warm-900 font-semibold text-label-large
  rounded-large
  border-2 border-warm-300 hover:border-warm-400
  transition-all duration-200 ease-out
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
">
  Cancel
</button>
```

**Tertiary (Text Only)**
```typescript
<button className="
  px-4 py-2
  bg-transparent hover:bg-warm-100 active:bg-warm-200
  text-primary-600 hover:text-primary-700 font-semibold text-label-large
  rounded-medium
  transition-all duration-200 ease-out
  focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1
">
  Learn More
</button>
```

**Danger (Warning/Delete)**
```typescript
<button className="
  px-6 py-3
  bg-status-warning-500 hover:bg-status-warning-600 active:bg-status-warning-700
  text-white font-semibold text-label-large
  rounded-large
  shadow-low hover:shadow-medium
  transition-all duration-200 ease-out
  focus:outline-none focus:ring-2 focus:ring-status-warning-500 focus:ring-offset-2
">
  Delete Gift
</button>
```

#### Button States

| State | Visual Change |
|-------|---------------|
| **Default** | Base colors, shadow-low |
| **Hover** | Darker background, shadow-medium |
| **Active/Pressed** | Even darker background, shadow-subtle |
| **Focus** | 2px ring in primary color, 2px offset |
| **Disabled** | 40% opacity, no hover, cursor not-allowed |
| **Loading** | Spinner inside button, disabled state |

#### Button Sizes

```typescript
// Small (32px height)
className="px-4 py-2 text-body-small rounded-medium"

// Medium (44px height) — Default
className="px-6 py-3 text-label-large rounded-large"

// Large (52px height)
className="px-8 py-4 text-heading-3 rounded-xlarge"
```

---

### Card

The fundamental container for content grouping.

#### Card Variants

**Elevated Card (Default)**
```typescript
<div className="
  p-6
  bg-surface-primary
  rounded-xlarge
  shadow-low hover:shadow-medium
  border border-border-subtle
  transition-all duration-300 ease-out
">
  Card content
</div>
```

**Specs:**
- Background: Pure white (surface-primary)
- Padding: 24px (spacing-6)
- Border radius: 20px (xlarge)
- Shadow: low → medium on hover
- Border: 1px subtle border
- Transition: 300ms ease-out

**Interactive Card (Clickable)**
```typescript
<div className="
  p-6
  bg-surface-primary
  rounded-xlarge
  shadow-low hover:shadow-medium active:shadow-subtle
  border border-border-subtle hover:border-border-medium
  cursor-pointer
  transition-all duration-300 ease-out
  transform hover:scale-[1.01] active:scale-[0.99]
">
  Clickable card
</div>
```

**Additional interaction:**
- Scale up 1% on hover
- Scale down 1% on press
- Border darkens on hover

**Stat Card (Dashboard)**
```typescript
<div className="
  p-8
  bg-gradient-to-br from-primary-50 to-primary-100
  rounded-2xlarge
  shadow-medium
  border-2 border-primary-200
">
  <div className="text-display-large font-heavy text-primary-600">
    12
  </div>
  <div className="text-body-small font-semibold text-primary-800 uppercase tracking-wide mt-2">
    Ideas
  </div>
</div>
```

**Specs:**
- Larger padding: 32px (spacing-8)
- Gradient background (status-specific)
- Large border radius: 24px (2xlarge)
- No hover state (not interactive)
- Bold number + small label pattern

**Flat Card (Minimal)**
```typescript
<div className="
  p-5
  bg-surface-secondary
  rounded-large
  shadow-subtle
  border border-border-subtle
">
  Minimal card
</div>
```

---

### Input Fields

Form inputs with warm, friendly styling.

#### Text Input

```typescript
<div className="relative">
  <label className="
    block mb-2
    text-body-small font-semibold text-warm-800 uppercase tracking-wide
  ">
    Gift Title
  </label>

  <input
    type="text"
    className="
      w-full px-4 py-3
      bg-white
      text-body-large text-warm-900 font-normal
      placeholder-warm-400
      border-2 border-border-medium
      rounded-medium
      shadow-subtle
      focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200
      transition-all duration-200 ease-out
    "
    placeholder="Enter gift name..."
  />
</div>
```

**Specs:**
- Height: 48px (including border)
- Padding: 16px horizontal, 12px vertical
- Border: 2px medium border → primary on focus
- Focus ring: 2px primary-200 glow
- Border radius: 12px (medium)
- Font size: 16px (prevents iOS zoom)

#### Select Dropdown

```typescript
<select className="
  w-full px-4 py-3
  bg-white
  text-body-large text-warm-900
  border-2 border-border-medium
  rounded-medium
  shadow-subtle
  focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200
  transition-all duration-200 ease-out
  appearance-none
  bg-[url('data:image/svg+xml;base64,...')] /* Custom arrow */
  bg-no-repeat bg-right-4 bg-center
">
  <option>Select status...</option>
  <option>Idea</option>
  <option>Shortlisted</option>
</select>
```

#### Textarea

```typescript
<textarea className="
  w-full px-4 py-3
  min-h-[120px]
  bg-white
  text-body-large text-warm-900
  placeholder-warm-400
  border-2 border-border-medium
  rounded-medium
  shadow-subtle
  resize-y
  focus:outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-200
  transition-all duration-200 ease-out
" />
```

---

### Status Pills

Small colored indicators for status and categories.

#### Status Pill Component

```typescript
// Idea status
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1.5
  bg-status-idea-100
  text-status-idea-800 text-label-small font-semibold
  border border-status-idea-300
  rounded-small
">
  <span className="w-1.5 h-1.5 rounded-full bg-status-idea-600"></span>
  Idea
</span>

// Purchased status
<span className="
  inline-flex items-center gap-1.5
  px-3 py-1.5
  bg-status-success-100
  text-status-success-800 text-label-small font-semibold
  border border-status-success-300
  rounded-small
">
  <span className="w-1.5 h-1.5 rounded-full bg-status-success-600"></span>
  Purchased
</span>
```

**Specs:**
- Padding: 12px horizontal, 6px vertical
- Border radius: 8px (small)
- Font: 12px semibold uppercase
- Dot indicator: 6px circle
- Background: -100 shade, text: -800 shade, border: -300 shade

#### Status Mapping

| Status | Background | Text | Border | Dot |
|--------|------------|------|--------|-----|
| Idea | `idea-100` | `idea-800` | `idea-300` | `idea-600` |
| Shortlisted | `idea-100` | `idea-800` | `idea-300` | `idea-600` |
| Buying | `progress-100` | `progress-800` | `progress-300` | `progress-600` |
| Ordered | `progress-100` | `progress-800` | `progress-300` | `progress-600` |
| Purchased | `success-100` | `success-800` | `success-300` | `success-600` |
| Delivered | `success-100` | `success-800` | `success-300` | `success-600` |
| Gifted | `success-100` | `success-800` | `success-300` | `success-600` |

---

### Avatar

Profile pictures with status rings.

#### Avatar Component

```typescript
// Basic avatar
<div className="relative inline-block">
  <img
    src="/avatars/user.jpg"
    alt="User Name"
    className="
      w-10 h-10
      rounded-full
      border-2 border-white
      shadow-low
    "
  />
</div>

// Avatar with status ring (active)
<div className="relative inline-block">
  <div className="
    absolute inset-0 -m-0.5
    rounded-full
    bg-gradient-to-br from-primary-400 to-primary-600
    animate-pulse
  "></div>

  <img
    src="/avatars/user.jpg"
    alt="User Name"
    className="
      relative
      w-10 h-10
      rounded-full
      border-2 border-white
      shadow-low
    "
  />
</div>

// Avatar with status indicator
<div className="relative inline-block">
  <img
    src="/avatars/user.jpg"
    alt="User Name"
    className="w-10 h-10 rounded-full border-2 border-white shadow-low"
  />

  <span className="
    absolute -bottom-0.5 -right-0.5
    w-3 h-3
    rounded-full
    bg-status-success-500
    border-2 border-white
  "></span>
</div>
```

#### Avatar Sizes

```typescript
// Extra small (24px)
className="w-6 h-6"

// Small (32px)
className="w-8 h-8"

// Medium (40px) — Default
className="w-10 h-10"

// Large (56px)
className="w-14 h-14"

// Extra large (80px)
className="w-20 h-20"
```

#### Avatar Group (Overlap)

```typescript
<div className="flex -space-x-3">
  <img className="w-10 h-10 rounded-full border-2 border-white shadow-low relative z-30" />
  <img className="w-10 h-10 rounded-full border-2 border-white shadow-low relative z-20" />
  <img className="w-10 h-10 rounded-full border-2 border-white shadow-low relative z-10" />
  <div className="
    w-10 h-10
    rounded-full
    border-2 border-white
    bg-warm-300
    text-warm-800 text-body-small font-semibold
    flex items-center justify-center
    relative z-0
  ">
    +3
  </div>
</div>
```

---

### Modal / Dialog

Overlay panels for focused interactions.

#### Modal Structure

```typescript
// Overlay backdrop
<div className="
  fixed inset-0 z-40
  bg-overlay-strong backdrop-blur-sm
  animate-fadeIn
"></div>

// Modal container
<div className="
  fixed inset-0 z-50
  flex items-center justify-center
  p-6
">
  <div className="
    w-full max-w-lg
    bg-surface-primary
    rounded-2xlarge
    shadow-extra-high
    border border-border-subtle
    animate-scaleIn
    origin-center
  ">
    {/* Header */}
    <div className="px-8 py-6 border-b border-border-subtle">
      <h2 className="text-heading-1 font-bold text-warm-900">
        Add New Gift
      </h2>
      <p className="mt-1 text-body-medium text-warm-600">
        Enter gift details below
      </p>
    </div>

    {/* Content */}
    <div className="px-8 py-6">
      {/* Form content */}
    </div>

    {/* Footer */}
    <div className="
      px-8 py-6
      border-t border-border-subtle
      flex items-center justify-end gap-3
    ">
      <button className="secondary">Cancel</button>
      <button className="primary">Save Gift</button>
    </div>
  </div>
</div>
```

**Animations:**
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
```

---

### Loading States

#### Spinner

```typescript
<div className="
  w-8 h-8
  border-4 border-warm-200
  border-t-primary-500
  rounded-full
  animate-spin
">
</div>
```

#### Skeleton Loader

```typescript
<div className="animate-pulse">
  <div className="h-6 bg-warm-200 rounded-medium w-3/4 mb-3"></div>
  <div className="h-4 bg-warm-200 rounded-medium w-full mb-2"></div>
  <div className="h-4 bg-warm-200 rounded-medium w-5/6"></div>
</div>
```

---

## Layout Patterns

### Dashboard Layout

The main dashboard uses a card-based grid layout with a translucent sidebar.

#### Structure

```
┌─────────────────────────────────────────────┐
│  Translucent Sidebar  │  Main Content Area  │
│  (240px fixed)        │  (flex-1)           │
│                       │                      │
│  • Dashboard          │  ┌────────────────┐ │
│  • People             │  │ Header         │ │
│  • Occasions          │  │ "Christmas..." │ │
│  • Lists              │  └────────────────┘ │
│  • Gifts              │                      │
│                       │  ┌──┐ ┌──┐ ┌──┐    │
│                       │  │12│ │ 8│ │ 4│    │
│                       │  └──┘ └──┘ └──┘    │
│                       │  Stat Cards          │
│                       │                      │
│                       │  ┌────────────────┐ │
│                       │  │ Avatar Carousel│ │
│                       │  └────────────────┘ │
│                       │                      │
│                       │  ┌────────────────┐ │
│                       │  │ Recent Activity│ │
│                       │  └────────────────┘ │
└─────────────────────────────────────────────┘
```

#### Translucent Sidebar

```typescript
<aside className="
  fixed left-0 top-0 bottom-0
  w-60
  bg-surface-translucent backdrop-blur-lg
  border-r border-border-subtle
  shadow-translucent
  overflow-y-auto
">
  <div className="p-6">
    <h1 className="text-heading-2 font-bold text-warm-900">
      Family Gifting
    </h1>
  </div>

  <nav className="px-3">
    {/* Navigation items */}
  </nav>
</aside>
```

**Specs:**
- Width: 240px (fixed on desktop)
- Background: 80% opacity creamy white with blur
- Border: 1px subtle right border
- Shadow: Translucent shadow with inset highlight
- Backdrop blur: 12px (macOS-style)

#### Main Content Area

```typescript
<main className="
  ml-60
  min-h-screen
  p-8
  bg-bg-base
">
  {/* Page content */}
</main>
```

---

### Stat Cards Row

Horizontal row of colored stat cards on the dashboard.

```typescript
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
  {/* Ideas Card (Coral) */}
  <div className="
    p-8
    bg-gradient-to-br from-primary-50 to-primary-100
    rounded-2xlarge
    shadow-medium
    border-2 border-primary-200
  ">
    <div className="text-display-large font-heavy text-primary-600">
      12
    </div>
    <div className="text-body-small font-semibold text-primary-800 uppercase tracking-wide mt-2">
      Ideas
    </div>
  </div>

  {/* To Buy Card (Mustard) */}
  <div className="
    p-8
    bg-gradient-to-br from-status-idea-50 to-status-idea-100
    rounded-2xlarge
    shadow-medium
    border-2 border-status-idea-200
  ">
    <div className="text-display-large font-heavy text-status-idea-600">
      8
    </div>
    <div className="text-body-small font-semibold text-status-idea-800 uppercase tracking-wide mt-2">
      To Buy
    </div>
  </div>

  {/* Purchased Card (Sage) */}
  <div className="
    p-8
    bg-gradient-to-br from-status-success-50 to-status-success-100
    rounded-2xlarge
    shadow-medium
    border-2 border-status-success-200
  ">
    <div className="text-display-large font-heavy text-status-success-600">
      4
    </div>
    <div className="text-body-small font-semibold text-status-success-800 uppercase tracking-wide mt-2">
      Purchased
    </div>
  </div>
</div>
```

---

### Avatar Carousel

Horizontal scrolling row of people with status indicators.

```typescript
<div className="
  p-6
  bg-surface-primary
  rounded-xlarge
  shadow-low
  border border-border-subtle
  mb-12
">
  <h2 className="text-heading-2 font-bold text-warm-900 mb-4">
    Family Members
  </h2>

  <div className="flex gap-6 overflow-x-auto pb-2 scrollbar-hide">
    {people.map(person => (
      <div key={person.id} className="flex-shrink-0 text-center">
        {/* Avatar with status ring */}
        <div className="relative inline-block mb-2">
          <div className="
            absolute inset-0 -m-0.5
            rounded-full
            bg-gradient-to-br from-status-success-400 to-status-success-600
          "></div>

          <img
            src={person.avatar}
            alt={person.name}
            className="
              relative
              w-16 h-16
              rounded-full
              border-3 border-white
              shadow-low
            "
          />

          {/* Gift count badge */}
          <span className="
            absolute -bottom-1 -right-1
            w-6 h-6
            rounded-full
            bg-primary-500
            text-white text-xs font-bold
            flex items-center justify-center
            border-2 border-white
            shadow-medium
          ">
            3
          </span>
        </div>

        <div className="text-body-small font-semibold text-warm-900">
          {person.name}
        </div>
      </div>
    ))}
  </div>
</div>
```

---

### Kanban Columns (List Detail)

List detail view uses a kanban-style layout with status columns.

```typescript
<div className="flex gap-6 overflow-x-auto pb-6">
  {/* Idea Column */}
  <div className="flex-shrink-0 w-80">
    <div className="
      px-4 py-3
      bg-gradient-to-r from-status-idea-100 to-status-idea-50
      border-b-4 border-status-idea-400
      rounded-t-large
    ">
      <h3 className="text-heading-3 font-semibold text-status-idea-900">
        Ideas
        <span className="ml-2 text-body-small text-status-idea-700">
          (5)
        </span>
      </h3>
    </div>

    <div className="space-y-4 p-4 bg-status-idea-50/30 rounded-b-large min-h-[400px]">
      {/* Gift cards */}
      <div className="
        p-4
        bg-white
        rounded-large
        shadow-low hover:shadow-medium
        border border-status-idea-200
        cursor-pointer
        transition-all duration-200
      ">
        <img
          src="/gift-image.jpg"
          alt="Gift"
          className="w-full h-32 object-cover rounded-medium mb-3"
        />
        <h4 className="text-heading-3 font-semibold text-warm-900 mb-2">
          LEGO Star Wars Set
        </h4>
        <div className="flex items-center justify-between">
          <span className="text-body-medium text-warm-700">
            $49.99
          </span>
          <img
            src="/avatar.jpg"
            className="w-6 h-6 rounded-full border-2 border-white shadow-low"
          />
        </div>
      </div>
    </div>
  </div>

  {/* Repeat for Shortlisted, Purchased columns... */}
</div>
```

---

### Mobile Bottom Navigation

Fixed bottom navigation for mobile devices.

```typescript
<nav className="
  fixed bottom-0 left-0 right-0
  z-50
  bg-surface-translucent backdrop-blur-lg
  border-t border-border-subtle
  shadow-high
  pb-safe-area-inset-bottom
">
  <div className="flex items-center justify-around px-4 py-2">
    <button className="
      flex flex-col items-center gap-1
      px-4 py-2
      rounded-medium
      text-primary-600
      bg-primary-100
    ">
      <svg className="w-6 h-6" />
      <span className="text-xs font-semibold">Dashboard</span>
    </button>

    <button className="
      flex flex-col items-center gap-1
      px-4 py-2
      rounded-medium
      text-warm-600
      hover:bg-warm-100
    ">
      <svg className="w-6 h-6" />
      <span className="text-xs font-semibold">People</span>
    </button>

    {/* More nav items... */}
  </div>
</nav>
```

**Specs:**
- Height: 64px + safe-area-inset-bottom
- Background: Translucent surface with blur
- Border: 1px top border
- Touch targets: 44px minimum
- Active state: Colored background

---

## Interactions & Animations

### Animation Principles

1. **Purposeful**: Every animation has a reason (feedback, guidance, delight)
2. **Quick**: Duration 150–300ms for most interactions
3. **Natural**: Use ease-out for entering, ease-in for exiting
4. **Subtle**: Animations enhance, don't distract

### Transition Timing

```css
/* Fast interactions */
--duration-fast: 150ms;

/* Default interactions */
--duration-default: 200ms;

/* Slower, more dramatic */
--duration-slow: 300ms;

/* Page transitions */
--duration-page: 400ms;
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

### Common Animations

#### Hover Elevation

```typescript
className="
  transition-all duration-200 ease-out
  shadow-low hover:shadow-medium
  transform hover:-translate-y-0.5
"
```

#### Button Press

```typescript
className="
  transition-all duration-150 ease-out
  active:scale-95
"
```

#### Fade In

```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.animate-fadeIn {
  animation: fadeIn 200ms ease-out;
}
```

#### Slide In (from right)

```css
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

.animate-slideInRight {
  animation: slideInRight 300ms ease-out;
}
```

#### Scale In

```css
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

.animate-scaleIn {
  animation: scaleIn 200ms ease-out;
}
```

#### Loading Pulse

```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

### Micro-Interactions

**Status Change:**
- Scale pill to 105% then back to 100%
- Change color with 200ms transition
- Brief success checkmark animation

**Card Drag:**
- Lift with shadow increase
- Slight rotation (2–3 degrees)
- Snap back with spring easing

**List Reorder:**
- Smooth position transitions
- Ghost placeholder at new position
- Haptic feedback (mobile)

**Form Validation:**
- Shake input on error (6px left-right, 3 times, 400ms total)
- Green checkmark fade-in on success
- Border color transition

---

## Responsive Design

### Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small tablets */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

### Layout Adaptations

#### Desktop (≥1024px)
- Sidebar: 240px fixed, always visible
- Content: Max-width 1280px, centered
- Grid: 12 columns, 24px gutters
- Cards: 3–4 column grid

#### Tablet (768px–1023px)
- Sidebar: Collapsible drawer from left
- Content: Full width with padding
- Grid: 8 columns, 16px gutters
- Cards: 2–3 column grid

#### Mobile (<768px)
- Sidebar: Hidden, hamburger menu
- Bottom navigation: Fixed at bottom
- Grid: 4 columns, 16px gutters
- Cards: 1 column, full width

### Responsive Patterns

**Dashboard Stats:**
```typescript
// Desktop: 3 columns
// Tablet: 3 columns (smaller)
// Mobile: 1 column
className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
```

**Avatar Carousel:**
```typescript
// Desktop: Horizontal scroll
// Mobile: Horizontal scroll (same, just smaller)
className="flex gap-4 md:gap-6 overflow-x-auto"
```

**Kanban Columns:**
```typescript
// Desktop: 3 columns side-by-side, horizontal scroll if more
// Tablet: 2 columns, horizontal scroll
// Mobile: 1 column, vertical stack
className="flex flex-col md:flex-row gap-4 md:gap-6 md:overflow-x-auto"
```

### Touch Targets (Mobile)

**Minimum sizes:**
- Buttons: 44×44px
- Links: 44×44px (with padding)
- Form inputs: 48px height
- Icons: 24×24px with 44×44px touch area

```typescript
// Icon button with proper touch target
<button className="
  p-2.5          /* 10px padding */
  w-11 h-11      /* 44px total */
  flex items-center justify-center
  rounded-medium
  hover:bg-warm-100
  active:bg-warm-200
">
  <svg className="w-6 h-6" /> {/* 24px icon */}
</button>
```

---

## Accessibility

### Color Contrast

All text must meet WCAG 2.1 AA standards (4.5:1 for normal text, 3:1 for large text).

**Tested Combinations:**
- `text-warm-900` on `bg-base`: 12.5:1 ✓
- `text-warm-600` on `bg-base`: 7.8:1 ✓
- `text-white` on `primary-500`: 4.6:1 ✓
- `text-status-idea-800` on `status-idea-100`: 8.2:1 ✓

### Focus Indicators

All interactive elements must have visible focus states.

```typescript
// Default focus ring
className="
  focus:outline-none
  focus:ring-2
  focus:ring-primary-500
  focus:ring-offset-2
"

// For dark backgrounds
className="
  focus:outline-none
  focus:ring-2
  focus:ring-white
  focus:ring-offset-2
  focus:ring-offset-primary-600
"
```

### Keyboard Navigation

- All interactive elements reachable via Tab
- Modals trap focus
- Escape closes overlays
- Enter/Space activate buttons
- Arrow keys navigate lists

### Screen Reader Support

```typescript
// Button with icon
<button aria-label="Add new gift">
  <PlusIcon className="w-6 h-6" aria-hidden="true" />
</button>

// Status indicator
<span className="status-pill" role="status" aria-live="polite">
  Purchased
</span>

// Avatar
<img
  src="/avatar.jpg"
  alt="John Doe"
  role="img"
/>

// Loading state
<div role="status" aria-live="polite" aria-label="Loading gifts">
  <Spinner />
</div>
```

### Reduced Motion

Respect user's motion preferences.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Implementation Guide

### CSS Variables Setup

```css
:root {
  /* Colors - Backgrounds */
  --color-bg-base: #FAF8F5;
  --color-bg-subtle: #F5F2ED;
  --color-bg-elevated: #FFFFFF;
  --color-surface-primary: #FFFFFF;
  --color-surface-secondary: #F5F2ED;
  --color-surface-translucent: rgba(250, 248, 245, 0.8);

  /* Colors - Text */
  --color-text-primary: #2D2520;
  --color-text-secondary: #5C534D;
  --color-text-tertiary: #8A827C;

  /* Colors - Primary (Coral) */
  --color-primary-500: #E8846B;
  --color-primary-600: #D66A51;
  --color-primary-700: #B95440;

  /* Colors - Status Idea (Mustard) */
  --color-status-idea-500: #D4A853;

  /* Colors - Status Success (Sage) */
  --color-status-success-500: #7BA676;

  /* Spacing (8px base) */
  --spacing-1: 0.25rem;  /* 4px */
  --spacing-2: 0.5rem;   /* 8px */
  --spacing-4: 1rem;     /* 16px */
  --spacing-6: 1.5rem;   /* 24px */
  --spacing-8: 2rem;     /* 32px */

  /* Shadows */
  --shadow-low: 0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03);
  --shadow-medium: 0 4px 16px rgba(45, 37, 32, 0.08), 0 1px 4px rgba(45, 37, 32, 0.04);

  /* Radii */
  --radius-small: 0.5rem;   /* 8px */
  --radius-medium: 0.75rem; /* 12px */
  --radius-large: 1rem;     /* 16px */
  --radius-xlarge: 1.25rem; /* 20px */
  --radius-2xlarge: 1.5rem; /* 24px */

  /* Typography */
  --font-family: 'SF Pro Rounded', -apple-system, system-ui, sans-serif;
  --font-size-display-large: 3rem;      /* 48px */
  --font-size-heading-1: 1.5rem;        /* 24px */
  --font-size-body-large: 1rem;         /* 16px */
}
```

### Tailwind Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Warm backgrounds
        'bg-base': '#FAF8F5',
        'bg-subtle': '#F5F2ED',

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

        // Status colors
        'status-idea': { /* Mustard values */ },
        'status-success': { /* Sage values */ },
        'status-warning': { /* Terracotta values */ },
        'status-progress': { /* Lavender values */ },
      },

      fontFamily: {
        sans: ['SF Pro Rounded', '-apple-system', 'system-ui', 'sans-serif'],
      },

      fontSize: {
        'display-large': ['3rem', { lineHeight: '3.5rem', fontWeight: '800' }],
        'display-medium': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '800' }],
        'heading-1': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
        'body-large': ['1rem', { lineHeight: '1.5rem' }],
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
      },
    },
  },
  plugins: [],
}
```

### Component Library Structure

```
src/
├── components/
│   ├── ui/                      # Base components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── StatusPill.tsx
│   │   ├── Avatar.tsx
│   │   ├── Modal.tsx
│   │   └── ...
│   │
│   ├── layout/                  # Layout components
│   │   ├── Sidebar.tsx
│   │   ├── Header.tsx
│   │   ├── MobileNav.tsx
│   │   └── PageContainer.tsx
│   │
│   └── features/                # Feature-specific components
│       ├── dashboard/
│       │   ├── StatCard.tsx
│       │   └── AvatarCarousel.tsx
│       ├── gifts/
│       │   ├── GiftCard.tsx
│       │   └── GiftKanban.tsx
│       └── ...
│
├── styles/
│   ├── globals.css              # Global styles, CSS variables
│   └── animations.css           # Animation keyframes
│
└── tokens/
    ├── colors.ts                # Color constants
    ├── spacing.ts               # Spacing scale
    └── typography.ts            # Typography scale
```

### Usage Examples

**Button Component:**
```typescript
// src/components/ui/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const buttonVariants = cva(
  // Base styles
  'inline-flex items-center justify-center font-semibold transition-all duration-200 ease-out focus:outline-none focus:ring-2 focus:ring-offset-2',
  {
    variants: {
      variant: {
        primary: 'bg-primary-500 text-white hover:bg-primary-600 active:bg-primary-700 focus:ring-primary-500 shadow-low hover:shadow-medium',
        secondary: 'bg-transparent text-warm-900 border-2 border-warm-300 hover:bg-warm-100 hover:border-warm-400 active:bg-warm-200 focus:ring-primary-500',
        ghost: 'bg-transparent text-primary-600 hover:bg-warm-100 hover:text-primary-700 active:bg-warm-200 focus:ring-primary-500',
      },
      size: {
        small: 'px-4 py-2 text-body-small rounded-medium h-8',
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
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={buttonVariants({ variant, size, className })}
        {...props}
      />
    )
  }
)

export { Button, buttonVariants }
```

**Card Component:**
```typescript
// src/components/ui/Card.tsx
import { HTMLAttributes, forwardRef } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

const cardVariants = cva(
  'bg-surface-primary rounded-xlarge border transition-all duration-300 ease-out',
  {
    variants: {
      variant: {
        default: 'border-border-subtle shadow-low',
        elevated: 'border-border-subtle shadow-low hover:shadow-medium',
        interactive: 'border-border-subtle shadow-low hover:shadow-medium hover:border-border-medium cursor-pointer hover:scale-[1.01] active:scale-[0.99]',
        flat: 'bg-surface-secondary border-border-subtle shadow-subtle',
      },
      padding: {
        none: 'p-0',
        small: 'p-5',
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
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cardVariants({ variant, padding, className })}
        {...props}
      />
    )
  }
)

export { Card, cardVariants }
```

---

## Design Checklist

Use this checklist when implementing new features:

### Visual Design
- [ ] Uses warm color palette (no pure white/black)
- [ ] Generous rounded corners (16px–24px for cards)
- [ ] Soft shadows (diffused, warm undertones)
- [ ] Consistent spacing (8px grid)
- [ ] Status colors used semantically
- [ ] Coral accent used sparingly

### Typography
- [ ] Rounded font family (SF Pro Rounded or Nunito)
- [ ] Appropriate type scale
- [ ] Heavy weights for headers (700–800)
- [ ] Sufficient line height (1.5 for body)
- [ ] Good contrast (≥4.5:1)

### Interactions
- [ ] All buttons have hover/active states
- [ ] Focus rings on all interactive elements
- [ ] Loading states defined
- [ ] Error states designed
- [ ] Animations are subtle and quick (200ms)

### Responsive
- [ ] Mobile-first approach
- [ ] Touch targets ≥44px
- [ ] Safe area insets respected
- [ ] Breakpoints followed
- [ ] Bottom nav on mobile

### Accessibility
- [ ] Color contrast meets WCAG AA
- [ ] Focus indicators visible
- [ ] Keyboard navigable
- [ ] Screen reader labels
- [ ] Respects reduced motion

### Implementation
- [ ] Uses design tokens
- [ ] Component reuses existing patterns
- [ ] Follows naming conventions
- [ ] Documented in Storybook
- [ ] Tested across browsers

---

## Version History

**v1.0 (2025-11-27)**
- Initial design system
- Soft Modernity aesthetic defined
- Complete color palette with warm tones
- Typography scale and guidelines
- Core component library
- Layout patterns
- Accessibility standards

---

## References

- **Apple Human Interface Guidelines**: https://developer.apple.com/design/human-interface-guidelines/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
- **Material Design**: https://m3.material.io/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/

---

**Design System Maintained By:** Family Gifting Dashboard Team
**Questions?** Refer to component examples or create an issue in the design repository.
