---
# Phase 5: Feature Components & Backend Integration
type: progress
prd: "ui-overhaul-v2"
phase: 5
title: "Feature Components & Backend Integration"
status: "planning"
started: "2025-11-30"
completed: null

# Overall Progress
overall_progress: 0
completion_estimate: "on-track"

# Task Counts
total_tasks: 7
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership
owners: ["frontend-developer"]
contributors: ["ui-engineer-enhanced"]

# === ORCHESTRATION QUICK REFERENCE ===
tasks:
  - id: "FC-001"
    description: "Create React Query hooks for Gifts, Lists, Recipients, Occasions with caching"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "critical"

  - id: "FC-002"
    description: "Implement WebSocket integration with topic subscriptions and RQ invalidation"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["FC-001"]
    estimated_effort: "2SP"
    priority: "critical"

  - id: "FC-003"
    description: "Create Gift Details Modal with tabs and action buttons"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "high"

  - id: "FC-004"
    description: "Create Gift Form component with validation and image upload"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["FC-001"]
    estimated_effort: "2SP"
    priority: "high"

  - id: "FC-005"
    description: "Implement Kanban drag-drop with optimistic updates"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["FC-001"]
    estimated_effort: "2SP"
    priority: "critical"

  - id: "FC-006"
    description: "Create Recipients Modals for view/edit with preferences"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    estimated_effort: "2SP"
    priority: "medium"

  - id: "FC-007"
    description: "Implement List Management (create, edit, archive, delete)"
    status: "pending"
    assigned_to: ["frontend-developer"]
    dependencies: ["FC-001"]
    estimated_effort: "1SP"
    priority: "medium"

# Parallelization Strategy
parallelization:
  batch_1: ["FC-001", "FC-003", "FC-006"]
  batch_2: ["FC-002", "FC-004", "FC-005", "FC-007"]
  critical_path: ["FC-001", "FC-002", "FC-005"]
  estimated_total_time: "5-6 days"

# Blockers
blockers: []

# Success Criteria
success_criteria:
  - { id: "SC-1", description: "React Query hooks fetch from API endpoints", status: "pending" }
  - { id: "SC-2", description: "WebSocket connections establish and update cache", status: "pending" }
  - { id: "SC-3", description: "Drag-drop moves items and updates status", status: "pending" }
  - { id: "SC-4", description: "Modals open/close with proper form handling", status: "pending" }
  - { id: "SC-5", description: "Optimistic updates rollback on error", status: "pending" }
  - { id: "SC-6", description: "3G throttle time <4s", status: "pending" }

# Files Modified
files_modified:
  - "/apps/web/hooks/useGifts.ts"
  - "/apps/web/hooks/useLists.ts"
  - "/apps/web/hooks/useRecipients.ts"
  - "/apps/web/hooks/useOccasions.ts"
  - "/apps/web/hooks/useWebSocket.ts"
  - "/apps/web/components/features/GiftDetailsModal.tsx"
  - "/apps/web/components/features/GiftForm.tsx"
  - "/apps/web/components/features/KanbanBoard.tsx"
  - "/apps/web/components/features/RecipientDetailsModal.tsx"
  - "/apps/web/lib/api.ts"
---

# UI Overhaul V2 - Phase 5: Feature Components & Backend Integration

**Phase**: 5 of 6
**Status**: Planning (0% complete)
**Duration**: 5-6 days | **Story Points**: 13
**Owner**: frontend-developer
**Contributors**: ui-engineer-enhanced

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Start - Independent Tasks):
- FC-001 -> `frontend-developer` (2SP) - React Query hooks (critical)
- FC-003 -> `ui-engineer-enhanced` (2SP) - Gift Details Modal
- FC-006 -> `ui-engineer-enhanced` (2SP) - Recipients Modals

