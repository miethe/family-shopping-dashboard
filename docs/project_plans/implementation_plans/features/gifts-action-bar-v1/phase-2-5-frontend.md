---
title: "Phases 2-5: Frontend Components & Mutations"
description: "Action bar components, dropdowns, dialogs, filters, and mutations integration"
audience: [developers, frontend-engineers, react-developers]
tags: [implementation, phases, frontend, components, react, mutations]
created: 2025-12-22
updated: 2025-12-22
category: "product-planning"
status: ready
---

# Phases 2-5: Frontend Components & Mutations

**Duration**: 8 business days (Days 3-10)
**Story Points**: 25 pts
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer
**Dependencies**: Phase 1 complete (backend schemas ready)

---

## Phase Overview

Phases 2-5 implement all frontend components and mutations for the 7 action bar features:
- **Phase 2**: Status selection button + List picker dropdown
- **Phase 3**: Clickable filters (status chip, person avatars, list badges)
- **Phase 4**: Price edit dialog (inline editing)
- **Phase 5**: From Santa toggle + icon display

These phases can be parallelized within the team (e.g., one dev on Status+List while another starts Price and Santa).

**Key Deliverables**:
1. 3 new components: StatusButton, ListPickerDropdown, PriceEditDialog
2. Updated GiftCard with action bar buttons and filter callbacks
3. Updated LinkedEntityIcons to enable clickable filtering
4. Updated /gifts page to handle filter state
5. All mutations integrated with React Query cache invalidation
6. Mobile-responsive layout (44px touch targets, safe areas)
7. Error handling + toast feedback for all mutations

**Quality Gates**:
- [ ] All components render without errors
- [ ] Mutations work (status, list, price, Santa)
- [ ] Optimistic updates show immediately
- [ ] Error toasts appear on failure
- [ ] Buttons disabled during pending mutations
- [ ] Dropdowns close on click-outside
- [ ] All touch targets ≥44px on mobile
- [ ] No console errors or warnings

---

## Phase 2: Status Selection & List Picker UI (Days 3-4)

**Story Points**: 7 pts

### T2.1: Create StatusButton Component

**Story ID**: P2-T1
**Story Points**: 2 pts
**Assigned Subagent(s)**: ui-engineer-enhanced

#### Description

Create a new `StatusButton` component that displays the current gift status and opens a dropdown menu with clickable status options (IDEA, SELECTED, PURCHASED, RECEIVED). Selecting a status updates the gift immediately and closes the dropdown.

#### Acceptance Criteria

- [ ] Component file: `apps/web/components/gifts/StatusButton.tsx`
- [ ] Props: `{ giftId: number, currentStatus: Status, onStatusChange?: (status: Status) => void }`
- [ ] Renders as button with current status label
- [ ] Click opens dropdown with 4 status options
- [ ] Dropdown closes on status select
- [ ] Dropdown closes on click-outside
- [ ] Button disabled during mutation (`isPending` true)
- [ ] Uses Radix UI DropdownMenu for accessibility
- [ ] ARIA labels for button and menu items
- [ ] Touch target ≥44px on mobile

#### Implementation Details

**File**: `apps/web/components/gifts/StatusButton.tsx`

