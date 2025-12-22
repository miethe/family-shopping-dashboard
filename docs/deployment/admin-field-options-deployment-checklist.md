---
title: "Admin Field Options Deployment Checklist"
description: "Production deployment preparation checklist for admin field options feature"
audience: [devops, developers, qa, project-managers]
tags: [deployment, checklist, production, admin, field-options]
created: 2025-12-22
updated: 2025-12-22
category: deployment
status: active
related:
  - "docs/project_plans/implementation_plans/features/admin-field-options-v1.md"
  - "docs/api/field-options-api.md"
  - "docs/guides/admin-field-options-user-guide.md"
---

# Admin Field Options Deployment Checklist

## Feature Overview

**Feature Name**: Admin Field Options Management
**Feature Code**: ADMIN-v1
**Complexity**: Large (65 story points)
**Deployment Type**: Full-stack (Backend + Frontend + Database)

**Description**:
This feature enables administrators to dynamically manage dropdown/select field options (wine types, gift priorities, occasion types, etc.) through a web UI instead of hardcoded values in Python. The system migrates ~100+ hardcoded option sets to a database-driven architecture with admin CRUD operations.

**Key Deliverables**:
- `field_options` database table with migration and seeding
- Backend API endpoints (GET, POST, PUT, DELETE) at `/api/field-options`
- Admin page with tab-based UI for managing options across 4 entities (Person, Gift, Occasion, List)
- React Query integration for real-time cache updates
- Backward-compatible validators that query database instead of hardcoded sets
- Comprehensive test coverage (273 total tests, 179 passing currently)

**Success Criteria**:
- Admin can add/edit/delete options in <1 minute (vs 2 days via code)
- Options available to users within 5 seconds (React Query cache)
- Zero data loss for in-use options (soft-delete enforcement)
- API response times: p95 <200ms
- WCAG 2.1 AA accessibility compliance

---

## Pre-Deployment Checklist

### Code Quality

#### Backend Tests
- [ ] **All unit tests passing** (Target: 273 tests, Current: 179 passing, 94 failing)
  ```bash
  cd services/api
  uv run pytest -v --tb=short
  ```
  **Status**: Some failures in list_item_service and occasion_service (unrelated to field options)
  **Action Required**: Fix failing tests or verify they are not blockers

- [ ] **Field options tests specifically passing**
  ```bash
  cd services/api
  uv run pytest tests/unit/repositories/test_field_option_repository.py -v
  uv run pytest tests/unit/services/test_field_option_service.py -v
  uv run pytest tests/integration/test_field_option_endpoints.py -v
  uv run pytest tests/integration/test_field_options_migration.py -v
  ```
  **Expected**: 39+ tests passing (repo: 15, service: 12, integration: 12)

- [ ] **Type checking passes (Backend)**
  ```bash
  cd services/api
  uv run mypy app --strict
  ```
  **Expected**: 0 errors related to field options code

- [ ] **Linting passes (Backend)**
  ```bash
  cd services/api
  uv run ruff check app/
  ```
  **Expected**: 0 errors, <5 warnings acceptable

#### Frontend Tests
- [ ] **Component tests passing**
  ```bash
  cd apps/web
  pnpm test components/admin
  ```
  **Expected**: All admin component tests pass

- [ ] **E2E tests passing**
  ```bash
  cd apps/web
  pnpm test:e2e --grep "admin-field-options"
  ```
  **Expected**: All 6+ admin workflow scenarios pass

- [ ] **Type checking passes (Frontend)**
  ```bash
  cd apps/web
  pnpm typecheck
  ```
  **Expected**: 0 TypeScript errors

- [ ] **Linting passes (Frontend)**
  ```bash
  cd apps/web
  pnpm lint
  ```
  **Expected**: 0 errors

- [ ] **Build succeeds**
  ```bash
  cd apps/web
  pnpm build
  ```
  **Expected**: Build completes, bundle size <500KB for admin pages

#### Security
- [ ] **No security vulnerabilities**
  ```bash
  # Backend
  cd services/api
  uv run pip-audit

  # Frontend
  cd apps/web
  pnpm audit --audit-level=moderate
  ```
  **Expected**: 0 high/critical vulnerabilities

