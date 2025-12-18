---
title: "Implementation Plan: Mobile-First Redesign"
description: "Phased implementation plan for comprehensive mobile-first redesign of Family Gifting Dashboard (iOS primary)"
audience: [ai-agents, developers]
tags: [implementation, planning, phases, mobile, ux, ios, pwa]
created: 2025-12-17
updated: 2025-12-17
category: "product-planning"
status: draft
related:
  - /docs/project_plans/PRDs/features/mobile-first-redesign-v1.md
---

# Implementation Plan: Mobile-First Redesign

**Plan ID**: `IMPL-2025-12-17-MOBILE-FIRST-REDESIGN`
**Date**: 2025-12-17
**Author**: Implementation Planning Orchestrator
**Related Documents**:
- **PRD**: `/docs/project_plans/PRDs/features/mobile-first-redesign-v1.md`
- **North Star**: `/docs/project_plans/north-star/family-gifting-dash.md`
- **V1 PRD**: `/docs/project_plans/family-dashboard-v1/family-dashboard-v1.md`

**Complexity**: Large (L)
**Total Estimated Effort**: 47 story points
**Target Timeline**: Phase 1 (1 week) → Phases 2-5 (4 weeks parallel, or 4-5 weeks sequential)

---

## Executive Summary

The Family Gifting Dashboard requires a comprehensive mobile-first redesign to fix critical usability blockers and deliver an iOS-native experience. This plan organizes the work into 5 progressive phases:

1. **Phase 1 (CRITICAL)**: Fix sidebar visibility, viewport height, touch targets, and safe areas - 11.5 pts
2. **Phase 2**: Complete bottom navigation and responsive layouts - 9 pts
3. **Phase 3**: Add swipe gestures, pull-to-refresh, and haptics - 7 pts
4. **Phase 4**: Implement PWA offline support and push notifications - 10.5 pts
5. **Phase 5**: Advanced UX with animations, skeleton loading, dark mode - 9 pts

Phase 1 is critical and blocks nothing else; Phases 2-5 can execute in parallel after Phase 1 stabilizes. Estimated total effort is 47 story points, achievable in 4-5 weeks with proper parallelization.

---

## Implementation Strategy

### Approach & Sequencing

Unlike typical backend-first architecture (Database → Repository → Service → API), this feature is **frontend-heavy with no database changes**. We organize work around the 5 PRD phases, which represent progressive enhancement:

1. **Phase 1**: Foundation fix (sidebar, viewport, touch targets)
2. **Phase 2**: Navigation & layout overhaul
3. **Phase 3**: Gesture & interaction enhancements
4. **Phase 4**: PWA & offline support
5. **Phase 5**: Advanced UX polish

### Parallel Work Opportunities

- **Phase 1**: Single-threaded, critical path - must complete first
- **Phases 2-5**: Can proceed in parallel after Phase 1
  - Phase 2 (nav/layout) and Phase 4 (PWA) are independent
  - Phase 3 (gestures) enhances Phase 2
  - Phase 5 (advanced UX) enhances Phases 2-3

### Critical Path

Phase 1 completion is the critical path blocking all downstream work. Estimated 5-7 working days to fix:
- Sidebar visibility
- Viewport height (100dvh)
- Touch target audit & fixes
- Safe area insets
- Device testing validation

---

## Phase Breakdown

### Phase 1: Critical Mobile Issues (Foundation)

**Duration**: 5-7 working days
**Dependencies**: None
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer
**Priority**: CRITICAL

#### Phase 1 Overview

Fix foundational mobile usability blockers: sidebar covering content, viewport height issues, small touch targets, and missing safe area insets. This phase makes the app usable on mobile; subsequent phases add polish.

#### Phase 1 Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|---------------------|--------------|
| MOB-101 | Fix sidebar visibility on mobile | Hide sidebar completely on mobile (<768px), show bottom nav | Sidebar hidden on all mobile devices, main content fully visible on iPhone SE, 12, 13, 14 in portrait and landscape | 2 pts | ui-engineer-enhanced | None |
| MOB-102 | Implement responsive AppLayout | Refactor AppLayout component for mobile: header top (sticky), main flex center, bottom nav bottom (sticky), use 100dvh | Layout renders correctly on all breakpoints, no layout shift on iOS address bar toggle, tested on real devices | 2 pts | ui-engineer-enhanced, frontend-developer | None |
| MOB-103 | Audit & fix touch targets (≥44x44px) | Audit all interactive elements (buttons, links, inputs, icons) and fix any <44px | All interactive elements ≥44x44px, audited with automated tool + manual review, no violations remain | 2.5 pts | ui-engineer-enhanced | MOB-102 |
| MOB-104 | Apply safe area insets to fixed elements | Add safe area CSS utilities and apply to header, bottom nav, full-width backgrounds for notch, home indicator, keyboard | Header and bottom nav respect safe areas on iPhone 12/13/14 Pro, notch doesn't cover content, home indicator doesn't interfere, tested on devices | 1.5 pts | frontend-developer | MOB-102 |
| MOB-105 | Fix viewport height (100dvh instead of 100vh) | Replace all 100vh with 100dvh, update CSS, test iOS address bar behavior | No layout shift when iOS address bar hides/shows, Lighthouse performance test passes, responsive tested on real iOS device | 1 pt | frontend-developer | MOB-104 |
| MOB-106 | Increase mobile typography & spacing | Increase heading sizes (18px+) and body text (14px+), add minimum spacing (16px) on cards and sections | Text readable on mobile without zooming, spacing doesn't feel cramped, tested on small screens | 1 pt | ui-engineer-enhanced | MOB-102 |
| MOB-107 | Mobile device testing & QA | Test on real iOS devices (iPhone SE, 12, 13, 14) in portrait and landscape, document findings | All Phase 1 acceptance criteria met on real devices, no critical issues, findings documented, ready to merge to main | 2 pts | frontend-developer, testing specialist | MOB-106 |

