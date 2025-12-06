# Implementation Plan — enhance-12-06

## Request + FR Map

- FR1: Linked entities persist and reflect immediately in modals after link actions.
- FR2: Linked entities tab supports unlink with confirm and immediate UI removal.
- FR3: All dialogs use a shared component (no native browser dialogs).
- FR4: Gift title links to product URL (new tab) everywhere it appears.
- FR5: Gift Overview shows For (linked person with avatar/relation), Description, Quantity, Sale Price.
- FR6: Gift Overview overlays MSRP/Sale Price and Quantity/Status on the gift image bottom.
- FR7: Gifts support Additional URLs (label + URL, multiple), shown under collapsible “Other Links”.
- FR8: All entities support image from URL or upload (paste/drag-drop/file), with validation and storage.
- FR9: App shows breadcrumb navigation per page hierarchy (clickable, responsive).
- FR10: Add Gift form greys out “From URL” with tooltip “Coming Soon”; Manual is default.
- FR11: Gift modal adds “Mark as Purchased” dialog to set quantity, status, purchase date, and live refresh.

## Tasks by Phase

- Phase: Discovery
  - {"id":"DISC-ALL-01","phase":"Discovery","fr":["FR1","FR2","FR3","FR8"],"task":"Inventory current linking flows, dialog usages, and entity media handling to identify shared components/hooks and data sources.","domain":["Web","API","Docs"],"storypoints":1,"model":"GPT-5.1-Codex-Max","reasoning":"Medium","status":"[X]","success_criteria":"List of current components/APIs for linking, dialogs, and media with gaps noted for each FR."}
  - {"id":"DISC-FR8-01","phase":"Discovery","fr":["FR8"],"task":"Assess storage layer and upload pipeline (services, buckets, CDN) and any existing validation limits.","domain":["Infra","API","Web"],"storypoints":1,"model":"Claude Opus 4.5","reasoning":"High","status":"[X]","success_criteria":"Decision doc on reuse vs new upload endpoint, accepted formats/sizes, and placeholders."}
  - {"id":"DISC-FR9-01","phase":"Discovery","fr":["FR9"],"task":"Map app routing structure to derive breadcrumb generation strategy (static map vs dynamic from router).","domain":["Web","Docs"],"storypoints":1,"model":"GPT-4.1","reasoning":"Medium","status":"[X]","success_criteria":"Chosen breadcrumb strategy with route-to-label map/location of source of truth."}

### Discovery Findings (12-06)

- **DISC-ALL-01 — Linking, dialogs, media**
  - Linking flows: Gift ↔ person links are driven by `GiftDetailModal` (Linked Entities tab) and `GiftForm` via `PeopleMultiSelect`, sending `person_ids` through `useUpdateGift`/`giftApi.update`. Backend `GiftService.update` ignores `person_ids`, so links never persist; dedicated attach/detach endpoints exist (`POST /gifts/{gift_id}/people`, `DELETE /gifts/{gift_id}/people/{person_id}`) but aren’t exposed in `giftApi` or used in UI. Linked Entities tab lists people by cross-referencing `usePersons` against `gift.person_ids` and has no unlink control or optimistic refresh, so FR1/FR2 require wiring to the attach/detach endpoints plus cache updates. Other linking: `LinkGiftToListsModal` uses `useCreateListItem` and query invalidation to add gifts to lists; `LinkEntityToListModal` links lists to a person/occasion via `useUpdateList` and tabbed Dialog UI.
  - Dialog usage: Shared Radix wrappers exist (`components/ui/dialog`, `components/modals/EntityModal`) and are used for modals plus delete confirms inside entity detail modals. Several flows still use native dialogs (`window.confirm/alert`) for destructive actions (`CommentCard`, `app/occasions/[id]/page.tsx`, `app/people/[id]/page.tsx`, `app/gifts/[id]/page.tsx`), so FR3 needs a unified confirm dialog component and refactors.
  - Media handling: Entities only store URL strings (`gift.image_url`, `person.photo_url`, `user.avatar_url`); no upload endpoints, validation, or storage configuration. Frontend forms are URL inputs with simple preview/fallback icons (`GiftIcon`, AvatarFallback). `additional_urls` is an array of strings (no labels) via `UrlListInput` validation; no file-type/size checks anywhere.
