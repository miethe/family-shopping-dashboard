---
title: QuickPurchaseButton Component Specification
component: QuickPurchaseButton
status: implemented
design_system: Soft Modernity
created: 2025-12-08
updated: 2025-12-08
---

# QuickPurchaseButton Component Specification

## Overview

The **QuickPurchaseButton** is a small, circular icon button positioned in the bottom-right corner of each GiftCard. It provides a quick way to mark a gift as purchased without opening the full gift detail modal. The component handles both single-list and multi-list scenarios, follows the Soft Modernity design system, and ensures mobile accessibility with proper touch targets.

**Location**: `apps/web/components/gifts/QuickPurchaseButton.tsx`

---

## Design Goals

1. **Quick Action**: Allow users to mark gifts as purchased with a single tap/click
2. **Context-Aware**: Handle gifts that belong to multiple lists gracefully
3. **Visual Feedback**: Clear visual states for actionable, loading, and completed states
4. **Mobile-First**: 44x44px minimum touch targets for iOS/mobile compliance
5. **Accessible**: Proper ARIA labels and keyboard navigation support
6. **Optimistic UI**: Immediate visual feedback with React Query optimistic updates

---

## Visual Design

### States

#### 1. Default (Actionable)
**When**: Gift has not been purchased yet
**Appearance**:
- Icon: ShoppingCart icon
- Background: White (`#FFFFFF`)
- Border: 2px solid warm sage (`#7BA676` / `status-success-400`)
- Icon color: Warm sage (`status-success-600`)
- Size: 44x44px circular button
- Shadow: None (subtle on hover)

**Hover**:
- Background: Soft sage tint (`status-success-50` / `#F3F7F2`)
- Border: Darker sage (`status-success-500` / `#7BA676`)
- Shadow: Medium elevation (`shadow-medium`)
- Scale: Active scale down to 95% on press

#### 2. Loading
**When**: Purchase mutation is in progress
**Appearance**:
- Icon: Spinner (animated)
- Background: Light warm (`warm-100` / `#F5F2ED`)
- Border: 2px solid warm (`warm-300`)
- Icon color: Medium warm (`warm-600`)
- Cursor: `cursor-wait`
- Animation: Continuous spin

#### 3. Purchased (Disabled)
**When**: Gift has been marked as purchased
**Appearance**:
- Icon: CheckCircle2 icon
- Background: Light success (`status-success-100` / `#E4EDE2`)
- Border: 2px solid success (`status-success-300`)
- Icon color: Dark success (`status-success-700`)
- Opacity: 60%
- Cursor: `cursor-not-allowed`

#### 4. Multiple Lists (Dropdown)
**When**: Gift belongs to multiple lists (shows dropdown on click)
**Appearance**:
- Icon: ShoppingCart + ChevronDown
- Background: White
- Border: 2px solid warm sage
- Padding: 12px horizontal (wider to fit two icons)
- Min-width: 44px, height: 44px

**Dropdown Menu**:
- Position: Above button (`bottom-full right-0 mb-2`)
- Background: White with border (`border-warm-200`)
- Shadow: Medium (`shadow-medium`)
- Animation: Fade-in with slide-up (`animate-in fade-in-0 slide-in-from-bottom-2`)
- Min-width: 200px

---

## Component API

### Props

```typescript
export interface ListItemInfo {
  id: number;              // ListItem ID
  list_id: number;         // Parent List ID
  list_name: string;       // Display name for dropdown
  status: ListItemStatus;  // Current status
}

export interface QuickPurchaseButtonProps {
  /** Gift ID */
  giftId: number;

  /** List items this gift belongs to (can be multiple lists) */
  listItems: ListItemInfo[];

  /** Optional className for custom styling */
  className?: string;

  /** Callback when purchase is completed (optional) */
  onPurchaseComplete?: () => void;
}
```

### Usage Examples

#### Single List
```tsx
<QuickPurchaseButton
  giftId={123}
  listItems={[
    {
      id: 1,
      list_id: 10,
      list_name: "Christmas 2024",
      status: "selected"
    }
  ]}
  onPurchaseComplete={() => {
    toast.success('Gift marked as purchased!');
  }}
/>
```

#### Multiple Lists
```tsx
<QuickPurchaseButton
  giftId={456}
  listItems={[
    { id: 2, list_id: 10, list_name: "Christmas 2024", status: "selected" },
    { id: 3, list_id: 15, list_name: "Birthday - Mom", status: "idea" }
  ]}
  onPurchaseComplete={() => {
    console.log('Purchased in one of the lists');
  }}
/>
```

#### All Purchased
```tsx
<QuickPurchaseButton
  giftId={789}
  listItems={[
    { id: 4, list_id: 10, list_name: "Christmas 2024", status: "purchased" }
  ]}
/>
// Renders as disabled with checkmark icon
```

---

## Behavior

