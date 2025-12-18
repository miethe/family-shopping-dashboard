---
# === CONTEXT WORKNOTES ===
# Mobile-First Redesign development context for AI agent coordination

type: context
prd: "mobile-first-redesign"
title: "Mobile-First Redesign - Development Context"
status: "active"
created: "2025-12-17"
updated: "2025-12-17"

# Quick Reference
critical_notes_count: 0
implementation_decisions_count: 0
active_gotchas_count: 0
agent_contributors: []

# Agent Communication Index
agents: []
---

# Mobile-First Redesign - Development Context

**Status**: Active Development
**Created**: 2025-12-17
**Last Updated**: 2025-12-17

> **Purpose**: This is a shared worknotes file for all AI agents working on the Mobile-First Redesign PRD. Add brief observations, decisions, gotchas, and implementation notes that future agents should know. Think of this as a sticky-note pad for the development team.

---

## Quick Reference

**Agent Notes**: 0 notes from 0 agents
**Critical Items**: 0 items requiring attention
**Last Contribution**: None yet

---

## Implementation Decisions

> Key architectural and technical decisions made during development

### (To be filled by agents during implementation)

---

## Gotchas & Observations

> Things that tripped us up or patterns discovered during implementation

### (To be filled by agents during implementation)

---

## Integration Notes

> How components interact and connect

### (To be filled by agents during implementation)

---

## Performance Notes

> Performance considerations discovered during implementation

### (To be filled by agents during implementation)

---

## Agent Handoff Notes

> Quick context for agents picking up work

### (To be filled by agents during implementation)

---

## References

**Related Files**:
- **PRD**: `/docs/project_plans/PRDs/features/mobile-first-redesign-v1.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/mobile-first-redesign-v1.md`
- **Progress Tracking**: `.claude/progress/mobile-first-redesign/`
- **Web Patterns**: `apps/web/CLAUDE.md`
- **Project Directives**: `CLAUDE.md`

**Key Scope**:
- 5 phases: Foundation → Navigation → Gestures → PWA → Advanced UX
- Phase 1 is critical and blocks Phases 2-5
- Phases 2-5 can execute in parallel after Phase 1
- Total: 47 story points across all phases

**Critical Files to Modify**:
- `apps/web/components/shared/AppLayout.tsx` (main layout)
- `apps/web/app/globals.css` (100dvh, safe areas)
- `apps/web/components/shared/MobileNav.tsx` (bottom navigation)
- All page components for responsive layouts
- PWA manifest and service worker

---

## Development Setup Notes

### Environment & Testing

- Test on real iOS devices: iPhone SE, 12, 13, 14 Pro (with notch)
- Also test on iPad (landscape) for tablet optimization
- Use iOS Safari DevTools for testing (on Mac)
- Lighthouse CI for automated mobile score verification
- BrowserStack or similar for device farm testing

### Key Design Constraints (from CLAUDE.md)

- Mobile-first: 44x44px touch targets minimum
- Safe areas: Use `env(safe-area-inset-*)` for notch/home indicator
- Viewport: Use `100dvh` NOT `100vh` (prevents iOS address bar shift)
- Single-tenant: No RLS, simple 2-3 user model
- Real-time: WebSocket for Kanban only; React Query for most features
- PWA: Installable on iOS home screen, offline read-only access

### Phase Sequencing

**Phase 1** (Critical Foundation - Week 1):
- Sidebar visibility fix, viewport height, touch targets, safe areas
- Blocks all downstream work
- Estimated: 5-7 working days, 11.5 story points

**Phases 2-5** (Parallel - Weeks 2-5):
- Can run in parallel after Phase 1 completes
- Phase 2 & 4 independent, Phase 3 enhances Phase 2, Phase 5 enhances 2-3
- Estimated: 4-5 weeks total, 35.5 story points across 4 phases

### Common Gotchas to Watch For

1. **100vh vs 100dvh**: Always use 100dvh on mobile; 100vh causes iOS address bar shift
2. **Safe areas**: Not just for notch; also home indicator (bottom) on devices without notch
3. **Sidebar visibility**: Must test on actual devices; DevTools doesn't always show CSS issues accurately
4. **Touch targets**: 44x44px minimum includes padding; 24x24px icon + 20px padding = 64x64px container
5. **Service worker caching**: Cache versioning prevents stale data issues; test offline-to-online thoroughly
6. **Gesture conflicts**: Swipe-back gesture can conflict with browser back; test carefully
7. **Haptic feedback**: Feature detect Vibration API; graceful fallback on unsupported devices
8. **Dark mode**: Respect `prefers-color-scheme` media query; don't force light mode
9. **Keyboard**: iOS soft keyboard covers input fields; scroll into view needed for focused inputs
10. **Form inputs on mobile**: Ensure inputs grow large enough on mobile (44px min height), submit button easily tappable

### Testing Checklist (Recurring)

- [ ] Sidebar hidden on all mobile devices (<768px)
- [ ] Main content fully visible (no overflow or covering)
- [ ] All interactive elements ≥44x44px
- [ ] Safe areas respected (notch, home indicator not covering content)
- [ ] No layout shift on iOS address bar toggle
- [ ] Text readable without zoom (14px+ body, 18px+ headings on mobile)
- [ ] Forms work with iOS soft keyboard visible
- [ ] Bottom nav sticky, not covered by keyboard
- [ ] Real device testing on 3+ iOS devices (SE, 12, 14)
- [ ] Lighthouse mobile score ≥90
- [ ] No 100vh usage in codebase

