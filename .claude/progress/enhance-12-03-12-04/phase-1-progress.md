---
# === PROGRESS TRACKING: Enhancements 12-03 & 12-04 ===
# Phase-level task tracking optimized for AI agent orchestration

# Metadata
type: progress
prd: "enhance-12-03-12-04"
phase: 1
title: "Occasion, Gift, and People Enhancements"
status: "in_progress"
started: "2025-12-04"
completed: null

# Overall Progress
overall_progress: 24
completion_estimate: "on-track"

# Task Counts
total_tasks: 42
completed_tasks: 10
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["lead-architect"]
contributors: ["python-backend-engineer", "ui-engineer-enhanced", "data-layer-expert"]

# === TASK INVENTORY ===
tasks:
  # === Feature 1: Occasion correctness & automation ===
  # Backend Tasks
  - id: "TASK-1.1"
    description: "Create migration for OccasionType enum change (birthday->recurring) and add recurrence fields"
    status: "complete"
    assigned_to: ["data-layer-expert"]
    dependencies: []
    estimated_effort: "2h"
    priority: "high"
    domain: "backend"

  - id: "TASK-1.2"
    description: "Create person_occasions join table migration for person-occasion linking"
    status: "complete"
    assigned_to: ["data-layer-expert"]
    dependencies: []
    estimated_effort: "1h"
    priority: "high"
    domain: "backend"

  - id: "TASK-1.3"
    description: "Add anniversary field to Person model migration"
    status: "complete"
    assigned_to: ["data-layer-expert"]
    dependencies: []
    estimated_effort: "30m"
    priority: "high"
    domain: "backend"

  - id: "TASK-1.4"
    description: "Update Occasion model with recurrence_rule, is_active, next_occurrence fields"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.1"]
    estimated_effort: "2h"
    priority: "high"
    domain: "backend"

  - id: "TASK-1.5"
    description: "Update Person model with anniversary field and person_occasions relationship"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.2", "TASK-1.3"]
    estimated_effort: "1h"
    priority: "high"
    domain: "backend"

  - id: "TASK-1.6"
    description: "Update occasion schemas with recurrence fields and person linkage"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.4"]
    estimated_effort: "1h"
    priority: "high"
    domain: "backend"

  - id: "TASK-1.7"
    description: "Update person schemas with anniversary and occasion links"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.5"]
    estimated_effort: "30m"
    priority: "medium"
    domain: "backend"

  - id: "TASK-1.8"
    description: "Implement occasion recurrence service logic (roll forward dates yearly)"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.6"]
    estimated_effort: "3h"
    priority: "high"
    domain: "backend"

  - id: "TASK-1.9"
    description: "Create standard holiday templates and seeding logic with duplicate guards"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.8"]
    estimated_effort: "2h"
    priority: "medium"
    domain: "backend"

  - id: "TASK-1.10"
    description: "Add person create/update/delete hooks for auto-generating birthday/anniversary occasions"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.8", "TASK-1.7"]
    estimated_effort: "2h"
    priority: "high"
    domain: "backend"

  - id: "TASK-1.11"
    description: "Expand occasion APIs with recurrence fields, person linkage, and 90-day filtering"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.10"]
    estimated_effort: "2h"
    priority: "high"
    domain: "backend"

  # Frontend Tasks
  - id: "TASK-1.12"
    description: "Update occasion TypeScript types/enums for Holiday/Recurring/Other"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-1.11"]
    estimated_effort: "1h"
    priority: "high"
    domain: "frontend"

  - id: "TASK-1.13"
    description: "Update occasion forms (add/edit modal) with recurrence fields"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-1.12"]
    estimated_effort: "3h"
    priority: "high"
    domain: "frontend"

  - id: "TASK-1.14"
    description: "Fix date formatting helpers for local-safe parsing (avoid off-by-one)"
    status: "complete"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1h"
    priority: "high"
    domain: "frontend"

  - id: "TASK-1.15"
    description: "Surface person linkage and recurrence in OccasionDetailModal"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-1.13"]
    estimated_effort: "2h"
    priority: "medium"
    domain: "frontend"

  - id: "TASK-1.16"
    description: "Add next_occurrence display and recurrence badge to occasion list views"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-1.15"]
    estimated_effort: "1.5h"
    priority: "medium"
    domain: "frontend"

  # === Feature 2: Dashboard occasion visibility ===
  # Backend Tasks
  - id: "TASK-2.1"
    description: "Update dashboard service to source primary occasion from within-90-days with fallback"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.11"]
    estimated_effort: "1.5h"
    priority: "high"
    domain: "backend"

  - id: "TASK-2.2"
    description: "Add occasion list endpoint filter for within_days=90 parameter"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.11"]
    estimated_effort: "1h"
    priority: "medium"
    domain: "backend"

  # Frontend Tasks
  - id: "TASK-2.3"
    description: "Make primary occasion region/button open OccasionDetailModal directly"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.1"]
    estimated_effort: "1h"
    priority: "high"
    domain: "frontend"

  - id: "TASK-2.4"
    description: "Rename dashboard CTA to 'View All Occasions' and route to occasions list"
    status: "complete"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "30m"
    priority: "medium"
    domain: "frontend"

  - id: "TASK-2.5"
    description: "Limit dashboard occasion carousels to 3-month data with empty state"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.2"]
    estimated_effort: "1.5h"
    priority: "medium"
    domain: "frontend"

  # === Feature 3: Gift detail completeness & new fields ===
  # Backend Tasks
  - id: "TASK-3.1"
    description: "Create Store model and gift_stores join table migration"
    status: "complete"
    assigned_to: ["data-layer-expert"]
    dependencies: []
    estimated_effort: "1.5h"
    priority: "high"
    domain: "backend"

  - id: "TASK-3.2"
    description: "Create migration for Gift model expansion (description, notes, priority, quantity, sale_price, purchase_date, additional_urls)"
    status: "complete"
    assigned_to: ["data-layer-expert"]
    dependencies: []
    estimated_effort: "2h"
    priority: "high"
    domain: "backend"

  - id: "TASK-3.3"
    description: "Implement Store model and gift_stores relationship in SQLAlchemy"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-3.1"]
    estimated_effort: "1.5h"
    priority: "high"
    domain: "backend"

  - id: "TASK-3.4"
    description: "Update Gift model with new fields and store relationship"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-3.2", "TASK-3.3"]
    estimated_effort: "2h"
    priority: "high"
    domain: "backend"

  - id: "TASK-3.5"
    description: "Create stores API with inline creation and validation"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-3.3"]
    estimated_effort: "1.5h"
    priority: "medium"
    domain: "backend"

  - id: "TASK-3.6"
    description: "Update gift schemas and serializers with all new fields"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-3.4"]
    estimated_effort: "1.5h"
    priority: "high"
    domain: "backend"

  # Frontend Tasks
  - id: "TASK-3.7"
    description: "Update gift TypeScript types with new fields (priority, quantity, sale_price, etc.)"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.6"]
    estimated_effort: "1h"
    priority: "high"
    domain: "frontend"

  - id: "TASK-3.8"
    description: "Create stores API hook and multi-select component with inline add"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.5", "TASK-3.7"]
    estimated_effort: "2.5h"
    priority: "high"
    domain: "frontend"

  - id: "TASK-3.9"
    description: "Update GiftForm with priority selector, quantity input, price fields, date picker, notes/description"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.7"]
    estimated_effort: "3h"
    priority: "high"
    domain: "frontend"

  - id: "TASK-3.10"
    description: "Add URL '+' adder component for multiple URLs in gift forms"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.7"]
    estimated_effort: "1.5h"
    priority: "medium"
    domain: "frontend"

  - id: "TASK-3.11"
    description: "Update GiftDetailModal Overview tab with all new non-linked fields"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.8", "TASK-3.9", "TASK-3.10"]
    estimated_effort: "2h"
    priority: "high"
    domain: "frontend"

  # === Feature 4: Gift <-> People linking ===
  # Backend Tasks
  - id: "TASK-4.1"
    description: "Create gift_people join table migration"
    status: "complete"
    assigned_to: ["data-layer-expert"]
    dependencies: []
    estimated_effort: "1h"
    priority: "high"
    domain: "backend"

  - id: "TASK-4.2"
    description: "Implement gift_people relationship in Gift and Person models"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-4.1"]
    estimated_effort: "1.5h"
    priority: "high"
    domain: "backend"

  - id: "TASK-4.3"
    description: "Add API endpoints for attach/detach people to gifts (batch-friendly)"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-4.2"]
    estimated_effort: "2h"
    priority: "high"
    domain: "backend"

  - id: "TASK-4.4"
    description: "Add gift filtering by linked people and cascade cleanup on delete"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-4.3"]
    estimated_effort: "1.5h"
    priority: "medium"
    domain: "backend"

  # Frontend Tasks
  - id: "TASK-4.5"
    description: "Add people multi-select to gift create/edit flows with inline person add"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-4.3"]
    estimated_effort: "2.5h"
    priority: "high"
    domain: "frontend"

  - id: "TASK-4.6"
    description: "Update GiftDetailModal Linked Entities tab with people list and add/remove"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-4.5"]
    estimated_effort: "2h"
    priority: "high"
    domain: "frontend"

  - id: "TASK-4.7"
    description: "Update gift hooks/caches to reflect people links for filtering"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-4.6"]
    estimated_effort: "1h"
    priority: "medium"
    domain: "frontend"

  # === Feature 5: People layout polish & group taxonomy ===
  # Backend Tasks
  - id: "TASK-5.1"
    description: "Create Group model and person_groups join table migration"
    status: "complete"
    assigned_to: ["data-layer-expert"]
    dependencies: []
    estimated_effort: "1.5h"
    priority: "medium"
    domain: "backend"

  - id: "TASK-5.2"
    description: "Implement Group model with CRUD endpoints and member counts"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-5.1"]
    estimated_effort: "2h"
    priority: "medium"
    domain: "backend"

  - id: "TASK-5.3"
    description: "Extend person schemas to accept group_ids and add group filtering"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-5.2"]
    estimated_effort: "1.5h"
    priority: "medium"
    domain: "backend"

  # Frontend Tasks
  - id: "TASK-5.4"
    description: "Normalize PersonCard dimensions (fixed min/max height, padding, truncation)"
    status: "complete"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "1.5h"
    priority: "medium"
    domain: "frontend"

  - id: "TASK-5.5"
    description: "Add group multi-select to Add/Edit Person modal"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-5.3"]
    estimated_effort: "2h"
    priority: "medium"
    domain: "frontend"

  - id: "TASK-5.6"
    description: "Show groups in PersonDetailModal and create useGroups hook"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-5.5"]
    estimated_effort: "1.5h"
    priority: "medium"
    domain: "frontend"

  - id: "TASK-5.7"
    description: "Add group filters (chips/dropdown) to /people page with API wiring"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-5.6"]
    estimated_effort: "2h"
    priority: "medium"
    domain: "frontend"

  - id: "TASK-5.8"
    description: "Add group cards section with counts and click-to-filter behavior"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-5.7"]
    estimated_effort: "1.5h"
    priority: "low"
    domain: "frontend"

  - id: "TASK-5.9"
    description: "Add inline group creation UI from /people page and modals"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-5.8"]
    estimated_effort: "1.5h"
    priority: "low"
    domain: "frontend"

