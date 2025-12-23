---
title: "Implementation Plan: Admin Field Options v1"
description: "Detailed implementation plan for database-driven field options with admin management UI, replacing hardcoded Python sets with dynamic database lookups"
audience: [developers, project-managers]
tags: [implementation-plan, admin, backend, frontend, database]
created: 2025-12-20
updated: 2025-12-20
category: "implementation-planning"
status: active
related: ["docs/project_plans/PRDs/features/admin-field-options-v1.md"]
---

# Implementation Plan: Admin Field Options v1

**Feature**: Admin Page for Dynamic Field Options
**Status**: Ready for implementation
**Complexity**: Large (L)
**Estimated Effort**: 100 story points
**Timeline**: 4-5 developer-weeks (single dev) or 2-3 weeks (2 devs)
**Track**: Full Track (Comprehensive planning with all phases)

---

## Executive Summary

This feature enables administrators to manage dropdown options (wine types, gift priorities, occasion types, etc.) through a web UI instead of hardcoded Python code. The implementation spans 10 phases across backend infrastructure, frontend admin page, validation refactoring, and testing.

**Key Deliverables**:
- `field_options` database table with proper schema and indexes
- FieldOptionsRepository, Service, and Router (CRUD endpoints)
- Admin page with tab-based entity management
- React Query integration for real-time option availability
- Backward-compatible validators that query database
- Comprehensive test coverage (unit, integration, E2E)
- Complete documentation (API, user guide, developer guide)

**Success Criteria**:
- All ~25 Person option sets + 6 Gift/Occasion/List enums migrated to database
- Admin can add/edit/delete options in <1 minute (vs. 2 days via code)
- Options available to users within 5 seconds of admin change (no app restart)
- Zero data loss for in-use options (soft-delete with usage detection)
- >80% test coverage for service layer
- WCAG 2.1 AA compliant admin UI

---

## Implementation Phases Overview

Due to plan size, implementation is split into **3 main phase files**:

| Phase | Name | File | Weeks | Focus | Tasks |
|-------|------|------|-------|-------|-------|
| **1-4** | Backend Infrastructure | `admin-field-options-v1/phase-1-4-backend.md` | 2-2.5 | Database, Repository, Service, API | Schema, Migration, CRUD endpoints |
| **5-8** | Frontend & Validation | `admin-field-options-v1/phase-5-8-frontend.md` | 2-2.5 | Admin UI, Navigation, Validator refactor | AdminPage, Modals, Cache integration |
| **9-10** | Testing & Documentation | `admin-field-options-v1/phase-9-10-testing.md` | 1-1.5 | Quality assurance, comprehensive docs | Tests, Docs, Performance, Accessibility |

**Critical Path Dependencies**:
```
Phase 1 (DB) → Phase 2 (Repo) → Phase 3 (Service) → Phase 4 (API)
                                                       ↓
                                          Phase 5-8 (Frontend)
                                          ↓
                                          Phase 9-10 (Testing)
```

---

## Architecture Overview

### Database Layer

**Table**: `field_options`
```sql
CREATE TABLE field_options (
    id BIGSERIAL PRIMARY KEY,
    entity VARCHAR(50) NOT NULL,              -- "person", "gift", "occasion", "list"
    field_name VARCHAR(100) NOT NULL,         -- "wine_types", "priority", "type"
    value VARCHAR(255) NOT NULL,              -- immutable key: "sake", "low"
    display_label VARCHAR(255) NOT NULL,      -- human-readable: "Sake", "Low Priority"
    display_order INT DEFAULT 0,              -- for sorting in UI
    is_system BOOLEAN DEFAULT FALSE,          -- TRUE = hardcoded defaults (immutable)
    is_active BOOLEAN DEFAULT TRUE,           -- FALSE = soft-deleted
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    created_by UUID NULLABLE,                 -- audit trail
    updated_by UUID NULLABLE,
    UNIQUE(entity, field_name, value),
    FOREIGN KEY (created_by) REFERENCES "user"(id) ON DELETE SET NULL,
    FOREIGN KEY (updated_by) REFERENCES "user"(id) ON DELETE SET NULL
);
CREATE INDEX idx_field_options_entity_field ON field_options(entity, field_name, is_active);
```

### API Endpoints

**Scope**: `/api/field-options`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `GET` | `/api/field-options?entity=person&field_name=wine_types&include_inactive=false` | Fetch options for entity/field |
| `POST` | `/api/field-options` | Create new option |
| `PUT` | `/api/field-options/{id}` | Edit display_label or display_order |
| `DELETE` | `/api/field-options/{id}?hard_delete=false` | Soft or hard delete |

### Service Layer Architecture

