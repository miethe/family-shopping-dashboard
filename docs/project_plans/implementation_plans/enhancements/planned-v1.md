---
title: "Implementation Plan: Planned V1 Enhancements"
description: "Gift-Person relationships, budgets, bulk actions, and UI improvements"
audience: [ai-agents, developers]
tags: [implementation, gifts, persons, occasions, budgets, bulk-actions]
created: 2025-12-06
updated: 2025-12-06
category: "product-planning"
status: draft
related:
  - /docs/project_plans/requests/planned-v1.md
---

# Implementation Plan: Planned V1 Enhancements

**Plan ID**: `IMPL-2025-12-06-PLANNED-V1`
**Date**: 2025-12-06
**Author**: Claude (Opus 4.5)
**Related Documents**:
- **Request**: `/docs/project_plans/requests/planned-v1.md`

**Complexity**: Medium
**Total Estimated Effort**: ~45 story points
**Phases**: 4

## Executive Summary

This plan implements 10 enhancements focused on:
1. **Gift-Purchaser relationships** - New `purchaser_id` field on gifts, inline assignment UI
2. **Person budgets** - Per-occasion budget tracking for gifts assigned/purchased
3. **Bulk gift actions** - Multi-select with bulk assign/purchase/delete
4. **UI quick actions** - Status dropdowns, URL buttons, linked entity displays

The implementation follows the layered architecture: Database → Repository → Service → API → UI.

## Requirements Summary

| # | Requirement | Phase |
|---|-------------|-------|
| 1 | Gift purchaser assignment (on status change) | 1, 3 |
| 2 | Person budgets per occasion (assigned/purchased) | 1, 2, 4 |
| 3 | Bulk actions on /gifts page | 3 |
| 4 | Gift creation with recipient/purchaser inline | 3 |
| 5 | Person modal linked gifts section | 4 |
| 6 | Gift card quick-assign recipient button | 3 |
| 7 | Gift card quick-status dropdown | 3 |
| 8 | Gift card URL button | 3 |
| 9 | Gift modal status dropdown | 3 |
| 10 | Occasion-Person recipients (already exists, enhance UI) | 4 |

---

## Phase 1: Database & Schema Layer

**Duration**: 1-2 days
**Dependencies**: None
**Assigned Subagent(s)**: data-layer-expert, python-backend-engineer

### Overview

Add `purchaser_id` to gifts and create budget calculation views/queries.

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Est | Subagent |
|---------|-----------|-------------|---------------------|-----|----------|
| DB-001 | Add purchaser_id to Gift | Add nullable FK `purchaser_id` to gifts table | Migration runs, FK constraint works | 2 pts | data-layer-expert |
| DB-002 | Update GiftPerson junction | Add `role` column (recipient/purchaser) to gift_people | Enum constraint, migration runs | 2 pts | data-layer-expert |
| DB-003 | Budget calculation query | Create query for person gift totals by occasion | Returns assigned_total, purchased_total | 3 pts | python-backend-engineer |

### Schema Changes

```python
# Gift model addition
purchaser_id: Mapped[int | None] = mapped_column(ForeignKey("persons.id"), nullable=True)
purchaser: Mapped["Person"] = relationship("Person", foreign_keys=[purchaser_id])

# GiftPerson update (or keep separate - simpler)
# Alternative: Keep purchaser_id on Gift directly (simpler for single purchaser)
```

**Decision**: Use `purchaser_id` directly on Gift (simpler, single purchaser per gift).

### Quality Gates
- [ ] Migrations run without errors
- [ ] Existing data unaffected (nullable field)
- [ ] Foreign key constraints work

---

## Phase 2: Repository & Service Layer

**Duration**: 2 days
**Dependencies**: Phase 1 complete
**Assigned Subagent(s)**: python-backend-engineer, backend-architect

### Overview

Extend repositories for purchaser queries and add budget calculation service.

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Est | Subagent |
|---------|-----------|-------------|---------------------|-----|----------|
| REPO-001 | Gift purchaser queries | Add methods for purchaser assignment/filtering | Filter by purchaser_id works | 2 pts | python-backend-engineer |
| REPO-002 | Person budget queries | Query gifts by person with totals | Returns assigned/purchased totals | 3 pts | python-backend-engineer |
| SVC-001 | Gift purchaser service | Business logic for purchaser assignment | Validates person exists, updates gift | 2 pts | python-backend-engineer |
| SVC-002 | Budget calculation service | Calculate budgets per person/occasion | Returns PersonBudget DTO | 3 pts | backend-architect |
| API-001 | Bulk gift update endpoint | PATCH /gifts/bulk with action type | Bulk assign/purchase/delete works | 3 pts | python-backend-engineer |
| API-002 | Person budget endpoint | GET /persons/{id}/budgets | Returns budget breakdown | 2 pts | python-backend-engineer |

### DTOs

```python
class PersonBudget(BaseModel):
    person_id: int
    occasion_id: int | None
    gifts_assigned_count: int
    gifts_assigned_total: Decimal
    gifts_purchased_count: int
    gifts_purchased_total: Decimal
    budget_target: Decimal | None

class BulkGiftAction(BaseModel):
    gift_ids: list[int]
    action: Literal["assign_recipient", "assign_purchaser", "mark_purchased", "delete"]
    person_id: int | None = None  # For assign actions
```

### Quality Gates
- [ ] Repository tests pass
- [ ] Service layer returns DTOs only
- [ ] Bulk endpoint handles partial failures gracefully

---

## Phase 3: Frontend - Gift Enhancements

