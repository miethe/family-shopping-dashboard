# Implementation Plan: Direct Image Upload Support

**Plan ID**: `IMPL-2025-12-02-IMAGE-UPLOAD-V1`
**Date**: 2025-12-02
**Complexity**: Medium (M)
**Track**: Standard Track
**Estimated Effort**: 13 story points
**Target Timeline**: 2-3 weeks
**Team Size**: 1-2 developers

---

## Executive Summary

This implementation plan adds direct image upload capability to the Family Gifting Dashboard, enabling users to upload images for Gifts, Persons, and Users instead of relying solely on external URLs. The feature supports multiple upload methods (file chooser, drag-and-drop, clipboard paste) and common image formats including Apple's HEIF/HEIC.

**Key Capabilities**:
- Upload images via file chooser, drag-and-drop, and clipboard paste
- Support JPEG, PNG, GIF, WebP, HEIF/HEIC formats
- Automatic thumbnail generation (400x400 max)
- Local filesystem storage with S3-ready interface for future migration
- Preserve existing URL input functionality

**Success Criteria**:
- Users can upload images for gifts, persons, and user avatars
- Images are validated (type, size max 10MB)
- Thumbnails generated automatically
- Mobile-first responsive design with 44px touch targets
- All existing URL-based workflows continue to work

---

## Architecture Overview

### Storage Strategy

**Phase 1 (Current)**: Local filesystem storage with K8s PersistentVolume
- Storage path: `/var/app/uploads/`
- Organized by entity: `/uploads/{entity_type}/{entity_id}/{filename}`
- Served via FastAPI static files

**Phase 2 (Future-Ready)**: S3-compatible interface
- Abstract storage backend with interface
- Easy migration to S3/MinIO without code changes

### Layer Sequence

Following project layered architecture (Router → Service → Repository → DB):

```
1. Storage Abstraction Layer (new)
2. Image Processing Service (new)
3. Upload API Router (new)
4. Frontend Upload Components (new)
5. Form Integration (modify existing)
```

---

## Implementation Phases

| Phase | Name | Effort | Dependencies | Primary Agent |
|-------|------|--------|--------------|---------------|
| 1 | Backend Storage Infrastructure | 3 pts | None | python-backend-engineer |
| 2 | API Upload Endpoints | 3 pts | Phase 1 | python-backend-engineer |
| 3 | Frontend Upload Components | 4 pts | Phase 2 | ui-engineer-enhanced |
| 4 | Form Integration | 2 pts | Phase 3 | ui-engineer-enhanced |
| 5 | Testing & Polish | 1 pt | All previous | python-backend-engineer, ui-engineer-enhanced |

**Total**: 13 story points

---

## Phase 1: Backend Storage Infrastructure

**Duration**: 2-3 days
**Effort**: 3 story points
**Dependencies**: None
**Primary Agent**: `python-backend-engineer`

### Epic: UPLOAD-1 - Storage Abstraction & Image Processing

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| UPLOAD-001 | Storage Interface | Create abstract storage interface for future S3 compatibility | `StorageBackend` protocol with `save()`, `delete()`, `get_url()` methods | 0.5 pt | python-backend-engineer |
| UPLOAD-002 | Local FileSystem Storage | Implement local filesystem storage backend | LocalFileStorage class implements StorageBackend, stores to `/var/app/uploads/{entity_type}/{entity_id}/`, creates directories if needed | 1 pt | python-backend-engineer |
| UPLOAD-003 | Image Processing Service | Create service for image validation and thumbnail generation | ImageProcessor with `validate()`, `generate_thumbnail()`, supports JPEG/PNG/GIF/WebP/HEIF, max 10MB validation, 400x400 thumbnail generation | 1.5 pts | python-backend-engineer |

### Files to Create

