---
title: "Planned V1 Component Specs"
description: "Design specifications for Gift-Person enhancements"
created: 2025-12-06
status: draft
---

# Planned V1 Component Specifications

Design specs for new components following Soft Modernity design system.

---

## 1. PersonDropdown

**Purpose**: Reusable person selector with inline "Add New" capability
**Used by**: GiftCard, GiftForm, BulkActionBar, StatusChangeDialog

### Variants

| Variant | Use Case | Size |
|---------|----------|------|
| `compact` | GiftCard quick assign | 32px height |
| `default` | Forms, dialogs | 44px height |

### Structure

```
[Avatar (24px)] [Display Name] [Relationship badge]
```

### States

- **Empty**: "Select person..." placeholder
- **Selected**: Shows avatar + name
- **Open**: Dropdown with search, list, "Add New Person" at bottom
- **Loading**: Skeleton pulse

### Tokens

```yaml
Background: background.elevated (#FFFFFF)
Border: border.medium (#D4CDC4)
Border Focus: border.focus (#E8846B)
Radius: radius.medium (12px)
Shadow (open): shadow.medium
"Add New" icon: Plus circle, color primary.main
```

### Keyboard

- `Enter`/`Space`: Toggle dropdown
- `Arrow Up/Down`: Navigate options
- `Escape`: Close
- Type to search

### Mobile

- Opens as bottom sheet (not dropdown)
- 44px row height
- Safe area padding

---

## 2. GiftCard Quick Actions

**Purpose**: Quick access buttons on GiftCard component

### Layout

```
+----------------------------------+
| [URL btn]           Top-Right    |
|                                  |
|  Gift Content                    |
|                                  |
| [Status] [Assign]   Bottom-Right |
+----------------------------------+
```

### URL Button (Top-Right)

- **Icon**: External link (16px)
- **Size**: 32x32px (touch: 44x44px padding)
- **Variant**: `ghost`
- **Visibility**: Only if `url` exists
- **Action**: Opens URL in new tab

### Status Dropdown (Bottom-Right)

- **Trigger**: StatusPill (clickable)
- **Size**: Compact (height 28px)
- **Options**: All gift statuses with dot indicators
- **Animation**: 200ms slide-up

### Assign Recipient Button (Bottom-Right, left of status)

- **Icon**: User plus (16px)
- **Size**: 32x32px
- **Variant**: `ghost`
- **Action**: Opens PersonDropdown inline

### Tokens

```yaml
Quick action buttons:
  Background: transparent
  Hover: background.subtle (#F5F2ED)
  Active: primary.main/10
  Radius: radius.small (8px)

Container gap: spacing.2 (8px)
```

---

## 3. BulkActionBar

**Purpose**: Floating action bar when gifts are selected

### Layout (Fixed Bottom)

```
+--------------------------------------------------+
| [Clear] "12 selected"  | [Purchased] [Assign] [Delete] |
+--------------------------------------------------+
```

### Structure

- **Position**: Fixed bottom, above mobile nav
- **Height**: 56px (+ safe area)
- **Width**: 100% (max-width: 800px centered on desktop)
- **Animation**: Slide up on first selection, slide down when cleared

### Actions

| Action | Icon | Variant | Confirm? |
|--------|------|---------|----------|
| Mark Purchased | Check circle | `primary` | No |
| Assign Recipient | User | `secondary` | Opens PersonDropdown dialog |
| Assign Purchaser | User check | `secondary` | Opens PersonDropdown dialog |
| Delete | Trash | `destructive` | Yes (ConfirmDialog) |

### Tokens

```yaml
Background: glass-panel (rgba(255,255,255,0.85) + blur 12px)
Border-top: border.subtle (#E8E3DC)
Shadow: shadow.high
Radius: radius.xlarge (20px) on desktop, 0 on mobile
Padding: spacing.4 (16px)
Gap: spacing.3 (12px)

Counter text:
  Color: text.secondary (#5C534D)
  Size: 14px semibold
```

### Mobile Behavior

- Full width, no border radius
- Actions in icon-only mode with labels below
- "More" overflow for 4+ actions

---

## 4. PersonBudgetBar

**Purpose**: Display gift budget progress per person

### Layout

```
+------------------------------------------+
| Gifts to Give                 $250/$500  |
| [=========>                           ]  |
|                                          |
| Gifts Purchased               $180/$500  |
| [=======>                             ]  |
+------------------------------------------+
```

### Variants

| Variant | Use Case | Show When |
|---------|----------|-----------|
| `card` | PersonCard on /people | Has any assignments |
| `modal` | Person modal Overview | Always (0 if none) |

### Tokens

