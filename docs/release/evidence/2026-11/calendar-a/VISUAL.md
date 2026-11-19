---
title: Inline calendar visual review
description: Inspected production captures and responsive measurements
created: 2026-11-19
---

# Visual review

Node: `node_01M7JFDEN7FHQPS4W2R13SPE1R`. Built with `pnpm build` and served on loopback port 3100. Chromium 145.0.7632.6; fixture clock November 19, 2026. All people, events and amounts are fictional. Three touched states were opened and visually inspected; the phone capture was refreshed after the final layout adjustment.

| Capture | What was actually visible |
| --- | --- |
| [Desktop Upcoming](desktop-upcoming.png), 1600×1000 | Existing forest hero and sidebar retained. Toolbar sits directly above the planner. Month navigator and agenda form two clear columns; warm date badges, recipient/phase/budget text and separate Closed row read clearly. No overlapping text or horizontal clipping; restrained density and clear heading hierarchy. |
| [Desktop Season](desktop-season.png), 1600×1000 | Scrolled to the planner. Autumn 2026 is collapsed with a Closed badge; the timeline spine leads into Winter 2026 and Winter 2027. Sage cards and forest text remain distinct. January continues below the viewport; no horizontal clipping or collision between labels and cards. |
| [Phone Upcoming](phone-upcoming.png), 375×812 | Toolbar wraps; Close calendar remains visible. Filters stack vertically and the agenda has one column, with no miniature month. The first event is fully readable with clear contrast and 16px body text. The second event continues below the fixed navigation; the existing floating add button covers part of its right edge at this scroll position. Scrolling exposes that content. Bottom-clearance assertions verify the last link can scroll above navigation. |

Phone document `scrollWidth = 375`, `innerWidth = 375`; inner main `scrollWidth = clientWidth = 375`. Desktop document width is 1600; main width is 1504, with no extra horizontal scroll. Per-capture [phone](phone-upcoming.json), [Upcoming](desktop-upcoming.json), and [Season](desktop-season.json) metrics record dimensions and controls; minimum measured target width/height is 44×44px.

Automated checks also cover home and all planner views, selected-date details, six planner axe scans, focus return, motion preferences, filter stacking and bottom clearance. Physical iPhone/notch behavior, Safari and animation frame rate were not inspected.