```
services/api/app/
├── core/
│   ├── storage.py                    # StorageBackend protocol, LocalFileStorage
│   └── image_processor.py            # ImageProcessor service
└── schemas/
    └── upload.py                      # UploadResponse, ImageUploadDTO
```

### Dependencies

- Python libraries: `Pillow` (image processing), `python-magic` (MIME type detection)
- Add to `pyproject.toml`: `pillow = "^10.0.0"`, `python-magic = "^0.4.27"`

### Quality Gates

- [ ] StorageBackend interface defined with clear contract
- [ ] LocalFileStorage creates directories and handles errors
- [ ] Image validation rejects invalid files (wrong type, too large)
- [ ] Thumbnail generation produces 400x400 max images
- [ ] HEIF/HEIC files convert to JPEG for web compatibility
- [ ] Unit tests for ImageProcessor validation and thumbnail logic

---

## Phase 2: API Upload Endpoints

**Duration**: 2-3 days
**Effort**: 3 story points
**Dependencies**: Phase 1
**Primary Agent**: `python-backend-engineer`

### Epic: UPLOAD-2 - Upload API Routes

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| UPLOAD-004 | Upload Endpoint | Create POST /api/upload/image endpoint | Accepts multipart/form-data, validates file, processes image, stores original + thumbnail, returns URLs | 1.5 pts | python-backend-engineer |
| UPLOAD-005 | Static File Serving | Configure FastAPI to serve uploaded images | StaticFiles mount at `/uploads`, CORS configured for direct access | 0.5 pt | python-backend-engineer |
| UPLOAD-006 | Delete Endpoint | Create DELETE /api/upload/image/{filename} endpoint | Deletes original + thumbnail, validates ownership/permissions | 1 pt | python-backend-engineer |

### Files to Create/Modify

```
services/api/app/
├── api/
│   └── upload.py                     # Upload router (new)
├── main.py                           # Mount static files (modify)
└── core/
    └── config.py                     # Add UPLOAD_DIR, MAX_FILE_SIZE (modify)
```

### API Specification

**POST /api/upload/image**

Request:
```
Content-Type: multipart/form-data

file: <binary>
entity_type: "gift" | "person" | "user"
entity_id: <int>
```

Response (201):
```json
{
  "original_url": "http://api.example.com/uploads/gifts/123/abc123.jpg",
  "thumbnail_url": "http://api.example.com/uploads/gifts/123/abc123_thumb.jpg",
  "filename": "abc123.jpg"
}
```

Error (400):
```json
{
  "error": {
    "code": "INVALID_FILE_TYPE",
    "message": "File type not supported. Allowed: JPEG, PNG, GIF, WebP, HEIF",
    "trace_id": "xyz789"
  }
}
```

**DELETE /api/upload/image/{filename}**

Response (204): No content

### Quality Gates

- [ ] Upload endpoint accepts multipart/form-data
- [ ] File validation rejects invalid types and oversized files
- [ ] Original and thumbnail stored with predictable naming
- [ ] URLs returned are valid and accessible
- [ ] Delete endpoint removes both original and thumbnail
- [ ] CORS configured for frontend access
- [ ] Error handling with proper HTTP status codes
- [ ] Integration tests for upload and delete flows

---

## Phase 3: Frontend Upload Components

**Duration**: 3-4 days
**Effort**: 4 story points
**Dependencies**: Phase 2
**Primary Agent**: `ui-engineer-enhanced`

### Epic: UPLOAD-3 - Reusable Upload Components

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| UPLOAD-007 | ImageUploader Component | Create reusable ImageUploader component | Supports file input, drag-drop, paste, shows preview, progress indicator, error states | 2 pts | ui-engineer-enhanced |
| UPLOAD-008 | useImageUpload Hook | Create React Query hook for upload mutation | Handles multipart upload, progress tracking, error handling, cache invalidation | 1 pt | ui-engineer-enhanced |
| UPLOAD-009 | ImagePreview Component | Create preview component with edit/remove actions | Shows uploaded image, thumbnail preview, remove button, loading states | 1 pt | ui-engineer-enhanced |