**Batch 2** (After FC-001 - Depends on Hooks):
- FC-002 -> `frontend-developer` (2SP) - WebSocket integration
- FC-004 -> `frontend-developer` (2SP) - Gift Form
- FC-005 -> `frontend-developer` (2SP) - Kanban drag-drop
- FC-007 -> `frontend-developer` (1SP) - List Management

**Critical Path**: FC-001 -> FC-002 -> FC-005 (6SP)

### Task Delegation Commands

```
# Batch 1 (Launch in parallel - single message)
Task("frontend-developer", "FC-001: Create React Query hooks for all entities.

Requirements:
- useGifts: Query all gifts, single gift, create, update, delete mutations
- useLists: Query all lists, single list, create, update, delete mutations
- useRecipients: Query all recipients, single recipient, create, update mutations
- useOccasions: Query all occasions

For each hook:
- Define cache keys following pattern: ['entity', id?]
- Implement proper cache invalidation on mutations
- Support optimistic updates where appropriate
- Suspense ready (use useSuspenseQuery pattern)
- Include loading/error states

Example structure:
export function useGifts(listId?: string) {
  return useSuspenseQuery({
    queryKey: ['gifts', listId],
    queryFn: () => api.getGifts(listId),
  });
}

export function useCreateGift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: GiftCreate) => api.createGift(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['gifts'] }),
  });
}

Files:
- /apps/web/hooks/useGifts.ts
- /apps/web/hooks/useLists.ts
- /apps/web/hooks/useRecipients.ts
- /apps/web/hooks/useOccasions.ts
- /apps/web/lib/api.ts (update with all endpoints)

Acceptance: Hooks query API correctly, caching works, refetch on demand, suspense ready")

Task("ui-engineer-enhanced", "FC-003: Create Gift Details Modal with tabs and actions.

Requirements:
- Full-screen modal with tabs: Overview, Linked Entities, History
- Overview tab: Gift image, name, price, status, description, links
- Linked Entities tab: Recipient info, list info, occasion info
- History tab: Status change timeline (placeholder data for now)
- Action buttons: Edit, Delete (with confirm), Change Status
- Smart suggestions sidebar (can be placeholder)
- Close button (X) and click outside to close
- Uses Modal component from Phase 3

Layout:
+--------------------------------------------------+
| Gift Details                              [X]    |
|--------------------------------------------------|
| [Overview] [Linked] [History]                    |
|--------------------------------------------------|
| +------------------+  +----------------------+   |
| |                  |  | Status: To Buy       |   |
| | Gift Image       |  | Price: $139          |   |
| |                  |  | Recipient: Mom       |   |
| +------------------+  | Links: amazon.com    |   |
|                       +----------------------+   |
|                                                  |
| [Edit] [Delete] [Change Status v]               |
+--------------------------------------------------+

File: /apps/web/components/features/GiftDetailsModal.tsx
Acceptance: Modal renders, tabs switch, edit button opens form, delete confirms")

Task("ui-engineer-enhanced", "FC-006: Create Recipients Modals for view and edit.

Requirements:
- View Modal: Show recipient details, preferences, gift history
- Edit Modal: Form for updating recipient info
- Fields: Name, Avatar/Photo, Relationship, Birthday, Anniversary
- Size preferences (clothing sizes, ring size, etc.)
- Interests/hobbies list
- Past gifts received
- Notes section
- Uses Modal and Form components from Phase 3

File: /apps/web/components/features/RecipientDetailsModal.tsx
Acceptance: Modal displays recipient info, edit form validates, save updates backend")

# Batch 2 (After FC-001 completes - launch in parallel)
Task("frontend-developer", "FC-002: Implement WebSocket integration with React Query.

Requirements:
- useWebSocket hook for connection management
- Subscribe to topics: 'gift-list:{listId}', 'recipients:{userId}'
- Events: ADDED, UPDATED, DELETED, STATUS_CHANGED
- On event: Invalidate relevant React Query cache
- Connection management: Auto-reconnect with exponential backoff
- Fallback: If WS disconnected for >10s, poll every 10s
- Use native WebSocket or lightweight library (not Socket.io)

WebSocket Event Structure:
interface WSEvent {
  topic: string;              // 'gift-list:family-123'
  event: 'ADDED' | 'UPDATED' | 'DELETED' | 'STATUS_CHANGED';
  data: { entity_id: string; payload: unknown; user_id: string };
}

File: /apps/web/hooks/useWebSocket.ts
Acceptance: WebSocket connects, subscriptions work, RQ invalidates on event, fallback to poll")

Task("frontend-developer", "FC-004: Create Gift Form component with full validation.

Requirements:
- Create/Edit form for gifts
- Fields: Name, Description, Price, URL/Link, Image Upload, Category, Status, Recipient
- Image upload with preview and progress
- Form validation with react-hook-form + zod
- Recipient dropdown with search
- Category dropdown
- Price input with currency formatting
- Submit fires mutation from useGifts hook
- Loading state on submit

File: /apps/web/components/features/GiftForm.tsx
Acceptance: Form validates input, image preview works, dropdown selects, submit fires mutation")

Task("frontend-developer", "FC-005: Implement Kanban drag-drop with optimistic updates.

Requirements:
- Integrate drag-drop library (react-beautiful-dnd or @dnd-kit/core)
- Cards draggable within and between columns
- On drop: Optimistic update (immediate UI change)
- Then fire mutation to update status
- On error: Rollback to previous state
- Animate card movement
- Mobile: Long-press to initiate drag

Implementation approach:
1. Wrap board in DragDropContext
2. Columns are Droppable areas
3. Cards are Draggable items
4. onDragEnd triggers status mutation

File: /apps/web/components/features/KanbanBoard.tsx (update from Phase 4)
Acceptance: Cards draggable, columns accept drops, status updates via mutation, optimistic update works")

Task("frontend-developer", "FC-007: Implement List Management operations.

Requirements:
- Create new list: Modal with form (name, occasion, date)
- Edit list: Update occasion/date/name
- Archive list: Mark as archived (soft delete)
- Delete list: Hard delete with confirm dialog
- All operations use mutations from useLists hook
- Date picker for occasion date
- Occasion dropdown with common options (Christmas, Birthday, etc.)

File: /apps/web/lib/api.ts (update), relevant list components
Acceptance: Create form works, date picker functional, archive confirms, list updates in UI")
```

