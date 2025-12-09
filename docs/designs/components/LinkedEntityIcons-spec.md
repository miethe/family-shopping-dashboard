---
title: LinkedEntityIcons Component Specification
description: Design specification for the LinkedEntityIcons component showing linked recipients and lists on gift cards
audience: Frontend Developers, Designers
tags: [design, components, gifts, ui-specification]
created: 2025-12-08
updated: 2025-12-08
---

# LinkedEntityIcons Component Specification

**Component**: `LinkedEntityIcons.tsx`
**Location**: `apps/web/components/gifts/LinkedEntityIcons.tsx`
**Design System**: Soft Modernity
**Primary Use**: GiftCard component footer (Grid View)

---

## Overview

The LinkedEntityIcons component displays small, interactive icons showing linked Recipients (people) and Lists associated with a gift. It's designed to fit compactly below the gift title on GiftCard components in Grid View, providing quick visual context about gift relationships.

### Key Features

- **Recipient Icons**: Small avatars or User fallback icons with person name tooltips
- **List Icons**: CheckSquare icons with list name tooltips
- **Clickable**: All icons open respective entity modals (person detail or list detail)
- **Overflow Handling**: Shows "+N more" indicator when entities exceed `maxVisible` (default: 3)
- **Touch-Friendly**: 44x44px minimum touch targets with smaller visual icons (20-24px)
- **Accessible**: Proper ARIA labels, keyboard navigation, and screen reader support

---

## Visual Design

### Layout Pattern

```
[Recipient Avatar] [Recipient Avatar] [List Icon] [+2]
```

**Spacing**:
- Gap between icons: 6px (1.5rem, `gap-1.5`)
- Icon padding: 10px all sides for 44px touch target
- Visual icon size: 20-24px (depends on size variant)

### Icon Specifications

#### Recipient Icon (With Photo)

**Visual Appearance**:
```
┌─────────────────┐
│   ┌────────┐    │  ← 44x44px touch area
│   │ Avatar │    │
│   │ 24x24  │    │  ← 24px visual (md size)
│   └────────┘    │
└─────────────────┘
```

**Specs**:
- Container: 44x44px (touch target), rounded-full
- Visual: 24px circle (md) or 20px (sm)
- Border: 2px white
- Shadow: `shadow-low`
- Background: Avatar image or fallback initials
- Hover: Scale 1.1x (110%)
- Active: Scale 0.95x (95%)

#### Recipient Icon (No Photo Fallback)

**Specs**:
- Container: Same 44x44px touch target
- Visual: 24px (md) or 20px (sm) rounded-full
- Background: `warm-100`
- Border: 2px `warm-200`
- Icon: User icon (12px, `warm-600`)
- Hover/Active: Same scaling as photo version

#### List Icon

**Specs**:
- Container: Same 44x44px touch target
- Visual: 24px (md) or 20px (sm) rounded square (8px radius)
- Background: `primary-100` (light coral)
- Border: 2px `primary-200`
- Icon: CheckSquare (12px, `primary-600`)
- Hover/Active: Same scaling behavior

#### Overflow Indicator

**Specs**:
- Visual: 24px (md) or 20px (sm) rounded-full
- Background: `warm-200`
- Border: 2px `warm-300`
- Text: "+N" in 12px (text-xs) semibold `warm-700`
- No hover scaling (non-interactive indicator)
- Tooltip: Shows breakdown (e.g., "2 more recipients, 1 more list")

---

## Component API

### TypeScript Interface

```typescript
export interface LinkedEntityIconsProps extends VariantProps<typeof iconVariants> {
  /** Array of linked recipients (people) */
  recipients?: LinkedPerson[];
  /** Array of linked lists */
  lists?: LinkedList[];
  /** Maximum number of icons to show before overflow (default: 3) */
  maxVisible?: number;
  /** Callback when a recipient icon is clicked */
  onRecipientClick?: (personId: number) => void;
  /** Callback when a list icon is clicked */
  onListClick?: (listId: number) => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Additional CSS classes */
  className?: string;
}

export interface LinkedPerson {
  id: number;
  display_name: string;
  photo_url?: string;
}

export interface LinkedList {
  id: number;
  name: string;
}
```

### Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `recipients` | `LinkedPerson[]` | `[]` | Array of linked people (recipients) |
| `lists` | `LinkedList[]` | `[]` | Array of linked lists |
| `maxVisible` | `number` | `3` | Max icons to show before "+N more" |
| `onRecipientClick` | `(id: number) => void` | - | Callback when recipient icon clicked |
| `onListClick` | `(id: number) => void` | - | Callback when list icon clicked |
| `size` | `'sm' \| 'md'` | `'md'` | Size variant |
| `className` | `string` | - | Additional Tailwind classes |