```
FieldOptionsRouter
    ↓
FieldOptionsService (validates, business logic)
    ↓
FieldOptionsRepository (DB queries)
    ↓
field_options table (PostgreSQL)
```

**Key Principles**:
- Router handles HTTP input validation
- Service handles business logic (permission checks, duplicate detection)
- Repository owns all DB I/O and query logic
- Service returns DTOs only (never ORM models)

### Frontend Integration

**React Query Cache Strategy**:
```typescript
// Cache key structure
queryKey: ["field-options", entity, field_name]
staleTime: 5 * 60 * 1000  // 5 minutes
refetchOnWindowFocus: true
```

**Real-time Updates**:
- Admin POST/PUT/DELETE operations trigger cache invalidation
- All dropdown components use same query key → auto-refetch
- No WebSocket needed (options change infrequently)

---

## Task Breakdown (All Phases)

### Phase 1-4: Backend Infrastructure

See `/docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-1-4-backend.md`

**Deliverables**:
- Field_options table created with migration
- FieldOption SQLAlchemy model + Pydantic schemas
- FieldOptionsRepository with CRUD methods
- FieldOptionsService with validation logic
- FieldOptionsRouter with REST endpoints
- Unit & integration test coverage >80%

**Estimated Effort**: 23 story points
**Duration**: 2-2.5 weeks (1 developer)

### Phase 5-8: Frontend & Validation

See `/docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-5-8-frontend.md`

**Deliverables**:
- Admin navigation item in sidebar
- AdminPage with tab-based entity selection
- FieldsList, OptionsList components
- Add/Edit/Delete modals
- React Query integration with cache invalidation
- Validator refactor (Person, Gift, Occasion, List)
- Backward compatibility verification

**Estimated Effort**: 22 story points
**Duration**: 2-2.5 weeks (1 developer)

### Phase 9-10: Testing & Documentation

See `/docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-9-10-testing.md`

**Deliverables**:
- Comprehensive unit tests (Service layer)
- Integration tests (all API endpoints)
- E2E tests (full admin workflow)
- Performance benchmarks
- Accessibility audit (WCAG 2.1 AA)
- API documentation & Postman collection
- Admin user guide
- Developer extension guide

**Estimated Effort**: 20 story points
**Duration**: 1-1.5 weeks (1 developer or parallel with phases 5-8)

---

## Technology Stack & Dependencies

### Backend
- **Framework**: FastAPI 0.115+
- **ORM**: SQLAlchemy 2.x
- **Migrations**: Alembic
- **Database**: PostgreSQL 13+
- **Validation**: Pydantic v2.x
- **Testing**: pytest + fixtures

### Frontend
- **Framework**: Next.js 15+ (App Router)
- **State**: React Query (Tanstack v4+)
- **UI**: Radix UI + Tailwind CSS
- **Testing**: Vitest + Playwright
- **HTTP**: Native fetch (via API wrapper)

### Development Tools
- **Python Package Manager**: uv
- **Node Package Manager**: pnpm
- **Container**: Docker + Docker Compose

---

## Risk Mitigation

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| **Data Loss**: Hard-delete of in-use options | Low | High | Enforce soft-delete, show usage count in UI, require confirmation |
| **Migration Failure**: Seeding 500+ options fails partway | Low | High | Use transaction, test locally, document rollback procedure |
| **Cache Miss**: Admin changes but old cached value appears | Medium | Medium | Invalidate immediately after DB commit, verify React Query refetch |
| **Validation Bypass**: Old enum value submitted after deletion | Medium | Medium | Soft-delete keeps option queryable, fallback to enum during transition |
| **Performance Regression**: Option queries slow down form loads | Low | Medium | Batch load options, cache in React Query, use eager loading in repo |
| **Concurrent Edits**: Two admins edit same option simultaneously | Low | Low | Last-write-wins acceptable for small team (future: pessimistic locking) |
| **Enum Compatibility**: ORM enums conflict with DB options | Medium | Medium | Keep enum as fallback, read DB first, gradual migration |
| **Unauthorized Access**: Non-admin user modifies options | Low | High | Add permission check (boilerplate ready, enforced in future) |

**Mitigation Timeline**:
- Pre-Phase 1: Document rollback procedure
- During Phase 2: Design usage detection query
- During Phase 4: Implement permission check boilerplate
- During Phase 5: Implement UI soft-delete warning
- Phase 9: Load test with 500 options

---

## Quality Gates

### Before Phase 1 Start
- [ ] PRD finalized and signed off
- [ ] Database design reviewed by team
- [ ] Migration strategy documented
- [ ] Rollback plan in place