# === PARALLELIZATION STRATEGY ===
parallelization:
  # Batch 1: All migrations (can run in parallel, no dependencies)
  batch_1: ["TASK-1.1", "TASK-1.2", "TASK-1.3", "TASK-3.1", "TASK-3.2", "TASK-4.1", "TASK-5.1", "TASK-1.14", "TASK-2.4", "TASK-5.4"]

  # Batch 2: Model updates (depend on migrations)
  batch_2: ["TASK-1.4", "TASK-1.5", "TASK-3.3", "TASK-3.4", "TASK-4.2", "TASK-5.2"]

  # Batch 3: Schemas and basic service layer
  batch_3: ["TASK-1.6", "TASK-1.7", "TASK-3.5", "TASK-3.6", "TASK-4.3", "TASK-5.3"]

  # Batch 4: Advanced service logic and APIs
  batch_4: ["TASK-1.8", "TASK-1.9", "TASK-1.10", "TASK-1.11", "TASK-4.4"]

  # Batch 5: Dashboard backend + frontend type updates
  batch_5: ["TASK-2.1", "TASK-2.2", "TASK-1.12", "TASK-3.7"]

  # Batch 6: Frontend forms and modals
  batch_6: ["TASK-1.13", "TASK-2.3", "TASK-2.5", "TASK-3.8", "TASK-3.9", "TASK-3.10", "TASK-4.5", "TASK-5.5"]

  # Batch 7: Frontend detail views and linking
  batch_7: ["TASK-1.15", "TASK-1.16", "TASK-3.11", "TASK-4.6", "TASK-5.6"]

  # Batch 8: Final frontend polish
  batch_8: ["TASK-4.7", "TASK-5.7", "TASK-5.8", "TASK-5.9"]

  critical_path: ["TASK-1.1", "TASK-1.4", "TASK-1.6", "TASK-1.8", "TASK-1.11", "TASK-2.1", "TASK-1.12", "TASK-1.13", "TASK-1.15"]
  estimated_total_time: "48h"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - { id: "SC-1", description: "Occasion dates display exactly as stored across timezones", status: "pending" }
  - { id: "SC-2", description: "Recurring holidays/birthdays regenerate yearly without duplicates", status: "pending" }
  - { id: "SC-3", description: "Deleting a person removes their generated occasions", status: "pending" }
  - { id: "SC-4", description: "Dashboard shows only next-90-days occasions", status: "pending" }
  - { id: "SC-5", description: "Primary occasion opens modal; CTA reads 'View All Occasions'", status: "pending" }
  - { id: "SC-6", description: "Gift modal overview surfaces every non-linked attribute", status: "pending" }
  - { id: "SC-7", description: "New gift fields persist end-to-end; multiple URLs and stores supported", status: "pending" }
  - { id: "SC-8", description: "Gifts can link to multiple people via Linked Entities tab", status: "pending" }
  - { id: "SC-9", description: "/people cards align consistently with normalized sizing", status: "pending" }
  - { id: "SC-10", description: "Groups are creatable, visible, filterable across person forms", status: "pending" }

