---
# === PROGRESS TRACKING: Image Upload Feature ===
# All phases tracked in single file (minor feature: 13 points, 5 phases)

# Metadata: Identification and Classification
type: progress
feature: "image-upload"
plan_id: "IMPL-2025-12-02-IMAGE-UPLOAD-V1"
status: "not_started"
started: null
completed: null

# Overall Progress: Status and Estimates
overall_progress: 0
completion_estimate: "on-track"

# Task Counts: Machine-readable task state
total_tasks: 16
completed_tasks: 0
in_progress_tasks: 0
blocked_tasks: 0
at_risk_tasks: 0

# Ownership: Primary and secondary agents
owners: ["python-backend-engineer", "ui-engineer-enhanced"]
contributors: []

# === ORCHESTRATION QUICK REFERENCE ===
# All tasks with assignments, dependencies, and effort estimates
tasks:
  # Phase 1: Backend Storage Infrastructure (3 pts)
  - id: "TASK-1.1"
    name: "Storage Interface"
    description: "Create abstract storage interface for future S3 compatibility"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: []
    estimate: "0.5 pt"
    priority: "high"
    files: ["services/api/app/core/storage.py"]

  - id: "TASK-1.2"
    name: "Local FileSystem Storage"
    description: "Implement local filesystem storage backend"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: []
    estimate: "1 pt"
    priority: "high"
    files: ["services/api/app/core/storage.py"]

  - id: "TASK-1.3"
    name: "Image Processing Service"
    description: "Create service for image validation and thumbnail generation"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: []
    estimate: "1.5 pts"
    priority: "high"
    files: ["services/api/app/core/image_processor.py", "services/api/app/schemas/upload.py"]

  # Phase 2: API Upload Endpoints (3 pts)
  - id: "TASK-2.1"
    name: "Upload Endpoint"
    description: "Create POST /api/upload/image endpoint"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.1", "TASK-1.2", "TASK-1.3"]
    estimate: "1.5 pts"
    priority: "high"
    files: ["services/api/app/api/upload.py"]

  - id: "TASK-2.2"
    name: "Static File Serving"
    description: "Configure FastAPI to serve uploaded images"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.1", "TASK-1.2"]
    estimate: "0.5 pt"
    priority: "medium"
    files: ["services/api/app/main.py", "services/api/app/core/config.py"]

  - id: "TASK-2.3"
    name: "Delete Endpoint"
    description: "Create DELETE /api/upload/image/{filename} endpoint"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-2.1"]
    estimate: "1 pt"
    priority: "medium"
    files: ["services/api/app/api/upload.py"]

  # Phase 3: Frontend Upload Components (4 pts)
  - id: "TASK-3.1"
    name: "ImageUploader Component"
    description: "Create reusable ImageUploader component with file input, drag-drop, paste"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.1", "TASK-2.2"]
    estimate: "2 pts"
    priority: "high"
    files: ["apps/web/components/upload/ImageUploader.tsx", "apps/web/components/upload/DropZone.tsx"]

  - id: "TASK-3.2"
    name: "useImageUpload Hook"
    description: "Create React Query hook for upload mutation"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.1"]
    estimate: "1 pt"
    priority: "high"
    files: ["apps/web/hooks/useImageUpload.ts", "apps/web/lib/upload/uploadImage.ts", "apps/web/lib/upload/imageValidation.ts"]

  - id: "TASK-3.3"
    name: "ImagePreview Component"
    description: "Create preview component with edit/remove actions"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.1"]
    estimate: "1 pt"
    priority: "medium"
    files: ["apps/web/components/upload/ImagePreview.tsx"]

  # Phase 4: Form Integration (2 pts)
  - id: "TASK-4.1"
    name: "Gift Form Integration"
    description: "Add ImageUploader to ManualGiftForm with URL/upload toggle"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.1", "TASK-3.2"]
    estimate: "0.75 pt"
    priority: "high"
    files: ["apps/web/components/gifts/ManualGiftForm.tsx"]

  - id: "TASK-4.2"
    name: "Person Form Integration"
    description: "Add ImageUploader to PersonForm with URL/upload toggle"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.1", "TASK-3.2"]
    estimate: "0.75 pt"
    priority: "high"
    files: ["apps/web/components/people/PersonForm.tsx"]

  - id: "TASK-4.3"
    name: "User Avatar Integration"
    description: "Add ImageUploader to user profile/settings"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.1", "TASK-3.2"]
    estimate: "0.5 pt"
    priority: "medium"
    files: ["apps/web/components/profile/ProfileSettings.tsx"]

  # Phase 5: Testing & Polish (1 pt)
  - id: "TASK-5.1"
    name: "Backend Unit Tests"
    description: "Test storage and image processing"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-1.3", "TASK-2.1"]
    estimate: "0.25 pt"
    priority: "medium"
    files: ["tests/unit/test_image_processor.py", "tests/unit/test_storage.py"]

  - id: "TASK-5.2"
    name: "API Integration Tests"
    description: "Test upload endpoints with validation and error cases"
    status: "pending"
    assigned_to: ["python-backend-engineer"]
    dependencies: ["TASK-2.1", "TASK-2.3"]
    estimate: "0.25 pt"
    priority: "medium"
    files: ["tests/integration/test_upload_api.py"]

  - id: "TASK-5.3"
    name: "Frontend Unit Tests"
    description: "Test upload components and hooks"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.1", "TASK-3.2"]
    estimate: "0.25 pt"
    priority: "low"
    files: ["apps/web/components/upload/__tests__/"]

  - id: "TASK-5.4"
    name: "Mobile Testing"
    description: "Test on iOS and Android browsers"
    status: "pending"
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-4.1", "TASK-4.2", "TASK-4.3"]
    estimate: "0.25 pt"
    priority: "high"
    files: []

