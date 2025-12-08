---
type: progress
prd: person-occasion-budgets-v1
phase: 4
phase_name: Frontend Hooks & Data Layer
status: not_started
progress: 0
total_tasks: 4
completed_tasks: 0
story_points: 8
estimated_duration: 1 day
tasks:
  - id: HOOK-001
    title: Create TypeScript types for PersonOccasionBudget
    status: pending
    assigned_to: ui-engineer-enhanced
    dependencies: [API-007]
    story_points: 1
    files:
      - apps/web/src/types/budget.ts
    description: TypeScript interfaces matching backend DTOs
  - id: HOOK-002
    title: Create usePersonOccasionBudget React Query hook
    status: pending
    assigned_to: ui-engineer-enhanced
    dependencies: [HOOK-001, API-007]
    story_points: 3
    files:
      - apps/web/src/hooks/usePersonOccasionBudget.ts
    description: Query hook for fetching person-occasion budget
  - id: HOOK-003
    title: Create useUpdatePersonOccasionBudget mutation hook
    status: pending
    assigned_to: ui-engineer-enhanced
    dependencies: [HOOK-001, API-007]
    story_points: 3
    files:
      - apps/web/src/hooks/usePersonOccasionBudget.ts
    description: Mutation hook for updating budget with optimistic updates
  - id: HOOK-004
    title: Write hook tests with MSW
    status: pending
    assigned_to: frontend-developer
    dependencies: [HOOK-002, HOOK-003]
    story_points: 1
    files:
      - apps/web/src/hooks/__tests__/usePersonOccasionBudget.test.ts
    description: Test hooks with Mock Service Worker
---

# Phase 4: Frontend Hooks & Data Layer

**Status**: Not Started
**Last Updated**: 2025-12-07
**Completion**: 0%
**Story Points**: 8 / 8 remaining
**Estimated Duration**: 1 day

## Overview

Create TypeScript types and React Query hooks for person-occasion budget operations. This phase establishes the frontend data layer that UI components will consume in Phase 5.

## Parallelization Strategy

### Batch 1: TypeScript Types (Sequential - 1 story point, 0.1 days)
- HOOK-001: Create TypeScript types

### Batch 2: React Query Hooks (Parallel - 6 story points, 0.6 days)
Can run in parallel after types are defined:
- HOOK-002: usePersonOccasionBudget query hook (3 pts)
- HOOK-003: useUpdatePersonOccasionBudget mutation hook (3 pts)

### Batch 3: Testing (Sequential - 1 story point, 0.3 days)
- HOOK-004: Hook tests with MSW (depends on HOOK-002, HOOK-003)

**Total Duration**: 1 day (some parallelization possible)

## Tasks

### HOOK-001: Create TypeScript Types for PersonOccasionBudget ⏳ Pending
**Story Points**: 1
**Assigned To**: ui-engineer-enhanced
**Dependencies**: API-007
**Files**: `apps/web/src/types/budget.ts`

**Description**:
Create TypeScript interfaces that match the backend DTOs for type safety across the frontend.

**Type Definitions**:
```typescript
// apps/web/src/types/budget.ts

export interface PersonOccasionBudget {
  person_id: number;
  occasion_id: number;
  budget_amount: string | null;  // Decimal as string from backend
  budget_spent: string;           // Decimal as string
  budget_remaining: string;       // Decimal as string
  budget_currency: string;
  budget_notes: string | null;
  is_over_budget: boolean;
}

export interface PersonOccasionBudgetUpdate {
  budget_amount?: string | null;
  budget_currency?: string | null;
  budget_notes?: string | null;
}

// Helper type for parsed budget (numbers for calculations)
export interface PersonOccasionBudgetParsed extends Omit<
  PersonOccasionBudget,
  'budget_amount' | 'budget_spent' | 'budget_remaining'
> {
  budget_amount: number | null;
  budget_spent: number;
  budget_remaining: number;
}
```

**Acceptance Criteria**:
- [ ] Types match backend DTOs exactly
- [ ] Decimal fields typed as strings (backend serialization)
- [ ] Optional fields properly marked with `| null` or `?`
- [ ] Helper type for parsed numbers (UI calculations)
- [ ] Exported from types/budget.ts
- [ ] Follows existing type patterns in codebase

---

### HOOK-002: Create usePersonOccasionBudget React Query Hook ⏳ Pending
**Story Points**: 3
**Assigned To**: ui-engineer-enhanced
**Dependencies**: HOOK-001, API-007
**Files**: `apps/web/src/hooks/usePersonOccasionBudget.ts`