### Single List Flow
1. User clicks button
2. Event propagation stopped (prevent card click)
3. Mutation triggered to update list item status to "purchased"
4. Optimistic UI update shows loading spinner
5. On success, button shows purchased state
6. `onPurchaseComplete` callback fired (if provided)

### Multiple Lists Flow
1. User clicks button
2. Dropdown menu appears above button
3. Menu shows all lists where status is NOT "purchased"
4. User selects a list
5. Mutation triggered for that specific list item
6. Dropdown closes
7. Button updates to show partial/full purchased state
8. `onPurchaseComplete` callback fired

### State Logic

```typescript
// All purchased check
const allPurchased = listItems.every((item) => item.status === 'purchased');

// Single vs multiple lists
const hasSingleList = listItems.length === 1;
const hasMultipleLists = listItems.length > 1;

// Determine button variant
if (allPurchased) return <DisabledButton />;
if (hasSingleList) return <SingleActionButton />;
if (hasMultipleLists) return <DropdownButton />;
```

---

## Integration with Existing Hooks

### useUpdateListItemStatus

The component uses the existing `useUpdateListItemStatus` hook from `@/hooks/useListItems`:

```typescript
const updateStatusMutation = useUpdateListItemStatus(listId);

updateStatusMutation.mutate(
  {
    itemId: listItem.id,
    status: 'purchased',
  },
  {
    onSuccess: () => {
      onPurchaseComplete?.();
    },
  }
);
```

**React Query Cache Invalidation**:
- Automatically invalidates `['list-items', listId]` query
- Automatically invalidates `['lists']` query to update item counts
- Real-time sync via WebSocket (if list is subscribed)

---

## Design System Compliance

### Colors (Soft Modernity)

| Element | Token | Hex Value | Usage |
|---------|-------|-----------|-------|
| Border (default) | `status-success-400` | `#8AAA84` | Actionable border |
| Border (hover) | `status-success-500` | `#7BA676` | Hover border |
| Background (hover) | `status-success-50` | `#F3F7F2` | Hover background |
| Icon (default) | `status-success-600` | `#668B61` | Icon color |
| Icon (purchased) | `status-success-700` | `#51704E` | Disabled icon |
| Background (purchased) | `status-success-100` | `#E4EDE2` | Disabled background |
| Border (purchased) | `status-success-300` | `#A0BD9B` | Disabled border |

### Spacing
- Button size: `44px × 44px` (touch target)
- Icon size: `20px × 20px` (`w-5 h-5`)
- Border width: `2px`
- Dropdown padding: `12px` vertical, `12px` horizontal
- Dropdown min-width: `200px`

### Border Radius
- Button: `rounded-full` (9999px)
- Dropdown: `rounded-large` (16px / 1rem)

### Shadows
- Default: None
- Hover: `shadow-medium` (Level 3 elevation)
- Dropdown: `shadow-medium`

### Animations
- Transition: `duration-200 ease-out`
- Active scale: `scale-95` (98%)
- Dropdown: `animate-in fade-in-0 slide-in-from-bottom-2`

---

## Accessibility

### ARIA Labels
```tsx
// Actionable state
aria-label="Mark as purchased"

// Loading state
aria-label="Marking as purchased..."

// Purchased state
aria-label="Purchased"

// Multiple lists
aria-label="Mark as purchased (select list)"
aria-expanded={showDropdown}
```

### Touch Targets
- Minimum size: `44px × 44px` (iOS Human Interface Guidelines)
- Applied via: `min-h-[44px] min-w-[44px]`
- Dropdown items: `min-h-[44px]` for each list option

### Keyboard Navigation
- Button is focusable (default `<button>` behavior)
- Focus ring: `focus:ring-2 focus:ring-status-success-500 focus:ring-offset-2`
- Dropdown closes on outside click (via `useEffect` + `mousedown` listener)

### Stop Propagation
- All button clicks stop event propagation to prevent GiftCard modal from opening
- Dropdown interactions also stop propagation

```typescript
onClick={(e) => {
  e.stopPropagation(); // Critical for nested interactive elements
  handleAction();
}}
```

---

## Edge Cases

### No List Items
```typescript
if (listItems.length === 0) return null;
```
Component does not render if `listItems` array is empty.

### All Lists Purchased
If all list items have `status: 'purchased'`, button shows disabled purchased state with checkmark icon.

### Partial Purchase (Multiple Lists)
If some lists are purchased but not all:
- Button remains actionable
- Dropdown shows only unpurchased lists
- Filter: `listItems.filter((item) => item.status !== 'purchased')`

### Loading State
When mutation is pending:
- Button shows spinner icon
- Cursor changes to `cursor-wait`
- Button is disabled
- Prevents double-clicks

### Error Handling
React Query handles errors automatically:
- Failed mutations trigger retry logic (default: 3 retries)
- UI reverts to previous state on error
- Toast notifications should be added by parent component via `onError` in mutation

---

## Integration with GiftCard

### Positioning
The button should be positioned in the **bottom-right corner** of the GiftCard component:

