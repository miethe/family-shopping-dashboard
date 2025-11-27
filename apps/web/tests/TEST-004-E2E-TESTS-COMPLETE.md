# TEST-004: E2E Tests - COMPLETE

## Overview

Comprehensive Playwright E2E test suite for Family Gifting Dashboard covering all 4 critical user journeys from the PRD.

## Deliverables

### Test Files Created

1. **playwright.config.ts** - Playwright configuration
   - Desktop and mobile viewports (Chrome, Safari, iOS, Android)
   - Auth state persistence
   - Local dev server integration
   - HTML reporter with screenshots/videos on failure

2. **tests/e2e/auth.setup.ts** - Authentication setup
   - Mock authentication for testing (until real auth is implemented)
   - Two user contexts for multi-user WebSocket tests
   - Saves auth state to `tests/.auth/` for reuse

3. **tests/e2e/use-case-1-capture-idea.spec.ts** - UC1: Capture a Gift Idea
   - Test Quick Add FAB button
   - Test header Quick Add button
   - Test navigate to list and add directly
   - Test IDEA status badge display

4. **tests/e2e/use-case-2-plan-occasion.spec.ts** - UC2: Plan an Occasion
   - Test create occasion
   - Test create people
   - Test create lists for people
   - Test add gift ideas to lists
   - Test view on dashboard
   - Test navigate to occasion detail

5. **tests/e2e/use-case-3-realtime.spec.ts** - UC3: Real-Time Coordination
   - Test status changes sync between users via WebSocket
   - Test list item additions sync in real-time
   - Test list item deletions sync in real-time
   - Test WebSocket connection indicator
   - Uses two browser contexts to simulate concurrent users

6. **tests/e2e/use-case-4-progress.spec.ts** - UC4: View Progress
   - Test pipeline summary on dashboard
   - Test detailed stats for each stage
   - Test navigate to occasion detail
   - Test per-person progress
   - Test person detail with gift status
   - Test my assignments page
   - Test filter/sort by status
   - Test progress updates when status changes

### Configuration Files Updated

7. **package.json** - Added Playwright dependency and scripts
   - `pnpm test:e2e` - Run all E2E tests
   - `pnpm test:e2e:ui` - Run with UI mode
   - `pnpm test:e2e:headed` - Run with browser visible
   - `pnpm test:e2e:debug` - Run in debug mode
   - `pnpm test:e2e:report` - View HTML report

8. **.gitignore** - Added Playwright artifacts
   - `/playwright-report`
   - `/test-results`
   - `/tests/.auth`

## Test Coverage

### Use Case 1: Capture a Gift Idea (4 tests)
- Quick Add via FAB button
- Quick Add via header button
- Navigate to list and add idea
- Verify IDEA status badge

### Use Case 2: Plan an Occasion (6 tests)
- Create occasion and view on dashboard
- Create people
- Create lists for people
- Add gift ideas to lists
- View complete occasion on dashboard
- Navigate from dashboard to occasion detail

### Use Case 3: Real-Time Coordination (4 tests)
- Sync status changes between users
- Show WebSocket connection indicator
- Sync list item additions
- Sync list item deletions

### Use Case 4: View Progress (8 tests)
- Show pipeline summary on dashboard
- Show detailed stats for each stage
- Navigate to occasion detail
- Show per-person progress
- Show person detail with gift status
- Show my assignments page
- Filter list items by status
- Update progress when status changes

**Total: 22 E2E tests covering all 4 critical user journeys**

## Running Tests

### Prerequisites

```bash
cd apps/web
pnpm install
pnpm exec playwright install  # First time only - installs browsers
```

### Run Tests

```bash
# Run all tests (headless)
pnpm test:e2e

# Run with UI mode (interactive)
pnpm test:e2e:ui

# Run with browser visible
pnpm test:e2e:headed

# Run in debug mode
pnpm test:e2e:debug

# View HTML report
pnpm test:e2e:report

# Run specific test file
pnpm exec playwright test use-case-1-capture-idea.spec.ts

# Run specific test by name
pnpm exec playwright test -g "should capture idea via Quick Add"

# Run only on mobile
pnpm exec playwright test --project=mobile-chrome

# Run only on desktop
pnpm exec playwright test --project=chromium
```

### CI/CD Integration