# Files Modified
files_modified:
  # Backend - Migrations (to create)
  - "services/api/app/alembic/versions/*_occasion_recurrence.py"
  - "services/api/app/alembic/versions/*_person_anniversary.py"
  - "services/api/app/alembic/versions/*_gift_fields_and_store_links.py"
  - "services/api/app/alembic/versions/*_gift_people_link.py"
  - "services/api/app/alembic/versions/*_groups.py"
  # Backend - Models (to create)
  - "services/api/app/models/store.py"
  - "services/api/app/models/gift_person.py"
  - "services/api/app/models/group.py"
  - "services/api/app/models/person_group.py"
  # Backend - Models (to modify)
  - "services/api/app/models/occasion.py"
  - "services/api/app/models/gift.py"
  - "services/api/app/models/person.py"
  # Backend - Schemas
  - "services/api/app/schemas/occasion.py"
  - "services/api/app/schemas/gift.py"
  - "services/api/app/schemas/person.py"
  # Backend - Services
  - "services/api/app/services/occasion.py"
  - "services/api/app/services/gift.py"
  - "services/api/app/services/person.py"
  - "services/api/app/services/dashboard.py"
  # Backend - APIs
  - "services/api/app/api/occasions.py"
  - "services/api/app/api/gifts.py"
  - "services/api/app/api/persons.py"
  # Frontend - Types
  - "apps/web/types/index.ts"
  # Frontend - Hooks
  - "apps/web/hooks/useOccasions.ts"
  - "apps/web/hooks/useGifts.ts"
  - "apps/web/hooks/usePersons.ts"
  # Frontend - Components
  - "apps/web/components/occasions/OccasionDetail.tsx"
  - "apps/web/components/dashboard/DashboardHeader.tsx"
  - "apps/web/components/dashboard/PrimaryOccasion.tsx"
  - "apps/web/components/dashboard/StatsCards.tsx"
  - "apps/web/components/gifts/GiftDetail.tsx"
  - "apps/web/components/features/GiftForm.tsx"
  - "apps/web/components/people/PersonCard.tsx"
  - "apps/web/components/people/PersonForm.tsx"
  - "apps/web/components/people/PersonDetail.tsx"
  - "apps/web/app/people/page.tsx"
