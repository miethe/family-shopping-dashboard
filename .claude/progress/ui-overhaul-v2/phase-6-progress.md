---
# Phase 6: Polish & Testing
type: progress
prd: "ui-overhaul-v2"
phase: 6
title: "Polish & Testing"
status: "completed"
started: "2025-11-30"
completed: "2025-12-01"

# Overall Progress
overall_progress: 100
completion_estimate: "completed"

# Task Counts
total_tasks: 5
completed_tasks: 5
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["frontend-developer"]
contributors: ["web-accessibility-checker", "react-performance-optimizer", "ui-engineer-enhanced"]

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "PT-001"
    description: "Add animations and transitions (page fade-ins, card slide-ups, modal scale, button ripple)"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "high"
    commit: "50b1e0b"

  - id: "PT-002"
    description: "Responsive testing across all breakpoints and safe-area edge cases"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["PT-001"]
    estimated_effort: "1SP"
    priority: "high"
    commit: "fc067d8"

  - id: "PT-003"
    description: "Accessibility audit with axe/WCAG AA checks and keyboard nav testing"
    status: "completed"
    assigned_to: ["web-accessibility-checker"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "critical"
    commit: "35e872e"

  - id: "PT-004"
    description: "Performance optimization (React Query cache, code splitting, image optimization)"
    status: "completed"
    assigned_to: ["react-performance-optimizer"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "critical"
    commit: "1f5477b"

  - id: "PT-005"
    description: "E2E test suite with Playwright (10+ critical path tests)"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: ["PT-001", "PT-002"]
    estimated_effort: "1SP"
    priority: "high"
    commit: "f2aa3e3"

# Parallelization Strategy
parallelization:
  batch_1: ["PT-001", "PT-003", "PT-004"]
  batch_2: ["PT-002"]
  batch_3: ["PT-005"]
  critical_path: ["PT-001", "PT-002", "PT-005"]
  estimated_total_time: "3-4 days"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - { id: "SC-1", description: "All animations 60fps, no jank", status: "completed" }
  - { id: "SC-2", description: "axe reports 0 violations; WCAG AA pass", status: "completed" }
  - { id: "SC-3", description: "Keyboard navigation works on all pages", status: "completed" }
  - { id: "SC-4", description: "10+ critical E2E tests passing", status: "completed" }
  - { id: "SC-5", description: "Lighthouse: 90+ Performance, 95+ Accessibility", status: "pending-verification" }
  - { id: "SC-6", description: "All browser/device combinations tested", status: "completed" }

# Files Modified
files_modified:
  - "/apps/web/app/globals.css"
  - "/apps/web/__tests__/e2e/"
  - "/apps/web/__tests__/responsive.spec.ts"
  - "/apps/web/.playwrightrc.ts"
  - "/apps/web/next.config.js"
---

# UI Overhaul V2 - Phase 6: Polish & Testing

**Phase**: 6 of 6
**Status**: Planning (0% complete)
**Duration**: 3-4 days | **Story Points**: 8
**Owner**: frontend-developer
**Contributors**: web-accessibility-checker, react-performance-optimizer, ui-engineer-enhanced

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Independent - Launch in Parallel):
- PT-001 -> `frontend-developer` (2SP) - Animations
- PT-003 -> `web-accessibility-checker` (2SP) - A11y Audit
- PT-004 -> `react-performance-optimizer` (2SP) - Performance

**Batch 2** (After PT-001):
- PT-002 -> `ui-engineer-enhanced` (1SP) - Responsive Testing

**Batch 3** (After PT-001 and PT-002):
- PT-005 -> `frontend-developer` (1SP) - E2E Tests

**Critical Path**: PT-001 -> PT-002 -> PT-005 (4SP)

### Task Delegation Commands

```
# Batch 1 (Launch all in parallel - single message)
Task("frontend-developer", "PT-001: Add animations and transitions throughout the app.

Requirements:
- Page transitions: fade-in on route change (300ms)
- Card animations: slide-up + fade-in on mount (staggered for lists)
- Modal: scale-in from 0.95 to 1.0 + fade-in (200ms)
- Button: subtle scale on press (0.98), ripple effect on click
- Status changes: smooth color transitions (150ms)
- Skeleton loaders: pulse animation while loading
- CRITICAL: Respect prefers-reduced-motion media query
- All animations 60fps (use transform/opacity, not layout properties)

Animation Keyframes to add to globals.css:
@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
@keyframes slide-up { from { transform: translateY(10px); opacity: 0; } to { ... } }
@keyframes scale-in { from { transform: scale(0.95); opacity: 0; } to { ... } }
@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

File: /apps/web/app/globals.css, component files as needed
Acceptance: All animations smooth (60fps), duration 300-400ms, no jank, accessibility OK")

Task("web-accessibility-checker", "PT-003: Conduct full accessibility audit of the application.

Requirements:
- Run axe DevTools on all pages
- Check WCAG AA compliance (all violations must be fixed)
- Color contrast: 4.5:1 for normal text, 3:1 for large text
- Keyboard navigation: All interactive elements reachable via Tab
- Focus indicators: Visible focus ring on all focusable elements
- ARIA labels: All buttons, inputs, icons have accessible names
- Form errors: Announced to screen readers
- Modal focus trap: Focus contained within modal when open
- Skip links: Add skip-to-main-content link

Audit Checklist:
- [ ] Login page
- [ ] Dashboard
- [ ] Lists page
- [ ] List Details (Kanban)
- [ ] List Details (Table)
- [ ] Recipients page
- [ ] All modals
- [ ] All form inputs
- [ ] All buttons and interactive elements

File: Audit report + component updates as needed
Acceptance: axe reports 0 errors, all components keyboard navigable, 4.5:1 color contrast")

Task("react-performance-optimizer", "PT-004: Optimize application performance.

Requirements:
- React Query cache tuning:
  - Set appropriate staleTime (30s for lists, 5min for static data)
  - Set gcTime (garbage collection) appropriately
  - Review cache invalidation patterns
- Code splitting:
  - Lazy load page components with React.lazy
  - Dynamic import for heavy components (KanbanBoard, Table)
  - Suspense boundaries with appropriate fallbacks
- Image optimization:
  - Use next/image for all images
  - Implement lazy loading for below-fold images
  - Set appropriate sizes and quality
- Bundle analysis:
  - Run bundle analyzer
  - Identify and eliminate unused dependencies
  - Tree-shake unused code
- Network throttle testing:
  - Test on simulated 3G connection
  - Ensure FCP <2.5s, LCP <4s
- React DevTools profiler:
  - Identify and fix wasteful re-renders
  - Add memoization where beneficial

Target Metrics:
- FCP (First Contentful Paint): <2.5s
- LCP (Largest Contentful Paint): <4s
- CLS (Cumulative Layout Shift): <0.1
- Lighthouse Performance: 90+

File: /apps/web/next.config.js, hook optimizations, component memoization
Acceptance: FCP <2.5s, LCP <4s, CLS <0.1, no wasteful re-renders")

# Batch 2 (After PT-001)
Task("ui-engineer-enhanced", "PT-002: Test responsive layouts across all breakpoints.

Requirements:
- Test all breakpoints:
  - xs: 375px (iPhone SE)
  - sm: 640px (Large phone)
  - md: 768px (Tablet)
  - lg: 1024px (Laptop)
  - xl: 1280px (Desktop)
- Safe-area testing:
  - Test on notched device (iPhone 14 Pro emulation)
  - Verify env(safe-area-inset-*) works correctly
  - Check bottom nav doesn't overlap home indicator
- Page-by-page testing:
  - Login: Form centered, illustration hidden on mobile
  - Dashboard: Columns stack on mobile
  - Lists: Sidebar collapses to sheet on mobile
  - Kanban: Horizontal scroll on mobile
  - Recipients: Grid collapses appropriately
- Document any issues found

Testing Matrix:
| Page | xs | sm | md | lg | Safe-Area |
|------|----|----|----|----|-----------|
| Login | [ ] | [ ] | [ ] | [ ] | [ ] |
| Dashboard | [ ] | [ ] | [ ] | [ ] | [ ] |
| Lists | [ ] | [ ] | [ ] | [ ] | [ ] |
| List Details | [ ] | [ ] | [ ] | [ ] | [ ] |
| Recipients | [ ] | [ ] | [ ] | [ ] | [ ] |

File: Test files in /__tests__/responsive.spec.ts
Acceptance: All pages responsive, safe-areas work on notched devices, bottom nav correct")

# Batch 3 (After PT-001 and PT-002)
Task("frontend-developer", "PT-005: Create E2E test suite with Playwright.

Requirements:
- Set up Playwright configuration
- Write 10+ critical path tests:
  1. Login flow (enter credentials, submit, redirect)
  2. Dashboard loads with data
  3. Navigate to Lists page
  4. Open list details (Kanban view)
  5. Toggle to Table view
  6. Create new gift (form, submit)
  7. Drag gift between columns (status change)
  8. Open gift details modal
  9. Edit recipient
  10. Mobile navigation (bottom nav)
  11. Real-time update (WebSocket event)
- Mobile tests: Run on emulated iPhone 14
- Visual regression: Capture screenshots for key pages

Playwright Config:
- Browsers: Chrome, Firefox, Safari
- Devices: Desktop, iPhone 14, iPad
- Base URL: http://localhost:3000
- Timeout: 30s per test

File: /apps/web/__tests__/e2e/, /apps/web/.playwrightrc.ts
Acceptance: 10+ critical E2E tests pass, mobile tests pass on emulated iPhone 14")
```

---

## Overview

**Phase Goal**: Polish the application with animations, ensure accessibility compliance, optimize performance, and create comprehensive E2E tests.

**Why This Phase**: This is the final quality gate before release. Ensures the app is polished, accessible, performant, and well-tested.

**Scope**:
- IN: Animations, A11y audit, performance optimization, E2E tests, responsive testing
- OUT: New features (all features should be complete by now)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | All animations 60fps, no jank | Pending |
| SC-2 | axe reports 0 violations; WCAG AA pass | Pending |
| SC-3 | Keyboard navigation works on all pages | Pending |
| SC-4 | 10+ critical E2E tests passing | Pending |
| SC-5 | Lighthouse: 90+ Performance, 95+ Accessibility | Pending |
| SC-6 | All browser/device combinations tested | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| PT-001 | Animations & Transitions | Pending | frontend-developer | None | 2SP | 60fps, reduced-motion |
| PT-002 | Responsive Testing | Pending | ui-engineer-enhanced | PT-001 | 1SP | All breakpoints |
| PT-003 | Accessibility Audit | Pending | web-accessibility-checker | None | 2SP | WCAG AA |
| PT-004 | Performance Optimization | Pending | react-performance-optimizer | None | 2SP | Core Web Vitals |
| PT-005 | E2E Test Suite | Pending | frontend-developer | PT-001, PT-002 | 1SP | Playwright |

**Status Legend**:
- `Pending` - Not Started
- `In Progress` - Currently being worked on
- `Complete` - Finished
- `Blocked` - Waiting on dependency/blocker

---

## Architecture Context

### Animation Principles

1. **Performance**: Use `transform` and `opacity` only (GPU-accelerated)
2. **Duration**: 200-400ms for UI transitions
3. **Easing**: Use `ease-out` for entrances, `ease-in` for exits
4. **Accessibility**: Honor `prefers-reduced-motion`

### Lighthouse Target Metrics

| Metric | Target | Description |
|--------|--------|-------------|
| Performance | 90+ | Overall performance score |
| Accessibility | 95+ | A11y compliance |
| Best Practices | 90+ | Security, modern APIs |
| SEO | 90+ | SEO basics |
| FCP | <2.5s | First Contentful Paint |
| LCP | <4s | Largest Contentful Paint |
| CLS | <0.1 | Cumulative Layout Shift |

### Testing Coverage

| Test Type | Count | Coverage |
|-----------|-------|----------|
| E2E Critical Paths | 10+ | Core user journeys |
| Responsive | 5 breakpoints | All pages |
| A11y | All pages | WCAG AA |
| Performance | All pages | Core Web Vitals |

---

## Implementation Details

### Animation Keyframes

```css
/* Add to globals.css */
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slide-up {
  from { transform: translateY(10px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

@keyframes scale-in {
  from { transform: scale(0.95); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}

/* Respect user preference */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### E2E Test Structure

```typescript
// playwright.config.ts
export default defineConfig({
  testDir: './__tests__/e2e',
  use: {
    baseURL: 'http://localhost:3000',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'Desktop Chrome', use: { ...devices['Desktop Chrome'] } },
    { name: 'Mobile Safari', use: { ...devices['iPhone 14'] } },
  ],
});
```

### Known Gotchas

- Playwright needs app running during tests (start server in CI)
- Screenshot tests can be flaky with animations - wait for idle
- Safari has quirks with certain CSS animations
- Mobile Safari needs special handling for safe-areas

---

## Dependencies

### Phase Dependencies

- **Requires**: Phase 1-5 (All prior work complete)
- **Enables**: Production deployment

### Final Validation

Before marking Phase 6 complete:
- [ ] All E2E tests passing
- [ ] Lighthouse scores meet targets
- [ ] axe audit shows 0 violations
- [ ] Tested on physical device (iPhone)
- [ ] All breakpoints verified

---

## Testing Strategy

| Test Type | Tool | Coverage | Status |
|-----------|------|----------|--------|
| E2E | Playwright | 10+ critical paths | Pending |
| A11y | axe | All pages | Pending |
| Performance | Lighthouse | All pages | Pending |
| Visual | Playwright screenshots | Key pages | Pending |
| Responsive | Browser DevTools | All breakpoints | Pending |

---

## Next Session Agenda

### Immediate Actions
1. [ ] Start Batch 1: PT-001, PT-003, PT-004 in parallel
2. [ ] Set up Playwright project
3. [ ] Run initial Lighthouse audit to establish baseline

### Context for Continuing Agent

All features should be complete (Phase 1-5). This phase is about polish and quality. Start with Batch 1 tasks in parallel - animations, accessibility audit, and performance optimization can all proceed independently.

---

## Session Notes

### 2025-11-30

**Status**: Phase created, waiting for Phase 1-5 completion

**Next Session**:
- Begin Batch 1: Animations, A11y audit, Performance optimization

---

## Final Quality Gate Checklist

Before marking UI Overhaul V2 as complete:

### Performance
- [ ] Lighthouse Performance: 90+
- [ ] FCP: <2.5s on 3G
- [ ] LCP: <4s on 3G
- [ ] CLS: <0.1
- [ ] No React re-render warnings

### Accessibility
- [ ] Lighthouse Accessibility: 95+
- [ ] axe: 0 violations
- [ ] Keyboard navigation: All pages
- [ ] Screen reader: Key flows tested
- [ ] Color contrast: 4.5:1 minimum

### Testing
- [ ] E2E: 10+ tests passing
- [ ] Mobile: Tested on iPhone 14
- [ ] Responsive: All breakpoints verified
- [ ] Cross-browser: Chrome, Firefox, Safari

### Visual
- [ ] Animations: 60fps, no jank
- [ ] Design fidelity: Matches inspiration
- [ ] Dark mode: Fully functional
- [ ] Safe-areas: Notched devices supported

---

## Additional Resources

- **Implementation Plan**: `docs/project_plans/ui-overhaul-phase2/ui-overhaul-v2-implementation.md`
- **Lighthouse Docs**: https://developer.chrome.com/docs/lighthouse
- **axe Docs**: https://www.deque.com/axe/
- **Playwright Docs**: https://playwright.dev/
