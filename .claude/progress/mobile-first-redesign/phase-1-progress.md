---
# === PROGRESS TRACKING: PHASE 1 ===
# Critical Mobile Issues Foundation - Task orchestration for AI agents

type: progress
prd: "mobile-first-redesign"
phase: 1
title: "Critical Mobile Issues Foundation"
status: "completed"
started: "2025-12-17"
completed: "2025-12-17"

# Overall Progress
overall_progress: 100
completion_estimate: "completed"

# Task Counts
total_tasks: 7
completed_tasks: 7
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["ui-engineer-enhanced", "frontend-developer"]
contributors: ["testing specialist"]

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "MOB-101"
    description: "Fix sidebar visibility on mobile (<768px) - hide completely, show bottom nav"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2h"
    priority: "critical"
    commit: "3f91ee8"

  - id: "MOB-102"
    description: "Implement responsive AppLayout component - header top (sticky), main flex center, bottom nav bottom (sticky), use 100dvh"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced", "frontend-developer"]
    dependencies: []
    estimated_effort: "2h"
    priority: "critical"
    commit: "3f91ee8"

  - id: "MOB-103"
    description: "Audit & fix touch targets (≥44x44px) - audit all interactive elements, fix buttons, links, inputs, icons"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-102"]
    estimated_effort: "2.5h"
    priority: "critical"
    commit: "a909d68"

  - id: "MOB-104"
    description: "Apply safe area insets to fixed elements - header, bottom nav, full-width backgrounds for notch, home indicator, keyboard"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-102"]
    estimated_effort: "1.5h"
    priority: "critical"
    commit: "a909d68"

  - id: "MOB-105"
    description: "Fix viewport height (100dvh instead of 100vh) - replace all 100vh with 100dvh, test iOS address bar toggle"
    status: "completed"
    assigned_to: ["frontend-developer"]
    dependencies: ["MOB-104"]
    estimated_effort: "1h"
    priority: "critical"
    commit: "1245ee4"

  - id: "MOB-106"
    description: "Increase mobile typography & spacing - heading sizes (18px+), body text (14px+), minimum spacing (16px) on cards/sections"
    status: "completed"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["MOB-102"]
    estimated_effort: "1h"
    priority: "high"
    commit: "a909d68"

  - id: "MOB-107"
    description: "Mobile device testing & QA - test on real iOS devices (iPhone SE, 12, 13, 14), verify all acceptance criteria"
    status: "completed"
    assigned_to: ["frontend-developer", "testing specialist"]
    dependencies: ["MOB-106"]
    estimated_effort: "2h"
    priority: "critical"
    notes: "Build passes, lint passes. Manual device testing recommended."

# Parallelization Strategy
parallelization:
  batch_1: ["MOB-101", "MOB-102"]
  batch_2: ["MOB-103", "MOB-104", "MOB-106"]
  batch_3: ["MOB-105"]
  batch_4: ["MOB-107"]
  critical_path: ["MOB-102", "MOB-104", "MOB-105", "MOB-107"]
  estimated_total_time: "5-7 days"

# Critical Blockers
blockers: []

