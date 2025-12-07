---
title: "Implementation Plan: Gift Linking & Budget Display Fixes"
description: "Fix gift-person linking in Linked Entities, MSRP price update error, and budget progress bar display logic"
audience: [ai-agents, developers]
tags: [bug-fix, gifts, persons, budget, progress-bars]
created: 2025-12-07
updated: 2025-12-07
category: "product-planning"
status: draft
related:
  - /docs/project_plans/requests/gift-linking-v1.md
---

# Implementation Plan: Gift Linking & Budget Display Fixes

**Plan ID**: `IMPL-2025-12-07-GIFT-LINKING-V1`
**Date**: 2025-12-07
**Author**: Claude (Opus 4.5)
**Related Documents**:
- **Request**: `/docs/project_plans/requests/gift-linking-v1.md`

**Complexity**: Medium
**Total Estimated Effort**: 21 story points
**Issues Addressed**: 4

## Executive Summary

This plan addresses four related issues in the gift-person relationship system:
1. Gifts assigned to people via GiftPerson table not showing in Linked Entities
2. MSRP/Price update failing with SQLAlchemy greenlet error
3. Budget progress bars displaying even when no budget is set
4. Missing headers for budget columns (Purchased/Planned/Total Budget)

The implementation follows a layered approach: fix backend async issues first, then update query logic, and finally enhance frontend display.

## Issues Overview

| # | Issue | Root Cause | Impact |
|---|-------|-----------|--------|
| 1 | Gifts not in Linked Entities | Query uses list ownership, not GiftPerson table | UX confusion |
| 2 | Price update greenlet error | `session.refresh()` triggers lazy loading in async context | Data corruption risk |
| 3 | Progress bars always display | No conditional check for budget existence | Misleading UI |
| 4 | Missing budget headers | Not implemented | Reduced clarity |

## Implementation Strategy

### Architecture Sequence

1. **Phase 1: Backend Async Fix** - Fix greenlet error in gift repository
2. **Phase 2: Query Enhancement** - Update gifts query to include GiftPerson links
3. **Phase 3: Frontend Enhancement** - Update budget display logic and add headers

### Parallel Work Opportunities

- Phase 1 and Phase 3 design work can proceed in parallel
- Testing can begin immediately after each phase completes

### Critical Path

Phase 1 (greenlet fix) → Phase 2 (query fix) → Phase 3 (UI updates)

---

## Phase 1: Backend Async Fix

**Duration**: 1 day
**Dependencies**: None
**Assigned Subagent(s)**: python-backend-engineer

### Problem Analysis

The greenlet error occurs because `session.refresh()` without selectinload options triggers lazy loading of relationships (`people`, `stores`, `tags`) in an async context. This violates SQLAlchemy's async contract.

**Affected Files**:
- `services/api/app/repositories/base.py:165-198` - `update()` method
- `services/api/app/repositories/gift.py:508-527` - `set_stores()` method
- `services/api/app/repositories/gift.py:775-819` - `update_purchaser()` method

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) |
|---------|-----------|-------------|-------------------|----------|-------------|
| BE-001 | Fix base repository update | Remove or replace `session.refresh()` in `update()` method with explicit selectinload | Gift price updates succeed without greenlet error | 2 pts | python-backend-engineer |
| BE-002 | Fix gift set_stores | Replace `session.refresh(gift)` with proper async pattern | Store assignment works without error | 1 pt | python-backend-engineer |
| BE-003 | Fix gift update_purchaser | Replace `session.refresh(gift, ["people", "stores"])` with selectinload query | Purchaser updates work correctly | 1 pt | python-backend-engineer |
| BE-004 | Add integration test | Create test for gift price update flow | Test passes, covers async flow | 1 pt | python-backend-engineer |

**Phase 1 Quality Gates:**
- [ ] Gift price/MSRP updates succeed without greenlet error
- [ ] All existing gift tests pass
- [ ] No regression in gift CRUD operations

### Implementation Notes

**Pattern to Fix** (current problematic code):
```python
await self.session.commit()
await self.session.refresh(db_obj)  # TRIGGERS LAZY LOADING
```

**Fix Option 1** - Remove refresh, return stale object:
```python
await self.session.commit()
# Don't refresh - caller should re-fetch if needed
return db_obj
```

**Fix Option 2** - Use selectinload in refresh:
```python
await self.session.commit()
# Re-fetch with explicit eager loading
stmt = select(Gift).where(Gift.id == gift_id).options(
    selectinload(Gift.people),
    selectinload(Gift.stores)
)
result = await self.session.execute(stmt)
return result.scalar_one_or_none()
```

---

## Phase 2: Query Enhancement - Gift-Person Linking

**Duration**: 1 day
**Dependencies**: Phase 1 complete
**Assigned Subagent(s)**: python-backend-engineer

### Problem Analysis

Currently, `LinkedGiftsSection` uses `useGiftsByPerson()` which queries gifts via list ownership:
```sql
Gift JOIN ListItem JOIN List WHERE List.person_id = X
```

This misses gifts linked directly via the `GiftPerson` table (where role=RECIPIENT).

**Affected Files**:
- `services/api/app/repositories/gift.py` - `get_filtered()` method
- `apps/web/components/people/LinkedGiftsSection.tsx`

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) |
|---------|-----------|-------------|-------------------|----------|-------------|
| LINK-001 | Update gift query | Modify `get_filtered()` to include gifts linked via GiftPerson table when `person_ids` filter is provided | Gifts show for both list ownership AND direct GiftPerson links | 3 pts | python-backend-engineer |
| LINK-002 | Add role information | Include relationship role (RECIPIENT/PURCHASER) in gift response | Frontend can distinguish relationship type | 2 pts | python-backend-engineer |
| LINK-003 | Update API tests | Add tests for new query behavior | Tests verify both linking mechanisms | 1 pt | python-backend-engineer |

