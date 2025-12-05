---
title: "Implementation Plan: Person Advanced Interests & Size Enhancements"
description: "Add an Advanced Interests tab on Person modals with structured preference capture plus improved multi-size input."
audience: [ai-agents, developers, product]
tags: [implementation-plan, person, interests, sizes, ui, api]
created: 2025-12-05
updated: 2025-12-05
category: "implementation-planning"
status: draft
related_requests:
  - "docs/project_plans/requests/enhance-12-03.md"
  - "docs/project_plans/requests/enhance-12-04.md"
---

# Implementation Plan: Person Advanced Interests & Size Enhancements

**Plan ID**: `IMPL-2025-12-05-PERSON-ADV-INTERESTS`  
**Author**: Codex Agent  
**Objective**: Add a new "Advanced Interests" tab on the Person modal (view + edit) with structured, optional fields that surface only when populated, and upgrade the Sizes input to support multiple type/value rows with an inline add pattern. Creation flow stays minimal (overview-only fields: primary sizes, interests, constraints, notes).

---

## Goals
- Capture richer preference signals to make gifting easier (wine, hobbies, tech/travel, experience types, style/accessories, constraints).
- Keep Person creation lightweight; defer all advanced data to edit mode.
- Ensure the view modal only renders populated advanced fields, grouped by category.
- Improve Sizes UX to add multiple typed entries inline with a "+" affordance.

## Non-Goals
- No recommender or auto-suggestion logic in this iteration.
- No new notification logic or reminders based on interests.
- No change to gifting flows beyond surfacing richer person info.

---

## Scope & Outcomes
- **New tab**: "Advanced Interests" on Person Detail modal with editable form and view rendering.
- **Data model**: Structured `advanced_interests` JSON profile and normalized `size_profile` array (migrated from existing `sizes` map).
- **Creation flow**: Only overview fields (display name, relationship, birthdate, primary sizes, interests, constraints, notes, photo URL, groups). Advanced fields hidden until edit.
- **Display rules**: Only populated advanced fields render on view; empty categories collapse.
- **Editing UX**: Sectioned form with toggles, chips, and text inputs; inline "+" to add size rows and freeform strings where appropriate.

---

## Data Model & API

### New/Updated Fields (Person)
- `size_profile`: `[{ type: str, value: str, fit?: str, brand?: str, notes?: str }]` (JSON, nullable)
- `advanced_interests`: JSON object with categories (all optional):
  - `food_and_drink`: `likes_wine?: bool`, `wine_types?: [str]`, `beverage_prefs?: [str]` (coffee/tea/cocktails/beer/spirits/mocktails), `coffee_style?: str`, `tea_style?: str`, `spirits?: [str]`, `dietary?: [str]`, `favorite_cuisines?: [str]`, `sweet_vs_savory?: str`, `favorite_treats?: str`.
  - `style_and_accessories`: `preferred_colors?: [str]`, `avoid_colors?: [str]`, `preferred_metals?: [str]`, `fragrance_notes?: [str]`, `jewelry_sizes?: { ring?: str, bracelet?: str, necklace?: str }`, `accessory_prefs?: [str]`, `style_notes?: str`.
  - `hobbies_and_media`: `hobbies?: [str]`, `creative_outlets?: [str]`, `sports_played?: [str]`, `sports_teams?: [str]`, `reading_genres?: [str]`, `favorite_authors?: [str]`, `music_genres?: [str]`, `favorite_artists?: [str]`, `fandoms_or_series?: [str]`, `board_games?: [str]`.
  - `tech_travel_experiences`: `tech_ecosystem?: [str]`, `gaming_platforms?: [str]`, `smart_home?: [str]`, `travel_styles?: [str]`, `dream_destinations?: [str]`, `experience_types?: [str]`, `event_preferences?: [str]`.
  - `gift_preferences`: `gift_card_ok?: bool`, `likes_personalized?: bool`, `collects?: [str]`, `avoid_categories?: [str]`, `budget_comfort?: str`, `notes?: str`.

### DTO & Validation
- Extend Pydantic schemas with typed models for `SizeEntry` and `AdvancedInterests`.
- Accept legacy `sizes` input but prefer `size_profile` going forward; emit both during transition with `sizes` derived from `size_profile` for compatibility.
- Add validation helpers: trim strings, dedupe arrays, max lengths (e.g., notes ≤ 2000 chars), and enum validation for curated lists.

### Persistence
- Alembic migration to add `advanced_interests` (JSON) and `size_profile` (JSON) columns to `persons`.
- Indexing: keep `display_name` index; no new indexes required for JSON fields.

---

## Frontend Architecture
- **Types/hooks**: Update `Person` type to include `size_profile` + `advanced_interests`. Update React Query keys if payload shape changes.
- **Modal tabs**:
  - `Overview`: Remains primary; shows display name, relationship, birthday/anniversary, interests tags, groups, primary sizes (top 3 by priority), constraints, notes.
  - `Advanced Interests`: New tab with two modes:
    - View: Cards per category with only populated rows.
    - Edit: Sectioned form with toggles, pill multi-selects, checkbox groups, textareas, and "+ Add" chip lists.
  - `Linked Entities` / `History`: Unchanged.