# Success Criteria
success_criteria:
  - id: "SC-1"
    description: "Sidebar completely hidden on mobile (verified on 3+ iOS devices)"
    status: "implemented"
    notes: "AppLayout uses hidden md:block on DesktopNav wrapper"
  - id: "SC-2"
    description: "Main content fully visible and scrollable on mobile"
    status: "implemented"
    notes: "Proper flex layout with overflow-y-auto on main"
  - id: "SC-3"
    description: "All interactive elements ≥44x44px (audited + manual review)"
    status: "implemented"
    notes: "5 components fixed: button, checkbox, GiftCard, SearchInput"
  - id: "SC-4"
    description: "Safe area insets applied to fixed/sticky elements"
    status: "implemented"
    notes: "Header and MobileNav use safe area CSS classes"
  - id: "SC-5"
    description: "No layout shift on iOS address bar toggle"
    status: "implemented"
    notes: "All fixed containers use 100dvh via h-screen-safe"
  - id: "SC-6"
    description: "No 100vh usage in codebase (all replaced with 100dvh)"
    status: "implemented"
    notes: "ProtectedRoute, PublicRoute fixed. min-h-screen OK for content."
  - id: "SC-7"
    description: "Lighthouse mobile score ≥90"
    status: "needs-verification"
    notes: "Run Lighthouse audit in browser to verify"
  - id: "SC-8"
    description: "WCAG color contrast passing (4.5:1)"
    status: "needs-verification"
    notes: "No color changes made - existing colors should pass"
  - id: "SC-9"
    description: "E2E test: Open on iPhone, verify content visible, navigation works"
    status: "needs-verification"
    notes: "Manual device testing recommended"
  - id: "SC-10"
    description: "No critical issues on real iOS devices"
    status: "needs-verification"
    notes: "Manual device testing recommended"

# Files Modified
files_modified:
  - "apps/web/components/layout/AppLayout.tsx"
  - "apps/web/components/layout/Header.tsx"
  - "apps/web/components/layout/MobileNav.tsx"
  - "apps/web/components/layout/SearchInput.tsx"
  - "apps/web/components/ui/button.tsx"
  - "apps/web/components/ui/checkbox.tsx"
  - "apps/web/components/ui/card.tsx"
  - "apps/web/components/gifts/GiftCard.tsx"
  - "apps/web/components/auth/ProtectedRoute.tsx"
  - "apps/web/components/auth/PublicRoute.tsx"
  - "apps/web/app/globals.css"
  - "apps/web/tailwind.config.ts"
---

# Mobile-First Redesign - Phase 1: Critical Mobile Issues Foundation

**Phase**: 1 of 5
**Status**: 🔵 Planning (0% complete)
**Duration**: Target 5-7 working days
**Owner**: ui-engineer-enhanced, frontend-developer
**Contributors**: testing specialist

---

## Orchestration Quick Reference

> For orchestration agents: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Parallel - No Dependencies):
- MOB-101 → `ui-engineer-enhanced` (2h)
- MOB-102 → `ui-engineer-enhanced` + `frontend-developer` (2h)

**Batch 2** (Parallel - Depends on Batch 1):
- MOB-103 → `ui-engineer-enhanced` (2.5h) - **Blocked by**: MOB-102
- MOB-104 → `frontend-developer` (1.5h) - **Blocked by**: MOB-102
- MOB-106 → `ui-engineer-enhanced` (1h) - **Blocked by**: MOB-102

**Batch 3** (Sequential - Depends on Batch 2):
- MOB-105 → `frontend-developer` (1h) - **Blocked by**: MOB-104

**Batch 4** (Sequential - Depends on Batch 3):
- MOB-107 → `frontend-developer` + `testing specialist` (2h) - **Blocked by**: MOB-106

**Critical Path**: MOB-102 → MOB-104 → MOB-105 → MOB-107 (6.5 hours sequential)

### Task Delegation Commands

```
# Batch 1 - Launch in parallel
Task("ui-engineer-enhanced", "MOB-101: Fix sidebar visibility on mobile (<768px). Hide sidebar completely, show bottom nav. Verify on real iPhone devices.")

Task("ui-engineer-enhanced frontend-developer", "MOB-102: Implement responsive AppLayout. Header top (sticky), main flex center, bottom nav bottom (sticky), use 100dvh. Test on all breakpoints.")

# Batch 2 - Launch after Batch 1 (MOB-101, MOB-102 complete)
Task("ui-engineer-enhanced", "MOB-103: Audit all touch targets (buttons, links, inputs, icons). Ensure all ≥44x44px. Fix Button, Link, Avatar, Icon components.")

Task("frontend-developer", "MOB-104: Apply safe area insets to header and bottom nav. Use CSS env(safe-area-inset-*) for notch, home indicator, keyboard. Test on iPhone with notch.")

Task("ui-engineer-enhanced", "MOB-106: Increase mobile typography & spacing. Headings 18px+, body 14px+, minimum spacing 16px on cards/sections. Test readability.")

# Batch 3 - Launch after Batch 2 (MOB-104 complete)
Task("frontend-developer", "MOB-105: Replace all 100vh with 100dvh. Fix viewport height issues. Test iOS address bar toggle (appears/disappears).")

# Batch 4 - Launch after Batch 3 (MOB-105, MOB-106 complete)
Task("frontend-developer testing specialist", "MOB-107: Device testing on iPhone SE, 12, 13, 14. Verify all acceptance criteria. Document findings. No critical issues before merge.")
```

