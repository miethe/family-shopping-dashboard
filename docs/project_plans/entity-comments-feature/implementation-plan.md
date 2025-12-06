 ---
title: "Implementation Plan: Entity Comments Tabs"
description: "Add reusable comments tabs to person and other entity modals with visibility controls, while relocating person notes."
tags: [implementation-plan, comments, person, entities, ui, api]
created: 2025-12-05
updated: 2025-12-05
status: draft
---

# Implementation Plan: Comments Tabs for Entities

**Plan ID**: `IMPL-2025-12-05-ENTITY-COMMENTS`  
**Request**: New Comments feature on Person modal, public/private toggle, editable/deletable by author, applied to all entity modals; move Notes to end of Person modal.  
**Owner**: Codex Agent  

## Functional Requirements
- **FR1 (Person Comments Tab)**: In Person modal view mode, add a Comments tab showing public comments plus the current user’s private ones; allow create with public/private toggle, edit/delete by author, show timestamp.
- **FR2 (Comments Tabs on Other Entities)**: Add the same Comments tab pattern to view mode for List, Gift, and Occasion modals (and keep list_item support in API); reuse the shared comment module.
- **FR3 (Comment Data/API)**: Comments persist visibility (public/private) with parent type coverage (person, list, list_item, occasion, gift), author metadata, timestamps, and CRUD endpoints that filter to public + author-owned items; author-only edit/delete.
- **FR4 (Notes Placement)**: Keep Notes on Person Overview but move it to the end of the tab in both view and edit states.

## Assumptions
- Single-tenant, light auth: enforce author-only edits/deletes and visibility filtering; no multi-tenant ACL beyond that.
- Entities in-scope for UI tabs: person, list, occasion, gift (list_item remains API-only unless embedded later).
- Reuse existing comment components/hooks; avoid building a new widget.

## Plan (AI-Oriented)

### Data & API
- **[BE-FR3-01] Schema & Enum Updates**: Add `visibility` (enum: public/private, default public) to Comment model/migration; ensure index on `(parent_type, parent_id, visibility)`; extend `CommentParentType` to include `gift` (person already present); backfill existing rows to `public`.  
- **[BE-FR3-02] DTO/Service Alignment**: Standardize comment payload fields (`content` canonical; alias `text` if needed), include `visibility`, `author_id`, `author_label` (email fallback), `created_at`, `updated_at`; compute `can_edit` server-side or derive-able; update service/repo filters to return public + author-owned private.  
- **[BE-FR3-03] API Router**: Add `/comments` FastAPI router (list/create/update/delete) with auth dependency; enforce author-only update/delete; list endpoint requires `parent_type` + `parent_id` and filters by visibility; wire router into `main.py`; document in OpenAPI.  

### Frontend
- **[FE-FR3-01] Types & Hooks**: Update `Comment`/`CommentCreate` types to include `visibility`, `content` naming, author label, timestamps; extend `commentApi` with update; add `useUpdateComment`; propagate visibility in cache keys if needed.  
- **[FE-FR3-02] Comment UI Enhancements**: Extend `CommentForm` to choose public/private (default public), respect max length; update `CommentCard` to show visibility badge, edited timestamp, and add inline edit for author using `useUpdateComment`; ensure delete uses updated types.  
- **[FE-FR1-01] Person Modal Tab**: In view mode `PersonDetailModal`, add Comments tab (entity_type `person`, id from modal); lazy-load on tab activation; pass current user id/email from auth context; keep Advanced/Linked/History tabs intact.  
- **[FE-FR2-01] Other Entity Tabs**: Add Comments tab to `ListDetailModal` (entity_type `list`), `OccasionDetailModal` (`occasion`), and `GiftDetailModal` (`gift`); hide tab if id missing; reuse shared `CommentsTab` wrapper to avoid duplication.  
- **[FE-FR4-01] Notes Placement**: Move Notes block to end of Person Overview in both view and edit layouts; ensure form initialization and save flow unchanged.  

### Testing & QA
- **[QA-FR3-01] Backend Coverage**: Tests for visibility filtering (public vs private), author-only update/delete, migration default; schema serialization of author label and visibility.  
- **[QA-FR1-01] Person Comments UI**: RTL tests to ensure Comments tab renders, create public/private flows, private hidden when viewer != author (mock user), edit/delete gated to author.  
- **[QA-FR2-01] Cross-Entity Tabs**: Smoke tests for List/Gift/Occasion tabs mounting CommentThread with correct entity_type; editing/deleting comment updates thread.  
- **[QA-FR4-01] Notes Regression**: Visual/manual check that Notes is last in Person Overview (view/edit) and still persists on save.  