**Phase 1 Total**: ~11.5 story points

**Phase 1 Quality Gates:**

- [ ] Sidebar completely hidden on mobile (verified on 3+ iOS devices)
- [ ] Main content fully visible and scrollable on mobile
- [ ] All interactive elements ≥44x44px (audited + manual)
- [ ] Safe area insets applied to fixed/sticky elements
- [ ] No layout shift on iOS address bar toggle
- [ ] No 100vh usage in codebase (all replaced with 100dvh)
- [ ] Lighthouse mobile score ≥90
- [ ] WCAG color contrast passing (4.5:1)
- [ ] E2E test: Open on iPhone, verify content visible, navigation works
- [ ] No critical issues on real iOS devices

**Phase 1 Key Files to Modify:**
- `apps/web/components/shared/AppLayout.tsx` (main layout restructure)
- `apps/web/components/ui/button.tsx` (touch target fix)
- `apps/web/components/ui/input.tsx` (touch target fix)
- `apps/web/components/ui/avatar.tsx` (touch target audit)
- `apps/web/app/globals.css` (100dvh, safe area utilities)
- `apps/web/app/layout.tsx` (viewport meta tag verification)
- `apps/web/components/shared/Header.tsx` (safe area padding)
- `apps/web/components/shared/MobileNav.tsx` (stub completion)

---

### Phase 2: Mobile Navigation & Layout Overhaul

**Duration**: 5-7 working days (can start after Phase 1 complete)
**Dependencies**: Phase 1 complete
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer
**Priority**: HIGH

#### Phase 2 Overview

Build on Phase 1's foundation by completing bottom navigation, responsive page layouts, mobile-optimized forms, and tablet support. This phase makes the app navigable and usable across all pages.

#### Phase 2 Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|---------------------|--------------|
| MOB-201 | Complete bottom navigation (5 tabs) | Implement fully functional MobileNav with 5 tabs: Dashboard, People, Occasions, Lists, More (menu) | All 5 tabs clickable and functional, active state visually clear, icons + labels present, responsive on all screen sizes, works on all pages | 2 pts | ui-engineer-enhanced, frontend-developer | MOB-107 |
| MOB-202 | Responsive page layouts (mobile-first stacking) | Refactor all page layouts to stack single-column on mobile, multi-column on tablet+ | Dashboard, People, Occasions, Lists pages render single-column on <768px, grid/multi-column on ≥768px, tested on real devices | 2 pts | frontend-developer | MOB-201 |
| MOB-203 | Touch-friendly forms & inputs | Audit gift creation, person edit forms; ensure 44px+ input height, large submit button, mobile-optimized spacing | Gift form, person edit, and other forms work on mobile without excessive scrolling, all inputs 44px+, tested with iOS keyboard | 2 pts | ui-engineer-enhanced | MOB-202 |
| MOB-204 | Mobile-responsive modals/dialogs | Audit all modals; ensure 90% width on mobile, max-width 540px, scrollable content, close button always accessible | Modals don't overflow, close button not covered by keyboard, tested on iPhone with keyboard visible, responsive on all sizes | 1.5 pts | ui-engineer-enhanced | MOB-203 |
| MOB-205 | Tablet optimization (iPad portrait/landscape) | Test and optimize for tablet breakpoint (768-1024px and larger), ensure multi-column grids work in both orientations | iPad portrait and landscape both render correctly, grids responsive, tested on actual iPad, no layout issues | 1.5 pts | frontend-developer | MOB-204 |

**Phase 2 Total**: ~9 story points

**Phase 2 Quality Gates:**