---

# enhance-12-03-12-04 - Phase 1: Occasion, Gift, and People Enhancements

**Phase**: 1 of 1
**Status**: Planning (0% complete)
**Duration**: Started 2025-12-04, estimated completion 2025-12-10
**Owner**: lead-architect
**Contributors**: python-backend-engineer, ui-engineer-enhanced, data-layer-expert

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Parallel - Migrations + Independent Frontend Fixes):

| Task | Agent | Effort | Description |
|------|-------|--------|-------------|
| TASK-1.1 | data-layer-expert | 2h | OccasionType enum + recurrence fields migration |
| TASK-1.2 | data-layer-expert | 1h | person_occasions join table migration |
| TASK-1.3 | data-layer-expert | 30m | Person anniversary field migration |
| TASK-3.1 | data-layer-expert | 1.5h | Store model + gift_stores join migration |
| TASK-3.2 | data-layer-expert | 2h | Gift model expansion migration |
| TASK-4.1 | data-layer-expert | 1h | gift_people join table migration |
| TASK-5.1 | data-layer-expert | 1.5h | Group model + person_groups migration |
| TASK-1.14 | ui-engineer-enhanced | 1h | Fix date formatting helpers |
| TASK-2.4 | ui-engineer-enhanced | 30m | Rename dashboard CTA |
| TASK-5.4 | ui-engineer-enhanced | 1.5h | Normalize PersonCard dimensions |

**Batch 2** (Model Updates - Depends on Batch 1):

| Task | Agent | Effort | Dependencies |
|------|-------|--------|--------------|
| TASK-1.4 | python-backend-engineer | 2h | TASK-1.1 |
| TASK-1.5 | python-backend-engineer | 1h | TASK-1.2, TASK-1.3 |
| TASK-3.3 | python-backend-engineer | 1.5h | TASK-3.1 |
| TASK-3.4 | python-backend-engineer | 2h | TASK-3.2, TASK-3.3 |
| TASK-4.2 | python-backend-engineer | 1.5h | TASK-4.1 |
| TASK-5.2 | python-backend-engineer | 2h | TASK-5.1 |

**Batch 3** (Schemas + Basic Services):

| Task | Agent | Effort | Dependencies |
|------|-------|--------|--------------|
| TASK-1.6 | python-backend-engineer | 1h | TASK-1.4 |
| TASK-1.7 | python-backend-engineer | 30m | TASK-1.5 |
| TASK-3.5 | python-backend-engineer | 1.5h | TASK-3.3 |
| TASK-3.6 | python-backend-engineer | 1.5h | TASK-3.4 |
| TASK-4.3 | python-backend-engineer | 2h | TASK-4.2 |
| TASK-5.3 | python-backend-engineer | 1.5h | TASK-5.2 |

**Batch 4** (Advanced Service Logic):

| Task | Agent | Effort | Dependencies |
|------|-------|--------|--------------|
| TASK-1.8 | python-backend-engineer | 3h | TASK-1.6 |
| TASK-1.9 | python-backend-engineer | 2h | TASK-1.8 |
| TASK-1.10 | python-backend-engineer | 2h | TASK-1.8, TASK-1.7 |
| TASK-1.11 | python-backend-engineer | 2h | TASK-1.10 |
| TASK-4.4 | python-backend-engineer | 1.5h | TASK-4.3 |

