---
title: "Phase 3-4: API Layer & Frontend Hooks"
description: "Service/API implementation and React Query hooks for person-occasion budgets"
audience: [developers, backend-engineers, frontend-engineers]
tags: [implementation, api, frontend, hooks, react-query, person-budgets]
created: 2025-12-07
updated: 2025-12-07
category: "product-planning"
status: active
---

# Phase 3-4: Service & API Layer + Frontend Hooks & Data Layer

**Parent Plan**: [Person Budget per Occasion Implementation](../person-occasion-budgets-v1.md)

**Combined Duration**: 2.5 days
**Dependencies**: Phase 2 (repository layer) complete
**Assigned Subagent(s)**: `python-backend-engineer`, `backend-architect`, `ui-engineer-enhanced`, `frontend-developer`
**Related PRD Stories**: POB-003, POB-004, POB-005

---

## Overview

This phase implements the API layer and frontend data integration:

1. **Phase 3** creates DTOs, service methods, API endpoints, and integration tests
2. **Phase 4** creates TypeScript types, API client methods, and React Query hooks

Phase 3 can proceed independently. Phase 4 begins once Phase 3 API endpoints are testable (mock data acceptable).

---

## Phase 3: Service & API Layer (1.5 days, 14 story points)

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| SVC-001 | Budget DTOs | Create PersonOccasionBudgetResponse, PersonOccasionBudgetUpdate schemas | DTOs validate correctly; include progress calculations | 2 pts | python-backend-engineer | Phase 2 |
| SVC-002 | Budget Service Methods | Implement get_occasion_budget(), set_occasion_budget() | Methods return DTOs; ORM→DTO transformation correct | 3 pts | python-backend-engineer | SVC-001 |
| API-001 | GET Budget Endpoint | Create GET /persons/{id}/occasions/{oid}/budget | Endpoint returns 200 with PersonOccasionBudgetResponse | 2 pts | python-backend-engineer | SVC-002 |
| API-002 | PUT Budget Endpoint | Create PUT /persons/{id}/occasions/{oid}/budget | Endpoint accepts PersonOccasionBudgetUpdate; returns 200 | 2 pts | python-backend-engineer | API-001 |
| API-003 | Error Handling | Implement ErrorResponse envelope for all errors | 404 for missing links, 400 for validation errors | 1 pt | python-backend-engineer | API-002 |
| API-004 | OpenTelemetry Spans | Add tracing to budget operations | Spans logged for GET/PUT; trace_id in logs | 1 pt | backend-architect | API-003 |
| API-005 | Integration Tests | Test budget API endpoints end-to-end | All CRUD operations work; error cases covered | 3 pts | python-backend-engineer | API-004 |

**Total Phase 3 Effort**: 14 story points

### Implementation Details

#### SVC-001: Budget DTOs

**File**: `/services/api/app/schemas/person.py`

**Schemas**:

```python
from pydantic import BaseModel, Field
from decimal import Decimal

class PersonOccasionBudgetResponse(BaseModel):
    """Response DTO for person-occasion budget with spending data."""

    person_id: int = Field(..., description="Person ID")
    occasion_id: int = Field(..., description="Occasion ID")

    # Budget fields (NULL = no limit)
    recipient_budget_total: Decimal | None = Field(None, description="Budget for gifts TO person")
    purchaser_budget_total: Decimal | None = Field(None, description="Budget for gifts BY person")

    # Spending data (from get_gift_budget)
    recipient_spent: Decimal = Field(default=Decimal("0"), description="Amount spent on gifts TO person")
    recipient_progress: float | None = Field(None, description="Progress % (spent/budget * 100), NULL if no budget")

    purchaser_spent: Decimal = Field(default=Decimal("0"), description="Amount spent on gifts BY person")
    purchaser_progress: float | None = Field(None, description="Progress % (spent/budget * 100), NULL if no budget")

    class Config:
        from_attributes = True

class PersonOccasionBudgetUpdate(BaseModel):
    """Request DTO for updating person-occasion budget."""

    recipient_budget_total: Decimal | None = Field(None, ge=0, description="Budget for gifts TO person (≥0 or NULL)")
    purchaser_budget_total: Decimal | None = Field(None, ge=0, description="Budget for gifts BY person (≥0 or NULL)")
```

#### SVC-002: Budget Service Methods

**File**: `/services/api/app/services/person.py`