- [ ] Bottom navigation 5 tabs all functional
- [ ] Bottom nav active state clearly indicates current page
- [ ] All pages single-column on mobile, multi-column on tablet
- [ ] Forms work without excessive scrolling on mobile
- [ ] Modals properly sized and don't overflow
- [ ] Tablet layouts tested on actual iPad
- [ ] No horizontal scroll on main content (except carousels)
- [ ] Lighthouse mobile score ≥90
- [ ] E2E: Navigate all tabs, verify content loads correctly
- [ ] No critical issues on devices

**Phase 2 Key Files to Modify:**
- `apps/web/components/shared/MobileNav.tsx` (complete implementation)
- All page components (`apps/web/app/*/page.tsx`)
- `apps/web/components/ui/dialog.tsx` (modal sizing)
- `apps/web/components/forms/*` (form optimization)
- Tailwind responsive utility usage throughout

---

### Phase 3: Touch Interactions & Gestures

**Duration**: 4-5 working days (can run parallel with Phase 2-4)
**Dependencies**: Phase 2 complete (or can start mid-Phase 2 on gesture foundation)
**Assigned Subagent(s)**: frontend-developer, mobile-app-builder
**Priority**: HIGH

#### Phase 3 Overview

Add delightful iOS-native touch interactions: swipe gestures, pull-to-refresh, haptic feedback, and active/press states. This phase enhances the feel and usability of navigation and list interactions.

#### Phase 3 Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|---------------------|--------------|
| MOB-301 | Swipe-to-go-back gesture | Implement swipe right gesture on detail pages (list detail, person detail) to go back | Swipe right on detail pages triggers back navigation, doesn't conflict with browser swipe, works on real iOS devices, smooth animation | 2 pts | frontend-developer, mobile-app-builder | MOB-202 |
| MOB-302 | Pull-to-refresh on lists | Add pull-to-refresh component to list and dashboard pages | Visual pull-down indicator appears, spinner shows during refresh, success feedback (e.g., checkmark), works on mobile | 1.5 pts | frontend-developer | MOB-202 |
| MOB-303 | Haptic feedback on actions | Integrate Vibration API for light haptic feedback on button taps and critical actions (delete, confirm) | Button taps generate light haptic feedback on supported devices, graceful fallback on unsupported (no error), feature-detected | 1.5 pts | mobile-app-builder | MOB-202 |
| MOB-304 | Mobile active/press states | Audit all tappable elements, ensure active/press state visible (color change, scale, highlight) | All buttons, links, list items have visible active/press state, no hover-only styles on mobile, tested on touch | 1 pt | ui-engineer-enhanced | MOB-202 |
| MOB-305 | 60fps animations on mobile | Ensure all gesture animations and transitions run at 60fps on modern devices (iPhone 12+) | Gesture animations smooth at 60fps on iPhone 12/13/14, 30fps acceptable on older devices, DevTools profiling confirms | 1 pt | frontend-developer | MOB-301 |

**Phase 3 Total**: ~7 story points

**Phase 3 Quality Gates:**

- [ ] Swipe-right gesture works on detail pages, back navigation functions
- [ ] Pull-to-refresh appears, animates, refreshes data, shows success state
- [ ] Haptic feedback on button taps (light vibration)
- [ ] All tap targets have visible active/press state
- [ ] No hover-only styles on mobile views
- [ ] Animations at 60fps on modern devices (verified with DevTools)
- [ ] Respects prefers-reduced-motion for accessibility
- [ ] E2E: Swipe, pull-to-refresh, tap with haptic feedback
- [ ] No critical issues on devices

**Phase 3 Key Files to Modify:**
- Create/update gesture handlers (swipe library integration or custom)
- `apps/web/components/shared/PullToRefresh.tsx` (new component)
- Button/interactive components for press states
- Animation timing adjustments

---

### Phase 4: PWA Enhancement & Offline Support

**Duration**: 5-7 working days (can run parallel with Phase 2-3)
**Dependencies**: Phase 1 complete
**Assigned Subagent(s)**: frontend-developer, nextjs-architecture-expert
**Priority**: HIGH

#### Phase 4 Overview

Implement PWA features for installation and offline access: fix manifest, implement service worker caching, enable offline mode, add Web Push API for notifications, and support home screen installation. This phase enables the app to work offline and launch like a native app.

