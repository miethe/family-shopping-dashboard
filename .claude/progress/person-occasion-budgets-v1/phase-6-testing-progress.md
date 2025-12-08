---
type: progress
prd: person-occasion-budgets-v1
phase: 6
phase_name: Testing & Polish
status: completed
progress: 100
total_tasks: 6
completed_tasks: 6
story_points: 21
estimated_duration: 1.5 days
completed_at: 2025-12-08
tasks:
  - id: TEST-001
    title: E2E tests for budget CRUD
    status: completed
    assigned_to: frontend-developer
    dependencies: [UI-008]
    story_points: 5
    commit: e4d7134
    files:
      - apps/web/tests/e2e/person-occasion-budgets.spec.ts
    description: End-to-end tests for creating, reading, updating budgets
  - id: TEST-002
    title: E2E tests for progress updates
    status: completed
    assigned_to: frontend-developer
    dependencies: [UI-008]
    story_points: 4
    commit: e4d7134
    files:
      - apps/web/tests/e2e/person-occasion-budgets.spec.ts
    description: Test budget_spent updates when gifts added/removed
  - id: TEST-003
    title: Accessibility audit
    status: completed
    assigned_to: ui-engineer-enhanced
    dependencies: [UI-008]
    story_points: 3
    commit: e4d7134
    files:
      - apps/web/tests/e2e/accessibility.spec.ts
      - .claude/worknotes/person-occasion-budgets-v1/accessibility-audit.md
    description: Manual and automated accessibility testing (WCAG 2.1 AA 95%)
  - id: TEST-004
    title: Performance testing
    status: completed
    assigned_to: code-reviewer
    dependencies: [UI-008]
    story_points: 3
    commit: e4d7134
    files:
      - .claude/worknotes/person-occasion-budgets-v1/performance-report.md
    description: Query and rendering performance analysis (B+ grade 85/100)
  - id: TEST-005
    title: User acceptance testing
    status: completed
    assigned_to: documentation-writer
    dependencies: [TEST-001, TEST-002, TEST-003, TEST-004]
    story_points: 3
    commit: e4d7134
    files:
      - .claude/worknotes/person-occasion-budgets-v1/uat-testing.md
    description: 19 UAT test cases covering all user workflows
  - id: TEST-006
    title: Bug fixes and polish
    status: completed
    assigned_to: ui-engineer-enhanced
    dependencies: [TEST-005]
    story_points: 3
    commit: caf198a
    files:
      - apps/web/components/people/PersonBudgetBar.tsx
      - apps/web/components/people/PersonBudgetsTab.tsx
    description: Applied accessibility and performance fixes
---

# Phase 6: Testing & Polish

**Status**: Completed
**Last Updated**: 2025-12-08
**Completion**: 100%
**Story Points**: 21 / 0 remaining
**Estimated Duration**: 1.5 days

## Overview

Comprehensive testing and quality assurance for person-occasion budgets feature. This final phase ensures reliability, accessibility, performance, and user experience before release.

## Parallelization Strategy

### Batch 1: E2E Tests (Parallel - 9 story points, 0.5 days)
Can run in parallel:
- TEST-001: E2E tests for budget CRUD (5 pts)
- TEST-002: E2E tests for progress updates (4 pts)

### Batch 2: Quality Audits (Parallel - 6 story points, 0.5 days)
Can run in parallel after E2E tests:
- TEST-003: Accessibility audit (3 pts)
- TEST-004: Performance testing (3 pts)

### Batch 3: UAT & Fixes (Sequential - 6 story points, 0.5 days)
- TEST-005: User acceptance testing (3 pts, depends on TEST-001-004)
- TEST-006: Bug fixes (3 pts, depends on TEST-005)

**Total Duration**: 1.5 days (significant parallelization possible)

## Tasks

### TEST-001: E2E Tests for Budget CRUD ⏳ Pending
**Story Points**: 5
**Assigned To**: frontend-developer
**Dependencies**: UI-008
**Files**: `apps/web/e2e/person-occasion-budgets.spec.ts`

**Description**:
End-to-end tests for budget create, read, update, delete workflows using Playwright.

**Test Scenarios**:

**1. Create Budget**:
```typescript
test('user can set budget for person-occasion', async ({ page }) => {
  // Navigate to occasion page
  await page.goto('/occasions/1');

  // Find recipient card
  await page.getByRole('heading', { name: 'Mom' }).click();

  // Open budgets tab
  await page.getByRole('tab', { name: 'Budgets' }).click();

  // Find Christmas occasion budget
  const budgetCard = page.getByTestId('budget-card-christmas');

  // Enter budget amount
  await budgetCard.getByLabel('Budget amount').fill('150.00');

  // Wait for auto-save
  await page.waitForTimeout(1500);

  // Verify saved
  await expect(budgetCard.getByText('$150.00')).toBeVisible();
});
```

**2. Read Budget**:
```typescript
test('budget displays correctly on occasion page', async ({ page }) => {
  // Navigate to occasion with existing budget
  await page.goto('/occasions/1');

  // Verify budget bar shows for recipient
  const budgetBar = page.getByTestId('budget-bar-mom');
  await expect(budgetBar).toBeVisible();
  await expect(budgetBar.getByText('$150.00')).toBeVisible();
});
```

**3. Update Budget**:
```typescript
test('user can update existing budget', async ({ page }) => {
  // Navigate and open budget
  // ... (similar to create test)

  // Change amount
  await budgetCard.getByLabel('Budget amount').fill('200.00');

  // Wait for auto-save
  await page.waitForTimeout(1500);

  // Verify updated
  await expect(budgetCard.getByText('$200.00')).toBeVisible();

  // Reload page and verify persisted
  await page.reload();
  await expect(budgetCard.getByText('$200.00')).toBeVisible();
});
```

**4. Delete Budget** (set to null):
```typescript
test('user can remove budget', async ({ page }) => {
  // Navigate and open budget
  // ... (similar to update test)

  // Clear amount
  await budgetCard.getByLabel('Budget amount').clear();

  // Wait for auto-save
  await page.waitForTimeout(1500);

  // Verify shows "No budget set"
  await expect(budgetCard.getByText('No budget set')).toBeVisible();
});
```

**Acceptance Criteria**:
- [ ] All CRUD operations tested end-to-end
- [ ] Tests use Playwright best practices
- [ ] Tests use test IDs for stable selectors
- [ ] Tests verify UI state after operations
- [ ] Tests verify persistence (reload page)
- [ ] Tests handle loading states
- [ ] Tests run in CI/CD pipeline
- [ ] All tests pass consistently

---

### TEST-002: E2E Tests for Progress Updates ⏳ Pending
**Story Points**: 4
**Assigned To**: frontend-developer
**Dependencies**: UI-008
**Files**: `apps/web/e2e/person-occasion-budgets.spec.ts`

**Description**:
Test that budget_spent updates correctly when gifts are added, updated, or removed.

**Test Scenarios**:

**1. Add Gift Updates Spent**:
```typescript
test('adding gift updates budget spent', async ({ page }) => {
  // Set budget for Mom at Christmas
  // ... (use helper function)

  // Note current spent amount
  const initialSpent = await page
    .getByTestId('budget-card-christmas')
    .getByText(/Spent: \$[\d.]+/)
    .innerText();

  // Add gift for Mom
  await page.goto('/gifts/new');
  await page.getByLabel('Gift name').fill('Scarf');
  await page.getByLabel('Amount').fill('25.00');
  await page.getByLabel('For').selectOption('Mom');
  await page.getByLabel('Occasion').selectOption('Christmas');
  await page.getByRole('button', { name: 'Save' }).click();

  // Navigate back to budget
  await page.goto('/occasions/1');  // Christmas
  await page.getByRole('heading', { name: 'Mom' }).click();
  await page.getByRole('tab', { name: 'Budgets' }).click();

  // Verify spent increased by $25
  const budgetCard = page.getByTestId('budget-card-christmas');
  await expect(budgetCard.getByText(/Spent: \$25.00/)).toBeVisible();

  // Verify progress bar updated
  // ... (check progress bar percentage)
});
```

