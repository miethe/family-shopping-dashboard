---
title: "PRD: Gifts Action Bar Enhancements v1"
description: "Add quality-of-life enhancements to Gift cards: status selection, list management, clickable filters, price editing, and Santa toggle."
audience: [ai-agents, developers]
tags: [prd, planning, feature, frontend, ux, gifts]
created: 2025-12-22
updated: 2025-12-22
category: "product-planning"
status: ready
related: ["docs/project_plans/north-star/family-gifting-dash.md", "apps/web/components/gifts/GiftCard.tsx"]
---

# Feature Brief & Metadata

**Feature Name:**

> Gifts Action Bar Enhancements v1

**Filepath Name:**

> `gifts-action-bar-v1`

**Date:**

> 2025-12-22

**Author:**

> Claude Opus (PRD Writer Agent)

**Related Epic(s)/PRD ID(s):**

> Gifts Module Polish & UX Refinement Epic

**Related Documents:**

> - Family Gifting Dashboard North Star: `docs/project_plans/north-star/family-gifting-dash.md`
> - GiftCard Component: `apps/web/components/gifts/GiftCard.tsx` (lines 335–378 action bar)
> - Gift Model: `services/api/app/models/gift.py`
> - Gift Schemas: `services/api/app/schemas/gift.py`
> - Gift API Routes: `services/api/app/api/gifts.py`
> - Gift Hooks: `apps/web/hooks/useGifts.ts`
> - Web Architecture Guide: `apps/web/CLAUDE.md`
> - API Architecture Guide: `services/api/CLAUDE.md`

---

## 1. Executive Summary

This feature delivers 7 interrelated quality-of-life enhancements to the Gift cards on the `/gifts` page, making gift management faster and more intuitive. Users will gain one-click status changes, multi-list assignment, editable pricing, and quick filters via clickable chips and avatars. A new "From Santa" toggle enables gift hiding/personalization. These improvements reduce modal navigation and clicks-per-task, aligning with the dashboard's mobile-first, 2-3 user model.

**Priority:** MEDIUM-HIGH

**Key Outcomes:**
- Users can change gift status with 1 click (no modal open)
- Users can assign gifts to multiple lists via dropdown multi-select
- Users can add gifts to new lists without leaving the card
- Price is editable inline via dialog (no detail modal required)
- Status, person, and list chips are clickable filters (refine page view)
- "From Santa" toggle adds gift personalization layer with visual indicator
- Action bar remains clean on desktop (expanded bottom section) and mobile (overflow menu)
- All features respect single-tenant (2-3 users) simplicity and real-time sync via React Query

---

## 2. Context & Background

### Current State

The Gift card (`apps/web/components/gifts/GiftCard.tsx`) currently has a minimal action bar:

**Desktop** (lines 335–378):
- Single "Assign Recipient" button with dropdown picker
- Shows 1 person at a time
- No status selector in bar (status is read-only chip above)
- No list management
- No inline editing

**Mobile** (lines 207–263):
- Overflow menu button (⋮) with 3 options: Open URL, Assign Recipient, Change Status
- Change Status via `StatusSelector` component (4 radio buttons: IDEA, SELECTED, PURCHASED, RECEIVED)
- Same limitation: no list assignment

**Card Interactions:**
- Clickable title (opens URL if set)
- Clickable price area (shows "No price" placeholder but no action)
- Status chip (read-only, no filter capability)
- Person avatars in `LinkedEntityIcons` (show recipients, not clickable for filtering)
- List links in `LinkedEntityIcons` (show lists, not clickable for filtering)

**Price Management:**
- Only editable via gift detail modal or API
- No inline dialog option

**Santa Flag:**
- Field does not exist yet in `Gift` model; needs migration

### Problem Space

**For Users:**
1. **Status changes require 2+ taps/clicks** — mobile: open menu → select option; desktop: click button → click status
2. **Cannot assign to multiple lists** — must open detail modal or use API; no bulk list assignment from card
3. **Cannot add gifts to new lists** — no "create list" dialog in action bar
4. **Price editing requires modal navigation** — clicking price does nothing; must open detail view
5. **No quick filtering** — cannot click status/person/list chip to filter page view (useful for finding "all purchased gifts" or "all of John's gifts")
6. **No Santa personalization** — cannot hide gift from all users except one (e.g., surprise gifts)

**For Product:**
- Action bar underutilizes card real estate on desktop
- Mobile menu feels crowded; status selection via radio buttons is verbose
- No affordance for "create list" workflow during gift assignment
- Missing gift personalization feature (Santa flag) blocks family-specific UX

### Architectural Context