#### Phase 4 Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|---------------------|--------------|
| MOB-401 | Fix PWA manifest for iOS | Update manifest.json with Apple-specific fields (apple-mobile-web-app-capable, apple-mobile-web-app-status-bar-style, icons for iOS, etc.) | Manifest passes web.dev validation, app installable on iOS home screen, icons appear correctly at 180x180 and 512x512 | 1.5 pts | nextjs-architecture-expert | MOB-107 |
| MOB-402 | Service worker offline caching | Implement service worker that caches GET endpoint responses (lists, gifts, persons, occasions) for offline access | Lists, gifts, persons, occasions load from cache offline without errors, cache strategy (network-first for dynamic, cache-first for static) implemented | 2.5 pts | frontend-developer, nextjs-architecture-expert | MOB-401 |
| MOB-403 | Offline indicator & read-only mode | Add offline status indicator (badge/tooltip), disable mutations offline with user-friendly error message | "Offline" badge clearly visible when offline, mutations blocked with message "You're offline. Changes will sync when online.", offline state testable | 1.5 pts | ui-engineer-enhanced | MOB-402 |
| MOB-404 | Web Push API integration | Integrate Web Push API for push notifications on iOS 16.4+ and Android, request permission flow, display in-app notifications | Permission request shown on second/third visit, push notifications received on iOS 16.4+, displayed in app or as system notification | 2 pts | frontend-developer | MOB-403 |
| MOB-405 | Install prompt & home screen support | Implement install prompt for iOS (<16.4 shows "Add to Home Screen", ≥16.4 uses Web Install API, Android shows banner) | App installable on home screen, launches full-screen in standalone mode (no address bar), status bar color correct | 1.5 pts | frontend-developer | MOB-404 |
| MOB-406 | Network transition handling | Detect online → offline transitions, gracefully handle reconnection, sync queued mutations when online | Smooth detection of online/offline transitions, queued mutations sync when reconnected, no stale data issues, tested offline-to-online | 1.5 pts | frontend-developer | MOB-403 |

**Phase 4 Total**: ~10.5 story points

**Phase 4 Quality Gates:**

- [ ] Manifest passes web.dev validation
- [ ] App installable on iOS home screen
- [ ] Service worker installed and caching correctly
- [ ] Offline mode: lists/gifts load from cache, no errors
- [ ] Offline badge visible and clear
- [ ] Mutations disabled offline with error message
- [ ] Web Push API integrated, permissions requested
- [ ] Install prompt shows on appropriate devices
- [ ] Standalone app mode works (full-screen, status bar styled)
- [ ] Offline-to-online transition smooth, mutations synced
- [ ] E2E: Install app, go offline, load data, offline indicator shows

**Phase 4 Key Files to Modify:**
- `apps/web/public/manifest.json` (update with Apple fields)
- `apps/web/public/service-worker.ts` (create/update service worker)
- `apps/web/app/layout.tsx` (service worker registration)
- Create offline utility/hook (offline detection, status indicator)
- Update mutation hooks to check offline status

---

### Phase 5: Advanced Mobile UX & Optimization

**Duration**: 6-8 working days (can run parallel with later Phase 4)
**Dependencies**: Phases 2-3 mostly complete
**Assigned Subagent(s)**: ui-engineer-enhanced, frontend-developer
**Priority**: MEDIUM

#### Phase 5 Overview

Polish the mobile experience with gesture animations, skeleton loaders, dark mode, empty states, and optional advanced features (navigation drawer, bottom sheets). This phase elevates UX from functional to delightful.

#### Phase 5 Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|---------------------|--------------|
| MOB-501 | Gesture-driven page transitions | Add smooth slide-in/slide-out animations on page transitions, respect prefers-reduced-motion | Transitions smooth 300-400ms, 60fps, motion respects accessibility settings, tested on real device | 2 pts | frontend-developer | MOB-305 |
| MOB-502 | Skeleton loading states | Create skeleton components, add to all async data loads (lists, gifts, persons, dashboard) | Skeletons appear while loading, smooth replace with actual content, prevents perceived lag, tested on slow network | 1.5 pts | ui-engineer-enhanced | MOB-305 |
| MOB-503 | Navigation drawer (optional) | Create slide-in drawer from left with profile, settings, logout, full safe area support | Drawer slides in from left, safe areas respected, profile/settings accessible, alternative to or complement to bottom nav | 2 pts | ui-engineer-enhanced, frontend-developer | MOB-202 |
| MOB-504 | Bottom sheets for actions | Implement bottom sheet component for filters, actions, info (instead of modals), swipe-to-dismiss | Bottom sheets appear from bottom, dismissible with swipe or tap outside, responsive, tested on mobile | 1.5 pts | ui-engineer-enhanced | MOB-305 |
| MOB-505 | Dark mode support | Implement dark mode that respects iOS Dark Mode setting (prefers-color-scheme), toggle in settings | App respects system dark mode setting, dark mode toggle works, CSS changes applied, tested on iOS dark mode | 1 pt | ui-engineer-enhanced | MOB-502 |
| MOB-506 | Empty & error states | Create helpful empty state and error state components for all major views (no gifts, no lists, network error, etc.) | All major views have contextual empty state, error states helpful with actions, reduces user frustration, UX tested | 1 pt | ui-engineer-enhanced | MOB-502 |

**Phase 5 Total**: ~9 story points

**Phase 5 Quality Gates:**