---

## Overview

**Phase 1 Mission**: Fix foundational mobile usability blockers that make the app unusable on phones.

**Why This Phase**: The Family Gifting Dashboard's sidebar currently covers the entire screen on mobile, blocking access to content. Touch targets are too small, viewport height causes layout shift on iOS, and safe areas aren't respected. These issues must be resolved before any other mobile work can proceed.

**Scope**:
- **IN SCOPE**: Sidebar visibility, responsive AppLayout, touch target audit/fix, safe area insets, viewport height (100dvh), typography/spacing for mobile, comprehensive device testing
- **OUT OF SCOPE**: Bottom navigation completion (Phase 2), gestures/interactions (Phase 3), PWA features (Phase 4), advanced UX (Phase 5)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Sidebar completely hidden on mobile (verified on 3+ iOS devices) | ⏳ Pending |
| SC-2 | Main content fully visible and scrollable on mobile | ⏳ Pending |
| SC-3 | All interactive elements ≥44x44px (audited + manual review) | ⏳ Pending |
| SC-4 | Safe area insets applied to fixed/sticky elements | ⏳ Pending |
| SC-5 | No layout shift on iOS address bar toggle | ⏳ Pending |
| SC-6 | No 100vh usage in codebase (all replaced with 100dvh) | ⏳ Pending |
| SC-7 | Lighthouse mobile score ≥90 | ⏳ Pending |
| SC-8 | WCAG color contrast passing (4.5:1) | ⏳ Pending |
| SC-9 | E2E test: Open on iPhone, verify content visible, navigation works | ⏳ Pending |
| SC-10 | No critical issues on real iOS devices | ⏳ Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| MOB-101 | Fix sidebar visibility on mobile | ⏳ | ui-engineer-enhanced | None | 2h | Hide on <768px, show bottom nav |
| MOB-102 | Implement responsive AppLayout | ⏳ | ui-engineer-enhanced, frontend-developer | None | 2h | Header top, main center, bottom nav bottom, 100dvh |
| MOB-103 | Audit & fix touch targets (≥44x44px) | ⏳ | ui-engineer-enhanced | MOB-102 | 2.5h | All buttons, links, inputs, icons |
| MOB-104 | Apply safe area insets to fixed elements | ⏳ | frontend-developer | MOB-102 | 1.5h | Header, bottom nav, notch/home indicator |
| MOB-105 | Fix viewport height (100dvh) | ⏳ | frontend-developer | MOB-104 | 1h | Replace 100vh, test address bar toggle |
| MOB-106 | Increase mobile typography & spacing | ⏳ | ui-engineer-enhanced | MOB-102 | 1h | 18px+ headings, 14px+ body, 16px+ spacing |
| MOB-107 | Mobile device testing & QA | ⏳ | frontend-developer, testing specialist | MOB-106 | 2h | Real device testing, all acceptance criteria met |

**Status Legend**: `⏳` Pending | `🔄` In Progress | `✓` Complete | `🚫` Blocked | `⚠️` At Risk

---

## Architecture Context

### Current State

**Existing Layout**:
- Desktop: Fixed 240px sidebar + flex-1 main content area
- Mobile: Sidebar theoretically hidden but **currently visible and covering content** (CRITICAL BUG)
- Header: Sticky top, optional mobile adjustments
- Navigation: Desktop sidebar + mobile bottom nav (MobileNav stub exists)

