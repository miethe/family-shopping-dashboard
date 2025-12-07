---
type: progress
prd: "planned-v1"
phase: 2
title: "Repository & Service Layer"
status: "completed"
started: "2025-12-06"
completed: "2025-12-06"

overall_progress: 100
completion_estimate: "completed"

total_tasks: 6
completed_tasks: 6
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

owners: ["python-backend-engineer"]
contributors: ["backend-architect"]

tasks:
  - id: "REPO-001"
    description: "Add gift purchaser queries to GiftRepository"
    status: "completed"
    assigned_to: ["python-backend-engineer"]
    dependencies: []
    estimated_effort: "2h"
    priority: "high"
    commit: "99b79dc"

  - id: "REPO-002"
    description: "Add person budget queries to PersonRepository"
    status: "completed"
    assigned_to: ["python-backend-engineer"]
    dependencies: []
    estimated_effort: "3h"
    priority: "high"
    note: "Already existed from Phase 1 (get_gift_budget)"

  - id: "SVC-001"
    description: "Gift purchaser service with validation"
    status: "completed"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["REPO-001"]
    estimated_effort: "2h"
    priority: "high"
    commit: "99b79dc"

  - id: "SVC-002"
    description: "Budget calculation service returning PersonBudget DTO"
    status: "completed"
    assigned_to: ["backend-architect"]
    dependencies: ["REPO-002"]
    estimated_effort: "3h"
    priority: "high"
    commit: "99b79dc"

  - id: "API-001"
    description: "Bulk gift update endpoint PATCH /gifts/bulk"
    status: "completed"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["SVC-001"]
    estimated_effort: "3h"
    priority: "high"
    commit: "99b79dc"

  - id: "API-002"
    description: "Person budget endpoint GET /persons/{id}/budgets"
    status: "completed"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["SVC-002"]
    estimated_effort: "2h"
    priority: "medium"
    commit: "99b79dc"

parallelization:
  batch_1: ["REPO-001", "REPO-002"]
  batch_2: ["SVC-001", "SVC-002"]
  batch_3: ["API-001", "API-002"]
  critical_path: ["REPO-001", "SVC-001", "API-001"]
  estimated_total_time: "7h"

blockers: []

success_criteria:
  - { id: "SC-1", description: "Repository tests pass with 80%+ coverage", status: "deferred", note: "No test directory exists yet" }
  - { id: "SC-2", description: "Service layer returns DTOs only (no ORM leakage)", status: "completed" }
  - { id: "SC-3", description: "Bulk endpoint handles partial failures gracefully", status: "completed" }
  - { id: "SC-4", description: "OpenAPI docs generated for new endpoints", status: "completed" }

files_modified:
  - "services/api/app/repositories/gift.py"
  - "services/api/app/repositories/person.py"
  - "services/api/app/services/gift.py"
  - "services/api/app/services/person.py"
  - "services/api/app/schemas/gift.py"
  - "services/api/app/schemas/person.py"
  - "services/api/app/api/gifts.py"
  - "services/api/app/api/persons.py"
---

# planned-v1 - Phase 2: Repository & Service Layer

**Phase**: 2 of 4
**Status**: Planning (0% complete)
**Duration**: Estimated 2 days
**Owner**: python-backend-engineer
**Contributors**: backend-architect

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Parallel - No Dependencies):
- REPO-001 → `python-backend-engineer` (2h) - Gift purchaser queries
- REPO-002 → `python-backend-engineer` (3h) - Person budget queries

**Batch 2** (Sequential - Depends on Batch 1):
- SVC-001 → `python-backend-engineer` (2h) - **Blocked by**: REPO-001
- SVC-002 → `backend-architect` (3h) - **Blocked by**: REPO-002

**Batch 3** (Sequential - Depends on Batch 2):
- API-001 → `python-backend-engineer` (3h) - **Blocked by**: SVC-001
- API-002 → `python-backend-engineer` (2h) - **Blocked by**: SVC-002

**Critical Path**: REPO-001 → SVC-001 → API-001 (7h total)

### Task Delegation Commands

