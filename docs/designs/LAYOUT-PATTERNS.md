---
title: Layout Patterns
description: Layout specifications for page structures, navigation, and responsive behavior
audience: Frontend developers implementing page layouts
tags: [layout, responsive, navigation, structure]
created: 2025-11-28
updated: 2025-11-28
---

# Layout Patterns

Layout specifications for page structures and responsive navigation behavior. For detailed component styling, see [COMPONENTS.md](./COMPONENTS.md).

---

## App Shell

The overall page structure that contains all page content.

### Desktop Layout

- **Sidebar**: 240px fixed width, always visible on left
- **Main content**: flex-1, full-height scrollable area
- **Header**: Optional, placed within main content area
- **Footer**: Optional, at bottom of main content area

### Mobile Layout

- **Header**: Sticky top, 56px height (includes safe-area padding)
- **Main content**: Flex-1, full-height scrollable area below header
- **Bottom navigation**: Fixed, 56px height + bottom safe-area padding
- **NO sidebar**: Sidebar hidden completely on mobile
- **Touch targets**: All interactive elements minimum 44x44px

### Safe Areas (Critical for iOS)

Apply safe-area insets to all edge-to-edge layouts:

```css
padding-top: env(safe-area-inset-top);
padding-left: env(safe-area-inset-left);
padding-right: env(safe-area-inset-right);
padding-bottom: env(safe-area-inset-bottom);
```

Common use cases:
- Fixed headers and navigation bars
- Full-width background colors
- Sticky positioned elements

### Viewport Height (Critical)

Always use `100dvh` (dynamic viewport height) instead of `100vh`:

```css
height: 100dvh; /* NOT 100vh - fixes iOS address bar collapse issue */
```

This prevents layout shift when the mobile address bar hides/shows.

---

## Desktop Sidebar

Fixed left navigation sidebar for desktop layouts.

### Structure

```
┌──────────────────┐
│ Logo             │
├──────────────────┤
│ Navigation Items │
│ • Dashboard      │
│ • People         │
│ • Occasions      │
│ • Lists          │
│ • Gifts          │
├──────────────────┤
│ User Profile     │
│ Settings         │
└──────────────────┘
```

### Specifications

- **Width**: 240px fixed (no resize)
- **Position**: Fixed to left, full viewport height
- **Background**: 80% opacity creamy white with 12px backdrop blur
- **Border**: 1px subtle right border
- **Shadow**: Translucent shadow with inset highlight
- **Scroll**: Internal scroll if content exceeds viewport height
- **Z-index**: Below modals, above main content

### Desktop Breakpoint

Sidebar visible on `md` breakpoint and above (768px+).

---

## Bottom Navigation (Mobile)

Fixed navigation for small screens, hidden on desktop.

### Structure

```
┌─────────────────────────────────────────────┐
│ Dashboard │ People │ Occasions │ Lists │... │
└─────────────────────────────────────────────┘
```

### Specifications

- **Position**: Fixed to bottom, full viewport width
- **Height**: 56px + `env(safe-area-inset-bottom)`
- **Background**: Translucent surface with 12px backdrop blur
- **Border**: 1px subtle top border
- **Items**: 4-5 navigation items maximum
- **Item format**: Icon + label
- **Touch targets**: Each item minimum 44x44px
- **Z-index**: High (z-50+), below modals
- **Safe area**: Add padding-bottom for bottom safe area

### Active State Styling

- **Background**: Accent color (holiday coral)
- **Icon**: Filled version
- **Label**: Bold, accent color
- **Indicator**: Optional bottom line or badge

### Mobile Breakpoint

Bottom nav visible on `md` breakpoint and below (767px-).

---

## Dashboard Layout

Main dashboard page structure with featured content and summary panels.

### Desktop Structure