**Data Layer:**
- Gift model uses SQLAlchemy with relationships to `Person` (via `GiftPerson` linking table) and `ListItem` (for list membership)
- Status is enum: `IDEA`, `SELECTED`, `PURCHASED`, `RECEIVED`
- No `from_santa` field yet—requires migration

**Frontend Patterns:**
- React Query for fetching (`useGifts`, `useUpdateGift`, etc.) with 5-min stale time
- `StatusSelector` component exists for status picker UI
- `PersonDropdown` component supports single-select (will need multi-select variant)
- No list picker component yet—will create
- Mobile-first: 44px touch targets, safe areas, responsive breakpoints

**Real-Time Sync:**
- No WebSocket for gifts (unlike Kanban board items)
- React Query cache invalidation on mutation success

### Competitive/UX Notes

**Benchmarks** (gift registry/registry apps):
- One-tap status changes (common)
- Bulk actions on cards (right-click menu, checkbox select, drag-drop)
- Click-to-filter on tags/status/owner
- Inline price edit (Etsy, Pinterest wishlist)

While single-tenant, these UX patterns match user expectations and are table-stakes for productivity.

---

## 3. Problem Statement

**Core Gaps:**

1. **Inefficient status management** — Changing gift status requires 2+ interactions and modal navigation on mobile
2. **No bulk list assignment** — Users cannot assign a gift to 1+ lists from the card; must use modal
3. **No list creation workflow** — Adding a gift to a new list requires leaving the card
4. **Uneditable price inline** — Users must open detail modal to edit price
5. **No quick filtering** — Status, person, and list chips are read-only; no page-level filtering affordance
6. **No gift personalization** — No "From Santa" toggle for family-specific privacy/surprise scenarios

These gaps create friction in the most common gift management workflows (assign, categorize, track status, gift personalization) and force modal-driven interactions that slow down 2-3 user family teams.

---

## 4. Goals & Success Metrics

### User Goals

| Goal | Metric | Target |
|------|--------|--------|
| **Quick status updates** | Avg time to change status from card | <2 sec (1 click on desktop, 2 taps on mobile) |
| **Flexible list assignment** | % of assignments from card (not modal) | >60% (baseline: ~20%) |
| **Discoverability of filtering** | % of users who filter via chip click | >40% (baseline: ~10% via API filters) |
| **Price editing ease** | % of price edits from card (not detail) | >50% (baseline: ~30%) |
| **Gift personalization** | # of families using Santa toggle | >80% adoption if feature visible |

### Product Goals

| Goal | Rationale |
|------|-----------|
| **Reduce modal navigation** | Keep users on list view; faster workflows for 2-3 person teams |
| **Increase action bar usage** | Desktop bar currently underused; expand action surface |
| **Add personalization layer** | "From Santa" toggle enables private/surprise gift scenarios |
| **Improve mobile UX** | Consolidate menu options into dedicated buttons; reduce overflow menu burden |
| **Maintain simplicity** | Single-tenant; keep component complexity low (no drag-drop, bulk select) |

---

## 5. Requirements

### Functional Requirements

#### F1: Status Selection Button (Inline, Multi-Status)

**What:**
- Add a **"Status"** button to the action bar (desktop) and mobile menu
- Button shows current status as a dropdown menu (same as mobile overflow menu currently)
- Menu displays all 4 status options as clickable items (not radio buttons)
- Selecting a status immediately updates the gift and closes the dropdown
- Clicking the button again re-opens the dropdown (stay-open behavior optional: auto-close on select recommended)

**Where:**
- **Desktop:** Bottom action bar, left of or after "Assign" button (order: Assign, Status, +List)
- **Mobile:** In overflow menu, replace the current `StatusSelector` section with a single "Change Status" submenu item or dedicated button

**Behavior:**
- Status change is optimistic; shows toast feedback on success/error
- No page reload required
- Respects disabled state during mutation (`isPending`)

**Design Notes:**
- Use `StatusSelector` component or create button variant
- Dropdown should close on click-outside (parent card click)
- Touch target: min 44x44px

#### F2: +List Button (Multi-Select List Assignment)

**What:**
- Add a **"+List"** button to the action bar (desktop) and mobile menu
- Clicking opens a dropdown with:
  - Checkbox list of all existing lists (multi-select; user can pick 1+ lists)
  - "Create New List" button at bottom
  - Confirm/Apply button
- After confirming, gift is linked to selected lists
- If "Create New List" is clicked, a dialog opens to create a new list, then close and re-show the list picker

**Where:**
- **Desktop:** Bottom action bar, after "Status" button
- **Mobile:** Overflow menu, below "Change Status" section

**Behavior:**
- Multi-select: user can toggle multiple checkboxes
- Dropdown stays open until user clicks "Apply" or clicks outside card
- Creating a new list from the dialog auto-adds the gift to the new list
- After applying, dropdown closes and toast shows "Added to X lists"
- Optimistic updates; React Query invalidates on success

