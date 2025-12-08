# 12-1 Enhancements - Implementation Plan

## Overview

This plan covers 4 enhancement areas and 2 bug fixes for the Family Gifting Dashboard.

---

## Task Breakdown

### 1. Idea Inbox (API + Frontend)

**Goal**: Fetch and display gift ideas not currently in a dedicated list, sorted by most recent.

#### Backend Tasks
- [ ] Create `IdeaSuggestion` schema in `schemas/idea.py`
- [ ] Create `IdeaService` in `services/idea_service.py`
  - Method: `get_unassigned_ideas()` - returns list items without a dedicated list
- [ ] Create `ideas` router in `api/ideas.py`
  - Endpoint: `GET /api/ideas/inbox` - returns unassigned ideas

#### Frontend Tasks
- [ ] Create `useIdeaInbox` hook in `hooks/useIdeas.ts`
- [ ] Update `IdeaInbox.tsx` to:
  - Replace mock data with `useIdeaInbox()` query
  - Wire "Add to List" button to open list selection modal
- [ ] Create `AddToListModal.tsx` component
  - Display existing lists for selection
  - Option to create new list
  - On select/create: add idea to list via mutation

---

### 2. Recent Activity (API + Frontend)

**Goal**: Show chronological activity feed with clickable entity links.

#### Backend Tasks
- [ ] Create `ActivityEvent` schema in `schemas/activity.py`
- [ ] Create `activity_log` table migration (if not exists)
- [ ] Create `ActivityService` in `services/activity_service.py`
  - Method: `get_recent_activity(limit=10)` - returns recent events
- [ ] Create `activity` router in `api/activity.py`
  - Endpoint: `GET /api/activity` - returns activity feed
- [ ] Add activity logging to existing mutations (list item create, status change, etc.)

#### Frontend Tasks
- [ ] Create `useRecentActivity` hook in `hooks/useActivity.ts`
- [ ] Update `RecentActivity.tsx` to:
  - Replace mock data with `useRecentActivity()` query
  - Make entity links clickable (navigate to list/gift detail)
  - Show proper formatting for each activity type

---

### 3. List Modal Enhancement

**Goal**: Show gift catalog in list modal with filtering by status.

#### Frontend Tasks
- [ ] Update `ListDetailModal.tsx`:
  - Add status filter tabs/buttons (All, Idea, Purchased, Gifted)
  - Render gift cards in catalog grid layout
  - Each card shows: title, image, status badge, added by
  - Add "Add New Gift" card at start with '+' icon
  - Click gift → open gift detail view
  - Click "Add New Gift" → open AddListItemModal with list pre-selected

---

### 4. Bug Fix: Image Fallback

**Goal**: Show no image placeholder instead of broken image icon.

#### Frontend Tasks
- [ ] Create `GiftImage` component wrapper with error handling
- [ ] On image load error: hide image, show placeholder/no-image state
- [ ] Apply to: `KanbanCard.tsx`, `ListDetailModal.tsx`, `IdeaInbox.tsx`

---

### 5. Bug Fix: Kanban Empty Column Drag

**Goal**: Allow dropping cards into empty columns.

#### Frontend Tasks
- [ ] Update `KanbanColumn.tsx`:
  - Ensure empty columns have valid drop zone
  - Fix drop event handling for columns with no cards
  - Test with all columns empty scenario

---

## Implementation Order

1. **Bug Fixes First** (quick wins, unblock UX)
   - Image fallback
   - Kanban empty column drag

2. **Backend APIs** (enable frontend work)
   - Activity logging table + service
   - Idea inbox endpoint
   - Activity feed endpoint

3. **Frontend Integration**
   - Recent Activity component
   - Idea Inbox component
   - List Modal enhancement

---

## Files to Create

```
services/api/app/
├── api/ideas.py
├── api/activity.py
├── services/idea_service.py
├── services/activity_service.py
├── schemas/idea.py
├── schemas/activity.py
└── models/activity.py (if needed)

apps/web/
├── hooks/useIdeas.ts
├── hooks/useActivity.ts
├── components/common/GiftImage.tsx
└── components/modals/AddToListModal.tsx
```

## Files to Modify

```
apps/web/components/dashboard/IdeaInbox.tsx
apps/web/components/dashboard/RecentActivity.tsx
apps/web/components/modals/ListDetailModal.tsx
apps/web/components/lists/KanbanColumn.tsx
apps/web/components/lists/KanbanCard.tsx
```

---

## Estimated Complexity

| Task | Complexity | Priority |
|------|-----------|----------|
| Image fallback bug | Low | P0 |
| Kanban drag bug | Medium | P0 |
| Idea Inbox API | Medium | P1 |
| Activity API | Medium | P1 |
| Idea Inbox Frontend | Medium | P1 |
| Activity Frontend | Medium | P1 |
| List Modal Enhancement | Medium | P2 |
| Add to List Modal | Low | P2 |
