# Phase 9: Testing & Deployment

**Plan ID**: `IMPL-2025-11-26-FAMILY-DASH-V1`
**Parent Document**: [Family Dashboard V1 Implementation Plan](../family-dashboard-v1-implementation.md)

---

## Overview

Phase 9 completes the project with comprehensive testing, Docker containerization, and Kubernetes deployment to homelab.

| Phase | Duration | Effort | Focus |
|-------|----------|--------|-------|
| **9: Testing & Deployment** | 2-3 days | 7 pts | Unit, integration, E2E tests, Docker, K8s |

**Total Effort**: 7 story points
**Dependencies**: All previous phases complete (Phases 1-8)

---

## Testing Strategy

### Testing Pyramid (Simplified for 2-3 Users)

```
      E2E (10%)
   /            \
  /              \
 /   Integration  \  (30%)
/______(API, WS)___\
________________________
     Unit (60%)
   Services, Utils
```

**Rationale**: With 2-3 family members and known workflows, we prioritize service-layer unit tests for reliability, integration tests for API confidence, and E2E tests for critical user journeys.

### Test Distribution

| Test Type | Coverage | Effort | Focus |
|-----------|----------|--------|-------|
| **Unit** | 60% | 2 pts | Services, utilities, business logic |
| **Integration** | 30% | 1 pt | API endpoints, WebSocket, repository |
| **E2E** | 10% | 1 pt | Use Cases 1-4 from PRD, critical flows |

---

## Phase 9: Testing & Deployment

**Duration**: ~2-3 days
**Effort**: 7 story points
**Dependencies**: All Phases 1-8 complete
**Primary Agent**: `python-backend-engineer`
**Supporting Agents**: `devops-architect`, `code-reviewer`

### Epic: TEST-V1 - Comprehensive Testing & Deployment

| Task ID | Task Name | Description | Acceptance Criteria | Estimate |
|---------|-----------|-------------|-------------------|----------|
| TEST-001 | Backend Unit Tests | Service layer tests (auth, person, occasion, list, gift, etc.) | 60%+ code coverage on services/, mocking repositories | 2 pts |
| TEST-002 | API Integration Tests | Endpoint tests (CRUD, auth, error handling) | All GET/POST/PUT/DELETE endpoints tested, status codes verified | 1 pt |
| TEST-003 | WebSocket Tests | WS connection, subscription, broadcast tests | 2 concurrent clients, event broadcast verified | 1 pt |
| TEST-004 | E2E Tests | User journey tests (UC1-UC4 from PRD) | All 4 use cases implemented as Playwright tests, CI passing | 1 pt |
| DEPLOY-001 | Dockerfiles | API and Web container definitions | Both images build, run successfully, expose correct ports | 0.5 pt |
| DEPLOY-002 | K8s Manifests | Deployment configs, services, configmaps, secrets | All manifests valid, apply to cluster without errors | 1 pt |
| DEPLOY-003 | Health Checks | Liveness and readiness probes | K8s health checks responding, pod restarts on failure | 0.5 pt |

---

## Backend Unit Tests

**Framework**: pytest with pytest-asyncio

### Service Layer Tests

```python
# services/api/tests/unit/services/test_auth_service.py
import pytest
from app.services.auth import AuthService

@pytest.fixture
def auth_service():
    return AuthService(secret_key="test-secret-key")

def test_hash_password(auth_service):
    password = "mypassword123"
    hashed = auth_service.hash_password(password)

    assert hashed != password
    assert auth_service.verify_password(password, hashed)
    assert not auth_service.verify_password("wrong", hashed)

def test_create_access_token(auth_service):
    token = auth_service.create_access_token(user_id=1)
    assert isinstance(token, str)

    user_id = auth_service.decode_token(token)
    assert user_id == 1

def test_decode_invalid_token(auth_service):
    user_id = auth_service.decode_token("invalid.token.here")
    assert user_id is None

@pytest.mark.asyncio
async def test_create_access_token_expiry(auth_service):
    from datetime import timedelta
    token = auth_service.create_access_token(user_id=1, expires_delta=timedelta(seconds=1))

    import time
    time.sleep(2)

    user_id = auth_service.decode_token(token)
    assert user_id is None  # Expired
```

### Service with Repository Mock