**Design Notes:**
- Checkboxes must be 44px touch targets
- "Create New List" button is persistent in dropdown
- Dropdown max-height with scroll for many lists (>10)

#### F3: Status Chip Filter (Click to Filter)

**What:**
- The status pill/chip shown on each card (currently read-only) becomes **clickable**
- Clicking the status chip filters the gift list by that status
- Page-level query params update: `?statuses=purchased` (or add to existing filter)
- User can see filtered results and clear filter via button or chip click again

**Where:**
- On the gift card, below title (same location as current `StatusPill`)

**Behavior:**
- Click status chip → filter page to only gifts with that status
- Click again → toggle filter off (remove from query)
- Clicking another chip while one is active → replace filter (not AND logic, simpler for 2-3 users)
- Visual feedback: chip appears "active" or highlighted when filter is applied

**Design Notes:**
- Add cursor: pointer; hover state
- Optional: show "X 20 results" badge near filter to indicate active filter
- Coordinate with page-level filter logic (already exists in `useGifts` hook via `statuses` param)

#### F4: Person Avatar Filter (Click to Filter)

**What:**
- The person avatars shown in `LinkedEntityIcons` become **clickable**
- Clicking an avatar filters the gift list by that person (gift recipient)
- Page-level query params: `?person_ids=5` (additive to existing person filter)
- Multiple avatars can be clicked to OR-filter by multiple people

**Where:**
- In the `LinkedEntityIcons` component, which appears below title / status

**Behavior:**
- Click avatar → add person to filter (`person_ids` param)
- Click same avatar again → remove person from filter
- Click another avatar → add that person (OR logic, not exclusive)
- Visual feedback: avatar appears highlighted/ringed when that person's filter is active

**Design Notes:**
- Ensure `onRecipientClick` callback is connected (already in GiftCard props)
- Coordinate with existing `useGifts` hook filtering by `person_ids`
- Touch target: avatar size must be ≥44px (check LinkedEntityIcons component)

#### F5: List Link Filter (Click to Filter)

**What:**
- The list links/badges shown in `LinkedEntityIcons` become **clickable**
- Clicking a list badge filters the gift list by that list
- Page-level query params: `?list_ids=3`
- Only one list filter active at a time (simpler interaction for small team)

**Where:**
- In `LinkedEntityIcons`, as clickable list badges

**Behavior:**
- Click list badge → filter to gifts in that list
- Click same badge again → clear list filter
- Click another badge → replace list filter
- Visual feedback: badge highlighted when filter active

**Design Notes:**
- Ensure `onListClick` callback is connected (already in GiftCard props)
- Coordinate with `useGifts` hook filtering by `list_ids`

#### F6: Clickable Price (Edit Dialog)

**What:**
- The price text on the card (currently read-only) becomes **clickable**
- Clicking price opens an **inline dialog** (not full-page modal) with:
  - Text input for price (decimal, accepts "$" prefix or plain number)
  - "No price" checkbox (if checked, price is set to null)
  - Cancel and Save buttons
  - On save, gift price is updated and dialog closes
- If no price is set, clicking "No price" placeholder text opens the same dialog

**Where:**
- Footer section of card, where price is shown (left side, next to Quick Purchase button)

**Behavior:**
- Click price → dialog opens (as a popover, positioned above/below card)
- Edit price, click Save → gift updates via mutation, dialog closes, card refreshes
- Click Cancel or outside dialog → closes without saving
- Optimistic updates recommended; show toast on success/error

**Design Notes:**
- Dialog should not be a full modal (no overlay covering entire page)
- Positioning: popover above or below price text, aligned to card
- Input validation: decimal places (2), non-negative, max ~10,000
- "No price" checkbox is convenience for clearing price (instead of deleting text)

#### F7: From Santa Toggle (UI + Backend)

**What:**
- Add a **"From Santa"** toggle to the action bar (desktop) and mobile menu
- When enabled, a gift is marked as "from Santa" (boolean flag)
- When a gift is marked "from Santa", a **Santa icon** appears on the card with a tooltip "From Santa"
- Icon placement: top-right corner of card (near Quick Purchase button or in status area)
- Toggle behavior: immediate update, no confirmation

**Backend Changes:**
- Add `from_santa: bool` field to Gift model (default False)
- Add migration for the column
- Update GiftUpdate schema to include `from_santa: bool | None`
- Update GiftResponse to include `from_santa: bool`

**Frontend Changes:**
- Add toggle button to action bar (desktop) and mobile menu
- Add Santa icon display logic (show when `from_santa=true`)
- Icon click shows tooltip: "From Santa"