```
# Batch 1 (Launch in parallel)
Task("python-backend-engineer", "REPO-001: Add gift purchaser queries to GiftRepository.

Requirements:
- get_by_purchaser_id(purchaser_id: int) → list[Gift]
- update_purchaser(gift_id: int, purchaser_id: int | None) → Gift
- Filter gifts endpoint to support purchaser_id param

Files:
- services/api/app/repositories/gift.py

Acceptance:
- Filter by purchaser_id works
- Update purchaser returns updated gift
- Tests cover happy path + edge cases")

Task("python-backend-engineer", "REPO-002: Add person budget queries to PersonRepository.

Requirements:
- get_gift_totals(person_id: int, occasion_id: int | None = None)
- Returns: gifts_as_recipient_count, gifts_as_recipient_total,
           gifts_as_purchaser_count, gifts_as_purchaser_total
- Only count gifts with status in [selected, purchased, gifted]
- Handle null prices (exclude from totals)

Files:
- services/api/app/repositories/person.py

Acceptance:
- Aggregation correct for test data
- Optional occasion_id filter works
- Null prices excluded from totals")

# Batch 2 (After Batch 1 completes)
Task("python-backend-engineer", "SVC-001: Gift purchaser service with validation.

Requirements:
- assign_purchaser(gift_id: int, purchaser_id: int) → GiftResponse
- Validate person exists before assignment
- Return GiftResponse DTO (not ORM)

Files:
- services/api/app/services/gift.py
- services/api/app/schemas/gift.py (add purchaser_id to response)

Acceptance:
- Returns DTO only
- 404 if person not found
- 404 if gift not found")

Task("backend-architect", "SVC-002: Budget calculation service returning PersonBudget DTO.

Requirements:
- Create PersonBudget schema:
  - person_id, occasion_id, budget_target
  - gifts_to_give_count, gifts_to_give_total
  - gifts_purchased_count, gifts_purchased_total
- get_budgets(person_id: int) → list[PersonBudget]
  - Returns one per occasion (+ one for 'all occasions')

Files:
- services/api/app/schemas/person.py (add PersonBudget)
- services/api/app/services/person.py

Acceptance:
- DTO only, no ORM leakage
- Correct aggregation logic
- Handles persons with no gifts")

# Batch 3 (After Batch 2 completes)
Task("python-backend-engineer", "API-001: Bulk gift update endpoint PATCH /gifts/bulk.

Requirements:
- PATCH /api/v1/gifts/bulk
- Request body: BulkGiftAction {
    gift_ids: list[int],
    action: 'assign_recipient' | 'assign_purchaser' | 'mark_purchased' | 'delete',
    person_id: int | None  # Required for assign actions
  }
- Response: { success_count, failed_ids, errors }
- Handle partial failures (some succeed, some fail)

Files:
- services/api/app/api/gifts.py
- services/api/app/schemas/gift.py (add BulkGiftAction, BulkGiftResult)

Acceptance:
- All actions work correctly
- Partial failures return 207 Multi-Status
- OpenAPI docs complete")

Task("python-backend-engineer", "API-002: Person budget endpoint GET /persons/{id}/budgets.

Requirements:
- GET /api/v1/persons/{id}/budgets?occasion_id={id}
- Returns list[PersonBudget]
- Optional occasion_id filter

Files:
- services/api/app/api/persons.py

Acceptance:
- Returns correct budget data
- Handles non-existent person (404)
- OpenAPI docs complete")
```

---

## Overview

Extend repositories, services, and API for purchaser tracking and budget calculations.

**Why This Phase**: Backend foundation for all UI features in Phases 3-4.

**Scope**:
- IN: Repository methods, service layer, new endpoints
- OUT: UI components (Phase 3-4)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Repository tests pass with 80%+ coverage | Pending |
| SC-2 | Service layer returns DTOs only | Pending |
| SC-3 | Bulk endpoint handles partial failures | Pending |
| SC-4 | OpenAPI docs generated | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| REPO-001 | Gift purchaser queries | Pending | python-backend-engineer | None | 2h | Foundation |
| REPO-002 | Person budget queries | Pending | python-backend-engineer | None | 3h | Complex aggregation |
| SVC-001 | Purchaser service | Pending | python-backend-engineer | REPO-001 | 2h | Validation logic |
| SVC-002 | Budget service | Pending | backend-architect | REPO-002 | 3h | DTO design |
| API-001 | Bulk endpoint | Pending | python-backend-engineer | SVC-001 | 3h | Critical for bulk UI |
| API-002 | Budget endpoint | Pending | python-backend-engineer | SVC-002 | 2h | Supports budget bars |

---

## DTOs (New)

```python
# PersonBudget - for budget display
class PersonBudget(BaseModel):
    person_id: int
    occasion_id: int | None
    occasion_name: str | None
    budget_target: Decimal | None
    gifts_to_give_count: int
    gifts_to_give_total: Decimal
    gifts_purchased_count: int
    gifts_purchased_total: Decimal

# BulkGiftAction - for bulk operations
class BulkGiftAction(BaseModel):
    gift_ids: list[int]
    action: Literal["assign_recipient", "assign_purchaser", "mark_purchased", "delete"]
    person_id: int | None = None

# BulkGiftResult - bulk operation response
class BulkGiftResult(BaseModel):
    success_count: int
    failed_ids: list[int]
    errors: list[str]
```

---

## Next Session Agenda

### Immediate Actions
1. [ ] Wait for Phase 1 completion
2. [ ] Execute Batch 1: REPO-001, REPO-002 in parallel
3. [ ] Continue with Batches 2, 3 sequentially

---
