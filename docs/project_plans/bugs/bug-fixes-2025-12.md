# Bug Fixes - December 2025

## Overview

Monthly bug tracking for December 2025.

---

### Docker Build ENOSPC Error

**Issue**: Docker build failed with `ENOSPC: no space left on device` when Next.js created standalone output

- **Location**: Docker Desktop storage
- **Root Cause**: Docker Desktop's virtual disk was full with 21GB of build cache and 17GB of unused images. This is separate from local disk space.
- **Fix**: Cleared Docker storage using:
  ```bash
  docker builder prune -af   # Cleared 21GB build cache
  docker image prune -af     # Cleared 17GB unused images
  ```
- **Commit(s)**: N/A (runtime fix, no code changes)
- **Status**: RESOLVED

**Prevention**: Periodically clean Docker storage with `docker system prune -a` or configure Docker Desktop to limit disk usage in Preferences > Resources > Disk image size.

**Note**: User has Docker Desktop installed but CLI not in PATH. Access via `/Applications/Docker.app/Contents/Resources/bin/docker`.

---

### Side Navigation Design Mismatch

**Issue**: Side navigation bar used glassmorphism styling (bg-white/60 backdrop-blur) instead of the warm terracotta background shown in the design renders

- **Location**: `apps/web/components/layout/DesktopNav.tsx:24`, `apps/web/components/layout/MobileNav.tsx`
- **Root Cause**: Design was implemented with glassmorphism before final design renders were created
- **Fix**: Updated both DesktopNav and MobileNav to use solid warm terracotta background (`bg-[#B67352]`) with white icons, matching the design render at `docs/designs/renders/gifts-dash.png`
- **Commit(s)**: 8598f05
- **Status**: RESOLVED

---

### Kanban Drag Size Bug

**Issue**: When dragging a gift card between statuses on the Kanban board (`/lists/{id}`), the item became very large until placed

- **Location**: `apps/web/components/lists/KanbanCard.tsx:51-58`
- **Root Cause**: Drag ghost image cloning didn't constrain dimensions - the cloned element inherited flexible layout properties that expanded when appended to document body
- **Fix**: Set explicit width/height on ghost element using `getBoundingClientRect()`, positioned off-screen, and added `scale-100` class during drag to prevent card scaling
- **Commit(s)**: 8598f05
- **Status**: RESOLVED

---

### ListItemGroup TypeScript Build Error

**Issue**: Build failed with type error about missing `gifted` and `to_buy` properties in statusIcons Record

- **Location**: `apps/web/components/lists/ListItemGroup.tsx:38-45`
- **Root Cause**: TypeScript Record object keys were in different order than the ListItemStatus type definition, causing inference issues
- **Fix**: Reordered all status-related Record objects (statusIcons, statusColors, statusLabels, statusDescriptions) to match exact order of ListItemStatus type
- **Commit(s)**: 8598f05
- **Status**: RESOLVED

---

### Add Flows Not Using Modals

**Issue**: Creating new lists, people, occasions, and gifts navigated to separate `/new` pages instead of opening modals, disrupting user workflow

- **Location**: `apps/web/app/lists/page.tsx`, `apps/web/app/gifts/page.tsx`, `apps/web/app/people/page.tsx`, `apps/web/app/occasions/page.tsx`
- **Root Cause**: Initial implementation used page navigation for add flows before modal infrastructure was fully established
- **Fix**:
  - Created `AddGiftModal` component with URL/Manual tabs
  - Created `AddPersonModal` component with full person form
  - Created `AddOccasionModal` component with occasion form
  - Wired existing `AddListModal` to lists page
  - Replaced all Link components to `/new` routes with modal trigger buttons
- **Commit(s)**: 8598f05
- **Status**: RESOLVED