**Where:**
- Action bar button (desktop, after +List or in mobile menu)
- Icon: top-right card area (near price or outside card edge for visibility)

**Behavior:**
- Click toggle → immediately update gift (optimistic)
- Show Santa icon when `from_santa=true`
- Icon has tooltip on hover/long-press
- Respects disabled state during mutation

**Design Notes:**
- Icon: use existing icon library (suggest: 🎅 or custom Santa SVG from Radix)
- Toggle should be a checkbox or button with visual state (on/off)
- Tooltip: "From Santa" or "This gift is from Santa"
- Placement: be mindful of card layout; icon should not occlude image

### Non-Functional Requirements

| Requirement | Details |
|-------------|---------|
| **Performance** | All dropdowns, dialogs, and filters must load <500ms; no noticeable lag on 2-3 user team |
| **Mobile responsiveness** | All action bar items must fit within safe area; use overflow menu on mobile if needed |
| **Accessibility** | All buttons ≥44px touch targets; keyboard navigation for dropdowns; ARIA labels for toggle |
| **Real-time sync** | React Query cache invalidation on mutation; no manual refresh needed |
| **Error handling** | Failed mutations show toast error; user can retry; optimistic updates rollback on error |
| **Single-tenant** | No multi-user complexity (locking, conflict detection); assume 2-3 users, no simultaneous edits |
| **Design system** | Use Tailwind + Radix; match existing GiftCard styling (warm tones, soft modernity) |
| **Backward compatibility** | No breaking changes to Gift API or schema (only additions: `from_santa`, allow multi-select for list assignment) |

---

## 6. Scope

### In Scope

1. Status selection button + dropdown UI
2. +List button with multi-select dropdown + "Create New List" dialog integration
3. Click-to-filter for status chips, person avatars, list badges
4. Clickable price with edit dialog
5. From Santa toggle + backend field migration
6. Integration with existing React Query hooks (`useGifts`, `useUpdateGift`)
7. All desktop and mobile layouts for action bar
8. Error handling and toast feedback
9. Unit & integration tests for new components
10. Responsive design (mobile-first, 44px touch targets)

### Out of Scope

1. Bulk select / multi-gift actions (future feature)
2. Drag-drop reordering of gifts or assignments
3. WebSocket real-time sync for gifts (React Query invalidation is sufficient)
4. Gift detail modal redesign (only clickable price interaction on card)
5. New Person or Occasion creation workflows (only List creation via +List button)
6. Gift cloning or templating
7. Advanced filtering UI (filters remain URL-param driven, not UI-driven facets)
8. Custom sort orders (existing sort options remain API-driven)

---

## 7. Data Dependencies

### Backend Changes Required

#### Migration: Add `from_santa` Field

```sql
-- Alembic revision
ALTER TABLE gifts ADD COLUMN from_santa BOOLEAN DEFAULT FALSE NOT NULL;
```

**File:** `services/api/alembic/versions/[timestamp]_add_gift_from_santa.py`

#### Gift Model Update

```python
# services/api/app/models/gift.py
from_santa: Mapped[bool] = mapped_column(
    Boolean,
    default=False,
    nullable=False,
)
```

**File:** `services/api/app/models/gift.py`

#### Gift Schema Updates

```python
# services/api/app/schemas/gift.py

class GiftCreate(BaseModel):
    # ... existing fields ...
    from_santa: bool = Field(default=False, description="Mark gift as from Santa")

class GiftUpdate(BaseModel):
    # ... existing fields ...
    from_santa: bool | None = None

class GiftResponse(TimestampSchema):
    # ... existing fields ...
    from_santa: bool = Field(default=False)
```

**File:** `services/api/app/schemas/gift.py`

#### Gift API: No Changes Required

The existing `PATCH /gifts/{id}` endpoint already accepts `GiftUpdate` and will automatically support `from_santa` after schema update.

### Frontend Changes Required

#### New Hook: `useAddGiftToLists`

```typescript
// apps/web/hooks/useGifts.ts
export function useAddGiftToLists(giftId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (listIds: number[]) => giftApi.addToLists(giftId, listIds),
    onSuccess: (updatedGift) => {
      syncGiftCaches(queryClient, updatedGift);
      queryClient.invalidateQueries({ queryKey: ['gifts'], exact: false });
    },
  });
}
```

**Note:** This hook assumes a new API endpoint `/gifts/{id}/lists` (POST) will be created or uses existing linkage via `GiftUpdate` with `list_ids`.

#### New Component: `ListPickerDropdown`