```
┌──────────────────────────────────────────────┐
│ Sidebar  │  Main Content Area                │
│          │  ┌──────────────────────────────┐ │
│          │  │ Header / Occasion Title      │ │
│          │  └──────────────────────────────┘ │
│          │                                   │
│          │  ┌──┐  ┌──┐  ┌──┐                 │
│          │  │12│  │ 8│  │ 4│ Stat Cards     │
│          │  └──┘  └──┘  └──┘                 │
│          │                                   │
│          │  ┌──────────────────────────────┐ │
│          │  │ Family Members Carousel      │ │
│          │  └──────────────────────────────┘ │
│          │                                   │
│          │  ┌──────────────────────────────┐ │
│          │  │ Recent Activity Panel        │ │
│          │  └──────────────────────────────┘ │
└──────────────────────────────────────────────┘
```

### Mobile Structure

```
┌─────────────────────────┐
│ Header                  │
├─────────────────────────┤
│ Occasion Title          │
├─────────────────────────┤
│ Stat Cards (Stacked)    │
├─────────────────────────┤
│ Family Members (Scroll) │
├─────────────────────────┤
│ Recent Activity         │
├─────────────────────────┤
│ Bottom Nav              │
└─────────────────────────┘
```

### Content Sections

#### Featured Occasion Card

- Large, prominent card at top
- Sets context for entire dashboard
- Shows current/upcoming occasion details
- Can include CTA buttons

#### Stat Cards Row

- **Desktop**: 3 columns in grid layout
- **Mobile**: Single column stack (each card full width)
- Cards show: Ideas count, To Buy count, Purchased count
- Color-coded: coral, mustard, sage respectively
- Padding: 8px, gap: 6 units (24px)

#### Family Members Carousel

- Horizontal scroll container
- Large avatar bubbles (64px diameter)
- Status rings around avatars
- Gift count badge overlay
- Name label below each avatar
- Gap: 6 units (24px) between items

#### Recent Activity Panel

- Shows recent gift updates and actions
- Soft shadow for depth
- Can have light background or transparent
- Scrollable if content exceeds available space

---

## Stat Cards

Summary metric cards displaying key numbers.

### Layout

- **Desktop**: `grid-cols-3` - three equal-width cards in a row
- **Mobile**: `grid-cols-1` - single column stack
- **Gap**: 6 units (24px)
- **Margin**: 12 units (48px) bottom

### Card Specifications

- **Padding**: 8 units (32px)
- **Border**: 2px top/left/right, colored
- **Rounded**: 2xl (20px)
- **Shadow**: Medium depth shadow
- **Background**: Gradient from light accent to lighter accent
- **Number**: Display size, heavy weight, accent color
- **Label**: Body-small, semibold, uppercase, accent color
- **Minimum height**: 120px

---

## Avatar Carousel

Horizontal scrolling list of family members with indicators.

### Structure

```
┌─────────────────────────────────────────┐
│ Family Members                          │
│ ┌───┐  ┌───┐  ┌───┐  ┌───┐  ┌───┐ ... │
│ │ 3 │  │ 5 │  │ 1 │  │ 2 │  │ 7 │     │
│ │ J │  │ M │  │ S │  │ T │  │ A │     │
│ └───┘  └───┘  └───┘  └───┘  └───┘ ... │
└─────────────────────────────────────────┘
```

### Specifications

- **Container**: Padding 6 units (24px), rounded xlarge, low shadow
- **Scroll**: Horizontal scroll, hide scrollbar
- **Items**: Flex-shrink-0, centered text
- **Avatar**: 64px diameter, 3px white border, low shadow
- **Status Ring**: Absolute position, inset -2px, status color gradient
- **Gift Badge**: 24px diameter, absolute position bottom-right, coral background
- **Badge**: White text, xs font, bold, 2px white border
- **Name**: body-small, semibold, 2px margin-top
- **Gap**: 6 units (24px) between avatars
- **Padding-bottom**: 2px to allow scrollbar if needed

---

## Kanban Columns (List Detail View)

Status-based column layout for gift lists.

### Structure