```python
# services/api/tests/unit/services/test_person_service.py
import pytest
from unittest.mock import AsyncMock, MagicMock
from app.services.person import PersonService
from app.schemas.person import PersonCreate

@pytest.fixture
def mock_repo():
    return AsyncMock()

@pytest.fixture
def person_service(mock_repo):
    service = PersonService(repo=mock_repo)
    return service

@pytest.mark.asyncio
async def test_create_person(person_service, mock_repo):
    person_data = PersonCreate(
        name="Alice",
        interests=["reading"],
        sizes={"shirt": "M"}
    )

    mock_repo.create.return_value = MagicMock(
        id=1,
        name="Alice",
        interests=["reading"]
    )

    result = await person_service.create(person_data)

    assert result.name == "Alice"
    mock_repo.create.assert_called_once()

@pytest.mark.asyncio
async def test_get_person_with_history(person_service, mock_repo):
    mock_repo.get_with_gift_history.return_value = MagicMock(
        id=1,
        name="Alice",
        gift_history=[...]
    )

    result = await person_service.get_with_history(1)

    assert result.id == 1
    mock_repo.get_with_gift_history.assert_called_once_with(1)
```

### ListItem State Machine Tests

```python
# services/api/tests/unit/services/test_list_item_service.py
import pytest
from app.services.list_item import ListItemService
from app.models.list_item import ListItemStatus

@pytest.mark.asyncio
async def test_valid_status_transition():
    service = ListItemService(repo=AsyncMock())

    # Valid: idea → selected
    assert service.is_valid_transition(ListItemStatus.IDEA, ListItemStatus.SELECTED)

    # Valid: selected → purchased
    assert service.is_valid_transition(ListItemStatus.SELECTED, ListItemStatus.PURCHASED)

    # Valid: purchased → received
    assert service.is_valid_transition(ListItemStatus.PURCHASED, ListItemStatus.RECEIVED)

    # Invalid: idea → received (must go through states)
    assert not service.is_valid_transition(ListItemStatus.IDEA, ListItemStatus.RECEIVED)

    # Invalid: received → idea (no going back)
    assert not service.is_valid_transition(ListItemStatus.RECEIVED, ListItemStatus.IDEA)
```

### Test File Structure

```
services/api/tests/
├── conftest.py                      # Fixtures, database setup
├── unit/
│   ├── services/
│   │   ├── test_auth_service.py
│   │   ├── test_person_service.py
│   │   ├── test_occasion_service.py
│   │   ├── test_list_service.py
│   │   ├── test_gift_service.py
│   │   ├── test_list_item_service.py
│   │   ├── test_comment_service.py
│   │   └── test_dashboard_service.py
│   ├── models/
│   │   └── test_validators.py
│   └── utils/
│       └── test_url_parser.py
├── integration/
│   ├── test_auth_endpoints.py
│   ├── test_person_endpoints.py
│   ├── test_occasion_endpoints.py
│   ├── test_list_endpoints.py
│   ├── test_gift_endpoints.py
│   ├── test_list_item_endpoints.py
│   ├── test_dashboard_endpoint.py
│   ├── test_websocket.py
│   └── test_health_check.py
└── e2e/
    └── (Frontend E2E tests run separately)
```

### Running Backend Tests

```bash
# All tests
cd services/api
uv run pytest

# Unit tests only
uv run pytest tests/unit/

# Integration tests only
uv run pytest tests/integration/

# Specific test
uv run pytest tests/unit/services/test_auth_service.py::test_hash_password

# With coverage
uv run pytest --cov=app tests/

# Watch mode
uv run pytest-watch
```

---

## Integration Tests (API)

**Framework**: pytest with httpx (async HTTP client)

### Full CRUD Test Example