**Batch 5** (Dashboard Backend + Frontend Types):

| Task | Agent | Effort | Dependencies |
|------|-------|--------|--------------|
| TASK-2.1 | python-backend-engineer | 1.5h | TASK-1.11 |
| TASK-2.2 | python-backend-engineer | 1h | TASK-1.11 |
| TASK-1.12 | ui-engineer-enhanced | 1h | TASK-1.11 |
| TASK-3.7 | ui-engineer-enhanced | 1h | TASK-3.6 |

**Batch 6** (Frontend Forms + Modals):

| Task | Agent | Effort | Dependencies |
|------|-------|--------|--------------|
| TASK-1.13 | ui-engineer-enhanced | 3h | TASK-1.12 |
| TASK-2.3 | ui-engineer-enhanced | 1h | TASK-2.1 |
| TASK-2.5 | ui-engineer-enhanced | 1.5h | TASK-2.2 |
| TASK-3.8 | ui-engineer-enhanced | 2.5h | TASK-3.5, TASK-3.7 |
| TASK-3.9 | ui-engineer-enhanced | 3h | TASK-3.7 |
| TASK-3.10 | ui-engineer-enhanced | 1.5h | TASK-3.7 |
| TASK-4.5 | ui-engineer-enhanced | 2.5h | TASK-4.3 |
| TASK-5.5 | ui-engineer-enhanced | 2h | TASK-5.3 |

**Batch 7** (Frontend Detail Views):

| Task | Agent | Effort | Dependencies |
|------|-------|--------|--------------|
| TASK-1.15 | ui-engineer-enhanced | 2h | TASK-1.13 |
| TASK-1.16 | ui-engineer-enhanced | 1.5h | TASK-1.15 |
| TASK-3.11 | ui-engineer-enhanced | 2h | TASK-3.8, TASK-3.9, TASK-3.10 |
| TASK-4.6 | ui-engineer-enhanced | 2h | TASK-4.5 |
| TASK-5.6 | ui-engineer-enhanced | 1.5h | TASK-5.5 |

**Batch 8** (Final Polish):

| Task | Agent | Effort | Dependencies |
|------|-------|--------|--------------|
| TASK-4.7 | ui-engineer-enhanced | 1h | TASK-4.6 |
| TASK-5.7 | ui-engineer-enhanced | 2h | TASK-5.6 |
| TASK-5.8 | ui-engineer-enhanced | 1.5h | TASK-5.7 |
| TASK-5.9 | ui-engineer-enhanced | 1.5h | TASK-5.8 |

**Critical Path**: TASK-1.1 -> TASK-1.4 -> TASK-1.6 -> TASK-1.8 -> TASK-1.11 -> TASK-2.1 -> TASK-1.12 -> TASK-1.13 -> TASK-1.15 (18h)

### Task Delegation Commands