```typescript
// apps/web/components/gifts/ListPickerDropdown.tsx
interface ListPickerDropdownProps {
  giftId: number;
  currentListIds?: number[];
  onApply?: (listIds: number[]) => void;
  onCreateList?: () => void;
}
export function ListPickerDropdown({ ... }: ListPickerDropdownProps) {
  // Multi-select checkboxes for lists
  // "Create New List" button
  // Apply/Cancel buttons
}
```

#### New Component: `PriceEditDialog`

```typescript
// apps/web/components/gifts/PriceEditDialog.tsx
interface PriceEditDialogProps {
  giftId: number;
  currentPrice: number | null;
  onClose: () => void;
  onSave?: (price: number | null) => void;
}
export function PriceEditDialog({ ... }: PriceEditDialogProps) {
  // Input for price
  // Checkbox for "No price"
  // Save/Cancel
}
```

#### Update: `GiftCard` Component

- Import `ListPickerDropdown`, `PriceEditDialog`
- Add status button to action bar
- Add +List button to action bar
- Add From Santa toggle to action bar (desktop) + mobile menu
- Make price clickable (open dialog)
- Make status chip clickable (filter)
- Make person avatars clickable (filter)
- Make list badges clickable (filter)
- Pass filter callbacks to parent page

**File:** `apps/web/components/gifts/GiftCard.tsx`

### API Contracts (No Changes to Existing Endpoints)

**Existing `PATCH /gifts/{id}`:**
```json
{
  "status": "purchased",
  "from_santa": true,
  "person_ids": [1, 2],
  ...
}
```

**Possible New Endpoint (if needed):**
```
POST /gifts/{id}/lists
{
  "list_ids": [1, 3, 5]
}
```

For now, assume list assignment goes via `GiftUpdate` and existing relationships.

---

## 8. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|-----------|
| **Dropdown menu positioning overlap** | On mobile, dropdown may appear off-screen or covered by mobile menu | Medium | Test dropdown positioning on small screens; use popover library with auto-positioning |
| **List creation dialog launch from dropdown** | Users may not expect nested dialog; UX confusion | Medium | Use clear CTA ("Create New List"); show success toast when new list is created and added |
| **Filter state confusion** | User clicks chip, filter applies, user forgets and clicks again (expects to toggle) | Low | Show visual "active filter" indicator; add clear filter button on page |
| **Optimistic updates fail** | Price or status change fails; optimistic UI shows change but API rejects | Low | Show toast error; rollback optimistic update; allow retry |
| **Multi-select list assignment complexity** | Users may accidentally assign to wrong lists | Low | Show list preview before confirming; require explicit Apply click |
| **From Santa toggle misuse** | Users toggle flag unintentionally; affects gift visibility | Very Low | Add tooltip; require confirmation (optional) |
| **Touch target size on mobile** | Icon size <44px; hard to tap | Low | Enforce 44px min for all interactive elements |
| **Performance: filter on large dataset** | If >100 gifts, filter + page render lags | Low | React Query pagination handles this; test with max ~300 gifts |

---

## 9. Acceptance Criteria

### Feature 1: Status Selection (Desktop & Mobile)

- [ ] Status button appears in action bar (desktop) and mobile menu
- [ ] Clicking button opens dropdown with 4 status options
- [ ] Selecting status updates gift and closes dropdown
- [ ] Toast shows "Status updated to X" on success
- [ ] Toast shows error if update fails
- [ ] Button disabled during mutation (`isPending`)
- [ ] Dropdown closes when clicking outside card
- [ ] Touch target ≥44px on mobile

### Feature 2: +List Button (Desktop & Mobile)

- [ ] "+List" button appears in action bar (desktop) and mobile menu
- [ ] Clicking opens dropdown with checkboxes for all lists
- [ ] User can select 1+ lists via checkboxes
- [ ] "Create New List" button opens dialog
- [ ] New list is created and auto-added to selected lists
- [ ] Clicking Apply confirms and updates gift
- [ ] Toast shows "Added to X lists"
- [ ] Dropdown closes after Apply
- [ ] Clicking outside dropdown closes it without saving
- [ ] Checkboxes are ≥44px on mobile

### Feature 3: Status Chip Filter

- [ ] Status chip is visually clickable (cursor: pointer, hover state)
- [ ] Clicking chip filters page to only gifts with that status
- [ ] Query params updated: `?statuses=purchased`
- [ ] Clicking same chip again removes filter
- [ ] Visual indicator shows which filter is active
- [ ] Filter works with existing React Query hook logic

### Feature 4: Person Avatar Filter

- [ ] Avatar is visually clickable (cursor: pointer, hover state)
- [ ] Clicking avatar filters page by that person
- [ ] Query params updated: `?person_ids=5`
- [ ] Multiple avatars can be clicked to OR-filter
- [ ] Clicking avatar again removes that person from filter
- [ ] Visual indicator shows which people are filtered

