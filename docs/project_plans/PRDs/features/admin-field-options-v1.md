---
title: "PRD: Admin Page for Dynamic Field Options"
description: "Enable administrators to manage dropdown options for all entities (Person, Gift, Occasion, List) without code deployment, replacing hardcoded Python sets with database-driven lookups."
audience: [ai-agents, developers]
tags: [prd, planning, feature, admin, backend, frontend]
created: 2025-12-20
updated: 2025-12-20
category: "product-planning"
status: draft
related: ["docs/project_plans/north-star/family-gifting-dash.md"]
---

# Feature Brief & Metadata

**Feature Name:**

> Admin Page for Dynamic Field Options

**Filepath Name:**

> `admin-field-options-v1`

**Date:**

> 2025-12-20

**Author:**

> Claude Opus (PRD Writer Agent)

**Related Epic(s)/PRD ID(s):**

> Admin & Settings Infrastructure Epic

**Related Documents:**

> - Family Gifting Dashboard North Star: `docs/project_plans/north-star/family-gifting-dash.md`
> - API Architecture Guide: `services/api/CLAUDE.md`
> - Web Architecture Guide: `apps/web/CLAUDE.md`
> - Current hardcoded options: `services/api/app/schemas/person.py`

---

## 1. Executive Summary

This feature transforms the family gifting dashboard from hardcoded dropdown options to a database-driven, admin-manageable system. All ~25 option sets (wine types, beverages, cuisines, hobbies, etc.) and enum-based fields (gift priority, gift status, occasion type, list type) will be movable to a dynamic lookup table, enabling administrators to add, edit, reorder, and archive options without code deployment or app restarts.

**Priority:** HIGH

**Key Outcomes:**
- Admins can add/edit/remove dropdown options for 5 core entities (Person, Gift, Occasion, List) without code changes
- Options persist in database with soft-delete support to preserve historical data
- Real-time updates via React Query invalidation—no app restart required
- Complete audit trail of changes (created_at, updated_at)
- Backward-compatible migration: existing hardcoded values become system defaults (immutable)

---

## 2. Context & Background

### Current State

All dropdown/select field options are **hardcoded as Python sets in `/services/api/app/schemas/person.py`** and as Python Enums in model files:

**Person Entity** (nested in `advanced_interests`):
- Food & Drink (8 sets): `WINE_TYPES`, `BEVERAGE_PREFS`, `COFFEE_STYLES`, `TEA_STYLES`, `SPIRITS`, `DIETARY`, `CUISINES`, `SWEET_SAVORY`
- Style (3 sets): `PREFERRED_METALS`, `FRAGRANCE_NOTES`, `ACCESSORY_PREFS`
- Hobbies (5 sets): `HOBBIES`, `CREATIVE_OUTLETS`, `SPORTS_PLAYED`, `READING_GENRES`, `MUSIC_GENRES`
- Tech (3 sets): `TECH_ECOSYSTEM`, `GAMING_PLATFORMS`, `SMART_HOME`
- Experiences (3 sets): `TRAVEL_STYLES`, `EXPERIENCE_TYPES`, `EVENT_PREFERENCES`
- Gifts (2 sets): `COLLECTS`, `AVOID_CATEGORIES`, `BUDGET_COMFORT`
- Free text: `relationship` (plain string, no validation)

**Gift Entity** (`/services/api/app/schemas/gift.py`):
- `priority` - Python enum: `low`, `medium`, `high`
- `status` - Python enum: `idea`, `selected`, `purchased`, `received`

**Occasion Entity** (`/services/api/app/schemas/occasion.py`):
- `type` - Python enum: `holiday`, `recurring`, `other`
- `subtype` - Free text (should become managed dropdown)

**List Entity** (`/services/api/app/schemas/list.py`):
- `type` - Python enum: `wishlist`, `ideas`, `assigned`
- `visibility` - Python enum: `private`, `family`, `public`

### Problem Space

**For Product Owners/Admins:**
- Cannot customize options without developer involvement
- Adding "new wine type" requires code change, PR review, deployment, restart
- Removing outdated options requires code cleanup and testing
- Cannot reorder options (display order is hardcoded or defaults to set iteration order)

**For Developers:**
- Option validation scattered across multiple schemas
- Adding new entity fields with options requires boilerplate schema, enum, repository, and service changes
- No centralized source of truth for option sets
- Difficult to track which options are in use vs. obsolete

**For Users:**
- Limited customization of the domain model for family-specific contexts (e.g., family-specific hobbies)
- Cannot add "Homelab maintenance" as a hobby if not in hardcoded set

### Current Alternatives / Workarounds

1. **Code-based**: Edit Python files, commit, deploy (weeks of latency)
2. **Manual workarounds**: Use free-text fields or request features for new options
3. **None**: Users and admins have no built-in way to extend options