**Description**:
Create React Query hook for fetching person-occasion budget with proper caching and error handling.

**Hook Implementation**:
```typescript
// apps/web/src/hooks/usePersonOccasionBudget.ts

import { useQuery } from '@tanstack/react-query';
import type { PersonOccasionBudget } from '@/types/budget';

export const personOccasionBudgetKeys = {
  all: ['person-occasion-budgets'] as const,
  byPersonOccasion: (personId: number, occasionId: number) =>
    [...personOccasionBudgetKeys.all, personId, occasionId] as const,
};

interface UsePersonOccasionBudgetOptions {
  enabled?: boolean;
}

export function usePersonOccasionBudget(
  personId: number,
  occasionId: number,
  options?: UsePersonOccasionBudgetOptions
) {
  return useQuery({
    queryKey: personOccasionBudgetKeys.byPersonOccasion(personId, occasionId),
    queryFn: async (): Promise<PersonOccasionBudget> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/persons/${personId}/occasions/${occasionId}/budget`
      );

      if (!response.ok) {
        if (response.status === 404) {
          // Return default budget if not set
          return {
            person_id: personId,
            occasion_id: occasionId,
            budget_amount: null,
            budget_spent: "0.00",
            budget_remaining: "0.00",
            budget_currency: "USD",
            budget_notes: null,
            is_over_budget: false,
          };
        }
        throw new Error('Failed to fetch budget');
      }

      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: options?.enabled ?? true,
  });
}
```

**Acceptance Criteria**:
- [ ] Uses React Query useQuery
- [ ] Proper query key factory for cache invalidation
- [ ] Fetches from GET /persons/{id}/occasions/{oid}/budget
- [ ] Handles 404 by returning default budget (not error)
- [ ] Handles other errors appropriately
- [ ] staleTime set to 5 minutes (project standard)
- [ ] Supports enabled option for conditional fetching
- [ ] TypeScript types properly inferred
- [ ] Follows existing hook patterns in codebase

---

### HOOK-003: Create useUpdatePersonOccasionBudget Mutation Hook ⏳ Pending
**Story Points**: 3
**Assigned To**: ui-engineer-enhanced
**Dependencies**: HOOK-001, API-007
**Files**: `apps/web/src/hooks/usePersonOccasionBudget.ts`

**Description**:
Create React Query mutation hook for updating person-occasion budget with optimistic updates and cache invalidation.

**Hook Implementation**:
```typescript
// apps/web/src/hooks/usePersonOccasionBudget.ts (continued)

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { PersonOccasionBudgetUpdate } from '@/types/budget';

export function useUpdatePersonOccasionBudget(
  personId: number,
  occasionId: number
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      update: PersonOccasionBudgetUpdate
    ): Promise<PersonOccasionBudget> => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/persons/${personId}/occasions/${occasionId}/budget`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(update),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Failed to update budget');
      }

      return response.json();
    },
    onMutate: async (update) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: personOccasionBudgetKeys.byPersonOccasion(personId, occasionId),
      });

      // Snapshot previous value
      const previous = queryClient.getQueryData<PersonOccasionBudget>(
        personOccasionBudgetKeys.byPersonOccasion(personId, occasionId)
      );

      // Optimistically update cache
      if (previous) {
        queryClient.setQueryData<PersonOccasionBudget>(
          personOccasionBudgetKeys.byPersonOccasion(personId, occasionId),
          { ...previous, ...update }
        );
      }

      return { previous };
    },
    onError: (err, update, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(
          personOccasionBudgetKeys.byPersonOccasion(personId, occasionId),
          context.previous
        );
      }
    },
    onSuccess: (data) => {
      // Update cache with server response
      queryClient.setQueryData(
        personOccasionBudgetKeys.byPersonOccasion(personId, occasionId),
        data
      );
    },
    onSettled: () => {
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: personOccasionBudgetKeys.byPersonOccasion(personId, occasionId),
      });
    },
  });
}
```

**Acceptance Criteria**:
- [ ] Uses React Query useMutation
- [ ] Calls PUT /persons/{id}/occasions/{oid}/budget
- [ ] Implements optimistic updates (onMutate)
- [ ] Rolls back on error (onError)
- [ ] Invalidates cache on success (onSettled)
- [ ] Proper error handling and error messages
- [ ] TypeScript types properly inferred
- [ ] Follows existing mutation patterns in codebase

