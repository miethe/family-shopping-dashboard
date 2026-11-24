# Gifting M2 mock-up evidence

Target-Node: node_01M7JFDEN7FHQPS4W2R13SPE1R

Review date: 2026-11-19. Baseline: `965a3291aaa14613772d25ffe958357581293087` (landed inline planner, PR #21). Scope: image concepts and supporting documentation only. No application, auth/users, migrations or dependency changes.

Read DESIGN-GUIDE.md, DESIGN-TOKENS.md, COMPONENTS.md, asthetic-v1.md; inspected EventHome.tsx, CalendarPanel.tsx, shared.tsx and gifting.module.css. Read the supplied node snapshots, picks JSON and HANDOFF sections 3–6. Opened both supplied reference PNGs with view_image. Private source assets were not copied into this public repository; generated imagery uses Person A/Person B and generic fictional celebrations only.

Generation: native image_gen.imagegen, ui-mockup category. Six initial generations; targeted native image edits to 02, 04 and 05. Exact initial and correction prompts: `docs/mockups/m2/prompts.json`. No CLI/API-key fallback, ICA, browser capture, app implementation, or image postprocessing. Originals were copied from the tool's generated_images output to the repository.

## Actual viewing observations

Every delivered PNG was opened using view_image. Final 02, 04 and 05 were opened again after corrections. Observations below describe the actual pixels, not just the prompts.

| File (under docs/mockups/m2/) | Dimensions | Bytes | Inspection |
|---|---:|---:|---|
| 01-home-entry.png | 1536×1024 | 1701221 | Clear forest hero → Upcoming heading → two sage rows hierarchy. Calendar view button readable and separated. Date badges, money and phases fit; no overlap or clipped edges. Serif navigation is more prominent than current component chrome. |
| 02-month.png | 1536×1024 | 1670682 | Corrected Selected date text and toolbar above planner. December starts Tuesday, 25 Friday selected, dates 1–31 present. Dark month active pill and two recipient rows legible. No overlapping grid/selected-date content. Lower shelf dates are illustrative and shelf ordering is not a sorting spec. |
| 03-upcoming-agenda.png | 1536×1024 | 1769606 | Upcoming active; mini calendar left, upcoming rows right, distinct Closed row below divider. No clipped controls or collisions. Title and small metadata are readable at full size; hero is taller/more photographic than landed sprig. Keep existing art rather than treating it as a new asset requirement. |
| 04-season-timeline.png | 1536×1024 | 1698985 | Corrected top shelf excludes closed Autumn event; Close calendar beside heading. Timeline shows Autumn 2026 Closed above Today, expanded Winter 2026 and compact Winter 2027. Labels and date badges do not collide. Small recipient phase counts are desktop-only density. Shelf above planner differs from 02/03 and is an explicit review choice. |
| 05-mobile-agenda.png | 1024×1536 | 1706983 | Corrected Dec 25 2026 / Jan 12 2027 / Nov 8 2026 dates. Upcoming heading wraps; close button, three tabs, two-line filters and cards fit drawn width. Bottom nav is separate, no observed overlap with final card. Contrast reads clearly. This is portrait concept art, not an exact 375 CSS px browser render; 44px targets/16px body/safe areas must be enforced in implementation. |
| 06-open-storyboard.png | 1659×948 | 1648584 | Three aligned scenes, arrows in gutters, labels 0/130/260ms. Closed trigger becomes Close calendar; faded middle panel and downward shelf movement communicate reveal. Intentional low contrast only in transition sample. No unexpected overlaps; dates differ from other frames, intentionally not authoritative. Reduced-motion footer fits. |

No visual accessibility contrast ratio measurement, responsive DOM measurement, interaction test or animation performance claim is made. Raster images cannot verify those. Generated header art, budgets and typography details vary; reuse production components/tokens if a direction is selected. Animation labels mirror current source timings, but are static proposals.

## Validation

Pillow opened and verified all six PNGs; all sizes nonzero. `image-manifest.json` records dimensions, bytes and SHA-256 values. Local artifact checks validate exactly six images, Markdown links, prompt JSON, image hashes and the changed-path allowlist. `git diff --check` is required before commit. No app test suite/build applies to this PNG/document-only change, so no homelab suite was attempted and no runner refusal is claimed. No browser was started: the dispatch explicitly states this sandbox cannot create Chromium pages; actual UI screenshot capture belongs to an eligible native lane if a later build needs it.

Known app constraints remain attached to existing nodes: overflow `node_01M7JVKZ9ADMESTGRE4GR0VYZM`; CommentCard flake `node_01M7JMC27M05Z2K01H7MH6KNZQ`. This work neither fixes nor closes them. No new runtime findings were discovered. Supplied inbox checked after initial read and after generation: exit 3, no messages.

## Publication handoff

The clone wrapper owns push and ONE PR to development after this leg exits. `.leg/pr-body.md` carries coverage against the brief's five acceptance statements (the supplied node has an empty acceptance_criteria array). `.leg/github-actions.json` requests post-publication PR state/base/head/check reads. PR existence and a real PR landing-queue row cannot be verified before wrapper publication. Front/steward must append the real published PR row to `~/.local/share/aos/landing-queue/family-shopping-dashboard.jsonl`, source `front:day-hub-1119`, action `squash_merge`; do not merge before Nick's mock-up review. No fabricated PR number or queue row was written.
