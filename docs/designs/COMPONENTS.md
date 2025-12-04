---
title: Component Specifications
description: Design specifications for all UI components used in the Family Gifting Dashboard
audience: Designers, Frontend Developers
tags: [design, components, ui, specifications]
created: 2025-11-28
updated: 2025-11-28
---

# Component Specifications

Design specifications for UI components in the Family Gifting Dashboard.

**Related Documentation:**
- For color values and token names, see [DESIGN-TOKENS.md](./DESIGN-TOKENS.md)
- For design philosophy and usage patterns, see [DESIGN-GUIDE.md](./DESIGN-GUIDE.md)

---

## Button

The primary interaction element. Comes in multiple variants for different contexts.

### Button Variants

| Variant | Background | Text Color | Border | Use Case |
|---------|------------|-----------|--------|----------|
| **Primary** | `primary-500` | white | none | Main actions (Add Gift, Submit) |
| **Secondary** | `warm-100` | `warm-900` | `warm-300` | Secondary actions (Cancel) |
| **Tertiary** | transparent | `primary-600` | none | Tertiary actions (Learn More) |
| **Danger** | `status-warning-500` | white | none | Dangerous actions (Delete) |

**Hover States:**
- Primary: `primary-600` background, `shadow-medium`
- Secondary: `warm-200` background, darkened border
- Tertiary: `warm-100` background
- Danger: `status-warning-600` background, `shadow-medium`

**Active States:**
- All variants: Further darkened background, `shadow-subtle`

**Disabled State:**
- All variants: 40% opacity, no hover effects, `cursor-not-allowed`

### Button Sizes

| Size | Height | Padding | Font | Min Width | Use Cases |
|------|--------|---------|------|-----------|-----------|
| **sm** | 32px | 12px 16px | `label-small` (14px) | 64px | Dense UI, secondary locations |
| **md** | 44px | 12px 24px | `label-large` (16px) | 80px | Default, most situations |
| **lg** | 52px | 16px 32px | `heading-3` (18px) | 96px | Prominent CTAs |

**Touch Target:** All buttons meet or exceed 44px height (accessibility standard).

### Button States

| State | Visual Change | Duration |
|-------|---------------|----------|
| **Default** | Base colors, `shadow-low` | — |
| **Hover** | Darker background, `shadow-medium` | 200ms |
| **Active/Pressed** | Even darker background, `shadow-subtle` | 200ms |
| **Focus** | 2px ring in primary color, 2px offset | — |
| **Disabled** | 40% opacity, no interactions | — |
| **Loading** | Spinner overlay, disabled interactions | — |

**Transition:** `ease-out 200ms` for all state changes

---

## Card

The fundamental container for content grouping.

### Card Variants

#### Elevated Card (Default)

Standard card with subtle elevation and hover lift effect.

**Specs:**
- Background: `surface-primary` (pure white)
- Padding: 24px (`spacing-6`)
- Border radius: 20px (`xlarge`)
- Border: 1px `border-subtle`
- Shadow: `shadow-low` → `shadow-medium` on hover
- Transition: 300ms `ease-out`

#### Interactive Card

Clickable cards with scale and border interaction feedback.

**Specs:**
- Same as Elevated Card
- Scale: 1% up on hover, 1% down on active
- Border: Darkens to `border-medium` on hover
- Cursor: pointer
- Additional interaction feedback on press

#### Stat Card

Dashboard cards displaying key metrics.

**Specs:**
- Background: Gradient (`from-[shade]-50 to-[shade]-100`, status-specific)
- Padding: 32px (`spacing-8`)
- Border radius: 24px (`2xlarge`)
- Border: 2px (status-specific `-200` shade)
- Shadow: `shadow-medium`
- No hover state (not interactive)
- Large number + small label pattern

#### Flat Card (Minimal)

Minimal card with reduced elevation.

**Specs:**
- Background: `surface-secondary`
- Padding: 20px (`spacing-5`)
- Border radius: 16px (`large`)
- Border: 1px `border-subtle`
- Shadow: `shadow-subtle`

---

## Input Fields

Form inputs with warm, friendly styling.

### Text Input & Select