**2. Update Gift Amount Updates Spent**:
```typescript
test('updating gift amount updates budget spent', async ({ page }) => {
  // Add gift ($25) and verify budget
  // ... (use previous test as setup)

  // Edit gift amount to $50
  await page.goto('/gifts');
  await page.getByRole('link', { name: 'Scarf' }).click();
  await page.getByLabel('Amount').fill('50.00');
  await page.getByRole('button', { name: 'Save' }).click();

  // Navigate back to budget
  await page.goto('/occasions/1');
  await page.getByRole('heading', { name: 'Mom' }).click();
  await page.getByRole('tab', { name: 'Budgets' }).click();

  // Verify spent updated to $50
  const budgetCard = page.getByTestId('budget-card-christmas');
  await expect(budgetCard.getByText(/Spent: \$50.00/)).toBeVisible();
});
```

**3. Delete Gift Updates Spent**:
```typescript
test('deleting gift updates budget spent', async ({ page }) => {
  // Add gift and verify budget
  // ... (use setup)

  // Delete gift
  await page.goto('/gifts');
  await page.getByRole('link', { name: 'Scarf' }).click();
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.getByRole('button', { name: 'Confirm' }).click();

  // Navigate back to budget
  await page.goto('/occasions/1');
  await page.getByRole('heading', { name: 'Mom' }).click();
  await page.getByRole('tab', { name: 'Budgets' }).click();

  // Verify spent back to $0
  const budgetCard = page.getByTestId('budget-card-christmas');
  await expect(budgetCard.getByText(/Spent: \$0.00/)).toBeVisible();
});
```

**4. Over-Budget Warning Displays**:
```typescript
test('over-budget warning shows when spent exceeds budget', async ({ page }) => {
  // Set budget to $100
  // Add gifts totaling $120
  // ... (use helpers)

  // Navigate to budget
  await page.goto('/occasions/1');
  await page.getByRole('heading', { name: 'Mom' }).click();
  await page.getByRole('tab', { name: 'Budgets' }).click();

  // Verify over-budget warning
  const budgetCard = page.getByTestId('budget-card-christmas');
  await expect(budgetCard.getByRole('alert')).toBeVisible();
  await expect(budgetCard.getByText(/Budget exceeded by \$20.00/)).toBeVisible();

  // Verify progress bar is red
  const progressBar = budgetCard.getByRole('progressbar');
  await expect(progressBar).toHaveClass(/bg-red-500/);
});
```

**Acceptance Criteria**:
- [ ] Tests verify spent updates on gift create
- [ ] Tests verify spent updates on gift update
- [ ] Tests verify spent updates on gift delete
- [ ] Tests verify over-budget warning displays
- [ ] Tests verify progress bar updates correctly
- [ ] Tests handle async updates (wait for refetch)
- [ ] All tests pass consistently

---

### TEST-003: Accessibility Audit ⏳ Pending
**Story Points**: 3
**Assigned To**: ui-engineer-enhanced
**Dependencies**: UI-008
**Files**: `.claude/worknotes/person-occasion-budgets-v1/accessibility-audit.md`

**Description**:
Manual and automated accessibility testing to ensure WCAG 2.1 AA compliance.

**Automated Testing**:

**1. Axe Accessibility Tests**:
```typescript
// apps/web/e2e/accessibility.spec.ts

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('PersonOccasionBudgetCard has no accessibility violations', async ({ page }) => {
  await page.goto('/occasions/1');
  await page.getByRole('heading', { name: 'Mom' }).click();
  await page.getByRole('tab', { name: 'Budgets' }).click();

  const accessibilityScanResults = await new AxeBuilder({ page })
    .include('[data-testid="budget-card-christmas"]')
    .analyze();

  expect(accessibilityScanResults.violations).toEqual([]);
});
```

**2. Lighthouse Audit**:
```bash
# Run Lighthouse accessibility audit
npm run lighthouse -- --only-categories=accessibility /occasions/1
```

**Manual Testing Checklist**:

**Keyboard Navigation**:
- [ ] Tab through all interactive elements (inputs, buttons)
- [ ] Enter key activates buttons
- [ ] Escape key closes modals/dialogs
- [ ] Focus indicators visible and clear
- [ ] Tab order logical (top to bottom, left to right)

**Screen Reader Testing** (VoiceOver on macOS or NVDA on Windows):
- [ ] All form inputs have labels
- [ ] Budget amounts announced correctly
- [ ] Progress bar has accessible name and value
- [ ] Warnings announced with role="alert"
- [ ] Modal dialogs have aria-labelledby
- [ ] Tab panel labels announced

