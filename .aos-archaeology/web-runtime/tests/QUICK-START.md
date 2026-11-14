# E2E Tests - Quick Start Guide

## Setup (First Time)

```bash
cd apps/web
pnpm install
pnpm exec playwright install
```

## Run Tests

```bash
# All tests (headless)
pnpm test:e2e

# Interactive UI mode (recommended for development)
pnpm test:e2e:ui

# With browser visible
pnpm test:e2e:headed

# View last report
pnpm test:e2e:report
```

## Run Specific Tests

```bash
# Single test file
pnpm exec playwright test auth.spec.ts

# By test name
pnpm exec playwright test -g "should login successfully"

# Mobile tests only
pnpm exec playwright test --project=mobile-chrome

# Desktop tests only
pnpm exec playwright test --project=chromium
```

## Test Organization

### PT-005 Required Tests (33 tests)
- `auth.spec.ts` - Authentication (5 tests)
- `gift-management.spec.ts` - Gift CRUD (6 tests)
- `list-management.spec.ts` - List CRUD (7 tests)
- `navigation.spec.ts` - Navigation (9 tests)
- `realtime-updates.spec.ts` - WebSocket (6 tests)

### PRD Use Case Tests (22 tests)
- `use-case-1-capture-idea.spec.ts` - UC1 (4 tests)
- `use-case-2-plan-occasion.spec.ts` - UC2 (6 tests)
- `use-case-3-realtime.spec.ts` - UC3 (4 tests)
- `use-case-4-progress.spec.ts` - UC4 (8 tests)

**Total: 55 tests across 10 files**
**Multiply by 4 browsers/viewports = 246 total test executions**

## Browser Coverage

All tests run on:
- Desktop Chrome (1280x720)
- Mobile Chrome (Pixel 5)
- Desktop Safari (1280x720)
- Mobile Safari (iPhone 13)

## Prerequisites

Tests require:
- Next.js dev server at `http://localhost:3000`
- Backend API at `http://localhost:8000` (optional, can be mocked)
- WebSocket server at `ws://localhost:8000/ws` (optional, for real-time tests)

## Common Issues

### Browsers Not Installed
```bash
pnpm exec playwright install
```

### Tests Timing Out
- Ensure Next.js dev server is running: `pnpm dev`
- Increase timeout in `playwright.config.ts`

### Flaky Tests
- Run specific test: `pnpm exec playwright test -g "test name"`
- Use debug mode: `pnpm test:e2e:debug`
- Check for missing `data-testid` attributes

## Documentation

- **Full Documentation**: `PT-005-E2E-TEST-SUITE.md`
- **PRD Tests**: `TEST-004-E2E-TESTS-COMPLETE.md`
- **README**: `README.md`

## Next Steps

1. Add `data-testid` attributes to components (see documentation)
2. Run tests locally: `pnpm test:e2e:ui`
3. Fix any failing tests
4. Add to CI/CD pipeline