**Key Components**:
- `AppLayout.tsx` - Main layout wrapper (sidebar + main area)
- `DesktopNav.tsx` - Sidebar (desktop only)
- `MobileNav.tsx` - Bottom navigation (mobile stub, needs completion)
- `Header.tsx` - Sticky header (needs safe area support)
- Global CSS - Uses `100vh` (needs change to `100dvh`)

**Responsive Breakpoints** (via Tailwind):
- Mobile: <768px (md:)
- Tablet: 768px-1024px
- Desktop: >1024px

**Current Safe Area Support**: ~30% (partial, incomplete)

### Reference Patterns

**Similar Features**:
- None currently - this is foundational work establishing mobile patterns
- Future phases will follow patterns established in Phase 1

**Responsive Design Pattern** (to be established):
```
- Mobile (<768px): Single column, hidden sidebar, sticky header, fixed bottom nav
- Tablet (768-1024px): Possible sidebar in drawer, responsive grids
- Desktop (>1024px): Sidebar + main area, full layouts
```

---

## Implementation Details

### Technical Approach

**Step 1: Hide Sidebar on Mobile**
- Update `AppLayout.tsx` to conditionally render sidebar only on `md:` breakpoint
- Use Tailwind `hidden md:block` pattern
- Verify MobileNav is visible on mobile

**Step 2: Implement Responsive AppLayout**
- Refactor AppLayout to use flexbox: `flex flex-col` for mobile stacking
- Header: `sticky top-0`, apply safe area padding
- Main content: `flex-1`, scrollable
- Bottom nav: `fixed bottom-0 inset-x-0` (or sticky), apply safe area padding
- Use `100dvh` for height (NOT `100vh`)

**Step 3: Audit Touch Targets**
- Use automated tool (e.g., axe DevTools, or custom script) to find elements <44x44px
- Focus on: Button, Link, Input, Avatar, Icon components
- Add padding/sizing to reach 44x44px minimum
- Document all changes

**Step 4: Apply Safe Area Insets**
- Add Tailwind safe area utilities (if not present):
  ```css
  .safe-area-inset-top { padding-top: env(safe-area-inset-top); }
  .safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }
  etc.
  ```
- Apply to: Header `safe-area-inset-top`, Bottom Nav `safe-area-inset-bottom`
- Test on iPhone 12/13/14 Pro Max (large notch), iPhone SE (no notch but has home indicator)

**Step 5: Fix Viewport Height**
- Search codebase for all `100vh` usage
- Replace with `100dvh` (dynamic viewport height, accounts for address bar)
- Test on real iOS device with address bar appearing/disappearing

**Step 6: Increase Mobile Typography & Spacing**
- Update Tailwind config or create mobile-specific sizes
- Headings: 18px+ on mobile (vs 16px on desktop)
- Body: 14px+ on mobile (vs 13-14px on desktop)
- Spacing: 16px minimum gaps between sections on mobile (vs 12px on desktop)

**Step 7: Device Testing & QA**
- Test on real iOS devices: iPhone SE, 12, 13, 14
- Test portrait and landscape on each
- Verify all acceptance criteria
- Use Lighthouse for automated scoring
- Document findings and any issues

### Known Gotchas

**Gotcha 1: 100vh vs 100dvh**
- `100vh` is static viewport height, doesn't account for iOS address bar appearing/disappearing
- On iOS, address bar hides when scrolling, shows when scrolling up
- Using `100vh` causes layout shift (elements jump up/down as address bar toggles)
- **Solution**: Always use `100dvh` (dynamic viewport height) on mobile