## Tracking
```json
[
  {
    "id": "BE-FR3-01",
    "phase": "Backend",
    "fr": ["FR3"],
    "task": "Add comment visibility enum (public/private) with migration, index, and parent_type gift support; backfill defaults.",
    "domain": ["API", "DB", "Migrations"],
    "storypoints": 3,
    "reasoning": "High",
    "status": "[X]",
    "success_criteria": "Migration applies; comments table has visibility + new enum; parent_type accepts gift; existing rows default to public; queries use new index."
  },
  {
    "id": "BE-FR3-02",
    "phase": "Backend",
    "fr": ["FR3"],
    "task": "Update schemas/services to expose content/text alias, visibility, author_id, author_label, timestamps; filter list to public + author private.",
    "domain": ["API", "Models", "Schemas"],
    "storypoints": 3,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "CommentResponse includes visibility + author_label; private comments only shown to author; schema validation passes."
  },
  {
    "id": "BE-FR3-03",
    "phase": "Backend",
    "fr": ["FR3"],
    "task": "Implement /comments router (list/create/update/delete) with auth, author-only update/delete checks, and visibility-aware listing; register router.",
    "domain": ["API"],
    "storypoints": 3,
    "reasoning": "High",
    "status": "[X]",
    "success_criteria": "All endpoints reachable via /api/v1/comments; update/delete blocked for non-authors; list respects visibility; OpenAPI updated."
  },
  {
    "id": "FE-FR3-01",
    "phase": "Frontend",
    "fr": ["FR3"],
    "task": "Align comment types/api hooks with backend fields; add update mutation; include visibility in create/update payloads and query keys.",
    "domain": ["Web", "Types", "Hooks"],
    "storypoints": 2,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "Type checks pass; create/update/delete hooks operate with visibility; CommentThread consumes new shapes without runtime errors."
  },
  {
    "id": "FE-FR3-02",
    "phase": "Frontend",
    "fr": ["FR3"],
    "task": "Enhance CommentForm/Card for visibility toggle, edit-in-place for author, edited timestamp, and visibility badges.",
    "domain": ["Web", "UI"],
    "storypoints": 3,
    "reasoning": "High",
    "status": "[X]",
    "success_criteria": "Authors can toggle visibility on create; can edit existing comment text; UI shows edited + visibility; delete still works."
  },
  {
    "id": "FE-FR1-01",
    "phase": "Frontend",
    "fr": ["FR1"],
    "task": "Add Comments tab to PersonDetailModal view mode using shared wrapper; hydrate with auth user id/email; lazy load comments.",
    "domain": ["Web", "UI"],
    "storypoints": 2,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "Person modal shows Comments tab in view mode; thread loads for person id; private comments visible only to author."
  },
  {
    "id": "FE-FR2-01",
    "phase": "Frontend",
    "fr": ["FR2"],
    "task": "Add Comments tab to ListDetailModal, OccasionDetailModal, GiftDetailModal via shared component; gate on ids.",
    "domain": ["Web", "UI"],
    "storypoints": 2,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "Each modal shows Comments tab in view mode; correct entity_type/id passed; no render when id missing."
  },
  {
    "id": "FE-FR4-01",
    "phase": "Frontend",
    "fr": ["FR4"],
    "task": "Relocate Notes section to end of Person Overview (view + edit) without altering save logic.",
    "domain": ["Web", "UI"],
    "storypoints": 1,
    "reasoning": "Low",
    "status": "[X]",
    "success_criteria": "Notes renders last on overview tab; editing/saving retains value; no layout regressions."
  },
  {
    "id": "QA-FR3-01",
    "phase": "QA",
    "fr": ["FR3"],
    "task": "Backend tests for visibility logic and author-only mutations; migration default verification.",
    "domain": ["Test", "API"],
    "storypoints": 2,
    "reasoning": "Medium",
    "status": "[X]",
    "success_criteria": "Automated tests cover list filtering, unauthorized edit/delete rejection, default visibility set to public."
  },
  {
    "id": "QA-FR1-01",
    "phase": "QA",
    "fr": ["FR1"],
    "task": "Frontend tests for Person Comments tab (public vs private rendering, author edit/delete).",
    "domain": ["Test", "Web"],
    "storypoints": 2,
    "reasoning": "High",
    "status": "[X]",
    "success_criteria": "RTL/mocked auth verifies tab render, create, edit/delete, and private comment visibility rules."
  },
  {
    "id": "QA-FR2-01",
    "phase": "QA",
    "fr": ["FR2"],
    "task": "Cross-entity comment tab smoke tests for list/gift/occasion flows.",
    "domain": ["Test", "Web"],
    "storypoints": 1,
    "reasoning": "Low",
    "status": "[X]",
    "success_criteria": "Tabs mount without errors and respect entity ids; create/delete flows invalidate caches."
  },
  {
    "id": "QA-FR4-01",
    "phase": "QA",
    "fr": ["FR4"],
    "task": "Manual/visual check for Notes placement after other overview sections.",
    "domain": ["Test", "UX"],
    "storypoints": 1,
    "reasoning": "Low",
    "status": "[X]",
    "success_criteria": "Notes appears last in overview tab (view/edit) and persists after save."
  }
]
```
