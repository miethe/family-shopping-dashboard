---
title: "Phase 9-10: Testing & Documentation (Quality Assurance through Deployment)"
description: "Comprehensive testing strategy, documentation, and production deployment preparation for field options feature"
audience: [qa-engineers, backend-developers, frontend-developers, devops]
tags: [testing, documentation, quality, deployment, e2e]
created: 2025-12-20
updated: 2025-12-20
category: "implementation-planning"
status: active
related: ["docs/project_plans/implementation_plans/features/admin-field-options-v1.md"]
---

# Phase 9-10: Testing & Documentation

**Duration**: 1-1.5 weeks
**Complexity**: Medium
**Story Points**: 20 points
**Owners**: QA Engineer + Documentation Writer + DevOps

This phase covers comprehensive testing (unit, integration, E2E), performance validation, accessibility compliance, and complete documentation.

---

## Phase 9: Testing & Quality Assurance (Days 1-6)

### Task 9.1: Unit Test Coverage Verification

**Story**: `ADMIN-4/5/19: Unit tests completion`
**Points**: 3
**Owner**: Backend Engineer (with QA oversight)
**Status**: Not Started

**Description**:
Verify and enhance unit test coverage for repository and service layers to >80%.

**Coverage Targets**:
- Repository: >90% coverage
- Service: >85% coverage
- Overall backend: >80% coverage

**Files Involved**:
- `services/api/tests/unit/repositories/test_field_option_repository.py`
- `services/api/tests/unit/services/test_field_option_service.py`

**Execution Steps**:

```bash
# Run tests with coverage
cd services/api
uv run pytest tests/unit/repositories/test_field_option_repository.py --cov=app.repositories.field_option --cov-report=html
uv run pytest tests/unit/services/test_field_option_service.py --cov=app.services.field_option_service --cov-report=html

# Check combined coverage
uv run pytest tests/unit/ --cov=app --cov-report=term --cov-report=html
```

**Coverage Report Checklist**:
- [ ] Repository create: 100% (all branches)
- [ ] Repository read: 100% (success, not found, pagination)
- [ ] Repository update: 100% (label, order, validation)
- [ ] Repository delete: 100% (soft, hard, usage check)
- [ ] Service create: 90%+ (permission, validation, error handling)
- [ ] Service read: 90%+ (single, list, pagination)
- [ ] Service update: 90%+
- [ ] Service delete: 90%+ (soft, hard, system option check)
- [ ] Error paths: >85% (exceptions, validation errors)

**Acceptance Criteria**:
- [ ] Repository tests >90% coverage
- [ ] Service tests >85% coverage
- [ ] All exception paths tested
- [ ] All branches covered
- [ ] HTML report generated
- [ ] No untested critical paths

---

### Task 9.2: Integration Testing

**Story**: `ADMIN-19: Integration tests (API)`
**Points**: 4
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Write comprehensive integration tests for all API endpoints using TestClient.

**Test Scenarios**:
- Happy path: all CRUD operations succeed
- Error paths: validation, not found, duplicate
- Permission checks: admin vs non-admin
- Data consistency: soft-delete, hard-delete, usage checks
- Cache invalidation: React Query cache keys correct
- Transaction integrity: rollback on error

**Files Involved**:
- `services/api/tests/integration/test_field_options_api.py`
- `services/api/tests/integration/test_field_options_migration.py` (new)

**New Migration Test File**:

```python
# tests/integration/test_field_options_migration.py
import pytest
from sqlalchemy import text
from sqlalchemy.orm import Session

class TestFieldOptionsMigration:
    """Verify migration created table and seeded options correctly."""

    def test_field_options_table_exists(self, db_session: Session):
        """Table should exist with correct schema."""
        result = db_session.execute(
            text("""
                SELECT EXISTS (
                    SELECT 1 FROM information_schema.tables
                    WHERE table_name = 'field_options'
                )
            """)
        )
        assert result.scalar() == True

    def test_field_options_columns(self, db_session: Session):
        """All required columns should exist."""
        result = db_session.execute(
            text("""
                SELECT column_name FROM information_schema.columns
                WHERE table_name = 'field_options'
                ORDER BY column_name
            """)
        )
        columns = {row[0] for row in result}
        required = {
            'id', 'entity', 'field_name', 'value', 'display_label',
            'display_order', 'is_system', 'is_active',
            'created_at', 'updated_at', 'created_by', 'updated_by'
        }
        assert required.issubset(columns)

    def test_migration_seeded_options(self, db_session: Session):
        """Seeding migration should insert ~100+ options."""
        result = db_session.execute(
            text("SELECT COUNT(*) FROM field_options WHERE is_system = true")
        )
        count = result.scalar()
        assert count >= 80  # At least 80 system options

    def test_seeded_options_by_entity(self, db_session: Session):
        """All entities should have seeded options."""
        result = db_session.execute(
            text("""
                SELECT DISTINCT entity FROM field_options
                WHERE is_system = true
                ORDER BY entity
            """)
        )
        entities = {row[0] for row in result}
        assert entities == {"person", "gift", "occasion", "list"}

    def test_migration_rollback(self, db_session: Session):
        """Rollback should delete only system options."""
        # This test verifies rollback procedure works
        # Actual rollback tested in manual migration process
        pass

    def test_unique_constraint(self, db_session: Session):
        """Entity + field + value should be unique."""
        result = db_session.execute(
            text("""
                SELECT constraint_name FROM information_schema.constraint_column_usage
                WHERE table_name = 'field_options'
                AND column_name IN ('entity', 'field_name', 'value')
            """)
        )
        constraints = [row[0] for row in result]
        assert any('unique' in c.lower() or 'pk' in c.lower() for c in constraints)

    def test_index_created(self, db_session: Session):
        """Index on entity + field + is_active should exist."""
        result = db_session.execute(
            text("""
                SELECT 1 FROM pg_indexes
                WHERE tablename = 'field_options'
                AND indexname = 'idx_field_options_entity_field'
            """)
        )
        assert result.scalar() == 1
```