### Before Phase 4 Deployment
- [ ] All repository tests pass (>90% coverage)
- [ ] All service tests pass (>90% coverage)
- [ ] Integration tests pass for all CRUD endpoints
- [ ] Migration runs cleanly on staging DB
- [ ] No n+1 queries in option lookups

### Before Phase 8 Deployment
- [ ] Admin page loads <1 second
- [ ] All CRUD operations complete <200ms (p95)
- [ ] React Query cache invalidation verified (<5s)
- [ ] Backward compatibility verified (old enum values still work)
- [ ] Keyboard navigation works without mouse
- [ ] Screen reader announces all controls

### Before Production Release
- [ ] E2E test for full admin workflow passes
- [ ] Performance benchmarks meet targets
- [ ] Security review: no SQL injection, proper auth checks
- [ ] Accessibility audit: WCAG 2.1 AA compliant
- [ ] Documentation complete and reviewed
- [ ] Staging deployment successful
- [ ] Monitoring and alerting configured

---

## File Structure

### Files to Create

**Backend**:
- `services/api/app/models/field_option.py` (SQLAlchemy model)
- `services/api/app/schemas/field_option.py` (Pydantic DTOs)
- `services/api/app/repositories/field_option.py` (Repository class)
- `services/api/app/services/field_option_service.py` (Service class)
- `services/api/app/api/routes/field_options.py` (Router)
- `services/api/tests/unit/services/test_field_option_service.py`
- `services/api/tests/integration/test_field_options_api.py`
- `services/api/alembic/versions/*_create_field_options_table.py` (Migration)
- `services/api/alembic/versions/*_seed_field_options.py` (Seeding migration)

**Frontend**:
- `apps/web/app/admin/page.tsx` (Admin page)
- `apps/web/app/admin/layout.tsx` (Admin layout)
- `apps/web/components/admin/AdminPage.tsx` (Admin container)
- `apps/web/components/admin/EntityTabs.tsx` (Tab navigation)
- `apps/web/components/admin/FieldsList.tsx` (Fields list per entity)
- `apps/web/components/admin/OptionsList.tsx` (Options for field)
- `apps/web/components/admin/AddOptionModal.tsx` (Add form)
- `apps/web/components/admin/EditOptionModal.tsx` (Edit form)
- `apps/web/components/admin/DeleteConfirmationModal.tsx` (Delete confirmation)
- `apps/web/hooks/useFieldOptions.ts` (React Query hook)
- `apps/web/hooks/useFieldOptionsMutation.ts` (Mutation hook)
- `apps/web/lib/api/field-options.ts` (API client)
- `apps/web/tests/components/admin/*.test.tsx`
- `apps/web/tests/e2e/admin-workflow.spec.ts`

**Documentation**:
- `docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-1-4-backend.md`
- `docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-5-8-frontend.md`
- `docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-9-10-testing.md`
- `docs/api/field-options-api.md` (API documentation)
- `docs/guides/admin-user-guide.md` (Admin how-to)
- `docs/guides/developers/field-options-extension.md` (Developer guide)
- `.claude/progress/admin-field-options-v1/all-phases-progress.md` (Progress tracking)

### Files to Modify

**Backend**:
- `services/api/app/models/__init__.py` (register FieldOption model)
- `services/api/app/api/main.py` (register FieldOptionsRouter)
- `services/api/app/schemas/person.py` (update validators)
- `services/api/app/schemas/gift.py` (update validators)
- `services/api/app/schemas/occasion.py` (update validators)
- `services/api/app/schemas/list.py` (update validators)
- `services/api/app/models/user.py` (add is_admin flag - optional)

**Frontend**:
- `apps/web/app/layout.tsx` (add admin route guard)
- `apps/web/components/shared/Navigation.tsx` (add Admin nav item)
- `apps/web/lib/api.ts` (ensure fetch wrapper supports all methods)
- `apps/web/hooks/index.ts` (export new hooks)
- `apps/web/tailwind.config.ts` (if modal styling needs adjustment)

**Documentation**:
- `services/api/CLAUDE.md` (add field_options pattern section)
- `apps/web/CLAUDE.md` (add admin page pattern section)
- `CLAUDE.md` (reference field_options in common tasks)

---

## Timeline & Milestones

### Week 1: Database & Repository (Phase 1-2)
- **Mon-Tue**: Create table schema, migration, model, DTO schemas
- **Wed**: FieldOptionsRepository with CRUD + usage detection
- **Thu-Fri**: Unit tests for repository, migration testing on staging

**Deliverable**: Phase 1 & 2 complete, 15+ passing tests, ready for service layer

### Week 2: Service & API (Phase 3-4)
- **Mon-Tue**: FieldOptionsService with validation & permission checks
- **Wed-Thu**: FieldOptionsRouter with 4 main endpoints
- **Fri**: Integration tests for all endpoints, error handling verification