# Parallelization Strategy (computed from dependencies)
parallelization:
  batch_1: ["TASK-1.1", "TASK-1.2", "TASK-1.3"]
  batch_2: ["TASK-2.1", "TASK-2.2"]
  batch_3: ["TASK-2.3", "TASK-3.1", "TASK-3.2"]
  batch_4: ["TASK-3.3", "TASK-4.1", "TASK-4.2", "TASK-4.3"]
  batch_5: ["TASK-5.1", "TASK-5.2", "TASK-5.3", "TASK-5.4"]
  critical_path: ["TASK-1.3", "TASK-2.1", "TASK-3.1", "TASK-4.1", "TASK-5.4"]
  estimated_total_time: "13 story points"

# Critical Blockers
blockers: []

# Success Criteria
success_criteria:
  - id: "SC-1"
    description: "Users can upload images for gifts, persons, and user avatars"
    status: "pending"
  - id: "SC-2"
    description: "Images validated (type check, max 10MB size)"
    status: "pending"
  - id: "SC-3"
    description: "Thumbnails generated automatically (400x400 max)"
    status: "pending"
  - id: "SC-4"
    description: "Mobile-first responsive design with 44px touch targets"
    status: "pending"
  - id: "SC-5"
    description: "All existing URL-based workflows continue to work"
    status: "pending"
  - id: "SC-6"
    description: "HEIF/HEIC files convert to JPEG successfully"
    status: "pending"

# Dependencies
dependencies:
  backend:
    - "pillow = ^10.0.0"
    - "python-magic = ^0.4.27"
  frontend:
    - "react-dropzone = ^14.2.3"
  infrastructure:
    - "K8s PersistentVolume (minimum 10GB) at /var/app/uploads/"