```typescript
import { useUpdateGift } from '@/hooks/useGifts';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Gift, Status } from '@/types';

interface StatusButtonProps {
  giftId: number;
  currentStatus: Status;
  onStatusChange?: (status: Status) => void;
}

const STATUS_OPTIONS: { label: string; value: Status }[] = [
  { label: 'Idea', value: 'IDEA' },
  { label: 'Selected', value: 'SELECTED' },
  { label: 'Purchased', value: 'PURCHASED' },
  { label: 'Received', value: 'RECEIVED' },
];

export function StatusButton({
  giftId,
  currentStatus,
  onStatusChange,
}: StatusButtonProps) {
  const updateGift = useUpdateGift(giftId);

  const handleStatusChange = async (status: Status) => {
    try {
      await updateGift.mutateAsync({ status });
      onStatusChange?.(status);
    } catch (error) {
      // Error handled by toast in useUpdateGift
      console.error('Status update failed:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={updateGift.isPending}
          aria-label={`Change status from ${currentStatus}`}
          className="min-w-[100px]"
        >
          {currentStatus}
          {updateGift.isPending && <span className="ml-2 animate-spin">⚙</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {STATUS_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => handleStatusChange(option.value)}
            className="cursor-pointer"
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### Component Notes

- Uses Radix's `DropdownMenu` for auto-positioning and a11y
- Button disabled during `isPending` to prevent double-clicks
- Callback optional (may be used for local state updates)
- Consider using existing `StatusSelector` component if available; only create new if needed for button-style UX
- Touch target (button): min 44x44px (check size="sm" in Tailwind)

#### Testing Approach

- Mount component with mock giftId and currentStatus
- Verify button renders with current status
- Click button to open dropdown
- Verify all 4 options visible
- Click option, verify mutation called
- Verify dropdown closes
- Mock mutation to error; verify error state
- Check button is disabled during pending

---

### T2.2: Create ListPickerDropdown Component

**Story ID**: P2-T2
**Story Points**: 3 pts
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer

#### Description

Create a new `ListPickerDropdown` component that displays all available lists as checkboxes (multi-select), includes a "Create New List" button, and an "Apply" button to confirm selections. When "Create New List" is clicked, open a dialog to create the list, then return to picker and auto-select the new list.

#### Acceptance Criteria

- [ ] Component file: `apps/web/components/gifts/ListPickerDropdown.tsx`
- [ ] Props: `{ giftId: number, currentListIds?: number[], onApply?: (listIds: number[]) => void }`
- [ ] Renders button labeled "+List"
- [ ] Click opens dropdown with:
  - [ ] Checkbox list of all available lists
  - [ ] "Create New List" button at bottom
  - [ ] Apply/Cancel buttons
- [ ] User can toggle multiple checkboxes
- [ ] "Create New List" button opens a dialog (nested)
- [ ] After creating list, dialog closes and list is added to picker
- [ ] Apply button calls mutation with selected list IDs
- [ ] Dropdown closes after Apply
- [ ] Click outside closes dropdown without saving
- [ ] Cancel button closes without saving
- [ ] All checkboxes ≥44px touch target on mobile
- [ ] Shows count of selected lists

#### Implementation Details

**File**: `apps/web/components/gifts/ListPickerDropdown.tsx`

```typescript
import { useState } from 'react';
import { useAddGiftToLists, useLists, useCreateList } from '@/hooks/useGifts';
import { useToast } from '@/hooks/useToast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ListCreateDialog } from '@/components/lists/ListCreateDialog';

interface ListPickerDropdownProps {
  giftId: number;
  currentListIds?: number[];
  onApply?: (listIds: number[]) => void;
}

