# Family Gifting Dashboard — Design Guide

**Design System Version:** 1.0
**Target Quality:** Apple-featured app aesthetic (2026)
**Philosophy:** Soft Modernity
**Last Updated:** 2025-11-27

---

## Quick Reference

**Colors:**
- Background: `#FAF8F5` (creamy off-white, never pure white)
- Primary accent: `#E8846B` (Holiday Coral)
- Status: Mustard `#D4A853` | Sage `#7BA676` | Terracotta `#C97B63`
- Text primary: `#2D2520` (warm dark brown)

**Spacing:** 8px base grid (4, 8, 12, 16, 24, 32, 48, 64px)

**Radius:** 8px (pills), 12px (inputs), 16px (cards), 20px (large cards), 24px (hero), 32px (containers)

**Shadows:** Soft, warm (low/medium/high with warm undertones, no harsh blacks)

**Typography:** SF Pro Rounded (Apple) / Nunito (web) with rounded terminals

---

## Design Philosophy

### Core Principle: "Soft Modernity"

The Family Gifting Dashboard achieves Apple-featured quality through **Soft Modernity** — a warm, inviting, and sophisticated aesthetic:

- **Warmth over sterility**: Never pure white or pure black
- **Softness over sharpness**: Generous rounded corners, diffused shadows, gentle gradients
- **Depth without drama**: Subtle layering and elevation, not harsh separation
- **Calm over chaos**: Generous whitespace, clear hierarchy, limited accent colors
- **Trust through polish**: Micro-interactions, consistent spacing, refined details

### Design Goals

1. **Inviting**: Feel like gathering around a cozy family table
2. **Trustworthy**: High-quality polish respecting the emotional significance of gift-giving
3. **Calm**: Reduce cognitive load through clear hierarchy and generous spacing
4. **Joyful**: Subtle moments of delight without distraction
5. **Timeless**: Modern but not trendy — ages gracefully

### Visual Inspiration

- **Apple's design language**: Translucent materials, vibrancy, rounded corners, safe areas
- **macOS Big Sur+**: Soft shadows, floating UI elements, translucent sidebars
- **iOS 15+**: Large bold headers, status pills, avatar presence
- **Scandinavian design**: Warmth, simplicity, natural materials

---

## Color System

### Strategy: "Warm Harmony"

Every color serves a semantic purpose. The palette is intentionally warm, inviting, and limited.

**Backgrounds & Surfaces:**
- Base: `#FAF8F5` (creamy canvas)
- Subtle: `#F5F2ED` (slight contrast)
- Elevated: `#FFFFFF` (reserved for elevated cards)
- Translucent: `rgba(250, 248, 245, 0.8)` (sidebars, overlays)

**Text ("Warm Ink"):**
- Primary (headings): `#2D2520` (warm dark brown)
- Secondary (body): `#5C534D` (medium warm grey)
- Tertiary (captions): `#8A827C` (light warm grey)
- Disabled: `#C4BDB7`

**Accent & Interactive ("Holiday Coral"):**
- Primary: `#E8846B` (buttons, CTAs, key stats)
- Used sparingly — only for primary actions

### Status Colors

| Status | Color | Usage |
|--------|-------|-------|
| **Idea / Shortlisted** | Mustard `#D4A853` | Status pills, "To Buy" stats |
| **Purchased / Gifted** | Sage `#7BA676` | Success indicators, completion |
| **Urgent / Attention** | Terracotta `#C97B63` | Low stock, deadline warnings, pulsing rings |
| **In Progress** | Lavender `#8A78A3` | Loading states, ordered items |

### Semantic Usage

- **Borders**: `#E8E3DC` (subtle) → `#B8AFA4` (strong)
- **Overlays**: Light `rgba(45,37,32,0.08)` → Strong `rgba(45,37,32,0.48)`
- **Focus rings**: Coral with 2px offset

**See:** [DESIGN-TOKENS.md](./DESIGN-TOKENS.md) for canonical color values

---

## Typography

### Font Stack