---

### HOOK-004: Write Hook Tests with MSW ⏳ Pending
**Story Points**: 1
**Assigned To**: frontend-developer
**Dependencies**: HOOK-002, HOOK-003
**Files**: `apps/web/src/hooks/__tests__/usePersonOccasionBudget.test.ts`

**Description**:
Test React Query hooks using Mock Service Worker to mock API responses.

**Test Coverage**:

**usePersonOccasionBudget tests**:
- `test_fetch_budget_success`: Returns budget data
- `test_fetch_budget_not_found`: Returns default budget on 404
- `test_fetch_budget_error`: Handles errors appropriately
- `test_fetch_budget_disabled`: Respects enabled option

**useUpdatePersonOccasionBudget tests**:
- `test_update_budget_success`: Updates budget successfully
- `test_update_budget_optimistic`: Optimistic update works
- `test_update_budget_rollback`: Rolls back on error
- `test_update_budget_validation_error`: Handles 422 errors

**Test Implementation**:
```typescript
// apps/web/src/hooks/__tests__/usePersonOccasionBudget.test.ts

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { usePersonOccasionBudget, useUpdatePersonOccasionBudget } from '../usePersonOccasionBudget';

const server = setupServer();

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// Wrapper for React Query
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('usePersonOccasionBudget', () => {
  test('fetches budget successfully', async () => {
    server.use(
      http.get('/api/v1/persons/:personId/occasions/:occasionId/budget', () => {
        return HttpResponse.json({
          person_id: 1,
          occasion_id: 2,
          budget_amount: "100.00",
          budget_spent: "50.00",
          budget_remaining: "50.00",
          budget_currency: "USD",
          budget_notes: null,
          is_over_budget: false,
        });
      })
    );

    const { result } = renderHook(() => usePersonOccasionBudget(1, 2), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.budget_amount).toBe("100.00");
  });

  // ... more tests
});
```

**Acceptance Criteria**:
- [ ] All tests pass
- [ ] Uses MSW for API mocking
- [ ] Tests use renderHook from @testing-library/react
- [ ] Tests use QueryClientProvider wrapper
- [ ] Tests cover happy path and error cases
- [ ] Tests verify optimistic updates and rollback
- [ ] Tests follow existing test patterns in codebase

---

## Quick Reference

### Pre-built Task Commands

```python
# HOOK-001: Create TypeScript types
Task("ui-engineer-enhanced", """
Create TypeScript types for person-occasion budgets.

File: apps/web/src/types/budget.ts

Types to create:
1. PersonOccasionBudget (matches backend response DTO)
2. PersonOccasionBudgetUpdate (matches backend update DTO)
3. PersonOccasionBudgetParsed (helper type with parsed numbers)

Ensure:
- Decimal fields are strings (backend serialization)
- Optional fields marked with | null or ?
- Exported from budget.ts
- Matches backend DTOs exactly

Reference: services/api/app/schemas/person.py
Follow patterns in: apps/web/src/types/
""")

# HOOK-002: Create usePersonOccasionBudget hook
Task("ui-engineer-enhanced", """
Create usePersonOccasionBudget React Query hook.

File: apps/web/src/hooks/usePersonOccasionBudget.ts

Hook requirements:
- Uses React Query useQuery
- Query key: ['person-occasion-budgets', personId, occasionId]
- Fetches: GET /api/v1/persons/{personId}/occasions/{occasionId}/budget
- Handles 404 by returning default budget
- staleTime: 5 minutes
- enabled option for conditional fetching
- TypeScript types from @/types/budget

Pattern reference: apps/web/src/hooks/useGift.ts (or similar existing hooks)
Use query key factory pattern for cache management.
""")

# HOOK-003: Create useUpdatePersonOccasionBudget hook
Task("ui-engineer-enhanced", """
Create useUpdatePersonOccasionBudget mutation hook.

File: apps/web/src/hooks/usePersonOccasionBudget.ts

Hook requirements:
- Uses React Query useMutation
- Calls: PUT /api/v1/persons/{personId}/occasions/{occasionId}/budget
- Optimistic updates in onMutate
- Rollback on error
- Cache invalidation on success
- TypeScript types from @/types/budget

Implement:
- onMutate: cancel queries, snapshot, optimistic update
- onError: rollback to snapshot
- onSuccess: update cache with server response
- onSettled: invalidate queries

Pattern reference: Look for existing mutation hooks in apps/web/src/hooks/
""")

# HOOK-004: Write hook tests
Task("frontend-developer", """
Write tests for person-occasion budget hooks.

File: apps/web/src/hooks/__tests__/usePersonOccasionBudget.test.ts

Test coverage:
usePersonOccasionBudget:
- Fetch success
- 404 returns default budget
- Error handling
- enabled option

useUpdatePersonOccasionBudget:
- Update success
- Optimistic update
- Rollback on error
- Validation error handling

Use:
- MSW for API mocking
- @testing-library/react renderHook
- QueryClientProvider wrapper
- waitFor for async assertions

Pattern reference: Existing hook tests in apps/web/src/hooks/__tests__/
""")
```