- [ ] Page transitions smooth at 60fps, respect prefers-reduced-motion
- [ ] Skeleton loaders appear during loading, replace smoothly
- [ ] Navigation drawer functional, safe areas respected
- [ ] Bottom sheets appear/dismiss smoothly
- [ ] Dark mode respects system setting, toggle works
- [ ] All major views have helpful empty/error states
- [ ] Lighthouse mobile score ≥90
- [ ] E2E: Page transitions, loading states, dark mode toggle

**Phase 5 Key Files to Create/Modify:**
- Create gesture animation components/utilities
- `apps/web/components/ui/skeleton.tsx` (new)
- Create navigation drawer component
- Create bottom sheet component
- Update all page components for skeletons
- Dark mode CSS (Tailwind dark: mode)
- Empty state and error state components

---

## Risk Mitigation

### Technical Risks

| Risk | Impact | Likelihood | Mitigation Strategy |
|------|--------|-----------|-------------------|
| Sidebar CSS still visible on mobile despite hiding | Critical | Medium | Thorough testing on 5+ real iOS devices (SE, 12, 13, 14 Pro), not just DevTools; automated audit tool |
| Safe area insets applied incorrectly, notch covers content | High | Medium | Test on iPhone 14 Pro Max (largest notch), use env() CSS variables correctly, visual inspection on devices |
| Touch targets remain <44px after audit | High | Low | Automated touch target audit tool, comprehensive manual review of all UI components |
| Service worker breaks caching, users see stale data | High | Medium | Implement cache versioning/busting, test offline-to-online sync thoroughly, monitor via error tracking |
| PWA installation fails on iOS <16.4 | Medium | Low | Graceful degradation: manual "Add to Home Screen" flow for iOS <16.4, Web Install API for 16.4+ |
| Offline mode shows stale data without indicator | Medium | Medium | Clear offline badge always visible, disable mutations offline with message, user education |
| Gesture interactions conflict with browser defaults (swipe back) | Medium | Low | Test on real device with gesture handler library (Hammer.js), careful event handling to avoid conflicts |
| Haptic feedback not supported on some older devices | Low | Medium | Feature detection via Vibration API, graceful degradation (no error if unavailable) |
| Performance regression on low-end devices (iPhone SE) | Medium | Medium | Profile on actual iPhone SE, optimize bundle size, lazy-load heavy features, test frame rate |
| WebSocket reconnection fails offline, queued mutations lost | High | Low | Implement offline queue in localStorage, retry on reconnect, show warning if mutations lost |
| Compatibility issues with iPad landscape orientation | Medium | Low | Test on actual iPad in both orientations, responsive design handles most cases, verify multi-column layouts |
| Users frustrated by repeated install prompts | Low | Medium | Show prompt only once per session or on 2nd/3rd visit, easily dismissible, respect user's prior choice |
| Animation performance drops on older devices | Medium | Low | Monitor frame rate with DevTools, reduce animation complexity for low-end, use CSS animations over JS |

---

## Success Metrics & Observability

### Key Metrics to Track

| Metric | Baseline | Target | Measurement |
|--------|----------|--------|------------|
| Mobile usability (sidebar blocking) | Critical (yes) | Fixed (0 reports) | QA testing, user feedback |
| Touch target compliance | <50% | 100% (all >44x44px) | Automated audit + QA verification |
| Safe area inset coverage | ~30% | 100% (all fixed elements) | Code audit + visual device testing |
| Viewport height correctness | Broken (100vh) | Fixed (100dvh everywhere) | Device testing, address bar toggle verification |
| Mobile page load time (3G) | Not measured | <2s Lighthouse target | Web Vitals monitoring, Lighthouse |
| Sidebar hidden on mobile (verified) | Bug | 0 failures on 5+ devices | Real device testing matrix |
| Bottom nav functionality | 0% (stub) | 100% (all 5 tabs working) | QA testing of navigation |
| PWA installation success | 0% | >50% (iOS + Android) | Analytics, install logs |
| Offline functionality | N/A | Read-only cache access | QA offline testing |
| Push notification opt-in | N/A | >30% (iOS 16.4+) | Analytics, permission logs |
| Mobile user satisfaction | Frustrated | >85% satisfaction | In-app surveys, app reviews |
| Mobile session duration | <5 min avg | >10 min avg | Analytics dashboard |
| Mobile crash rate | Not measured | <0.1% | Error tracking (Sentry) |

### Observability Implementation

**Logging:**
- Log device info on app load (userAgent, screen size, iOS version, viewport size)
- Log performance metrics (paint timing, interaction latency, FCP, LCP)
- Log offline transitions and reconnection events
- Log service worker installation, update, and cache events
- Log push notification permission requests and receipt

**Analytics Events:**
- `app_installed` - PWA installation success
- `bottom_nav_click` - Navigation between tabs
- `gesture_swipe_back` - Swipe back usage
- `pull_to_refresh` - Pull-to-refresh usage
- `offline_mode_start` / `offline_mode_end` - Offline duration
- `touch_target_hit` - Touch interaction heatmap
- `gesture_success` / `gesture_failure` - Gesture reliability