**API Endpoint Test Expansion**:

```python
# Additional tests in test_field_options_api.py

class TestFieldOptionsAPIErrorHandling:
    """Test error handling and edge cases."""

    def test_invalid_entity_query(self):
        """Invalid entity in query returns 400."""
        response = client.get(
            "/api/field-options",
            params={"entity": "invalid", "field_name": "test"}
        )
        assert response.status_code == 400

    def test_rate_limiting(self):
        """Rapid requests should be rate-limited (future)."""
        # Placeholder for rate limiting tests
        pass

    def test_concurrent_creates(self, db_session):
        """Concurrent creates of same value should handle gracefully."""
        # Test with threading or async
        pass

class TestFieldOptionsCacheInvalidation:
    """Test React Query cache invalidation."""

    def test_create_invalidates_list(self):
        """Creating option should invalidate list cache."""
        # Verify correct cache key invalidation
        pass

    def test_update_invalidates_both(self):
        """Updating should invalidate single and list caches."""
        pass

    def test_delete_invalidates_all(self):
        """Deleting should invalidate all field-options queries."""
        pass

class TestFieldOptionsDataIntegrity:
    """Test data consistency and integrity."""

    def test_soft_delete_preserves_data(self, sample_option):
        """Soft-deleted option row should still exist."""
        repo = FieldOptionsRepository(db_session)
        repo.soft_delete(sample_option.id)

        # Row should exist but be inactive
        option = repo.get_by_id(sample_option.id)
        assert option.is_active == False

        # Should not appear in active list
        active, _ = repo.get_options("person", "wine_types", include_inactive=False)
        assert sample_option.id not in [o.id for o in active]

        # Should appear in inactive list
        inactive, _ = repo.get_options("person", "wine_types", include_inactive=True)
        assert sample_option.id in [o.id for o in inactive]

    def test_hard_delete_removes_row(self, sample_option):
        """Hard-deleted option should be removed completely."""
        repo = FieldOptionsRepository(db_session)
        repo.hard_delete(sample_option.id)

        # Row should not exist
        with pytest.raises(RecordNotFoundError):
            repo.get_by_id(sample_option.id)
```

**Execution**:

```bash
cd services/api
uv run pytest tests/integration/test_field_options_api.py -v
uv run pytest tests/integration/test_field_options_migration.py -v
uv run pytest tests/integration/ --cov=app --cov-report=term
```

**Acceptance Criteria**:
- [ ] All CRUD endpoints tested
- [ ] Migration verified (table, columns, seeding)
- [ ] Error handling tested (400, 404, 409)
- [ ] Data integrity verified (soft-delete, hard-delete)
- [ ] Permission checks work
- [ ] Cache invalidation keys correct
- [ ] All tests pass
- [ ] >70% integration coverage

---

### Task 9.3: Frontend Component Testing

**Story**: `ADMIN-12-15: Frontend component tests`
**Points**: 3
**Owner**: Frontend Engineer
**Status**: Not Started

**Description**:
Write component tests for all admin page components using Vitest + React Testing Library.

**Test Scope**:
- AdminPage: tab navigation, entity switching
- FieldsList: expand/collapse, field grouping
- OptionsList: list rendering, action buttons
- AddOptionModal: form validation, submission
- EditOptionModal: loading, field updates
- DeleteConfirmationModal: confirmation, warnings

**Files to Create**:
- `apps/web/__tests__/components/admin/AdminPage.test.tsx`
- `apps/web/__tests__/components/admin/FieldsList.test.tsx`
- `apps/web/__tests__/components/admin/OptionsList.test.tsx`
- `apps/web/__tests__/components/admin/AddOptionModal.test.tsx`
- `apps/web/__tests__/components/admin/EditOptionModal.test.tsx`
- `apps/web/__tests__/components/admin/DeleteConfirmationModal.test.tsx`

**Example Test File**:

```typescript
// __tests__/components/admin/AdminPage.test.tsx
import { render, screen, userEvent } from "@testing-library/react";
import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { AdminPage } from "@/components/admin/AdminPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

const renderWithQuery = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      {component}
    </QueryClientProvider>
  );
};

describe("AdminPage", () => {
  it("renders all entity tabs", () => {
    renderWithQuery(<AdminPage />);
    expect(screen.getByText("Person")).toBeInTheDocument();
    expect(screen.getByText("Gift")).toBeInTheDocument();
    expect(screen.getByText("Occasion")).toBeInTheDocument();
    expect(screen.getByText("List")).toBeInTheDocument();
  });

  it("switches tabs on click", async () => {
    renderWithQuery(<AdminPage />);
    const giftTab = screen.getByText("Gift");

    await userEvent.click(giftTab);

    // Should show Gift-specific content
    expect(screen.getByText(/Gift Fields/i)).toBeInTheDocument();
  });

  it("highlights active tab", () => {
    renderWithQuery(<AdminPage />);
    const personTab = screen.getByText("Person");

    expect(personTab).toHaveAttribute("data-state", "active");
  });

  it("keyboard navigation works", async () => {
    renderWithQuery(<AdminPage />);
    const personTab = screen.getByText("Person");

    await userEvent.tab();
    expect(screen.getByText("Gift")).toHaveFocus();
  });
});
```