### Feature 5: List Badge Filter

- [ ] List badge is visually clickable (cursor: pointer, hover state)
- [ ] Clicking badge filters page by that list
- [ ] Query params updated: `?list_ids=3`
- [ ] Only one list filter active at a time
- [ ] Clicking same badge removes filter
- [ ] Visual indicator shows active filter

### Feature 6: Clickable Price (Edit Dialog)

- [ ] Price text is visually clickable (cursor: pointer, hover state)
- [ ] Clicking price opens dialog (not full modal)
- [ ] Dialog shows input for price and "No price" checkbox
- [ ] Entering price and clicking Save updates gift
- [ ] Clicking "No price" checkbox clears price
- [ ] Toast shows "Price updated"
- [ ] Toast shows error if update fails
- [ ] Clicking Cancel or outside dialog closes without saving
- [ ] Dialog positioned as popover (not full screen)

### Feature 7: From Santa Toggle

- [ ] `from_santa` field added to Gift model via migration
- [ ] `from_santa` field added to GiftCreate, GiftUpdate, GiftResponse schemas
- [ ] Toggle button appears in action bar (desktop) and mobile menu
- [ ] Clicking toggle updates `from_santa` flag (optimistic)
- [ ] Toast shows "Marked as from Santa" or "Unmarked"
- [ ] Santa icon appears on card when `from_santa=true`
- [ ] Icon has tooltip "From Santa"
- [ ] Icon placement does not occlude image or key info
- [ ] Toggle disabled during mutation

### Cross-Feature Acceptance

- [ ] All action bar buttons fit in desktop layout without wrapping
- [ ] Mobile overflow menu shows all new options
- [ ] All buttons ≥44px touch targets on mobile
- [ ] Safe area respected on iOS (top/bottom insets)
- [ ] No visual overlap of dropdowns/dialogs
- [ ] Optimistic updates work for all mutations
- [ ] React Query cache invalidation syncs all views
- [ ] No breaking changes to existing Gift API
- [ ] All new components have unit tests
- [ ] Integration tests cover happy path + error cases
- [ ] E2E test covers full workflow: status → list → filter → price → Santa toggle

---

## 10. Implementation Phases

### Phase 1: Backend (Days 1–2)

**Deliverables:**
- Alembic migration for `from_santa` field
- Update Gift model with new field
- Update GiftCreate, GiftUpdate, GiftResponse schemas
- Test: Model migration, schema serialization

**Tasks:**
1. Create Alembic migration file
2. Add `from_santa: bool` to Gift model
3. Update schemas (GiftCreate, GiftUpdate, GiftResponse)
4. Run migration locally; verify column exists
5. Test: POST /gifts with `from_santa: true/false`
6. Test: PATCH /gifts/{id} updates `from_santa`

**Files Modified:**
- `services/api/alembic/versions/[timestamp]_add_gift_from_santa.py` (new)
- `services/api/app/models/gift.py`
- `services/api/app/schemas/gift.py`

**Acceptance:** Migration runs successfully; gift CRUD includes `from_santa` field in responses.

---

### Phase 2: Status & List Button UI (Days 3–4)

**Deliverables:**
- Status selection button + dropdown UI (desktop + mobile)
- +List button + multi-select dropdown UI (desktop + mobile)
- Integration with existing hooks (useUpdateGift, useAttachPeopleToGift)

**Tasks:**
1. Create StatusButton component (button + dropdown)
2. Update GiftCard action bar to include Status button
3. Create ListPickerDropdown component (checkboxes + Apply)
4. Update GiftCard to include +List button
5. Update mobile menu to include both buttons
6. Wire up mutations; test optimistic updates
7. Add error handling + toast feedback
8. Test on mobile (44px targets, responsive)

**Files Modified:**
- `apps/web/components/gifts/GiftCard.tsx`
- `apps/web/components/gifts/StatusButton.tsx` (new)
- `apps/web/components/gifts/ListPickerDropdown.tsx` (new)
- `apps/web/hooks/useGifts.ts` (add hook if needed for list assignment)

**Acceptance:** Status changes via button; list assignment via dropdown; both work on desktop and mobile; toasts show success/error.

---

### Phase 3: Clickable Filters (Days 5–6)

**Deliverables:**
- Status chip click-to-filter
- Person avatar click-to-filter
- List badge click-to-filter
- Visual active filter indicators

**Tasks:**
1. Update GiftCard to make status chip clickable
2. Connect onStatusFilter callback to parent page
3. Update LinkedEntityIcons to make avatars/badges clickable
4. Connect onPersonClick, onListClick callbacks to parent page
5. Update /gifts page to handle filter callbacks
6. Update useGifts query params based on filters
7. Add visual active filter states (highlight, icon, badge)
8. Test filter toggling (click → filter → click → unfilter)