- [ ] **SQL injection prevention verified**
  - All queries use SQLAlchemy ORM or parameterized queries
  - No string concatenation in repository layer
  - Verified in: `app/repositories/field_option.py`

- [ ] **Authentication enforcement verified**
  - All field-options endpoints require JWT
  - Tested: GET, POST, PUT, DELETE return 401 without auth

- [ ] **Permission checks in place** (future-ready)
  - Boilerplate added for admin role check (currently all authenticated users)
  - TODO: Implement `is_admin` flag enforcement when user roles added

---

### Database

#### Migration Verification
- [ ] **Migration files reviewed**
  ```bash
  ls -la services/api/alembic/versions/ | grep field_option
  ```
  **Expected Files**:
  - `3905b0fc62cd_create_field_options_table.py`
  - `df8e08cce5fd_seed_field_options_with_existing_values.py`

- [ ] **Migration tested on staging database**
  ```bash
  cd services/api
  # Test forward migration
  uv run alembic upgrade head

  # Verify table created
  psql $DATABASE_URL -c "\d field_options"

  # Test rollback
  uv run alembic downgrade -1
  uv run alembic upgrade head
  ```
  **Expected**:
  - Table created with all columns (12 total)
  - Indexes created: `idx_field_options_entity_field`
  - Unique constraint: `(entity, field_name, value)`
  - Foreign keys: `created_by`, `updated_by` → `user.id`

- [ ] **Seeding data verified**
  ```bash
  psql $DATABASE_URL -c "SELECT entity, COUNT(*) FROM field_options WHERE is_system=true GROUP BY entity;"
  ```
  **Expected Output**:
  ```
  entity   | count
  ---------+-------
  person   |    80+
  gift     |     8
  occasion |     6
  list     |     4
  ```

- [ ] **Rollback procedure documented** (see below)

- [ ] **Database backup scheduled**
  ```bash
  # Manual backup before deployment
  pg_dump $DATABASE_URL > backups/pre_field_options_$(date +%Y%m%d_%H%M%S).sql
  ```
  **Backup Location**: `backups/` directory
  **Retention**: Keep for 30 days

---

### API

#### Endpoint Verification
- [ ] **All endpoints documented**
  - File: `docs/api/field-options-api.md`
  - Endpoints: GET, POST, PUT, DELETE
  - Request/response examples included
  - Error codes documented

- [ ] **OpenAPI spec generated**
  ```bash
  cd services/api
  # FastAPI auto-generates at /docs and /redoc
  curl http://localhost:8000/openapi.json > docs/api/field-options-openapi.json
  ```

- [ ] **Error handling verified**
  - 400: Validation errors (invalid entity, missing fields)
  - 401: Unauthorized (missing/invalid token)
  - 404: Option not found
  - 409: Duplicate option (entity+field+value conflict)
  - 500: Internal errors (with trace_id)

- [ ] **Rate limiting configured** (if applicable)
  - Current: No rate limiting (2-3 user single-tenant app)
  - Future: 60 requests/min per user for admin endpoints

---

### Frontend

#### Build Verification
- [ ] **Build succeeds**
  ```bash
  cd apps/web
  pnpm build
  ```
  **Expected**: `.next/` directory created, no build errors

- [ ] **Bundle size acceptable**
  ```bash
  cd apps/web
  pnpm build
  # Check bundle size
  du -sh .next/static/chunks/
  ```
  **Target**: Admin page chunks <500KB, total bundle <5MB

- [ ] **Accessibility audit passed**
  ```bash
  cd apps/web
  pnpm test:a11y admin
  ```
  **Expected**: 0 critical/major accessibility violations
  **Standard**: WCAG 2.1 AA compliance

- [ ] **Mobile responsiveness verified**
  - Test on viewport widths: 375px (mobile), 768px (tablet), 1024px (desktop)
  - Touch targets ≥44x44px
  - Safe area insets respected (iOS notch)

#### Cache Strategy Verified
- [ ] **React Query configuration correct**
  ```typescript
  // Verify in apps/web/hooks/useFieldOptions.ts
  queryKey: ["field-options", entity, field_name]
  staleTime: 5 * 60 * 1000  // 5 minutes
  refetchOnWindowFocus: true
  ```