- **DISC-FR8-01 — Upload/storage approach**
  - No storage backend or upload API is implemented; all images are remote URLs. Reuse the image-upload-v1 plan as the blueprint: add a storage abstraction with a local filesystem backend (PVC path `/var/app/uploads`) and keep it S3/MinIO-ready via a `StorageBackend` interface. Add a unified FastAPI upload route (e.g., `POST /upload/image`) that validates and stores originals + 400x400 thumbnails, serves via a static mount (or optional `CDN_BASE_URL`). Accepted formats: JPEG, PNG, WebP, GIF, HEIF/HEIC; max size 10MB; reject others with structured errors. Continue to allow URL ingestion (keep `image_url` fields) so “From URL” flows stay supported. Use existing fallbacks (Gift icon, Avatar initials) when no image/validation failure occurs.
- **DISC-FR9-01 — Breadcrumb strategy**
  - Strategy: Add a centralized breadcrumb builder (e.g., `apps/web/lib/navigation/breadcrumbs.ts`) that maps pathname segments to labels/links and uses existing hooks/query cache to resolve dynamic titles. Render via the existing `Breadcrumb`/`PageHeader` components so pages opt in by supplying the computed items.
  - Route map (static labels): `/dashboard` → Dashboard, `/assignments` → Assignments, `/gifts` → Gifts, `/gifts/new` → Add Gift, `/lists` → Lists, `/lists/new` → New List, `/people` → People, `/people/new` → Add Person, `/occasions` → Occasions, `/occasions/new` → Add Occasion.
  - Dynamic labels: `/gifts/[id]` and `/gifts/[id]/edit` pull `gift.name` via `useGift`; `/lists/[id]` uses `useList` name; `/people/[id]` uses `usePerson.display_name`; `/occasions/[id]` uses `useOccasion.name`. Builder should fall back to `#{id}` when data missing and prefer `queryClient.getQueryData` to avoid duplicate fetches. Source of truth lives in the new navigation helper consumed by page-level headers.

- Phase: Backend
  - {"id":"BE-FR1-01","phase":"Backend","fr":["FR1"],"task":"Fix entity-link PATCH to persist relations and return updated linked entities; add regression tests.","domain":["API","Data"],"storypoints":3,"model":"Claude Opus 4.5","reasoning":"High","status":"[ ]","success_criteria":"Linking a Person to a Gift stores relation and response includes new link; automated test covers gift/person link."}
  - {"id":"BE-FR2-01","phase":"Backend","fr":["FR2"],"task":"Expose/confirm unlink endpoint that removes relation and returns refreshed linked entities list.","domain":["API","Data"],"storypoints":2,"model":"GPT-5.1-Codex-Max","reasoning":"Medium","status":"[ ]","success_criteria":"Unlink call removes relation in DB and returns list sans entity; test covers unlink path."}
  - {"id":"BE-FR5-01","phase":"Backend","fr":["FR5","FR6"],"task":"Ensure Gift model supports description, salePrice, quantity, relation metadata for linked person; include in read/write DTOs.","domain":["API","Data"],"storypoints":2,"model":"Claude Sonnet 4.5","reasoning":"Medium","status":"[ ]","success_criteria":"Gift detail API returns description, salePrice, quantity, linked person summary; create/update accepts fields."}
  - {"id":"BE-FR7-01","phase":"Backend","fr":["FR7"],"task":"Add Additional URLs array {label,url} to Gift schema with validation and include in APIs.","domain":["API","Data"],"storypoints":2,"model":"GPT-5.1-Codex-Max","reasoning":"Medium","status":"[ ]","success_criteria":"Gift APIs store and return multiple labeled URLs; validation rejects bad URLs/empty labels."}
  - {"id":"BE-FR8-01","phase":"Backend","fr":["FR8"],"task":"Provide unified media endpoint for entity images supporting upload (file/paste/drag) and URL ingestion with size/type validation and storage.","domain":["API","Infra"],"storypoints":5,"model":"Claude Opus 4.5","reasoning":"High","status":"[ ]","success_criteria":"Entities accept image upload/URL; files stored and retrievable via CDN link; validation errors surfaced cleanly."}
  - {"id":"BE-FR11-01","phase":"Backend","fr":["FR11"],"task":"Implement mark-as-purchased mutation to set status, purchase date (now), and quantity purchased logic.","domain":["API","Data"],"storypoints":2,"model":"GPT-5.1-Codex-Max","reasoning":"Medium","status":"[ ]","success_criteria":"Mutation updates status per quantity vs needed, stamps purchase date, and returns updated gift record."}