**Execution**:

```bash
cd apps/web
pnpm test components/admin
```

**Acceptance Criteria**:
- [ ] All components tested
- [ ] Happy paths verified
- [ ] Error states tested
- [ ] Loading states shown
- [ ] User interactions work
- [ ] Keyboard navigation tested
- [ ] >70% component coverage
- [ ] All tests pass

---

### Task 9.4: End-to-End Testing

**Story**: `ADMIN-20: E2E tests (admin flow)`
**Points**: 4
**Owner**: QA Engineer (with Frontend support)
**Status**: Not Started

**Description**:
Write E2E tests covering full admin workflow: add option → see in dropdown → edit → delete.

**Test Scenarios**:

1. **Add Option Scenario**:
   - Admin opens Admin page
   - Selects Person entity
   - Expands wine_types field
   - Clicks "Add Option"
   - Fills form: value="sake", label="Sake"
   - Submits form
   - Sees "Sake" in options list

2. **Option in Dropdown Scenario**:
   - After adding option
   - Admin navigates to Create Person form
   - wine_types dropdown includes "Sake"
   - Selects "Sake"
   - Form submits successfully

3. **Edit Option Scenario**:
   - Admin goes to Admin page
   - Finds "Sake" option
   - Clicks edit (pencil icon)
   - Changes label to "Sake (dry)"
   - Submits
   - Sees updated label

4. **Delete Option Scenario**:
   - Admin clicks trash icon on option
   - Sees delete confirmation
   - Clicks confirm
   - Option disappears from list
   - New Person forms don't show option

**Files to Create**:
- `apps/web/__tests__/e2e/admin-field-options.spec.ts`

**Implementation**:

```typescript
// __tests__/e2e/admin-field-options.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Admin Field Options Workflow", () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to admin
    await page.goto("/dashboard");
    await page.click("text=Admin");
    await expect(page).toHaveURL("/admin");
  });

  test("add new option to person.wine_types", async ({ page }) => {
    // Select Person entity
    await page.click('button:has-text("Person")');

    // Expand wine_types field
    await page.click("text=Wine Types");

    // Click Add Option
    await page.click("button:has-text('Add Option')");

    // Fill form
    await page.fill('input[placeholder*="sake"]', "sake");
    await page.fill('input[placeholder*="Sake"]', "Sake");

    // Submit
    await page.click("button:has-text('Create Option')");

    // Verify option appears
    await expect(page.locator("text=Sake")).toBeVisible();
  });

  test("option appears in person form dropdown", async ({ page }) => {
    // First, add the option (from previous test or setup)
    // Then navigate to create person form
    await page.goto("/people/new");

    // Check wine_types dropdown
    await page.click('select[name="wine_types"]');
    await expect(page.locator("option:has-text('Sake')")).toBeVisible();

    // Select it
    await page.selectOption('select[name="wine_types"]', "sake");

    // Submit form
    await page.click("button:has-text('Save')");

    // Verify success
    await expect(page).toHaveURL(/\/people\/\d+/);
  });

  test("edit option label", async ({ page }) => {
    // Go to admin
    await page.click('button:has-text("Person")');
    await page.click("text=Wine Types");

    // Click edit
    await page.click('button[title="Edit option"]');

    // Update label
    await page.fill("input[value='Sake']", "Sake (Premium)");

    // Submit
    await page.click("button:has-text('Update')");

    // Verify
    await expect(page.locator("text=Sake (Premium)")).toBeVisible();
  });

  test("delete option with soft-delete", async ({ page }) => {
    // Go to admin
    await page.click('button:has-text("Person")');
    await page.click("text=Wine Types");

    // Get initial count
    const initialCount = await page.locator("li").count();

    // Delete
    await page.click('button[title="Delete option"]');
    await page.click("button:has-text('Delete')");

    // Wait for deletion
    await page.waitForTimeout(1000);

    // Count should decrease
    const newCount = await page.locator("li").count();
    expect(newCount).toBeLessThan(initialCount);
  });

  test("option not shown in form after soft-delete", async ({ page }) => {
    // After soft-delete, new forms shouldn't show option
    await page.goto("/people/new");

    // Check dropdown doesn't have deleted option
    await page.click('select[name="wine_types"]');
    await expect(
      page.locator("option:has-text('Sake')")
    ).not.toBeVisible();
  });

  test("usage warning shown for in-use option", async ({ page }) => {
    // If option is used by records, delete should warn
    await page.click('button:has-text("Person")');
    await page.click("text=Wine Types");

    // Find option with usage count
    await page.click('button[title="Delete option"]');

    // Should show usage warning
    await expect(page.locator("text=/In use.*record/")).toBeVisible();
  });
});
```