**Apple Ecosystem (Primary):**
```css
font-family: 'SF Pro Rounded', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

**Web/Cross-platform (Fallback):**
```css
font-family: 'Nunito', 'Inter', system-ui, -apple-system, sans-serif;
```

**Characteristics:**
- Rounded terminals for friendliness
- Excellent readability at all sizes
- Strong weight contrast (300–800)
- Optimized for screen rendering

### Hierarchy Principles

**Display (48px–36px):** Hero sections, page titles — weight 800 (Heavy)
**Headings (24px–18px):** Card titles, section headers — weight 700 (Bold)
**Body (16px–14px):** Form text, descriptions — weight 400 (Regular)
**Labels (14px–12px):** Buttons, pills, badges — weight 600 (Semibold)

**Key Rules:**
- 16px minimum on mobile (prevents iOS zoom)
- 1.5 line height for body text
- Maximum line length: 65–75 characters
- Warm dark brown text, never pure black

**See:** [DESIGN-TOKENS.md](./DESIGN-TOKENS.md) for complete type scale

---

## Spacing & Layout

### Spacing Grid (8px Base)

| Size | Value | Usage |
|------|-------|-------|
| `spacing-1` | 4px | Tight gaps, icon spacing |
| `spacing-2` | 8px | Compact spacing |
| `spacing-3` | 12px | Button vertical padding |
| `spacing-4` | 16px | Default gap, form padding |
| `spacing-6` | 24px | Card padding (medium) |
| `spacing-8` | 32px | Section spacing |
| `spacing-12` | 48px | Major section dividers |

### Layout Guidelines

- **Card padding:** Small 20px | Medium 24px | Large 32px
- **Section spacing:** Between sections 48px | Between elements 16px
- **Content width:** Max 1280px | Reading width 640px | Form width 512px
- **Grid:** Desktop 12-col/24px | Tablet 8-col/16px | Mobile 4-col/16px

### Safe Areas (iOS/macOS)

Respect system safe areas on mobile:

```css
padding: max(16px, env(safe-area-inset-top))
         max(16px, env(safe-area-inset-right))
         max(16px, env(safe-area-inset-bottom))
         max(16px, env(safe-area-inset-left));