**Deliverable**: Phase 3 & 4 complete, API ready for testing, 30+ passing tests

### Week 3: Frontend Admin Page (Phase 5-6)
- **Mon**: Add Admin nav item, create AdminPage skeleton
- **Tue-Wed**: EntityTabs, FieldsList, OptionsList components
- **Thu-Fri**: Add/Edit/Delete modals, React Query integration

**Deliverable**: Phase 5 & 6 complete, admin page functional, basic flow works

### Week 4: Validation Refactor & Testing (Phase 7-9)
- **Mon-Tue**: Refactor Person/Gift/Occasion/List validators
- **Wed**: Backend E2E tests, performance benchmarks
- **Thu-Fri**: Frontend E2E tests, accessibility audit, documentation

**Deliverable**: Phase 7-9 complete, all tests passing, ready for staging deployment

### Week 5: Final Polish & Deployment (Phase 10)
- **Mon-Tue**: Documentation refinement, Postman collection
- **Wed**: Staging deployment, smoke testing, monitoring setup
- **Thu-Fri**: Production deployment, validation, monitoring

**Deliverable**: Phase 10 complete, feature live in production

---

## Success Metrics

### Functional Metrics
| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Time to add new option | <1 minute | Manual stopwatch from admin form to dropdown |
| Option availability | <5 seconds | React Query cache invalidation timestamp diff |
| Admin page load time | <1 second | Lighthouse/DevTools Network tab |
| CRUD response time (p95) | <200ms | API logs, client timing |
| Migration seeding time | <30 seconds | Alembic logs for 500+ options |

### Quality Metrics
| Metric | Target | Method |
|--------|--------|--------|
| Service layer coverage | >80% | pytest --cov |
| Integration test coverage | >70% | pytest --cov |
| E2E test coverage | 100% of admin workflow | Playwright reports |
| WCAG 2.1 AA compliance | 100% | axe-core audit tool |
| Performance (p95) | <200ms | Load test with k6 |

### Data Safety Metrics
| Metric | Target | Method |
|--------|--------|--------|
| In-use option soft-delete | 100% | Query DB for soft-deleted with records |
| Data integrity | 0 loss events | Manual testing + E2E |
| Rollback success | 100% | Test migration rollback |

---

## Next Steps (To Start Phase 1)

1. **Team Kickoff**: Review this plan, confirm phase durations, assign leads
2. **Environment Setup**: Ensure all dev tools installed (uv, pnpm, Docker)
3. **Database Design Review**: Team sign-off on schema and indexes
4. **Feature Flag Planning**: Decide on flag names and initial values
5. **Progress Tracking**: Create `.claude/progress/admin-field-options-v1/all-phases-progress.md`

---

## References

### Related PRD & Architecture
- **PRD**: `docs/project_plans/PRDs/features/admin-field-options-v1.md`
- **North Star**: `docs/project_plans/north-star/family-gifting-dash.md`
- **API Guide**: `services/api/CLAUDE.md`
- **Web Guide**: `apps/web/CLAUDE.md`
- **Project Guide**: `CLAUDE.md`

### Current Hardcoded Values (to Migrate)
- **Person options**: `services/api/app/schemas/person.py` (25+ sets)
- **Gift enum**: `services/api/app/models/gift.py`, `services/api/app/schemas/gift.py`
- **Occasion enum**: `services/api/app/models/occasion.py`, `services/api/app/schemas/occasion.py`
- **List enum**: `services/api/app/models/list.py`, `services/api/app/schemas/list.py`

### Documentation to Create
- **API Docs**: Endpoint signatures, request/response examples, error codes
- **User Guide**: How to add/edit/delete options, what soft-delete means
- **Developer Guide**: How to extend options for new entities

---

## Appendix: Phased Files

This main plan references three detailed phase files:

1. **Phase 1-4: Backend Infrastructure** → `admin-field-options-v1/phase-1-4-backend.md`
   - Database schema & migration
   - Repository CRUD methods
   - Service business logic
   - REST API endpoints

2. **Phase 5-8: Frontend & Validation** → `admin-field-options-v1/phase-5-8-frontend.md`
   - Admin navigation
   - Admin page & components
   - React Query integration
   - Validator refactoring

3. **Phase 9-10: Testing & Documentation** → `admin-field-options-v1/phase-9-10-testing.md`
   - Unit & integration tests
   - E2E test workflows
   - Performance testing
   - Accessibility compliance
   - Documentation (API, user guide, dev guide)

---

**Document Version**: 1.0
**Status**: Ready for Phase 1 Start
**Last Updated**: 2025-12-20
**Progress Tracking**: `.claude/progress/admin-field-options-v1/all-phases-progress.md`