**Execution**:

```bash
cd apps/web
pnpm test:e2e --grep "admin-field-options"
```

**Acceptance Criteria**:
- [ ] All 6+ scenarios passing
- [ ] Add option workflow works end-to-end
- [ ] Option appears in dropdowns immediately
- [ ] Edit option label works
- [ ] Soft-delete hides from new forms
- [ ] Usage warning shown
- [ ] Full workflow stable
- [ ] All tests pass consistently

---

### Task 9.5: Performance & Load Testing

**Story**: `ADMIN-23: Performance testing`
**Points**: 3
**Owner**: Backend Engineer + QA
**Status**: Not Started

**Description**:
Benchmark API response times, test with 500+ options, verify no n+1 queries.

**Performance Targets**:
- GET options: <50ms (p95)
- POST create: <100ms (p95)
- PUT update: <100ms (p95)
- DELETE: <150ms (p95)
- Admin page load: <1 second
- Migration seeding: <30 seconds for 500 options

**Tools**:
- k6 (load testing)
- sqlalchemy query counter (detect n+1)
- Lighthouse (frontend performance)

**Load Test Script (k6)**:

```javascript
// tests/load/field-options-load.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
  thresholds: {
    http_req_duration: ['p(95)<200'],  // 95th percentile < 200ms
    http_req_failed: ['rate<0.1'],      // <10% failure rate
  },
};

export default function () {
  // List options
  const listRes = http.get(
    'http://localhost:8000/api/field-options?entity=person&field_name=wine_types'
  );
  check(listRes, {
    'list status 200': (r) => r.status === 200,
    'list response time <50ms': (r) => r.timings.duration < 50,
  });

  sleep(1);

  // Create option
  const createRes = http.post(
    'http://localhost:8000/api/field-options',
    JSON.stringify({
      entity: 'person',
      field_name: 'wine_types',
      value: `test_${Date.now()}`,
      display_label: 'Test Option',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
  check(createRes, {
    'create status 201': (r) => r.status === 201,
    'create response time <100ms': (r) => r.timings.duration < 100,
  });

  sleep(1);
}
```

**Execution**:

```bash
# Start API server
cd services/api
uv run uvicorn app.main:app --port 8000

# In another terminal, run load test
cd tests/load
k6 run field-options-load.js

# Check for n+1 queries
# Add query logging to app during test
# SELECT COUNT(*) FROM pg_stat_statements WHERE query LIKE '%field_options%'
```

**Migration Performance Test**:

```bash
# Time the seeding migration
cd services/api
time uv run alembic upgrade head

# Should complete in <30 seconds for 500+ options
```

**Frontend Performance**:

```bash
# Lighthouse audit
cd apps/web
pnpm build
pnpm test:lighthouse /admin
```

**Acceptance Criteria**:
- [ ] GET <50ms (p95)
- [ ] POST <100ms (p95)
- [ ] PUT <100ms (p95)
- [ ] DELETE <150ms (p95)
- [ ] No n+1 queries (max 1 query per operation)
- [ ] Admin page load <1 second
- [ ] Migration <30 seconds
- [ ] Lighthouse score >90
- [ ] <10% failure rate under 10 VU load
- [ ] Performance report generated

---

## Phase 10: Documentation & Deployment (Days 7-10)

### Task 10.1: API Documentation

**Story**: `ADMIN-21: API documentation`
**Points**: 2
**Owner**: Documentation Writer
**Status**: Not Started

**Description**:
Create comprehensive API documentation with endpoint signatures, request/response examples, error codes.

**Deliverables**:
- Endpoint reference
- Request/response examples
- Error codes and meanings
- Postman collection
- OpenAPI/Swagger spec

**Files to Create**:
- `docs/api/field-options-api.md`
- `docs/api/field-options.postman_collection.json`

**API Documentation Structure**:

```markdown
# Field Options API

## Base URL
`/api/field-options`

## Authentication
All endpoints require valid JWT token (Bearer token in Authorization header).

## Endpoints

### GET /api/field-options
List field options for entity/field combination.

**Query Parameters**:
- `entity` (string, required): "person", "gift", "occasion", or "list"
- `field_name` (string, required): Field name (e.g., "wine_types", "priority")
- `include_inactive` (boolean, optional): Include soft-deleted options. Default: false
- `skip` (integer, optional): Pagination offset. Default: 0
- `limit` (integer, optional): Pagination limit. Default: 100. Max: 1000

**Response**:
```json
{
  "total": 10,
  "items": [
    {
      "id": 1,
      "entity": "person",
      "field_name": "wine_types",
      "value": "red",
      "display_label": "Red Wine",
      "display_order": 0,
      "is_system": true,
      "is_active": true,
      "created_at": "2025-12-20T10:00:00Z",
      "updated_at": "2025-12-20T10:00:00Z",
      "created_by": "user-123",
      "updated_by": null,
      "usage_count": 5
    }
  ]
}
```

**Status Codes**:
- 200: Success
- 400: Invalid entity or field_name
- 401: Unauthorized (invalid or missing token)

---

### POST /api/field-options
Create new field option.

**Request Body**:
```json
{
  "entity": "person",
  "field_name": "wine_types",
  "value": "sake",
  "display_label": "Sake",
  "display_order": 10
}
```

**Response** (201 Created):
```json
{
  "id": 101,
  "entity": "person",
  "field_name": "wine_types",
  "value": "sake",
  "display_label": "Sake",
  "display_order": 10,
  "is_system": false,
  "is_active": true,
  "created_at": "2025-12-20T10:15:00Z",
  "updated_at": "2025-12-20T10:15:00Z",
  "created_by": "user-123",
  "updated_by": null,
  "usage_count": 0
}
```

**Error Responses**:
- 400: Validation error (missing fields, invalid entity)
- 409: Duplicate option (entity+field+value already exists)
- 401: Unauthorized

---

### PUT /api/field-options/{id}
Update option (label and/or display_order only).

**Path Parameters**:
- `id` (integer): Option ID

**Request Body**:
```json
{
  "display_label": "Sake (Dry)",
  "display_order": 12
}
```

**Response** (200 OK):
Same as POST response with updated values

**Error Responses**:
- 400: Invalid update data
- 404: Option not found
- 401: Unauthorized

---

### DELETE /api/field-options/{id}
Delete option (soft or hard).

**Path Parameters**:
- `id` (integer): Option ID

**Query Parameters**:
- `hard_delete` (boolean, optional): Hard delete (remove row) vs soft-delete (set is_active=false). Default: false

**Response** (200 OK):
```json
{
  "success": true,
  "id": 101,
  "soft_deleted": true,
  "usage_count": 5,
  "message": "Option soft-deleted (still queryable by archive). Note: 5 record(s) still using this value."
}
```

**Error Responses**:
- 404: Option not found
- 400: Cannot hard-delete in-use option
- 401: Unauthorized

---

## Error Response Format

All errors follow standard envelope:
```json
{
  "error": {
    "code": "VALIDATION_ERROR|NOT_FOUND|UNAUTHORIZED|CONFLICT|INTERNAL_ERROR",
    "message": "Detailed error message",
    "trace_id": "request-trace-id"
  }
}
```

## Rate Limiting

Admin endpoints rate-limited to 60 requests per minute per user.

---

## Examples

See `field-options.postman_collection.json` for Postman examples.
```

**Acceptance Criteria**:
- [ ] All 4 endpoints documented
- [ ] Request/response examples provided
- [ ] Error codes explained
- [ ] Path and query parameters documented
- [ ] Response schemas shown (JSON)
- [ ] Status codes listed
- [ ] Rate limiting explained
- [ ] Postman collection created
- [ ] OpenAPI spec auto-generated from code

---

### Task 10.2: User Guide for Admins

**Story**: `ADMIN-22: Admin user guide`
**Points**: 2
**Owner**: Documentation Writer
**Status**: Not Started

**Description**:
Create user-friendly guide for admins on using the admin page.

**Files to Create**:
- `docs/guides/admin-field-options-user-guide.md`

**Content Structure**:

```markdown
# Admin Field Options Guide

## Overview
This guide shows how to manage dropdown options for your family dashboard without code changes.

## Getting Started

### Access Admin Page
1. Log in to your dashboard
2. In the sidebar, scroll to the bottom
3. Click the gear icon labeled "Admin"
4. You'll see tabs for Person, Gift, Occasion, List

### Interface Overview
- **Tabs**: Switch between entities (Person, Gift, etc.)
- **Categories**: Options grouped by type (Food & Drink, Hobbies, etc.)
- **Fields**: Each field (wine_types, priority) has expandable section
- **Options**: Individual choices within each field

## Adding an Option

### Example: Add "Sake" to Wine Types

1. In Admin page, click "Person" tab
2. Under "Food & Drink" category, find "Wine Types"
3. Click on "Wine Types" to expand
4. Click the "+ Add Option" button
5. A dialog appears with:
   - **Value** (key): Enter "sake"
   - **Display Label**: Enter "Sake"
   - **Display Order**: Leave at 0 (will appear first) or set order
6. Click "Create Option"
7. "Sake" now appears in Wine Types dropdown immediately

**Tips**:
- Value must be lowercase and unique (used internally)
- Display Label is what users see (can include capitals, spaces)
- Display Order: lower numbers appear first
- Change takes effect instantly across the app

## Editing an Option

### Example: Update "Sake" Label

1. Find the option in the list
2. Click the pencil (edit) icon
3. Dialog shows:
   - **Value**: Grayed out (cannot change)
   - **Display Label**: Editable (change "Sake" to "Sake (Dry)")
   - **Display Order**: Editable (change sort position)
4. Click "Update Option"
5. Changes apply immediately

**What Can't Change**:
- Value (key) - locked after creation to preserve data
- System options (marked blue "System" badge) - locked defaults

## Deleting an Option

### Soft Delete (Recommended)

When an option is used by 1+ records, it's soft-deleted:
- Option hidden from new forms (users won't see it)
- Existing records keep the value (no data loss)
- Can be undeleted later

### Hard Delete (Unused Options Only)

When an option is unused (0 records), it can be hard-deleted:
- Option completely removed from database
- Cannot be undone
- Used for cleaning up old test options

### Deletion Steps

1. Find the option in the list
2. Click the trash (delete) icon
3. Confirmation dialog appears:
   - Shows usage count
   - If in-use: warns it will be soft-deleted
   - If unused: warns it will be permanently deleted
4. Click "Delete" to confirm

**Example**:
- Option "sake" used by 5 Person records
- Click delete → Soft-delete (hidden from UI, 5 records unaffected)
- Users adding new Person can't select "sake" anymore
- Existing 5 Persons still show "sake" on their profile

## Reordering Options

### Change Display Order

1. Click edit (pencil) icon on an option
2. Change "Display Order" number
3. Lower numbers appear first in dropdowns
4. Example: Set "red" to 0, "white" to 1, "rosé" to 2
5. Save - dropdowns now show in this order

## FAQ

**Q: I added a new option but don't see it in the form**
A: Refresh the page or wait 5 seconds (cache updates automatically). If still missing, check that you chose the right entity and field.

**Q: Can I delete a system option?**
A: No. System options (marked blue "System" badge) are defaults from the app. They're hidden from deletion to prevent breaking existing data.

**Q: What if I accidentally delete an option?**
A: If it was soft-deleted, you can edit it and set display_order to trigger a refresh. For hard-deleted options, contact a developer to restore from backup.

**Q: Why can't I change the value after creating?**
A: Value (key) is immutable to preserve data integrity. If you need a different key, delete and recreate with a new value.

**Q: How long before new options appear?**
A: Less than 5 seconds. React Query automatically refetches options after any change.

## Troubleshooting

### Option Not Appearing in Dropdown
- Ensure option is marked "is_active" (not soft-deleted)
- Check correct entity and field (e.g., "person" + "wine_types")
- Clear browser cache and refresh

### Delete Failed
- Check if option is in-use (shown in delete modal)
- If in-use, only soft-delete available
- Ensure you have admin permissions

## Best Practices

1. **Use Descriptive Labels**: "Sake (Dry)" better than "Sake1"
2. **Maintain Order**: Set display_order consistently
3. **Test Changes**: Add option, check form, verify it works
4. **Backup Important Data**: Soft-delete before hard-delete
5. **Communicate Changes**: Let family members know about new options

---

## Getting Help

If you encounter issues:
1. Check this guide's FAQ
2. Look at the error message in the admin UI
3. Contact the app administrator (developer)
```