**Files Modified:**
- `apps/web/components/gifts/GiftCard.tsx`
- `apps/web/components/gifts/LinkedEntityIcons.tsx` (make clickable)
- `apps/web/pages/gifts/page.tsx` (handle filter callbacks)
- `apps/web/hooks/useGifts.ts` (if needed for filter state management)

**Acceptance:** Clicking status/person/list filters page; clicking again removes filter; visual feedback shows active filter.

---

### Phase 4: Price Edit Dialog (Days 7–8)

**Deliverables:**
- Clickable price on card
- Price edit dialog (popover, not modal)
- Price update mutation + error handling

**Tasks:**
1. Create PriceEditDialog component
2. Update GiftCard footer to make price clickable
3. Add state to track dialog open/close
4. Create mutation hook for price update (via useUpdateGift)
5. Add input validation (decimal, non-negative, max 10k)
6. Add "No price" checkbox for clearing price
7. Test on mobile (dialog positioning, input size)
8. Add error handling + retry

**Files Modified:**
- `apps/web/components/gifts/GiftCard.tsx`
- `apps/web/components/gifts/PriceEditDialog.tsx` (new)
- `apps/web/hooks/useGifts.ts` (if new mutation needed)

**Acceptance:** Clicking price opens dialog; editing and saving updates gift; dialog closes; error shown if update fails; no full-page modal overlay.

---

### Phase 5: From Santa Toggle & Icon (Days 9–10)

**Deliverables:**
- From Santa toggle button (desktop + mobile)
- Santa icon display on card
- Icon tooltip

**Tasks:**
1. Add From Santa toggle to action bar (button or checkbox)
2. Add toggle to mobile menu
3. Wire up mutation via useUpdateGift
4. Add conditional Santa icon rendering (show when from_santa=true)
5. Position icon (top-right area, no occlusion)
6. Add tooltip "From Santa"
7. Test toggle state; verify icon shows/hides
8. Test on mobile (icon size, positioning)

**Files Modified:**
- `apps/web/components/gifts/GiftCard.tsx`
- `apps/web/lib/icons.tsx` (if Santa icon needs custom SVG)

**Acceptance:** Toggle works; icon appears/disappears; tooltip shows; works on mobile; no layout shift.

---

### Phase 6: Testing & Polish (Days 11–12)

**Deliverables:**
- Unit tests for new components
- Integration tests for mutations
- E2E tests for full workflows
- Responsive design refinement
- Accessibility audit

**Tasks:**
1. Write unit tests: StatusButton, ListPickerDropdown, PriceEditDialog
2. Write integration tests: status update, list assignment, price edit, Santa toggle
3. Write E2E test: complete workflow (status → list → filter → price → Santa)
4. Test on multiple screen sizes (iPhone SE, iPad, desktop)
5. Test keyboard navigation (dropdowns, dialogs)
6. Test touch targets (≥44px)
7. Verify safe areas respected on iOS
8. Accessibility review (ARIA labels, color contrast, focus states)
9. Performance check (no layout thrash, <500ms interactions)
10. Bug fixes and polish

**Files Modified:**
- `apps/web/__tests__/components/gifts/StatusButton.test.tsx` (new)
- `apps/web/__tests__/components/gifts/ListPickerDropdown.test.tsx` (new)
- `apps/web/__tests__/components/gifts/PriceEditDialog.test.tsx` (new)
- `apps/web/__tests__/integration/gifts-workflow.test.tsx` (new)
- `apps/web/__tests__/e2e/gifts-action-bar.spec.ts` (new)

**Acceptance:** All tests pass; no console errors; responsive on all devices; accessible; performance acceptable.

---

## 11. Assumptions & Open Questions

### Assumptions

1. **List assignment via existing API:** Assumption that gift-to-list linkage goes through `ListItem` model and can be updated via `GiftUpdate` schema (or a new endpoint). If not, will require small API addition.
2. **React Query sufficiency:** Assumption that cache invalidation is sufficient for real-time sync (no WebSocket needed for gifts).
3. **Single-tenant simplicity:** Assumption that no conflict detection or locking is needed (2-3 users, no simultaneous edits).
4. **Mobile-first breakpoint:** Assumption that mobile overflow menu is used for buttons that don't fit in action bar (adaptive layout based on available width).
5. **Existing design system:** Assumption that Radix, Tailwind, and existing UI components (StatusSelector, PersonDropdown, etc.) are sufficient and don't require extensive new styling.
6. **Santa icon availability:** Assumption that an icon (emoji or custom SVG) exists or can be added without bloat.