```

**Critical for mobile:** Use `100dvh` (dynamic viewport height) instead of `100vh` to account for URL bars and safe areas.

---

## Visual Depth

### Shadow System: "Diffused Elevation"

Shadows are soft and warm, creating gentle depth rather than harsh separation.

| Level | Shadow | Usage |
|-------|--------|-------|
| **Subtle** | Barely perceptible | Minimal cards, flat surfaces |
| **Low** | 2px blur, 0.06 opacity | Default cards, primary elevation |
| **Medium** | 4px blur, 0.08 opacity | Hover states, dropdowns, floating panels |
| **High** | 8px blur, 0.12 opacity | Modals, popovers, overlays |
| **Extra High** | 16px blur, 0.16 opacity | Fullscreen overlays, emphasis |

All shadows use warm dark brown (`rgba(45, 37, 32, ...)`) never pure black.

### Border Radius

- **Pills/badges:** 8px
- **Inputs/buttons:** 12px
- **Default cards:** 16px
- **Large cards:** 20px
- **Hero cards:** 24px
- **Containers:** 32px
- **Circles/avatars:** 9999px (full)

**Principle:** Cards larger than 400px use 20px+ radius. Nested rounded elements reduce inner radius by 4–8px.

---

## Motion & Animation

### Animation Principles

1. **Purposeful**: Every animation has a reason (feedback, guidance, delight)
2. **Quick**: Duration 150–300ms for most interactions
3. **Natural**: Ease-out for entering, ease-in for exiting
4. **Subtle**: Animations enhance, don't distract

### Timing & Easing

**Durations:**
- Fast interactions: 150ms
- Default interactions: 200ms
- Slower, dramatic: 300ms
- Page transitions: 400ms

**Easing:**
- Entering (start fast, slow down): `cubic-bezier(0.16, 1, 0.3, 1)`
- Exiting (start slow, speed up): `cubic-bezier(0.7, 0, 0.84, 0)`

### Common Animations

- **Hover elevation:** Lift 0.5px, shadow-low → medium
- **Button press:** Scale to 95%, shadow-low → subtle
- **Fade in:** 0 → 1 opacity, 200ms ease-out
- **Slide in:** TranslateX 16px → 0, 300ms ease-out
- **Scale in:** Scale 0.95 → 1, 200ms ease-out

### Real-Time Updates

- **Card flash:** Subtle background color pulse on real-time status changes (200ms)
- **Urgency pulsing:** Terracotta rings (status-warning) have gentle pulse animation for deadline/low-stock indicators
- **Status change:** Pill scales to 105% then back, color transition 200ms

**See:** [DESIGN-IMPLEMENTATION.md](./DESIGN-IMPLEMENTATION.md) for animation code

---

## Responsive Design

### Mobile-First Approach

**Mobile (<768px):**
- Single column layouts
- Bottom navigation fixed (44px + safe-area)
- Full-width cards
- Hamburger menu (sidebar hidden)

**Tablet (768px–1023px):**
- 2–3 column grids
- Collapsible sidebar drawer
- Medium card sizes

**Desktop (≥1024px):**
- 3–4 column grids
- Fixed 240px sidebar always visible
- Max-width 1280px, centered

### Critical Mobile Patterns

**Touch targets:** 44×44px minimum (buttons, links, icons)

**100dvh over 100vh:** Dynamic viewport height accounts for mobile URL bars and notches

**Safe areas:** Implement `env(safe-area-inset-*)` for notches and home indicators

**Bottom navigation:** Fixed navigation on mobile, always accessible

---

## Accessibility

### WCAG 2.1 AA Compliance

- **Color contrast:** ≥4.5:1 normal text, ≥3:1 large text
- **Focus indicators:** 2px ring in primary color with 2px offset on all interactive elements
- **Keyboard navigation:** All elements reachable via Tab, modals trap focus, Escape closes overlays
- **Screen reader support:** Semantic HTML, aria-labels for icons, role attributes for status indicators

### Implementation Standards

- **Reduced motion:** Respect `prefers-reduced-motion: reduce` by removing animations
- **Color not only:** Don't use status colors as the only indicator (add icons/text)
- **Labels:** All form inputs have visible, associated labels
- **Error handling:** Clear error messages, not just color

**See:** [COMPONENTS.md](./COMPONENTS.md) for component-specific accessibility patterns

---

## Component Guidelines

The component library implements consistent design patterns across buttons, cards, inputs, status pills, avatars, and modals.

**Key Principles:**
- Use design tokens (never hardcoded values)
- Consistent variant system (primary/secondary/tertiary)
- Size variations (small/medium/large)
- Clear state definitions (default/hover/active/focus/disabled)

**Buttons:**
- Primary (coral): CTAs, main actions
- Secondary (ghost): Cancel, alternative actions
- Tertiary (text): Learn more, secondary links
- Danger (terracotta): Destructive actions
- Minimum height: 44px (touch target)

**Cards:**
- Default: Most content grouping
- Interactive: Clickable cards with hover scale (1.01%)
- Stat cards: Dashboard metrics with gradients
- Flat: Minimal elevation

**Inputs:**
- Text/email: 48px height with 16px font (no mobile zoom)
- Select/textarea: Consistent 2px border, focus ring behavior
- Labels: Uppercase, semibold, above input
- Focus: Primary color border + ring

**Status Pills:**
- Compact (12px × 6px padding)
- Colored dot indicator
- Semantic colors (idea/success/warning/progress)

**Avatars:**
- Sizes: 24px, 32px, 40px, 56px, 80px
- Status rings: Gradient (success/idea/warning)
- Groups: -space-x-3 overlap with +N indicator

**See:** [COMPONENTS.md](./COMPONENTS.md) for complete specifications and code examples

---

## Layout Patterns

### Dashboard Layout

**Desktop:** Fixed 240px sidebar + main content area
**Tablet:** Collapsible drawer + full-width content
**Mobile:** Hamburger menu + bottom navigation

Sidebar: Translucent with blur, subtle border, shadow with inset highlight

### Common Patterns

**Stat Cards:** 3-column grid (responsive: 1 column mobile) with gradients and larger text

**Avatar Carousel:** Horizontal scroll with family member avatars, status rings, and gift count badges

**Kanban Columns:** Status-based columns (Idea/Shortlisted/Purchased/Gifted) with card drag-and-drop

**See:** [LAYOUT-PATTERNS.md](./LAYOUT-PATTERNS.md) for detailed layout specifications

---

## Seasonal Design

### December Aesthetic

- **Snowflake texture:** Subtle, decorative background pattern (opacity 2–3%)
- **Color enhancement:** Slightly increased color saturation during holidays
- **Festive touches:** Subtle animations, card borders with thin gold accents (optional)
- **Never overwhelming:** Seasonal changes are understated, not garish

---

## Design Checklist

Use when implementing new features:

### Visual Design
- [ ] Warm color palette (no pure white/black)
- [ ] Generous rounded corners (16px–24px)
- [ ] Soft shadows (diffused, warm tones)
- [ ] Consistent 8px spacing
- [ ] Status colors used semantically
- [ ] Coral accent used sparingly

### Typography
- [ ] Rounded font (SF Pro Rounded or Nunito)
- [ ] Proper type scale applied
- [ ] Heavy weights for headers (700–800)
- [ ] 1.5+ line height for body
- [ ] Contrast ≥4.5:1

### Interactions
- [ ] Hover/active/disabled states on all buttons
- [ ] Focus rings (2px, primary color, 2px offset)
- [ ] Loading states defined
- [ ] Animations 150–300ms
- [ ] Smooth transitions (ease-out/ease-in)

### Responsive & Mobile
- [ ] Mobile-first design
- [ ] Touch targets ≥44px
- [ ] Safe area insets applied
- [ ] 100dvh used instead of 100vh
- [ ] Bottom nav on mobile

### Accessibility
- [ ] WCAG AA contrast ratios
- [ ] Keyboard navigable
- [ ] Screen reader labels
- [ ] Respects reduced motion
- [ ] Focus trapping in modals

---

## Reference Documentation

- **[DESIGN-TOKENS.md](./DESIGN-TOKENS.md)** — Canonical color, spacing, typography, shadow values
- **[COMPONENTS.md](./COMPONENTS.md)** — Component specifications, variants, states, examples
- **[LAYOUT-PATTERNS.md](./LAYOUT-PATTERNS.md)** — Dashboard, navigation, kanban, responsive patterns
- **[DESIGN-IMPLEMENTATION.md](./DESIGN-IMPLEMENTATION.md)** — CSS variables, Tailwind config, animation code
- **Apple HIG:** https://developer.apple.com/design/human-interface-guidelines/
- **WCAG 2.1:** https://www.w3.org/WAI/WCAG21/quickref/

---

**Design System Maintained By:** Family Gifting Dashboard Team
**Questions?** Refer to component specifications or create an issue in the design repository.