# Files Modified Summary
files_modified:
  new_files:
    - "services/api/app/core/storage.py"
    - "services/api/app/core/image_processor.py"
    - "services/api/app/api/upload.py"
    - "services/api/app/schemas/upload.py"
    - "apps/web/components/upload/ImageUploader.tsx"
    - "apps/web/components/upload/ImagePreview.tsx"
    - "apps/web/components/upload/DropZone.tsx"
    - "apps/web/hooks/useImageUpload.ts"
    - "apps/web/lib/upload/uploadImage.ts"
    - "apps/web/lib/upload/imageValidation.ts"
    - "tests/unit/test_image_processor.py"
    - "tests/unit/test_storage.py"
    - "tests/integration/test_upload_api.py"
  modified_files:
    - "services/api/app/main.py"
    - "services/api/app/core/config.py"
    - "services/api/pyproject.toml"
    - "apps/web/components/gifts/ManualGiftForm.tsx"
    - "apps/web/components/people/PersonForm.tsx"
    - "apps/web/components/profile/ProfileSettings.tsx"
    - "apps/web/package.json"
    - "k8s/api-deployment.yaml"
---

# Image Upload V1 - All Phases Progress

**Feature**: Direct Image Upload Support
**Plan ID**: IMPL-2025-12-02-IMAGE-UPLOAD-V1
**Status**: ⏳ Not Started (0% complete)
**Complexity**: Medium (13 story points)
**Timeline**: 2-3 weeks
**Owners**: python-backend-engineer (backend), ui-engineer-enhanced (frontend)

---

## Orchestration Quick Reference

> **For Orchestration Agents**: Use this section to delegate tasks without reading the full file.

### Parallelization Strategy

**Batch 1** (Parallel - Backend Storage Infrastructure):
- TASK-1.1 → `python-backend-engineer` (0.5 pt) - Storage Interface
- TASK-1.2 → `python-backend-engineer` (1 pt) - Local FileSystem Storage
- TASK-1.3 → `python-backend-engineer` (1.5 pts) - Image Processing Service

**Batch 2** (Parallel - API Endpoints, depends on Batch 1):
- TASK-2.1 → `python-backend-engineer` (1.5 pts) - Upload Endpoint - **Blocked by**: TASK-1.1, TASK-1.2, TASK-1.3
- TASK-2.2 → `python-backend-engineer` (0.5 pt) - Static File Serving - **Blocked by**: TASK-1.1, TASK-1.2

**Batch 3** (Parallel - Frontend Components + Delete API, depends on Batch 2):
- TASK-2.3 → `python-backend-engineer` (1 pt) - Delete Endpoint - **Blocked by**: TASK-2.1
- TASK-3.1 → `ui-engineer-enhanced` (2 pts) - ImageUploader Component - **Blocked by**: TASK-2.1, TASK-2.2
- TASK-3.2 → `ui-engineer-enhanced` (1 pt) - useImageUpload Hook - **Blocked by**: TASK-2.1

**Batch 4** (Parallel - Form Integration, depends on Batch 3):
- TASK-3.3 → `ui-engineer-enhanced` (1 pt) - ImagePreview Component - **Blocked by**: TASK-3.1
- TASK-4.1 → `ui-engineer-enhanced` (0.75 pt) - Gift Form Integration - **Blocked by**: TASK-3.1, TASK-3.2
- TASK-4.2 → `ui-engineer-enhanced` (0.75 pt) - Person Form Integration - **Blocked by**: TASK-3.1, TASK-3.2
- TASK-4.3 → `ui-engineer-enhanced` (0.5 pt) - User Avatar Integration - **Blocked by**: TASK-3.1, TASK-3.2

**Batch 5** (Parallel - Testing & Polish, depends on prior phases):
- TASK-5.1 → `python-backend-engineer` (0.25 pt) - Backend Unit Tests - **Blocked by**: TASK-1.3, TASK-2.1
- TASK-5.2 → `python-backend-engineer` (0.25 pt) - API Integration Tests - **Blocked by**: TASK-2.1, TASK-2.3
- TASK-5.3 → `ui-engineer-enhanced` (0.25 pt) - Frontend Unit Tests - **Blocked by**: TASK-3.1, TASK-3.2
- TASK-5.4 → `ui-engineer-enhanced` (0.25 pt) - Mobile Testing - **Blocked by**: TASK-4.1, TASK-4.2, TASK-4.3

**Critical Path**: TASK-1.3 → TASK-2.1 → TASK-3.1 → TASK-4.1 → TASK-5.4 (13 points total)

### Task Delegation Commands