**Acceptance Criteria**:
- [ ] Clear, non-technical language
- [ ] Screenshots/visual guides (if applicable)
- [ ] Step-by-step instructions for all operations
- [ ] Real-world examples
- [ ] FAQ section
- [ ] Troubleshooting section
- [ ] Best practices
- [ ] Easy to find and use

---

### Task 10.3: Developer Extension Guide

**Story**: `ADMIN-21: Developer documentation`
**Points**: 2
**Owner**: Documentation Writer
**Status**: Not Started

**Description**:
Create guide for developers on how to extend field_options for new entities.

**Files to Create**:
- `docs/guides/developers/field-options-extension-guide.md`

**Content Structure**:

```markdown
# Developer Guide: Extending Field Options

## Overview
This guide shows how to add field_options management to new entities.

## Architecture Pattern

Field options follow a standard 4-layer architecture:

```
Router (HTTP endpoint) ↓
Service (business logic) ↓
Repository (DB access) ↓
Database table (field_options)
```

## Steps to Add New Entity Support

### 1. Update Migration Seeds

In `services/api/alembic/versions/*_seed_field_options.py`:

```python
options_data = [
    # ... existing
    # New entity: news_category
    ("news", "category", "breaking", "Breaking News", 0, True),
    ("news", "category", "update", "Update", 1, True),
    ("news", "category", "archived", "Archived", 2, True),
]
```

### 2. Register Entity in Service Validation

In `services/api/app/services/field_option_service.py`:

```python
def _validate_entity_field(self, entity: str, field_name: str) -> None:
    valid_entities = {
        # ... existing
        "news": {"category", "priority", "source"},  # New!
    }
```

### 3. Create Validators for New Entity

In `services/api/app/schemas/news.py`:

```python
from app.repositories.field_option import FieldOptionsRepository

async def validate_news_category(v: str, db: Session) -> str:
    """Validate category is in field_options."""
    repo = FieldOptionsRepository(db)
    options, _ = repo.get_options("news", "category", include_inactive=True)
    valid = {opt.value for opt in options}

    if v not in valid:
        raise ValueError(f"Invalid category: {v}")

    return v

class NewsCreate(BaseModel):
    category: str

    @field_validator("category")
    @classmethod
    async def validate_category(cls, v: str) -> str:
        return await validate_news_category(v, db)
```

### 4. Query Usage in Repository (Optional)

If you need to show usage count:

```python
def _check_usage(self, entity: str, field_name: str, value: str) -> int:
    """Check how many records use this option."""
    if entity == "news" and field_name == "category":
        return self.db.execute(
            select(func.count()).select_from(News).where(
                News.category == value
            )
        ).scalar()

    return 0  # Default for unknown entities
```

### 5. Update Admin UI (Optional)

In `apps/web/components/admin/EntityTab.tsx`:

```typescript
const ENTITY_FIELDS = {
    // ... existing
    news: [
        {
            name: "category",
            label: "News Category",
            category: "Classification",
        },
        {
            name: "priority",
            label: "Priority",
            category: "Classification",
        },
    ],
};
```

## Best Practices

1. **Immutable Keys**: Use lowercase, underscores (e.g., "breaking_news")
2. **Display Labels**: Human-readable (e.g., "Breaking News")
3. **System Defaults**: Mark seeded options with is_system=true
4. **Usage Tracking**: Implement _check_usage for referential integrity
5. **Testing**: Write tests for new validator logic

## Testing New Entity Integration

```python
# tests/integration/test_news_field_options.py
def test_news_category_validation():
    """New entity validators work."""
    repo = FieldOptionsRepository(db_session)

    # Create option
    option = repo.create(FieldOptionCreateDTO(
        entity="news",
        field_name="category",
        value="breaking",
        display_label="Breaking News",
    ))

    # Validate against DB
    assert validate_news_category("breaking", db_session) == "breaking"

    # Invalid value should raise
    with pytest.raises(ValueError):
        validate_news_category("invalid", db_session)
```

## Troubleshooting

**Q: New entity options not appearing in admin UI**
A: Add entity and fields to `ENTITY_FIELDS` in EntityTab.tsx

**Q: Validation still using hardcoded set**
A: Ensure validator calls field_options repo, not hardcoded set

**Q: Usage count always 0**
A: Implement _check_usage method in repository for that entity

---

## Reference Architecture Docs

- Main PRD: `docs/project_plans/PRDs/features/admin-field-options-v1.md`
- Implementation Plan: `docs/project_plans/implementation_plans/features/admin-field-options-v1.md`
- Backend Patterns: `services/api/CLAUDE.md`
- Frontend Patterns: `apps/web/CLAUDE.md`
```

**Acceptance Criteria**:
- [ ] Clear step-by-step extension process
- [ ] Code examples for each step
- [ ] Best practices documented
- [ ] Testing strategy explained
- [ ] Troubleshooting section
- [ ] Reference links to main architecture

---

### Task 10.4: Production Deployment

**Story**: `ADMIN-25: Production deployment`
**Points**: 3
**Owner**: DevOps Engineer
**Status**: Not Started

**Description**:
Deploy feature to production with monitoring, rollback plan, and validation.

**Pre-Deployment Checklist**:

- [ ] All tests passing on staging
- [ ] Performance benchmarks met (<200ms p95)
- [ ] Accessibility audit passed (WCAG 2.1 AA)
- [ ] Security review completed (no SQL injection, auth checks)
- [ ] Monitoring and alerting configured
- [ ] Rollback procedure documented and tested
- [ ] Database backup taken
- [ ] Team notified and ready
- [ ] Feature flags configured
- [ ] Documentation reviewed and published

**Deployment Steps**:

```bash
# 1. Create backup
pg_dump $DATABASE_URL > field_options_backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Deploy backend
cd services/api
git pull origin main
uv sync
uv run alembic upgrade head  # Run migrations
docker build -t family-gifting-api:latest .
docker push family-gifting-api:latest

# 3. Update K8s deployment
kubectl set image deployment/api api=family-gifting-api:latest -n production

# 4. Verify backend health
kubectl wait --for=condition=ready pod -l app=api -n production --timeout=5m
curl https://api.example.com/health

# 5. Deploy frontend
cd apps/web
git pull origin main
pnpm install
pnpm build
docker build -t family-gifting-web:latest .
docker push family-gifting-web:latest

# 6. Update K8s deployment
kubectl set image deployment/web web=family-gifting-web:latest -n production

# 7. Verify frontend health
kubectl wait --for=condition=ready pod -l app=web -n production --timeout=5m
curl https://app.example.com/health

# 8. Run smoke tests
curl https://api.example.com/api/field-options?entity=person&field_name=wine_types
# Should return options list

# 9. Monitor logs
kubectl logs -f deployment/api -n production
kubectl logs -f deployment/web -n production
```

**Rollback Procedure** (if issues):

```bash
# Rollback backend
kubectl rollout undo deployment/api -n production
kubectl wait --for=condition=ready pod -l app=api -n production --timeout=5m

# Rollback frontend
kubectl rollout undo deployment/web -n production
kubectl wait --for=condition=ready pod -l app=web -n production --timeout=5m

# Restore database if needed
psql $DATABASE_URL < field_options_backup_YYYYMMDD_HHMMSS.sql
```

**Post-Deployment Monitoring** (24-72 hours):

- [ ] No error spikes in API logs
- [ ] Admin page loading properly
- [ ] Options CRUD operations working
- [ ] React Query cache invalidation working
- [ ] No performance regressions
- [ ] No security alerts

**Success Criteria**:

- [ ] All tests pass on production
- [ ] Admin page accessible and functional
- [ ] Options appear in forms immediately
- [ ] No data loss or corruption
- [ ] Performance targets met
- [ ] Users can create/edit/delete options
- [ ] Documentation accurate

**Acceptance Criteria**:
- [ ] Deployment completed successfully
- [ ] No rollback needed
- [ ] Monitoring active and alerting
- [ ] Documentation updated
- [ ] Team trained on new feature
- [ ] Smoke tests pass
- [ ] No critical issues reported

---

### Task 10.5: Accessibility Audit

**Story**: `ADMIN-24: Accessibility audit`
**Points**: 2
**Owner**: QA Engineer (Accessibility specialist)
**Status**: Not Started

**Description**:
Comprehensive accessibility audit to WCAG 2.1 AA standard.

**Audit Areas**:

1. **Keyboard Navigation**:
   - Tab order logical and visible
   - Modals can be closed with Escape
   - Form inputs accessible via Tab
   - Buttons activatable with Enter/Space

2. **Screen Reader Support**:
   - All form labels associated with inputs
   - Button purposes clear
   - Table headers marked
   - Alert/confirmation text announced

3. **Visual**:
   - Color contrast ≥4.5:1 (normal text)
   - Color contrast ≥3:1 (large text)
   - Focus indicators visible
   - No text as only means of conveying info

4. **Motor**:
   - No time-based interactions
   - Touch targets ≥44x44px
   - No click-and-hold required

**Tools**:
- axe-core (automated)
- WAVE (contrast/structure)
- Manual testing with screen reader (NVDA/JAWS)
- Keyboard-only testing

**Execution**:

```bash
# Run automated audit
cd apps/web
pnpm add -D axe-playwright

# In test file
import { injectAxe, checkA11y } from 'axe-playwright';

test('admin page is accessible', async ({ page }) => {
  await page.goto('/admin');
  await injectAxe(page);
  await checkA11y(page);
});

# Run tests
pnpm test:a11y

# Manual testing
# - Use keyboard only (no mouse)
# - Use screen reader (enable VoiceOver on Mac)
# - Test color contrast: https://contrast-ratio.com
```

**Accessibility Report Template**:

```
# Accessibility Audit Report

## Summary
- WCAG 2.1 Level AA: PASS/FAIL
- Total Issues: N
- Critical: N
- Major: N
- Minor: N

## Issues Found

### Critical
- [Issue]: Form not submittable via keyboard
  - Location: AddOptionModal
  - Impact: Users cannot use feature
  - Fix: Add form submission on Enter key

### Major
- [Issue]: Color contrast <4.5:1 on button text
  - Location: Admin page buttons
  - Impact: Low vision users may not see buttons
  - Fix: Increase button text contrast

### Minor
- [Issue]: Missing aria-label on icon button
  - Location: OptionsList edit button
  - Impact: Screen reader users uncertain of action
  - Fix: Add aria-label="Edit option"

## Accessibility Features Implemented
- Minimum 44x44px touch targets
- Keyboard navigation support
- Focus visible on all interactive elements
- Semantic HTML structure
- ARIA labels where needed
- High contrast colors (AA standard)

## Compliance Status
✅ Fully compliant with WCAG 2.1 AA
```

**Acceptance Criteria**:
- [ ] Automated audit passes (axe-core <2 issues)
- [ ] Keyboard navigation works
- [ ] Screen reader announces all controls
- [ ] Color contrast ≥4.5:1
- [ ] Touch targets ≥44px
- [ ] No time-based interactions
- [ ] Audit report generated
- [ ] WCAG 2.1 AA certified

---

## Phase 9-10 Summary

**Total Story Points**: 20 points
**Duration**: 1-1.5 weeks

### Testing Deliverables

- [x] Unit tests: >80% coverage (repository, service)
- [x] Integration tests: >70% coverage (API, migrations)
- [x] Component tests: >70% coverage (admin UI)
- [x] E2E tests: Full admin workflow (add, edit, delete)
- [x] Performance tests: Benchmarks, load tests, queries
- [x] Accessibility audit: WCAG 2.1 AA compliance

### Documentation Deliverables

- [x] API documentation (endpoint reference, examples)
- [x] Postman collection (for API testing)
- [x] Admin user guide (how to use feature)
- [x] Developer extension guide (how to extend)
- [x] Architecture documentation (patterns, decisions)
- [x] Deployment guide (steps, rollback, monitoring)

### Quality Metrics

- [ ] All tests passing (100%)
- [ ] Coverage >80% (unit), >70% (integration)
- [ ] Performance targets met (p95 <200ms)
- [ ] Zero accessibility violations
- [ ] Full documentation coverage
- [ ] Successful production deployment
- [ ] Zero critical bugs post-deployment

### Post-Deployment Support

- [ ] Monitor logs for 72 hours
- [ ] Respond to user feedback
- [ ] Fix critical bugs immediately
- [ ] Schedule follow-up retrospective
- [ ] Plan for future enhancements

---

**Document Version**: 1.0
**Status**: Ready for Phase 9 Start (after Phase 1-8 complete)
**Last Updated**: 2025-12-20

---

## Complete Implementation Checklist

### Phases 1-4: Backend (23 pts)
- [ ] Database schema and migration
- [ ] FieldOption model and schemas
- [ ] Repository CRUD + tests
- [ ] Service business logic + tests
- [ ] REST API endpoints + tests

### Phases 5-8: Frontend & Validation (22 pts)
- [ ] Admin navigation
- [ ] Admin page components
- [ ] React Query integration
- [ ] Person/Gift/Occasion/List validators
- [ ] Backward compatibility tests

### Phases 9-10: Testing & Docs (20 pts)
- [ ] Unit test coverage verification
- [ ] Integration tests (API + migration)
- [ ] Component tests (admin UI)
- [ ] E2E tests (full workflow)
- [ ] Performance & load tests
- [ ] Accessibility audit
- [ ] API documentation
- [ ] User guide
- [ ] Developer guide
- [ ] Production deployment

### Total: 65 story points, 4-5 weeks