**Methods**:

```python
from app.schemas.person import PersonOccasionBudgetResponse, PersonOccasionBudgetUpdate
from decimal import Decimal

async def get_occasion_budget(
    self,
    person_id: int,
    occasion_id: int
) -> PersonOccasionBudgetResponse:
    """
    Get budget and spending data for person-occasion pair.

    Returns:
        PersonOccasionBudgetResponse with budget fields and progress
    """
    # Get budget fields from PersonOccasion
    person_occasion = await self.repo.get_person_occasion_budget(person_id, occasion_id)
    if not person_occasion:
        raise ValueError(f"Person {person_id} not linked to occasion {occasion_id}")

    # Get spending data (occasion-filtered)
    budget_result = await self.repo.get_gift_budget(person_id, occasion_id)

    # Calculate progress percentages
    recipient_progress = None
    if person_occasion.recipient_budget_total is not None and person_occasion.recipient_budget_total > 0:
        recipient_progress = float(budget_result.recipient_total / person_occasion.recipient_budget_total * 100)

    purchaser_progress = None
    if person_occasion.purchaser_budget_total is not None and person_occasion.purchaser_budget_total > 0:
        purchaser_progress = float(budget_result.purchaser_total / person_occasion.purchaser_budget_total * 100)

    return PersonOccasionBudgetResponse(
        person_id=person_id,
        occasion_id=occasion_id,
        recipient_budget_total=person_occasion.recipient_budget_total,
        purchaser_budget_total=person_occasion.purchaser_budget_total,
        recipient_spent=budget_result.recipient_total,
        recipient_progress=recipient_progress,
        purchaser_spent=budget_result.purchaser_total,
        purchaser_progress=purchaser_progress
    )

async def set_occasion_budget(
    self,
    person_id: int,
    occasion_id: int,
    data: PersonOccasionBudgetUpdate
) -> PersonOccasionBudgetResponse:
    """
    Update budget for person-occasion pair.

    Returns:
        Updated PersonOccasionBudgetResponse
    """
    # Update in repository
    await self.repo.update_person_occasion_budget(
        person_id,
        occasion_id,
        data.recipient_budget_total,
        data.purchaser_budget_total
    )

    # Return full budget response
    return await self.get_occasion_budget(person_id, occasion_id)
```

#### API-001: GET Budget Endpoint

**File**: `/services/api/app/api/persons.py`

**Endpoint**:

```python
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas.person import PersonOccasionBudgetResponse
from app.services.person import PersonService

router = APIRouter(prefix="/persons", tags=["persons"])

@router.get(
    "/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    status_code=status.HTTP_200_OK,
    summary="Get person budget for occasion",
    description="Retrieve budget fields and spending progress for a person-occasion pair"
)
async def get_person_occasion_budget(
    person_id: int,
    occasion_id: int,
    service: PersonService = Depends()
):
    try:
        return await service.get_occasion_budget(person_id, occasion_id)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": "NOT_FOUND",
                    "message": str(e),
                    "trace_id": "..."  # Add trace_id from request context
                }
            }
        )
```

#### API-002: PUT Budget Endpoint

**File**: `/services/api/app/api/persons.py`

**Endpoint**:

```python
@router.put(
    "/{person_id}/occasions/{occasion_id}/budget",
    response_model=PersonOccasionBudgetResponse,
    status_code=status.HTTP_200_OK,
    summary="Update person budget for occasion",
    description="Set or update budget fields for a person-occasion pair"
)
async def update_person_occasion_budget(
    person_id: int,
    occasion_id: int,
    data: PersonOccasionBudgetUpdate,
    service: PersonService = Depends()
):
    try:
        return await service.set_occasion_budget(person_id, occasion_id, data)
    except ValueError as e:
        # Check if validation error (negative budget) or not found
        if "must be ≥0" in str(e):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "error": {
                        "code": "VALIDATION_ERROR",
                        "message": str(e),
                        "trace_id": "..."
                    }
                }
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": {
                        "code": "NOT_FOUND",
                        "message": str(e),
                        "trace_id": "..."
                    }
                }
            )
```

#### API-003: Error Handling

**Error Scenarios**:
- **404 NOT_FOUND**: Person-occasion link doesn't exist
- **400 VALIDATION_ERROR**: Negative budget values
- **500 INTERNAL_ERROR**: Unexpected database errors