**Duration**: 3-4 days
**Dependencies**: Phase 2 complete
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer

### Overview

Implement all gift-related UI enhancements: purchaser assignment, bulk actions, quick actions.

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Est | Subagent |
|---------|-----------|-------------|---------------------|-----|----------|
| UI-001 | Purchaser dropdown component | Reusable person selector with "Add New" | Dropdown works, new person inline | 3 pts | ui-engineer-enhanced |
| UI-002 | Gift status change + purchaser | On Select/Purchased, show purchaser field | Purchaser saved on status change | 2 pts | frontend-developer |
| UI-003 | GiftCard quick actions | URL button, status dropdown, assign button | All 3 buttons work on card | 3 pts | ui-engineer-enhanced |
| UI-004 | Gift modal status dropdown | Replace "Mark as Purchased" with dropdown | All statuses selectable | 1 pt | frontend-developer |
| UI-005 | Bulk selection mode | Checkbox column, selection state | Multi-select works | 2 pts | frontend-developer |
| UI-006 | Bulk action bar | Floating bar with actions | Actions execute correctly | 3 pts | ui-engineer-enhanced |
| UI-007 | Gift form recipient/purchaser | Multi-select with "Separate/Shared" dialog | Dialog for multiple recipients | 3 pts | frontend-developer |

### Component Specifications

**PersonDropdown** (UI-001):
- Props: `value`, `onChange`, `allowNew`, `label`
- Features: Search, "Add New Person" option, inline person creation modal
- Used by: GiftCard, GiftForm, BulkActionBar

**GiftCard Quick Actions** (UI-003):
- Top-right: URL button (external link icon, opens in new tab)
- Bottom-right: Status dropdown (mini), Assign recipient button
- Mobile: Actions in overflow menu

**BulkActionBar** (UI-006):
- Fixed bottom bar when selection > 0
- Shows: "{n} selected" + Clear button
- Actions: "Mark Purchased", "Assign Recipient", "Assign Purchaser", "Delete"
- Confirm dialog for destructive actions

### Quality Gates
- [ ] Components render in all states
- [ ] Touch targets 44x44px minimum
- [ ] Keyboard navigation works
- [ ] Mobile responsive

---

## Phase 4: Frontend - Person & Occasion Enhancements

**Duration**: 2-3 days
**Dependencies**: Phase 3 complete
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer

### Overview

Enhance Person and Occasion views with linked entities and budget displays.

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Est | Subagent |
|---------|-----------|-------------|---------------------|-----|----------|
| UI-008 | Person budget display | Budget bars on PersonCard and modal | Shows assigned/purchased progress | 3 pts | ui-engineer-enhanced |
| UI-009 | Person linked gifts tab | Gifts section in Person modal | Shows recipient/purchaser gifts | 3 pts | frontend-developer |
| UI-010 | Person card gift counts | Recipient/purchaser counts with tooltips | Hover shows mini cards | 2 pts | ui-engineer-enhanced |
| UI-011 | Occasion recipients section | Recipients display on /occasions/{id} | Mini person cards, clickable | 2 pts | frontend-developer |
| UI-012 | Occasion modal recipient count | Count + tooltip on Overview tab | Hover shows mini cards | 1 pt | ui-engineer-enhanced |

### Component Specifications

**PersonBudgetBar** (UI-008):
- Two progress bars: "Gifts to Give" and "Gifts Purchased"
- Only show if person has relevant gifts
- Target budget settable (future: per-occasion)

**LinkedGiftsSection** (UI-009):
- Tab in Person modal: "Linked Entities"
- Groups: "As Recipient ({n})", "As Purchaser ({n})"
- Each gift: mini card, clickable to open GiftModal
- "Add Gift" button → opens GiftForm with person pre-selected

**MiniCardTooltip** (UI-010, UI-012):
- Reusable tooltip showing list of mini entity cards
- Max 5 visible, "+N more" for overflow
- Each card clickable

### Quality Gates
- [ ] Budget bars accurate
- [ ] Tooltips accessible (keyboard, screen reader)
- [ ] Modal navigation works
- [ ] Mobile responsive

---

## Risk Mitigation

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Complex bulk operations | Medium | Medium | Optimistic UI with rollback |
| Budget calculation performance | Low | Low | Cache at service layer |
| UI complexity on mobile | Medium | Medium | Progressive disclosure, overflow menus |

---

## Success Metrics

- All 10 requirements implemented
- No regressions in existing functionality
- Budget calculations accurate
- Bulk operations handle 50+ items
- Mobile touch targets 44x44px

---

## Quick Reference

### Phase 1 Execution
```bash
Task("data-layer-expert", "Add purchaser_id FK to gifts table with Alembic migration")
Task("python-backend-engineer", "Add budget calculation query to PersonRepository")
```

### Phase 2 Execution
```bash
Task("python-backend-engineer", "Implement bulk gift update endpoint PATCH /gifts/bulk")
Task("python-backend-engineer", "Add GET /persons/{id}/budgets endpoint")
```

### Phase 3 Execution
```bash
Task("ui-engineer-enhanced", "Create PersonDropdown component with inline add")
Task("frontend-developer", "Add bulk selection mode to /gifts page")
Task("ui-engineer-enhanced", "Create BulkActionBar component")
```

### Phase 4 Execution
```bash
Task("ui-engineer-enhanced", "Create PersonBudgetBar component")
Task("frontend-developer", "Add linked gifts section to Person modal")
```

---

**Progress Tracking**: `.claude/progress/planned-v1/`

---

**Implementation Plan Version**: 1.0
**Last Updated**: 2025-12-06