- Phase: Frontend
  - {"id":"FE-FR1-01","phase":"Frontend","fr":["FR1"],"task":"Update link-entity flows in modals to optimistically refresh linked entities list after successful PATCH.","domain":["Web","UI"],"storypoints":2,"model":"GPT-5.1-Codex-Max","reasoning":"Medium","status":"[ ]","success_criteria":"Linking person to gift immediately shows in modal without refresh across entity modals."}
  - {"id":"FE-FR2-01","phase":"Frontend","fr":["FR2","FR3"],"task":"Add unlink icon per linked entity with confirm dialog using shared dialog component; update list in place on success.","domain":["Web","UI"],"storypoints":2,"model":"GPT-4.1","reasoning":"Medium","status":"[ ]","success_criteria":"Linked entity row shows delete control; confirm prompt uses shared dialog; unlink removes row instantly."}
  - {"id":"FE-FR3-01","phase":"Frontend","fr":["FR3"],"task":"Adopt unified dialog component across app (confirmations/alerts) and refactor existing native dialogs.","domain":["Web","UI"],"storypoints":3,"model":"Claude Sonnet 4.5","reasoning":"High","status":"[ ]","success_criteria":"All dialogs rendered via shared component with consistent styling; no native browser dialogs remain."}
  - {"id":"FE-FR4-01","phase":"Frontend","fr":["FR4"],"task":"Render Gift titles as links to product URL (target=_blank, rel safety) in lists and modals with graceful fallback when missing.","domain":["Web","UI"],"storypoints":1,"model":"GPT-5.1-Codex-Max","reasoning":"Low","status":"[ ]","success_criteria":"Gift titles become clickable when URL exists across list and modal views; missing URL shows plain text."}
  - {"id":"FE-FR5-01","phase":"Frontend","fr":["FR5"],"task":"Show linked person inline under Gift title with avatar/name/relation linking to Person modal.","domain":["Web","UI"],"storypoints":2,"model":"GPT-4.1","reasoning":"Medium","status":"[ ]","success_criteria":"Gift modal displays 'For: {avatar} {name} ({relation})' linking to person modal when link exists."}
  - {"id":"FE-FR5-02","phase":"Frontend","fr":["FR5","FR6"],"task":"Add Description, Quantity, and Sale Price inputs/display in Gift Overview and wire to API payloads.","domain":["Web","UI"],"storypoints":2,"model":"GPT-5.1-Codex-Max","reasoning":"Medium","status":"[ ]","success_criteria":"Fields appear in Overview, save and reload correctly reflect values."}
  - {"id":"FE-FR6-01","phase":"Frontend","fr":["FR6"],"task":"Overlay MSRP/Sale Price and Quantity/Status on gift image bottom with responsive layout.","domain":["Web","UI"],"storypoints":2,"model":"Claude Sonnet 4.5","reasoning":"Medium","status":"[ ]","success_criteria":"Overlay shows two rows within image area, centered/bottom-aligned, responsive without clipping."}
  - {"id":"FE-FR7-01","phase":"Frontend","fr":["FR7"],"task":"Implement Additional URLs UI with default entry, add/remove controls, validation, and collapsible 'Other Links' display with external links.","domain":["Web","UI"],"storypoints":3,"model":"GPT-5.1-Codex-Max","reasoning":"High","status":"[ ]","success_criteria":"Users can add multiple labeled URLs, validation blocks bad inputs, links render under collapsible and open in new tabs."}
  - {"id":"FE-FR8-01","phase":"Frontend","fr":["FR8"],"task":"Add image picker supporting upload/paste/drag or URL to entity create/edit forms with placeholder click target and previews.","domain":["Web","UI"],"storypoints":5,"model":"Claude Opus 4.5","reasoning":"High","status":"[ ]","success_criteria":"Entities accept image via multiple input methods, show preview, enforce size/type errors, and save image reference."}
  - {"id":"FE-FR9-01","phase":"Frontend","fr":["FR9"],"task":"Add breadcrumb component tied to router metadata and render at top of pages (desktop/mobile responsive).","domain":["Web","UI"],"storypoints":2,"model":"GPT-4.1","reasoning":"Medium","status":"[ ]","success_criteria":"Breadcrumb displays current hierarchy with clickable ancestors; adapts to mobile layouts."}
  - {"id":"FE-FR10-01","phase":"Frontend","fr":["FR10"],"task":"Set Add Gift flow to default Manual, grey out From URL option with tooltip 'Coming Soon'.","domain":["Web","UI"],"storypoints":1,"model":"GPT-5.1-Codex-Max","reasoning":"Low","status":"[ ]","success_criteria":"'Manual' preselected; 'From URL' disabled with tooltip copy; no selection confusion."}
  - {"id":"FE-FR11-01","phase":"Frontend","fr":["FR11","FR3"],"task":"Add 'Mark as Purchased' button with quantity dropdown dialog; call backend mutation and refresh modal state inline.","domain":["Web","UI"],"storypoints":3,"model":"Claude Sonnet 4.5","reasoning":"High","status":"[ ]","success_criteria":"Dialog appears over modal, updates status/purchase date/quantity, modal reflects new values without refresh."}