---

## Overview

**Phase Goal**: Wire all components to the FastAPI backend and add WebSocket real-time functionality.

**Why This Phase**: This is where the UI becomes functional. Pages built in Phase 4 need real data and mutations.

**Scope**:
- IN: React Query hooks, WebSocket integration, feature modals, drag-drop, forms
- OUT: Testing, performance optimization (Phase 6)

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | React Query hooks fetch from API endpoints | Pending |
| SC-2 | WebSocket connections establish and update cache | Pending |
| SC-3 | Drag-drop moves items and updates status | Pending |
| SC-4 | Modals open/close with proper form handling | Pending |
| SC-5 | Optimistic updates rollback on error | Pending |
| SC-6 | 3G throttle time <4s | Pending |

---

## Tasks

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| FC-001 | React Query Hooks | Pending | frontend-developer | None | 2SP | All entity hooks |
| FC-002 | WebSocket Integration | Pending | frontend-developer | FC-001 | 2SP | Topics, invalidation |
| FC-003 | Gift Details Modal | Pending | ui-engineer-enhanced | None | 2SP | Tabs, actions |
| FC-004 | Gift Form | Pending | frontend-developer | FC-001 | 2SP | Validation, upload |
| FC-005 | Kanban Drag-Drop | Pending | frontend-developer | FC-001 | 2SP | Optimistic updates |
| FC-006 | Recipients Modals | Pending | ui-engineer-enhanced | None | 2SP | View/edit |
| FC-007 | List Management | Pending | frontend-developer | FC-001 | 1SP | CRUD operations |

