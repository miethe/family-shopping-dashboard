---
title: "Phase 6: Testing, Documentation & Deployment"
description: "Comprehensive testing, documentation, and deployment for person-occasion budgets"
audience: [developers, backend-engineers, frontend-engineers, qa-testers]
tags: [implementation, testing, documentation, deployment, quality-assurance]
created: 2025-12-07
updated: 2025-12-07
category: "product-planning"
status: active
---

# Phase 6-8: Testing, Documentation & Deployment

**Parent Plan**: [Person Budget per Occasion Implementation](../person-occasion-budgets-v1.md)

**Duration**: 2.5 days (1.5 + 0.5 + 0.5 days)
**Dependencies**: Phase 5 (UI components) complete
**Assigned Subagent(s)**: `code-reviewer`, `frontend-developer`, `python-backend-engineer`, `ui-engineer-enhanced`, `documentation-writer`
**Related PRD Stories**: POB-010 through POB-014

---

## Overview

This combined phase covers:

1. **Phase 6**: Comprehensive testing (unit, integration, E2E, accessibility, performance)
2. **Phase 7**: Documentation (API docs, component docs, migration notes)
3. **Phase 8**: Deployment and monitoring setup

---

## Phase 6: Testing & Quality Assurance (1.5 days, 21 story points)

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| TEST-001 | Backend Unit Tests | Complete unit tests for all layers | >80% coverage for repository, service, API | 3 pts | python-backend-engineer | Phase 5 |
| TEST-002 | Frontend Component Tests | Test all React components | All components tested; states covered | 3 pts | frontend-developer | TEST-001 |
| TEST-003 | E2E Budget CRUD | Test budget creation, read, update, delete flows | User can set budget → persists → updates → deletes | 3 pts | frontend-developer | TEST-002 |
| TEST-004 | E2E Progress Updates | Test progress bars update when gifts change | Add gift → progress updates; purchase → totals update | 2 pts | frontend-developer | TEST-003 |
| TEST-005 | E2E Budget Warnings | Test over-budget warnings appear correctly | Set budget $100 → spend $150 → red warning appears | 1 pt | frontend-developer | TEST-004 |
| TEST-006 | Accessibility Audit | WCAG 2.1 AA compliance testing | ARIA labels, keyboard nav, contrast ratios validated | 2 pts | ui-engineer-enhanced | TEST-005 |
| TEST-007 | Performance Testing | Test API response times and page load | Budget API <200ms; page load <1s | 1 pt | python-backend-engineer | TEST-006 |
| TEST-008 | Visual Regression | Compare budget UI across viewports | Screenshots match design specs | 1 pt | ui-engineer-enhanced | TEST-007 |
| TEST-009 | User Acceptance Testing | 2-3 family members test workflows | Users can complete all budget workflows successfully | 2 pts | code-reviewer | TEST-008 |
| TEST-010 | Bug Fixes & Polish | Fix issues found in testing | All P0/P1 bugs resolved; polish applied | 3 pts | all developers | TEST-009 |

**Total Phase 6 Effort**: 21 story points

### Implementation Details

#### TEST-001: Backend Unit Tests

**Status**: Already covered in Phase 2 (REPO-004) and Phase 3 (API-005)

**Additional Coverage**:
- Service layer ORM→DTO transformation
- Budget progress calculation edge cases (NULL budgets, 0 budgets, >100% progress)
- Error handling paths (validation errors, not found errors)

**Coverage Target**: >80% for all backend modules

#### TEST-002: Frontend Component Tests

**File**: `/apps/web/components/occasions/__tests__/PersonOccasionBudgetCard.test.tsx`

**Tests**:

```tsx
test('renders person info and budget inputs', () => {
  render(<PersonOccasionBudgetCard personId={1} occasionId={1} />);
  expect(screen.getByLabelText(/Budget for gifts to/i)).toBeInTheDocument();
});

test('auto-saves budget on input blur', async () => {
  const { user } = render(<PersonOccasionBudgetCard personId={1} occasionId={1} />);
  const input = screen.getByLabelText(/Budget for gifts to/i);

  await user.clear(input);
  await user.type(input, '200');
  await user.tab();  // Blur event

  await waitFor(() => {
    expect(screen.getByTestId('success-checkmark')).toBeInTheDocument();
  });
});

test('displays error message on save failure', async () => {
  // Mock API error
  server.use(
    rest.put('/api/persons/:personId/occasions/:occasionId/budget', (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({ error: { message: 'Validation error' } }));
    })
  );

  const { user } = render(<PersonOccasionBudgetCard personId={1} occasionId={1} />);
  const input = screen.getByLabelText(/Budget for gifts to/i);

  await user.clear(input);
  await user.type(input, '-100');
  await user.tab();

  await waitFor(() => {
    expect(screen.getByText(/Error:/i)).toBeInTheDocument();
  });
});
```

#### TEST-003: E2E Budget CRUD

**File**: `/apps/web/__tests__/e2e/budget-workflows.spec.ts`

**Tests**:

```typescript
import { test, expect } from '@playwright/test';

test('user sets budget for person on occasion', async ({ page }) => {
  await page.goto('/occasions/1');

  // Find person card
  const personCard = page.locator('[data-testid="person-budget-card-1"]');

  // Set recipient budget
  await personCard.getByLabel(/Budget for gifts to/i).fill('200');
  await personCard.getByLabel(/Budget for gifts to/i).blur();

  // Wait for success indicator
  await expect(personCard.getByTestId('success-checkmark')).toBeVisible();

  // Reload page and verify budget persists
  await page.reload();
  await expect(personCard.getByLabel(/Budget for gifts to/i)).toHaveValue('200');
});

test('user views budgets in person modal', async ({ page }) => {
  await page.goto('/dashboard');

  // Open person modal
  await page.click('[data-testid="person-card-1"]');

  // Navigate to Budgets tab
  await page.click('text=Budgets');

  // Verify occasions list
  await expect(page.getByText('Christmas 2024')).toBeVisible();
  await expect(page.getByLabel('Recipient Budget')).toBeVisible();
});
```

#### TEST-004: E2E Progress Updates

**Test**:

```typescript
test('progress bar updates when gifts added', async ({ page }) => {
  await page.goto('/occasions/1');

  // Set budget
  const personCard = page.locator('[data-testid="person-budget-card-1"]');
  await personCard.getByLabel(/Budget for gifts to/i).fill('200');
  await personCard.getByLabel(/Budget for gifts to/i).blur();

  // Initial progress should be $0/$200
  await expect(personCard.getByText('$0 / $200')).toBeVisible();

  // Add a gift worth $50
  await page.click('text=Add Gift');
  await page.fill('input[name="name"]', 'LEGO Set');
  await page.fill('input[name="price"]', '50');
  await page.selectOption('select[name="recipient"]', '1');  // Person 1
  await page.click('button:has-text("Save")');

  // Progress should update to $50/$200 (25%)
  await expect(personCard.getByText('$50 / $200')).toBeVisible();
  await expect(personCard.getByText('25%')).toBeVisible();
});
```

#### TEST-005: E2E Budget Warnings

**Test**:

```typescript
test('over-budget warning appears', async ({ page }) => {
  await page.goto('/occasions/1');

  // Set budget $100
  const personCard = page.locator('[data-testid="person-budget-card-1"]');
  await personCard.getByLabel(/Budget for gifts to/i).fill('100');
  await personCard.getByLabel(/Budget for gifts to/i).blur();

  // Add gift $150 (over budget)
  await page.click('text=Add Gift');
  await page.fill('input[name="price"]', '150');
  await page.selectOption('select[name="recipient"]', '1');
  await page.click('button:has-text("Save")');

  // Warning should appear
  await expect(personCard.getByText('Over budget')).toBeVisible();
  await expect(personCard.locator('.progress-bar.bg-red-600')).toBeVisible();
});
```

#### TEST-006: Accessibility Audit