- Phase: Testing
  - {"id":"QA-FR1-02-01","phase":"Testing","fr":["FR1","FR2"],"task":"Add automated tests for link/unlink flows covering immediate UI updates and API assertions.","domain":["Test","Web"],"storypoints":2,"model":"GPT-5.1-Codex-Max","reasoning":"Medium","status":"[ ]","success_criteria":"Tests cover link/unlink with modal state updates and backend calls verified."}
  - {"id":"QA-FR3-11-01","phase":"Testing","fr":["FR3","FR11"],"task":"Test shared dialog rendering across app including mark-as-purchased flow.","domain":["Test","Web"],"storypoints":1,"model":"GPT-4.1","reasoning":"Low","status":"[ ]","success_criteria":"Dialogs visually consistent and functional in key flows; mark-as-purchased updates values."}
  - {"id":"QA-FR4-10-01","phase":"Testing","fr":["FR4","FR5","FR6","FR7","FR10"],"task":"Regression around Gift Overview (links, overlays, fields, additional URLs, disabled From URL).","domain":["Test","Web"],"storypoints":2,"model":"GPT-5.1-Codex-Max","reasoning":"Medium","status":"[ ]","success_criteria":"Automated checks confirm UI elements render, validations fire, and values persist."}
  - {"id":"QA-FR8-01","phase":"Testing","fr":["FR8"],"task":"Validate image upload/URL ingestion (happy paths, validation errors, paste/drag-drop).","domain":["Test","Web"],"storypoints":2,"model":"Claude Opus 4.5","reasoning":"High","status":"[ ]","success_criteria":"Tests cover upload methods, size/type limits, and preview/render across entity types."}
  - {"id":"QA-FR9-01","phase":"Testing","fr":["FR9"],"task":"Test breadcrumb rendering across main routes and responsive layouts.","domain":["Test","Web"],"storypoints":1,"model":"GPT-4.1","reasoning":"Low","status":"[ ]","success_criteria":"Breadcrumb shows correct hierarchy per route and remains usable on mobile widths."}

- Phase: Docs
  - {"id":"DOC-FR4-11-01","phase":"Docs","fr":["FR4","FR7","FR8","FR11"],"task":"Update user/admin docs for gift links, additional URLs, image upload, and mark-as-purchased flow; note From URL disabled state.","domain":["Docs"],"storypoints":1,"model":"GPT-5.1-Codex-Max","reasoning":"Low","status":"[ ]","success_criteria":"Docs describe new fields/flows and constraints; tooltips and dialog behaviors captured."}

## Tracking

- [X] DISC-ALL-01 — Inventory linking/dialog/media components.
- [X] DISC-FR8-01 — Decide upload/storage approach.
- [X] DISC-FR9-01 — Choose breadcrumb strategy.
- [ ] BE-FR1-01 — Fix link persistence + response.
- [ ] BE-FR2-01 — Unlink endpoint returns refreshed list.
- [ ] BE-FR5-01 — Gift fields in API/DTOs.
- [ ] BE-FR7-01 — Additional URLs schema + validation.
- [ ] BE-FR8-01 — Media upload/URL pipeline.
- [ ] BE-FR11-01 — Mark-as-purchased mutation.
- [ ] FE-FR1-01 — Immediate linked list refresh on link.
- [ ] FE-FR2-01 — Unlink control + confirm dialog.
- [ ] FE-FR3-01 — Unified dialog adoption.
- [ ] FE-FR4-01 — Gift titles link to product URL.
- [ ] FE-FR5-01 — For: avatar/name/relation link.
- [ ] FE-FR5-02 — Description/Quantity/Sale Price fields.
- [ ] FE-FR6-01 — Image overlay for prices/quantity/status.
- [ ] FE-FR7-01 — Additional URLs UI + collapsible display.
- [ ] FE-FR8-01 — Image picker with upload/paste/URL.
- [ ] FE-FR9-01 — Breadcrumb component.
- [ ] FE-FR10-01 — From URL disabled, Manual default.
- [ ] FE-FR11-01 — Mark-as-purchased dialog + refresh.
- [ ] QA-FR1-02-01 — Link/unlink tests.
- [ ] QA-FR3-11-01 — Dialog + mark-as-purchased tests.
- [ ] QA-FR4-10-01 — Gift overview regressions.
- [ ] QA-FR8-01 — Image ingestion tests.
- [ ] QA-FR9-01 — Breadcrumb tests.
- [ ] DOC-FR4-11-01 — Docs updates.