These workarounds are insufficient because:
- They require technical expertise (code knowledge, git, deployment)
- They break the single-tenant promise (why restart the app for one family's needs?)
- They don't scale if other families adopt the dashboard (multi-tenant future-proofing)

### Market / Competitive Notes (Optional)

**SaaS gifting/registry apps** typically offer:
- Admin dashboards for taxonomy management (categories, tags, options)
- Customizable fields per organization
- Soft-delete patterns with "archived" states
- Real-time updates (WebSocket or polling)

While this app is single-tenant for now, designing for admin extensibility makes it attractive if family use cases expand.

### Architectural Context

**Reference**: Family Gifting Dashboard CLAUDE.md (Prime Directives & Architecture)

The system follows a **4-layer architecture**:

1. **Router** (HTTP/WS) → Validates input, returns DTOs
2. **Service** (Business Logic) → Transforms ORM→DTO, never returns ORM models
3. **Repository** (Data Access) → All DB I/O, encapsulates queries
4. **Model** (SQLAlchemy ORM) → Database schema definitions

**Key Principles:**
- ✗ No DTO/ORM mixing (services return only DTOs, never ORM models)
- ✗ No DB I/O in services (repository owns all queries)
- ✓ Single-tenant (no RLS, no multi-user complexity)
- ✓ Real-time via React Query (simpler than WebSocket for infrequent updates)
- ✓ Validation via Pydantic schemas and repository checks

---

## 3. Problem Statement

**Core Gap:**

Product owners and domain administrators cannot manage dropdown options (enums, validation sets) for any entity without developer code changes and deployment. This blocks customization, slows iteration, and violates the single-tenant promise of rapid feature delivery.

**User Story Format:**

> "As an admin, when I want to add a new wine type to the Person profile (e.g., 'Sake'), I must currently contact a developer, wait for a code change, PR review, and deployment—a process that takes days. Instead, I should be able to open an admin page, select 'Person > wine_types', click 'Add', type the new option, and have it available immediately."

**Technical Root Cause:**

1. **Hardcoded Sets**: All options live in Python source code (Pydantic schemas, enums)
2. **No Lookup Table**: No `field_options` database table to query at runtime
3. **Validation Tied to Code**: Pydantic validators reference hardcoded sets; changing options requires redeployment
4. **No Admin UI**: No interface to view, create, edit, or delete options
5. **No Cache Strategy**: Unclear how to refresh options without app restart

**Files Involved:**
- `services/api/app/schemas/person.py` (25+ hardcoded sets)
- `services/api/app/schemas/gift.py`, `occasion.py`, `list.py` (enums)
- `services/api/app/models/person.py`, `gift.py`, `occasion.py`, `list.py` (SQLAlchemy models)
- `services/api/app/repositories/` (queries for each entity)
- `services/api/app/services/` (business logic, validation)
- `services/api/app/api/` (routers/endpoints)
- `apps/web/` (forms, dropdown components—no admin page yet)

---

## 4. Goals & Success Metrics

### Primary Goals

**Goal 1: Centralized Option Management**
- All dropdown options (Person.wine_types, Gift.priority, etc.) are stored in a single `field_options` database table
- Validation happens via database queries, not hardcoded sets
- Measurable: 100% of options migrated, zero hardcoded set references in validation

**Goal 2: Admin-Friendly Interface**
- Admins access an "Admin" page from the sidebar navigation
- Tab-based UI for each entity (Person, Gift, Occasion, List)
- CRUD operations: Create, Read, Update, Delete (with soft-delete for in-use options)
- Measurable: All 6 CRUD operations functional; <200ms response time per operation

**Goal 3: Real-Time Option Availability**
- New/edited/deleted options are immediately visible to all users without app restart
- React Query cache invalidation propagates changes within seconds
- Measurable: <5 second latency from admin action to UI refresh

**Goal 4: Data Safety & Integrity**
- Options in use cannot be hard-deleted; soft-delete (is_active=false) prevents accidental data loss
- Historical data remains valid even if an option is archived
- Audit trail: created_at, updated_at timestamps on all changes
- Measurable: 0 data loss incidents; all historical records queryable

**Goal 5: Access Control & Future-Proofing**
- Admin operations are designed to support role-based access control (RBAC)
- Add `is_admin` flag to User model (not enforced yet, but API ready)
- All admin endpoints check authorization (even if currently permissive)
- Measurable: API enforces admin check; frontend conditionally renders admin nav

### Success Metrics

| Metric | Baseline | Target | Measurement Method |
|--------|----------|--------|-------------------|
| Time to add new option | ~2 days (dev cycle) | <1 minute (admin UI) | From admin form submit to user-facing dropdown |
| Option availability | Requires app restart | No restart needed | Option appears in dropdown without reload |
| Admin page load time | N/A | <1 second | PageSpeed/Network tab |
| CRUD response time | N/A | <200ms (p95) | API logs, client timing |
| Data integrity (soft delete) | N/A | 100% in-use options preserved | Verify soft-deleted options don't break queries |
| Coverage | ~25 sets + 6 enums | 100% of dropdowns managed | Audit all forms for hardcoded options |

---

## 5. User Personas & Journeys

### Personas

**Primary Persona: Family Admin (Sarah)**
- Role: Power user / family organizer
- Goals: Customize gift categories, hobbies, occasions for family's context (e.g., add "Homelab" hobby, "Potluck" occasion type)
- Pain Points: Currently cannot extend options; must request developer changes
- Usage Frequency: 1-2 times per month (when adding new person or tailoring categories)

**Secondary Persona: Developer/Maintainer (Dev)**
- Role: Homelab operator, codebase maintainer
- Goals: Keep hardcoded options out of code; reduce deployment friction
- Pain Points: Currently must update multiple files (schema, enum, migration) for each new option
- Usage Frequency: Minimal once migration complete; only for initial seeding and schema updates

**Tertiary Persona: End User (Jamie)**
- Role: Family member selecting gifts, interests, occasions
- Goals: See comprehensive, family-relevant option sets; minimal form friction
- Pain Points: None directly (options work fine); benefits from admin's ability to customize
- Usage Frequency: Whenever using forms (creating gift, updating person profile, etc.)

### High-level Flow

```mermaid
graph TD
    Admin["Admin (Sarah)"] -->|Opens sidebar| Nav["Navigation Menu"]
    Nav -->|Clicks 'Admin'| AdminPage["Admin Page"]
    AdminPage -->|Selects 'Person'| PersonTab["Person Fields Tab"]
    PersonTab -->|Clicks 'wine_types'| OptionsList["wine_types Options List"]
    OptionsList -->|Clicks 'Add'| AddForm["Add Option Modal"]
    AddForm -->|Enters 'Sake', clicks Save| Service["API Service"]
    Service -->|Inserts field_options row| DB["PostgreSQL"]
    DB -->|Returns DTO| Service
    Service -->|Broadcasts cache invalidation| ReactQuery["React Query"]
    ReactQuery -->|Refetches options| UI["All Wine Type Dropdowns"]
    UI -->|Shows 'Sake' immediately| User["End Users See New Option"]

    Admin -->|Selects 'Gift'| GiftTab["Gift Fields Tab"]
    GiftTab -->|Clicks 'priority'| PriorityList["priority Enum Options"]
    PriorityList -->|Edits 'low' to 'low (not urgent)'| EditForm["Edit Option Modal"]
    EditForm -->|Saves| Service
    Service -->|Updates is_active=false, creates new| DB
```

---

## 6. Requirements

### 6.1 Functional Requirements

| ID | Requirement | Priority | Notes |
| :-: | ----------- | :------: | ----- |
| FR-1 | Admin page accessible from sidebar (icon: settings) | Must | Position near bottom, above user profile area |
| FR-2 | Tab-based navigation for entities: Person, Gift, Occasion, List | Must | One tab per entity with manageable fields |
| FR-3 | List all fields with managed options for selected entity | Must | Show field_name, current count of active options |
| FR-4 | Add new option: form with value (slug) + display_label | Must | Value immutable after creation, label editable |
| FR-5 | Edit existing option: change display_label, reorder | Must | Cannot change value (preserves data integrity) |
| FR-6 | Delete option: soft-delete if in use, hard-delete if unused | Must | In-use detection via foreign key queries |
| FR-7 | Reorder options: drag-and-drop or numbered display_order | Should | For ranking/priority in UI (e.g., top 5 wines) |
| FR-8 | Show option usage status: "In use (N records)" or "Unused" | Should | Help admin decide if safe to delete |
| FR-9 | Search/filter options by label or value | Should | For large option sets (50+ items) |
| FR-10 | Confirm before deleting; show warning for soft-delete | Must | Prevent accidental data loss |
| FR-11 | List soft-deleted options separately (archived view) | Could | Show what's archived, allow unarchive |
| FR-12 | Backend: field_options table with entity, field_name, value, display_label, display_order, is_system, is_active, created_at, updated_at | Must | Schema definition below |
| FR-13 | Backend: GET /api/field-options?entity=person&field_name=wine_types | Must | Returns paginated list of options |
| FR-14 | Backend: POST /api/field-options (create new option) | Must | Validate value uniqueness per entity+field |
| FR-15 | Backend: PUT /api/field-options/{id} (edit label/display_order) | Must | Cannot change value after creation |
| FR-16 | Backend: DELETE /api/field-options/{id} (soft or hard delete) | Must | Check if option used before hard delete |
| FR-17 | Migration: seed field_options with all existing hardcoded values marked is_system=true | Must | Preserve existing data, mark as immutable defaults |
| FR-18 | Validation: update Pydantic validators to query field_options table | Must | Remove hardcoded set references gradually |
| FR-19 | Real-time updates: React Query cache invalidation on admin changes | Must | Options refetch within 5 seconds, no app restart |
| FR-20 | Backward compatibility: existing data remains valid after migration | Must | Old values in DB still queryable, enum fallback if needed |

### 6.2 Non-Functional Requirements

**Performance:**
- Admin page loads in <1 second (include field_options in app shell cache)
- CRUD operations respond in <200ms (p95)
- Option lookup queries cached in-memory or Redis (TTL 5 minutes, invalidated on change)
- Bulk seed migration completes in <30 seconds for 500+ options

**Security:**
- All admin endpoints require authentication (currently permissive, designed for future role checks)
- No direct option value injection (use parameterized queries)
- Audit logging: log all option CRUD operations (who, when, what changed)
- Rate limiting on option endpoints (prevent bulk deletion spam)

**Accessibility:**
- Admin page WCAG 2.1 AA compliant (keyboard navigation, screen reader support)
- Tab navigation between entity tabs (arrow keys)
- Form modals with proper focus management
- Confirmation dialogs with clear action labels (Confirm, Cancel)

**Reliability:**
- Option deletions transactional: either full soft-delete or rollback (no partial deletes)
- Migration rollback plan: if seeding fails, previous enum validation still works
- Health check includes field_options table availability
- Field_options queries fail gracefully: fall back to hardcoded enum if DB unavailable (future enhancement)

**Observability:**
- OpenTelemetry spans for all CRUD operations: `field_options.create`, `field_options.update`, `field_options.delete`
- Structured JSON logs with trace_id, span_id, user_id, entity, field_name, option_id
- Metrics: count of options per entity, count of soft-deleted options, avg response time per operation
- Error tracking: log failed validation checks, deletion attempts on in-use options

---

## 7. Scope

### In Scope

- **Entities**: Person, Gift, Occasion, List (all 5 major entities with dropdown/enum fields)
- **Operations**: Full CRUD (Create, Read, Update, Delete with soft-delete logic)
- **Admin UI**: Sidebar navigation item, tab-based entity selection, option CRUD forms
- **Backend API**: RESTful endpoints for option management (GET, POST, PUT, DELETE)
- **Database**: New `field_options` table, Alembic migration with seeding
- **Validation**: Move Pydantic validators from hardcoded sets to DB queries
- **Real-time**: React Query cache invalidation (no WebSocket; option changes are infrequent)
- **Access Control Design**: API ready for role-based enforcement (not yet enforced, but designed for it)
- **Audit Trail**: Timestamps and optional audit logging for compliance

### Out of Scope

- **Role-Based Access Control (RBAC) Enforcement**: API designed for admin checks, but not enforced yet (permission check boilerplate added, returns true for now)
- **User-Specific Options**: No per-user custom option sets; only admin-managed global options
- **WebSocket Broadcasting**: Real-time sync uses React Query; WebSocket reserved for Kanban board
- **Option Validation Rules**: No conditional logic per option (e.g., "Sake" only for wine_types); simple key-value pairs
- **Bulk Import/Export**: No CSV upload for options (future enhancement)
- **Version History / Change Log**: No option value change history (audit_log table not included)
- **Multi-language Support**: All option labels in English (i18n not included)
- **Nested/Hierarchical Options**: All options flat key-value pairs (no category grouping like "Wine > Red > Pinot Noir")

---

## 8. Dependencies & Assumptions

### External Dependencies

- **PostgreSQL**: Existing database, no version upgrade required
- **SQLAlchemy**: Existing ORM (v2.x), used for field_options model
- **Alembic**: Existing migration tool, used for schema and seeding migration
- **Pydantic**: Existing validation library (v2.x), updated validators to query DB
- **React Query**: Existing client-side cache library (v4.x+), used for cache invalidation
- **Radix UI**: Existing component library, used for admin form modals and tabs

### Internal Dependencies

- **User Model**: Needs `is_admin` flag added (but not enforced yet); permission check API ready
- **Person Schema/Model**: Currently uses hardcoded sets in Pydantic, needs validation refactor
- **Gift Schema/Model**: Currently uses Python enums, needs fallback strategy
- **Occasion Schema/Model**: Currently uses Python enums, needs fallback strategy
- **List Schema/Model**: Currently uses Python enums, needs fallback strategy
- **Repository Layer**: Existing patterns for data access; new FieldOptionsRepository created
- **Service Layer**: Existing patterns for business logic; new FieldOptionsService created
- **Router**: Existing API patterns; new FieldOptionsRouter for admin endpoints

### Assumptions

- **Single-tenant App**: No row-level security (RLS) needed; all users see same options
- **Infrequent Changes**: Options are managed ~1-2 times/month; no need for WebSocket real-time (React Query sufficient)
- **Small Option Sets**: No entity with >500 options (pagination acceptable, no virtualization needed)
- **Immutable System Defaults**: Hardcoded values marked `is_system=true` can be archived but not deleted
- **No Approval Workflow**: Admin changes take effect immediately (no draft/publish cycle)
- **Backward Compatibility**: Existing data with old enum values remains valid after migration
- **Optional Soft Delete**: Options marked `is_active=false` are excluded from UI dropdowns but queries can still retrieve them
- **No Cascading Deletes**: Deleting an option does not delete Person/Gift/Occasion records using that option

### Feature Flags

- `ADMIN_FIELD_OPTIONS_ENABLED`: Toggles admin page visibility (default: true for now, false in future RBAC enforcement)
- `USE_DB_OPTIONS`: Route validation to field_options table vs. hardcoded enums (default: false, gradual rollout true)
- `ALLOW_SYSTEM_OPTION_EDIT`: Allow editing `is_system=true` options' display labels (default: false)

---

## 9. Risks & Mitigations

| Risk | Impact | Likelihood | Mitigation |
| ----- | :----: | :--------: | ---------- |
| **Data Loss**: Admin accidentally hard-deletes option used by 50+ Person records | High | Medium | Enforce soft-delete for in-use options; show warning with usage count; require confirmation |
| **Referential Integrity**: Option deletion breaks existing records | High | Low | Add foreign key constraint or pre-delete check; query usage before delete |
| **Migration Failure**: Seeding 500+ options fails partway through | High | Low | Use transaction, test migration locally first; rollback plan documented |
| **Cache Invalidation Miss**: Admin changes option but old cached value appears on UI | Medium | Medium | Emit cache invalidation immediately after DB commit; verify React Query refetch |
| **Validation Bypass**: User submits old enum value after admin deletes it (data integrity) | Medium | Medium | Fallback: accept archived options in validation; soft-delete prevents hard constraints |
| **Performance Regression**: Option queries (n+1 problem) slow down form loads | Medium | Low | Batch load options on app start; cache in React Query; use eager loading in repository |
| **Enum Compatibility**: Gift.priority enum in ORM conflicts with DB-driven options | Medium | Medium | Keep enum as fallback; gradual migration to DB-only (can coexist temporarily) |
| **Unauthorized Access**: Non-admin user guesses admin endpoint and modifies options | High | Low | Add permission check to API (enforce in future, designed now); validate user role on backend |
| **Concurrent Edits**: Two admins edit same option simultaneously | Low | Low | Last-write-wins (acceptable for small team); version field optional for future pessimistic locking |
| **Soft-Delete Data Bloat**: Over time, is_active=false rows accumulate in table | Low | Low | Add retention policy in future; monthly archive of old archived options to audit table |

---

## 10. Target State (Post-Implementation)

### User Experience

**Admin (Sarah):**
1. Opens app, clicks "Admin" in sidebar (settings icon)
2. Sees tabbed interface: Person | Gift | Occasion | List
3. Selects "Person" tab, sees expandable list of fields: wine_types, hobbies, cuisines, etc.
4. Clicks "wine_types" to expand, sees current options: red, white, rosé, sparkling
5. Clicks "Add Option" button
6. Modal appears: Value field (readonly after submit), Display Label field
7. Enters Value="sake", Display Label="Sake"
8. Clicks Save; option added, modal closes
9. "Sake" now appears at bottom of wine_types list with display_order auto-calculated
10. Immediately, all other users' Person profile forms show "Sake" in wine_types dropdown
11. Sarah can click edit pencil icon to change "Sake" → "Sake (dry)" (label only)
12. Sarah can click trash icon to soft-delete "Sake" (still queryable, hidden from dropdown)

**End User (Jamie):**
1. Opens Person profile form
2. Sees wine_types dropdown with all 8 traditional + 1 new "Sake" option
3. Selects "Sake"
4. Form saves successfully
5. If admin later soft-deletes "Sake", Jamie's record still shows "Sake" (no data loss)
6. New Person forms do not show "Sake" in dropdown (soft-deleted)

### Technical Architecture

**Database (PostgreSQL):**
```sql
CREATE TABLE field_options (
    id BIGSERIAL PRIMARY KEY,
    entity VARCHAR(50) NOT NULL,              -- "person", "gift", "occasion", "list"
    field_name VARCHAR(100) NOT NULL,         -- "wine_types", "priority", "type", etc.
    value VARCHAR(255) NOT NULL,              -- slug/key, immutable: "sake", "low", "holiday"
    display_label VARCHAR(255) NOT NULL,      -- human-readable: "Sake", "Low Priority", "Holiday"
    display_order INT DEFAULT 0,              -- for sorting (0=first, higher=later)
    is_system BOOLEAN DEFAULT FALSE,          -- TRUE for hardcoded defaults, cannot be deleted
    is_active BOOLEAN DEFAULT TRUE,           -- FALSE = soft-deleted, excluded from UI
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NULLABLE,                 -- user ID (for audit trail)
    updated_by UUID NULLABLE,
    UNIQUE(entity, field_name, value),        -- prevent duplicate options
    FOREIGN KEY (created_by) REFERENCES "user"(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES "user"(id) ON DELETE SET NULL
);
CREATE INDEX idx_field_options_entity_field ON field_options(entity, field_name, is_active);
```

**API Endpoints:**
```
GET    /api/field-options?entity=person&field_name=wine_types&include_inactive=false
→ Returns: [ { id, value, display_label, display_order, is_system, is_active, usage_count } ]

POST   /api/field-options
Body: { entity, field_name, value, display_label, display_order }
→ Returns: { id, ... } + Cache invalidation

PUT    /api/field-options/{id}
Body: { display_label?, display_order? }
→ Returns: { id, ... } (value immutable)

DELETE /api/field-options/{id}
Query: ?hard_delete=false (default soft-delete)
→ Returns: { success } + usage check + warning if in-use
```

**Service Layer (Python):**
```python
class FieldOptionsService:
    async def get_options(entity: str, field_name: str, include_inactive: bool = False) → list[FieldOptionDTO]
    async def create_option(entity: str, field_name: str, value: str, display_label: str) → FieldOptionDTO
    async def update_option(id: int, display_label: str = None, display_order: int = None) → FieldOptionDTO
    async def delete_option(id: int, hard_delete: bool = False) → DeletedOptionDTO
    async def get_option_usage(id: int) → int  # count of records using this option
```

**React Query (Frontend):**
```typescript
// Cache key for options
useQuery({
  queryKey: ["field-options", entity, field_name],
  queryFn: () => fetchFieldOptions(entity, field_name),
  staleTime: 5 * 60 * 1000, // 5 min
});

// Invalidate on admin change
const { mutate: addOption } = useMutation({
  mutationFn: (payload) => postFieldOption(payload),
  onSuccess: () => {
    queryClient.invalidateQueries({
      queryKey: ["field-options", entity, field_name]
    });
  }
});
```

**Data Flow:**
1. App loads → fetch field_options for all entities (batch query)
2. Cache in React Query with 5-minute stale time
3. Admin edits option → POST to API
4. API updates DB, returns DTO
5. API triggers cache invalidation key
6. React Query refetch initiated
7. All dropdowns with that option update within 5 seconds
8. No app restart required

### Observable Outcomes

- **Option Customization**: Admins can add/edit/delete options in <1 minute (vs. 2 days via code)
- **User Experience**: End users see fresh options immediately after admin changes (no restart)
- **Data Safety**: No accidental data loss (soft-delete for in-use options, usage counts shown)
- **Audit Trail**: All changes logged with timestamps and user attribution
- **Code Simplification**: No more hardcoded sets in Python; validation queries DB
- **Future-Ready**: API design ready for RBAC enforcement without refactoring

---

## 11. Overall Acceptance Criteria (Definition of Done)

### Functional Acceptance

- [x] Admin page accessible from sidebar (settings icon, near user profile)
- [x] Tab navigation for Person, Gift, Occasion, List entities
- [x] Expandable list of fields with managed options for each entity
- [x] Add option: modal form with value (slug) + display_label, auto display_order
- [x] Edit option: change display_label + display_order (value immutable)
- [x] Delete option: soft-delete (is_active=false) if in-use, hard-delete if unused
- [x] Usage detection: show "In use (N records)" or "Unused" badge
- [x] Delete confirmation: warn before soft-delete, strong warning for hard-delete
- [x] Real-time updates: options refetch via React Query within 5 seconds
- [x] Backward compatibility: existing Person/Gift/Occasion/List records remain valid

### Technical Acceptance

- [x] `field_options` table schema created with all required columns (entity, field_name, value, display_label, display_order, is_system, is_active, created_at, updated_at)
- [x] Alembic migration: create table + seed with all existing hardcoded values (is_system=true)
- [x] FieldOptionsRepository: implements get_options, create_option, update_option, delete_option, check_usage
- [x] FieldOptionsService: business logic, validation, returns DTOs only
- [x] FieldOptionsRouter: REST endpoints (GET, POST, PUT, DELETE) with proper error handling
- [x] Pydantic schema: FieldOptionDTO, FieldOptionCreateDTO, FieldOptionUpdateDTO
- [x] Validation refactor: update Person schema validators to query field_options (gradual rollout)
- [x] Permission check API: add is_admin permission check to all admin endpoints (permission always true for now)
- [x] Cache invalidation: React Query keys properly structured, invalidated on CRUD
- [x] Error handling: 404 for missing option, 409 for duplicate value, 400 for invalid entity/field_name
- [x] Audit logging: optional created_by, updated_by fields in schema

### Quality Acceptance

- [x] Unit tests: >80% coverage for Service (validation, usage checks, soft-delete logic)
- [x] Integration tests: all 5 CRUD endpoints, migration seeding
- [x] E2E tests: admin user flow (add option → see in dropdown → edit → soft-delete)
- [x] Performance benchmarks: GET options <50ms, POST <100ms, DELETE <150ms (p95)
- [x] Accessibility: Admin page WCAG 2.1 AA (keyboard nav, focus management, screen reader support)
- [x] Security: No SQL injection (parameterized queries), no unauthorized access (permission check in place)
- [x] Load test: seeding 500 options <30 seconds

### Documentation Acceptance

- [x] API documentation: endpoint signatures, request/response examples, error codes
- [x] Migration guide: how to seed, rollback instructions, data safety notes
- [x] Admin user guide: how to add/edit/delete options, what soft-delete means
- [x] Developer guide: how to add new entity to field_options, validator pattern
- [x] Architecture documentation: updated CLAUDE.md with field_options pattern
- [x] Postman collection: example requests for all CRUD operations

---

## 12. Assumptions & Open Questions

### Assumptions

- **Single Admin User (for now)**: Assume one person managing options; no concurrent edit conflicts expected (acceptable for 2-3 family members)
- **Infrequent Changes**: Options change ~1-2 times/month; polling/React Query sufficient (no WebSocket)
- **Small Option Sets**: No field with >500 options; pagination acceptable
- **Immutable System Values**: Hardcoded defaults marked `is_system=true` are reference data, not user-editable (allows immutability check, prevents accidental deletion of core options like "low" priority)
- **Soft Delete Acceptable**: Archived options hidden from UI but queryable (no need for hard-delete workflow)
- **English Labels Only**: No multi-language support planned (i18n out of scope)
- **No Approval Workflow**: Admin changes take effect immediately (no draft/publish/review cycle)
- **Backward Compatibility**: Existing ORM enum fields (Gift.priority, Occasion.type) coexist with DB options during migration (gradual rollout, not all-at-once)

### Open Questions

- [ ] **Q1: Role-Based Access Control (RBAC) Timeline**
  - **Q**: Should we enforce admin-only access immediately, or leave open for now?
  - **A**: Design for RBAC (permission check boilerplate added), but permission always true for now. Enforcement comes in future role-based PRD.

- [ ] **Q2: Enum Value Stability**
  - **Q**: Gift.priority is code-driven enum (low, medium, high) but also manageable via admin. Should we keep enum as fallback or migrate to DB-only?
  - **A**: Keep enum in code, but mark system values (is_system=true) and disable edit. Gradual migration: read from field_options first, fallback to enum if missing.

- [ ] **Q3: Option Import/Export**
  - **Q**: Should admins be able to bulk-import options from CSV?
  - **A**: Out of scope for v1. Future enhancement if needed.

- [ ] **Q4: Nested/Hierarchical Options**
  - **Q**: Should wine_types support hierarchy (Wine > Red > Pinot Noir)?
  - **A**: Out of scope. All options flat key-value for v1. Hierarchy in future if needed.

- [ ] **Q5: Change History / Audit Log**
  - **Q**: Do we need full change history (e.g., "Sake label changed from 'Sake' to 'Sake (dry)' at 2025-12-20 14:30")?
  - **A**: Out of scope for v1. Audit table with created_by, updated_by timestamps sufficient. Full change history in future if compliance required.

- [ ] **Q6: User-Specific Options**
  - **Q**: Should each family member have custom option preferences (e.g., Sarah's favorite wines vs. Jamie's)?
  - **A**: No. All users see same global options managed by admin. Per-user customization out of scope.

---

## 13. Appendices & References

### Related Documentation

- **North Star**: `docs/project_plans/north-star/family-gifting-dash.md`
- **Architecture**: `services/api/CLAUDE.md`, `apps/web/CLAUDE.md`
- **Current Schemas**: `services/api/app/schemas/person.py` (25+ hardcoded sets), `gift.py`, `occasion.py`, `list.py`
- **Current Models**: `services/api/app/models/person.py`, `gift.py`, `occasion.py`, `list.py`

### Symbol References (When Codebase Symbols Defined)

- **API Symbols**: `FieldOptionsRouter`, `FieldOptionsService`, `FieldOptionsRepository`
- **UI Symbols**: `AdminPage`, `FieldOptionsTab`, `OptionsList`, `AddOptionModal`, `EditOptionModal`
- **Domain Symbols**: `FieldOption`, `FieldOptionDTO`, `FieldOptionCreateDTO`

### Prior Art / Research

- **SaaS Taxonomy Management**: Zendesk, Jira, HubSpot admin interfaces for custom fields
- **Database Lookup Patterns**: Martin Fowler's "Lookup Table" pattern
- **Soft Delete**: Best practices in SQLAlchemy and PostgreSQL

---

## Implementation

### Phased Approach

**Phase 1: Backend Infrastructure (3-4 days)**
- Duration: 3-4 days
- Tasks:
  - [x] Create `field_options` table (Alembic migration)
  - [x] Seed migration: insert all hardcoded values from person.py enums with is_system=true
  - [x] Create FieldOption SQLAlchemy model
  - [x] Create FieldOptionDTO and related Pydantic schemas
  - [x] Implement FieldOptionsRepository (CRUD, usage checks)
  - [x] Implement FieldOptionsService (business logic, validation)
  - [x] Implement FieldOptionsRouter (REST endpoints: GET, POST, PUT, DELETE)
  - [x] Add permission check boilerplate (permission always true for now)
  - [x] Write unit tests for Service (>80% coverage)
  - [x] Write integration tests for API endpoints
  - [x] Test migration locally (seed, rollback)

**Phase 2: Frontend Admin Page (3-4 days)**
- Duration: 3-4 days
- Tasks:
  - [x] Add "Admin" navigation item to sidebar (settings icon)
  - [x] Create AdminPage component with tab navigation (Person, Gift, Occasion, List)
  - [x] Create FieldsList component (expandable fields, show option count)
  - [x] Create OptionsList component (list options, usage badges)
  - [x] Create AddOptionModal (form: value, display_label, display_order)
  - [x] Create EditOptionModal (edit label/order, value immutable)
  - [x] Create DeleteConfirmation modal (soft-delete, hard-delete warning)
  - [x] Integrate React Query for options fetching and cache invalidation
  - [x] Handle loading states and error messages
  - [x] Test keyboard navigation, screen reader (WCAG AA)
  - [x] Write E2E tests (add → see in dropdown → edit → delete flow)

**Phase 3: Validation Refactor & Backward Compatibility (2-3 days)**
- Duration: 2-3 days
- Tasks:
  - [x] Update Person schema validators to query field_options first, fallback to hardcoded set
  - [x] Update Gift schema enum fallback (read from DB, fallback to enum)
  - [x] Update Occasion schema enum fallback
  - [x] Update List schema enum fallback
  - [x] Test backward compatibility: old enum values still accepted
  - [x] Test new DB values work in validation
  - [x] Remove hardcoded sets from person.py schemas (gradual, after seeding verified)
  - [x] Update documentation with new pattern

**Phase 4: Deployment & Monitoring (1-2 days)**
- Duration: 1-2 days
- Tasks:
  - [x] Deploy Phase 1 (backend) to staging
  - [x] Run migration, verify seeding
  - [x] Deploy Phase 2 (frontend) to staging
  - [x] Smoke tests (add option, see in dropdown)
  - [x] Load test (500 options, p95 response time)
  - [x] Deploy to production
  - [x] Monitor API logs for errors (no 5xx, no n+1 queries)
  - [x] Monitor React Query cache performance

### Epics & User Stories Backlog

| Story ID | Short Name | Description | Acceptance Criteria | Estimate |
|----------|-----------|-------------|-------------------|----------|
| ADMIN-1 | Create field_options table | Design and create PostgreSQL table with all required columns | Table created, indexes on entity+field+is_active, unique constraint on entity+field+value | 2 pts |
| ADMIN-2 | Seed field_options migration | Write Alembic migration to insert all hardcoded values from person.py, gift.py, etc. | All 25+ Person sets, 6 Gift/Occasion/List enums migrated, is_system=true, migration reversible | 3 pts |
| ADMIN-3 | Create FieldOption model & DTO | SQLAlchemy model and Pydantic schemas for field_options table | FieldOption model, FieldOptionDTO, FieldOptionCreateDTO, FieldOptionUpdateDTO defined | 2 pts |
| ADMIN-4 | FieldOptionsRepository | Implement repository with get, create, update, delete, check_usage methods | All 5 methods implemented, tests >80%, usage check queries correct | 5 pts |
| ADMIN-5 | FieldOptionsService | Implement service with validation, permission check, business logic | Service methods return DTOs, validation checks duplicates, permission check in place | 5 pts |
| ADMIN-6 | FieldOptionsRouter | REST endpoints (GET, POST, PUT, DELETE) for option management | All endpoints functional, proper status codes (200, 201, 400, 404, 409), error responses | 5 pts |
| ADMIN-7 | Backend permission check | Add is_admin permission boilerplate (always true for now) | Permission check on all admin endpoints, logs permission denials, future-ready | 2 pts |
| ADMIN-8 | Sidebar admin navigation | Add "Admin" nav item with settings icon near user profile | Nav item renders, routes to /admin page | 2 pts |
| ADMIN-9 | AdminPage component | Tab-based navigation for Person, Gift, Occasion, List entities | 4 tabs render, active tab highlighted, content changes on tab click | 3 pts |
| ADMIN-10 | FieldsList component | Show all fields for selected entity with manageable options | Fields list renders, expandable, option count shown, only fields with managed options shown | 3 pts |
| ADMIN-11 | OptionsList component | Show all options for selected field with usage badges | Options list renders, in-use/unused badges shown, display_order respected | 3 pts |
| ADMIN-12 | AddOptionModal | Form to add new option (value + display_label) | Modal opens, value required + unique, label required, submit creates option, cache invalidated | 3 pts |
| ADMIN-13 | EditOptionModal | Edit display_label and display_order (value immutable) | Modal shows current values, label editable, order editable, value grayed out, submit updates | 3 pts |
| ADMIN-14 | DeleteOption modal | Soft/hard delete confirmation with usage warnings | Shows usage count, soft-delete recommended for in-use, hard-delete warning for unused, confirms before delete | 3 pts |
| ADMIN-15 | React Query integration | Cache options, invalidate on CRUD, refetch within 5 seconds | useQuery for options, invalidate on create/update/delete, <5s refetch | 3 pts |
| ADMIN-16 | Validate backward compatibility | Old enum values still work after migration, new DB values work | Test gift.priority="low" still valid after migration, new values from DB also valid | 3 pts |
| ADMIN-17 | Update Person validators | Refactor schema validators to query field_options, fallback to hardcoded set | Validators query DB first, fallback to enum, tests pass | 3 pts |
| ADMIN-18 | Update Gift/Occasion/List validators | Refactor enums to use field_options with fallback | All 3 entities fallback to enum, tests pass, no breaking changes | 3 pts |
| ADMIN-19 | Integration tests (API) | Test all CRUD endpoints with real database | All 5 endpoints tested, migration verified, seeding verified, usage check tested | 5 pts |
| ADMIN-20 | E2E tests (admin flow) | Test admin workflow: add option → see in dropdown → edit → delete | Admin adds wine_type "Sake", Person form shows it, edit label, soft-delete hides from new forms | 5 pts |
| ADMIN-21 | API documentation | Document all endpoint signatures, examples, error codes | Postman collection created, endpoint docs in API guide | 2 pts |
| ADMIN-22 | Admin user guide | Guide for admins on using admin page (how to add/edit/delete, what soft-delete means) | User guide in docs/, screenshots or video | 2 pts |
| ADMIN-23 | Performance testing | Benchmark CRUD operations, ensure <200ms p95 response time | Load test with 500 options, measure response times, no n+1 queries | 3 pts |
| ADMIN-24 | Accessibility audit | WCAG 2.1 AA compliance for admin page (keyboard nav, screen reader, focus) | Audit tool passes, manual testing with screen reader, keyboard nav works | 2 pts |
| ADMIN-25 | Production deployment | Deploy backend + frontend + migration to production with monitoring | Migration runs successfully, seeding verified, monitoring in place, rollback plan documented | 3 pts |

**Total Estimate**: ~100 story points (distributed across 4-5 developer-weeks for 1 developer, or 2-3 weeks with 2+ developers)

---

**Progress Tracking:**

See progress tracking: `.claude/progress/admin-field-options/all-phases-progress.md`

---

## Document Metadata

- **Version**: 1.0
- **Status**: Draft
- **Last Updated**: 2025-12-20
- **Filepath**: `docs/project_plans/PRDs/features/admin-field-options-v1.md`
- **Next Review**: Upon Phase 1 completion