**Consistent ErrorResponse envelope** across all errors

#### API-004: OpenTelemetry Spans

**Instrumentation**:

```python
from opentelemetry import trace

tracer = trace.get_tracer(__name__)

@router.get("/{person_id}/occasions/{occasion_id}/budget")
async def get_person_occasion_budget(...):
    with tracer.start_as_current_span(
        "get_person_occasion_budget",
        attributes={
            "person_id": person_id,
            "occasion_id": occasion_id
        }
    ):
        # Endpoint logic
        pass
```

**Structured Logging**:

```python
logger.info(
    "Budget retrieved",
    extra={
        "person_id": person_id,
        "occasion_id": occasion_id,
        "trace_id": request.state.trace_id
    }
)
```

#### API-005: Integration Tests

**File**: `/services/api/tests/integration/test_budget_api.py`

**Test Coverage**:

```python
async def test_get_budget_success(client: TestClient):
    """Test GET budget endpoint returns correct data."""
    response = client.get("/persons/1/occasions/1/budget")
    assert response.status_code == 200
    data = response.json()
    assert data["person_id"] == 1
    assert data["occasion_id"] == 1
    assert "recipient_budget_total" in data

async def test_get_budget_not_found(client: TestClient):
    """Test GET budget for non-existent link returns 404."""
    response = client.get("/persons/999/occasions/999/budget")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"

async def test_put_budget_success(client: TestClient):
    """Test PUT budget updates values correctly."""
    response = client.put(
        "/persons/1/occasions/1/budget",
        json={
            "recipient_budget_total": 200.00,
            "purchaser_budget_total": 50.00
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["recipient_budget_total"] == 200.00
    assert data["purchaser_budget_total"] == 50.00

async def test_put_budget_null_allowed(client: TestClient):
    """Test PUT budget accepts NULL values (no limit)."""
    response = client.put(
        "/persons/1/occasions/1/budget",
        json={
            "recipient_budget_total": None,
            "purchaser_budget_total": None
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["recipient_budget_total"] is None

async def test_put_budget_negative_rejected(client: TestClient):
    """Test PUT budget rejects negative values."""
    response = client.put(
        "/persons/1/occasions/1/budget",
        json={"recipient_budget_total": -100.00}
    )
    assert response.status_code == 400
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"

async def test_budget_progress_calculation(client: TestClient):
    """Test progress percentage calculated correctly."""
    # Set budget
    client.put(
        "/persons/1/occasions/1/budget",
        json={"recipient_budget_total": 200.00}
    )

    # Add gift worth $50
    # (Assumes gift creation endpoint exists)

    # Get budget
    response = client.get("/persons/1/occasions/1/budget")
    data = response.json()
    assert data["recipient_spent"] == 50.00
    assert data["recipient_progress"] == 25.0  # 50/200 * 100
```

### Phase 3 Quality Gates

- [x] PersonOccasionBudgetResponse DTO validates and serializes correctly
- [x] Budget service methods return DTOs (no ORM models)
- [x] GET/PUT endpoints return 200 with correct data
- [x] ErrorResponse envelope used for 404/400/500 errors
- [x] OpenTelemetry spans logged for all budget operations
- [x] Integration tests cover all CRUD operations and error cases
- [x] Progress percentage calculated correctly (spent/budget * 100)

### Phase 3 Deliverables

- Budget DTOs: `/services/api/app/schemas/person.py`
- Service methods: `/services/api/app/services/person.py`
- API endpoints: `/services/api/app/api/persons.py`
- Integration tests: `/services/api/tests/integration/test_budget_api.py`
- OpenAPI documentation (auto-generated from FastAPI)

---

## Phase 4: Frontend Hooks & Data Layer (1 day, 8 story points)

### Tasks

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Subagent(s) | Dependencies |
|---------|-----------|-------------|-------------------|----------|-------------|--------------|
| HOOK-001 | TypeScript Types | Define PersonOccasionBudget, PersonOccasionBudgetUpdate types | Types match backend DTOs; exported from types file | 0.5 pts | frontend-developer | Phase 3 |
| HOOK-002 | API Client Methods | Add getBudget(), updateBudget() to API client | Methods call correct endpoints; handle errors | 1 pt | frontend-developer | HOOK-001 |
| HOOK-003 | usePersonOccasionBudget Hook | Create React Query hook for fetching budget | Hook returns budget data; loading/error states handled | 2 pts | ui-engineer-enhanced | HOOK-002 |
| HOOK-004 | useUpdatePersonOccasionBudget Hook | Create mutation hook for updating budget | Mutation updates budget; invalidates cache; optimistic updates | 2.5 pts | ui-engineer-enhanced | HOOK-003 |
| HOOK-005 | Hook Unit Tests | Test hooks with MSW mocks | All states tested (loading, success, error); cache invalidation verified | 2 pts | frontend-developer | HOOK-004 |