---

## Usage Examples

### Basic Usage

```tsx
import { LinkedEntityIcons } from '@/components/gifts';

<LinkedEntityIcons
  recipients={[
    { id: 1, display_name: 'John Doe', photo_url: 'https://...' },
    { id: 2, display_name: 'Jane Smith' }, // No photo, shows User icon
  ]}
  lists={[
    { id: 10, name: 'Christmas 2024' },
  ]}
  maxVisible={3}
  onRecipientClick={(id) => openPersonModal(id)}
  onListClick={(id) => openListModal(id)}
/>
```

### On GiftCard Component

```tsx
<GiftCard gift={gift}>
  {/* ... existing card content ... */}

  {/* Add below gift title */}
  <LinkedEntityIcons
    recipients={gift.linked_people}
    lists={gift.linked_lists}
    maxVisible={3}
    onRecipientClick={(id) => setPersonModalId(id)}
    onListClick={(id) => setListModalId(id)}
  />
</GiftCard>
```

### Small Variant (Dense UI)

```tsx
<LinkedEntityIcons
  recipients={recipients}
  lists={lists}
  size="sm"
  maxVisible={4}
/>
```

### Empty State (No Icons)

When both `recipients` and `lists` are empty arrays, the component returns `null` and renders nothing.

```tsx
<LinkedEntityIcons
  recipients={[]}
  lists={[]}
/>
// Renders: null (nothing visible)
```

---

## Behavioral Specifications

### Overflow Logic

The component prioritizes recipients first, then fills remaining space with lists:

**Algorithm**:
1. Show up to `maxVisible` recipients
2. Calculate remaining space: `spaceForLists = maxVisible - visibleRecipients.length`
3. Show up to `spaceForLists` number of lists
4. Calculate overflow: `remainingRecipients + remainingLists`
5. If overflow > 0, show "+N more" indicator

**Example** (maxVisible=3):
- 2 recipients + 3 lists → Shows: [R1] [R2] [L1] (+2 overflow)
- 4 recipients + 2 lists → Shows: [R1] [R2] [R3] (+3 overflow)
- 1 recipient + 1 list → Shows: [R1] [L1] (no overflow)

### Click Behavior

**On Recipient Click**:
1. Event stops propagation (prevents GiftCard click)
2. Calls `onRecipientClick(personId)` if provided
3. Expected: Parent opens person detail modal

**On List Click**:
1. Event stops propagation
2. Calls `onListClick(listId)` if provided
3. Expected: Parent opens list detail modal

**Overflow Indicator**:
- Not clickable (no hover effect)
- Shows tooltip with breakdown on hover
- Example tooltip: "2 more recipients, 1 more list"

---

## Accessibility

### ARIA Attributes

**Recipient Button**:
```html
<button
  aria-label="View John Doe"
  type="button"
  ...
>
```

**List Button**:
```html
<button
  aria-label="View list: Christmas 2024"
  type="button"
  ...
>
```

**Overflow Indicator**:
```html
<div
  aria-label="3 more items"
  ...
>
```

### Keyboard Navigation

- All interactive icons are `<button>` elements (keyboard focusable)
- Tab order: Recipients first (left-to-right), then lists
- Enter/Space: Triggers click handler
- Focus visible: 2px primary ring with 1px offset

### Screen Readers

- Tooltips provide context on hover/focus
- ARIA labels describe action (e.g., "View John Doe")
- Overflow indicator announces total count
- Component gracefully returns `null` when empty (no DOM noise)

---

## Design System Compliance

### Colors (Soft Modernity)

