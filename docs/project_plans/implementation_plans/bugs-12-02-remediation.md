---
title: "Bugs 12-02 Remediation - Implementation Plan"
description: "Comprehensive fix for broken features identified in bugs-12-02.md after failed initial remediation"
audience: [ai-agents, developers]
tags: [implementation, bug-fixes, remediation, ui, modals]
created: 2025-12-02
category: "bug-fixes"
status: in-progress
related:
  - /docs/project_plans/bugs/bugs-12-02.md
  - /.claude/worknotes/fixes/bug-fixes-2025-12.md
---

# Implementation Plan: Bugs 12-02 Remediation

## Executive Summary

Previous remediation attempt created enhanced components but **the pages don't use them**. Root cause: duplicate implementations where pages render inline instead of using the fixed components.

**Critical Discovery:**

- `PersonCard.tsx` - Enhanced component EXISTS with all requested features
- `app/people/page.tsx` - Does NOT use PersonCard; has inline rendering with only avatar, name, group
- `PersonDetailModal.tsx` - Enhanced modal EXISTS with tabs, edit/delete
- `app/people/page.tsx` - Uses basic Dialog instead of PersonDetailModal

**This pattern likely affects other pages as well.**

**Critical Issues:**

1. **ROOT CAUSE**: Pages render inline instead of using enhanced components
2. `/lists` page crashes - `item.gift.price` null reference error
3. Linked Entities tabs show "Coming soon" placeholders
4. Gift filters use wrong UI pattern - needs collapsible sections

**Components That ARE Fixed (but not used):**

- PersonCard.tsx - has age, birthday, gift count, lists with +N
- PersonDetailModal.tsx - has py-12, min-h-[240px], tabs, edit/delete
- OccasionDetailModal.tsx - has tabs, edit/delete
- GiftDetailModal.tsx - has tabs, edit/delete

---

## Phase 0: Wire Up Existing Components (ROOT CAUSE FIX)

**Priority**: P0 - This is why all "fixes" appear broken
**Assigned**: `ui-engineer-enhanced`

### Issue

Enhanced components exist but pages don't use them. The `/people` page has inline rendering instead of using `PersonCard` and `PersonDetailModal`.

### Root Cause

`app/people/page.tsx` lines 299-333 render cards inline with only avatar, name, and group. Lines 399-522 use a basic `Dialog` instead of `PersonDetailModal`.

The enhanced `PersonCard` component at `components/people/PersonCard.tsx` has all requested features but is never imported or used.

### Tasks

| ID | Task | Description | Acceptance Criteria |
|----|------|-------------|---------------------|
| 0.1 | Refactor /people page to use PersonCard | Replace inline card rendering (lines 299-333) with PersonCard component | Cards show age, birthday, gift count, lists |
| 0.2 | Remove inline Dialog, PersonCard handles modals | PersonCard already includes PersonDetailModal; remove Dialog code (lines 399-522) | Modal shows hero section correctly, has tabs |
| 0.3 | Clean up unused state | Remove `selectedRecipient` state no longer needed | No dead code |
| 0.4 | Verify all PersonCard features work | Test age, birthday, gift count, lists display | All #2 requirements met |

### Current Code (to replace)

```tsx
// app/people/page.tsx lines 299-333 - REPLACE THIS
{filteredPeople.map((person: Person) => (
  <div
    key={person.id}
    onClick={() => setSelectedRecipient(person)}
    className="bg-white p-6 rounded-3xl..."
  >
    {/* Only shows avatar, name, group badge */}
  </div>
))}
```

### New Code

```tsx
// Import PersonCard
import { PersonCard } from '@/components/people/PersonCard';

// Replace inline rendering with:
{filteredPeople.map((person: Person) => (
  <PersonCard key={person.id} person={person} />
))}

// Remove: selectedRecipient state, Dialog component, inline modal code
```

### Files to Modify

- `apps/web/app/people/page.tsx`

### Quality Gate

- [ ] PersonCard component renders on /people page
- [ ] Age and birthday display correctly
- [ ] Gift count shows X/Y format
- [ ] Lists badges with +N overflow work
- [ ] Clicking card opens PersonDetailModal
- [ ] Hero section in modal not cut off
- [ ] Modal has Overview, Linked Entities, History tabs
- [ ] Edit and Delete buttons work

---

## Phase 1: Critical Bug Fix

**Priority**: P0 - Blocks all /lists functionality
**Assigned**: `ui-engineer`

### Issue

`TypeError: Cannot read properties of undefined (reading 'price')` crashes the ListDetailModal.

### Root Cause

`apps/web/components/modals/ListDetailModal.tsx:148` accesses `item.gift.price` without null check.

### Tasks

