---
title: Refine the inline gifting calendar and mobile layout
description: Review-ready PR title, behavior, validation and evidence
created: 2026-11-19
---

# Refine the inline gifting calendar and mobile layout

Extends PR #21 from `965a329` on the event home/dashboard. Upcoming now shows compact celebration rows and a separate collapsed Closed section. Season retains collapsed closed events and makes chronology visible across the year boundary. Month retains selected-date details, using a native date picker on phones. Opening the planner hides duplicate shelf cards.

Nick's November 19 picks are preserved: **A: Inline**, **Upcoming, remembered**, **Planner under toolbar** (02/03 ordering), and **Keep both** (closed events included/collapsed in Season, 260ms reveal, immediate reduced motion). Existing header art, chrome, Include closed, year range, saved view and Escape/trigger focus return remain.

Mobile filters/cards stack, body text is at least 16px, phase labels enlarge, and targets measure at least 44px. Bottom padding includes the safe-area inset and clears fixed navigation. Zoom remains enabled. Home and every planner view satisfy document and inner-main horizontal-overflow assertions at 375px. Planner headings now pass axe; the desktop profile target was enlarged to 44px.

## Validation

Commands run from `apps/web`:

| Command | Result |
| --- | --- |
| `pnpm lint` | Pass; 0 errors, 2 existing image warnings |
| `pnpm tsc --noEmit` | Pass; 0 errors |
| `pnpm test --run` | 33 files passed; 627 passed, 1 skipped |
| `pnpm build` | Pass; production build |
| `pnpm exec playwright test -c playwright.calendar.config.ts` with evidence enabled | 8 passed, 0 skipped; 375×812 and 1600×1000; six planner axe scans with 0 violations |
| `git diff --check` | Pass |

[Visual review and three captures](VISUAL.md). [Browser tests](../../../../../apps/web/__tests__/e2e/calendar.spec.ts) use fictional API/auth stubs; no backend is required. Real API/WebSocket integration, Safari, physical safe-area insets and animation performance remain unverified.

## Reproduce

From `apps/web`, build and run `pnpm start --hostname 127.0.0.1 --port 3100`. In another terminal:

```bash
CALENDAR_EVIDENCE_DIR=../../docs/release/evidence/2026-11/calendar-a pnpm exec playwright test -c playwright.calendar.config.ts
```

Set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` when using an existing Chromium binary; this run used cached Chromium 145 because Playwright's expected browser revision was absent. Without the evidence variable, six functional tests run and two capture cases skip. Service workers are blocked so route stubs remain deterministic across reload.

Local commits only; dispatcher owns push and PR creation.