### Files to Create

```
apps/web/
├── components/
│   └── upload/
│       ├── ImageUploader.tsx         # Main upload component
│       ├── ImagePreview.tsx          # Preview with actions
│       └── DropZone.tsx              # Drag-drop zone
├── hooks/
│   └── useImageUpload.ts             # Upload mutation hook
└── lib/
    └── upload/
        ├── uploadImage.ts            # Upload API client
        └── imageValidation.ts        # Client-side validation
```

### Component Specifications

**ImageUploader Component**

Props:
```typescript
interface ImageUploaderProps {
  entityType: 'gift' | 'person' | 'user';
  entityId?: number;
  currentImageUrl?: string;
  onUploadComplete: (urls: { original: string; thumbnail: string }) => void;
  onRemove?: () => void;
  maxSizeMB?: number; // default 10
  aspectRatio?: number; // optional crop aspect ratio
}
```

Features:
- Hidden file input triggered by button (44px min touch target)
- Drag-and-drop zone with visual feedback
- Paste handler (Ctrl+V / Cmd+V)
- Client-side validation before upload
- Progress bar during upload
- Error display with retry option
- Preview before/after upload

**useImageUpload Hook**

```typescript
function useImageUpload() {
  return useMutation({
    mutationFn: async (data: {
      file: File;
      entityType: string;
      entityId: number;
    }) => {
      // multipart upload to /api/upload/image
    },
    onSuccess: (data) => {
      // invalidate relevant queries
    },
  });
}
```

### Quality Gates

- [ ] ImageUploader renders with 44px min touch targets
- [ ] File input, drag-drop, and paste all work
- [ ] Client-side validation prevents invalid uploads
- [ ] Progress indicator shows during upload
- [ ] Error states display with clear messages
- [ ] Preview shows before and after upload
- [ ] Component is responsive and mobile-friendly
- [ ] Supports iOS safe areas
- [ ] Works on iOS Safari and Android Chrome

---

## Phase 4: Form Integration

**Duration**: 2 days
**Effort**: 2 story points
**Dependencies**: Phase 3
**Primary Agent**: `ui-engineer-enhanced`

### Epic: UPLOAD-4 - Integrate Upload into Forms

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| UPLOAD-010 | Gift Form Integration | Add ImageUploader to ManualGiftForm | Toggle between URL input and file upload, preserve URL functionality, update gift on upload | 0.75 pt | ui-engineer-enhanced |
| UPLOAD-011 | Person Form Integration | Add ImageUploader to PersonForm | Toggle between URL input and file upload, preserve URL functionality, update person on upload | 0.75 pt | ui-engineer-enhanced |
| UPLOAD-012 | User Avatar Integration | Add ImageUploader to user profile/settings | Upload avatar, update user model, display in header/nav | 0.5 pt | ui-engineer-enhanced |

### Files to Modify

```
apps/web/components/
├── gifts/
│   └── ManualGiftForm.tsx            # Add ImageUploader (modify)
├── people/
│   └── PersonForm.tsx                # Add ImageUploader (modify)
└── profile/
    └── ProfileSettings.tsx           # Add avatar upload (modify)
```

### Integration Pattern

**Toggle UI Pattern**:
```
[ Image Upload Tab | URL Input Tab ]

If "Image Upload":
  <ImageUploader ... />

If "URL Input":
  <Input type="url" ... />
```

**Data Flow**:
1. User uploads image via ImageUploader
2. onUploadComplete receives URLs
3. Form updates `image_url` / `photo_url` / `avatar_url` field
4. Form submission sends URL to backend (no model changes needed)

### Quality Gates

- [ ] Gift form supports both URL and upload
- [ ] Person form supports both URL and upload
- [ ] User profile supports avatar upload
- [ ] Existing URL workflows continue to work
- [ ] Form validation handles both input methods
- [ ] Upload URLs persist correctly to backend
- [ ] Display components (GiftCard, PersonCard) render uploaded images