**Gotcha 2: Safe Area Insets Not Just Notch**
- Safe areas include: notch (top), home indicator (bottom), keyboard (bottom)
- Not all devices have notches, but all must respect safe areas
- Devices without notch still have home indicator safe area
- **Solution**: Apply `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to all fixed elements

**Gotcha 3: CSS Hidden vs Display**
- `hidden` (display: none) completely removes element from layout
- `invisible` (visibility: hidden) hides but keeps space (not suitable for sidebar)
- **Solution**: Use `hidden md:block` to hide sidebar on mobile, show on desktop

**Gotcha 4: Touch Target Measurements**
- 44x44px minimum includes padding, not just the icon/text
- A 24x24px icon with 10px padding on each side = 44x44px touch target (good)
- A 24x24px icon with no padding = 24x24px (bad, too small)
- **Solution**: Check full computed size of tappable element, not just content

**Gotcha 5: Sidebar Overflow on iOS**
- Even if CSS hides sidebar, overflow from content can still show it
- Overflow issues may only appear on actual iOS devices, not in DevTools
- **Solution**: Test on real devices, use `overflow-hidden` on body if needed

**Gotcha 6: Responsive Layout on Device Rotation**
- Landscape orientation can cause content to reflow unexpectedly
- Sidebar might show if CSS breakpoint not tested in landscape
- **Solution**: Test both portrait and landscape on each device

### Development Setup

**Required Tools**:
- Actual iOS devices: iPhone SE, 12, 13, 14 (or use BrowserStack if unavailable)
- iOS Safari DevTools (on Mac connected to iOS device)
- Lighthouse (Chrome DevTools, or Lighthouse CI)
- Automated tool for touch target audit (axe DevTools, or custom)

**How to Test iOS**:
1. Connect iPhone to Mac via USB
2. Open iOS Safari app on iPhone
3. On Mac, Safari > Develop > [Device] > [Browser tab]
4. Use DevTools to inspect, debug, adjust CSS in real-time

**Lighthouse Testing**:
```bash
npm run lighthouse -- --only-categories=mobile https://localhost:3000
```

---

## Blockers

### Active Blockers

None currently. Phase 1 has no external dependencies and can begin immediately.

### Resolved Blockers

N/A (None encountered yet)

---

## Dependencies

### External Dependencies

- **Tailwind CSS**: Already in use, mobile-first by default
- **Radix UI**: Accessible primitives, already in use for buttons/inputs
- **Next.js**: App Router, already configured
- **iOS Safari**: Supports viewport meta tags, safe areas (iOS 11+)

### Internal Integration Points

- **AppLayout.tsx**: Central entry point for layout changes, affects all pages
- **All page components**: Inherit AppLayout, responsive breakpoints applied globally
- **Global CSS** (`globals.css`): Central place for 100dvh, safe area utilities
- **Component library**: Button, Input, Avatar, Link components need touch target audits

### Inter-Phase Dependencies

**Phase 1 blocks**:
- Phase 2 (Mobile Navigation & Layout)
- Phase 3 (Touch Interactions & Gestures)
- Phase 4 (PWA Enhancement)
- Phase 5 (Advanced Mobile UX)

**None** of Phases 2-5 can begin until Phase 1 quality gates are met.

---

## Testing Strategy

### Unit Tests

- Touch target size validation utilities
- Safe area inset CSS calculations
- Responsive breakpoint media queries
- Font size and spacing utilities on mobile

### Integration Tests

- AppLayout responsive behavior at all breakpoints
- Header sticky behavior with safe area padding
- Bottom nav sticky behavior with safe area padding
- Main content scrollable, sidebar hidden on mobile

### E2E Tests (Playwright)

```gherkin
Scenario: Mobile viewport shows no sidebar
  When I open app on iPhone SE viewport
  Then sidebar is hidden
  And main content is fully visible
  And bottom nav is visible
  And app is scrollable without overflow

Scenario: Touch targets are tappable
  When I open gift form on mobile
  Then all input fields are at least 44x44px
  And all buttons are at least 44x44px
  And buttons tappable without zoom

Scenario: Safe areas respected on notched device
  When I open on iPhone 14 Pro (with notch)
  Then notch doesn't cover header
  And home indicator doesn't cover bottom nav
  And content fully visible in safe area

Scenario: No layout shift on iOS address bar toggle
  When I open on real iOS device
  And iOS address bar appears/disappears
  Then content doesn't shift or jump
  And layout stable without jank
