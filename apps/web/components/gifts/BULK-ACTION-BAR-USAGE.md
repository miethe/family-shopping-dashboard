# BulkActionBar Component Usage

## Overview

The `BulkActionBar` component provides a fixed bottom action bar for performing bulk operations on selected gifts. It features a glass morphism design with smooth animations and handles partial failures gracefully.

## Integration Example

```tsx
// In your gifts page (e.g., apps/web/app/gifts/page.tsx)
'use client';

import { useGiftSelection } from '@/hooks/useGiftSelection';
import { BulkActionBar } from '@/components/gifts/BulkActionBar';
import { useGifts } from '@/hooks/useGifts';

export default function GiftsPage() {
  const selection = useGiftSelection();
  const { refetch } = useGifts();

  return (
    <div>
      {/* Your gift grid/list */}
      <GiftGrid
        selectionMode={selection.isSelectionMode}
        selectedIds={selection.selectedIds}
        onToggleSelection={selection.toggleSelection}
      />

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedIds={selection.selectedIds}
        onClear={selection.clearSelection}
        onActionComplete={() => refetch()}
      />
    </div>
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `selectedIds` | `Set<number>` | Yes | Set of selected gift IDs |
| `onClear` | `() => void` | Yes | Callback to clear selection |
| `onActionComplete` | `() => void` | No | Callback after successful action (typically triggers refetch) |

## Features

### Actions Supported

1. **Mark Purchased** - Sets purchase_date to today for all selected gifts
2. **Assign Recipient** - Opens person selector to assign recipient
3. **Assign Purchaser** - Opens person selector to assign purchaser
4. **Delete** - Shows confirmation dialog before deleting

### Error Handling

The component handles three result states:

- **Complete Success**: Shows success message with count
- **Complete Failure**: Shows error message
- **Partial Success**: Shows both success and failure counts

Example messages:
- Success: "3 gifts marked as purchased"
- Error: "Failed to mark gifts as purchased: Gift 5 not found"
- Partial: "2 marked as purchased, 1 failed"

### Responsive Design

- **Desktop**: Rounded top corners (20px), shows full button labels
- **Tablet**: Shows partial button labels (icon + text on some buttons)
- **Mobile**: Full width, icon-only buttons, safe area insets for iOS

### Animations

- **Show**: Slides up from bottom with `translate-y-0`
- **Hide**: Slides down with `translate-y-full`
- **Duration**: 300ms with `ease-out` timing

### Accessibility

- Minimum 44px touch targets on all buttons
- Clear aria-labels on all interactive elements
- Keyboard support through Dialog and Button components
- Focus management on dialog open/close

## API Integration

The component uses the bulk action endpoint:

```typescript
PATCH /gifts/bulk
{
  "gift_ids": [1, 2, 3],
  "action": "assign_recipient" | "assign_purchaser" | "mark_purchased" | "delete",
  "person_id"?: 5 // Required for assign actions
}

Response:
{
  "success_count": 2,
  "failed_ids": [3],
  "errors": ["Gift 3: Gift not found"]
}
```

## Styling

The component uses the Soft Modernity design system:

- **Glass Effect**: `bg-white/85 backdrop-blur-xl`
- **Border**: `border-warm-200` (#E8E3DC)
- **Shadow**: Custom elevation shadow
- **Buttons**: Pill-shaped with 36px height
- **Safe Area**: `pb-[env(safe-area-inset-bottom)]`

## Dependencies

- `@/components/ui/button` - Button component
- `@/components/ui/confirm-dialog` - Delete confirmation
- `@/components/ui/dialog` - Person assignment dialog
- `@/components/common/PersonDropdown` - Person selector
- `@/components/ui/icons` - Icon components
- `@/lib/api/endpoints` - API client (giftApi.bulkAction)
- `@/types` - Type definitions (BulkGiftAction, BulkGiftResult)

## Testing Checklist

- [ ] Component renders when selectedIds.size > 0
- [ ] Component hides when selectedIds.size === 0
- [ ] Mark Purchased action works and shows success message
- [ ] Assign Recipient opens PersonDropdown dialog
- [ ] Assign Purchaser opens PersonDropdown dialog
- [ ] Delete shows confirmation dialog
- [ ] Partial failures display error details
- [ ] Success toast auto-dismisses after 5 seconds
- [ ] Mobile layout is responsive with icon-only buttons
- [ ] Safe area insets work correctly on iOS devices
- [ ] Slide animations are smooth
- [ ] onActionComplete callback fires after successful actions

## Notes

- Result messages auto-dismiss after 5 seconds
- All actions automatically clear selection on completion
- The component is z-indexed at 50 (bar) and 60 (toast) to stay above content
- PersonDropdown and ConfirmDialog are rendered outside the main bar to avoid z-index conflicts