**Visual Accessibility**:
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
- [ ] Information not conveyed by color alone
- [ ] Focus indicators have 3:1 contrast
- [ ] Text resizable to 200% without loss of functionality
- [ ] No horizontal scrolling at 320px width

**Motor Accessibility**:
- [ ] Touch targets at least 44x44px
- [ ] Sufficient spacing between interactive elements
- [ ] No time limits on interactions
- [ ] Error recovery possible (undo auto-save)

**Cognitive Accessibility**:
- [ ] Clear, consistent labeling
- [ ] Error messages descriptive and actionable
- [ ] No flashing content (seizure risk)
- [ ] Predictable navigation and behavior

**Audit Report Format**:
```markdown
# Accessibility Audit: Person-Occasion Budgets

## Automated Testing
- Axe violations: 0
- Lighthouse score: 98/100

## Manual Testing
### Keyboard Navigation: PASS
- All interactive elements reachable
- Focus indicators visible
- Logical tab order

### Screen Reader: PASS
- Labels announced correctly
- Alert regions working
- Modal dialogs accessible

### Visual: PASS
- Color contrast: 4.6:1 (body text)
- Resizable text: Works up to 200%
- No color-only information

### Motor: PASS
- Touch targets: 44x44px minimum
- Spacing adequate

### Cognitive: PASS
- Clear labels
- Helpful error messages

## Issues Found
None

## Recommendations
- Consider adding skip links for long budget lists
```

**Acceptance Criteria**:
- [ ] Axe tests pass (0 violations)
- [ ] Lighthouse accessibility score >= 95
- [ ] All manual checklist items pass
- [ ] Screen reader testing completed
- [ ] Audit report documented
- [ ] Any issues fixed or documented as known limitations

---

### TEST-004: Performance Testing ⏳ Pending
**Story Points**: 3
**Assigned To**: code-reviewer
**Dependencies**: UI-008
**Files**: `.claude/worknotes/person-occasion-budgets-v1/performance-report.md`

**Description**:
Test query performance, rendering performance, and overall system performance with budgets.

**Database Query Performance**:

**1. Test Query Execution Time**:
```sql
-- Test query: Get person-occasion budget
EXPLAIN ANALYZE
SELECT * FROM person_occasions
WHERE person_id = 1 AND occasion_id = 2;

-- Expected: Index scan, < 1ms execution time
-- Verify composite index is used: idx_person_occasion_budget

-- Test query: Get gift budget for person-occasion
EXPLAIN ANALYZE
SELECT SUM(gp.amount) AS total_spent
FROM gift_person gp
JOIN gifts g ON g.id = gp.gift_id
JOIN lists l ON l.id = g.list_id
WHERE gp.person_id = 1 AND l.occasion_id = 2;

-- Expected: < 10ms for 100 gifts
```

**2. Load Testing**:
```bash
# Simulate 100 concurrent budget requests
ab -n 1000 -c 100 http://localhost:8000/api/v1/persons/1/occasions/2/budget

# Expected:
# - 99th percentile < 100ms
# - 0% error rate
# - Throughput > 100 req/sec
```

**Frontend Rendering Performance**:

**1. Lighthouse Performance Audit**:
```bash
npm run lighthouse -- --only-categories=performance /occasions/1

# Expected scores:
# - Performance: >= 90
# - FCP (First Contentful Paint): < 1.8s
# - LCP (Largest Contentful Paint): < 2.5s
# - TBT (Total Blocking Time): < 200ms
```

**2. React DevTools Profiler**:
- Record rendering of PersonBudgetsTab with 10 occasions
- Verify no unnecessary re-renders
- Verify memo/useMemo usage for expensive calculations

**3. Bundle Size**:
```bash
npm run build
npm run analyze

# Verify:
# - No significant increase in bundle size
# - Tree-shaking working (no unused code)
# - Code-splitting effective (budget components in separate chunk)
```

**Memory Testing**:

**1. Browser Memory Profiler**:
- Open DevTools > Memory
- Take heap snapshot
- Navigate through budget pages
- Take another snapshot
- Verify no memory leaks (detached DOM nodes)

**2. Backend Memory**:
```bash
# Monitor API memory usage during load test
docker stats api-container

# Expected:
# - Memory usage stable (no leaks)
# - < 500MB for 2-3 users
```