**Tools**: axe-core, Lighthouse, WAVE

**Checks**:
- ARIA labels on all inputs
- Keyboard navigation works (tab, enter, escape)
- Color contrast ratios meet WCAG AA (4.5:1 for text)
- Screen reader announces budget values and progress

**Commands**:

```bash
pnpm test:a11y  # Run axe-core tests
lighthouse http://localhost:3000/occasions/1 --view  # Manual audit
```

#### TEST-007: Performance Testing

**Backend**: Use Apache Bench or k6 to test API endpoints

```bash
ab -n 1000 -c 10 http://localhost:8000/persons/1/occasions/1/budget
# Target: <200ms average response time
```

**Frontend**: Use Lighthouse to measure page load

```bash
lighthouse http://localhost:3000/occasions/1 --only-categories=performance
# Target: <1s First Contentful Paint
```

#### TEST-008: Visual Regression

**Tools**: Percy, Chromatic, or manual screenshots

**Viewports**: 375px (mobile), 768px (tablet), 1024px (desktop)

**States**: Empty budget, with budget, over budget, loading, error

#### TEST-009: User Acceptance Testing

**Participants**: 2-3 family members

**Scenarios**:
1. Set budgets for all persons in Christmas occasion
2. Add gifts and verify progress bars update
3. View budget history in person modal
4. Filter active/past occasions
5. Adjust budgets after overspending

**Success Criteria**: All participants complete workflows without errors

#### TEST-010: Bug Fixes & Polish

**Process**:
1. Triage bugs from testing phases (P0, P1, P2)
2. Fix P0/P1 bugs immediately
3. Polish UX based on feedback (loading states, animations, error messages)
4. Retest after fixes

### Phase 6 Quality Gates

- [x] Backend unit tests achieve >80% coverage
- [x] Frontend component tests cover all states
- [x] E2E tests pass for all critical budget workflows
- [x] Performance benchmarks met (<200ms API, <1s page load)
- [x] Accessibility audit passes WCAG 2.1 AA
- [x] Visual regression tests pass across viewports
- [x] User acceptance testing completed successfully
- [x] All P0/P1 bugs resolved

### Phase 6 Deliverables

- Backend unit tests: `/services/api/tests/unit/`
- Frontend component tests: `/apps/web/components/**/__tests__/`
- E2E tests: `/apps/web/__tests__/e2e/budget-workflows.spec.ts`
- Accessibility report: `.claude/progress/person-occasion-budgets-v1/a11y-audit.md`
- Performance report: `.claude/progress/person-occasion-budgets-v1/performance-report.md`

---

## Phase 7: Documentation (0.5 days, 3.5 story points)

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| DOC-001 | API Documentation | Document budget endpoints in OpenAPI | GET/PUT endpoints documented with examples | 1 pt | api-documenter | TEST-010 |
| DOC-002 | Component Documentation | Document PersonOccasionBudgetCard, PersonBudgetsTab | Components have JSDoc comments with usage examples | 1 pt | documentation-writer | DOC-001 |
| DOC-003 | Hook Documentation | Document usePersonOccasionBudget hooks | Hooks have JSDoc with params, returns, examples | 1 pt | documentation-writer | DOC-002 |
| DOC-004 | Migration Documentation | Add comments to Alembic migration | Migration script explains schema changes | 0.5 pts | documentation-writer | DOC-003 |

**Total Phase 7 Effort**: 3.5 story points

### Implementation Details

#### DOC-001: API Documentation

**Status**: OpenAPI auto-generated by FastAPI

**Manual Additions**: Add response examples to endpoints

```python
@router.get(
    "/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    responses={
        200: {
            "description": "Budget retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "person_id": 1,
                        "occasion_id": 1,
                        "recipient_budget_total": 200.00,
                        "purchaser_budget_total": 50.00,
                        "recipient_spent": 50.00,
                        "recipient_progress": 25.0,
                        "purchaser_spent": 0.00,
                        "purchaser_progress": 0.0
                    }
                }
            }
        },
        404: {
            "description": "Person-occasion link not found"
        }
    }
)
```