**Total Phase 4 Effort**: 8 story points

### Implementation Details

#### HOOK-001: TypeScript Types

**File**: `/apps/web/types/budget.ts` (create if doesn't exist, or add to existing types)

**Types**:

```typescript
export interface PersonOccasionBudget {
  person_id: number;
  occasion_id: number;
  recipient_budget_total: number | null;  // NULL = no budget limit
  purchaser_budget_total: number | null;
  recipient_spent: number;
  recipient_progress: number | null;  // NULL if no budget set
  purchaser_spent: number;
  purchaser_progress: number | null;
}

export interface PersonOccasionBudgetUpdate {
  recipient_budget_total?: number | null;
  purchaser_budget_total?: number | null;
}
```

#### HOOK-002: API Client Methods

**File**: `/apps/web/lib/api.ts` (or create `/apps/web/lib/api/budget.ts`)

**Methods**:

```typescript
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPersonOccasionBudget(
  personId: number,
  occasionId: number
): Promise<PersonOccasionBudget> {
  const response = await fetch(
    `${API_URL}/persons/${personId}/occasions/${occasionId}/budget`,
    {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}

export async function updatePersonOccasionBudget(
  personId: number,
  occasionId: number,
  data: PersonOccasionBudgetUpdate
): Promise<PersonOccasionBudget> {
  const response = await fetch(
    `${API_URL}/persons/${personId}/occasions/${occasionId}/budget`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error.message);
  }

  return response.json();
}
```

#### HOOK-003: usePersonOccasionBudget Hook

**File**: `/apps/web/hooks/usePersonOccasionBudget.ts`

**Hook**:

```typescript
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { getPersonOccasionBudget } from '@/lib/api';
import type { PersonOccasionBudget } from '@/types/budget';

export function usePersonOccasionBudget(
  personId: number,
  occasionId: number
): UseQueryResult<PersonOccasionBudget, Error> {
  return useQuery({
    queryKey: ['person-occasion-budget', personId, occasionId],
    queryFn: () => getPersonOccasionBudget(personId, occasionId),
    staleTime: 5 * 60 * 1000,  // 5 minutes
    refetchOnWindowFocus: true,
    enabled: !!personId && !!occasionId  // Only fetch if IDs are valid
  });
}
```

#### HOOK-004: useUpdatePersonOccasionBudget Hook

**File**: `/apps/web/hooks/usePersonOccasionBudget.ts` (add to same file)

**Hook**:

```typescript
import { useMutation, useQueryClient, UseMutationResult } from '@tanstack/react-query';
import { updatePersonOccasionBudget } from '@/lib/api';
import type { PersonOccasionBudget, PersonOccasionBudgetUpdate } from '@/types/budget';

export function useUpdatePersonOccasionBudget(
  personId: number,
  occasionId: number
): UseMutationResult<PersonOccasionBudget, Error, PersonOccasionBudgetUpdate> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: PersonOccasionBudgetUpdate) =>
      updatePersonOccasionBudget(personId, occasionId, data),

    // Optimistic update
    onMutate: async (newBudget) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['person-occasion-budget', personId, occasionId]
      });

      // Snapshot previous value
      const previous = queryClient.getQueryData<PersonOccasionBudget>([
        'person-occasion-budget',
        personId,
        occasionId
      ]);

      // Optimistically update
      if (previous) {
        queryClient.setQueryData<PersonOccasionBudget>(
          ['person-occasion-budget', personId, occasionId],
          {
            ...previous,
            ...newBudget
          }
        );
      }

      return { previous };
    },

    // Rollback on error
    onError: (err, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['person-occasion-budget', personId, occasionId],
          context.previous
        );
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ['person-occasion-budget', personId, occasionId]
      });

      // Also invalidate person budget (global totals)
      queryClient.invalidateQueries({
        queryKey: ['person-budget', personId]
      });

      // Invalidate occasion details (may show budget summary)
      queryClient.invalidateQueries({
        queryKey: ['occasion', occasionId]
      });
    }
  });
}
```

#### HOOK-005: Hook Unit Tests

**File**: `/apps/web/hooks/__tests__/usePersonOccasionBudget.test.ts`

**Tests**:

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { usePersonOccasionBudget, useUpdatePersonOccasionBudget } from '../usePersonOccasionBudget';

const server = setupServer(
  rest.get('/api/persons/:personId/occasions/:occasionId/budget', (req, res, ctx) => {
    return res(ctx.json({
      person_id: 1,
      occasion_id: 1,
      recipient_budget_total: 200.00,
      purchaser_budget_total: 50.00,
      recipient_spent: 50.00,
      recipient_progress: 25.0,
      purchaser_spent: 0.00,
      purchaser_progress: 0.0
    }));
  }),

  rest.put('/api/persons/:personId/occasions/:occasionId/budget', (req, res, ctx) => {
    const body = req.body as PersonOccasionBudgetUpdate;
    return res(ctx.json({
      person_id: 1,
      occasion_id: 1,
      recipient_budget_total: body.recipient_budget_total ?? 200.00,
      purchaser_budget_total: body.purchaser_budget_total ?? 50.00,
      recipient_spent: 50.00,
      recipient_progress: 25.0,
      purchaser_spent: 0.00,
      purchaser_progress: 0.0
    }));
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

const queryClient = new QueryClient();
const wrapper = ({ children }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

test('usePersonOccasionBudget fetches budget data', async () => {
  const { result } = renderHook(() => usePersonOccasionBudget(1, 1), { wrapper });

  expect(result.current.isLoading).toBe(true);

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data).toEqual({
    person_id: 1,
    occasion_id: 1,
    recipient_budget_total: 200.00,
    purchaser_budget_total: 50.00,
    recipient_spent: 50.00,
    recipient_progress: 25.0,
    purchaser_spent: 0.00,
    purchaser_progress: 0.0
  });
});

test('useUpdatePersonOccasionBudget updates budget', async () => {
  const { result } = renderHook(() => useUpdatePersonOccasionBudget(1, 1), { wrapper });

  result.current.mutate({ recipient_budget_total: 250.00 });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));

  expect(result.current.data?.recipient_budget_total).toBe(250.00);
});

test('useUpdatePersonOccasionBudget handles errors', async () => {
  server.use(
    rest.put('/api/persons/:personId/occasions/:occasionId/budget', (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'recipient_budget_total must be ≥0 or NULL'
        }
      }));
    })
  );

  const { result } = renderHook(() => useUpdatePersonOccasionBudget(1, 1), { wrapper });

  result.current.mutate({ recipient_budget_total: -100 });

  await waitFor(() => expect(result.current.isError).toBe(true));

  expect(result.current.error?.message).toContain('must be ≥0 or NULL');
});
```

### Phase 4 Quality Gates

- [x] TypeScript types match backend DTOs exactly
- [x] API client methods call correct endpoints and handle errors
- [x] usePersonOccasionBudget hook fetches data with correct query key
- [x] useUpdatePersonOccasionBudget hook updates data and invalidates caches
- [x] Optimistic updates provide instant UI feedback
- [x] Hook tests cover loading, success, and error states
- [x] MSW mocks simulate backend responses accurately

### Phase 4 Deliverables

- Types: `/apps/web/types/budget.ts`
- API client: `/apps/web/lib/api.ts` or `/apps/web/lib/api/budget.ts`
- Hooks: `/apps/web/hooks/usePersonOccasionBudget.ts`
- Tests: `/apps/web/hooks/__tests__/usePersonOccasionBudget.test.ts`

---

## Integration Notes

- Phase 3 (backend) can proceed fully independently
- Phase 4 (frontend) requires Phase 3 API endpoints to be testable (mock data acceptable)
- Parallel work: While Phase 3 develops API, Phase 4 can develop types, client, and hooks using mocked responses
- API first: Frontend hooks directly consume API endpoints (no intermediate layer)
- Optimistic updates: React Query mutations provide instant UI feedback while server processes

---

## Next Steps

After Phase 4 completion, proceed to [Phase 5: UI Components & Pages](./phase-5-ui.md)