```bash
# === PHASE 1: Backend Storage Infrastructure (Batch 1) ===
# Launch all in parallel - no dependencies
Task("python-backend-engineer", "TASK-1.1: Create abstract StorageBackend protocol with save(), delete(), get_url() methods for future S3 compatibility. File: services/api/app/core/storage.py")
Task("python-backend-engineer", "TASK-1.2: Implement LocalFileStorage class implementing StorageBackend. Store to /var/app/uploads/{entity_type}/{entity_id}/. Create directories if needed. File: services/api/app/core/storage.py")
Task("python-backend-engineer", "TASK-1.3: Create ImageProcessor service with validate() and generate_thumbnail() methods. Support JPEG/PNG/GIF/WebP/HEIF, max 10MB, 400x400 thumbnails. Files: services/api/app/core/image_processor.py, services/api/app/schemas/upload.py. Dependencies: pillow, python-magic")

# === PHASE 2: API Upload Endpoints (Batch 2) ===
# Wait for Batch 1 to complete, then launch in parallel
Task("python-backend-engineer", "TASK-2.1: Create POST /api/upload/image endpoint accepting multipart/form-data. Validate file, process image, store original + thumbnail, return URLs. File: services/api/app/api/upload.py. Dependencies: TASK-1.1, TASK-1.2, TASK-1.3")
Task("python-backend-engineer", "TASK-2.2: Configure FastAPI to serve uploaded images via StaticFiles at /uploads with CORS. Modify: services/api/app/main.py, services/api/app/core/config.py. Dependencies: TASK-1.1, TASK-1.2")

# === PHASE 3: Frontend Components + Delete API (Batch 3) ===
# Wait for Batch 2 to complete, then launch in parallel
Task("python-backend-engineer", "TASK-2.3: Create DELETE /api/upload/image/{filename} endpoint. Delete original + thumbnail, validate ownership. File: services/api/app/api/upload.py. Dependencies: TASK-2.1")
Task("ui-engineer-enhanced", "TASK-3.1: Create ImageUploader component with file input, drag-drop, paste support. Show preview, progress, error states. 44px min touch targets. Files: apps/web/components/upload/ImageUploader.tsx, apps/web/components/upload/DropZone.tsx. Dependencies: TASK-2.1, TASK-2.2")
Task("ui-engineer-enhanced", "TASK-3.2: Create useImageUpload React Query hook for upload mutation with progress tracking and error handling. Files: apps/web/hooks/useImageUpload.ts, apps/web/lib/upload/uploadImage.ts, apps/web/lib/upload/imageValidation.ts. Dependencies: TASK-2.1")

# === PHASE 4: Form Integration (Batch 4) ===
# Wait for Batch 3 to complete, then launch in parallel
Task("ui-engineer-enhanced", "TASK-3.3: Create ImagePreview component showing uploaded image with remove button and loading states. File: apps/web/components/upload/ImagePreview.tsx. Dependencies: TASK-3.1")
Task("ui-engineer-enhanced", "TASK-4.1: Integrate ImageUploader into ManualGiftForm with toggle between URL input and file upload. Preserve URL functionality. File: apps/web/components/gifts/ManualGiftForm.tsx. Dependencies: TASK-3.1, TASK-3.2")
Task("ui-engineer-enhanced", "TASK-4.2: Integrate ImageUploader into PersonForm with toggle between URL input and file upload. Preserve URL functionality. File: apps/web/components/people/PersonForm.tsx. Dependencies: TASK-3.1, TASK-3.2")
Task("ui-engineer-enhanced", "TASK-4.3: Add ImageUploader to user profile/settings for avatar upload. File: apps/web/components/profile/ProfileSettings.tsx. Dependencies: TASK-3.1, TASK-3.2")

# === PHASE 5: Testing & Polish (Batch 5) ===
# Wait for relevant phases to complete, then launch in parallel
Task("python-backend-engineer", "TASK-5.1: Write unit tests for ImageProcessor and LocalFileStorage. Files: tests/unit/test_image_processor.py, tests/unit/test_storage.py. Dependencies: TASK-1.3, TASK-2.1")
Task("python-backend-engineer", "TASK-5.2: Write integration tests for POST/DELETE upload endpoints with validation and error cases. File: tests/integration/test_upload_api.py. Dependencies: TASK-2.1, TASK-2.3")
Task("ui-engineer-enhanced", "TASK-5.3: Write unit tests for upload components and hooks. Files: apps/web/components/upload/__tests__/. Dependencies: TASK-3.1, TASK-3.2")
Task("ui-engineer-enhanced", "TASK-5.4: Test on iOS Safari and Android Chrome (file picker, drag-drop, paste, HEIF conversion). Dependencies: TASK-4.1, TASK-4.2, TASK-4.3")
```

