---
title: "Gift Card Enhancements - Implementation Plan"
description: "Add linked entity icons, quick mark-purchased button, and external link icon to GiftCard component"
audience: [ai-agents, developers]
tags: [implementation, frontend, gift-card, ui-enhancement]
created: 2025-12-08
updated: 2025-12-08
category: "product-planning"
status: in-progress
related:
  - /docs/project_plans/requests/12-8-v2.md
---

# Gift Card Enhancements - Implementation Plan

## Executive Summary

Enhance the GiftCard component on the /gifts page (Grid View) with three improvements:
1. **Linked Entity Icons** - Small icons showing Recipient(s) and List(s) with tooltips and clickable navigation
2. **Quick Mark as Purchased Button** - Small button to mark gift as purchased without opening modal
3. **External Link Icon** - Visible icon in top right to open Product URL in new tab

**Estimated Effort**: ~6-8 story points (single phase)
**Primary Assignees**: ui-engineer-enhanced, frontend-developer

---

## Current State Analysis

### Existing GiftCard Features
- Image display with fallback placeholder
- Title with GiftTitleLink component
- Status selector (inline)
- Price display
- Assignee avatar (when present)
- Selection mode (bulk operations)
- Desktop quick actions: Open URL, Assign Recipient
- Mobile overflow menu

### Data Available on Gift Object
```typescript
interface Gift {
  id: number;
  name: string;
  url: string | null;              // Product URL
  price: number | null;
  image_url: string | null;
  person_ids: number[];            // Linked people (recipients)
  stores: StoreMinimal[];          // Linked stores
  // ...additional fields
}
```

### API Response Includes
```typescript
gift_people: GiftPersonLink[];  // { person_id: number; role: 'recipient'|'purchaser'|'contributor' }
```

### Gaps Identified
1. No display of linked recipients/people beyond single assignee avatar
2. No display of which lists contain this gift
3. External link icon exists but only on desktop (hidden on mobile)
4. No quick "Mark as Purchased" action

---

## Implementation Strategy

### Architecture Sequence
```
1. Frontend Types → 2. API Enhancement (if needed) → 3. UI Components → 4. Integration → 5. Testing
```

### Key Decisions
- **Lists data**: Gift does not currently include list relationships in API response - need to add or fetch separately
- **Mark as Purchased**: Requires updating list_item status, not gift directly - need to identify which list_item to update
- **Mobile optimization**: Icons should be touch-friendly (44px targets) but visually compact

---

## Phase 1: Implementation Tasks

### Task 1.1: Extend Gift Type with List Information

**Description**: Add list relationship data to Gift response so we can show which lists contain this gift.

**Files**:
- `services/api/app/schemas/gift.py` - Add list_items field to GiftResponse
- `services/api/app/repositories/gift.py` - Include list relationships in query
- `services/api/app/services/gift.py` - Map list data to response
- `apps/web/types/index.ts` - Update Gift interface

**Acceptance Criteria**:
- [ ] Gift response includes `list_items: { list_id: number; list_name: string; status: ListItemStatus }[]`
- [ ] Frontend type updated to match
- [ ] Existing API consumers unaffected (backwards compatible)

**Assigned Subagent(s)**: python-backend-engineer

**Estimate**: 2 points

---

### Task 1.2: Create LinkedEntityIcons Component

**Description**: Create reusable component showing small icons for linked entities (Person, List) with tooltips.

**Files**:
- `apps/web/components/gifts/LinkedEntityIcons.tsx` (new)
- `apps/web/components/gifts/index.ts` - Export new component

**Component Design**:
```tsx
interface LinkedEntityIconsProps {
  recipients: Array<{ id: number; name: string; avatarUrl?: string }>;
  lists: Array<{ id: number; name: string }>;
  onPersonClick?: (personId: number) => void;
  onListClick?: (listId: number) => void;
  maxVisible?: number; // Default 3, then "+N more"
}
```

**Visual Design**:
- Compact row of small icons (24x24px visual, 44x44px touch target)
- Person icon: Small avatar or User icon with count badge
- List icon: ListChecks icon with count badge
- Tooltip on hover: "For: [Person Name]" or "In: [List Name]"
- Click opens respective modal

**Acceptance Criteria**:
- [ ] Shows recipient icons with avatar fallback
- [ ] Shows list icons with count
- [ ] Tooltips display entity name and type
- [ ] Click handlers trigger appropriate modal
- [ ] "+N more" when exceeding maxVisible
- [ ] Touch targets meet 44px minimum

**Assigned Subagent(s)**: ui-engineer-enhanced

**Estimate**: 2 points

---

### Task 1.3: Create QuickPurchaseButton Component

**Description**: Small button to mark gift as purchased without opening detail modal.

**Files**:
- `apps/web/components/gifts/QuickPurchaseButton.tsx` (new)
- `apps/web/components/gifts/index.ts` - Export new component
- `apps/web/hooks/useListItems.ts` - May need mutation hook update

**Component Design**:
```tsx
interface QuickPurchaseButtonProps {
  giftId: number;
  listItemId?: number;  // If we know specific list item
  currentStatus?: ListItemStatus;
  onSuccess?: () => void;
  disabled?: boolean;
}
```

**Behavior**:
- If gift is in one list: Mark that list_item as purchased
- If gift is in multiple lists: Show dropdown to select which list
- If already purchased: Show checkmark, disabled state
- Optimistic UI update

**Visual Design**:
- Small icon button (ShoppingCart or CheckCircle icon)
- Green color when actionable
- Checkmark/gray when already purchased
- Position: Bottom right of card