- [ ] **Cache invalidation tested**
  - After POST: Query invalidated, list refetches
  - After PUT: Single option + list invalidated
  - After DELETE: All field-options queries invalidated
  - Verified in E2E tests

---

### Documentation

- [ ] **API documentation complete**
  - File: `docs/api/field-options-api.md` ✓
  - Postman collection: `docs/api/field-options.postman_collection.json` ✓

- [ ] **User guide complete**
  - File: `docs/guides/admin-field-options-user-guide.md` ✓
  - Covers: Add, Edit, Delete operations
  - Includes: FAQ, Troubleshooting, Best Practices

- [ ] **Developer guide complete**
  - File: `docs/guides/developers/field-options-extension-guide.md` ✓
  - Covers: How to extend to new entities
  - Includes: Code examples, Testing strategy

- [ ] **CHANGELOG updated**
  ```bash
  # Add to CHANGELOG.md
  ## [Unreleased]
  ### Added
  - Admin page for managing field options (wine types, priorities, etc.)
  - Database-driven field options system replacing hardcoded values
  - REST API for field options CRUD operations
  - Soft-delete support for in-use options
  - React Query integration for real-time option updates
  ```

---

## Deployment Steps

### Pre-Flight Checks
- [ ] **All pre-deployment checklist items complete**
- [ ] **Staging deployment successful and tested**
- [ ] **Team notified of deployment window**
- [ ] **Rollback plan reviewed and ready**
- [ ] **Monitoring dashboards open** (if available)

---

### Step 1: Backup Database

**Critical**: Always backup before schema changes

```bash
# Set database URL (use production credentials)
export DATABASE_URL="postgresql+psycopg://user:pass@host:5432/family_gifting"

# Create timestamped backup
BACKUP_FILE="backups/pre_field_options_$(date +%Y%m%d_%H%M%S).sql"
pg_dump $DATABASE_URL > $BACKUP_FILE

# Verify backup
ls -lh $BACKUP_FILE
# Expected: File size >1MB (depends on data volume)

# Test backup integrity
pg_restore --list $BACKUP_FILE | head -20
```

**Rollback**: Keep backup for 30 days minimum

---

### Step 2: Deploy Backend (API)

#### Docker Compose Deployment (Staging/Dev)

```bash
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard

# Pull latest code
git pull origin main

# Verify we're on correct commit
git log -1 --oneline
# Expected: Shows field options commit (7b42cac or later)

# Stop services
docker-compose down

# Run migrations
cd services/api
uv run alembic upgrade head

# Verify migration success
psql $DATABASE_URL -c "SELECT COUNT(*) FROM field_options WHERE is_system=true;"
# Expected: ~100+ system options

# Build and start API
cd ../..
docker-compose build api
docker-compose up -d api

# Wait for health check
sleep 10
curl http://localhost:8030/health
# Expected: {"status": "healthy", "db": "connected"}

# Test field-options endpoint
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:8030/api/field-options?entity=person&field_name=wine_types"
# Expected: JSON array with wine type options
```

#### Kubernetes Deployment (Production Homelab)

```bash
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard

# Build Docker image
cd services/api
docker build -t gifting-api:field-options .

# Tag for production
docker tag gifting-api:field-options gifting-api:latest

# Load image into k8s (for homelab with local images)
# (Skip if using registry)
kind load docker-image gifting-api:latest --name your-cluster

# Apply migrations via one-time job
kubectl create job field-options-migration \
  --from=cronjob/api-migration \
  --namespace=family-gifting \
  -- alembic upgrade head

# Wait for job completion
kubectl wait --for=condition=complete job/field-options-migration \
  --namespace=family-gifting --timeout=5m

# Verify migration
kubectl logs job/field-options-migration --namespace=family-gifting
# Expected: "Running upgrade ... -> 3905b0fc62cd, create field options table"

# Update deployment
kubectl set image deployment/api \
  api=gifting-api:latest \
  --namespace=family-gifting

# Wait for rollout
kubectl rollout status deployment/api --namespace=family-gifting

# Verify pods are ready
kubectl get pods -l app=api --namespace=family-gifting
# Expected: 2/2 pods Running and Ready

# Check health
kubectl exec -it deployment/api --namespace=family-gifting -- \
  curl http://localhost:8000/health
# Expected: {"status": "healthy", "db": "connected"}
```