| ID | Task | Description | Acceptance Criteria |
|----|------|-------------|---------------------|
| 1.1 | Fix null reference in totalValue calculation | Add optional chaining to `item.gift?.price` at line 148 | `/lists` page loads without crash |
| 1.2 | Audit all `.gift.` property accesses | Search ListDetailModal for other unguarded property accesses | No runtime errors when gifts are undefined |
| 1.3 | Add type guard for ListItemWithGift | Create helper to validate item has gift before accessing | Consistent null safety pattern |

### Files to Modify

- `apps/web/components/modals/ListDetailModal.tsx`

### Quality Gate

- [ ] `/lists` page loads without errors
- [ ] ListDetailModal opens for lists with and without items
- [ ] No TypeScript errors

---

## Phase 2: Linked Entities Implementation

**Priority**: P1 - Core feature incomplete
**Assigned**: `ui-engineer-enhanced`, `python-backend-engineer`

### Issue
All entity modals have "Linked Entities" tabs showing placeholder text instead of actual linked data.

### Current State
- Backend API supports filtering lists by `person_id` and `occasion_id`
- Frontend hooks don't expose filtered queries
- Modal tabs show "Coming soon: Lists and gift associations will be displayed here"

### Tasks

| ID | Task | Description | Acceptance Criteria |
|----|------|-------------|---------------------|
| 2.1 | Add useListsForPerson hook | Query `GET /lists?person_id=X` | Hook returns lists filtered by person |
| 2.2 | Add useListsForOccasion hook | Query `GET /lists?occasion_id=X` | Hook returns lists filtered by occasion |
| 2.3 | Add useListsForGift hook | Query lists containing a specific gift | Hook returns lists for a gift |
| 2.4 | Implement PersonDetailModal linked tab | Replace placeholder with list cards | Shows lists attached to person |
| 2.5 | Implement OccasionDetailModal linked tab | Replace placeholder with list cards | Shows lists attached to occasion |
| 2.6 | Implement GiftDetailModal linked tab | Show lists containing this gift | Shows all lists with this gift |
| 2.7 | Add list item click navigation | Clicking list opens ListDetailModal | Smooth navigation between modals |

### Files to Modify
- `apps/web/hooks/useLists.ts` - Add filtered query hooks
- `apps/web/components/modals/PersonDetailModal.tsx` - Lines 421-439
- `apps/web/components/modals/OccasionDetailModal.tsx` - Lines 326-343
- `apps/web/components/modals/GiftDetailModal.tsx` - Linked Entities tab

### Implementation Pattern

```typescript
// useLists.ts addition
export function useListsForPerson(personId: number | undefined) {
  return useQuery({
    queryKey: ['lists', 'person', personId],
    queryFn: () => api.lists.getAll({ person_id: personId }),
    enabled: !!personId,
  });
}

export function useListsForOccasion(occasionId: number | undefined) {
  return useQuery({
    queryKey: ['lists', 'occasion', occasionId],
    queryFn: () => api.lists.getAll({ occasion_id: occasionId }),
    enabled: !!occasionId,
  });
}
```

### Quality Gate
- [ ] PersonDetailModal shows lists for that person
- [ ] OccasionDetailModal shows lists for that occasion
- [ ] GiftDetailModal shows lists containing that gift
- [ ] Empty state shown when no linked entities
- [ ] Clicking list navigates to ListDetailModal

---

## Phase 3: Gift Filter UI Redesign

**Priority**: P2 - UX improvement
**Assigned**: `ui-engineer-enhanced`, `ui-designer`

### Issue
Current filter UI shows all filter chips always expanded. User requested collapsible filter bar with individual collapsible sections.

### Current State
- FilterBar component exists at `apps/web/components/ui/filter-bar.tsx`
- GiftFilters uses FilterGroup components that are always expanded
- All chips visible at once = cluttered UI with many options

### Tasks

| ID | Task | Description | Acceptance Criteria |
|----|------|-------------|---------------------|
| 3.1 | Install Radix Collapsible | `pnpm add @radix-ui/react-collapsible` | Package installed |
| 3.2 | Create Collapsible UI component | Styled wrapper at `components/ui/collapsible.tsx` | Component exports Root, Trigger, Content |
| 3.3 | Update FilterBar to be collapsible | Add main expand/collapse toggle | Filter bar can collapse to header only |
| 3.4 | Update FilterGroup to be collapsible | Each section independently collapsible | Chevron rotates, content animates |
| 3.5 | Add collapse state management | Track which groups are expanded | State persists during session |
| 3.6 | Add active filter summary | Show "3 filters active" when collapsed | User knows filters are applied |
| 3.7 | Mobile-first collapse defaults | Collapsed by default on mobile | Appropriate default states per viewport |

### Visual Design Requirements
- Chevron icon rotates 180° when expanded
- Smooth height animation (300ms ease-out)
- 44px minimum touch targets on toggles
- Maintain "Soft Modernity" design system (warm colors, generous radii)
- Show active filter count badge

### Files to Modify
- `apps/web/components/ui/collapsible.tsx` (new)
- `apps/web/components/ui/filter-bar.tsx`
- `apps/web/components/gifts/GiftFilters.tsx`

