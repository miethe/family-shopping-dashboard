---
name: frontend-design
description: Create components and pages following the Family Gifting Dashboard "Soft Modernity" design system. Use when building UI components, pages, or implementing design specifications. Includes Apple-inspired warmth, generous radii, diffused shadows, and token-optimized styling.
---

# Frontend Design — Soft Modernity

Build UI components and pages following the Family Gifting Dashboard design system. This skill provides token-optimized references for the project's "Soft Modernity" aesthetic—Apple-inspired warmth, generous radii, diffused shadows, and mobile-first patterns.

## Design Philosophy: "Soft Modernity"

**Aesthetic**: Apple-inspired warmth with generous radii and diffused shadows
**Feel**: Welcoming, refined, familiar—like a well-designed iOS app
**Never**: Pure white backgrounds, harsh shadows, sharp corners, cold colors

### Core Characteristics

- **Warm Foundation**: Cream (#FAF8F5) base, never pure white
- **Generous Radii**: 10-48px border radius (cards 20-36px)
- **Diffused Shadows**: Soft, layered shadows with subtle borders
- **Warm Ink**: Brown-based text (#2D2520) instead of pure black
- **Status Colors**: Muted, harmonious (Mustard, Sage, Terracotta, Lavender)
- **Glassmorphism**: Translucent surfaces with backdrop blur (80% opacity + 12px blur)
- **Mobile-First**: 44px touch targets, safe areas, 100dvh viewport

## When to Use This Skill

**Building Components**:
- New UI components (Button, Card, Input, Modal)
- Implementing from design specs
- Creating variant systems with CVA

**Building Pages**:
- Dashboard layouts
- Responsive patterns (sidebar + bottom nav)
- Kanban columns, carousels, stat cards

**Styling Decisions**:
- Which color/spacing/radius token to use
- Component variant selection
- Mobile vs desktop layout patterns

## Quick Token Reference

### Essential Colors

```yaml
Background:
  base: "#FAF8F5"           # Creamy base (never pure white)
  subtle: "#F5F2ED"         # Slightly darker
  elevated: "#FFFFFF"       # Pure white (cards only)

Text (Warm Ink):
  primary: "#2D2520"        # Headings (warm dark brown)
  secondary: "#5C534D"      # Body text
  tertiary: "#8A827C"       # Captions

Primary (Holiday Coral):
  main: "#E8846B"           # Primary buttons, CTAs
  hover: "#D66A51"          # Hover state

Status:
  idea: "#D4A853"           # Mustard (Ideas, Shortlisted)
  success: "#7BA676"        # Sage (Purchased, Gifted)
  warning: "#C97B63"        # Terracotta (Urgent)
  progress: "#8A78A3"       # Lavender (Buying, Ordered)

Borders:
  subtle: "#E8E3DC"         # Soft borders
  medium: "#D4CDC4"         # Default borders
  strong: "#B8AFA4"         # Emphasized
  focus: "#E8846B"          # Focus rings
```

### Spacing (8px Grid)

```yaml
1: 4px    # 0.25rem
2: 8px    # 0.5rem
3: 12px   # 0.75rem
4: 16px   # 1rem
5: 20px   # 1.25rem
6: 24px   # 1.5rem
8: 32px   # 2rem
10: 40px  # 2.5rem
12: 48px  # 3rem
```

### Border Radius

```yaml
small: 8px      # Pills, badges, small buttons
medium: 12px    # Inputs, standard buttons
large: 16px     # Default cards
xlarge: 20px    # Large cards
2xlarge: 24px   # Hero cards, stat cards
3xlarge: 32px   # Extra large containers
full: 9999px    # Avatars, circular elements
```

### Shadows

```yaml
subtle:     # Level 1 - Minimal cards
  "0 1px 2px rgba(45, 37, 32, 0.04), 0 0 0 1px rgba(45, 37, 32, 0.02)"

low:        # Level 2 - Most cards
  "0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03)"

medium:     # Level 3 - Hover, dropdowns
  "0 4px 16px rgba(45, 37, 32, 0.08), 0 1px 4px rgba(45, 37, 32, 0.04)"

high:       # Level 4 - Modals, sheets
  "0 8px 32px rgba(45, 37, 32, 0.12), 0 2px 8px rgba(45, 37, 32, 0.06)"
```

## Component Variant Guide

### Button

**Variants**: `primary` (coral CTA) | `secondary` (warm gray) | `ghost` (transparent) | `glass` (translucent) | `destructive` (terracotta)
**Sizes**: `sm` (32px) | `md` (44px, default) | `lg` (52px) | `xl` (60px)
**Touch Target**: All meet 44px minimum

```tsx
// CVA Example
<Button variant="primary" size="md">Add Gift</Button>
<Button variant="secondary" size="sm">Cancel</Button>
<Button variant="glass" size="lg">Dashboard</Button>
```

### Card

**Variants**: `default` (elevated white) | `glass` (translucent blur) | `elevated` (higher shadow) | `interactive` (hover lift) | `stat` (gradient status) | `flat` (minimal shadow)
**Padding**: 20-32px
**Radius**: 16-24px

```tsx
<Card variant="glass" className="p-6 rounded-xlarge">
  {/* Glassmorphism with backdrop blur */}
</Card>

<Card variant="stat" className="p-8 rounded-2xlarge">
  {/* Stat card with gradient background */}
</Card>
```

### StatusPill

**Statuses**: `idea` | `shortlisted` | `buying` | `ordered` | `purchased` | `delivered` | `gifted` | `urgent`
**Pattern**: Dot indicator (6px) + uppercase label (12px semibold)

```tsx
<StatusPill status="idea">Idea</StatusPill>
<StatusPill status="purchased">Purchased</StatusPill>
```

### Avatar

**Sizes**: `xs` (24px) | `sm` (32px) | `md` (40px) | `lg` (56px) | `xl` (80px)
**Features**: Status rings, gift count badges
**Border**: 2px white, shadow-low

```tsx
<Avatar size="lg" status="online" badge={3} />
```

## Layout Patterns

### Desktop Sidebar + Main

```tsx
<div className="flex h-screen">
  {/* Sidebar: 240px fixed */}
  <aside className="hidden md:block w-60 glass-panel">
    <nav>...</nav>
  </aside>

  {/* Main content: flex-1 */}
  <main className="flex-1 overflow-auto">
    {children}
  </main>
</div>
```

### Mobile Bottom Nav

```tsx
<nav className="
  fixed bottom-0 left-0 right-0 md:hidden
  h-14 pb-safe-area-inset-bottom
  glass-panel border-t border-subtle
  flex items-center justify-around
  z-50
">
  {/* 4-5 nav items max, 44px touch targets */}
</nav>
```

### Responsive Breakpoints

```yaml
xs: 375px   # iPhone SE
sm: 640px   # Small tablets
md: 768px   # Tablets (sidebar shows, bottom nav hides)
lg: 1024px  # Laptops
xl: 1280px  # Desktops
```

### Safe Areas (iOS)

```tsx
className="
  pt-safe-area-inset-top
  pb-safe-area-inset-bottom
  pl-safe-area-inset-left
  pr-safe-area-inset-right
"
```

### Viewport Height

```css
/* Always use 100dvh (dynamic) instead of 100vh */
height: 100dvh;  /* Fixes iOS address bar issue */
```

## Animation Guidelines

**Use**: `anime.js` for page animations (see `./references/animejs.md`)
**Pattern**: One well-orchestrated entrance > scattered micro-interactions
**Stagger**: Use `animation-delay` for sequential reveals

```tsx
// Staggered card entrance
{cards.map((card, i) => (
  <Card
    key={card.id}
    className="animate-slide-up-fade"
    style={{ animationDelay: `${i * 100}ms` }}
  >
    {card.content}
  </Card>
))}
```

**Durations**:
- Fast: 150ms (micro-interactions)
- Default: 200ms (most interactions)
- Slow: 300ms (page transitions)
- Spring: Use ease-spring for delight

## Detailed References

When you need more detail:

- **Token values**: `./references/soft-modernity-tokens.md` — Complete color palette, spacing scale, typography
- **Component variants**: `./references/component-variants.md` — CVA patterns, Tailwind classes, all variants
- **Layout patterns**: `./references/layout-mobile.md` — Responsive layouts, safe areas, touch targets
- **Animations**: `./references/animejs.md` — anime.js v4 reference (KEEP AS-IS)

## Project Design Docs

For comprehensive design specifications:

- `docs/designs/DESIGN-TOKENS.md` — Canonical token values
- `docs/designs/COMPONENTS.md` — Component specifications
- `docs/designs/LAYOUT-PATTERNS.md` — Page layouts
- `docs/designs/DESIGN-GUIDE.md` — Philosophy and principles

## Implementation Notes

**Tailwind Config**: All tokens pre-configured in `apps/web/tailwind.config.ts`
**CSS Variables**: Available in `apps/web/app/globals.css`
**CVA**: Use for component variants (class-variance-authority)
**Utilities**: Glassmorphism via `.glass-panel` utility class

**Mobile-First**: Default styles assume mobile, add `md:` prefix for tablet+, `lg:` for desktop

## Common Patterns

### Glassmorphism Panel

```tsx
<div className="glass-panel p-6 rounded-xlarge">
  {/* 80% opacity + 12px backdrop blur */}
</div>
```

### Stat Card Grid

```tsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <StatCard value={12} label="Ideas" color="idea" />
  <StatCard value={8} label="To Buy" color="warning" />
  <StatCard value={4} label="Purchased" color="success" />
</div>
```

### Avatar Carousel

```tsx
<div className="flex gap-6 overflow-x-auto pb-2">
  {members.map(member => (
    <Avatar
      key={member.id}
      size="lg"
      status={member.status}
      badge={member.giftCount}
    />
  ))}
</div>
```

### Interactive Card with Hover Lift

```tsx
<Card
  variant="interactive"
  className="
    transition-all duration-300
    hover:shadow-medium
    hover:scale-[1.01]
    active:scale-[0.99]
  "
>
  {content}
</Card>
```

## Best Practices

1. **Always use cream base** (#FAF8F5), never pure white backgrounds
2. **44px minimum** for all touch targets
3. **Generous radii** — cards 20-24px, containers 32-48px
4. **Diffused shadows** — use layered shadows (shadow + border)
5. **Warm text** — brown-based (#2D2520), not pure black
6. **Status colors** — muted harmonious palette (mustard, sage, terracotta, lavender)
7. **Safe areas** — always include on fixed/sticky elements
8. **Dynamic viewport** — use 100dvh, not 100vh
9. **Glassmorphism** — 80% opacity + 12px backdrop blur for floating panels
10. **Staggered animations** — one orchestrated entrance beats scattered micro-interactions

## Anti-Patterns to Avoid

❌ Pure white (#FFFFFF) background
❌ Pure black (#000000) text
❌ Sharp corners (< 8px radius)
❌ Harsh shadows (no blur, high opacity)
❌ Cold colors (blues, grays without warmth)
❌ Touch targets < 44px
❌ Fixed 100vh on mobile
❌ No safe-area handling on iOS
❌ Generic AI aesthetics (Inter font, purple gradients, cookie-cutter layouts)

---

**Last Updated**: 2025-11-28
**Design System Version**: 1.0
**Project**: Family Gifting Dashboard