```yaml
# .github/workflows/e2e-tests.yml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm exec playwright install --with-deps
      - run: pnpm test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Data-testid Attributes Required

The following `data-testid` attributes need to be added to components for optimal test reliability:

### QuickAddModal.tsx
```tsx
- data-testid="quick-add-modal"
- data-testid="gift-name-input"
- data-testid="gift-description-input"
- data-testid="gift-price-input"
- data-testid="submit-button"
```

### GiftCard.tsx
```tsx
- data-testid="gift-card"
- data-testid="gift-name"
- data-status={gift.status}
```

### GiftDetail.tsx
```tsx
- data-testid="gift-status"
- data-testid="gift-detail"
```

### ListItemRow.tsx
```tsx
- data-testid="list-item"
- data-testid="list-item-name"
- data-testid="status-button"
- data-testid="move-to-selected"
- data-testid="move-to-idea"
- data-testid="delete-item"
- data-status={item.status}
- data-item-id={item.id}
```

### ListCard.tsx
```tsx
- data-testid="list-card"
- data-testid="list-name"
- data-testid="list-progress"
- data-progress-value={value}
- data-progress-max={max}
```

### ListDetail.tsx
```tsx
- data-testid="list-detail"
- data-testid="list-name"
- data-testid="list-items"
```

### PrimaryOccasion.tsx
```tsx
- data-testid="primary-occasion"
- data-testid="occasion-name"
- data-testid="occasion-date"
```

### PipelineSummary.tsx
```tsx
- data-testid="pipeline-summary"
- data-testid="ideas-count"
- data-testid="selected-count"
- data-testid="purchased-count"
- data-testid="received-count"
- data-testid="my-assignments-count"
```

### PeopleNeeding.tsx
```tsx
- data-testid="people-needing"
- data-testid="person-card"
```

### OccasionCard.tsx
```tsx
- data-testid="occasion-card"
- data-testid="occasion-name"
```

### OccasionDetail.tsx
```tsx
- data-testid="occasion-detail"
- data-testid="occasion-lists"
- data-testid="occasion-progress"
```

### PersonCard.tsx
```tsx
- data-testid="person-card"
- data-testid="person-name"
```

### PersonDetail.tsx
```tsx
- data-testid="person-detail"
- data-testid="person-lists"
- data-testid="person-info"
```

### PipelineView.tsx
```tsx
- data-testid="pipeline-view"
- data-testid="idea-section"
- data-testid="selected-section"
- data-testid="purchased-section"
- data-testid="received-section"
```

### AssignmentList.tsx
```tsx
- data-testid="assignments-list"
- data-testid="assignment-card"
- data-testid="assignment-person"
- data-testid="assignment-status"
```

### ConnectionIndicator.tsx
```tsx
- data-testid="ws-connection-indicator"
- data-connection-state={state} // "connected", "connecting", "disconnected"
```

### Progress Components
```tsx
- data-testid="progress-bar"
- data-testid="progress-indicator"
- role="progressbar" (standard ARIA)
- aria-valuenow={current}
- aria-valuemax={max}
```

### Form Buttons
```tsx
- data-testid="create-occasion-button"
- data-testid="create-person-button"
- data-testid="create-list-button"
```

## Test Strategy

### Test Pyramid
- **E2E Tests (10%)**: Critical user journeys (these tests)
- **Integration Tests (30%)**: Component integration, API integration
- **Unit Tests (60%)**: Individual functions, utilities, hooks

### Mobile-First Approach
All tests run on both desktop and mobile viewports:
- Desktop Chrome (1280x720)
- Mobile Chrome (Pixel 5)
- Desktop Safari (1280x720)
- Mobile Safari (iPhone 13)

### Real-Time Testing
Use Case 3 tests use two browser contexts to simulate:
- Two users viewing the same list simultaneously
- Real-time synchronization via WebSocket
- Latency expectations (<3 seconds for updates)

### Accessibility Testing
Tests use:
- `aria-label` for button identification
- `role` attributes for modal/dialog detection
- Semantic HTML for navigation

## Known Limitations

### Mock Authentication
- Auth setup currently uses mock tokens (see `auth.setup.ts`)
- Update when real authentication is implemented
- Mock creates two users for WebSocket multi-user tests

### API Dependency
- Tests require backend API to be running
- Configure `NEXT_PUBLIC_API_URL` environment variable
- Tests will fail if API is not available

### WebSocket Dependency
- Real-time tests require WebSocket server
- Configure `NEXT_PUBLIC_WS_URL` environment variable
- Tests may timeout if WebSocket connection fails

### Data State
- Tests expect certain data to exist (occasions, people, lists)
- Consider adding test data seed scripts
- Tests create test data but may interfere with each other

## Future Enhancements

1. **Test Data Management**
   - Add test data seeding scripts
   - Database cleanup between test runs
   - Test isolation improvements

2. **Visual Regression Testing**
   - Add Percy or similar visual testing
   - Screenshot comparison for UI changes
   - Mobile viewport screenshots

3. **Performance Testing**
   - Add Core Web Vitals assertions
   - Page load time benchmarks
   - WebSocket connection latency checks

4. **Accessibility Audits**
   - Integrate axe-core for a11y testing
   - WCAG 2.1 AA compliance checks
   - Keyboard navigation tests

5. **Real Authentication**
   - Update auth.setup.ts when auth is implemented
   - Test login flow
   - Test session expiration

## Success Metrics

- **Pass Rate**: >95% on CI/CD
- **Execution Time**: <5 minutes for full suite
- **Coverage**: All 4 critical user journeys covered
- **Flakiness**: <2% flaky test rate
- **Mobile Coverage**: 100% of tests run on mobile viewports

## Maintenance

### When to Update Tests

1. **Component Structure Changes**
   - Update selectors when HTML structure changes
   - Add/update data-testid attributes

2. **Feature Changes**
   - Update test expectations when features change
   - Add new tests for new features

3. **UI Changes**
   - Update text matchers when copy changes
   - Update visual assertions if added

4. **API Changes**
   - Update mock data when API contracts change
   - Update response expectations

### Best Practices

1. **Prefer data-testid over text content**
   - More stable across copy changes
   - Easier to maintain

2. **Use semantic selectors**
   - `role` attributes
   - `aria-label`
   - Native HTML elements

3. **Keep tests independent**
   - Each test should work in isolation
   - Don't rely on test execution order

4. **Use page object pattern for complex flows**
   - Extract common actions into helper functions
   - Reduce duplication

## Notes

- Tests are comprehensive but may need data-testid attributes added to components
- Mock auth is temporary - update when real auth is implemented
- WebSocket tests require two user contexts to simulate real-time sync
- All tests are mobile-responsive and run on multiple viewports
- Tests follow Playwright best practices for reliability

---

**Status**: COMPLETE
**Date**: 2025-11-27
**Test Count**: 22 tests across 4 use cases
**Coverage**: All critical user journeys from PRD