---

## Overview

**Feature Summary**: Add direct image upload capability to Family Gifting Dashboard, enabling users to upload images for Gifts, Persons, and Users instead of relying solely on external URLs.

**Why This Feature**:
- Simplifies user workflow (no need to find/host images externally)
- Better mobile experience (upload from camera/photo library)
- Supports Apple's HEIF/HEIC format natively
- Maintains data ownership (images stored in our infrastructure)

**Scope**:

**IN SCOPE**:
- Upload images via file chooser, drag-and-drop, clipboard paste
- Support JPEG, PNG, GIF, WebP, HEIF/HEIC formats
- Automatic thumbnail generation (400x400 max)
- Local filesystem storage with K8s PersistentVolume
- Interface design ready for future S3 migration
- Preserve existing URL input functionality
- Mobile-first responsive design (iOS safe areas, 44px touch targets)

**OUT OF SCOPE** (Future Enhancements):
- S3 storage migration (Phase 1 uses local filesystem)
- Image cropping before upload
- Multi-image upload (image galleries)
- Chunked upload for files >5MB
- CDN integration
- Automatic WebP conversion
- Upload history/rollback

---

## Success Criteria

| ID | Criterion | Status |
|----|-----------|--------|
| SC-1 | Users can upload images for gifts, persons, and user avatars | ⏳ Pending |
| SC-2 | Images validated (type check, max 10MB size) | ⏳ Pending |
| SC-3 | Thumbnails generated automatically (400x400 max) | ⏳ Pending |
| SC-4 | Mobile-first responsive design with 44px touch targets | ⏳ Pending |
| SC-5 | All existing URL-based workflows continue to work | ⏳ Pending |
| SC-6 | HEIF/HEIC files convert to JPEG successfully | ⏳ Pending |

---

## Phase-by-Phase Task Breakdown

### Phase 1: Backend Storage Infrastructure (3 pts)

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| TASK-1.1 | Storage Interface | ⏳ | python-backend-engineer | None | 0.5 pt | Abstract StorageBackend protocol |
| TASK-1.2 | Local FileSystem Storage | ⏳ | python-backend-engineer | None | 1 pt | Implements StorageBackend |
| TASK-1.3 | Image Processing Service | ⏳ | python-backend-engineer | None | 1.5 pts | Validation + thumbnail generation |

**Phase Status**: Not Started
**Acceptance Criteria**:
- StorageBackend interface defined with save(), delete(), get_url()
- LocalFileStorage creates directories and handles errors
- Image validation rejects invalid files (type, size)
- Thumbnail generation produces 400x400 max images
- HEIF/HEIC convert to JPEG
- Unit tests for ImageProcessor

### Phase 2: API Upload Endpoints (3 pts)

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| TASK-2.1 | Upload Endpoint | ⏳ | python-backend-engineer | TASK-1.1, TASK-1.2, TASK-1.3 | 1.5 pts | POST /api/upload/image |
| TASK-2.2 | Static File Serving | ⏳ | python-backend-engineer | TASK-1.1, TASK-1.2 | 0.5 pt | FastAPI StaticFiles mount |
| TASK-2.3 | Delete Endpoint | ⏳ | python-backend-engineer | TASK-2.1 | 1 pt | DELETE /api/upload/image/{filename} |