### Quality Gate
- [ ] Filter bar collapses/expands with animation
- [ ] Each filter group independently collapsible
- [ ] Active filter count visible when collapsed
- [ ] Works well on mobile (44px touch targets)
- [ ] Chevron animations smooth

---

## Phase 4: History Tab Implementation

**Priority**: P3 - Enhancement (stretch goal)
**Assigned**: `python-backend-engineer`, `ui-engineer`

### Issue
All "History" tabs show placeholder text. Need actual activity tracking.

### Approach
Implement lightweight activity logging for entity changes.

### Tasks

| ID | Task | Description | Acceptance Criteria |
|----|------|-------------|---------------------|
| 4.1 | Design activity log schema | Create ActivityLog model | Schema captures entity changes |
| 4.2 | Create activity log migration | Alembic migration for activity_logs table | Migration runs successfully |
| 4.3 | Add activity logging service | Log create/update/delete events | Events recorded on entity changes |
| 4.4 | Create activity log API endpoint | `GET /activities?entity_type=X&entity_id=Y` | Endpoint returns filtered activities |
| 4.5 | Create useActivityLog hook | Query activities for an entity | Hook fetches activity history |
| 4.6 | Implement History tab UI | Timeline component showing changes | History displays in all modals |

### Schema Design

```python
class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    entity_type: Mapped[str]  # "gift", "person", "list", "occasion"
    entity_id: Mapped[int]
    action: Mapped[str]  # "created", "updated", "deleted"
    changes: Mapped[dict | None]  # JSON of changed fields
    user_id: Mapped[int | None]
    created_at: Mapped[datetime]
```

### Quality Gate
- [ ] Activity logged on entity create/update/delete
- [ ] History tab shows activity timeline
- [ ] Displays what changed and when
- [ ] Works for all entity types

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Phase 1 fix breaks other functionality | High | Audit all `.gift` accesses before deploying |
| Linked entities queries slow with many lists | Medium | Add database indexes, use pagination |
| Collapsible animations janky on mobile | Medium | Use CSS transforms, test on real devices |
| History logging adds DB overhead | Low | Make logging async, batch writes |

---

## Implementation Sequence

```
Phase 1 (P0) → Phase 2 (P1) → Phase 3 (P2) → Phase 4 (P3)
     ↓              ↓              ↓              ↓
  Critical      Core Feature    UX Polish     Enhancement
   Bug Fix      Completion     Improvement     (Stretch)
```

**Dependencies:**
- Phase 2-4 can proceed independently after Phase 1
- Phase 3 and 4 have no interdependencies

---

## Subagent Assignments

| Phase | Primary Agent | Supporting Agents |
|-------|---------------|-------------------|
| Phase 1 | `ui-engineer` | - |
| Phase 2 | `ui-engineer-enhanced` | `python-backend-engineer` (if API changes needed) |
| Phase 3 | `ui-engineer-enhanced` | `ui-designer` (visual specs) |
| Phase 4 | `python-backend-engineer` | `ui-engineer` (frontend), `data-layer-expert` (schema) |

---

## Success Metrics

### Phase 1 Complete
- Zero runtime errors on `/lists` page
- All list modals open without crash

### Phase 2 Complete
- Linked Entities tabs show actual data
- Navigation between entity modals works

### Phase 3 Complete
- Filter UI matches collapsible pattern
- Mobile UX improved

### Phase 4 Complete (Stretch)
- Activity history visible in all modals
- Changes tracked with timestamps

---

## Files Reference

### Phase 1 Files
| File | Action |
|------|--------|
| `apps/web/components/modals/ListDetailModal.tsx` | Fix null reference |

### Phase 2 Files
| File | Action |
|------|--------|
| `apps/web/hooks/useLists.ts` | Add filtered hooks |
| `apps/web/components/modals/PersonDetailModal.tsx` | Implement linked tab |
| `apps/web/components/modals/OccasionDetailModal.tsx` | Implement linked tab |
| `apps/web/components/modals/GiftDetailModal.tsx` | Implement linked tab |

### Phase 3 Files
| File | Action |
|------|--------|
| `apps/web/components/ui/collapsible.tsx` | Create new component |
| `apps/web/components/ui/filter-bar.tsx` | Add collapsible logic |
| `apps/web/components/gifts/GiftFilters.tsx` | Update to use collapsible |

### Phase 4 Files
| File | Action |
|------|--------|
| `services/api/app/models/activity_log.py` | New model |
| `services/api/app/schemas/activity_log.py` | New schema |
| `services/api/app/repositories/activity_log.py` | New repository |
| `services/api/app/services/activity_log.py` | New service |
| `services/api/app/api/activities.py` | New endpoint |
| `apps/web/hooks/useActivityLog.ts` | New hook |
| `apps/web/components/modals/*DetailModal.tsx` | Update History tabs |

---

## Version History

- **2025-12-02**: Initial plan created after failed remediation analysis