**Phase 2 Quality Gates:**
- [ ] Gifts assigned via GiftPerson appear in person's Linked Entities
- [ ] No duplicate gifts in results
- [ ] Query performance acceptable (<100ms)

### Implementation Notes

**Query Enhancement Pattern**:
```python
# Current: Only list-based linking
stmt = select(Gift).join(ListItem).join(List).where(List.person_id == person_id)

# Enhanced: List-based OR GiftPerson-based
list_gifts = select(Gift.id).join(ListItem).join(List).where(List.person_id == person_id)
direct_gifts = select(Gift.id).join(GiftPerson).where(
    GiftPerson.person_id == person_id,
    GiftPerson.role == PersonRole.RECIPIENT
)
all_gift_ids = list_gifts.union(direct_gifts)
stmt = select(Gift).where(Gift.id.in_(all_gift_ids))
```

---

## Phase 3: Frontend Enhancement - Budget Display

**Duration**: 2 days
**Dependencies**: Phase 2 complete (UI work can start in parallel with design)
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer

### Problem Analysis

**Issue 3**: Budget progress bars always display in modal variant, even when:
- Person has no budget set (`recipientBudgetTotal` / `purchaserBudgetTotal` are null)
- Person has no gifts in that category

**Issue 4**: No column headers showing "Purchased / Planned / Total Budget"

**Affected Files**:
- `apps/web/components/people/PersonBudgetBar.tsx`
- `apps/web/components/ui/stacked-progress-bar.tsx`
- `apps/web/types/person.ts` (may need budget fields)

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) |
|---------|-----------|-------------|-------------------|----------|-------------|
| UI-001 | Add budget fields to Person type | Add `recipient_budget_total` and `purchaser_budget_total` to Person schema/type | Frontend has access to budget settings | 1 pt | python-backend-engineer |
| UI-002 | Update PersonBudgetBar conditionals | Add logic to show/hide progress bars based on budget existence and gift data | Progress bars only show when relevant | 2 pts | ui-engineer-enhanced |
| UI-003 | Add budget headers | Add "Purchased / Planned / Total Budget" headers above progress bars | Headers display when progress bar is shown | 2 pts | ui-engineer-enhanced |
| UI-004 | Handle totals-only case | Show just totals (no progress bar) when no budget but gifts exist | Totals display correctly without misleading progress | 2 pts | frontend-developer |
| UI-005 | Update StackedProgressBar | Support optional budget (totals-only mode) | Component renders correctly in all states | 2 pts | ui-engineer-enhanced |
| UI-006 | Add component tests | Test all display conditions | Tests cover all budget/gift combinations | 1 pt | frontend-developer |

**Phase 3 Quality Gates:**
- [ ] Progress bars only show when budget is set AND gifts exist
- [ ] Totals display when no budget but gifts exist
- [ ] Nothing renders when no budget AND no gifts
- [ ] Headers align with columns
- [ ] All states tested

### Display Logic Matrix

| Budget Set? | Gifts Exist? | What to Display |
|-------------|-------------|-----------------|
| No | No | Nothing (hide entire section) |
| No | Yes | Totals only (no progress bar) |
| Yes | No | Empty progress bar with budget |
| Yes | Yes | Full progress bar with all values |

### Implementation Notes

**PersonBudgetBar Conditional Logic**:
```typescript
// Determine what to show for each category
const showRecipientProgress = person.recipient_budget_total != null && budget.gifts_assigned_count > 0;
const showRecipientTotals = person.recipient_budget_total == null && budget.gifts_assigned_count > 0;
const hideRecipient = budget.gifts_assigned_count === 0;

// Similar for purchaser...
```

**Header Layout**:
```
           Purchased    Planned    Budget
Receive:   [$100]      [$250]     [$500]
           [====|======|          ]  <- progress bar

Buy:       [$50]       [$150]     [$300]
           [==|====|              ]  <- progress bar
```

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|-------------------|
| Greenlet fix introduces new bugs | High | Medium | Comprehensive testing, rollback plan |
| Query performance degradation | Medium | Low | Add indexes, test with realistic data |
| UI state combinations missed | Medium | Medium | Create exhaustive test matrix |

### Schedule Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|-------------------|
| Backend fix more complex than estimated | Medium | Medium | Time-box to 1 day, escalate if blocked |

---

## Success Metrics

### Delivery Metrics
- All 4 issues resolved
- No regression in existing functionality
- Tests passing

### Functional Metrics
- Gifts appear in Linked Entities when assigned via GiftPerson
- Price updates succeed without errors
- Budget display matches specification

---

## Quick Reference - Subagent Commands

```bash
# Phase 1: Backend Async Fix
Task("python-backend-engineer", "Fix greenlet error in gift repository. Files: services/api/app/repositories/base.py (update method), services/api/app/repositories/gift.py (set_stores, update_purchaser). Remove or replace session.refresh() calls that trigger lazy loading.")

# Phase 2: Query Enhancement
Task("python-backend-engineer", "Update gift query in services/api/app/repositories/gift.py get_filtered() to include gifts linked via GiftPerson table when person_ids filter is used. Use UNION of list-based and GiftPerson-based queries.")

# Phase 3: Frontend Enhancement
Task("ui-engineer-enhanced", "Update PersonBudgetBar.tsx to conditionally show progress bars based on budget existence. Add headers for Purchased/Planned/Budget columns. Handle totals-only case when no budget but gifts exist.")
```

---

**Progress Tracking:**

See `.claude/progress/gift-linking-v1/all-phases-progress.md`

---

**Implementation Plan Version**: 1.0
**Last Updated**: 2025-12-07