**Phase Status**: Not Started
**Acceptance Criteria**:
- Upload endpoint accepts multipart/form-data
- File validation rejects invalid types and oversized files
- Original and thumbnail stored with predictable naming
- URLs returned are valid and accessible
- Delete endpoint removes both original and thumbnail
- CORS configured for frontend access
- Error handling with proper HTTP status codes
- Integration tests for upload and delete flows

### Phase 3: Frontend Upload Components (4 pts)

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| TASK-3.1 | ImageUploader Component | ⏳ | ui-engineer-enhanced | TASK-2.1, TASK-2.2 | 2 pts | File input, drag-drop, paste |
| TASK-3.2 | useImageUpload Hook | ⏳ | ui-engineer-enhanced | TASK-2.1 | 1 pt | React Query mutation |
| TASK-3.3 | ImagePreview Component | ⏳ | ui-engineer-enhanced | TASK-3.1 | 1 pt | Preview with actions |

**Phase Status**: Not Started
**Acceptance Criteria**:
- ImageUploader renders with 44px min touch targets
- File input, drag-drop, and paste all work
- Client-side validation prevents invalid uploads
- Progress indicator shows during upload
- Error states display with clear messages
- Preview shows before and after upload
- Component is responsive and mobile-friendly
- Supports iOS safe areas
- Works on iOS Safari and Android Chrome

### Phase 4: Form Integration (2 pts)

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| TASK-4.1 | Gift Form Integration | ⏳ | ui-engineer-enhanced | TASK-3.1, TASK-3.2 | 0.75 pt | ManualGiftForm with toggle |
| TASK-4.2 | Person Form Integration | ⏳ | ui-engineer-enhanced | TASK-3.1, TASK-3.2 | 0.75 pt | PersonForm with toggle |
| TASK-4.3 | User Avatar Integration | ⏳ | ui-engineer-enhanced | TASK-3.1, TASK-3.2 | 0.5 pt | ProfileSettings avatar upload |

**Phase Status**: Not Started
**Acceptance Criteria**:
- Gift form supports both URL and upload
- Person form supports both URL and upload
- User profile supports avatar upload
- Existing URL workflows continue to work
- Form validation handles both input methods
- Upload URLs persist correctly to backend
- Display components (GiftCard, PersonCard) render uploaded images

### Phase 5: Testing & Polish (1 pt)

| ID | Task | Status | Agent | Dependencies | Est | Notes |
|----|------|--------|-------|--------------|-----|-------|
| TASK-5.1 | Backend Unit Tests | ⏳ | python-backend-engineer | TASK-1.3, TASK-2.1 | 0.25 pt | ImageProcessor, Storage tests |
| TASK-5.2 | API Integration Tests | ⏳ | python-backend-engineer | TASK-2.1, TASK-2.3 | 0.25 pt | Upload endpoint tests |
| TASK-5.3 | Frontend Unit Tests | ⏳ | ui-engineer-enhanced | TASK-3.1, TASK-3.2 | 0.25 pt | Component and hook tests |
| TASK-5.4 | Mobile Testing | ⏳ | ui-engineer-enhanced | TASK-4.1, TASK-4.2, TASK-4.3 | 0.25 pt | iOS/Android browser testing |

**Phase Status**: Not Started
**Acceptance Criteria**:
- Unit tests achieve 80%+ coverage
- Integration tests cover happy path and error cases
- E2E test: Create gift with uploaded image
- E2E test: Create person with uploaded photo
- E2E test: Upload user avatar
- Mobile testing passes on iOS Safari
- Mobile testing passes on Android Chrome
- Performance: Upload completes in <5s for 5MB image
- Accessibility: Components keyboard-navigable
- Accessibility: Error messages announced to screen readers

**Status Legend**:
- `⏳` Not Started (Pending)
- `🔄` In Progress
- `✓` Complete
- `🚫` Blocked
- `⚠️` At Risk

---

## Architecture Context

### Current State

**Database Schema**: No changes needed. Upload URLs are stored in existing `*_url` fields:
- Gift: `image_url` (Text, nullable)
- Person: `photo_url` (String(500), nullable)
- User: `avatar_url` (needs to be added in future migration)