**Acceptance Criteria**:
- [ ] Single click marks as purchased (single list case)
- [ ] Dropdown selection for multi-list case
- [ ] Optimistic update with rollback on error
- [ ] Visual feedback during mutation
- [ ] Disabled state for already purchased

**Assigned Subagent(s)**: ui-engineer-enhanced

**Estimate**: 2 points

---

### Task 1.4: Update GiftCard with New Components

**Description**: Integrate LinkedEntityIcons and QuickPurchaseButton into existing GiftCard.

**Files**:
- `apps/web/components/gifts/GiftCard.tsx` - Integrate new components

**Changes**:
1. Add LinkedEntityIcons row below title, above footer
2. Move/enhance external link icon (visible on mobile too, if URL exists)
3. Add QuickPurchaseButton to bottom right area
4. Adjust layout spacing for new elements

**Layout Update**:
```
┌─────────────────────────────┐
│  [Selection]    [ExtLink]   │  ← Top row (external link always visible)
│                             │
│        [Image Area]         │
│                             │
├─────────────────────────────┤
│  Title                      │
│  [Person] [Person] [List]   │  ← New: Linked entity icons
│                             │
│  $Price        [Purchase]   │  ← Footer with quick purchase button
└─────────────────────────────┘
```

**Acceptance Criteria**:
- [ ] Linked entity icons display below title
- [ ] External link icon visible on both mobile and desktop
- [ ] Quick purchase button in footer area
- [ ] Layout maintains mobile-first responsiveness
- [ ] No regression in existing functionality

**Assigned Subagent(s)**: ui-engineer-enhanced

**Estimate**: 2 points

---

### Task 1.5: Update Gifts Page Data Flow

**Description**: Ensure gifts page passes necessary data for new components.

**Files**:
- `apps/web/app/gifts/page.tsx` - Update data fetching if needed
- `apps/web/hooks/useGifts.ts` - Ensure list data included
- `apps/web/hooks/usePeople.ts` - May need person lookup

**Changes**:
- Ensure gift response includes list_items with names
- Ensure person_ids can be resolved to names for tooltips
- Add person data lookup or ensure it's included in response

**Acceptance Criteria**:
- [ ] Gift data includes list relationships with names
- [ ] Person names available for tooltip display
- [ ] Modal handlers connected for entity navigation

**Assigned Subagent(s)**: frontend-developer

**Estimate**: 1 point

---

### Task 1.6: Testing

**Description**: Add tests for new components and integration.

**Files**:
- `apps/web/__tests__/components/gifts/LinkedEntityIcons.test.tsx` (new)
- `apps/web/__tests__/components/gifts/QuickPurchaseButton.test.tsx` (new)
- `apps/web/__tests__/components/gifts/GiftCard.test.tsx` - Update existing

**Test Cases**:
- LinkedEntityIcons renders with various recipient/list counts
- Tooltips display correct content
- Click handlers fire with correct IDs
- QuickPurchaseButton handles single/multi list cases
- GiftCard integration with new components
- Mobile vs desktop layout behavior

**Acceptance Criteria**:
- [ ] Unit tests pass for new components
- [ ] Integration tests for GiftCard
- [ ] No regression in existing tests

**Assigned Subagent(s)**: ui-engineer-enhanced

**Estimate**: 1 point

---

## Quality Gates

### Phase 1 Exit Criteria
- [ ] All tasks completed and merged
- [ ] Gift API returns list relationship data
- [ ] LinkedEntityIcons component implemented and documented
- [ ] QuickPurchaseButton component implemented
- [ ] GiftCard updated with new features
- [ ] Mobile and desktop layouts verified
- [ ] All tests passing
- [ ] No console errors or warnings

---

## Success Metrics

### Technical Metrics
- Bundle size increase < 5KB
- No performance regression (LCP, FID)
- Test coverage maintained > 80%

### User Experience Metrics
- Linked entities discoverable at a glance
- Quick purchase reduces clicks from 3 to 1
- External link accessible on all devices

---

## Risk Mitigation

### Risk: API Response Size
**Concern**: Adding list data may bloat gift response
**Mitigation**: Only include minimal list info (id, name, status); paginate if needed

### Risk: Multi-List Purchase UX
**Concern**: Confusing which list to mark as purchased
**Mitigation**: Default to most recent list; show clear dropdown if multiple

### Risk: Mobile Layout Crowding
**Concern**: New icons may crowd the card on small screens
**Mitigation**: Use compact icons; hide labels on mobile; test on iPhone SE width

---

## Quick Reference - Agent Commands

```bash
# Backend API task
Task("python-backend-engineer", "Extend GiftResponse schema to include list_items array with list_id, list_name, and status for each list containing this gift. Update repository and service layers accordingly.")

# UI Components
Task("ui-engineer-enhanced", "Create LinkedEntityIcons component following Task 1.2 spec in gift-card-enhancements-v1.md")

Task("ui-engineer-enhanced", "Create QuickPurchaseButton component following Task 1.3 spec in gift-card-enhancements-v1.md")

# Integration
Task("ui-engineer-enhanced", "Update GiftCard.tsx to integrate LinkedEntityIcons and QuickPurchaseButton per Task 1.4 spec")

# Testing
Task("ui-engineer-enhanced", "Add unit tests for LinkedEntityIcons and QuickPurchaseButton components")
```

---

## Dependencies

- None external - self-contained enhancement
- Internal: May need to coordinate with any ongoing gift-related changes

---

## Notes

- External link icon already exists for desktop - task involves making it consistent across mobile
- Status changes via QuickPurchaseButton affect list_item status, not gift directly
- Consider future enhancement: Bulk "mark as purchased" in selection mode