**Performance Report Format**:
```markdown
# Performance Report: Person-Occasion Budgets

## Database Performance
### Query Execution
- Get budget: 0.5ms (Index scan ✓)
- Calculate spent: 8ms (100 gifts)
- Composite index used: ✓

### Load Testing
- Throughput: 150 req/sec
- 99th percentile: 85ms
- Error rate: 0%

## Frontend Performance
### Lighthouse Scores
- Performance: 94/100
- FCP: 1.2s
- LCP: 1.8s
- TBT: 120ms

### Rendering
- PersonBudgetsTab (10 budgets): 45ms
- No unnecessary re-renders detected

### Bundle Size
- Total increase: +12KB (gzipped)
- Code-splitting effective

## Memory
- Browser heap: Stable (no leaks)
- API memory: 320MB average

## Recommendations
- Consider pagination for users with >20 occasions
- Add memo to BudgetProgress component
```

**Acceptance Criteria**:
- [ ] Database queries use composite index
- [ ] Query execution time < 10ms
- [ ] API load test: 99th percentile < 100ms
- [ ] Lighthouse performance score >= 90
- [ ] No memory leaks detected
- [ ] Bundle size increase acceptable (< 20KB gzipped)
- [ ] Performance report documented

---

### TEST-005: User Acceptance Testing ⏳ Pending
**Story Points**: 3
**Assigned To**: frontend-developer
**Dependencies**: TEST-001, TEST-002, TEST-003, TEST-004
**Files**: `.claude/worknotes/person-occasion-budgets-v1/uat-checklist.md`

**Description**:
Manual testing of all user workflows to ensure feature meets requirements and provides good UX.

**UAT Checklist**:

**User Story 1: Set Budget for Person-Occasion**:
- [ ] Navigate to occasion page
- [ ] View list of recipients
- [ ] See budget section for each recipient
- [ ] Click to edit budget amount
- [ ] Enter budget amount (e.g., $150)
- [ ] Budget saves automatically
- [ ] Budget displays correctly
- [ ] Success feedback visible

**User Story 2: View Budget Progress**:
- [ ] Set budget for person-occasion
- [ ] Add gifts for that person-occasion
- [ ] View budget progress bar
- [ ] Verify spent amount updates
- [ ] Verify remaining amount updates
- [ ] Verify progress percentage correct
- [ ] Visual feedback clear and intuitive

**User Story 3: Manage Budgets Across Occasions**:
- [ ] Open person detail modal
- [ ] Navigate to "Budgets" tab
- [ ] View all budgets for person across occasions
- [ ] Edit budgets inline
- [ ] See which occasions have budgets set
- [ ] See which occasions don't have budgets
- [ ] Easy to compare budgets across occasions

**User Story 4: Over-Budget Warning**:
- [ ] Set budget (e.g., $100)
- [ ] Add gifts exceeding budget (e.g., $120)
- [ ] Warning displayed prominently
- [ ] Warning shows amount over budget
- [ ] Warning color-coded (red)
- [ ] Warning doesn't block interaction
- [ ] Can still add more gifts (no hard limit)

**User Story 5: Update and Remove Budgets**:
- [ ] Update existing budget amount
- [ ] Changes save automatically
- [ ] Changes reflected immediately
- [ ] Remove budget (clear amount)
- [ ] Shows "No budget set"
- [ ] Can re-add budget later

**User Story 6: Mobile Experience**:
- [ ] All workflows work on mobile (iOS Safari, Chrome)
- [ ] Touch targets adequate (easy to tap)
- [ ] No horizontal scrolling
- [ ] Forms work with on-screen keyboard
- [ ] Auto-save works on mobile
- [ ] Performance acceptable on mobile

**Edge Cases**:
- [ ] Budget amount of $0
- [ ] Very large budget amounts ($1,000,000+)
- [ ] Negative gift amounts (refunds)
- [ ] Multiple currencies (if supported)
- [ ] Person with no occasions
- [ ] Occasion with no recipients
- [ ] Slow network (auto-save behavior)
- [ ] Offline mode (error handling)

**UX Evaluation**:
- [ ] Workflows intuitive (no training needed)
- [ ] Visual hierarchy clear
- [ ] Feedback timely and appropriate
- [ ] Error messages helpful
- [ ] Loading states smooth
- [ ] No jarring layout shifts
- [ ] Consistent with rest of app