**Monitoring:**
- Lighthouse CI integration (every PR)
- Real device testing via BrowserStack or similar
- Sentry error tracking for mobile crashes
- Core Web Vitals monitoring (LCP, FID, CLS)
- Service worker update success rate tracking

---

## Testing Strategy

### Unit Tests

- Touch target size utilities and validation
- Safe area inset calculations
- Offline mode detection logic (navigator.onLine)
- Pull-to-refresh trigger calculations
- Haptic feedback feature detection
- Gesture detection (tap, swipe, pull)

### Integration Tests

- AppLayout responsive behavior (sidebar visibility at breakpoints)
- Navigation routing on bottom nav tabs
- Service worker cache behavior (store, retrieve, invalidate)
- Push notification permission flow
- Offline-to-online transition and mutation sync

### E2E Tests (Playwright)

**Phase 1 E2E:**
```gherkin
Scenario: Mobile viewport shows no sidebar
  When I open app on iPhone SE viewport
  Then sidebar is hidden
  And main content is fully visible
  And bottom nav is visible

Scenario: Touch targets are tappable
  When I open gift form on mobile
  Then all input fields are at least 44x44px
  And all buttons are tappable without zoom

Scenario: Safe areas respected
  When I open on iPhone 14 Pro (with notch)
  Then notch doesn't cover header
  And home indicator doesn't cover bottom nav
```

**Phase 2 E2E:**
```gherkin
Scenario: Bottom nav navigation works
  When I tap "People" tab
  Then People page loads
  And "People" tab is marked active

Scenario: Responsive layout on tablet
  When I open on iPad (landscape)
  Then content is multi-column
  And no horizontal scroll on main content
```

**Phase 3 E2E:**
```gherkin
Scenario: Swipe back navigation
  When I open detail page
  And I swipe right
  Then I return to previous page
  And animation is smooth

Scenario: Pull-to-refresh works
  When I pull down on list
  Then spinner appears
  And data refreshes
  And success feedback shows
```

**Phase 4 E2E:**
```gherkin
Scenario: PWA installation
  When I tap install on iOS home screen
  And app is added to home screen
  Then app opens full-screen (no address bar)

Scenario: Offline access
  When I go offline
  And I open app
  Then dashboard loads from cache
  And offline badge appears
  And mutations are disabled
```

**Phase 5 E2E:**
```gherkin
Scenario: Page transitions animate
  When I navigate between pages
  Then transitions are smooth
  And animations respect prefers-reduced-motion

Scenario: Dark mode
  When I toggle dark mode
  Then UI switches to dark theme
  And colors are readable
```

### Device Testing Matrix

| Device | OS | Viewport | Portrait | Landscape | Phases |
|--------|----|----|----------|-----------|--------|
| iPhone SE (3rd gen) | iOS 17 | 375×667 | YES | YES | All (baseline) |
| iPhone 12 | iOS 17 | 390×844 | YES | YES | All |
| iPhone 13 Pro Max | iOS 17 | 428×926 | YES | YES | Phase 1 (large notch) |
| iPhone 14 Pro | iOS 17 | 393×852 | YES | YES | Phase 1 (largest notch) |
| iPad (10th gen) | iPadOS 17 | 810×1080 | YES | YES | Phase 2 (tablet) |
| Android (Pixel 6) | Android 14 | 412×915 | YES | YES | Phases 1-2 (responsive) |

### Performance Testing

- **Lighthouse audit**: Target 90+ mobile score on all pages
- **Frame rate**: 60fps on modern devices (iPhone 12+), 30fps acceptable on older
- **Service worker**: Install <500ms, cache operations <100ms
- **Network throttling**: Test on 3G (600ms latency, 400kbps down) - target <2s load
- **Bundle size**: Monitor regressions, no significant increases

### Accessibility Testing

- **axe-core**: Automated a11y audit (color contrast, ARIA labels, focus indicators)
- **VoiceOver**: Manual testing on iOS for screen reader support
- **Keyboard navigation**: Tab navigation on mobile (focus indicators visible)
- **Touch targets**: 44px minimum verified
- **Color contrast**: 4.5:1 for text (WCAG AA)
- **Reduced motion**: Animations respect prefers-reduced-motion setting

---

## Task Dependencies & Critical Path

### Dependency Chain