- **Creation**: `AddPersonModal` keeps only overview fields; store into `interests`, `constraints`, `notes`, and `size_profile` (limited recommended rows). After create, users can edit to fill advanced data.
- **Size UI**: Dual inputs (`Type`, `Size`) per row with "+" to append; optional `Fit/Notes` accordion row; reorder not required.

---

## Work Plan

### Backend (API + DB)
1) **Migration**: Add `advanced_interests` and `size_profile` columns.
2) **Models**: Update ORM model and Pydantic schemas; add typed helper classes for `SizeEntry` and `AdvancedInterests`.
3) **Serialization**: Expose both `size_profile` and legacy `sizes` (derived) in responses for one release; mark `sizes` deprecated in OpenAPI description.
4) **Validation**: Add enums/choices for curated lists; normalize casing; trim whitespace; dedupe arrays.
5) **Services**: Update create/update handlers to map incoming payloads to new columns.
6) **Tests**: Unit tests for schema validation and service upserts; regression to ensure existing minimal create still succeeds.

### Frontend
1) **Types & API client**: Extend `Person` type + hooks; add mappers to show `size_profile`.
2) **AddPersonModal**: Replace size map UI with repeatable rows; limit to top 3 recommended types on create; hide advanced sections.
3) **PersonDetailModal (Edit)**: Add Advanced Interests tab with form sections matching categories; add inline add/remove for arrays; conditionally show wine types when `likes_wine` true.
4) **PersonDetailModal (View)**: Render category cards only when data present; show up to 5 chips per list then "+N more" overflow for long arrays.
5) **Styling/UX**: Keep consistent 44px targets; use existing badge/chip styles; ensure mobile stacked layout.
6) **State mgmt**: Preserve unsaved edits per tab; reset state on close; show success/error toasts.

### Testing & QA
- Backend: migration test, schema validation tests, API contract test for new fields.
- Frontend: unit tests for form parsing (size rows + advanced interests), component snapshot for view tab with sparse data, RTL test ensuring only populated sections render.
- Manual QA: create → edit advanced fields → view; mobile breakpoint check; legacy person without advanced data.

### Rollout
- Immediate roll-out and deprecation of old `sizes` field. App is in active development with no current users, so we can move fast.

---

## Acceptance Criteria
- Person creation uses only overview fields; advanced tab hidden until edit.
- Advanced Interests tab exists on Person modal with edit + view modes; empty categories do not render in view.
- Multiple sizes can be added with type/value rows; persisted and displayed on Overview.
- New fields round-trip through API and UI; legacy data remains intact.
- Tests updated to cover new schemas and UI behavior.

---