**UAT Report Format**:
```markdown
# UAT Report: Person-Occasion Budgets

## Test Environment
- Date: 2025-12-XX
- Tester: [Name]
- Devices: MacBook Pro, iPhone 14, iPad
- Browsers: Safari, Chrome

## Results
### User Stories: 6/6 PASS
- Set budget: PASS
- View progress: PASS
- Manage across occasions: PASS
- Over-budget warning: PASS
- Update/remove budgets: PASS
- Mobile experience: PASS

### Edge Cases: 8/8 PASS
(All tested and handled appropriately)

### UX Evaluation: PASS
- Intuitive: ✓
- Clear feedback: ✓
- Smooth performance: ✓

## Issues Found
1. Minor: Budget notes placeholder text unclear
   - Severity: Low
   - Recommendation: Change to "Optional notes about this budget"

## Approval
- Ready for release: YES
- Blockers: None
```

**Acceptance Criteria**:
- [ ] All user stories tested and pass
- [ ] Edge cases tested and handled
- [ ] Mobile experience verified on iOS and Android
- [ ] UX evaluated and acceptable
- [ ] UAT report documented
- [ ] Any critical issues fixed before approval

---

### TEST-006: Bug Fixes and Polish ⏳ Pending
**Story Points**: 3
**Assigned To**: ui-engineer-enhanced
**Dependencies**: TEST-005
**Files**: Various files based on findings

**Description**:
Address issues found during testing phases (TEST-001 through TEST-005).

**Bug Fix Process**:

**1. Triage Issues**:
- Critical: Blocks core functionality (fix immediately)
- High: Impacts UX significantly (fix before release)
- Medium: Minor UX issues (fix if time permits)
- Low: Nice-to-have improvements (backlog)

**2. Fix and Verify**:
- Reproduce issue
- Identify root cause
- Implement fix
- Add regression test
- Verify fix works
- Document in git commit

**3. Polish Items** (common):
- Loading state improvements
- Error message clarity
- Visual alignment tweaks
- Animation smoothness
- Keyboard shortcut additions
- Tooltip additions for clarity

**Example Bug Fixes**:

**Bug: Auto-save triggers too frequently**:
```typescript
// Before: Debounce 500ms (too fast)
const debouncedSave = debounce(save, 500);

// After: Debounce 1000ms
const debouncedSave = debounce(save, 1000);
```

**Bug: Over-budget warning not dismissible**:
```typescript
// Add dismiss button to alert
<Alert variant="warning">
  <AlertCircle className="h-4 w-4" />
  <AlertDescription>Budget exceeded by ${overAmount}</AlertDescription>
  <button onClick={() => setDismissed(true)} aria-label="Dismiss warning">
    <X className="h-4 w-4" />
  </button>
</Alert>
```

**Polish: Add loading skeleton to budget card**:
```typescript
if (isLoading) {
  return (
    <div className="space-y-2 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      <div className="h-2 bg-gray-200 rounded"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] All critical and high severity issues fixed
- [ ] Medium severity issues fixed if time permits
- [ ] Regression tests added for fixed bugs
- [ ] Visual polish applied (loading states, animations)
- [ ] Error messages improved based on testing feedback
- [ ] Code reviewed and approved
- [ ] All tests still pass after fixes

---

## Quick Reference

### Pre-built Task Commands

```python
# TEST-001: E2E tests for budget CRUD
Task("frontend-developer", """
Write E2E tests for budget CRUD operations.

File: apps/web/e2e/person-occasion-budgets.spec.ts

Test scenarios:
1. Create budget: User sets budget for person-occasion
2. Read budget: Budget displays on occasion page
3. Update budget: User changes budget amount
4. Delete budget: User clears budget (sets to null)

Use Playwright:
- await page.goto(...)
- await page.getByRole(...)
- await expect(...).toBeVisible()
- await page.waitForTimeout(1500) for auto-save

Verify:
- UI state after operations
- Persistence (reload page)
- Loading states

Follow existing E2E test patterns in apps/web/e2e/
""")