**Storage Strategy**:
- **Phase 1**: Local filesystem with K8s PersistentVolume at `/var/app/uploads/`
- **Future**: S3-compatible interface for easy migration

**Path Structure**: `/var/app/uploads/{entity_type}/{entity_id}/{filename}`
- Example: `/var/app/uploads/gifts/123/abc123.jpg`

### Reference Patterns

**File Upload Pattern**: Similar to common FastAPI multipart upload patterns
- Validate file type and size before processing
- Process image (validate format, generate thumbnail)
- Store files with predictable naming (UUID + extension)
- Return URLs for original and thumbnail

**Frontend Upload Pattern**:
- Hidden file input triggered by button
- Drag-and-drop zone with visual feedback
- Paste handler (Ctrl+V / Cmd+V)
- Client-side validation before upload
- Progress indicator during upload

**Form Integration Pattern**:
- Toggle UI: [Image Upload Tab | URL Input Tab]
- Upload tab shows ImageUploader component
- URL tab shows traditional text input
- Both methods update the same form field (`image_url`)

---

## Implementation Details

### Technical Approach

**Backend**:
1. Create StorageBackend protocol (abstract interface)
2. Implement LocalFileStorage (concrete implementation)
3. Create ImageProcessor for validation and thumbnails
4. Add upload/delete API endpoints
5. Configure FastAPI static file serving

**Frontend**:
1. Create ImageUploader component (file, drag-drop, paste)
2. Create useImageUpload React Query hook
3. Create ImagePreview component
4. Integrate into existing forms with toggle UI
5. Preserve existing URL input functionality

**Data Flow**:
1. User uploads image via ImageUploader
2. Client validates file (type, size)
3. Upload to POST /api/upload/image with multipart/form-data
4. Server validates, processes, stores original + thumbnail
5. Server returns URLs
6. Form updates `image_url` field
7. Form submission sends URL to backend (no model changes)

### Known Gotchas

**HEIF/HEIC Conversion**:
- iOS devices capture photos in HEIF/HEIC by default
- Must convert to JPEG for web browser compatibility
- Pillow supports HEIF with `pillow-heif` plugin
- Fallback to `imagemagick` if Pillow fails

**Mobile Paste Support**:
- Limited clipboard paste support on mobile browsers
- iOS Safari paste may require user interaction
- Prioritize file picker and camera on mobile

**CORS Configuration**:
- Static files must be served with proper CORS headers
- Configure CORS in FastAPI StaticFiles mount
- Test from frontend origin

**K8s Storage**:
- PersistentVolume required for uploads to persist across pod restarts
- Monitor storage usage (minimum 10GB recommended)
- Implement cleanup for orphaned files

**Touch Target Size**:
- Minimum 44x44px for iOS touch targets
- Apply to all interactive elements (buttons, file inputs)

### Development Setup

**Backend Dependencies**:
```toml
# Add to services/api/pyproject.toml
pillow = "^10.0.0"          # Image processing
python-magic = "^0.4.27"    # MIME type detection
```

**Frontend Dependencies**:
```json
// Add to apps/web/package.json
{
  "react-dropzone": "^14.2.3"  // Drag-drop support
}
```

**Infrastructure**:
- K8s PersistentVolume at `/var/app/uploads/` (minimum 10GB)
- Update `k8s/api-deployment.yaml` to mount PV
- Set environment variables: `UPLOAD_DIR`, `MAX_FILE_SIZE_MB`

---

## Blockers

### Active Blockers

_None currently._

### Resolved Blockers

_None yet._

---

## Dependencies

### External Dependencies

- **Pillow (Python)**: Image processing library - Required for TASK-1.3
- **python-magic (Python)**: MIME type detection - Required for TASK-1.3
- **react-dropzone (Frontend)**: Drag-drop upload - Required for TASK-3.1
- **K8s PersistentVolume**: Storage infrastructure - Required before Phase 1

### Internal Integration Points