```python
# services/api/tests/integration/test_person_endpoints.py
import pytest
from httpx import AsyncClient
from app.main import app

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

@pytest.fixture
def auth_headers(test_user_token):
    return {"Authorization": f"Bearer {test_user_token}"}

@pytest.mark.asyncio
async def test_create_person(client, auth_headers, db_session):
    response = await client.post(
        "/persons",
        json={"name": "Alice", "interests": ["reading"], "sizes": {}},
        headers=auth_headers
    )

    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Alice"
    assert "id" in data

@pytest.mark.asyncio
async def test_get_person(client, auth_headers, test_person):
    response = await client.get(f"/persons/{test_person.id}", headers=auth_headers)

    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_person.id
    assert data["name"] == test_person.name

@pytest.mark.asyncio
async def test_update_person(client, auth_headers, test_person):
    response = await client.put(
        f"/persons/{test_person.id}",
        json={"name": "Alice Updated"},
        headers=auth_headers
    )

    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice Updated"

@pytest.mark.asyncio
async def test_delete_person(client, auth_headers, test_person):
    response = await client.delete(f"/persons/{test_person.id}", headers=auth_headers)

    assert response.status_code == 204

    # Verify deleted
    response = await client.get(f"/persons/{test_person.id}", headers=auth_headers)
    assert response.status_code == 404

@pytest.mark.asyncio
async def test_unauthorized_request(client):
    response = await client.get("/persons")

    assert response.status_code == 401
    data = response.json()
    assert "error" in data
```

### WebSocket Integration Test

```python
# services/api/tests/integration/test_websocket.py
import pytest
import json
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_websocket_subscription_and_broadcast():
    """Test 2 clients connecting and receiving broadcast events."""

    # Client 1 connects and subscribes
    with client.websocket_connect("/ws?token=test-token") as ws1:
        ws1.send_json({"action": "subscribe", "topic": "list:1"})

        # Client 2 connects and subscribes to same topic
        with client.websocket_connect("/ws?token=test-token") as ws2:
            ws2.send_json({"action": "subscribe", "topic": "list:1"})

            # Simulate backend broadcasting event
            # (In real test, would trigger mutation via HTTP)
            from app.services.ws_manager import manager
            from app.schemas.ws import WSEvent

            event = WSEvent(
                topic="list:1",
                event="STATUS_CHANGED",
                data={"entity_id": "123", "payload": {...}, "user_id": "456"}
            )

            import asyncio
            asyncio.run(manager.broadcast(event))

            # Both clients should receive
            data1 = ws1.receive_json()
            data2 = ws2.receive_json()

            assert data1["topic"] == "list:1"
            assert data2["topic"] == "list:1"
            assert data1["event"] == "STATUS_CHANGED"
```

---

## Frontend E2E Tests

**Framework**: Playwright with TypeScript

### Use Case Tests

```typescript
// apps/web/tests/e2e/use-case-1-capture-idea.spec.ts
import { test, expect } from '@playwright/test';

test.describe('UC1: Capture a Gift Idea', () => {
    test.beforeEach(async ({ page }) => {
        // Login
        await page.goto('http://localhost:3000/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button:has-text("Login")');

        // Wait for dashboard
        await page.waitForURL('**/dashboard');
    });

    test('should add a gift idea from quick-add button', async ({ page }) => {
        // 1. Click quick-add button
        await page.click('button[aria-label="Add Idea"]');

        // 2. Select list
        const listSelect = page.locator('select');
        await listSelect.selectOption('Christmas 2025');

        // 3. Enter gift idea
        await page.fill('input[placeholder="e.g., Blue coffee mug"]', 'Blue coffee mug');

        // 4. Submit
        await page.click('button:has-text("Add")');

        // 5. Verify success
        await expect(page.locator('text=Blue coffee mug')).toBeVisible();
    });

    test('should add idea by navigating to list detail', async ({ page }) => {
        // 1. Navigate to Lists
        await page.click('a:has-text("Lists")');

        // 2. Click on list
        await page.click('a:has-text("Christmas 2025")');

        // 3. Click "Add Idea" in Ideas section
        await page.click('button:has-text("Add Idea")');

        // 4. Fill and submit
        await page.fill('input[name="gift"]', 'Wireless headphones');
        await page.click('button:has-text("Add")');

        // 5. Verify in Ideas section
        const ideasSection = page.locator('text=Ideas').locator('..').locator('..');
        await expect(ideasSection.locator('text=Wireless headphones')).toBeVisible();
    });
});
```

### Use Case 2: Plan Christmas