**Verification**:
- [ ] API pods running (2 replicas)
- [ ] Health endpoint returns 200
- [ ] Database migrations applied
- [ ] No error logs in past 5 minutes

---

### Step 3: Deploy Frontend (Web)

#### Docker Compose Deployment

```bash
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard

# Build frontend with production env vars
cd apps/web
export NEXT_PUBLIC_API_URL="http://localhost:8030"
export NEXT_PUBLIC_WS_URL="ws://localhost:8030"

# Build
pnpm install
pnpm build

# Return to root and rebuild web container
cd ../..
docker-compose build web
docker-compose up -d web

# Wait for service
sleep 15
curl http://localhost:3030/
# Expected: HTML response from Next.js
```

#### Kubernetes Deployment

```bash
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard

# Build frontend
cd apps/web
docker build -t gifting-web:field-options \
  --build-arg NEXT_PUBLIC_API_URL=$PROD_API_URL \
  --build-arg NEXT_PUBLIC_WS_URL=$PROD_WS_URL \
  .

# Tag for production
docker tag gifting-web:field-options gifting-web:latest

# Load into k8s
kind load docker-image gifting-web:latest --name your-cluster

# Update deployment
kubectl set image deployment/web \
  web=gifting-web:latest \
  --namespace=family-gifting

# Wait for rollout
kubectl rollout status deployment/web --namespace=family-gifting

# Verify pods
kubectl get pods -l app=web --namespace=family-gifting
# Expected: 2/2 pods Running

# Check frontend loads
kubectl port-forward svc/web 3000:3000 --namespace=family-gifting &
curl http://localhost:3000/
# Expected: HTML response
```

**Verification**:
- [ ] Web pods running (2 replicas)
- [ ] Homepage loads
- [ ] No console errors in browser DevTools
- [ ] Admin page accessible at `/admin`

---

### Step 4: Smoke Tests

Run these tests immediately after deployment to verify core functionality.

#### Backend Smoke Tests

```bash
# Set auth token (replace with real token from login)
export JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# 1. Health check
curl http://localhost:8030/health
# Expected: {"status": "healthy", "db": "connected"}

# 2. List options (GET)
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:8030/api/field-options?entity=person&field_name=wine_types"
# Expected: JSON array with ≥8 options

# 3. Create option (POST)
curl -X POST http://localhost:8030/api/field-options \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "entity": "person",
    "field_name": "wine_types",
    "value": "sake_test",
    "display_label": "Sake (Test)",
    "display_order": 99
  }'
# Expected: 201 Created with option object

# 4. Update option (PUT)
OPTION_ID=<id from step 3>
curl -X PUT http://localhost:8030/api/field-options/$OPTION_ID \
  -H "Authorization: Bearer $JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "display_label": "Sake (Smoke Test)",
    "display_order": 100
  }'
# Expected: 200 OK with updated option

# 5. Delete option (DELETE)
curl -X DELETE http://localhost:8030/api/field-options/$OPTION_ID \
  -H "Authorization: Bearer $JWT_TOKEN"
# Expected: 200 OK with success message
```

#### Frontend Smoke Tests

**Manual UI Testing**:

1. **Admin Page Loads**
   - Navigate to `/admin`
   - Expected: Page loads in <1 second
   - Expected: See tabs for Person, Gift, Occasion, List

2. **List Options Loads**
   - Click "Person" tab
   - Expand "Wine Types" field
   - Expected: See list of wine options (≥8 items)
   - Expected: Each option has Edit and Delete buttons

3. **Create Option Works**
   - Click "+ Add Option" button in Wine Types
   - Fill form:
     - Value: `smoke_test`
     - Label: `Smoke Test Option`
   - Click "Create Option"
   - Expected: Modal closes
   - Expected: New option appears in list within 5 seconds