### File Locations

```
apps/web/
└── src/
    ├── types/
    │   └── budget.ts                                           # HOOK-001
    └── hooks/
        ├── usePersonOccasionBudget.ts                          # HOOK-002, HOOK-003
        └── __tests__/
            └── usePersonOccasionBudget.test.ts                 # HOOK-004
```

### Testing Commands

```bash
# Navigate to web app
cd /Users/miethe/dev/homelab/development/family-shopping-dashboard/apps/web

# Run hook tests
npm test -- usePersonOccasionBudget.test.ts

# Run with coverage
npm test -- usePersonOccasionBudget.test.ts --coverage

# Run all hook tests
npm test -- hooks/__tests__

# Type check
npm run type-check
```

## Context for AI Agents

### React Query Patterns

**Query Key Factory**:
```typescript
export const budgetKeys = {
  all: ['person-occasion-budgets'] as const,
  byPersonOccasion: (personId: number, occasionId: number) =>
    [...budgetKeys.all, personId, occasionId] as const,
};
```

Benefits:
- Type-safe query keys
- Easy cache invalidation
- Hierarchical organization

**Optimistic Updates Flow**:
1. **onMutate**: Cancel queries, snapshot, update cache
2. **User sees update immediately** (optimistic)
3. **onError**: Rollback to snapshot if mutation fails
4. **onSuccess**: Update cache with server response
5. **onSettled**: Invalidate and refetch to ensure sync

### Decimal Handling

Backend sends Decimals as strings to avoid precision loss:
```json
{
  "budget_amount": "123.45",  // String, not number
  "budget_spent": "67.89"
}
```

Frontend options:
1. **Keep as strings** for display: `{budget.budget_amount}`
2. **Parse for calculations**: `parseFloat(budget.budget_amount)`
3. **Use helper type**: `PersonOccasionBudgetParsed`

### 404 Handling Strategy

When budget doesn't exist yet (user hasn't set it):
- **Don't treat as error** (not a failure state)
- **Return default budget** (amount: null, spent: 0)
- **UI shows "no budget set"** vs error message

This approach enables UI to always display budget section, even before user sets a budget.

### Testing Strategy

**MSW Setup**:
```typescript
const server = setupServer(
  http.get('/api/v1/persons/:personId/occasions/:occasionId/budget', () => {
    return HttpResponse.json({ /* mock data */ });
  })
);
```

**Test Isolation**:
- Each test gets new QueryClient
- No shared state between tests
- Reset MSW handlers after each test

**Async Testing**:
```typescript
await waitFor(() => expect(result.current.isSuccess).toBe(true));
```

## Integration Points

### Consumed By
- **UI Components** (Phase 5): PersonOccasionBudgetCard, PersonBudgetBar, etc.
- **Pages**: Person detail, occasion detail pages

### Consumes
- **API Endpoints** (Phase 3): GET/PUT budget endpoints
- **TypeScript Types**: PersonOccasionBudget interfaces
- **React Query**: useQuery, useMutation, QueryClient

### Environment Variables
- `NEXT_PUBLIC_API_URL`: API base URL for fetch calls

## Next Steps

After Phase 4 completion:
1. Proceed to Phase 5: UI Components & Pages
2. Create PersonOccasionBudgetCard component
3. Integrate hooks into budget displays
4. Wire to PersonBudgetBar with occasion context

## References

- **PRD**: `/docs/project_plans/PRDs/features/person-occasion-budgets-v1.md`
- **Implementation Plan**: `/docs/project_plans/implementation_plans/features/person-occasion-budgets-v1.md`
- **Phase 3**: `.claude/progress/person-occasion-budgets-v1/phase-3-api-progress.md`
- **Frontend Patterns**: `apps/web/CLAUDE.md`
- **React Query Docs**: https://tanstack.com/query/latest