export function ListPickerDropdown({
  giftId,
  currentListIds = [],
  onApply,
}: ListPickerDropdownProps) {
  const [selectedListIds, setSelectedListIds] = useState<number[]>(currentListIds);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const { data: lists } = useLists();
  const addToLists = useAddGiftToLists(giftId);
  const createList = useCreateList();
  const toast = useToast();

  const handleListToggle = (listId: number) => {
    setSelectedListIds((prev) =>
      prev.includes(listId) ? prev.filter((id) => id !== listId) : [...prev, listId]
    );
  };

  const handleApply = async () => {
    try {
      await addToLists.mutateAsync(selectedListIds);
      onApply?.(selectedListIds);
      setIsDropdownOpen(false);
      toast.success(`Added to ${selectedListIds.length} list(s)`);
    } catch (error) {
      toast.error('Failed to add to lists');
      console.error('Add to lists failed:', error);
    }
  };

  const handleCreateListSuccess = (newListId: number) => {
    setIsCreateDialogOpen(false);
    // Auto-add new list to selection
    setSelectedListIds((prev) => [...prev, newListId]);
    toast.success('List created and added to gift');
  };

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={addToLists.isPending}
          aria-label={`Add to ${selectedListIds.length} list(s)`}
        >
          +List {selectedListIds.length > 0 && `(${selectedListIds.length})`}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <div className="p-3 space-y-3 max-h-64 overflow-y-auto">
          {/* List checkboxes */}
          <div className="space-y-2">
            {lists?.map((list) => (
              <div key={list.id} className="flex items-center space-x-3">
                <Checkbox
                  id={`list-${list.id}`}
                  checked={selectedListIds.includes(list.id)}
                  onCheckedChange={() => handleListToggle(list.id)}
                  className="min-h-[44px] min-w-[44px]"
                  aria-label={`Add to ${list.name}`}
                />
                <label
                  htmlFor={`list-${list.id}`}
                  className="flex-1 cursor-pointer text-sm"
                >
                  {list.name}
                </label>
              </div>
            ))}
          </div>

          {/* Create new list button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreateDialogOpen(true)}
            className="w-full text-left"
          >
            + Create New List
          </Button>

          {/* Apply / Cancel buttons */}
          <div className="flex gap-2 border-t pt-3">
            <Button
              variant="default"
              size="sm"
              onClick={handleApply}
              disabled={addToLists.isPending || selectedListIds.length === 0}
              className="flex-1"
            >
              Apply
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDropdownOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
          </div>
        </div>
      </DropdownMenuContent>

      {/* Create list dialog */}
      <ListCreateDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSuccess={handleCreateListSuccess}
      />
    </DropdownMenu>
  );
}
```

#### Component Notes

- Checkboxes must have min 44x44px on mobile (use Radix's size/spacing)
- "Create New List" opens a nested dialog (ListCreateDialog component)
- After list creation, automatically adds to selection
- Apply button disabled if no lists selected
- Shows count of selected lists in button label
- Scroll support for >10 lists (max-height: 256px with overflow)
- Drop-down positioning auto-handled by Radix

#### Dependencies

- Assumes `useLists()` hook returns available lists
- Assumes `useAddGiftToLists()` hook for mutation
- Assumes `useCreateList()` hook and `ListCreateDialog` component exist
- If `ListCreateDialog` doesn't exist, create simple version or use existing `ListForm` component

#### Testing Approach

- Mount with mock giftId and lists
- Verify button renders
- Click button to open dropdown
- Verify all lists show as checkboxes
- Check/uncheck multiple lists
- Click "Create New List" to open dialog
- Create list, verify it's added to selection
- Click Apply, verify mutation called
- Verify toast shows count

---

### T2.3: Integrate Status & List Buttons into GiftCard

**Story ID**: P2-T3
**Story Points**: 2 pts
**Assigned Subagent(s)**: frontend-developer

#### Description

Update the GiftCard component to include the new StatusButton and ListPickerDropdown in the action bar (desktop) and mobile menu. Ensure proper layout and responsive behavior.

#### Acceptance Criteria

- [ ] File: `apps/web/components/gifts/GiftCard.tsx`
- [ ] Status button added to desktop action bar (right of "Assign Recipient" or in new row)
- [ ] +List button added after Status button
- [ ] Both buttons added to mobile menu
- [ ] Desktop action bar is responsive (doesn't wrap on medium screens)
- [ ] Mobile overflow menu shows all buttons
- [ ] Buttons properly spaced (gap between buttons)
- [ ] No layout shift or overlap
- [ ] Safe areas respected on iOS (left/right insets)

#### Implementation Details

**Location in GiftCard**: Update the action bar section (currently lines 335–378 per PRD)

**Desktop Layout Example**:
```
[Assign Recipient] [Status] [+List] [Santa Toggle] [Quick Purchase]
```

**Mobile Layout**: Move new buttons to overflow menu alongside existing options.

**Key Changes**:
1. Import StatusButton, ListPickerDropdown components
2. Add to JSX action bar
3. Wire up current status and list IDs from gift data
4. Pass callbacks (if needed for local state)

#### Code Integration Pattern

```typescript
// In GiftCard.tsx action bar section
<div className="flex gap-2 flex-wrap">
  <PersonDropdown giftId={gift.id} />
  <StatusButton giftId={gift.id} currentStatus={gift.status} />
  <ListPickerDropdown giftId={gift.id} currentListIds={gift.list_ids} />
  {/* Santa toggle will be added in Phase 5 */}
  <QuickPurchaseButton giftId={gift.id} />
</div>

// Mobile menu
<OverflowMenu>
  <MenuItem>Assign Recipient</MenuItem>
  <MenuItem>Change Status</MenuItem>
  <MenuItem>Manage Lists</MenuItem>
  <MenuItem>Toggle Santa</MenuItem>
</OverflowMenu>
```

#### Testing Approach

- Render GiftCard with mock gift data
- Verify buttons visible on desktop
- Verify buttons in mobile menu
- Check responsive behavior at different widths
- No visual overlap or wrapping
- Touch targets ≥44px on mobile

---

## Phase 3: Clickable Filters (Days 5-6)

**Story Points**: 6 pts

### T3.1: Make Status Chip Clickable

**Story ID**: P3-T1
**Story Points**: 1 pt
**Assigned Subagent(s)**: frontend-developer

#### Description

Update the status chip/pill displayed on each gift card to be clickable. Clicking the chip should filter the /gifts page to show only gifts with that status.

#### Acceptance Criteria

- [ ] File: `apps/web/components/gifts/GiftCard.tsx`
- [ ] Status chip styled as clickable (cursor: pointer, hover state)
- [ ] Click triggers callback to parent page: `onStatusFilter(status)`
- [ ] Visual indicator shows filter is active (highlight, icon, or badge)
- [ ] Click again to toggle filter off
- [ ] Chip has ARIA attributes for accessibility
- [ ] Touch target ≥44px on mobile (consider expanding area)

#### Implementation Details

**Current Status Chip** (per PRD, lines ~200):
```typescript
<div className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800">
  {gift.status}
</div>
```

**Update to**:
```typescript
<button
  onClick={() => onStatusFilter?.(gift.status)}
  className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors"
  aria-label={`Filter by ${gift.status}`}