```typescript
// apps/web/tests/e2e/use-case-2-plan-christmas.spec.ts
import { test, expect } from '@playwright/test';

test.describe('UC2: Plan Christmas', () => {
    test('should create occasion and assign gifts', async ({ page }) => {
        await loginAs(page, 'mom@example.com');

        // 1. Create Christmas 2025 occasion
        await page.click('a:has-text("Occasions")');
        await page.click('button:has-text("New Occasion")');
        await page.fill('input[name="name"]', 'Christmas 2025');
        await page.fill('input[name="date"]', '2025-12-25');
        await page.click('button:has-text("Create")');

        // 2. Create lists for 3 people
        for (const person of ['Alice', 'Bob', 'Charlie']) {
            await page.click('a:has-text("Lists")');
            await page.click('button:has-text("New List")');
            await page.fill('input[name="name"]', `${person}'s gifts`);
            await page.selectOption('select[name="person"]', person);
            await page.selectOption('select[name="occasion"]', 'Christmas 2025');
            await page.click('button:has-text("Create")');
        }

        // 3. Add ideas for each person
        // ... (similar to UC1)

        // 4. Verify on dashboard
        await page.click('a:has-text("Dashboard")');
        await expect(page.locator('text=Christmas 2025')).toBeVisible();
        await expect(page.locator('text=3 people')).toBeVisible();
    });
});
```

### Use Case 3: Real-Time Coordination

```typescript
// apps/web/tests/e2e/use-case-3-coordination.spec.ts
import { test, expect } from '@playwright/test';

test.describe('UC3: Coordinate Gifts (Real-Time)', () => {
    test('should sync status changes across 2 browsers', async ({ browser }) => {
        // Create 2 contexts (simulating 2 users)
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        try {
            // Both login
            await loginAs(page1, 'mom@example.com');
            await loginAs(page2, 'dad@example.com');

            // Both navigate to same list
            const listUrl = 'http://localhost:3000/dashboard/lists/1';
            await page1.goto(listUrl);
            await page2.goto(listUrl);

            // Mom updates item status to "selected"
            await page1.click('button:has-text("Move to Selected")');

            // Dad should see update within 2 seconds (WS broadcast)
            await expect(page2.locator('text=Item moved to Selected')).toBeVisible({
                timeout: 2000
            });

            // Verify status is updated on dad's list
            await expect(page2.locator('[data-status="selected"] >> text=Gift Name')).toBeVisible();
        } finally {
            await page1.close();
            await page2.close();
            await context1.close();
            await context2.close();
        }
    });
});
```

### Use Case 4: Progress View

```typescript
// apps/web/tests/e2e/use-case-4-progress-view.spec.ts
import { test, expect } from '@playwright/test';

test.describe('UC4: View Progress', () => {
    test('should display pipeline progress', async ({ page }) => {
        await loginAs(page, 'mom@example.com');

        // Navigate to Dashboard
        await page.goto('http://localhost:3000/dashboard');

        // Verify pipeline stats visible
        const pipeline = page.locator('[data-testid="pipeline-summary"]');
        await expect(pipeline.locator('text=Ideas')).toBeVisible();
        await expect(pipeline.locator('text=Selected')).toBeVisible();
        await expect(pipeline.locator('text=Purchased')).toBeVisible();
        await expect(pipeline.locator('text=Received')).toBeVisible();

        // Verify numbers are present
        await expect(pipeline.locator('[data-metric="ideas"]')).toContainText(/\d+/);

        // Navigate to Occasion detail
        await page.click('[data-testid="primary-occasion"]');
        await expect(page.locator('[data-metric="person-status"]')).toBeVisible();
    });
});
```

### E2E Test Configuration

```typescript
// apps/web/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
    testDir: './tests/e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,

    use: {
        baseURL: 'http://localhost:3000',
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },

    webServer: {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        reuseExistingServer: !process.env.CI,
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
        {
            name: 'Mobile Chrome',
            use: { ...devices['Pixel 5'] },
        },
    ],
});
```

### Running E2E Tests

```bash
# Install browsers (first time only)
cd apps/web
pnpm exec playwright install

# Run all E2E tests
pnpm exec playwright test

# Run specific test
pnpm exec playwright test use-case-1

# Watch mode
pnpm exec playwright test --watch