```yaml
Label:
  Color: text.tertiary (#8A827C)
  Size: 12px

Value:
  Color: text.primary (#2D2520)
  Size: 14px semibold

Progress bar:
  Height: 8px
  Radius: radius.full (9999px)
  Background: background.subtle (#F5F2ED)

  "To Give" fill: status.idea (#D4A853)
  "Purchased" fill: status.success (#7BA676)

Overage indicator:
  Fill: status.warning (#C97B63)
  Pattern: Striped overlay
```

### Conditional Display

- **Card variant**: Only show bars if count > 0
- **Modal variant**: Always show, "No gifts assigned" if empty

---

## 5. LinkedGiftsSection

**Purpose**: Display gifts linked to a person in modal

### Layout

```
+------------------------------------------+
| As Recipient (5)              [Add Gift] |
+------------------------------------------+
| [Mini Gift Card]                         |
| [Mini Gift Card]                         |
| [Mini Gift Card]                         |
| +2 more...                               |
+------------------------------------------+
| As Purchaser (3)                         |
+------------------------------------------+
| [Mini Gift Card]                         |
| ...                                      |
+------------------------------------------+
```

### Mini Gift Card

```
+----------------------------------+
| [Image 48x48] | Gift Name        |
|               | $25 - Status Pill |
+----------------------------------+
```

### Tokens

```yaml
Section header:
  Color: text.secondary (#5C534D)
  Size: 14px semibold
  Border-bottom: border.subtle (#E8E3DC)
  Padding-bottom: spacing.2 (8px)

Mini card:
  Background: background.subtle (#F5F2ED)
  Radius: radius.medium (12px)
  Padding: spacing.3 (12px)
  Gap: spacing.3 (12px)

  Title: text.primary, 14px medium
  Price: text.secondary, 12px

Image placeholder:
  Background: background.base (#FAF8F5)
  Radius: radius.small (8px)

"Add Gift" button:
  Variant: ghost
  Size: sm (32px)
  Icon: Plus
```

---

## 6. MiniCardTooltip

**Purpose**: Hoverable tooltip showing entity mini cards

### Trigger

- Gift/Occasion counts on PersonCard
- Recipient counts on OccasionCard

### Content

```
+-------------------------+
| [Mini Card 1]          |
| [Mini Card 2]          |
| [Mini Card 3]          |
| +5 more...             |
+-------------------------+
```

### Behavior

- **Trigger**: Hover (desktop), Tap (mobile)
- **Delay**: 200ms hover delay
- **Max items**: 5, then "+N more"
- **Click item**: Opens full modal
- **Animation**: Fade + scale from 95% to 100%

### Tokens

```yaml
Container:
  Background: background.elevated (#FFFFFF)
  Border: border.subtle (#E8E3DC)
  Radius: radius.large (16px)
  Shadow: shadow.high
  Padding: spacing.3 (12px)
  Max-width: 280px

Mini card gap: spacing.2 (8px)

"+N more" link:
  Color: primary.main (#E8846B)
  Size: 12px medium
```

---

## 7. SeparateSharedDialog

**Purpose**: Ask user how to handle multiple recipients

### Layout

```
+------------------------------------------+
|              Multiple Recipients          |
|                                          |
| You selected 3 recipients. How would     |
| you like to create the gift(s)?          |
|                                          |
| +--------------------------------------+ |
| | [Icon] Separate Gifts                 | |
| | Creates 3 gifts (quantity x3)         | |
| +--------------------------------------+ |
|                                          |
| +--------------------------------------+ |
| | [Icon] Shared Gift                    | |
| | One gift with 3 recipients            | |
| +--------------------------------------+ |
|                                          |
+------------------------------------------+
```

### Option Cards

- **Style**: Interactive card variant
- **Icon**: `Separate` = Copy, `Shared` = Users
- **Selection**: Radio behavior (one selected)
- **Selected state**: Primary border + subtle background

### Tokens

```yaml
Dialog:
  Width: 400px (desktop), 100% - 32px (mobile)
  Radius: radius.2xlarge (24px)
  Padding: spacing.6 (24px)

Title:
  Color: text.primary
  Size: 18px semibold

Description:
  Color: text.secondary
  Size: 14px

Option card:
  Border: border.medium
  Radius: radius.large (16px)
  Padding: spacing.4 (16px)

  Selected:
    Border: primary.main (#E8846B)
    Background: primary.main/5

  Hover:
    Border: border.strong
    Background: background.subtle
```

---

## Implementation Priority

1. **PersonDropdown** - Foundation for all person selection
2. **GiftCard Quick Actions** - High visibility, quick wins
3. **BulkActionBar** - Complex but high impact
4. **PersonBudgetBar** - Relatively simple, good visibility
5. **LinkedGiftsSection** - Moderate complexity
6. **MiniCardTooltip** - Polish feature
7. **SeparateSharedDialog** - Edge case handling

---

**Last Updated**: 2025-12-06