```
Phase 1 Foundation (11.5 pts, 5-7 days)
├── MOB-101: Sidebar visibility (2 pts)
├── MOB-102: AppLayout responsive (2 pts)
│   ├── MOB-103: Touch targets audit (2.5 pts)
│   ├── MOB-104: Safe areas (1.5 pts)
│   │   └── MOB-105: Viewport height/100dvh (1 pt)
│   └── MOB-106: Typography & spacing (1 pt)
└── MOB-107: Device testing & QA (2 pts) [blocks Phase 2-5]

Phase 2 Navigation & Layout (9 pts, 5-7 days, parallel with 3-4)
├── MOB-201: Bottom nav 5 tabs (2 pts)
├── MOB-202: Responsive layouts (2 pts)
├── MOB-203: Touch-friendly forms (2 pts)
├── MOB-204: Mobile modals (1.5 pts)
└── MOB-205: Tablet optimization (1.5 pts)

Phase 3 Gestures & Interactions (7 pts, 4-5 days, parallel with 2-4)
├── MOB-301: Swipe-to-go-back (2 pts)
├── MOB-302: Pull-to-refresh (1.5 pts)
├── MOB-303: Haptic feedback (1.5 pts)
├── MOB-304: Active/press states (1 pt)
└── MOB-305: 60fps animations (1 pt)

Phase 4 PWA & Offline (10.5 pts, 5-7 days, parallel with 2-3)
├── MOB-401: Manifest for iOS (1.5 pts)
├── MOB-402: Service worker caching (2.5 pts)
├── MOB-403: Offline indicator (1.5 pts)
├── MOB-404: Web Push API (2 pts)
├── MOB-405: Install prompt (1.5 pts)
└── MOB-406: Network transitions (1.5 pts)

Phase 5 Advanced UX (9 pts, 6-8 days, parallel with late Phase 4)
├── MOB-501: Gesture animations (2 pts)
├── MOB-502: Skeleton loaders (1.5 pts)
├── MOB-503: Navigation drawer (2 pts)
├── MOB-504: Bottom sheets (1.5 pts)
├── MOB-505: Dark mode (1 pt)
└── MOB-506: Empty/error states (1 pt)
```

### Critical Path Analysis

**Minimum time to completion**: Phase 1 (5-7 days) + 1-2 days for Phase 2-5 to start in parallel = **5-7 days to Phase 1 done, 9-14 days total with parallelization**

**Sequential**: Phase 1 → Phase 2 → Phase 3/4 parallel → Phase 5 = **4-5 weeks**

**Optimized (recommended)**: Phase 1 → (Phases 2, 3, 4 parallel) → Phase 5 = **2.5-3 weeks**

---

## Resource Requirements

### Team Composition

| Role | Effort | Phases | Notes |
|------|--------|--------|-------|
| UI Engineer (enhanced) | 1 FTE | All | Primary component/layout work |
| Frontend Developer | 1 FTE | All | Navigation, interactions, PWA, animations |
| Mobile App Builder | 0.5 FTE | 3-4 | Gesture handling, mobile-specific patterns |
| Testing Specialist | 0.5 FTE | All | Device testing, automation, QA |
| Accessibility Reviewer | 0.25 FTE | 1, 6 | a11y audits, WCAG compliance |

### Skill Requirements

- React/Next.js component development
- CSS/Tailwind responsive design
- Service Worker & Web APIs
- iOS/Android device testing
- Accessibility (WCAG 2.1 AA)
- Performance optimization (Lighthouse, DevTools)
- Gesture libraries (Hammer.js or custom)
- PWA manifest and Web Push API

### Tools & Infrastructure

- Real iOS/Android devices for testing
- Lighthouse CI (GitHub Actions integration)
- axe-core for a11y automation
- BrowserStack or similar for device testing
- Sentry or similar for error tracking
- Performance monitoring dashboard

---

## Risk Escalation & Contingencies

### If Phase 1 Takes Longer

- **Issue**: Sidebar visibility or safe areas prove more complex than estimated
- **Contingency**: Defer Phases 2-5, extend Phase 1 by 2-3 days; focus on getting Phase 1 solid before moving forward
- **Trigger**: Mid-Phase 1 if tests reveal systemic issues

### If Touch Targets Cannot All Be 44px

- **Issue**: Some components (icons, badges) difficult to make 44px without breaking design
- **Contingency**: Implement 44px touch target radius/hit area instead of visual size; document exceptions
- **Trigger**: During MOB-103 if violations found

### If Service Worker Proves Unreliable

- **Issue**: Cache invalidation, offline mode unreliable, data sync issues
- **Contingency**: Simplify cache strategy (cache-first static only, network-first dynamic); defer Web Push to Phase 5
- **Trigger**: During MOB-402 if testing reveals issues

### If Device Testing Shows Regressions

- **Issue**: Phase 1 works in DevTools but fails on real device
- **Contingency**: Halt Phases 2-5, debug issue thoroughly before proceeding; extend Phase 1 by 1-2 days
- **Trigger**: MOB-107 if critical issues found

---

## Acceptance & Sign-Off

### Phase Readiness Criteria

Each phase ready to sign off when:
1. All tasks marked complete (acceptance criteria met)
2. All quality gates passing
3. Device testing matrix passed
4. Code review approved
5. Documentation updated
6. Ready to merge to main or deploy