# Debug mode
pnpm exec playwright test --debug
```

---

## Docker Configuration

### API Dockerfile

```dockerfile
# services/api/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Copy project files
COPY pyproject.toml pyproject.lock* ./
RUN pip install --no-cache-dir uv && uv pip install -r pyproject.toml

COPY . .

# Run migrations and start app
CMD ["sh", "-c", "uv run alembic upgrade head && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000"]

EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD python -c "import requests; requests.get('http://localhost:8000/health')"
```

### Web Dockerfile

```dockerfile
# apps/web/Dockerfile
FROM node:20-alpine as builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Production image
FROM node:20-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile --prod

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["pnpm", "start"]
```

### Docker Compose (Local Development)

```yaml
# docker-compose.yml
version: '3.9'

services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: family_gifting
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  api:
    build: ./services/api
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres/family_gifting
      JWT_SECRET_KEY: dev-secret-key
      API_PORT: 8000
      CORS_ORIGINS: http://localhost:3000
    ports:
      - "8000:8000"
    depends_on:
      - postgres

  web:
    build: ./apps/web
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:8000
      NEXT_PUBLIC_WS_URL: ws://localhost:8000
    ports:
      - "3000:3000"
    depends_on:
      - api

volumes:
  postgres_data:
```

---

## Kubernetes Deployment

### Namespace

```yaml
# k8s/namespace.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: family-gifting
```

### PostgreSQL StatefulSet

```yaml
# k8s/postgres-statefulset.yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgres
  namespace: family-gifting
spec:
  serviceName: postgres
  replicas: 1
  selector:
    matchLabels:
      app: postgres
  template:
    metadata:
      labels:
        app: postgres
    spec:
      containers:
      - name: postgres
        image: postgres:16
        ports:
        - containerPort: 5432
        env:
        - name: POSTGRES_DB
          value: family_gifting
        - name: POSTGRES_PASSWORD
          valueFrom:
            secretKeyRef:
              name: postgres-secret
              key: password
        volumeMounts:
        - name: postgres-storage
          mountPath: /var/lib/postgresql/data
        livenessProbe:
          exec:
            command: ["pg_isready", "-U", "postgres"]
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          exec:
            command: ["pg_isready", "-U", "postgres"]
          initialDelaySeconds: 5
          periodSeconds: 10

  volumeClaimTemplates:
  - metadata:
      name: postgres-storage
    spec:
      accessModes: [ "ReadWriteOnce" ]
      resources:
        requests:
          storage: 10Gi
---
apiVersion: v1
kind: Service
metadata:
  name: postgres
  namespace: family-gifting
spec:
  clusterIP: None
  ports:
  - port: 5432
  selector:
    app: postgres
```

### API Deployment

```yaml
# k8s/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: family-gifting
spec:
  replicas: 2
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: gifting-api:latest
        imagePullPolicy: Never  # For homelab
        ports:
        - containerPort: 8000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: api-secret
              key: database-url
        - name: JWT_SECRET_KEY
          valueFrom:
            secretKeyRef:
              name: api-secret
              key: jwt-secret
        - name: CORS_ORIGINS
          valueFrom:
            configMapKeyRef:
              name: api-config
              key: cors-origins
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: family-gifting
spec:
  selector:
    app: api
  ports:
  - protocol: TCP
    port: 8000
    targetPort: 8000
  type: LoadBalancer
```

### Web Deployment

```yaml
# k8s/web-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
  namespace: family-gifting
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web
  template:
    metadata:
      labels:
        app: web
    spec:
      containers:
      - name: web
        image: gifting-web:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          valueFrom:
            configMapKeyRef:
              name: web-config
              key: api-url
        - name: NEXT_PUBLIC_WS_URL
          valueFrom:
            configMapKeyRef:
              name: web-config
              key: ws-url
        livenessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "128Mi"
            cpu: "50m"
          limits:
            memory: "256Mi"
            cpu: "200m"
---
apiVersion: v1
kind: Service
metadata:
  name: web
  namespace: family-gifting
spec:
  selector:
    app: web
  ports:
  - protocol: TCP
    port: 80
    targetPort: 3000
  type: LoadBalancer
```

### ConfigMaps & Secrets

```yaml
# k8s/configmap.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: api-config
  namespace: family-gifting
data:
  cors-origins: "http://localhost:3000,https://gifting.homelab.local"
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: web-config
  namespace: family-gifting
