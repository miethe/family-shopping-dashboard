# Development Observations - December 2025

This file tracks observations, learnings, patterns, and insights discovered during development in December 2025.

## Architecture Patterns

1. [DONE] Centralize modal state and lazy-render Radix portals; per-card hidden modals balloon DOM/portal count and corrupt navigation.
2. [DONE] Guard entity detail fetches (person/occasion/list) with `open` to avoid background subscriptions and race conditions during route transitions.
3. [DONE] Keep cross-page portals outside Suspense boundaries to prevent unmount races when navigation tears down async trees.

## Performance Insights

1. [DONE] Always-mounted nested modals trigger redundant React Query fetches and portal mounts, spiking main-thread work and crashing client-side nav.
2. [DONE] Gating queries on `open` and skipping detail fetches for absent IDs keeps `/gifts` → sidebar navigation smooth.
3. [TODO] Parallelize only when needed and avoid N× hidden fan-out from closed components (audit remaining call sites).

## Development Workflow

1. [TODO] When adding “+” cards or linked modals, confirm they are conditionally rendered and do not prefetch until opened.
2. [TODO] Add a quick nav smoke test checklist for new portals: load `/gifts`, click sidebar routes, open/close modals.
3. [TODO] Document modal placement (inside/outside Suspense) in PR descriptions to flag potential race windows.

## Integration Patterns

1. [TODO] Ensure portals that live across routes manage their own lifecycle; avoid placing them inside components that unmount on navigation.
2. [TODO] Prefer one shared modal instance per entity type instead of duplicating instances inside list/grid items.
3. [DONE] Keep filter/lookup data non-realtime in high-traffic pages to minimize cross-topic churn during navigation.

## Testing & Quality

1. [TODO] Add regression checks for client-side nav after visiting heavy pages with modals (e.g., `/gifts` → `/lists`/`/people`/`/occasions`).
2. [TODO] Validate that closed modals do not issue network requests or open WebSocket subscriptions (assert `enabled` flags).
3. [TODO] Include Suspense + portal placement review in code review for pages using `useSearchParams`.

## Code Quality

1. [DONE] Avoid embedding modal components unconditionally; wrap them in `isOpen && <Modal />` patterns.
2. [DONE] Use derived IDs guarded by `open` to prevent fetching with `0`/null placeholders.
3. [TODO] Prefer lifting modal state to page-level providers to reduce duplicate instances and simplify cleanup.

## Technical Debt

1. [TODO] Audit remaining modals for unconditional rendering and background queries to ensure this pattern doesn’t reappear.
2. [TODO] Add lint/documentation examples showing gated modal rendering and query `enabled` usage.
3. [TODO] Consider a lightweight runtime guard that logs when portals mount while parent is closed to catch regressions early.

---

**Format**: Brief bullet points (1-2 lines per observation)
**Period**: Monthly consolidation
**Next Month**: Create observation-log-{{MM-YY}}.md for January 2026 observations
