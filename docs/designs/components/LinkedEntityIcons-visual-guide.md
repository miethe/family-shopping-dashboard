---
title: LinkedEntityIcons Visual Guide
description: Visual reference showing the LinkedEntityIcons component in various states and configurations
audience: Designers, Frontend Developers
tags: [design, visual-guide, components]
created: 2025-12-08
updated: 2025-12-08
---

# LinkedEntityIcons Visual Guide

Visual reference for the LinkedEntityIcons component showing different states and configurations.

---

## Anatomy Diagram

### Full Component Structure

```
┌──────────────────────────────────────────────────────────────────┐
│ LinkedEntityIcons Component                                      │
│                                                                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────┐     │
│  │ Recipient  │  │ Recipient  │  │    List    │  │  +2  │     │
│  │   Icon     │  │   Icon     │  │    Icon    │  │      │     │
│  │  (Avatar)  │  │  (Fallback)│  │  (Square)  │  │Overflow│   │
│  └────────────┘  └────────────┘  └────────────┘  └──────┘     │
│       ↓                ↓                ↓            ↓          │
│   Click opens      Click opens     Click opens   Tooltip only  │
│  person modal      person modal     list modal                 │
└──────────────────────────────────────────────────────────────────┘
```

### Individual Icon Anatomy

#### Recipient Icon (With Photo)

```
Touch Area (44x44px)
┌─────────────────────────────┐
│         Padding 10px        │
│   ┌───────────────────┐     │
│   │   Avatar 24x24    │     │  ← Visual icon
│   │ ┌───────────────┐ │     │
│   │ │  Photo Image  │ │     │
│   │ │   or Initials │ │     │
│   │ └───────────────┘ │     │
│   │  Border: 2px ──────────────► white
│   │  Shadow: low      │     │
│   └───────────────────┘     │
│                             │
└─────────────────────────────┘

Hover: Scale 1.1x (110%)
Active: Scale 0.95x (95%)
Focus: 2px primary ring
```

#### Recipient Icon (No Photo Fallback)

```
Touch Area (44x44px)
┌─────────────────────────────┐
│         Padding 10px        │
│   ┌───────────────────┐     │
│   │    Circle 24x24   │     │
│   │ ┌───────────────┐ │     │
│   │ │ BG: warm-100  │ │     │
│   │ │ Border: 2px ───┼─────────► warm-200
│   │ │ warm-200      │ │     │
│   │ │   ┌─────┐     │ │     │
│   │ │   │ 👤  │ 12px│ │     │  ← User icon
│   │ │   └─────┘     │ │     │     (warm-600)
│   │ └───────────────┘ │     │
│   └───────────────────┘     │
│                             │
└─────────────────────────────┘
```

#### List Icon

```
Touch Area (44x44px)
┌─────────────────────────────┐
│         Padding 10px        │
│   ┌───────────────────┐     │
│   │  Square 24x24     │     │
│   │  Radius: 8px      │     │
│   │ ┌───────────────┐ │     │
│   │ │ BG: primary-  │ │     │
│   │ │     100       │ │     │
│   │ │ Border: 2px ───┼─────────► primary-200
│   │ │   ┌───────┐   │ │     │
│   │ │   │ ☑️ 12px│   │ │     │  ← CheckSquare
│   │ │   └───────┘   │ │     │     (primary-600)
│   │ └───────────────┘ │     │
│   └───────────────────┘     │
│                             │
└─────────────────────────────┘

Hover: Scale 1.1x
Active: Scale 0.95x
Focus: 2px primary ring
```

#### Overflow Indicator

```
Non-Interactive (24x24px visual)
┌───────────────────┐
│    Circle 24x24   │
│  Radius: full     │
│ ┌───────────────┐ │
│ │ BG: warm-200  │ │
│ │ Border: 2px ──┼──────► warm-300
│ │ warm-300      │ │
│ │               │ │
│ │      +2       │ │  ← Text: 12px semibold
│ │  (warm-700)   │ │     (warm-700)
│ │               │ │
│ └───────────────┘ │
└───────────────────┘

Tooltip: "2 more recipients, 1 more list"
No hover/active effects
```

---

## Color Palette Reference

### Recipient Icons (Fallback)

| Element | Token | Hex Value |
|---------|-------|-----------|
| Background | `warm-100` | #F5F2ED |
| Border | `warm-200` | #EBE7E0 |
| Icon Color | `warm-600` | #8A827C |

### List Icons