data:
  api-url: "http://api:8000"
  ws-url: "ws://api:8000"
```

```yaml
# k8s/secrets.yaml (CREATE FROM ENV VARIABLES)
apiVersion: v1
kind: Secret
metadata:
  name: api-secret
  namespace: family-gifting
type: Opaque
stringData:
  database-url: postgresql://postgres:PASSWORD@postgres:5432/family_gifting
  jwt-secret: YOUR_JWT_SECRET_HERE
---
apiVersion: v1
kind: Secret
metadata:
  name: postgres-secret
  namespace: family-gifting
type: Opaque
stringData:
  password: YOUR_POSTGRES_PASSWORD
```

### Deployment Commands

```bash
# Create namespace
kubectl create namespace family-gifting

# Create secrets (update with real values first)
kubectl apply -f k8s/secrets.yaml

# Create configmaps
kubectl apply -f k8s/configmap.yaml

# Deploy PostgreSQL
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl wait --for=condition=ready pod -l app=postgres -n family-gifting --timeout=300s

# Build and load images (for local k8s)
docker build -t gifting-api:latest ./services/api
docker build -t gifting-web:latest ./apps/web
kind load docker-image gifting-api:latest
kind load docker-image gifting-web:latest

# Deploy API and Web
kubectl apply -f k8s/api-deployment.yaml
kubectl apply -f k8s/web-deployment.yaml

# Verify deployments
kubectl get all -n family-gifting
kubectl logs -f deployment/api -n family-gifting
kubectl logs -f deployment/web -n family-gifting

# Port forward for testing
kubectl port-forward svc/api 8000:8000 -n family-gifting
kubectl port-forward svc/web 3000:3000 -n family-gifting
```

---

## Health Checks

### API Health Endpoint

```python
# services/api/app/api/health.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        # Check database connection
        await db.execute(select(1))

        return {
            "status": "healthy",
            "db": "connected",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "db": "disconnected",
            "error": str(e)
        }
```

### Kubernetes Probes

**Liveness Probe**: Restarts container if unhealthy (30s initial delay, 10s interval)
**Readiness Probe**: Removes from load balancer if unhealthy (10s initial delay, 5s interval)

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 30
  periodSeconds: 10
  timeoutSeconds: 5
  failureThreshold: 3

readinessProbe:
  httpGet:
    path: /health
    port: 8000
  initialDelaySeconds: 10
  periodSeconds: 5
  timeoutSeconds: 3
  failureThreshold: 2
```

---

## Phase 9 Quality Gates

- [ ] All backend unit tests pass (`uv run pytest`)
- [ ] Backend test coverage 60%+ on services
- [ ] All API integration tests pass
- [ ] WebSocket integration test passes (2 concurrent clients)
- [ ] All E2E tests pass (UC1-UC4)
- [ ] API Docker image builds and runs
- [ ] Web Docker image builds and runs
- [ ] All K8s manifests valid (kubectl apply --dry-run)
- [ ] K8s deployment successful in homelab
- [ ] Health checks responding correctly
- [ ] Both services accessible via LoadBalancer IPs
- [ ] WebSocket connection working across network
- [ ] Database persists data between pod restarts

---

## Pre-Deployment Checklist

- [ ] Environment variables configured (all .env files have real values)
- [ ] Database backups configured
- [ ] Secrets stored securely (not in git)
- [ ] API and Web accessible externally
- [ ] DNS configured (if needed)
- [ ] HTTPS/SSL configured (or planned)
- [ ] Monitoring/logging configured (or planned)
- [ ] Ingress configured (optional for homelab)

---

## Phase 9 Summary

| Metric | Value |
|--------|-------|
| **Total Effort** | 7 story points |
| **Duration** | 2-3 days |
| **Test Files** | 20+ test files |
| **Test Cases** | 100+ test cases |
| **Unit Test Coverage** | 60%+ services |
| **E2E Scenarios** | 4 use cases |
| **K8s Resources** | 8+ manifests |

### Success Criteria

- All tests passing
- Docker images building successfully
- K8s deployment fully functional
- Application accessible in homelab
- Health checks responsive
- Ready for production use

---

**Phase File Version**: 1.0
**Last Updated**: 2025-11-26