>
  {gift.status}
</button>
```

**Active Filter Styling** (add to className when `activeFilters.status === gift.status`):
```typescript
className={`
  text-xs font-medium px-2 py-1 rounded cursor-pointer transition-colors
  ${activeFilters?.status === gift.status
    ? 'bg-blue-600 text-white ring-2 ring-blue-300'
    : 'bg-blue-100 text-blue-800 hover:bg-blue-200'
  }
`}
```

#### Integration with Page

In `/gifts` page component:
```typescript
const [activeFilters, setActiveFilters] = useState<Filters>({});

const handleStatusFilter = (status: Status) => {
  setActiveFilters((prev) => ({
    ...prev,
    status: prev.status === status ? undefined : status,
  }));
  // Update URL params
  updateQueryParams({ status: status || undefined });
};

// Pass to GiftCard
<GiftCard {...gift} onStatusFilter={handleStatusFilter} />
```

#### Testing Approach

- Render GiftCard
- Verify chip is clickable (pointer cursor)
- Click chip, verify callback fired
- Verify filter applied on page
- Click again, verify filter removed
- Check active filter styling

---

### T3.2: Make Person Avatars Clickable

**Story ID**: P3-T2
**Story Points**: 2 pts
**Assigned Subagent(s)**: frontend-developer

#### Description

Update the LinkedEntityIcons component (which displays person avatars and list badges) to make person avatars clickable for filtering. Clicking an avatar should filter by that person (gift recipient).

#### Acceptance Criteria

- [ ] File: `apps/web/components/gifts/LinkedEntityIcons.tsx`
- [ ] Person avatars styled as clickable (cursor: pointer, hover state)
- [ ] Click triggers callback: `onRecipientClick(personId)`
- [ ] Multiple avatars can be clicked to OR-filter (add to filter list)
- [ ] Clicking same avatar again removes from filter
- [ ] Visual indicator shows active filter (ring, highlight, badge)
- [ ] Touch target ≥44px on mobile
- [ ] ARIA labels for accessibility

#### Implementation Details

**Update Avatar Element**:
```typescript
// In LinkedEntityIcons component
{recipients?.map((person) => (
  <button
    key={person.id}
    onClick={() => onRecipientClick?.(person.id)}
    className={`
      w-10 h-10 rounded-full flex items-center justify-center
      cursor-pointer transition-all hover:scale-110
      ${activePersonIds?.includes(person.id)
        ? 'ring-2 ring-green-500'
        : 'hover:opacity-75'
      }
    `}
    aria-label={`Filter by ${person.name}`}
  >
    <img src={person.avatar} alt={person.name} />
  </button>
))}
```

**Component Props**:
```typescript
interface LinkedEntityIconsProps {
  recipients?: Person[];
  lists?: List[];
  onRecipientClick?: (personId: number) => void;
  onListClick?: (listId: number) => void;
  activePersonIds?: number[];
  activeListIds?: number[];
}
```

#### Page-Level Filter Logic

```typescript
const [activeFilters, setActiveFilters] = useState<{
  personIds?: number[];
  listIds?: number[];
}>({});

const handleRecipientClick = (personId: number) => {
  setActiveFilters((prev) => {
    const current = prev.personIds || [];
    return {
      ...prev,
      personIds: current.includes(personId)
        ? current.filter((id) => id !== personId)
        : [...current, personId],
    };
  });
  updateQueryParams({ person_ids: personIds });
};
```

#### Testing Approach

- Render LinkedEntityIcons with mock recipients
- Verify avatars clickable
- Click one avatar, verify filter applied
- Click another avatar, verify both in filter (OR logic)
- Click same avatar again, verify removed from filter
- Check active filter styling (ring)

---

### T3.3: Make List Badges Clickable

**Story ID**: P3-T3
**Story Points**: 2 pts
**Assigned Subagent(s)**: frontend-developer

#### Description

Update the LinkedEntityIcons component to make list badges/links clickable for filtering. Clicking a list badge filters to gifts in that list (exclusive filter: only one list at a time).

#### Acceptance Criteria

- [ ] File: `apps/web/components/gifts/LinkedEntityIcons.tsx`
- [ ] List badges styled as clickable (cursor: pointer, hover state)
- [ ] Click triggers callback: `onListClick(listId)`
- [ ] Only one list filter active at a time (exclusive)
- [ ] Clicking same badge again removes filter
- [ ] Clicking another badge replaces current filter
- [ ] Visual indicator shows active filter
- [ ] Touch target ≥44px on mobile
- [ ] ARIA labels for accessibility

#### Implementation Details

**Update Badge Element**:
```typescript
// In LinkedEntityIcons component
{lists?.map((list) => (
  <button
    key={list.id}
    onClick={() => onListClick?.(list.id)}
    className={`
      text-xs px-2 py-1 rounded cursor-pointer transition-colors
      ${activeListId === list.id
        ? 'bg-purple-600 text-white'
        : 'bg-purple-100 text-purple-800 hover:bg-purple-200'
      }
    `}
    aria-label={`Filter by ${list.name}`}
  >
    {list.name}
  </button>
))}
```

**Page-Level Filter Logic** (exclusive):
```typescript
const [activeFilters, setActiveFilters] = useState<{
  listId?: number;
}>({});