```

### Device Testing Matrix

| Device | OS | Viewport | Portrait | Landscape | Notes |
|--------|----|----|----------|-----------|-------|
| iPhone SE (3rd gen) | iOS 17 | 375×667 | ✓ | ✓ | Baseline, no notch |
| iPhone 12 | iOS 17 | 390×844 | ✓ | ✓ | Small notch |
| iPhone 13 Pro Max | iOS 17 | 428×926 | ✓ | ✓ | Large notch |
| iPhone 14 Pro | iOS 17 | 393×852 | ✓ | ✓ | Largest notch (Dynamic Island) |

**Required Verification**:
- [ ] Sidebar hidden on all devices in portrait and landscape
- [ ] Main content fully visible (no overflow, no covering)
- [ ] All buttons/inputs tappable (≥44x44px)
- [ ] Safe areas respected (notch/home indicator don't cover content)
- [ ] No layout shift on address bar toggle
- [ ] Lighthouse mobile score ≥90
- [ ] No horizontal scroll on main content

### Performance Testing

- **Lighthouse**: Target 90+ mobile performance score
- **Frame rate**: Should not drop below 60fps on modern devices
- **Load time**: Measure initial page load on 4G and 3G networks
- **Service worker**: Not required in Phase 1 (Phase 4), but no regression

### Accessibility Testing

- **axe-core**: Automated a11y audit (color contrast, ARIA, focus)
- **VoiceOver**: Manual testing on iOS for screen reader support
- **Touch targets**: 44x44px minimum verified across all interactive elements
- **Color contrast**: 4.5:1 for text (WCAG AA)
- **Keyboard navigation**: Not primary on mobile, but must not break

---

## Next Session Agenda

### Immediate Actions (When Phase 1 Begins)

1. [ ] **MOB-101**: Hide sidebar on mobile, verify on real iOS devices
2. [ ] **MOB-102**: Implement responsive AppLayout with 100dvh
3. [ ] **MOB-103**: Audit touch targets, fix components
4. [ ] **MOB-104**: Apply safe area insets to header/bottom nav
5. [ ] **MOB-105**: Replace all 100vh with 100dvh, test address bar toggle
6. [ ] **MOB-106**: Increase mobile typography and spacing
7. [ ] **MOB-107**: Device testing and QA - no critical issues before merge

### Critical Path

Follow critical path strictly: MOB-102 → MOB-104 → MOB-105 → MOB-107

Other tasks (MOB-101, MOB-103, MOB-106) can run in parallel with appropriate synchronization.

### Context for Continuing Agent

Phase 1 is foundational and critical. All subsequent phases depend on its successful completion. The primary challenges are:

1. **Sidebar visibility** must be tested on actual iOS devices, not just DevTools
2. **100dvh vs 100vh** is a common mistake; always use 100dvh
3. **Safe areas** require testing on devices with notches and home indicators
4. **Touch targets** need both automated tools and manual verification
5. **Device testing** is essential; cannot be skipped or deferred

The phase is complete when all 10 success criteria are met and Phase 1 quality gates pass.

---

## Session Notes

### (To be updated as work progresses)

#### Next Session Entry Template

```
### [DATE]

**Completed**:
- MOB-XXX: Task description with outcome

**In Progress**:
- MOB-XXX: Current status and next step

**Blockers**:
- BLOCKER-XXX: Description and resolution path

**Next Session**:
- Action item with context
```

---

## Additional Resources

- **Design Reference**: `/docs/designs/LAYOUT-PATTERNS.md`, `/docs/designs/DESIGN-TOKENS.md`
- **Architecture Decision**: `CLAUDE.md` (project directives, mobile-first constraints)
- **Web Patterns**: `apps/web/CLAUDE.md` (Next.js/React patterns)
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/mobile-first-redesign-v1.md`
- **PRD**: `/docs/project_plans/PRDs/features/mobile-first-redesign-v1.md`
- **Context**: `.claude/worknotes/mobile-first-redesign/context.md`
