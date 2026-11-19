---
title: Calendar concepts for review
description: Six placeholder-only image concepts extending the inline event planner
created: 2026-11-19
---

# Calendar from the event shelf

**Recommend A: keep the inline planner, Upcoming first.** This extends the landed planner at `965a329` (PR #21); these are review images, not a feature build. Forest/serif headings follow the current gifting UI; cream, sage, warm borders, rounded cards and restrained terracotta follow the design guide. All people, events and amounts are fictional.

| Frame | Review focus |
|---|---|
| [01 · Home entry](01-home-entry.png) | Dashboard first; Calendar view button beside Upcoming events. |
| [02 · Month](02-month.png) | Date picker and selected-date event detail; December 25 selected. |
| [03 · Upcoming agenda](03-upcoming-agenda.png) | Next celebrations, with a separate labeled Closed row. |
| [04 · Season timeline](04-season-timeline.png) | Past Autumn event collapsed; Winter events across the year boundary. |
| [05 · Phone agenda](05-mobile-agenda.png) | Wrapped toolbar, stacked filters/cards, no miniature month beside agenda. |
| [06 · Reveal storyboard](06-open-storyboard.png) | Closed → reveal → open; proposed 260ms reveal and reduced-motion alternative. |

| Direction | Scalability, animation cost and mobile trade-off |
|---|---|
| **A · Inline (recommended; illustrated)** | Reuses Month / Upcoming / Season and year filter. Closed events collapse. Long collections need bounded rendering later. Lowest additional motion cost, but expanding content moves the shelf. Phone uses one column. |
| B · Focused planner route | More room for many years; route/focus restoration adds work. Mobile gains a full page but loses immediate dashboard context. Alternative for discussion, not separately illustrated. |
| C · Mobile sheet | Fast return to home; nested scroll, safe-area, focus and sheet animation add cost. Least suitable for a long seasonal archive. Alternative for discussion, not separately illustrated. |

**Constraints:** Carry `node_01M7JVKZ9ADMESTGRE4GR0VYZM`: the dashboard was reported about 11px too wide at 375px. Require zero horizontal overflow, wrapping titles/filters, 44px touch targets, readable 16px mobile body text and bottom safe-area clearance. Raster review cannot prove these. Keep zoom enabled in any later build. Preserve Include closed, year range, saved view, Escape/trigger focus and reduced motion from PR #21. Use frame 02/03 toolbar order; frame 04 explores a shelf above the planner. Avoid duplicating the same full cards twice in a later implementation.

**Pick questions for Nick:** (1) Keep A, or explore B/C? (2) Keep Upcoming as the initial view and remember later selections, or start on Month/Season? (3) Keep closed events included and collapsed in Season? (4) Prefer the shelf above the planner (04), or planner directly below the toolbar (02/03)? (5) Keep the restrained 260ms reveal, with immediate reduced-motion switching?

**Visual review:** All six PNGs opened and inspected. No unintended text overlap or edge clipping observed; dark-on-cream hierarchy reads clearly. Phone tabs/filters/cards fit the drawn canvas; actual 375px layout remains unverified. Season's small phase labels need enlargement on phone. Storyboard's middle fade is intentional; its dates and all cross-frame amounts are illustrative, not a data specification. Header art varies between generated frames; reuse existing art/chrome if built. Detailed per-frame observations and dimensions: [evidence](../../../.claude/reports/gifting-m2-mockups/evidence.md). Built-in image generation prompts and corrections: [prompts.json](prompts.json).