**Specs:**
- Height: 48px (including border)
- Padding: 16px horizontal, 12px vertical
- Border: 2px `border-medium` → `primary-500` on focus
- Focus ring: 2px `primary-200` glow
- Border radius: 12px (`medium`)
- Font size: 16px (prevents iOS auto-zoom)
- Background: white
- Text color: `warm-900` (`body-large`)
- Placeholder: `warm-400`

**States:**
- Default: 2px `border-medium`, `shadow-subtle`
- Focus: 2px `border-primary-500`, 2px `ring-primary-200`
- Error: 2px `border-error-500`, 2px `ring-error-200`
- Disabled: Opacity 40%, `cursor-not-allowed`

**Select-specific:**
- Custom chevron arrow via SVG background
- Positioned `bg-right-4`
- `appearance-none` for custom styling

### Textarea

**Specs:**
- Minimum height: 120px
- Padding: 16px horizontal, 12px vertical
- Border radius: 12px (`medium`)
- Border: 2px `border-medium` → `primary-500` on focus
- Resize: Vertical only (`resize-y`)
- Font size: 16px
- Same focus/error states as text input

### Label

**Specs:**
- Font: `body-small` (14px), semibold, uppercase
- Color: `warm-800`
- Tracking: wide (0.05em)
- Margin below: 8px (`mb-2`)
- Display: block, full width

---

## Status Pills

Small colored indicators for status and state categories.

### Status Pill Anatomy

**Specs:**
- Display: inline-flex, items-center, gap-1.5
- Padding: 12px horizontal, 6px vertical
- Border radius: 8px (`small`)
- Font: 12px (`label-small`) semibold uppercase
- Border: 1px (status-specific)
- Dot indicator: 6px filled circle

### Status Mapping

| Status | Background | Text | Border | Dot Color |
|--------|------------|------|--------|-----------|
| **Idea** | `status-idea-100` | `status-idea-800` | `status-idea-300` | `status-idea-600` |
| **Shortlisted** | `status-idea-100` | `status-idea-800` | `status-idea-300` | `status-idea-600` |
| **Buying** | `status-progress-100` | `status-progress-800` | `status-progress-300` | `status-progress-600` |
| **Ordered** | `status-progress-100` | `status-progress-800` | `status-progress-300` | `status-progress-600` |
| **Purchased** | `status-success-100` | `status-success-800` | `status-success-300` | `status-success-600` |
| **Delivered** | `status-success-100` | `status-success-800` | `status-success-300` | `status-success-600` |
| **Gifted** | `status-success-100` | `status-success-800` | `status-success-300` | `status-success-600` |

---

## Avatar

Profile pictures with optional status rings and indicators.

### Avatar Sizes

| Size | Dimension | Tailwind | Use Case |
|------|-----------|----------|----------|
| **xs** | 24px | `w-6 h-6` | List indicators, compact UI |
| **sm** | 32px | `w-8 h-8` | Card metadata, headers |
| **md** | 40px | `w-10 h-10` | Default, most contexts |
| **lg** | 56px | `w-14 h-14` | Profile sections, detail pages |
| **xl** | 80px | `w-20 h-20` | Hero/profile sections |

**Base Specs:**
- Border: 2px white
- Border radius: full (circle)
- Shadow: `shadow-low`

### Avatar Status Ring

Ring indicator for active/offline status.

**Specs:**
- Ring width: 2px
- Color: Status-specific (e.g., `status-success-500` for online)
- Border: 2px white
- Positioned: `-bottom-0.5 -right-0.5` (bottom-right corner)

**Carousel Special Case:**
- Ring width: 3px (intentionally larger for visual emphasis at small sizes)

### Avatar Group (Overlap)

Multiple avatars displayed with overlap.

**Specs:**
- Container: `flex -space-x-3` (negative margin creates 12px overlap)
- Stacking: First avatar `z-30`, decreasing by 10 per avatar
- Counter badge: Background `warm-300`, text `warm-800`, centered "+N"
- Counter styling: Same size as largest avatar, rounded-full

---

## Modal / Dialog

Overlay panels for focused interactions.

### Modal Structure

