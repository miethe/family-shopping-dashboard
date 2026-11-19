---
title: Fresh visual evidence handoff
date: 2026-11-18
status: blocked
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