4. **Edit Option Works**
   - Find "Smoke Test Option" in list
   - Click Edit (pencil icon)
   - Change label to "Smoke Test (Modified)"
   - Click "Update"
   - Expected: Modal closes
   - Expected: Updated label visible immediately

5. **Delete Option Works**
   - Find "Smoke Test (Modified)" option
   - Click Delete (trash icon)
   - Confirm deletion
   - Expected: Modal closes
   - Expected: Option removed from list within 2 seconds

6. **Option Appears in Dropdown**
   - Create a test option "UI Test Wine"
   - Navigate to Create Person form (`/people/new`)
   - Open "Wine Types" dropdown
   - Expected: "UI Test Wine" appears in list
   - Clean up: Delete test option from Admin page

**Checklist**:
- [ ] Admin page loads without errors
- [ ] List options endpoint works
- [ ] Create option works and appears in list
- [ ] Edit option works and updates immediately
- [ ] Delete option works and removes from list
- [ ] Options appear in form dropdowns
- [ ] No console errors in browser DevTools

---

## Rollback Procedure

Use this procedure if critical issues are discovered post-deployment.

### When to Rollback

Trigger rollback if:
- Database migration corrupted data
- API endpoints returning >10% error rate
- Admin page completely broken (white screen, unable to load)
- Security vulnerability discovered
- Data loss detected

**Do NOT rollback for**:
- Minor UI bugs (fix forward)
- Single user-reported issue (investigate first)
- Performance slightly below target (monitor, optimize)

---

### If Backend Issues

#### Docker Compose Rollback

```bash
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard

# Stop current API
docker-compose stop api

# Rollback database migration
cd services/api
uv run alembic downgrade -2
# This downgrades: seeding migration, then table creation

# Verify rollback
psql $DATABASE_URL -c "\dt field_options"
# Expected: "Did not find any relation named 'field_options'"

# Restore from backup (if needed)
BACKUP_FILE="backups/pre_field_options_YYYYMMDD_HHMMSS.sql"
psql $DATABASE_URL < $BACKUP_FILE

# Checkout previous commit
git log --oneline | head -5
# Find commit before field options
git checkout <previous_commit_hash>

# Rebuild API
docker-compose build api
docker-compose up -d api

# Verify health
curl http://localhost:8030/health
```

#### Kubernetes Rollback

```bash
# Rollback API deployment to previous version
kubectl rollout undo deployment/api --namespace=family-gifting

# Wait for rollout
kubectl rollout status deployment/api --namespace=family-gifting

# Verify pods are healthy
kubectl get pods -l app=api --namespace=family-gifting

# Rollback database (if needed)
kubectl exec -it deployment/api --namespace=family-gifting -- \
  alembic downgrade -2

# Or restore from backup
kubectl exec -it statefulset/postgres --namespace=family-gifting -- \
  psql -U postgres -d family_gifting < /backups/pre_field_options_*.sql
```

---

### If Frontend Issues

#### Docker Compose Rollback

```bash
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard

# Stop current web
docker-compose stop web

# Checkout previous commit
git checkout <previous_commit_hash>

# Rebuild web
docker-compose build web
docker-compose up -d web

# Verify
curl http://localhost:3030/
```

#### Kubernetes Rollback

```bash
# Rollback web deployment
kubectl rollout undo deployment/web --namespace=family-gifting

# Wait for rollout
kubectl rollout status deployment/web --namespace=family-gifting

# Verify
kubectl get pods -l app=web --namespace=family-gifting
```

---

### If Database Issues

**Critical**: Only use if data corruption detected

```bash
# Stop all services to prevent writes
docker-compose down
# OR
kubectl scale deployment/api --replicas=0 --namespace=family-gifting

# Restore from backup
export DATABASE_URL="postgresql+psycopg://user:pass@host:5432/family_gifting"
BACKUP_FILE="backups/pre_field_options_YYYYMMDD_HHMMSS.sql"

# Drop and recreate database (CAREFUL!)
psql $DATABASE_URL -c "DROP DATABASE IF EXISTS family_gifting;"
psql $DATABASE_URL -c "CREATE DATABASE family_gifting;"

# Restore
psql $DATABASE_URL < $BACKUP_FILE

# Verify restore
psql $DATABASE_URL -c "SELECT COUNT(*) FROM person;"
# Should match pre-deployment count

# Restart services
docker-compose up -d
# OR
kubectl scale deployment/api --replicas=2 --namespace=family-gifting
```