---

## Phase 5: Testing & Polish

**Duration**: 1-2 days
**Effort**: 1 story point
**Dependencies**: All previous phases
**Primary Agents**: `python-backend-engineer`, `ui-engineer-enhanced`

### Epic: UPLOAD-5 - Quality Assurance

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| UPLOAD-013 | Backend Unit Tests | Test storage and image processing | Tests for ImageProcessor, LocalFileStorage, upload validation | 0.25 pt | python-backend-engineer |
| UPLOAD-014 | API Integration Tests | Test upload endpoints | Tests for POST/DELETE endpoints, file validation, error cases | 0.25 pt | python-backend-engineer |
| UPLOAD-015 | Frontend Unit Tests | Test upload components and hooks | Tests for ImageUploader, useImageUpload, validation | 0.25 pt | ui-engineer-enhanced |
| UPLOAD-016 | Mobile Testing | Test on iOS and Android | Verify file picker, drag-drop (mobile), paste on iOS Safari and Android Chrome | 0.25 pt | ui-engineer-enhanced |

### Testing Matrix

| Scenario | Platform | Expected Behavior |
|----------|----------|------------------|
| File picker upload | iOS Safari | Opens camera/photo library, uploads successfully |
| File picker upload | Android Chrome | Opens file manager, uploads successfully |
| Paste image | Desktop Chrome | Ctrl+V pastes from clipboard |
| Paste image | macOS Safari | Cmd+V pastes from clipboard |
| Drag-drop | Desktop | Drag image file, drop zone highlights, upload succeeds |
| Invalid file type | All | Error message displayed, upload rejected |
| Oversized file | All | Error message displayed, upload rejected |
| HEIF/HEIC upload | iOS | Converts to JPEG, uploads successfully |

### Quality Gates

- [ ] Unit tests achieve 80%+ coverage
- [ ] Integration tests cover happy path and error cases
- [ ] E2E test: Create gift with uploaded image
- [ ] E2E test: Create person with uploaded photo
- [ ] E2E test: Upload user avatar
- [ ] Mobile testing passes on iOS Safari
- [ ] Mobile testing passes on Android Chrome
- [ ] Performance: Upload completes in <5s for 5MB image
- [ ] Accessibility: Components keyboard-navigable
- [ ] Accessibility: Error messages announced to screen readers

---

## Risk Assessment

### Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| HEIF/HEIC conversion issues on server | High | Medium | Test Pillow HEIF support, fallback to imagemagick if needed |
| Large file uploads timeout | Medium | Low | Implement chunked upload for files >5MB in future iteration |
| K8s PV storage limits | Medium | Low | Monitor storage usage, implement cleanup for orphaned files |
| CORS issues with static files | Medium | Low | Configure CORS explicitly in FastAPI StaticFiles mount |
| Mobile browser paste support | Low | Medium | Document limitation, prioritize file picker on mobile |

### Implementation Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| Existing URL workflows break | High | Low | Thorough testing of existing forms, preserve URL input option |
| Upload component UX complex | Medium | Medium | Iterate on design, user testing with family members |
| Backend storage path conflicts | Low | Low | Use UUID filenames, validate entity ownership |

---

## Dependencies & Prerequisites

### Backend Dependencies

Add to `services/api/pyproject.toml`:
```toml
pillow = "^10.0.0"          # Image processing
python-magic = "^0.4.27"    # MIME type detection
```

### Frontend Dependencies

Add to `apps/web/package.json`:
```json
{
  "react-dropzone": "^14.2.3",     // Drag-drop support
  "heic2any": "^0.0.4"              // Client-side HEIC conversion (optional)
}
```

### Infrastructure Prerequisites