```
┌───────────────┬───────────────┬───────────────┐
│ Ideas (5)     │ Shortlisted(3)│ Purchased (2) │
├───────────────┼───────────────┼───────────────┤
│ ┌───────────┐ │ ┌───────────┐ │ ┌───────────┐ │
│ │ LEGO Set  │ │ │ Book      │ │ │ Watch     │ │
│ │ $49.99    │ │ │ $25.00    │ │ │ $199.99   │ │
│ └───────────┘ │ └───────────┘ │ └───────────┘ │
│ ┌───────────┐ │ ┌───────────┐ │               │
│ │ Headphones│ │ │ Sweater   │ │               │
│ │ $79.99    │ │ │ $65.00    │ │               │
│ └───────────┘ │ └───────────┘ │               │
└───────────────┴───────────────┴───────────────┘
```

### Desktop Specifications

- **Container**: Flex row, horizontal scroll, padding-bottom 6 units
- **Columns**: 320px fixed width, flex-shrink-0
- **Header**: Padding 4 units, gradient background, 4px bottom border, rounded-top-large
- **Header Title**: heading-3, semibold, accent color
- **Item Count**: body-small, lighter color, in parentheses
- **Column Content**: Padding 4 units, minimum height 400px, rounded-bottom-large
- **Cards**: Padding 4 units, white background, low shadow, subtle border, rounded-large
- **Card Hover**: Shadow increases to medium
- **Card Image**: Full width, 128px height, object-cover, rounded-medium
- **Card Title**: heading-3, semibold, margin-bottom 2 units
- **Card Footer**: Flex, price and avatar, centered vertically
- **Card Gap**: 4 units (16px) between cards in column

### Mobile Specifications

- **Layout**: Single column stack, no horizontal scroll
- **Column Width**: Full viewport width
- **Card Stacking**: All cards visible, vertical scroll
- **Touch**: No hover states (use active/press instead)

---

## Responsive Breakpoints

Layout behavior changes at these Tailwind breakpoints:

| Breakpoint | Width | Layout Changes |
|-----------|-------|-----------------|
| **sm** | 640px | 2-column grids, reduced padding |
| **md** | 768px | Sidebar appears, bottom nav hides, 3-column grids |
| **lg** | 1024px | Increased spacing, max-width containers |
| **xl** | 1280px | Max content width (1280px), centered |
| **2xl** | 1536px | Maintain max-width, additional side padding |

### Mobile-First Approach

- Default styles assume mobile (< 640px)
- Add `md:` prefix for tablet (768px+)
- Add `lg:` prefix for desktop (1024px+)
- Add `xl:` prefix for large desktop (1280px+)

### Key Transitions

1. **640px (sm)**: Multi-column layouts activate
2. **768px (md)**: Sidebar becomes visible, bottom nav hides
3. **1024px (lg)**: 3-column grids, more generous spacing
4. **1280px (xl)**: Max-width constraints, centered content

---

## Common Spacing Values

Consistent spacing throughout layouts:

- **xs**: 0.5 units (2px)
- **sm**: 1 unit (4px)
- **md**: 2 units (8px)
- **lg**: 3 units (12px)
- **xl**: 4 units (16px)
- **2xl**: 6 units (24px)
- **3xl**: 8 units (32px)

---

## Z-Index Hierarchy

Layering order for overlapping elements:

```
1000+  Modal backdrops, modals, popovers
 800   Mobile bottom navigation
 500   Fixed headers, sidebars
 400   Sticky subsections
   1   Default (cards, components)
   0   Background, base
```

---

## Safe Area Examples

### Fixed Header on iOS

```typescript
<header className="
  fixed top-0 left-0 right-0
  pt-safe-area-inset-top
  pl-safe-area-inset-left
  pr-safe-area-inset-right
">
  {/* Content */}
</header>
```

### Full-Width Background with Safe Area

```typescript
<div className="
  w-screen
  bg-primary-100
  pl-safe-area-inset-left
  pr-safe-area-inset-right
  mb-safe-area-inset-bottom
">
  {/* Content */}
</div>
```

---

## Related Documents

- [COMPONENTS.md](./COMPONENTS.md) - Detailed component styling
- [COLOR-SYSTEM.md](./COLOR-SYSTEM.md) - Color palette and application
- [TYPOGRAPHY.md](./TYPOGRAPHY.md) - Font sizes and text styles
- [DESIGN-GUIDE.md](./DESIGN-GUIDE.md) - Complete design system overview