#### DOC-002: Component Documentation

**File**: `/apps/web/components/occasions/PersonOccasionBudgetCard.tsx`

**JSDoc**:

```tsx
/**
 * PersonOccasionBudgetCard Component
 *
 * Displays a person's budget card for a specific occasion with editable
 * budget inputs and real-time progress visualization.
 *
 * @component
 * @example
 * ```tsx
 * <PersonOccasionBudgetCard
 *   personId={1}
 *   occasionId={12}
 *   className="mb-4"
 * />
 * ```
 *
 * @param {number} personId - ID of the person
 * @param {number} occasionId - ID of the occasion
 * @param {string} [className] - Optional CSS classes
 *
 * Features:
 * - Auto-save on blur (500ms debounce)
 * - Loading/success/error states
 * - Responsive design (mobile-first)
 * - WCAG 2.1 AA compliant
 */
```

#### DOC-003: Hook Documentation

**File**: `/apps/web/hooks/usePersonOccasionBudget.ts`

**JSDoc**:

```typescript
/**
 * usePersonOccasionBudget Hook
 *
 * Fetches budget data for a person-occasion pair using React Query.
 *
 * @param {number} personId - ID of the person
 * @param {number} occasionId - ID of the occasion
 * @returns {UseQueryResult<PersonOccasionBudget, Error>} React Query result
 *
 * @example
 * ```tsx
 * const { data: budget, isLoading, error } = usePersonOccasionBudget(1, 12);
 *
 * if (isLoading) return <Spinner />;
 * if (error) return <Error message={error.message} />;
 *
 * return <BudgetDisplay budget={budget} />;
 * ```
 *
 * Caching:
 * - staleTime: 5 minutes
 * - refetchOnWindowFocus: true
 * - Query key: ['person-occasion-budget', personId, occasionId]
 */
```

#### DOC-004: Migration Documentation

**File**: `/services/api/alembic/versions/xxx_add_person_occasion_budgets.py`

**Comments**:

```python
"""Add budget fields to PersonOccasion table

Revision ID: xxx
Revises: yyy
Create Date: 2025-12-07

This migration extends the PersonOccasion junction table with two budget fields:
- recipient_budget_total: Budget for gifts TO this person for this occasion
- purchaser_budget_total: Budget for gifts BY this person for this occasion

Both fields are NUMERIC(10,2) and nullable (NULL = no budget limit).

Additionally, creates a composite index on (person_id, occasion_id) for
efficient budget queries.

Related PRD: /docs/project_plans/PRDs/features/person-occasion-budgets-v1.md
"""
```

### Phase 7 Quality Gates

- [x] OpenAPI documentation includes budget endpoints with examples
- [x] All React components have JSDoc comments
- [x] All hooks have JSDoc with usage examples
- [x] Alembic migration includes explanatory comments

### Phase 7 Deliverables

- OpenAPI docs: Auto-generated at `/docs` endpoint
- Component JSDoc: Inline in component files
- Hook JSDoc: Inline in hook files
- Migration comments: Inline in migration script

---

## Phase 8: Deployment & Monitoring (0.5 days, 4 story points)

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| DEPLOY-001 | Run Migration | Apply Alembic migration to production DB | Migration runs successfully; schema updated | 0.5 pts | python-backend-engineer | DOC-004 |
| DEPLOY-002 | Deploy Backend | Deploy API with budget endpoints to K8s | API endpoints accessible; health check passes | 1 pt | python-backend-engineer | DEPLOY-001 |
| DEPLOY-003 | Deploy Frontend | Deploy Next.js app with budget UI to K8s | Budget UI renders; API calls successful | 1 pt | frontend-developer | DEPLOY-002 |
| DEPLOY-004 | Smoke Testing | Verify critical budget workflows in production | User can set budget, view progress, update values | 1 pt | both developers | DEPLOY-003 |
| DEPLOY-005 | Monitoring Setup | Verify telemetry and logging working | Budget operations logged; spans appear in telemetry | 0.5 pts | python-backend-engineer | DEPLOY-004 |