| Element | Token | Hex Value |
|---------|-------|-----------|
| Background | `primary-100` | #FDE5E0 |
| Border | `primary-200` | #FBC9BC |
| Icon Color | `primary-600` | #D66A51 |

### Overflow Indicator

| Element | Token | Hex Value |
|---------|-------|-----------|
| Background | `warm-200` | #EBE7E0 |
| Border | `warm-300` | #D4CDC4 |
| Text Color | `warm-700` | #5C534D |

### Focus States

| Element | Token | Hex Value |
|---------|-------|-----------|
| Focus Ring | `primary-500` | #E8846B |

---

## State Variations

### Default State

```
┌──────┐  ┌──────┐  ┌──────┐
│  👤  │  │  JD  │  │  ☑️  │
│      │  │      │  │      │
└──────┘  └──────┘  └──────┘
 User     Avatar    List
 Icon
```

### Hover State (Individual Icon)

```
      ┌──────────┐
      │   Scale  │
      │   110%   │
      │  ┌──────┐│
      │  │  👤  ││  ← Icon scales up
      │  │      ││
      │  └──────┘│
      └──────────┘
   Cursor: pointer
```

### Active/Pressed State

```
   ┌──────┐
   │Scale │
   │ 95%  │  ← Icon scales down
   │ ┌──┐ │
   │ │👤│ │
   │ └──┘ │
   └──────┘
```

### Focus State (Keyboard Navigation)

```
      ╔══════════════╗
      ║ 2px primary  ║  ← Focus ring
      ║    ring      ║     (2px offset)
      ║  ┌──────┐    ║
      ║  │  👤  │    ║
      ║  │      │    ║
      ║  └──────┘    ║
      ╚══════════════╝
```

---

## Layout Examples

### Example 1: Two Recipients, One List

```
┌──────────────────────────────────────┐
│ [Avatar] [Avatar] [List Icon]        │
│  John     Sarah    Christmas         │
└──────────────────────────────────────┘

Gap: 6px between icons
Total width: ~90px
```

### Example 2: Overflow (maxVisible=3)

```
Input:
- 3 recipients
- 2 lists

Output:
┌──────────────────────────────────────┐
│ [Avatar] [Avatar] [Avatar] [+2]      │
│  John     Sarah    Mike    Overflow  │
└──────────────────────────────────────┘

Tooltip on "+2": "2 more lists"
```

### Example 3: Maximum Overflow

```
Input:
- 5 recipients
- 3 lists
- maxVisible=3

Output:
┌──────────────────────────────────────┐
│ [Avatar] [Avatar] [Avatar] [+5]      │
│  John     Sarah    Mike    Overflow  │
└──────────────────────────────────────┘

Tooltip: "2 more recipients, 3 more lists"
```

### Example 4: Lists Only

```
Input:
- 0 recipients
- 2 lists

Output:
┌──────────────────────────────────────┐
│ [List Icon] [List Icon]              │
│  Christmas  Birthday                 │
└──────────────────────────────────────┘
```

### Example 5: Empty State

```
Input:
- 0 recipients
- 0 lists

Output:
(Component returns null, nothing rendered)
```

---

## Integration on GiftCard

### Visual Position

```
┌─────────────────────────────────────┐
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │      Gift Image             │   │
│  │      (aspect-square)        │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  "LEGO Star Wars Millennium Falcon" │  ← Gift Title
│                                     │
│  [👤] [👤] [☑️]                     │  ← LinkedEntityIcons
│   ↑    ↑    ↑                       │     (NEW COMPONENT)
│  John Sarah List                    │
│                                     │
│  $149.99              [Avatar-xs]   │  ← Price + Assignee
└─────────────────────────────────────┘
```

**Placement**:
- Below gift title (`<h3>`)
- Above price/assignee footer
- Margin: 8px top, 8px bottom (`my-2`)

---

## Responsive Behavior

### Desktop (>768px)

```
┌───────────────────────────────────────┐
│ [Avatar] [Avatar] [List] [List] [+1]  │
│  24px    24px     24px   24px   24px  │
│  gap: 6px between all                 │
└───────────────────────────────────────┘
```

### Tablet (640-768px)

```
┌──────────────────────────────────┐
│ [Avatar] [Avatar] [List] [+2]    │
│  24px    24px     24px   24px    │
│  gap: 6px                        │
└──────────────────────────────────┘

Recommendation: maxVisible=3
```

### Mobile (<640px)

