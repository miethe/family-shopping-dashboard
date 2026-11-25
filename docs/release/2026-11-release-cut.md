---
title: November 2026 first-use release cut
date: 2026-11-18
status: in-progress
---

# First-use release cut

## Intent

“Family gift-tracking + shopping coordination dashboard with real-time Kanban collaboration” — the `purpose` of registry entry `family-shopping-dashboard` in the operator repository's `docs/05-app-registry.yaml` (read 2026-11-18). The [V1 PRD](../project_plans/family-dashboard-v1/family-dashboard-v1.md) defines the first release as two people planning a holiday together on a self-hosted mobile web app.

Release means both planners can open the same instance on their own phones and use it. A merged PR is insufficient.

## State and prior decisions

Assessment base: `965a329`, development. [PR #19](https://github.com/miethe/family-shopping-dashboard/pull/19) merged the event-first implementation; [#20](https://github.com/miethe/family-shopping-dashboard/pull/20) repaired its inherited test type errors; [#21](https://github.com/miethe/family-shopping-dashboard/pull/21) added the inline calendar. There were no open PRs at assessment.

The 2026-11-16 design decision is settled: dashboard-first home with an optional calendar, recipient envelopes, collapsible person shelves, compact capture drawer, event budgets, standalone web. Decision evidence: `evid_01M7JFBXGT3EXBB4Q5KA35CQ13`. Build within that direction; no new taste choice is needed.

The assessment found that nothing had been deployed. The separately named `night-1110-gift` handoff concerns a different product (Bottega), and supplies no deployment for this app. Live registry inspection found no deploy target for this entry.

## Core journeys

“Implemented” below describes source availability, not a successful phone run. **Browser interaction and visual acceptance are unverified in this leg.** The dispatch environment forbids launching Chromium because its Mach-port rendezvous fails before page creation. No screenshots are claimed from tests, HTML, or previous reports.

| First-use journey | Works today? Running evidence | One-line gap |
| --- | --- | --- |
| Open one address on two phones; create two accounts and sign back in | No deployed address; two distinct sample registrations, logins and authenticated profiles passed over real loopback HTTP | Select a LAN host, start the stack and prove both phones reach it. |
| Add a person, create a holiday occurrence, set a recipient allowance | Real API HTTP calls persisted the sample person, occurrence and money/count allowances; browser unverified | Prove event creation and allowance editing through the phone UI. |
| Capture a URL idea, attach it to the person/event, move through Bought → In hand → Given | Real HTTP capture and all three phase changes persisted; image upload bytes read back; browser unverified | Prove capture, visible save confirmation and persisted phase changes. |
| Partner sees the shared plan and budget totals; review past gifts | Second account read all phase changes, budget/remaining count and gift history; API restart retained the data | Prove partner refresh, budget math and history on both devices. |
| Navigate calendar and populated/empty/error states comfortably at phone width | Implemented by #21; historical capture claims are not current proof | Native browser lane must inspect fresh seeded captures. |

## Reach

**Today:** no assigned deployment host, URL or provisioned instance accounts. The existing `docker-compose.yml` is a development recipe: local persistent database storage, development JWT, published database/API ports, and browser URLs baked into the web build. `k8s/` has manifests and port-forward instructions, but no included ingress or measured deployed instance. These are recipes, not reachability evidence.

**Smallest proposed LAN path:** standalone `compose.lan.yml` on an existing Docker host selected by the owner. Both phones use `http://<chosen-private-LAN-IP>:3030` on the home Wi-Fi and register distinct logins in the same single-family instance. `deploy/lan/nginx.conf` routes web, API, uploads and WebSocket traffic through that one address; only its explicitly selected interface/port is published. Named volumes retain PostgreSQL and uploads. See [LAN runbook](lan-first-use.md).

This leg has no Docker daemon, remote-operations command grant or chosen host. It does not deploy, create accounts, configure DNS or open a route. HTTP on the trusted LAN supports first online use; service-worker/offline operation needs a secure origin and is not claimed. “Private” list and household access boundaries remain the app-ops owner's existing work, not a promise made by this single-family LAN package.

## Work mix: every merged PR in the last 30 days

GitHub merged-PR query read 2026-11-18 local time; queried `merged:>=2026-10-19` with limit 100, returned four rows, no pagination. All four fall within the 30-day window; git history corroborates them. Classify each once by primary effect:

| Class | Count | PRs | What selected the work |
| --- | ---: | --- | --- |
| User-facing feature | 2 | [#19](https://github.com/miethe/family-shopping-dashboard/pull/19), [#21](https://github.com/miethe/family-shopping-dashboard/pull/21) | Owner's 11-16 event-first picks; build work package and calendar child. |
| Polish / user-facing repair | 1 | [#18](https://github.com/miethe/family-shopping-dashboard/pull/18) | Fresh-install login failed; migration repair selected by that detected blocker. |
| Test-only | 1 | [#20](https://github.com/miethe/family-shopping-dashboard/pull/20) | Inherited type-check red. |
| Infra | 0 | — | — |
| Perf | 0 | — | — |
| Docs | 0 | — | — |

Three of four PRs change user behavior. This period does **not** establish a drift to mostly non-user-facing work. The visible release failure is reach: feature work merged without a usable deployed instance. #20 was gate repair, not additional product capability. Groom/docket selection is not established by the PR evidence.

## Cut line, ordered

1. **One LAN address with persistent storage.** Build the existing Docker path into a portable package; preserve absolute endpoint overrides for development, add same-origin endpoint support, require private secrets, and prevent stale service-worker API replay. Then host rehearsal, restart/persistence proof and both-phone sign-in.
2. **First shared holiday end to end.** Run two seeded accounts through person → event → allowance → idea → purchase phases → partner read → budgets/history; repair only observed blockers. Reuse the existing screens and landed calendar.
3. **Phone acceptance within the selected design.** Capture and inspect populated, empty and error states at 375/390px, plus a desktop check, and fix concrete clipping/contrast/density problems. No visual redesign.

| Feature ID / beneficiary | User-visible acceptance | Owner / evidence |
| --- | --- | --- |
| `FG-REACH` / both household planners | Each phone signs in at one LAN address; plans/images survive restart | [runbook](lan-first-use.md); host rehearsal open |
| `FG-PLAN` / both household planners | Capture a gift for an event/person, update its phase, and the other planner sees matching totals/history | [HTTP smoke](evidence/2026-11/http-smoke.json); browser acceptance open |
| `FG-PHONE` / each phone user | Chosen screens remain legible and operable at 375/390px in populated, empty and error states | [capture handoff](evidence/2026-11/README.md); source PNGs absent |

Release state is **branch implementation with partial runtime verification**, not deployed, on-device or owner-accepted. Feature IDs identify the cut, not new task gates.

### Below the line

Coverage expansion, test cleanup unrelated to these journeys, architecture refactors, performance tuning without a blocked journey, guest accounts/multi-family SaaS, automated price tracking, share-sheet/browser extensions, push/email notifications, external integration, year-view budget redesign, new visual directions and App Store/native packaging. External-host selection and household isolation remain open; they precede any off-LAN availability and are not bypassed here.

## Look at it

No screen layout is changed in this release package. Fresh runtime screenshots are nevertheless still required for release acceptance. See [capture handoff](evidence/2026-11/README.md) for routes, states and filenames. No source PNG exists yet; overlap, clipping, contrast, density and error presentation remain **uninspected**, not passed. Use disposable sample data for visual verification.

## Owner decisions

- Choose the existing Docker host and its private LAN IP for this instance; authorize the host deployment/rehearsal. No cloud account, spend, DNS change or outside route is required by this LAN cut.
- Once the host rehearsal passes, open the supplied LAN address on each phone on home Wi-Fi, create separate accounts, and perform the shared holiday checklist in the runbook.
- Decide the external-host/household-access proposal with app-ops only if off-LAN use is wanted. No such exposure is part of this change.

## Verification and continuation

Current evidence: [HTTP smoke](evidence/2026-11/http-smoke.json), [web HTTP responses](evidence/2026-11/web-http.json), and [Compose checks](evidence/2026-11/compose-check.json). Real loopback API and WebSocket processes ran to completion with disposable sample data; the API schema was bootstrapped with SQLAlchemy metadata in file SQLite. This does not verify PostgreSQL migrations or Docker volume persistence. Initial smoke setup was corrected to expect the API's actual unauthenticated 401 and to load all route-owned models before creating the disposable schema; no app authentication fix was needed. The production web server returned the login, registration, events, budgets, manifest and service-worker routes; client hydration was not inspected.

Production `pnpm build` passed both with existing defaults and with `NEXT_PUBLIC_API_URL=/api/v1 NEXT_PUBLIC_WS_URL=/ws`. It includes lint and TypeScript validation. The focused endpoint/cache suite passed 13 tests; the full web suite passed 638, with one skipped. Compose model validation passed without a daemon, confirmed only the selected gateway interface publishes a port, and rejected each empty required setting.

The broad API suite did not run in this assessment; a separate test run is required.

Full Docker boot, PostgreSQL migration/restart proof, browser interactions, source PNGs and both-phone acceptance remain open until their missing execution capabilities are available. No host, DNS or off-LAN route was changed.