### Definition of Done

A task is done when:
- [ ] Code written and tested
- [ ] All acceptance criteria verified
- [ ] Tested on real devices (mobile-first tasks)
- [ ] Code review passed
- [ ] No critical/major issues in testing
- [ ] Documentation updated
- [ ] Task moved to "Done" in Linear

---

## Communication & Status Tracking

### Standups

- Daily 15-min standups (9am) during implementation
- Focus on blockers, progress on critical path
- Device testing results shared daily

### Status Reports

- Weekly status emails: progress, blockers, risks
- Phase completion announcements
- Metrics dashboard shared weekly

### Phase Reviews

- Phase 1 review after completion (go/no-go for Phase 2-5)
- Phases 2-5 reviews after completion
- Post-implementation retrospective

### Key Stakeholders

- Product: Mobile-first goal tracked
- Design: Responsive breakpoints verified
- QA: Device testing coordinated
- DevOps: PWA deployment coordinated

---

## Post-Implementation

### Monitoring & Maintenance

- **Week 1**: Close monitoring for crashes/errors
- **Week 2-4**: Weekly metrics review
- **Month 2+**: Monthly health checks

### Metrics Dashboard

Track:
- Mobile traffic %
- Mobile user satisfaction (surveys)
- Crash rate on mobile
- Touch target violations (if any)
- PWA installation rate
- Offline mode usage
- Performance metrics (LCP, FID, CLS)

### Feedback Collection

- In-app surveys: "How's the mobile experience?" (Phase 1-2)
- Push notifications: Opt-in rate and engagement
- App store reviews (if published)
- User support tickets for mobile issues

### Iteration Planning

- Prioritize mobile issues from users
- Optimize based on usage patterns
- Plan Phase 5+ features (native wrapper, deep linking, etc.)
- Consider Android-specific optimizations

---

## Appendices

### A. Reference Files & Documentation

**Key PRD & Planning Docs:**
- `/docs/project_plans/PRDs/features/mobile-first-redesign-v1.md` (PRD)
- `/docs/project_plans/north-star/family-gifting-dash.md` (North Star, mobile goal)
- `/docs/project_plans/family-dashboard-v1/family-dashboard-v1.md` (V1 scope)

**Design & Architecture:**
- `/docs/designs/LAYOUT-PATTERNS.md` (Layout specs, responsive)
- `/docs/designs/DESIGN-TOKENS.md` (Colors, spacing, typography)
- `CLAUDE.md` (Master directives, mobile-first)
- `/apps/web/CLAUDE.md` (Web patterns, mobile constraints)

**Component Files (Phase 1 focus):**
- `apps/web/components/shared/AppLayout.tsx` (main layout)
- `apps/web/components/shared/MobileNav.tsx` (bottom nav)
- `apps/web/components/ui/button.tsx` (touch targets)
- `apps/web/components/ui/input.tsx` (touch targets)
- `apps/web/app/globals.css` (safe areas, 100dvh)

### B. Standards & Best Practices

- **WCAG 2.1 AA**: Accessibility standard for mobile
- **Core Web Vitals**: LCP, FID, CLS (Google mobile metrics)
- **Apple Human Interface Guidelines**: iOS app design
- **Material Design 3**: Android best practices
- **Tailwind Mobile-First**: CSS utility approach

### C. Tools & Libraries

| Tool | Purpose | Phase |
|------|---------|-------|
| Lighthouse | Performance audit | All |
| axe-core | Accessibility testing | 1, 6 |
| Tailwind CSS | Mobile-first styling | All |
| Radix UI | Accessible components | All |
| Hammer.js | Touch gesture library | 3 |
| Playwright | E2E testing | All |
| BrowserStack | Device testing | All |
| Sentry | Error tracking | All |

### D. Estimation Confidence

**Phase 1**: HIGH confidence (well-defined scope, clear acceptance criteria)
**Phases 2-3**: MEDIUM-HIGH confidence (depends on Phase 1 scope)
**Phases 4-5**: MEDIUM confidence (PWA complexity, browser support variance)

**Buffer**: 20% contingency added to each phase estimate

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-12-17 | Initial implementation plan created |

---

**Implementation Plan Status**: READY FOR REVIEW

**Next Steps**:
1. Review and approve implementation plan
2. Assign Phase 1 tasks to ui-engineer-enhanced and frontend-developer
3. Set up device testing environment (real iOS devices)
4. Create GitHub issues from task list
5. Schedule Phase 1 kickoff and daily standups
6. Begin Phase 1 implementation

---

**Progress Tracking:**

See `.claude/progress/mobile-first-redesign/` for phase-by-phase progress updates.

---

**Implementation Plan Version**: 1.0
**Last Updated**: 2025-12-17
**Status**: DRAFT - Ready for team review and approval