# TEST-002: E2E tests for progress updates
Task("frontend-developer", """
Write E2E tests for budget progress updates.

File: apps/web/e2e/person-occasion-budgets.spec.ts

Test scenarios:
1. Add gift → budget spent increases
2. Update gift amount → budget spent updates
3. Delete gift → budget spent decreases
4. Over-budget → warning displays

Verify:
- Spent amount updates correctly
- Progress bar updates
- Over-budget warning appears
- Progress bar turns red when over budget

Use Playwright, follow existing patterns.
Create helper functions for common setup (set budget, add gift).
""")

# TEST-003: Accessibility audit
Task("ui-engineer-enhanced", """
Perform accessibility audit for person-occasion budgets.

Automated tests:
1. Add Axe tests to apps/web/e2e/accessibility.spec.ts
2. Run Lighthouse audit

Manual testing:
1. Keyboard navigation (Tab, Enter, Escape)
2. Screen reader testing (VoiceOver or NVDA)
3. Visual accessibility (color contrast, text resize)
4. Motor accessibility (touch targets, spacing)
5. Cognitive accessibility (clear labels, error messages)

Document findings in:
.claude/worknotes/person-occasion-budgets-v1/accessibility-audit.md

Target: WCAG 2.1 AA compliance
Lighthouse accessibility score >= 95
""")

# TEST-004: Performance testing
Task("code-reviewer", """
Perform performance testing for person-occasion budgets.

Database performance:
1. Run EXPLAIN ANALYZE on budget queries
2. Verify composite index usage
3. Load test API endpoints (ab or similar)

Frontend performance:
1. Lighthouse performance audit
2. React DevTools Profiler (check re-renders)
3. Bundle size analysis (npm run analyze)

Memory testing:
1. Browser heap snapshots (check for leaks)
2. Monitor API memory usage

Document findings in:
.claude/worknotes/person-occasion-budgets-v1/performance-report.md

Targets:
- Query time < 10ms
- Lighthouse performance >= 90
- No memory leaks
""")

# TEST-005: User acceptance testing
Task("frontend-developer", """
Perform user acceptance testing for person-occasion budgets.

Test all user stories:
1. Set budget for person-occasion
2. View budget progress
3. Manage budgets across occasions
4. Over-budget warning
5. Update and remove budgets
6. Mobile experience

Test edge cases:
- $0 budget, very large amounts, negative amounts
- Person with no occasions
- Slow network, offline mode

Evaluate UX:
- Intuitive workflows
- Clear feedback
- Smooth performance

Document in:
.claude/worknotes/person-occasion-budgets-v1/uat-checklist.md

Test on multiple devices and browsers.
""")

# TEST-006: Bug fixes and polish
Task("ui-engineer-enhanced", """
Fix bugs and polish found during testing.

Process:
1. Review issues from TEST-001 through TEST-005
2. Triage by severity (critical, high, medium, low)
3. Fix critical and high severity issues
4. Add regression tests for fixed bugs
5. Apply polish (loading states, animations, error messages)

Common fixes:
- Auto-save debounce timing
- Warning dismissibility
- Loading skeletons
- Error message clarity
- Visual alignment

Ensure all tests still pass after fixes.
Code review before completing phase.
""")
```

### File Locations

```
apps/web/
└── e2e/
    ├── person-occasion-budgets.spec.ts     # TEST-001, TEST-002
    └── accessibility.spec.ts               # TEST-003 (add to existing)

.claude/
└── worknotes/
    └── person-occasion-budgets-v1/
        ├── accessibility-audit.md          # TEST-003
        ├── performance-report.md           # TEST-004
        └── uat-checklist.md                # TEST-005

Various files based on bug fixes                # TEST-006
```

### Testing Commands

```bash
# E2E tests
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web
npm run test:e2e -- person-occasion-budgets.spec.ts

# Accessibility tests
npm run test:e2e -- accessibility.spec.ts

# Lighthouse audit
npm run lighthouse -- --only-categories=accessibility,performance /occasions/1

# Load testing (from services/api directory)
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/services/api
ab -n 1000 -c 100 http://localhost:8000/api/v1/persons/1/occasions/2/budget

# Database query analysis (connect to PostgreSQL)
psql -d family_gifting_dev
# Then run EXPLAIN ANALYZE queries