**Recipient Icons**:
- Fallback background: `warm-100` (#F5F2ED)
- Fallback border: `warm-200` (#EBE7E0)
- Fallback icon: `warm-600` (#8A827C)

**List Icons**:
- Background: `primary-100` (#FDE5E0)
- Border: `primary-200` (#FBC9BC)
- Icon: `primary-600` (#D66A51)

**Overflow Indicator**:
- Background: `warm-200` (#EBE7E0)
- Border: `warm-300` (#D4CDC4)
- Text: `warm-700` (#5C534D)

**Focus States**:
- Ring: `primary-500` (#E8846B) — 2px width, 1px offset

### Border Radius

- Recipient icons: `rounded-full` (9999px)
- List icons: `rounded-lg` (8px) — matches "small" radius token
- Overflow indicator: `rounded-full`

### Shadows

- Recipient avatars: `shadow-low` (subtle elevation)
- List icons: No shadow (flat design)

### Typography

- Overflow text: 12px (`text-xs`), semibold (`font-semibold`)
- Tooltip text: 12px (`text-xs`), regular weight

### Spacing

- Icon gap: 6px (`gap-1.5` for md, `gap-1` for sm)
- Touch padding: 10px all sides (44px total touch area)

### Animations

- Hover scale: `scale-110` (1.1x)
- Active scale: `scale-95` (0.95x)
- Transition: `150ms ease-out` (duration-fast)

---

## Mobile Considerations

### Touch Targets

All interactive icons meet WCAG 2.1 AA minimum touch target size:
- **Minimum**: 44x44px (iOS/Android standard)
- **Visual icon**: 20-24px (smaller for aesthetics)
- **Padding**: 10px creates the difference

### Responsive Behavior

- Component is compact by default (fits in GiftCard footer)
- Icons stack horizontally (no wrapping)
- On very narrow screens (<375px), consider reducing `maxVisible` to 2
- Tooltips automatically position to avoid viewport overflow

### iOS/Safari Specifics

- Uses `-webkit-tap-highlight-color: transparent` (via Tailwind)
- Touch events properly handled with `onClick` + `stopPropagation`
- No 300ms click delay (modern browsers)

---

## Implementation Notes

### CVA Variants

```typescript
const iconVariants = cva(
  'inline-flex items-center gap-1.5',
  {
    variants: {
      size: {
        sm: 'gap-1',
        md: 'gap-1.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

const iconButtonVariants = cva(
  'relative rounded-full transition-all duration-150 ease-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-1',
  {
    variants: {
      size: {
        sm: 'min-w-[44px] min-h-[44px] p-2.5',
        md: 'min-w-[44px] min-h-[44px] p-2.5',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);
```

### Visual Icon Sizes

```typescript
const visualIconSize = {
  sm: 'w-5 h-5', // 20px
  md: 'w-6 h-6', // 24px
} as const;
```

### Dependencies

```typescript
import { cva, type VariantProps } from 'class-variance-authority';
import { User, CheckSquare } from '@/components/ui/icons';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Avatar, AvatarImage, AvatarFallback, getInitials } from '@/components/ui';
import { cn } from '@/lib/utils';
```

---

## Testing Checklist

### Visual Testing

- [ ] Recipient icons render correctly with photos
- [ ] Recipient icons show User fallback when no photo
- [ ] List icons render with CheckSquare icon
- [ ] Overflow indicator shows correct count
- [ ] Icons align horizontally with proper spacing
- [ ] Hover states work (scale animations)
- [ ] Active states work (press feedback)
- [ ] Focus rings visible on keyboard navigation

### Functional Testing

- [ ] `onRecipientClick` fires with correct ID
- [ ] `onListClick` fires with correct ID
- [ ] Click events stop propagation (don't trigger GiftCard)
- [ ] Tooltips show on hover/focus
- [ ] Overflow logic calculates correctly (recipients first)
- [ ] Component returns `null` when no entities
- [ ] `maxVisible` prop works correctly

### Accessibility Testing

- [ ] All icons keyboard focusable (Tab key)
- [ ] Enter/Space trigger clicks
- [ ] ARIA labels present and descriptive
- [ ] Screen reader announces icons correctly
- [ ] Focus order is logical (left-to-right)
- [ ] Touch targets meet 44x44px minimum

### Mobile Testing

- [ ] Touch targets work on iOS Safari
- [ ] Touch targets work on Android Chrome
- [ ] Icons scale appropriately on small screens
- [ ] Tooltips don't overflow viewport
- [ ] No accidental double-taps

---

## Future Enhancements

### Potential Features

1. **Group Icons**: Show group icons (e.g., "Family" group) in addition to individual recipients
2. **Inline Names**: Option to show first name text next to icon (for larger cards)
3. **Badge Counts**: Show number badge on icons (e.g., "3" on a group icon)
4. **Custom Icons**: Support custom icons via prop (for different entity types)
5. **Drag-and-Drop**: Allow reordering priorities by dragging icons
6. **Context Menu**: Right-click for quick actions (unlink, edit, etc.)

### Not Recommended

- **Vertical Stacking**: Icons should stay horizontal for consistency
- **Large Visual Icons**: Keep small to fit compact card layouts
- **Auto-Expanding**: Don't show all on hover (use modal for full list)

---

## Related Components

- **GiftCard**: Primary consumer of this component
- **Avatar**: Used for recipient icons
- **Tooltip**: Provides context on hover
- **Icon Components**: User, CheckSquare from `@/components/ui/icons`

---

## Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-08 | Initial component specification and implementation |

---

**Component File**: `/apps/web/components/gifts/LinkedEntityIcons.tsx`
**Exports**: `/apps/web/components/gifts/index.ts`
**Design System**: Soft Modernity (see `/docs/designs/DESIGN-TOKENS.md`)