**Total Phase 8 Effort**: 4 story points

### Implementation Details

#### DEPLOY-001: Run Migration

**Commands**:

```bash
# SSH into API pod
kubectl exec -it deployment/api -n family-gifting -- /bin/bash

# Run migration
cd /app
uv run alembic upgrade head

# Verify schema
uv run alembic current
```

**Rollback Plan**: `alembic downgrade -1` if issues occur

#### DEPLOY-002: Deploy Backend

**Process**:

```bash
# Build Docker image
cd services/api
docker build -t family-gifting-api:budget-v1 .

# Push to registry
docker push family-gifting-api:budget-v1

# Update K8s deployment
kubectl set image deployment/api api=family-gifting-api:budget-v1 -n family-gifting

# Verify rollout
kubectl rollout status deployment/api -n family-gifting
```

#### DEPLOY-003: Deploy Frontend

**Process**:

```bash
# Build Next.js app
cd apps/web
pnpm build

# Build Docker image
docker build -t family-gifting-web:budget-v1 .

# Push and deploy
docker push family-gifting-web:budget-v1
kubectl set image deployment/web web=family-gifting-web:budget-v1 -n family-gifting
kubectl rollout status deployment/web -n family-gifting
```

#### DEPLOY-004: Smoke Testing

**Tests**:
1. Navigate to /occasions/1 → Verify People section renders
2. Set budget for person → Verify auto-save works
3. Open person modal → Navigate to Budgets tab → Verify occasions list
4. Add gift → Verify progress bar updates
5. Check browser console for errors → None expected

#### DEPLOY-005: Monitoring Setup

**Verify**:
- OpenTelemetry spans appear in telemetry backend (Jaeger/Grafana)
- Structured logs include trace_id, person_id, occasion_id
- Budget API response times logged (should be <200ms)
- No error rate spikes after deployment

### Phase 8 Quality Gates

- [x] Database migration applied successfully in production
- [x] API endpoints accessible and returning correct data
- [x] Frontend UI renders and interacts with backend correctly
- [x] Smoke tests pass for all critical workflows
- [x] Monitoring and telemetry working as expected
- [x] No P0/P1 issues in first 24 hours post-deployment

### Phase 8 Deliverables

- Production database with budget schema
- Deployed API with budget endpoints
- Deployed frontend with budget UI
- Smoke test report
- Monitoring dashboard

---

## Combined Quality Gates (Phases 6-8)

All quality gates from phases 6, 7, and 8 must pass before feature is considered complete:

- [x] All tests passing (unit, integration, E2E)
- [x] Code coverage >80%
- [x] Accessibility audit passed
- [x] Performance benchmarks met
- [x] Documentation complete
- [x] Production deployment successful
- [x] No P0/P1 bugs post-launch

---

## Risk Mitigation

### Testing Phase Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| Testing phase uncovers major bugs | High | Medium | Allocate 1 day buffer in Phase 6; prioritize P0/P1 fixes |
| E2E tests flaky in CI/CD | Low | Medium | Use Playwright's auto-wait; add explicit wait conditions |
| Performance regression | Medium | Low | Track baseline metrics; alert on deviations |

### Deployment Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|------------|---------------------|
| Migration deployment requires downtime | Medium | Low | Plan deployment during low-traffic window; test on staging first |
| Rollback needed in production | High | Very Low | Have downgrade script ready; monitor error rates closely |
| Frontend-backend version mismatch | Medium | Low | Deploy backend first, then frontend; verify API compatibility |

---

## Next Steps

After Phase 8 completion, the feature is production-ready. Post-launch:

1. Monitor for issues in first 24 hours
2. Collect user feedback
3. Plan future enhancements based on usage data
4. Consider performance optimizations if needed

See parent plan for [post-implementation tracking and monitoring](../person-occasion-budgets-v1.md#post-implementation)