const handleListClick = (listId: number) => {
  setActiveFilters((prev) => ({
    ...prev,
    listId: prev.listId === listId ? undefined : listId,
  }));
  updateQueryParams({ list_ids: listId || undefined });
};
```

#### Testing Approach

- Render LinkedEntityIcons with mock lists
- Verify badges clickable
- Click one badge, verify filter applied
- Click another badge, verify first filter replaced (not added)
- Click same badge again, verify filter removed
- Check active filter styling

---

### T3.4: Update /gifts Page to Handle Filter Callbacks

**Story ID**: P3-T4
**Story Points**: 1 pt
**Assigned Subagent(s)**: frontend-developer

#### Description

Update the `/gifts` page component to manage filter state from GiftCard callbacks. Update URL query parameters and re-fetch gift list with new filters.

#### Acceptance Criteria

- [ ] File: `apps/web/pages/gifts/page.tsx` (or similar)
- [ ] Implements handlers for: `onStatusFilter`, `onRecipientClick`, `onListClick`
- [ ] Updates URL query params: `?statuses=`, `?person_ids=`, `?list_ids=`
- [ ] Refetches gift list with new params
- [ ] Passes active filters to GiftCard components
- [ ] Clear filter button (or click filter again to toggle off)
- [ ] Visual "X results" indicator for active filter

#### Implementation Details

**Page Component**:
```typescript
import { useSearchParams } from 'next/navigation';
import { useGifts } from '@/hooks/useGifts';

export function GiftsPage() {
  const searchParams = useSearchParams();
  const statuses = searchParams.getAll('statuses');
  const personIds = searchParams.getAll('person_ids');
  const listIds = searchParams.get('list_ids');

  const { data: gifts } = useGifts({
    statuses: statuses.length > 0 ? statuses : undefined,
    personIds: personIds.length > 0 ? personIds.map(Number) : undefined,
    listIds: listIds ? [Number(listIds)] : undefined,
  });

  const handleStatusFilter = (status: Status) => {
    const newParams = new URLSearchParams(searchParams);
    if (newParams.get('statuses') === status) {
      newParams.delete('statuses');
    } else {
      newParams.set('statuses', status);
    }
    router.push(`?${newParams.toString()}`);
  };

  // Similar handlers for recipientClick, listClick

  return (
    <div>
      {/* Active filters display */}
      {(statuses.length > 0 || personIds.length > 0 || listIds) && (
        <div className="mb-4 flex gap-2 items-center">
          <span className="text-sm font-medium">Active filters:</span>
          {statuses.map((s) => (
            <button
              key={s}
              onClick={() => handleStatusFilter(s)}
              className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded flex items-center gap-1"
            >
              {s} <span className="cursor-pointer">×</span>
            </button>
          ))}
          {/* Similar badges for persons, lists */}
        </div>
      )}

      {/* Gift cards grid */}
      <div className="grid gap-4">
        {gifts?.map((gift) => (
          <GiftCard
            key={gift.id}
            gift={gift}
            onStatusFilter={handleStatusFilter}
            onRecipientClick={handleRecipientClick}
            onListClick={handleListClick}
            activeFilters={{ statuses, personIds, listIds }}
          />
        ))}
      </div>
    </div>
  );
}
```

#### Testing Approach

- Render page with mock gifts
- Click status chip, verify URL updated
- Verify gifts re-fetched with new filter
- Click person avatar, verify filter applied
- Click list badge, verify filter replaced
- Check active filter badges visible
- Click filter badge again, verify removed

---

## Phase 4: Price Edit Dialog (Days 7-8)

**Story Points**: 5 pts

### T4.1: Create PriceEditDialog Component

**Story ID**: P4-T1
**Story Points**: 2 pts
**Assigned Subagent(s)**: ui-engineer-enhanced

#### Description

Create a new `PriceEditDialog` component that allows inline price editing via a popover dialog (not full-page modal). Includes text input for price, "No price" checkbox, input validation, and Save/Cancel buttons.

#### Acceptance Criteria

- [ ] Component file: `apps/web/components/gifts/PriceEditDialog.tsx`
- [ ] Props: `{ open: boolean, onOpenChange: (open: boolean) => void, giftId: number, currentPrice: number | null, onSave?: (price: number | null) => void }`
- [ ] Dialog renders as popover (not full-page modal overlay)
- [ ] Input field accepts decimal prices (e.g., 49.99)
- [ ] Accepts "$" prefix (strips for validation)
- [ ] "No price" checkbox clears price (sets to null)
- [ ] Input validation: decimal places ≤2, non-negative, max 10,000
- [ ] Save button disabled if validation fails
- [ ] Cancel button closes without saving
- [ ] Click outside dialog closes without saving
- [ ] Shows error message if validation fails
- [ ] Dialog positioned near price text (above/below, auto-position)

#### Implementation Details

**File**: `apps/web/components/gifts/PriceEditDialog.tsx`

```typescript
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useUpdateGift } from '@/hooks/useGifts';
import { useToast } from '@/hooks/useToast';

