# E2E Tests - Quick Reference

## Setup

```bash
cd apps/web
pnpm install
pnpm exec playwright install  # First time only
```

## Run Tests

```bash
# Run all tests
pnpm test:e2e

# Interactive UI mode
pnpm test:e2e:ui

# With browser visible
pnpm test:e2e:headed

# Debug mode
pnpm test:e2e:debug

# View last report
pnpm test:e2e:report
```

## Run Specific Tests

```bash
# Single use case
pnpm exec playwright test use-case-1-capture-idea.spec.ts

# Single test
pnpm exec playwright test -g "should capture idea via Quick Add"

# Mobile only
pnpm exec playwright test --project=mobile-chrome

# Desktop only
pnpm exec playwright test --project=chromium
```

## Test Structure

```
tests/
├── e2e/
│   ├── auth.setup.ts                      # Auth setup (mock)
│   ├── use-case-1-capture-idea.spec.ts    # UC1: 4 tests
│   ├── use-case-2-plan-occasion.spec.ts   # UC2: 6 tests
│   ├── use-case-3-realtime.spec.ts        # UC3: 4 tests
│   └── use-case-4-progress.spec.ts        # UC4: 8 tests
└── TEST-004-E2E-TESTS-COMPLETE.md         # Full documentation
```

## Test Coverage

- **UC1: Capture a Gift Idea** (4 tests)
  - Quick Add FAB/header buttons
  - Navigate to list and add
  - Verify IDEA status

- **UC2: Plan an Occasion** (6 tests)
  - Create occasion, people, lists
  - Add gifts to lists
  - View on dashboard

- **UC3: Real-Time Coordination** (4 tests)
  - WebSocket sync between users
  - Status changes, additions, deletions
  - Connection indicator

- **UC4: View Progress** (8 tests)
  - Pipeline summary
  - Per-person progress
  - Assignments
  - Status filtering

**Total: 22 tests**

## Browser Coverage

- Desktop Chrome (1280x720)
- Mobile Chrome (Pixel 5)
- Desktop Safari (1280x720)
- Mobile Safari (iPhone 13)

## Requirements

- Backend API running at `http://localhost:8000` (or PLAYWRIGHT_BASE_URL)
- WebSocket server at `ws://localhost:8000/ws` (or NEXT_PUBLIC_WS_URL)
- Next.js dev server at `http://localhost:3000`

## Notes

- Auth is currently mocked (see auth.setup.ts)
- Some tests require data-testid attributes to be added to components
- WebSocket tests use two browser contexts to simulate multi-user
- See TEST-004-E2E-TESTS-COMPLETE.md for full documentation

## Troubleshooting

### Tests Failing
- Ensure API is running: `cd services/api && pnpm dev`
- Ensure Next.js is running: `cd apps/web && pnpm dev`
- Check environment variables: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_WS_URL

### Browsers Not Installed
```bash
pnpm exec playwright install
```

### Slow Tests
- Run specific tests instead of full suite
- Use `--workers=1` to reduce parallelism
- Check network latency to API

### Flaky Tests
- Increase timeout in playwright.config.ts
- Add data-testid attributes for more reliable selectors
- Check for race conditions in async operations