**Status Legend**:
- `Pending` - Not Started
- `In Progress` - Currently being worked on
- `Complete` - Finished
- `Blocked` - Waiting on dependency/blocker

---

## Architecture Context

### State Sync Pattern

```
1. Load: React Query (REST) - Initial data fetch
2. Subscribe: WebSocket on component mount
3. Event: WS message -> Invalidate RQ cache -> Refetch
4. Unmount: Unsubscribe from WebSocket topic
5. Fallback: Poll every 10s if WS disconnected
```

### WebSocket Event Structure

```typescript
interface WSEvent {
  topic: string;              // "gift-list:family-123"
  event: "ADDED" | "UPDATED" | "DELETED" | "STATUS_CHANGED";
  data: { entity_id: string; payload: unknown; user_id: string };
}
```

### API Endpoints Required

```
GET    /api/v1/gifts?list_id=...
POST   /api/v1/gifts
GET    /api/v1/gifts/{id}
PUT    /api/v1/gifts/{id}
DELETE /api/v1/gifts/{id}
PATCH  /api/v1/gifts/{id}/status

GET    /api/v1/lists
POST   /api/v1/lists
GET    /api/v1/lists/{id}
PUT    /api/v1/lists/{id}
DELETE /api/v1/lists/{id}

GET    /api/v1/recipients
POST   /api/v1/recipients
GET    /api/v1/recipients/{id}
PUT    /api/v1/recipients/{id}

GET    /api/v1/occasions
```

---

## Implementation Details

### Technical Approach

1. **FC-001**: Create all hooks first - they're used by everything else
2. **FC-002**: WebSocket depends on hooks for cache invalidation
3. **FC-003/FC-006**: Modal components can be built in parallel with hooks
4. **FC-004/FC-005/FC-007**: All depend on hooks being ready

### Drag-Drop Library Choice

Recommended: `@dnd-kit/core` (lightweight, accessible, modern)

Alternative: `react-beautiful-dnd` (more features but larger)

### Known Gotchas

- WebSocket reconnection needs exponential backoff to avoid thundering herd
- Optimistic updates must handle network errors gracefully
- Image upload needs progress tracking and size limits
- Form validation should debounce expensive checks

---

## Dependencies

### Phase Dependencies

- **Requires**: Phase 4 (Pages to wire up)
- **Requires**: Existing FastAPI backend (API endpoints)
- **Enables**: Phase 6 (Polish and testing)

### External Dependencies

- FastAPI backend must have all required endpoints
- WebSocket server must be running

---

## Testing Strategy

| Test Type | Scope | Coverage | Status |
|-----------|-------|----------|--------|
| Integration | API calls | All hooks | Pending |
| WebSocket | Connection lifecycle | Connect, reconnect, fallback | Pending |
| Optimistic | Update rollback | Error scenarios | Pending |
| Form | Validation | All fields | Pending |

---

## Next Session Agenda

### Immediate Actions
1. [ ] Start FC-001: Create all React Query hooks
2. [ ] Verify API endpoints are available
3. [ ] Test WebSocket connection to backend

### Context for Continuing Agent

Phase 4 pages must be complete. Start with FC-001 (React Query hooks) as most other tasks depend on it. Verify the FastAPI backend has all required endpoints before starting.

---

## Session Notes

### 2025-11-30

**Status**: Phase created, waiting for Phase 4 completion

**Next Session**:
- Begin FC-001: React Query hooks
- In parallel: FC-003 and FC-006 (modals)

---

## Additional Resources

- **Implementation Plan**: `docs/project_plans/ui-overhaul-phase2/ui-overhaul-v2-implementation.md`
- **API Documentation**: Backend API docs (if available)
- **WebSocket Pattern**: `CLAUDE.md` Real-Time Pattern section