interface PriceEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  giftId: number;
  currentPrice: number | null;
  onSave?: (price: number | null) => void;
}

export function PriceEditDialog({
  open,
  onOpenChange,
  giftId,
  currentPrice,
  onSave,
}: PriceEditDialogProps) {
  const [priceInput, setPriceInput] = useState(
    currentPrice ? currentPrice.toString() : ''
  );
  const [noPrice, setNoPrice] = useState(!currentPrice);
  const [error, setError] = useState<string | null>(null);

  const updateGift = useUpdateGift(giftId);
  const toast = useToast();

  const validatePrice = (price: string): { valid: boolean; error?: string } => {
    if (!price || price.trim() === '') {
      return { valid: true }; // Allow empty for "no price"
    }

    // Remove "$" prefix if present
    const cleanPrice = price.replace(/^\$/, '').trim();

    // Validate decimal format
    const regex = /^\d+(\.\d{0,2})?$/;
    if (!regex.test(cleanPrice)) {
      return {
        valid: false,
        error: 'Price must be a valid decimal (e.g., 49.99)',
      };
    }

    // Check range
    const numPrice = parseFloat(cleanPrice);
    if (numPrice < 0) {
      return { valid: false, error: 'Price must be non-negative' };
    }
    if (numPrice > 10000) {
      return { valid: false, error: 'Price must be less than $10,000' };
    }

    return { valid: true };
  };

  const handleSave = async () => {
    if (noPrice) {
      // Save null price
      try {
        await updateGift.mutateAsync({ price: null });
        onSave?.(null);
        onOpenChange(false);
        toast.success('Price cleared');
      } catch (error) {
        toast.error('Failed to update price');
        console.error('Price update failed:', error);
      }
      return;
    }

    // Validate price input
    const validation = validatePrice(priceInput);
    if (!validation.valid) {
      setError(validation.error || 'Invalid price');
      return;
    }

    const cleanPrice = parseFloat(priceInput.replace(/^\$/, '').trim());

    try {
      await updateGift.mutateAsync({ price: cleanPrice });
      onSave?.(cleanPrice);
      onOpenChange(false);
      toast.success('Price updated');
    } catch (error) {
      toast.error('Failed to update price');
      console.error('Price update failed:', error);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset state when closing
      setPriceInput(currentPrice ? currentPrice.toString() : '');
      setNoPrice(!currentPrice);
      setError(null);
    }
    onOpenChange(newOpen);
  };

  const isValid = !priceInput || validatePrice(priceInput).valid;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Edit Price</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="price-input" className="text-sm font-medium">
              Price
            </label>
            <Input
              id="price-input"
              placeholder="0.00"
              value={priceInput}
              onChange={(e) => {
                setPriceInput(e.target.value);
                setError(null); // Clear error on input change
              }}
              disabled={noPrice || updateGift.isPending}
              className="text-right"
            />
            {error && <p className="text-xs text-red-600">{error}</p>}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="no-price"
              checked={noPrice}
              onCheckedChange={(checked) => setNoPrice(checked as boolean)}
              disabled={updateGift.isPending}
              className="min-h-[44px] min-w-[44px]"
            />
            <label
              htmlFor="no-price"
              className="text-sm cursor-pointer flex-1"
            >
              No price
            </label>
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            disabled={updateGift.isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || updateGift.isPending}
          >
            {updateGift.isPending ? 'Saving...' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Component Notes

- Uses Radix `Dialog` for accessibility and auto-positioning
- Input validation happens on blur or save
- "No price" checkbox disables price input
- Accepts "$" prefix but strips for storage
- All interactive elements ≥44px on mobile
- Error message shows below input
- Dialog closes on Save or Cancel
- Clicking outside closes (Radix default)

#### Testing Approach

- Render dialog with currentPrice
- Verify input shows current price
- Type price, verify validation
- Check "No price", verify input disabled
- Click Save with valid price, verify mutation
- Click Cancel, verify closes without saving
- Test edge cases: $49.99, 49.99, 49, empty

---

### T4.2: Make Price Text Clickable in GiftCard

**Story ID**: P4-T2
**Story Points**: 2 pts
**Assigned Subagent(s)**: frontend-developer

#### Description

Update the GiftCard component to make the price text/area clickable. Clicking opens the PriceEditDialog popover dialog.

#### Acceptance Criteria

- [ ] File: `apps/web/components/gifts/GiftCard.tsx`
- [ ] Price display styled as clickable (cursor: pointer, hover state)
- [ ] Click opens PriceEditDialog popover
- [ ] Dialog properly positioned (above/below price, no occlusion)
- [ ] Dialog closes after Save or Cancel
- [ ] Touch target ≥44px on mobile (expand click area)
- [ ] ARIA label for accessibility

#### Implementation Details

**Update Price Display**:
```typescript
// In GiftCard footer section
const [isPriceDialogOpen, setIsPriceDialogOpen] = useState(false);

// Render
<button
  onClick={() => setIsPriceDialogOpen(true)}
  className="flex items-center gap-1 cursor-pointer hover:opacity-75 transition-opacity"
  aria-label={`Edit price: $${gift.price || 'Not set'}`}
>
  <span className="text-lg font-semibold">
    {gift.price ? `$${gift.price.toFixed(2)}` : 'No price'}
  </span>
</button>

<PriceEditDialog
  open={isPriceDialogOpen}
  onOpenChange={setIsPriceDialogOpen}
  giftId={gift.id}
  currentPrice={gift.price}
  onSave={(newPrice) => {
    // Local state update optional; React Query handles cache
  }}
/>
```

#### Testing Approach

- Render GiftCard
- Click price text, verify dialog opens
- Edit price, click Save, verify updates
- Click Cancel, verify dialog closes
- Check responsive behavior on mobile

---

### T4.3: Update useUpdateGift Hook (if needed)

**Story ID**: P4-T3
**Story Points**: 1 pt
**Assigned Subagent(s)**: frontend-developer

#### Description

Ensure the existing `useUpdateGift` hook properly handles price mutations and cache invalidation. May only need minor updates or none if already complete.

#### Acceptance Criteria

- [ ] Hook: `apps/web/hooks/useGifts.ts` (useUpdateGift function)
- [ ] Supports `price` field in mutation payload
- [ ] Invalidates `['gifts']` query on success
- [ ] Shows error toast on failure
- [ ] Optimistic updates work for price changes
- [ ] Type hints include price: number | null

#### Implementation Pattern

If hook doesn't exist or needs updating:

```typescript
export function useUpdateGift(giftId: number) {
  const queryClient = useQueryClient();
  const toast = useToast();

  return useMutation({
    mutationFn: async (updates: Partial<GiftUpdate>) => {
      const response = await giftApi.updateGift(giftId, updates);
      return response;
    },
    onMutate: async (updates) => {
      // Optimistic update
      queryClient.setQueryData(['gifts'], (old: Gift[]) =>
        old?.map((g) =>
          g.id === giftId ? { ...g, ...updates } : g
        )
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gifts'] });
      toast.success('Gift updated');
    },
    onError: (error) => {
      toast.error('Failed to update gift');
      // Rollback handled by React Query on error
    },
  });
}
```

#### Testing Approach

- Test mutation with price update
- Verify optimistic update
- Verify cache invalidation
- Check error handling

---

## Phase 5: From Santa Toggle & Icon (Days 9-10)

**Story Points**: 5 pts

### T5.1: Add From Santa Toggle to Action Bar

**Story ID**: P5-T1
**Story Points**: 2 pts
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer

#### Description

Add a "From Santa" toggle button to the action bar (desktop) and mobile menu. Toggle immediately updates the gift's `from_santa` field.

#### Acceptance Criteria

- [ ] File: `apps/web/components/gifts/GiftCard.tsx`
- [ ] Toggle button rendered in action bar (desktop) and mobile menu
- [ ] Click toggles `from_santa` flag (true/false)
- [ ] Optimistic update shows immediately
- [ ] Toast shows "Marked as from Santa" or "Unmarked"
- [ ] Button disabled during mutation
- [ ] ARIA label for accessibility
- [ ] Hover state visual feedback
- [ ] Touch target ≥44px on mobile

#### Implementation Details

**Component Code**:
```typescript
// In GiftCard action bar
<button
  onClick={() => handleToggleSanta()}
  disabled={updateGift.isPending}
  className={`
    px-3 py-2 rounded text-sm font-medium transition-all
    ${gift.from_santa
      ? 'bg-red-100 text-red-700 hover:bg-red-200'
      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
    }
  `}
  aria-label={gift.from_santa ? 'Unmark as from Santa' : 'Mark as from Santa'}
  title={gift.from_santa ? 'This is from Santa' : 'Mark as from Santa'}
>
  🎅 {gift.from_santa ? 'From Santa' : 'Add Santa'}
</button>
```

**Handler Function**:
```typescript
const handleToggleSanta = async () => {
  try {
    await updateGift.mutateAsync({
      from_santa: !gift.from_santa,
    });
    toast.success(
      gift.from_santa ? 'Unmarked as from Santa' : 'Marked as from Santa'
    );
  } catch (error) {
    toast.error('Failed to update');
    console.error('Toggle Santa failed:', error);
  }
};
```

#### Icon Choice

- Use emoji: 🎅 (Santa emoji, widely supported)
- Or use icon library (e.g., Radix Icons if available)
- Fallback: text label "Santa" if emoji rendering issues

#### Testing Approach

- Render GiftCard with from_santa=false
- Click button, verify toggle to true
- Check visual state change
- Verify toast shows
- Click again, verify toggle to false
- Check button disabled during pending

---

### T5.2: Display Santa Icon on Card

**Story ID**: P5-T2
**Story Points**: 2 pts
**Assigned Subagent(s)**: ui-engineer-enhanced

#### Description

Add a Santa icon display on the gift card that appears when `from_santa=true`. Icon positioned in top-right corner with tooltip "From Santa".

#### Acceptance Criteria

- [ ] File: `apps/web/components/gifts/GiftCard.tsx`
- [ ] Santa icon appears when `gift.from_santa === true`
- [ ] Icon positioned top-right corner (doesn't occlude image or key info)
- [ ] Tooltip shows "From Santa" on hover/long-press
- [ ] Icon size appropriate (16-24px)
- [ ] No layout shift when icon appears/disappears
- [ ] Accessibility: ARIA label for icon

#### Implementation Details

**Icon Display**:
```typescript
// In GiftCard, top-right corner
{gift.from_santa && (
  <div
    className="absolute top-2 right-2 text-2xl"
    title="From Santa"
    role="img"
    aria-label="This gift is from Santa"
  >
    🎅
  </div>
)}
```

**Alternative with Tooltip Component**:
```typescript
{gift.from_santa && (
  <Tooltip content="From Santa">
    <div
      className="absolute top-2 right-2 text-2xl cursor-help"
      role="img"
      aria-label="This gift is from Santa"
    >
      🎅
    </div>
  </Tooltip>
)}
```

#### Positioning

- Top-right corner of card
- Small margin from edge (top-2, right-2 in Tailwind = 8px)
- Z-index above card content
- Ensure doesn't cover quick purchase button or image

#### Testing Approach

- Render GiftCard with from_santa=true
- Verify icon visible in top-right
- Check tooltip shows on hover
- Render with from_santa=false
- Verify icon not visible
- Check no layout shift
- Test on mobile (icon touchable)

---

### T5.3: Update Mobile Menu with Santa Toggle

**Story ID**: P5-T3
**Story Points**: 1 pt
**Assigned Subagent(s)**: frontend-developer

#### Description

Ensure the mobile overflow menu includes the From Santa toggle option for devices/screen sizes where the action bar is collapsed.

#### Acceptance Criteria

- [ ] File: `apps/web/components/gifts/GiftCard.tsx` (mobile menu section)
- [ ] "From Santa" toggle appears in mobile menu
- [ ] Click toggles flag same as action bar
- [ ] Menu item shows current state (e.g., "Unmark Santa" if already marked)
- [ ] Toast feedback appears
- [ ] Proper spacing and sizing for mobile

#### Implementation Details

**Mobile Menu Option**:
```typescript
// In mobile OverflowMenu
<MenuItem
  onClick={() => handleToggleSanta()}
  disabled={updateGift.isPending}
>
  {gift.from_santa ? '✓ From Santa' : 'Mark as Santa'}
</MenuItem>
```

#### Testing Approach

- View GiftCard on mobile (<md breakpoint)
- Open overflow menu
- Verify "From Santa" option present
- Click option, verify toggle works
- Check toast shows

---

## Summary

Phases 2-5 implement 5 new interactive components and integrate them into GiftCard with full mutation support, error handling, and optimistic updates. All components follow accessibility best practices (44px touch targets, ARIA labels) and are mobile-responsive.

**Next**: Move to [Phase 6: Testing & Polish](phase-6-testing.md)

---

**Phase Version**: 1.0
**Last Updated**: 2025-12-22
**Status**: Ready for Implementation