```text
# === BATCH 1 (Launch all in parallel) ===

# Migrations (data-layer-expert)
Task("data-layer-expert", "TASK-1.1: Create migration for OccasionType enum change. Map 'birthday' to 'recurring' with subtype metadata. Add fields: recurrence_rule (JSON), is_active (bool), next_occurrence (date). File: services/api/app/alembic/versions/")

Task("data-layer-expert", "TASK-1.2: Create person_occasions join table migration. Columns: person_id (FK), occasion_id (FK), link_type (enum: birthday/anniversary/custom). File: services/api/app/alembic/versions/")

Task("data-layer-expert", "TASK-1.3: Add anniversary field (Date, nullable) to Person model migration. File: services/api/app/alembic/versions/")

Task("data-layer-expert", "TASK-3.1: Create Store model migration with: id, name (str), url (text), logo_url (text). Create gift_stores join table with gift_id, store_id. File: services/api/app/alembic/versions/")

Task("data-layer-expert", "TASK-3.2: Extend Gift model migration with: description (text), notes (text), priority (enum: low/medium/high), quantity (int default 1), sale_price (decimal), purchase_date (date), additional_urls (JSON array). File: services/api/app/alembic/versions/")

Task("data-layer-expert", "TASK-4.1: Create gift_people join table migration. Columns: gift_id (FK), person_id (FK), created_at. File: services/api/app/alembic/versions/")

Task("data-layer-expert", "TASK-5.1: Create Group model migration with: id, name (str), description (text), color (str). Create person_groups join table with person_id, group_id. File: services/api/app/alembic/versions/")

# Independent frontend fixes (ui-engineer-enhanced)
Task("ui-engineer-enhanced", "TASK-1.14: Fix date formatting helpers in apps/web to use local-safe parsing avoiding off-by-one timezone issues. Add unit tests. Check formatDate utilities in hooks and components.")

Task("ui-engineer-enhanced", "TASK-2.4: Rename dashboard CTA from current text to 'View All Occasions'. Route click to /occasions. Files: apps/web/components/dashboard/")

Task("ui-engineer-enhanced", "TASK-5.4: Normalize PersonCard dimensions: fixed min-h-[180px] max-h-[220px], consistent p-4 padding, text truncation with line-clamp-2. Ensure grid alignment on /people page. File: apps/web/components/people/PersonCard.tsx")

# === BATCH 2 (After Batch 1 migrations complete) ===

Task("python-backend-engineer", "TASK-1.4: Update Occasion model with recurrence_rule (JSON), is_active (bool default True), next_occurrence (date computed). Add helper method to calculate next_occurrence. Dependencies: TASK-1.1 complete. File: services/api/app/models/occasion.py")

Task("python-backend-engineer", "TASK-1.5: Update Person model with anniversary field and person_occasions relationship. Dependencies: TASK-1.2, TASK-1.3 complete. File: services/api/app/models/person.py")

Task("python-backend-engineer", "TASK-3.3: Implement Store model class and gift_stores relationship. Dependencies: TASK-3.1 complete. Files: services/api/app/models/store.py (new), services/api/app/models/__init__.py")

Task("python-backend-engineer", "TASK-3.4: Update Gift model with all new fields and stores relationship. Dependencies: TASK-3.2, TASK-3.3 complete. File: services/api/app/models/gift.py")

Task("python-backend-engineer", "TASK-4.2: Implement gift_people relationship in Gift and Person models. Add people list to Gift, gifts list to Person. Dependencies: TASK-4.1 complete. Files: services/api/app/models/gift.py, services/api/app/models/person.py")

Task("python-backend-engineer", "TASK-5.2: Implement Group model with CRUD service and API endpoints. Add member_count property. Dependencies: TASK-5.1 complete. Files: services/api/app/models/group.py, services/api/app/services/group.py, services/api/app/api/groups.py")

# === BATCH 3 (After Batch 2 models complete) ===

Task("python-backend-engineer", "TASK-1.6: Update occasion schemas with recurrence_rule, is_active, next_occurrence, and person_ids fields. Add OccasionWithPersons response type. Dependencies: TASK-1.4. File: services/api/app/schemas/occasion.py")

Task("python-backend-engineer", "TASK-1.7: Update person schemas with anniversary field and linked_occasions. Dependencies: TASK-1.5. File: services/api/app/schemas/person.py")

Task("python-backend-engineer", "TASK-3.5: Create stores API with CRUD endpoints and inline creation during gift save. Validate store_ids on gift create/update. Dependencies: TASK-3.3. Files: services/api/app/api/stores.py, services/api/app/services/store.py")

Task("python-backend-engineer", "TASK-3.6: Update gift schemas with all new fields. Add StoreDTO for response. Ensure extra_data backward compatibility. Dependencies: TASK-3.4. File: services/api/app/schemas/gift.py")

Task("python-backend-engineer", "TASK-4.3: Add API endpoints: POST /gifts/{id}/people (attach), DELETE /gifts/{id}/people/{person_id} (detach). Support batch attach via POST body array. Dependencies: TASK-4.2. File: services/api/app/api/gifts.py")

Task("python-backend-engineer", "TASK-5.3: Extend person schemas with group_ids. Add group filter parameter to list endpoint ?group_ids=1,2,3. Dependencies: TASK-5.2. Files: services/api/app/schemas/person.py, services/api/app/api/persons.py")

# === BATCH 4 (Advanced service logic) ===

Task("python-backend-engineer", "TASK-1.8: Implement occasion recurrence service logic. Method: roll_forward_recurring() to advance next_occurrence after date passes. Support month/day and nth-weekday patterns. Dependencies: TASK-1.6. File: services/api/app/services/occasion.py")

Task("python-backend-engineer", "TASK-1.9: Create standard holiday templates (Christmas, Hanukkah, Easter, Valentine's, Mother's Day, Father's Day). Seed on first user/dashboard creation. Add duplicate guard per year. Dependencies: TASK-1.8. File: services/api/app/services/occasion.py")

Task("python-backend-engineer", "TASK-1.10: Add hooks in person service: on create/update generate birthday/anniversary occasions and link via person_occasions. On delete, remove linked occasions. Dependencies: TASK-1.8, TASK-1.7. File: services/api/app/services/person.py")

Task("python-backend-engineer", "TASK-1.11: Expand occasion API: add recurrence fields to create/update, person linkage endpoints, filter by next_occurrence within_days param. Dependencies: TASK-1.10. File: services/api/app/api/occasions.py")

Task("python-backend-engineer", "TASK-4.4: Add gift filtering by person_ids param. Implement cascade cleanup: deleting person removes from gift_people, deleting gift removes all links. Add integrity tests. Dependencies: TASK-4.3. Files: services/api/app/services/gift.py, services/api/app/api/gifts.py")

# === BATCH 5 (Dashboard backend + frontend types) ===

Task("python-backend-engineer", "TASK-2.1: Update dashboard service to source primary_occasion from within 90 days using next_occurrence. Graceful fallback if none. Dependencies: TASK-1.11. File: services/api/app/services/dashboard.py")

Task("python-backend-engineer", "TASK-2.2: Add within_days query param to occasions list endpoint. Default null (all), pass 90 for dashboard. Dependencies: TASK-1.11. File: services/api/app/api/occasions.py")

Task("ui-engineer-enhanced", "TASK-1.12: Update occasion TypeScript types. Change OccasionType enum to 'holiday' | 'recurring' | 'other'. Add recurrence_rule, is_active, next_occurrence, person_ids fields. Dependencies: TASK-1.11 complete. File: apps/web/types/index.ts")

Task("ui-engineer-enhanced", "TASK-3.7: Update gift TypeScript types with: description, notes, priority ('low'|'medium'|'high'), quantity, sale_price, purchase_date, additional_urls (string[]), stores (Store[]), people (Person[]). Dependencies: TASK-3.6 complete. File: apps/web/types/index.ts")

# === BATCH 6 (Frontend forms + modals) ===

Task("ui-engineer-enhanced", "TASK-1.13: Update occasion forms (AddOccasionModal, edit flows) with: type selector (Holiday/Recurring/Other), recurrence rule inputs (month/day picker or weekday selector), is_active toggle. Dependencies: TASK-1.12. Files: apps/web/components/occasions/")

Task("ui-engineer-enhanced", "TASK-2.3: Make primary occasion region in DashboardHeader/PrimaryOccasion clickable to open OccasionDetailModal directly. Dependencies: TASK-2.1 complete. Files: apps/web/components/dashboard/PrimaryOccasion.tsx, DashboardHeader.tsx")

Task("ui-engineer-enhanced", "TASK-2.5: Limit dashboard occasion carousels/widgets to within_days=90 data. Show empty state 'No upcoming occasions in next 3 months' when none. Dependencies: TASK-2.2 complete. Files: apps/web/components/dashboard/StatsCards.tsx")

Task("ui-engineer-enhanced", "TASK-3.8: Create useStores hook and store multi-select component with inline add button. Integrate into GiftForm. Dependencies: TASK-3.5, TASK-3.7. Files: apps/web/hooks/useStores.ts (new), apps/web/components/gifts/StoreSelect.tsx (new)")

Task("ui-engineer-enhanced", "TASK-3.9: Update GiftForm with: priority Select (Low/Medium/High), quantity number input, sale_price input, purchase_date DatePicker, description textarea, notes textarea. Dependencies: TASK-3.7. File: apps/web/components/features/GiftForm.tsx")

Task("ui-engineer-enhanced", "TASK-3.10: Create URL list component with '+' button to add additional URLs. Display as editable list in GiftForm. Dependencies: TASK-3.7. Files: apps/web/components/gifts/UrlListInput.tsx (new), apps/web/components/features/GiftForm.tsx")

Task("ui-engineer-enhanced", "TASK-4.5: Add people multi-select to GiftForm with inline 'Add Person' button. Use existing PersonSearch pattern. Dependencies: TASK-4.3 complete. Files: apps/web/components/features/GiftForm.tsx, apps/web/components/gifts/PersonSelect.tsx (new)")

Task("ui-engineer-enhanced", "TASK-5.5: Add group multi-select to PersonForm (Add/Edit Person modal). Create useGroups hook. Dependencies: TASK-5.3 complete. Files: apps/web/components/people/PersonForm.tsx, apps/web/hooks/useGroups.ts (new)")

# === BATCH 7 (Frontend detail views) ===

Task("ui-engineer-enhanced", "TASK-1.15: Update OccasionDetail modal to show: linked persons (avatars + names), recurrence info badge, is_active status. Dependencies: TASK-1.13. File: apps/web/components/occasions/OccasionDetail.tsx")

Task("ui-engineer-enhanced", "TASK-1.16: Add to occasion list views: next_occurrence column/badge, recurrence indicator icon. Sort by next_occurrence ascending. Dependencies: TASK-1.15. File: apps/web/components/occasions/OccasionList.tsx")

Task("ui-engineer-enhanced", "TASK-3.11: Update GiftDetail modal Overview tab to render: stores list, purchase_date, price + sale_price, priority badge, quantity, description, notes, all URLs as links. Dependencies: TASK-3.8, TASK-3.9, TASK-3.10. File: apps/web/components/gifts/GiftDetail.tsx")

Task("ui-engineer-enhanced", "TASK-4.6: Update GiftDetail Linked Entities tab to include People section. Show avatar + name list. Add/remove via modal similar to lists pattern. Dependencies: TASK-4.5. File: apps/web/components/gifts/GiftDetail.tsx or new LinkedPeople component")

Task("ui-engineer-enhanced", "TASK-5.6: Show groups in PersonDetail modal as badge chips. Wire useGroups hook. Dependencies: TASK-5.5. File: apps/web/components/people/PersonDetail.tsx")

# === BATCH 8 (Final polish) ===

Task("ui-engineer-enhanced", "TASK-4.7: Update useGifts hook to include people in cache keys. Enable filter gifts by person from dashboard/person detail. Dependencies: TASK-4.6. File: apps/web/hooks/useGifts.ts")

Task("ui-engineer-enhanced", "TASK-5.7: Add group filter chips/dropdown to /people page header. Wire to API group_ids filter. Dependencies: TASK-5.6. File: apps/web/app/people/page.tsx")

Task("ui-engineer-enhanced", "TASK-5.8: Add group cards section to /people showing: group name, member count, click to filter. Dependencies: TASK-5.7. File: apps/web/app/people/page.tsx")

Task("ui-engineer-enhanced", "TASK-5.9: Add inline group creation UI: '+' button in group filter area and in PersonForm modal. Opens small dialog to create group. Dependencies: TASK-5.8. Files: apps/web/app/people/page.tsx, apps/web/components/people/PersonForm.tsx")
```