# Bundle analysis
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web
npm run build
npm run analyze
```

## Context for AI Agents

### Testing Philosophy

**Test Pyramid**:
- **Unit Tests (60%)**: Services, hooks, utilities (Phases 2-4)
- **Integration Tests (30%)**: API endpoints, components (Phases 3-5)
- **E2E Tests (10%)**: Critical user workflows (Phase 6)

**Why E2E in Final Phase**:
- Tests real user workflows across full stack
- Catches integration issues missed by unit/integration tests
- Validates feature works end-to-end
- More expensive to write/run, so focus on critical paths

### Playwright Best Practices

**Stable Selectors**:
```typescript
// Good: Role-based, resilient to DOM changes
await page.getByRole('button', { name: 'Save' })

// Good: Test IDs for custom components
await page.getByTestId('budget-card-christmas')

// Bad: CSS selectors, brittle
await page.locator('.budget-card > .amount')
```

**Waiting Strategies**:
```typescript
// Auto-wait (built into Playwright actions)
await page.click('button') // Waits for button to be visible and enabled

// Explicit wait for assertion
await expect(page.getByText('Saved')).toBeVisible()

// Wait for network (auto-save)
await page.waitForResponse(resp => resp.url().includes('/budget'))

// Timeout wait (use sparingly)
await page.waitForTimeout(1500)
```

### Accessibility Testing Tools

**Automated** (catches ~30% of issues):
- **Axe**: Best-in-class automated testing
- **Lighthouse**: Google's audit tool
- **WAVE**: Browser extension

**Manual** (catches remaining ~70%):
- **Keyboard navigation**: Tab through UI
- **Screen reader**: VoiceOver (macOS), NVDA (Windows)
- **Color contrast**: Contrast ratio checker
- **Zoom**: Resize text to 200%

**WCAG 2.1 AA Key Requirements**:
- Text contrast: 4.5:1 (normal), 3:1 (large)
- All functionality keyboard accessible
- Focus indicators visible
- Alt text for images
- Form labels for inputs
- No seizure-inducing flashing

### Performance Benchmarks

**Database Queries**:
- Simple SELECT by ID: < 1ms
- JOIN with filter: < 10ms
- Aggregation (SUM): < 20ms
- Index scan vs. Sequential scan (use EXPLAIN ANALYZE)

**API Response Times**:
- 50th percentile: < 50ms
- 95th percentile: < 100ms
- 99th percentile: < 200ms

**Frontend Lighthouse Scores**:
- Performance: >= 90
- Accessibility: >= 95
- Best Practices: >= 90
- SEO: >= 90

**Core Web Vitals**:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1

### UAT vs. QA Testing

**QA Testing** (TEST-001 through TEST-004):
- Technical validation
- Automated where possible
- Focuses on functionality, performance, accessibility
- Done by developers/QA engineers

**UAT (TEST-005)**:
- Business validation
- Manual testing
- Focuses on user experience, workflows, requirements
- Simulates real user behavior
- Final approval before release

## Integration Points

### Testing Dependencies
- **Backend running**: API must be available for E2E tests
- **Test database**: Separate DB for test data
- **Test users**: Fixture data (persons, occasions, gifts)
- **CI/CD**: E2E tests run in pipeline

### Bug Tracking
- **Critical bugs**: Block release, fix immediately
- **GitHub Issues**: Track non-critical bugs for future sprints
- **Regression tests**: Add test for each fixed bug

## Completion Criteria

Phase 6 (and entire feature) is complete when:
- [ ] All E2E tests pass
- [ ] Accessibility audit passes (score >= 95)
- [ ] Performance benchmarks met
- [ ] UAT completed and approved
- [ ] All critical/high bugs fixed
- [ ] Regression tests added
- [ ] Documentation updated
- [ ] Feature merged to main branch
- [ ] Deployed to production

## Next Steps

After Phase 6 completion:
1. **Deploy to production** (K8s cluster)
2. **Monitor** (logs, metrics, user feedback)
3. **Iterate** based on real-world usage
4. **Backlog** for medium/low priority improvements

## References

- **PRD**: `/docs/project_plans/PRDs/features/person-occasion-budgets-v1.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/person-occasion-budgets-v1.md`
- **All Phases**: `.claude/progress/person-occasion-budgets-v1/`
- **Playwright Docs**: https://playwright.dev/
- **Axe Docs**: https://github.com/dequelabs/axe-core
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/