```tsx
// In GiftCard.tsx
<Card variant="interactive" padding="none">
  <div className="p-4 relative">
    {/* Gift content (image, title, price, etc.) */}

    {/* QuickPurchaseButton - Absolute positioned bottom-right */}
    <div className="absolute bottom-4 right-4">
      <QuickPurchaseButton
        giftId={gift.id}
        listItems={/* derive from gift.list_items or API */}
        onPurchaseComplete={() => {
          toast.success('Gift marked as purchased!');
        }}
      />
    </div>
  </div>
</Card>
```

### Data Requirements
The GiftCard component needs to provide:
1. **giftId**: From `gift.id`
2. **listItems**: Array of `ListItemInfo` objects
   - This requires fetching list items associated with the gift
   - Could be included in Gift response as `list_items` array
   - Or fetched separately via `useListItems` hook

**Suggested API Enhancement**:
```typescript
// In Gift response
interface Gift {
  // ... existing fields
  list_items?: {
    id: number;
    list_id: number;
    list_name: string;
    status: ListItemStatus;
  }[];
}
```

---

## Testing Strategy

### Unit Tests
```typescript
// QuickPurchaseButton.test.tsx
describe('QuickPurchaseButton', () => {
  it('renders single list button', () => {});
  it('renders multiple lists with dropdown', () => {});
  it('renders purchased state when all items purchased', () => {});
  it('shows loading spinner during mutation', () => {});
  it('calls onPurchaseComplete callback on success', () => {});
  it('stops event propagation on click', () => {});
  it('closes dropdown on outside click', () => {});
  it('filters out purchased lists from dropdown', () => {});
});
```

### Integration Tests
```typescript
// GiftCard integration test
describe('GiftCard with QuickPurchaseButton', () => {
  it('marks gift as purchased without opening modal', () => {});
  it('updates gift status in cache after purchase', () => {});
  it('shows dropdown for multi-list gifts', () => {});
});
```

### Visual Regression Tests
- Screenshot tests for all states (default, hover, loading, purchased)
- Dropdown open state
- Mobile viewport (44px touch targets)

---

## Future Enhancements

### Phase 2 (Optional)
1. **Undo Action**: Allow reverting a purchase within 5 seconds
2. **Quantity Support**: Show quantity selector for gifts with `quantity > 1`
3. **Partial Purchase**: Mark only some quantity as purchased
4. **Confirmation Dialog**: Optional confirmation for high-value gifts
5. **Animation**: Confetti or success animation on purchase
6. **Keyboard Shortcuts**: `Cmd+P` to purchase selected gift
7. **Batch Purchase**: Select multiple gifts and purchase all at once

### Phase 3 (Advanced)
1. **Purchase Notes**: Quick note field in dropdown (e.g., "Bought at Target")
2. **Receipt Upload**: Quick receipt photo capture
3. **Price Update**: Update actual purchase price if different
4. **Gift Wrapping**: Quick toggle for "wrapped" status

---

## Related Components

- **GiftCard**: Parent component that contains QuickPurchaseButton
- **StatusSelector**: Similar pattern for status changes (desktop quick actions bar)
- **Button**: Base button component from UI library
- **Tooltip**: Provides hover hints for button states

---

## References

### Design System
- [Soft Modernity Tokens](./../DESIGN-TOKENS.md)
- [Component Patterns](./../COMPONENTS.md)
- [Mobile Touch Targets](./../LAYOUT-PATTERNS.md)

### Code
- Component: `apps/web/components/gifts/QuickPurchaseButton.tsx`
- Hook: `apps/web/hooks/useListItems.ts` (useUpdateListItemStatus)
- Types: `apps/web/types/index.ts` (ListItem, ListItemStatus)

### API
- Endpoint: `PUT /list-items/{id}/status`
- Schema: `ListItemUpdate` with `status` field

---

## Implementation Checklist

- [x] Create QuickPurchaseButton component with TypeScript interfaces
- [x] Implement single-list action (direct purchase)
- [x] Implement multi-list dropdown selector
- [x] Add loading state with spinner
- [x] Add purchased state with checkmark
- [x] Apply Soft Modernity design tokens (colors, spacing, shadows)
- [x] Ensure 44px touch targets for mobile
- [x] Add ARIA labels and accessibility attributes
- [x] Stop event propagation to prevent card click
- [x] Integrate useUpdateListItemStatus hook
- [x] Export component in gifts/index.ts
- [ ] Integrate into GiftCard component (implementation pending)
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Add visual regression tests
- [ ] Update API to include list_items in Gift response (backend)
- [ ] Add toast notifications for success/error states
- [ ] Test on mobile devices (iOS Safari, Android Chrome)

---

**Status**: Component implemented, ready for integration into GiftCard
**Next Steps**:
1. Update Gift API response to include `list_items` array
2. Integrate QuickPurchaseButton into GiftCard component
3. Add unit and integration tests
4. Test on mobile devices for touch target compliance