---

## Overview

This phase delivers 5 major enhancements covering occasion automation, dashboard visibility improvements, gift detail expansion, gift-people linking, and people grouping features.

**Why This Phase**: Users need recurring occasions to auto-generate (birthdays, anniversaries), richer gift data capture, and better people organization. These features were requested in enhance-12-03 and enhance-12-04 requests.

**Scope**:
- IN: Occasion recurrence system, gift field expansion, gift-people linking, people groups
- OUT: Secret Santa assignment system, budget tracking enhancements

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Occasion dates display exactly as stored across timezones | Pending |
| SC-2 | Recurring holidays/birthdays regenerate yearly without duplicates | Pending |
| SC-3 | Deleting a person removes their generated occasions | Pending |
| SC-4 | Dashboard shows only next-90-days occasions | Pending |
| SC-5 | Primary occasion opens modal; CTA reads "View All Occasions" | Pending |
| SC-6 | Gift modal overview surfaces every non-linked attribute | Pending |
| SC-7 | New gift fields persist end-to-end; multiple URLs and stores supported | Pending |
| SC-8 | Gifts can link to multiple people via Linked Entities tab | Pending |
| SC-9 | /people cards align consistently with normalized sizing | Pending |
| SC-10 | Groups are creatable, visible, filterable across person forms | Pending |

