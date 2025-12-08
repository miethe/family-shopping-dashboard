# Implementation Plan: "For (People)" Field Enhancement

**Target**: Gift creation/edit modals
**Scope**: UI enhancement only (no backend changes)
**Effort**: Small (~2-3 hours)

---

## Requirements

1. **Move** the "For (People)" field below the Image upload field
2. **Rename** label from "For (People)" to "For..."
3. **Redesign** options as mini-cards/chips with:
   - Small avatar (24-32px)
   - Person name
   - Tooltip on hover showing Person snapshot card

---

## Files to Modify

| File | Change |
|------|--------|
| `GiftEditModal.tsx` | Reorder field, update label |
| `ManualGiftForm.tsx` | Reorder field, update label |
| `PersonMultiSelect.tsx` | Replace buttons with PersonChip components |

## New Component

| Component | Purpose |
|-----------|---------|
| `PersonChip.tsx` | Mini-card with avatar, name, and hover tooltip |

---

## Implementation Steps

### 1. Create PersonChip Component

**Location**: `/apps/web/components/common/PersonChip.tsx`

```tsx
// PersonChip with:
// - Avatar (size="xs" or "sm", 24-32px)
// - Name text
// - Tooltip wrapper with PersonSnapshotCard
// - Selected state styling (checkmark or highlight)
// - onClick handler for selection toggle
```

**Props**:
- `person: Person` - person data
- `selected?: boolean` - whether chip is selected
- `onToggle?: (id: string) => void` - selection toggle
- `showTooltip?: boolean` - enable/disable tooltip (default: true)

### 2. Create PersonSnapshotCard Component

**Location**: `/apps/web/components/common/PersonSnapshotCard.tsx`

Lightweight tooltip content showing:
- Avatar (medium size)
- Full name
- Relationship (if set)
- Gift count summary (e.g., "5 gifts, 2 wishlists")

### 3. Update PersonMultiSelect

**File**: `/apps/web/components/common/PersonMultiSelect.tsx`

Replace current button-based display with:
- Grid of `PersonChip` components
- Selected chips highlighted (subtle background)
- Unselected chips with hover effect
- Maintain existing add-person functionality

### 4. Update GiftEditModal

**File**: `/apps/web/components/gifts/GiftEditModal.tsx`

- Move "For (People)" section from ~line 348-360 to after ImagePicker (~line 235)
- Change label from "For (People)" to "For..."

### 5. Update ManualGiftForm

**File**: `/apps/web/components/gifts/ManualGiftForm.tsx`

- Apply same field reordering
- Update label to "For..."

---

## Design Specs

### PersonChip

```
┌─────────────────────┐
│ [Avatar] Name       │  ← Chip (clickable)
└─────────────────────┘

Size: ~120-140px width, height auto
Avatar: 24px (xs size)
Padding: px-2 py-1.5
Border: rounded-full or rounded-lg
Selected: ring-2 ring-primary bg-primary/10
Hover: bg-muted
```

### PersonSnapshotCard (Tooltip)

```
┌───────────────────────────┐
│ [Avatar]  Name            │
│           Relationship    │
│                           │
│ 5 gifts · 2 wishlists     │
└───────────────────────────┘

Max-width: 200px
Padding: p-3
Background: popover background
Shadow: shadow-md
```

---

## Existing Components to Reuse

- `Avatar` from `@/components/ui/avatar`
- `Tooltip` from `@/components/ui/tooltip`
- Person type from `@/types/person`
- `usePersons` hook for person data

---

## Testing

- [ ] Chips display correctly in available list
- [ ] Selection toggles work (add/remove)
- [ ] Tooltip appears on hover (desktop)
- [ ] Tooltip disabled on touch (mobile)
- [ ] Field appears below Image upload
- [ ] Label shows "For..."
- [ ] Existing selection functionality preserved

---

## Notes

- Keep mobile touch targets at 44px minimum
- Tooltip may need delayed show (300ms) to avoid flicker
- Consider hiding tooltip on mobile (long-press alternative)