## Tracking (AI-Optimized)
```json
[
  {
    "id": "BE-01",
    "phase": "Backend",
    "requirement": "WorkPlan-Backend-1",
    "task": "Add Alembic migration for advanced_interests and size_profile; backfill size_profile from legacy sizes if present; keep display_name index unchanged.",
    "domain": ["API", "DB", "Migrations"],
    "storypoints": 2,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "Migration applies cleanly; columns exist; sample backfill converts sizes map -> array rows; rollback succeeds."
  },
  {
    "id": "BE-02",
    "phase": "Backend",
    "requirement": "WorkPlan-Backend-2",
    "task": "Update ORM model and Pydantic schemas to add SizeEntry/AdvancedInterests types; wire columns to Person; ensure legacy sizes retained via compatibility accessor.",
    "domain": ["API", "Models", "Schemas"],
    "storypoints": 3,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "Person responses include size_profile + derived sizes; schema validation passes; no breaking changes to existing fields."
  },
  {
    "id": "BE-03",
    "phase": "Backend",
    "requirement": "WorkPlan-Backend-3",
    "task": "Serialization path to emit size_profile and derived legacy sizes for one release; OpenAPI marks sizes deprecated.",
    "domain": ["API", "Docs"],
    "storypoints": 2,
    "reasoning": "Low",
    "status": "[X]",
    "success_criteria": "OpenAPI shows deprecation; response payloads contain both size_profile and sizes mirrors."
  },
  {
    "id": "BE-04",
    "phase": "Backend",
    "requirement": "WorkPlan-Backend-4",
    "task": "Validation helpers: enums for curated lists, trim/dedupe arrays, max length guards; normalize casing to slugs.",
    "domain": ["API", "Validation"],
    "storypoints": 3,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "Invalid enums rejected; arrays deduped; empty strings dropped; tests cover edge cases."
  },
  {
    "id": "BE-05",
    "phase": "Backend",
    "requirement": "WorkPlan-Backend-5",
    "task": "Service layer changes for create/update to persist advanced_interests + size_profile; merge legacy sizes input into size_profile.",
    "domain": ["API", "Services"],
    "storypoints": 3,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "Create/update accepts both size_profile and sizes; persisted data round-trips; legacy-only clients not broken."
  },
  {
    "id": "BE-06",
    "phase": "Backend",
    "requirement": "WorkPlan-Backend-6",
    "task": "Backend tests: migration/backfill, schema validation, service upserts, regression for minimal person create.",
    "domain": ["Test", "API"],
    "storypoints": 2,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "All new tests green; minimal create path unchanged; CI passes."
  },
  {
    "id": "FE-01",
    "phase": "Frontend",
    "requirement": "WorkPlan-Frontend-1",
    "task": "Extend Person types/hooks to include size_profile + advanced_interests; ensure queries/cache keys updated; derive legacy sizes for display.",
    "domain": ["Web", "Types", "Hooks"],
    "storypoints": 3,
    "reasoning": "Medium",
    "status": "[ ]",
    "success_criteria": "Type errors resolved; network responses parsed; UI can read size_profile fallback to sizes."
  },
  {
    "id": "FE-02",
    "phase": "Frontend",
    "requirement": "WorkPlan-Frontend-2",
    "task": "AddPersonModal: replace size map UI with repeatable type/value rows (+ optional fit/notes toggle); limit recommended defaults; hide advanced sections.",
    "domain": ["Web", "UI"],
    "storypoints": 3,
    "reasoning": "Medium",
    "status": "[ ]",
    "success_criteria": "Users can add multiple size rows on create; validation prevents empty rows; advanced fields absent."
  },
  {
    "id": "FE-03",
    "phase": "Frontend",
    "requirement": "WorkPlan-Frontend-3",
    "task": "PersonDetailModal Edit: add Advanced Interests tab with sectioned form (booleans, chips, checkboxes, text areas); conditional wine types.",
    "domain": ["Web", "UI"],
    "storypoints": 5,
    "reasoning": "High",
    "status": "[ ]",
    "success_criteria": "Form captures all categories; state persists per tab; likes_wine toggles wine types; submit maps to API shape."
  },
  {
    "id": "FE-04",
    "phase": "Frontend",
    "requirement": "WorkPlan-Frontend-4",
    "task": "PersonDetailModal View: render Advanced tab category cards only when populated; chip overflow shows +N more; boolean pills for toggles.",
    "domain": ["Web", "UI"],
    "storypoints": 3,
    "reasoning": "Medium",
    "status": "[ ]",
    "success_criteria": "Empty categories hidden; populated data shows labeled chips/pills; overflow works; mobile layout intact."
  },
  {
    "id": "FE-05",
    "phase": "Frontend",
    "requirement": "WorkPlan-Frontend-5",
    "task": "Styling/UX: maintain 44px targets, badge/chip consistency, responsive stacking; reuse card/tabs patterns.",
    "domain": ["Web", "UI"],
    "storypoints": 2,
    "reasoning": "Low",
    "status": "[ ]",
    "success_criteria": "No regression to spacing/hit targets; visual consistency with existing design tokens."
  },
  {
    "id": "FE-06",
    "phase": "Frontend",
    "requirement": "WorkPlan-Frontend-6",
    "task": "State management: preserve unsaved edits per tab; reset on close; toast success/error on save; handle loading/empty states.",
    "domain": ["Web", "State"],
    "storypoints": 2,
    "reasoning": "Medium",
    "status": "[ ]",
    "success_criteria": "Switching tabs does not lose unsaved data; close resets; toasts fire appropriately; loaders present."
  },
  {
    "id": "QA-01",
    "phase": "Testing & QA",
    "requirement": "Testing-QA",
    "task": "Frontend tests: form parsing for size rows + advanced interests; snapshot of view tab with sparse data; RTL ensures only populated sections render.",
    "domain": ["Test", "Web"],
    "storypoints": 3,
    "reasoning": "Medium",
    "status": "[ ]",
    "success_criteria": "Automated tests pass; coverage includes conditional rendering and array add/remove logic."
  },
  {
    "id": "QA-02",
    "phase": "Testing & QA",
    "requirement": "Testing-QA",
    "task": "Manual QA: create → edit advanced fields → view; mobile breakpoint check; legacy person without advanced data; wine toggle behavior.",
    "domain": ["QA"],
    "storypoints": 2,
    "reasoning": "Low",
    "status": "[ ]",
    "success_criteria": "Manual scenarios verified; no crashes; mobile layout acceptable; legacy data renders gracefully."
  },
  {
    "id": "ROLLOUT-01",
    "phase": "Rollout",
    "requirement": "Rollout",
    "task": "Ship migration + API before frontend; communicate sizes deprecation window; ensure backfill run once.",
    "domain": ["Infra", "API", "Web"],
    "storypoints": 2,
    "reasoning": "Low",
    "status": "[X]",
    "success_criteria": "Backend deployed prior to UI; no 500s on old clients; backfill complete; deprecation noted."
  }
]
```