---

## Post-Deployment Monitoring

Monitor these metrics for 24-72 hours after deployment.

### Metrics to Watch

#### API Metrics

**Error Rate**:
```bash
# Check API logs for errors
docker-compose logs api | grep ERROR
# OR
kubectl logs deployment/api --namespace=family-gifting | grep ERROR

# Target: <1% error rate
```

**Response Times**:
```bash
# Sample API response time
for i in {1..10}; do
  curl -o /dev/null -s -w "%{time_total}\n" \
    -H "Authorization: Bearer $JWT_TOKEN" \
    "http://localhost:8030/api/field-options?entity=person&field_name=wine_types"
done | awk '{sum+=$1; count++} END {print "Avg:", sum/count, "sec"}'

# Target: p95 <0.2 seconds (200ms)
```

**Database Query Performance**:
```sql
-- Check slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
WHERE query LIKE '%field_options%'
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Target: mean_exec_time <50ms
```

#### Frontend Metrics

**Page Load Times**:
- Admin page: <1 second (Lighthouse)
- Form dropdowns: <100ms to populate

**Console Errors**:
```javascript
// Open browser DevTools → Console
// Expected: 0 errors related to field options
```

**Cache Performance**:
- After creating option: List updates within 5 seconds
- After editing option: Change visible immediately
- After deleting option: Removed from UI within 2 seconds

#### User-Reported Issues

**Monitor**:
- User complaints about admin page not loading
- Reports of missing options in dropdowns
- Errors when creating/editing/deleting options
- Performance complaints (slow page loads)

**Response Plan**:
- Critical issues (data loss, page broken): Rollback immediately
- Major issues (some features broken): Hotfix within 4 hours
- Minor issues (UI glitches): Fix forward in next release

---

### Alerts to Configure

If monitoring tools available (Prometheus, Grafana, etc.):

**API Alerts**:
- [ ] API 5xx error rate >0.1% → page DevOps
- [ ] Response time p95 >200ms → alert team
- [ ] Database connection errors >0 → page DevOps

**Frontend Alerts**:
- [ ] JavaScript error rate >1% → alert frontend team
- [ ] Admin page load time >2s → investigate

**Database Alerts**:
- [ ] Disk space <10% remaining → alert DevOps
- [ ] Connection pool exhausted → page DevOps
- [ ] Slow queries >1s → investigate

---

## Sign-off

Deployment completed by following this checklist. All stakeholders confirm feature is ready for production.

| Role | Name | Date | Signature |
|------|------|------|-----------|
| **Backend Developer** | _______________ | ________ | _______________ |
| **Frontend Developer** | _______________ | ________ | _______________ |
| **QA Engineer** | _______________ | ________ | _______________ |
| **DevOps Engineer** | _______________ | ________ | _______________ |
| **Project Manager** | _______________ | ________ | _______________ |

---

## Related Documentation

### Implementation & Planning
- **Implementation Plan**: `docs/project_plans/implementation_plans/features/admin-field-options-v1.md`
- **PRD**: `docs/project_plans/PRDs/features/admin-field-options-v1.md`
- **Phase 9-10 Plan**: `docs/project_plans/implementation_plans/features/admin-field-options-v1/phase-9-10-testing.md`

### Technical Documentation
- **API Reference**: `docs/api/field-options-api.md`
- **Postman Collection**: `docs/api/field-options.postman_collection.json`

### User Documentation
- **Admin User Guide**: `docs/guides/admin-field-options-user-guide.md`
- **Developer Extension Guide**: `docs/guides/developers/field-options-extension-guide.md`

### Architecture
- **Backend Patterns**: `services/api/CLAUDE.md`
- **Frontend Patterns**: `apps/web/CLAUDE.md`
- **Project Guide**: `CLAUDE.md`

---

## Post-Deployment Tasks

After successful deployment and 72-hour monitoring period:

- [ ] **Update Feature Status**
  - Mark feature as "deployed" in project tracking
  - Update implementation plan status to "complete"

- [ ] **Archive Deployment Artifacts**
  - Store database backup in long-term storage (30+ days)
  - Archive deployment logs
  - Save smoke test results

- [ ] **Team Retrospective**
  - Schedule meeting within 1 week
  - Discuss: What went well, what could improve
  - Document lessons learned

- [ ] **User Training** (if needed)
  - Walk family members through admin page
  - Demonstrate add/edit/delete operations
  - Share user guide link

- [ ] **Monitor Usage**
  - Track admin page visits in first week
  - Monitor option creation/edits
  - Collect user feedback

- [ ] **Plan Future Enhancements**
  - Review feature requests from users
  - Consider: Bulk operations, import/export, usage analytics
  - Prioritize next iteration

---

## Troubleshooting Common Issues

### Issue: Migration Fails

**Symptoms**: `alembic upgrade head` returns error

**Diagnosis**:
```bash
# Check current migration state
cd services/api
uv run alembic current

# Check migration history
uv run alembic history
```

**Resolution**:
1. Check database connection: `psql $DATABASE_URL -c "SELECT 1;"`
2. Look for conflicting migrations: `uv run alembic heads` (should show 1 head)
3. If multiple heads, merge: `uv run alembic merge heads -m "merge"`
4. Try again: `uv run alembic upgrade head`

---

### Issue: Admin Page 404

**Symptoms**: Navigating to `/admin` returns 404

**Diagnosis**:
```bash
# Check if route exists
cd apps/web
grep -r "admin" app/*/page.tsx

# Check build output
ls -la .next/server/app/admin/
```

**Resolution**:
1. Ensure `apps/web/app/admin/page.tsx` exists
2. Rebuild: `pnpm build`
3. Restart web container: `docker-compose restart web`

---

### Issue: Options Not Appearing in Dropdown

**Symptoms**: Admin page shows options, but forms don't

**Diagnosis**:
```bash
# Check API returns options
curl -H "Authorization: Bearer $JWT_TOKEN" \
  "http://localhost:8030/api/field-options?entity=person&field_name=wine_types"

# Check browser DevTools Network tab
# Look for failed requests to /api/field-options
```

**Resolution**:
1. Clear browser cache: Hard reload (Cmd+Shift+R)
2. Check React Query is refetching: DevTools → React Query tab
3. Verify validator is calling field options repo (not hardcoded set)
4. Check form is using correct query key: `["field-options", entity, field_name]`

---

### Issue: Slow API Response (>200ms)

**Symptoms**: Admin page slow to load options

**Diagnosis**:
```sql
-- Check for missing index
EXPLAIN ANALYZE
SELECT * FROM field_options
WHERE entity='person' AND field_name='wine_types' AND is_active=true;

-- Should use index: idx_field_options_entity_field
```

**Resolution**:
1. Verify index exists: `\di idx_field_options_entity_field`
2. If missing, create:
   ```sql
   CREATE INDEX idx_field_options_entity_field
   ON field_options(entity, field_name, is_active);
   ```
3. Analyze table: `ANALYZE field_options;`
4. Restart API to clear cache

---

## Success Metrics Dashboard

Track these KPIs post-deployment:

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| API Error Rate | <0.1% | ___% | ⬜ |
| API p95 Response Time | <200ms | ___ms | ⬜ |
| Admin Page Load Time | <1s | ___s | ⬜ |
| Option Add Time | <1min | ___min | ⬜ |
| Cache Update Time | <5s | ___s | ⬜ |
| Test Pass Rate | 100% | ___% | ⬜ |
| WCAG 2.1 AA Compliance | 100% | ___% | ⬜ |
| User-Reported Bugs | 0 critical | ___ | ⬜ |
| Deployment Downtime | <5min | ___min | ⬜ |

**Legend**: ✅ Met | ⚠️ Close | ❌ Failed | ⬜ Not Yet Measured

---

**Document Version**: 1.0
**Last Updated**: 2025-12-22
**Status**: Ready for Deployment
**Next Review**: Post-deployment (72 hours after)
