---
title: Fresh visual evidence handoff
date: 2026-11-18
status: captured-2026-11-18
---

# Capture handoff

There are no new PNGs in this directory. The clone sandbox cannot launch Chromium (Mach-port rendezvous denied); the dispatch explicitly says not to attempt it. `leg` is also unavailable on this leg's PATH, and the delegation-router disallows nested executor dispatch from an offloaded leg. A personal native browser lane must perform this step with the built release commit. This is an unmet acceptance criterion, not a request for another design pick.

Use disposable data only: two sample users on reserved `example.test` addresses, a sample recipient, a sample holiday and an `example.com` gift URL. Never capture a live family instance for this public repository.

For every screen, capture 2–3 states at 375px or 390px wide; also check 1280px:

| Screen | Routes/states | Suggested PNG stems |
| --- | --- | --- |
| Sign in / registration | `/login`, `/register`; empty, validation, populated | `login-empty`, `login-error`, `register-filled` |
| Event shelf | `/events`; empty, populated, calendar expanded | `events-empty`, `events-filled`, `events-calendar` |
| Occurrence | `/events/<sample-id>`; empty recipient, populated gifts, save/error | `occurrence-empty`, `occurrence-filled`, `occurrence-error` |
| Capture | Global +; empty, filled, save/error | `capture-empty`, `capture-filled`, `capture-error` |
| Person / budgets | `/people/<sample-id>`, `/budgets`; empty, populated, error | `person-empty`, `person-filled`, `budgets-filled` |

Use filenames ending in `-375.png`, `-390.png` or `-1280.png`. Inspect each source PNG and record overlap, clipping, contrast, density, empty/error text and minimum touch targets. Exercise a failed API request and recovery; verify the service worker does not return an old successful response. Reload as the second user and confirm current gift phases and totals. Attach actual image pointers as `validation` evidence to the release parent and visual owner before closing either.

## Update 2026-11-18 (native browser lane)

Chromium (Playwright, iPhone 13 at 390px, iPhone SE at 375px, desktop 1280px) walked the journeys against a real PostgreSQL stack with seeded sample data (`example.test` accounts, "Sample" names). Source PNGs are in `screens/`: login empty/error, events, occurrence, capture empty/error, people, person, budgets, ideas, calendar, plus post-restart reloads for both sample accounts (`local-after-restart-*`, `lan-after-restart-*`). Persistence: stack stopped and started, both accounts signed in again and saw the same event, allowance, gift phase and totals.

Fixed after inspection: duplicate capture button; dead search and notification-badge controls; profile icon that signed out with one tap (now a labelled Sign out); "-1 groups" count; wrapped Add Person button; half-height recipient cards truncating names; hero taking a third of the phone screen; unaligned paired fields and mixed label styles; flat grey progress bar; cramped phase select; Given label overlapping the link; compose healthchecks that podman builds drop.

Still open: no search or notifications feature exists; the floating add button can sit over page controls while scrolling; People and login screens use a cooler gray/sans style than the Events screens (design-language gap, not redesigned).