- **Gift Model** (`services/api/app/models/gift.py`): `image_url` field stores upload URL
- **Person Model** (`services/api/app/models/person.py`): `photo_url` field stores upload URL
- **User Model** (`services/api/app/models/user.py`): `avatar_url` field needs to be added
- **ManualGiftForm** (`apps/web/components/gifts/ManualGiftForm.tsx`): Integrate ImageUploader
- **PersonForm** (`apps/web/components/people/PersonForm.tsx`): Integrate ImageUploader
- **GiftCard** (`apps/web/components/gifts/GiftCard.tsx`): Display uploaded images
- **PersonCard** (`apps/web/components/people/PersonCard.tsx`): Display uploaded photos

---

## Testing Strategy

| Test Type | Scope | Coverage | Status |
|-----------|-------|----------|--------|
| Unit | ImageProcessor, Storage, Components | 80%+ | ⏳ |
| Integration | Upload/Delete API endpoints | Happy path + errors | ⏳ |
| E2E | Gift/Person/User image upload flows | All upload methods | ⏳ |
| Mobile | iOS Safari, Android Chrome | File picker, paste | ⏳ |
| A11y | WCAG 2.1 AA compliance | All upload components | ⏳ |

**Testing Matrix**:

| Scenario | Platform | Expected Behavior | Status |
|----------|----------|------------------|--------|
| File picker upload | iOS Safari | Opens camera/photo library, uploads | ⏳ |
| File picker upload | Android Chrome | Opens file manager, uploads | ⏳ |
| Paste image | Desktop Chrome | Ctrl+V pastes from clipboard | ⏳ |
| Paste image | macOS Safari | Cmd+V pastes from clipboard | ⏳ |
| Drag-drop | Desktop | Drop zone highlights, upload succeeds | ⏳ |
| Invalid file type | All | Error message, upload rejected | ⏳ |
| Oversized file | All | Error message, upload rejected | ⏳ |
| HEIF/HEIC upload | iOS | Converts to JPEG, uploads | ⏳ |

---

## Next Session Agenda

### Immediate Actions (Next Session)
1. [ ] Review implementation plan and progress file
2. [ ] Add backend dependencies (Pillow, python-magic) to pyproject.toml
3. [ ] Start Phase 1, Batch 1 (TASK-1.1, TASK-1.2, TASK-1.3) in parallel
4. [ ] Set up K8s PersistentVolume configuration

### Upcoming Critical Items

- **Week 1**: Complete Phase 1 (Backend Storage) and Phase 2 (API Endpoints)
- **Week 2**: Complete Phase 3 (Frontend Components) and Phase 4 (Form Integration)
- **Week 3**: Complete Phase 5 (Testing & Polish) and deploy

### Context for Continuing Agent

**Current State**: Feature not started. Implementation plan reviewed and progress tracking file created.

**Next Steps**:
1. Set up backend dependencies (Pillow, python-magic)
2. Set up frontend dependencies (react-dropzone)
3. Configure K8s PersistentVolume for `/var/app/uploads/`
4. Begin Phase 1 tasks (all can run in parallel)

**Key Files**:
- Implementation Plan: `docs/project_plans/implementation_plans/features/image-upload-v1.md`
- Progress Tracking: `.claude/progress/image-upload/all-phases-progress.md` (this file)

---

## Session Notes

_No sessions yet. Notes will be added as work progresses._

---

## Additional Resources

- **Implementation Plan**: `/Users/miethe/dev/homelab/development/family-shopping-dashboard/docs/project_plans/implementation_plans/features/image-upload-v1.md`
- **Architecture**: Layered architecture (Router → Service → Repository → DB)
- **Design Reference**: Mobile-first, iOS safe areas, 44px touch targets
- **Storage Strategy**: Local filesystem (Phase 1) → S3-ready interface (Phase 2)
- **API Documentation**: POST /api/upload/image, DELETE /api/upload/image/{filename}

---

**End of Progress Tracking File**

**Total Tasks**: 16
**Total Effort**: 13 story points
**Estimated Timeline**: 2-3 weeks
**Next Update**: After Phase 1 completion