**Overlay:**
- Position: fixed, covers viewport (`inset-0`, `z-40`)
- Background: `overlay-strong` with `backdrop-blur-sm` (blur-2px)
- Animation: fadeIn (200ms ease-out)

**Container:**
- Position: fixed, centered (`inset-0`, flex centered, `z-50`)
- Padding: 24px (`p-6`)

**Modal Box:**
- Width: Full (mobile) to `max-w-lg` (540px, desktop)
- Background: `surface-primary`
- Border radius: 24px (`2xlarge`)
- Border: 1px `border-subtle`
- Shadow: `shadow-extra-high`
- Animation: scaleIn (scale 95% → 100%, 200ms)

### Modal Sections

**Header:**
- Padding: 32px (`px-8 py-6`)
- Border-bottom: 1px `border-subtle`
- Title: `heading-1` bold `warm-900`
- Subtitle: `body-medium` `warm-600`, margin-top 4px

**Content:**
- Padding: 32px (`px-8 py-6`)
- Flexible height, scrollable if needed

**Footer:**
- Padding: 32px (`px-8 py-6`)
- Border-top: 1px `border-subtle`
- Layout: flex, items-center, justify-end, gap-3
- Buttons: Typically Cancel + Primary action

### Modal Animations

**fadeIn:**
```
0%: opacity 0
100%: opacity 1
Duration: 200ms ease-out
```

**scaleIn:**
```
0%: opacity 0, transform scale(95%)
100%: opacity 1, transform scale(100%)
Origin: center
Duration: 200ms ease-out
```

---

## Loading States

### Spinner

Rotating indicator for operations in progress.

**Specs:**
- Dimensions: 32px (`w-8 h-8`)
- Border: 4px `border-warm-200` (light gray background)
- Top border: 4px `border-t-primary-500` (colored indicator)
- Border radius: full (circle)
- Animation: `spin` (continuous 1s rotation)

**Sizing:**
- Small: 24px (`w-6 h-6`)
- Medium: 32px (`w-8 h-8`) — default
- Large: 48px (`w-12 h-12`)

### Skeleton Loader

Pulsing placeholder for content loading.

**Specs:**
- Animation: `pulse` (opacity 0.5 → 1 → 0.5, 2s infinite)
- Base color: `warm-200` (very light gray)
- Border radius: `medium` (12px) for text, `large` (16px) for images
- Layout: Stacked blocks mimicking content shape

**Patterns:**
- Heading line: 24px height, 75% width
- Body lines: 16px height, full width, 85% width (last line)
- Image block: 200px height, full width
- Spacing: 12px between blocks

### Progress Bar

Horizontal progress indicator.

**Specs:**
- Height: 4px
- Background: `warm-200` (light gray)
- Filled: `primary-500` (coral accent)
- Border radius: full (pill shape)
- No animation (static value) or `ease-in-out 300ms` transitions
- Width: Percentage-based (`0%` to `100%`)

### Progress Ring

Circular progress indicator.

**Specs:**
- Size: 48px or 64px
- Stroke width: 4px
- Background circle: `warm-200`
- Progress circle: `primary-500` (animated with SVG stroke-dasharray)
- Center number: `heading-2` bold `warm-900`
- No border radius (true circle)

---

## Component Usage Guidelines

### Consistency

All components use the same design tokens for colors, spacing, and typography. See DESIGN-TOKENS.md for token names and values.

### Accessibility

- All buttons meet 44px minimum touch target
- Focus states visible on all interactive elements (2px ring)
- Labels explicitly associated with inputs
- Status pills include dot indicator for color-blind accessibility
- Modals manage focus and escape key handling

### Mobile Responsiveness

- Cards, inputs, and buttons scale fluidly
- Modals adapt to mobile (full height with padding)
- Avatars remain circular and properly sized
- Touch targets always meet 44px minimum

### Animation Performance

- All transitions use `ease-out` for snappy feel
- Duration: 200ms for micro-interactions, 300ms for layouts
- Prefer `transform` and `opacity` for performance
- GPU-accelerated animations where possible

---

**Version:** 1.0
**Last Updated:** 2025-11-28