### Open Questions

1. **List assignment API:** Is there a specific endpoint for adding a gift to multiple lists, or should it go via `GiftUpdate` with `list_ids`? (Affects hook design)
2. **Filter interaction on mobile:** Should filters persist in URL params, or should they be session-state only? (Affects refresh/navigation behavior)
3. **Price validation:** Should price have a max value (e.g., $10,000)? (Affects input validation)
4. **Multi-select list dropdown max items:** Should there be pagination if >20 lists? (Affects UX on large families)
5. **Confirm dialog for From Santa toggle:** Should toggling "From Santa" require confirmation? (Risk of accidental toggle; mitigated by tooltip + toast)
6. **List creation from dropdown:** Should the user be able to create a new list from the list picker without leaving the dropdown? (Current plan: nested dialog, which is slightly disruptive)
7. **Collapsing action bar on small screens:** At what width should the desktop action bar collapse into mobile menu? (Current plan: `md:` breakpoint, 768px+)

---

## 12. Success Criteria Summary

| Criterion | Target | Owner |
|-----------|--------|-------|
| **Status changes <2 sec** | Measure user interaction time | QA/Testing |
| **List assignment >60% from card** | Track mutation source (card vs modal) | Analytics (future) |
| **Chip filter discovery >40%** | User research post-launch | Product |
| **All touch targets ≥44px** | Visual inspection + automated testing | Frontend Dev |
| **Zero breaking API changes** | Backward compatibility review | Backend Dev |
| **E2E test coverage >90%** | Test report | QA/Testing |
| **Accessibility WCAG AA** | Automated + manual audit | Accessibility review |
| **Performance <500ms interactions** | Chrome DevTools profiling | Frontend Dev |

---

## 13. Related Documents & References

- **Project North Star:** `docs/project_plans/north-star/family-gifting-dash.md`
- **GiftCard Component:** `apps/web/components/gifts/GiftCard.tsx` (lines 335–378)
- **Gift Model:** `services/api/app/models/gift.py`
- **Gift Schemas:** `services/api/app/schemas/gift.py`
- **Gift API:** `services/api/app/api/gifts.py`
- **Gift Hooks:** `apps/web/hooks/useGifts.ts`
- **Web Architecture:** `apps/web/CLAUDE.md`
- **API Architecture:** `services/api/CLAUDE.md`
- **CLAUDE.md (root):** Project directives and patterns

---

## 14. Appendix: UI Mockups & Flow Diagrams

### User Flow: Status Change

```
User clicks "Status" button
  ↓
Dropdown opens (IDEA | SELECTED | PURCHASED | RECEIVED)
  ↓
User clicks status option (e.g., PURCHASED)
  ↓
Gift updates (optimistic)
  ↓
Dropdown closes
  ↓
Toast shows "Status updated to Purchased"
```

### User Flow: List Assignment

```
User clicks "+List" button
  ↓
Dropdown opens with list checkboxes
  ↓
User checks 1+ lists
  ↓
User clicks "Apply"
  ↓
Gift linked to selected lists (optimistic)
  ↓
Dropdown closes
  ↓
Toast shows "Added to 3 lists"
```

### User Flow: Price Edit

```
User clicks price text
  ↓
PriceEditDialog opens (popover)
  ↓
User enters price (e.g., 49.99)
  ↓
User clicks "Save"
  ↓
Price updates (optimistic)
  ↓
Dialog closes
  ↓
Toast shows "Price updated"
```

### User Flow: Filter via Status Chip

```
User clicks status chip (e.g., "Purchased")
  ↓
Page filters to only purchased gifts
  ↓
Query params: ?statuses=purchased
  ↓
Chip highlighted to show active filter
  ↓
User clicks same chip again
  ↓
Filter cleared
  ↓
Query params: (no statuses param)
```

### Component Hierarchy

```
GiftCard
  ├── StatusButton
  │   └── Dropdown (IDEA, SELECTED, PURCHASED, RECEIVED)
  ├── ListPickerDropdown
  │   ├── Checkbox list
  │   ├── "Create New List" button → ListCreateDialog
  │   └── Apply button
  ├── FromSantaToggle
  │   └── Toggle button
  ├── LinkedEntityIcons (updated for clickable)
  │   ├── Person avatars (clickable)
  │   └── List badges (clickable)
  ├── Price (clickable)
  │   └── PriceEditDialog
  │       ├── Text input
  │       ├── "No price" checkbox
  │       └── Save/Cancel
  └── StatusPill (clickable)
      └── Filter trigger
```

---

**Document Version:** 1.0
**Last Updated:** 2025-12-22
**Prepared For:** Development Team (Backend + Frontend)
**Approval Status:** Ready for implementation