```
┌───────────────────────────┐
│ [Avatar] [List] [+3]      │
│  20px    20px   20px      │
│  gap: 4px                 │
└───────────────────────────┘

Recommendation: size="sm", maxVisible=2
```

---

## Tooltip Examples

### Recipient Tooltip

```
    ┌────────────────┐
    │  John Doe      │  ← Tooltip
    └────────────────┘
          ▼
    ┌──────────┐
    │  [Avatar]│
    └──────────┘
```

**Content**: Person's `display_name`
**Position**: Above icon (auto-adjusts)
**Delay**: Instant on hover

### List Tooltip

```
    ┌────────────────┐
    │ Christmas 2024 │
    └────────────────┘
          ▼
    ┌──────────┐
    │  [List]  │
    └──────────┘
```

**Content**: List's `name`
**Position**: Above icon

### Overflow Tooltip

```
    ┌─────────────────────────────┐
    │ 2 more recipients,          │
    │ 1 more list                 │
    └─────────────────────────────┘
          ▼
    ┌──────────┐
    │   [+3]   │
    └──────────┘
```

**Content**: Breakdown of overflow counts
**Format**: "{N} more {entity_type}"

---

## Animation Specifications

### Hover Animation

```
Timeline:
0ms:    Scale: 1.0   (default)
150ms:  Scale: 1.1   (hover end)

Easing: ease-out
Properties: transform (scale)
GPU-accelerated: Yes (transform property)
```

### Active/Press Animation

```
Timeline:
0ms:    Scale: 1.0   (default/hover)
150ms:  Scale: 0.95  (active)

Easing: ease-out
```

### Transition CSS

```css
transition-all duration-150 ease-out
```

---

## Accessibility Visual Indicators

### Focus Ring

```
      ┌────────────────────┐
      │                    │
   ┌──┼────────────────────┼──┐
   │  │  ┌──────────────┐  │  │
   │  │  │   [Avatar]   │  │  │  ← 2px primary-500 ring
   │  │  │              │  │  │     1px offset
   │  │  └──────────────┘  │  │
   │  │                    │  │
   └──┼────────────────────┼──┘
      │                    │
      └────────────────────┘
```

**Visible on**:
- Tab key navigation
- Keyboard focus

**Not visible on**:
- Mouse click focus (suppressed via `:focus-visible`)

---

## Developer Quick Reference

### Size Mapping

| Size | Visual Icon | Touch Area | Gap | Use Case |
|------|-------------|------------|-----|----------|
| `sm` | 20x20px | 44x44px | 4px | Dense UI, mobile |
| `md` | 24x24px | 44x44px | 6px | Default, cards |

### Class Name Patterns

**Container**:
```tsx
className="inline-flex items-center gap-1.5"
```

**Icon Button** (Touch Target):
```tsx
className="min-w-[44px] min-h-[44px] p-2.5 rounded-full transition-all duration-150 ease-out"
```

**Visual Icon** (Inside Button):
```tsx
// Recipient fallback
className="w-6 h-6 rounded-full bg-warm-100 border-2 border-warm-200"

// List icon
className="w-6 h-6 rounded-lg bg-primary-100 border-2 border-primary-200"
```

---

## Design Rationale

### Why Round Recipients, Square Lists?

- **Recipients (Round)**: Represents people, follows avatar convention (circular)
- **Lists (Square)**: Represents structured data (checklist), uses CheckSquare icon
- **Visual Distinction**: Easy to differentiate entity types at a glance

### Why 44px Touch Targets?

- **iOS HIG**: Recommends 44x44pt minimum for all touch targets
- **Android Material**: Recommends 48dp (we use 44px as compromise)
- **WCAG 2.1 AA**: Level AA requires 44x44px minimum for touch targets

### Why Recipients First in Overflow?

- **Priority**: Recipients (who the gift is for) are more important than lists (organization)
- **Context**: Users care more about "who" than "where listed"
- **Hierarchy**: Person > List in gift context

---

## Related Documentation

- **Component Spec**: `LinkedEntityIcons-spec.md`
- **Design Tokens**: `/docs/designs/DESIGN-TOKENS.md`
- **Component Library**: `/docs/designs/COMPONENTS.md`
- **Avatar Component**: `/apps/web/components/ui/avatar.tsx`
- **Tooltip Component**: `/apps/web/components/ui/tooltip.tsx`

---

**Last Updated**: 2025-12-08
**Component Version**: 1.0