---

## Architecture Context

### Current State

**Occasion Model** (`services/api/app/models/occasion.py`):
- OccasionType enum: birthday, holiday, other
- Fields: name, type, date, description, budget_total
- No recurrence support, no person linking

**Gift Model** (`services/api/app/models/gift.py`):
- Fields: name, url, price, image_url, source, extra_data (JSON)
- Missing: description, notes, priority, quantity, sale_price, purchase_date, additional_urls
- No store linking, no person linking

**Person Model** (`services/api/app/models/person.py`):
- Fields: display_name, relationship, birthdate, notes, interests, sizes, constraints, photo_url
- Missing: anniversary field
- No group support, no occasion linking

### Reference Patterns

**Join Tables**: See `gift_tags` in gift.py for many-to-many pattern
**API Filtering**: See list endpoints in `services/api/app/api/` for query param patterns
**Frontend Forms**: See `apps/web/components/features/GiftForm.tsx` for form structure
**Modal Pattern**: See `apps/web/components/modals/EntityModal.tsx` for detail modal pattern

---

## Implementation Details

### Technical Approach

1. **Migrations First**: All schema changes via Alembic migrations before model updates
2. **Backend Before Frontend**: APIs must be complete before frontend consumes
3. **Backward Compatibility**: extra_data field remains for existing data
4. **Cascade Handling**: Proper ON DELETE behavior for all join tables

### Known Gotchas

- **Date Handling**: Store dates as DATE type, not TIMESTAMP. Parse on frontend without timezone conversion.
- **Enum Migrations**: PostgreSQL enums require explicit type changes, not simple ALTER
- **Join Table Cascades**: Must configure cascade="all, delete-orphan" on relationship side
- **Frontend Cache**: React Query cache keys must include filter params for proper invalidation

---

## Testing Strategy

| Test Type | Scope | Coverage | Status |
|-----------|-------|----------|--------|
| Unit | Recurrence logic, date helpers | 80%+ | Pending |
| Integration | All new API endpoints | Core flows | Pending |
| E2E | Gift create with people, Occasion recurrence | Happy path | Pending |

---

## Next Session Agenda

### Immediate Actions (Next Session)
1. [ ] Execute Batch 1: All migrations in parallel
2. [ ] Execute Batch 1 frontend: Date fixes, CTA rename, PersonCard normalization
3. [ ] Verify migrations apply cleanly, no conflicts

### Context for Continuing Agent

- All tasks use absolute file paths in task descriptions
- Backend tasks should follow patterns in services/api/CLAUDE.md
- Frontend tasks should follow patterns in apps/web/CLAUDE.md
- Agent orchestration: data-layer-expert for migrations, python-backend-engineer for Python code, ui-engineer-enhanced for React/TypeScript

---

## Session Notes

### 2025-12-04

**Completed**:
- Created progress tracking file with full task breakdown
- Analyzed existing models and frontend structure
- Computed parallelization batches and critical path

**In Progress**:
- None (ready for Batch 1 execution)

**Next Session**:
- Begin Batch 1 migration tasks (7 migrations in parallel)
- Begin independent frontend fixes (3 tasks in parallel)