- K8s PersistentVolume for `/var/app/uploads/` (minimum 10GB)
- Update K8s deployment manifest to mount PV
- CORS configuration to allow frontend origin

---

## File Structure Summary

### New Files

```
services/api/app/
├── core/
│   ├── storage.py                    # Storage abstraction
│   └── image_processor.py            # Image validation & processing
├── api/
│   └── upload.py                     # Upload router
└── schemas/
    └── upload.py                      # Upload DTOs

apps/web/
├── components/upload/
│   ├── ImageUploader.tsx
│   ├── ImagePreview.tsx
│   └── DropZone.tsx
├── hooks/
│   └── useImageUpload.ts
└── lib/upload/
    ├── uploadImage.ts
    └── imageValidation.ts

tests/
├── unit/
│   ├── test_image_processor.py
│   └── test_storage.py
└── integration/
    └── test_upload_api.py
```

### Modified Files

```
services/api/
├── app/main.py                       # Mount static files
├── app/core/config.py                # Add upload settings
└── pyproject.toml                    # Add dependencies

apps/web/
├── components/gifts/ManualGiftForm.tsx
├── components/people/PersonForm.tsx
├── components/profile/ProfileSettings.tsx
└── package.json                      # Add dependencies

k8s/
└── api-deployment.yaml               # Mount PV
```

---

## Deployment Checklist

### Backend Deployment

- [ ] Add Pillow and python-magic to dependencies
- [ ] Create `/var/app/uploads/` directory structure
- [ ] Configure K8s PersistentVolume
- [ ] Update K8s deployment to mount PV at `/var/app/uploads/`
- [ ] Set environment variables: `UPLOAD_DIR`, `MAX_FILE_SIZE_MB`
- [ ] Configure CORS for static file serving

### Frontend Deployment

- [ ] Add react-dropzone dependency
- [ ] Update NEXT_PUBLIC_API_URL if needed for uploads
- [ ] Test upload flow in staging environment
- [ ] Verify uploaded images display correctly

### Monitoring

- [ ] Add logging for upload errors
- [ ] Monitor storage usage on PV
- [ ] Track upload success/failure rates
- [ ] Alert on storage >80% capacity

---

## Future Enhancements (Out of Scope)

These enhancements are not included in V1 but noted for future consideration:

1. **S3 Storage Migration** - Migrate from local filesystem to S3/MinIO for scalability
2. **Image Cropping** - Allow users to crop images before upload
3. **Multi-Image Upload** - Support multiple images per entity (image galleries)
4. **Chunked Upload** - For files >5MB, upload in chunks for better reliability
5. **CDN Integration** - Serve images via CDN for better performance
6. **Image Optimization** - Automatic compression and WebP conversion
7. **Upload History** - Track previous uploads and allow rollback

---

## Success Metrics

Post-deployment, measure:

- **Adoption Rate**: % of new gifts/persons created with uploaded images vs URLs
- **Upload Success Rate**: % of uploads that complete successfully
- **Error Rate**: % of uploads that fail (by error type)
- **Performance**: Average upload time by file size
- **Storage Growth**: Rate of storage usage increase

**Target Goals** (1 month post-deployment):
- Upload success rate: >95%
- Average upload time: <3s for 2MB image
- User adoption: >50% of new entities use uploads

---

## Appendix: Entity Schema Reference

### Current Schema (No Changes Needed)

**Gift Model** (`services/api/app/models/gift.py`):
```python
image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
```

**Person Model** (`services/api/app/models/person.py`):
```python
photo_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
```

**User Model** (`services/api/app/models/user.py`):
```python
# avatar_url field needs to be added in future migration
```

**Note**: No database migrations required for this feature. Upload URLs are stored in existing `*_url` fields.

---

**End of Implementation Plan**

**Total Lines**: 583
**Estimated Reading Time**: 15 minutes
**Next Steps**: Review plan, assign tasks to team, create Phase 1 progress tracking document
