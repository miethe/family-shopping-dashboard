---
title: "Phase 4-6: API & Frontend Components"
description: "FastAPI routes, React components, and frontend integration"
related_plan: "../budget-progression-meter-v1.md"
status: ready
---

# Phase 4-6: API & Frontend Components

## Phase Overview

| Phase | Duration | Effort | Agents | Dependencies |
|-------|----------|--------|--------|---|
| 4: API Layer | 1-2 days | 3 pts | python-backend-engineer | Phase 3 |
| 5: Frontend Components | 2 days | 3 pts | ui-engineer-enhanced | Phase 4 |
| 6: Frontend Integration | 2 days | 2 pts | frontend-developer | Phase 5 |

**Total**: 8 story points, 5-6 days

---

## Phase 4: API Layer

**Duration**: 1-2 days
**Effort**: 3 story points
**Dependencies**: Phase 3 (service must be complete)
**Primary Agent**: `python-backend-engineer`

### Epic: BUDGET-API - FastAPI Routes & Endpoints

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| BUDGET-API-001 | Budget meter endpoint | Create GET /api/budgets/meter/{occasion_id} endpoint | Returns BudgetMeterDTO with all fields, status 200; handles not found with 404; includes error envelope | 1 pt | python-backend-engineer |
| BUDGET-API-002 | Set occasion budget | Create POST/PATCH /api/occasions/{id}/budget endpoint | Accepts budget_total in request, persists to DB, returns updated occasion, validates input | 1 pt | python-backend-engineer |
| BUDGET-API-003 | Sub-budget endpoints | Create POST /api/budgets/sub-budget and related endpoints | Create/read/update sub-budgets, returns SubBudgetContextDTO, supports polymorphic entity_type | 1 pt | python-backend-engineer |

### Files to Create/Modify

**Backend**:
```
services/api/app/
├── api/
│   ├── budget.py                        # New BudgetRouter
│   └── occasions.py                     # Modify: add budget endpoints
└── tests/integration/
    ├── test_budget_api.py               # Integration tests
    └── test_budget_endpoints.py         # Endpoint tests
```

### Detailed Task Descriptions

#### BUDGET-API-001: Budget meter endpoint

**Instructions for python-backend-engineer**:

1. Create file: `services/api/app/api/budget.py`
2. Implement router:
   ```python
   from fastapi import APIRouter, Depends, HTTPException, status
   from sqlalchemy.orm import Session
   from app.core.deps import get_db
   from app.core.security import get_current_user
   from app.schemas.budget import BudgetMeterDTO, BudgetWarningDTO
   from app.services.budget import BudgetService
   from app.repositories.budget import BudgetRepository

   router = APIRouter(prefix="/budgets", tags=["budgets"])

   @router.get("/meter/{occasion_id}", response_model=BudgetMeterDTO)
   async def get_budget_meter(
       occasion_id: int,
       db: Session = Depends(get_db),
       current_user = Depends(get_current_user)
   ):
       """
       Get budget meter data for occasion.

       Returns BudgetMeterDTO with purchased, planned, remaining, and percentage used.
       """
       # Verify user has access to occasion
       occasion = db.query(Occasion).filter(
           Occasion.id == occasion_id,
           Occasion.family_id == current_user.family_id
       ).first()

       if not occasion:
           raise HTTPException(
               status_code=status.HTTP_404_NOT_FOUND,
               detail={"code": "NOT_FOUND", "message": "Occasion not found"}
           )

       # Calculate meter data
       budget_repo = BudgetRepository(db)
       budget_service = BudgetService(budget_repo)
       meter_data = budget_service.calculate_meter_data(occasion_id)

       return meter_data
   ```
3. Add router to `services/api/app/main.py`:
   ```python
   from app.api import budget
   app.include_router(budget.router)
   ```
4. Test endpoint with curl/Postman
5. Verify HTTP status codes and error envelope

**API Specification**:

**Request**:
```
GET /api/budgets/meter/{occasion_id}
Authorization: Bearer {token}
```

**Response (200)**:
```json
{
  "occasion_id": 1,
  "total_budget": 500.00,
  "purchased": 200.00,
  "planned": 100.00,
  "remaining": 200.00,
  "percentage_used": 60.0,
  "currency": "USD"
}
```

**Response (404)**:
```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Occasion not found",
    "trace_id": "abc123"
  }
}
```

---

#### BUDGET-API-002: Set occasion budget

**Instructions for python-backend-engineer**:

1. Modify or create endpoint in `services/api/app/api/occasions.py`:
   ```python
   from pydantic import BaseModel, Field
   from decimal import Decimal

   class BudgetUpdateRequest(BaseModel):
       budget_total: Decimal | None = Field(None, gt=0, description="New budget amount")

   @router.patch("/{occasion_id}/budget", response_model=OccasionDTO)
   async def update_occasion_budget(
       occasion_id: int,
       request: BudgetUpdateRequest,
       db: Session = Depends(get_db),
       current_user = Depends(get_current_user)
   ):
       """Update budget for occasion"""
       occasion = db.query(Occasion).filter(
           Occasion.id == occasion_id,
           Occasion.family_id == current_user.family_id
       ).first()

       if not occasion:
           raise HTTPException(status_code=404, detail="Occasion not found")

       occasion.budget_total = request.budget_total
       db.commit()
       db.refresh(occasion)

       return OccasionDTO.from_orm(occasion)
   ```
2. Validate input: budget_total must be positive if set
3. Verify user has edit permission on occasion
4. Return updated occasion DTO
5. Add unit and integration tests

**API Specification**:

**Request**:
```
PATCH /api/occasions/{occasion_id}/budget
Authorization: Bearer {token}
Content-Type: application/json

{
  "budget_total": 500.00
}
```

**Response (200)**:
```json
{
  "id": 1,
  "name": "Christmas 2025",
  "budget_total": 500.00,
  "date": "2025-12-25",
  ...
}
```

---

#### BUDGET-API-003: Sub-budget endpoints

**Instructions for python-backend-engineer**:

1. Add to `services/api/app/api/budget.py`:
   ```python
   from app.models.budget import EntityBudget
   from app.schemas.budget import EntityBudgetUpdateDTO, SubBudgetContextDTO

   @router.post("/sub-budget", response_model=SubBudgetContextDTO)
   async def create_sub_budget(
       request: EntityBudgetUpdateDTO,
       db: Session = Depends(get_db),
       current_user = Depends(get_current_user)
   ):
       """Create or update sub-budget for entity (person, category, etc.)"""
       # Verify occasion exists and user has access
       occasion = db.query(Occasion).filter(
           Occasion.id == request.occasion_id,
           Occasion.family_id == current_user.family_id
       ).first()

       if not occasion:
           raise HTTPException(status_code=404, detail="Occasion not found")

       # Verify entity exists (e.g., person)
       if request.entity_type == 'person':
           entity = db.query(Person).filter(
               Person.id == request.entity_id,
               Person.family_id == current_user.family_id
           ).first()
           if not entity:
               raise HTTPException(status_code=404, detail="Person not found")

       # Create or update entity budget
       entity_budget = db.query(EntityBudget).filter(
           EntityBudget.entity_type == request.entity_type,
           EntityBudget.entity_id == request.entity_id,
           EntityBudget.occasion_id == request.occasion_id
       ).first()

       if entity_budget:
           entity_budget.budget_amount = request.budget_amount
       else:
           entity_budget = EntityBudget(
               entity_type=request.entity_type,
               entity_id=request.entity_id,
               occasion_id=request.occasion_id,
               budget_amount=request.budget_amount
           )
           db.add(entity_budget)

       db.commit()
       db.refresh(entity_budget)

       # Return context
       budget_repo = BudgetRepository(db)
       budget_service = BudgetService(budget_repo)
       context = budget_service.get_sub_budget_context(request.entity_id, request.occasion_id)

       return context

   @router.get("/sub-budget/{entity_type}/{entity_id}/{occasion_id}", response_model=SubBudgetContextDTO | None)
   async def get_sub_budget(
       entity_type: str,
       entity_id: int,
       occasion_id: int,
       db: Session = Depends(get_db),
       current_user = Depends(get_current_user)
   ):
       """Get sub-budget context for entity"""
       # Verify occasion exists
       occasion = db.query(Occasion).filter(
           Occasion.id == occasion_id,
           Occasion.family_id == current_user.family_id
       ).first()

       if not occasion:
           raise HTTPException(status_code=404, detail="Occasion not found")

       budget_repo = BudgetRepository(db)
       budget_service = BudgetService(budget_repo)
       context = budget_service.get_sub_budget_context(entity_id, occasion_id)

       return context
   ```
2. Support polymorphic entity_type: 'person', 'category', etc.
3. Validate entity exists before creating sub-budget
4. Return SubBudgetContextDTO with spent and remaining

---

### Integration Tests for Phase 4

**File**: `services/api/tests/integration/test_budget_api.py`

```python
import pytest
from fastapi.testclient import TestClient
from decimal import Decimal

class TestBudgetAPI:

    def test_get_budget_meter_success(self, client, occasion_with_budget, auth_headers):
        """Should return meter data for occasion"""
        response = client.get(
            f"/api/budgets/meter/{occasion_with_budget.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["occasion_id"] == occasion_with_budget.id
        assert data["total_budget"] == 500.0
        assert data["currency"] == "USD"

    def test_get_budget_meter_not_found(self, client, auth_headers):
        """Should return 404 for non-existent occasion"""
        response = client.get(
            "/api/budgets/meter/99999",
            headers=auth_headers
        )

        assert response.status_code == 404
        assert response.json()["error"]["code"] == "NOT_FOUND"

    def test_get_budget_meter_unauthorized(self, client, other_family_occasion):
        """Should return 404 for occasion from other family"""
        response = client.get(
            f"/api/budgets/meter/{other_family_occasion.id}",
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_update_occasion_budget_success(self, client, occasion, auth_headers):
        """Should update occasion budget"""
        response = client.patch(
            f"/api/occasions/{occasion.id}/budget",
            json={"budget_total": 750.00},
            headers=auth_headers
        )

        assert response.status_code == 200
        assert response.json()["budget_total"] == 750.0

    def test_update_occasion_budget_validation(self, client, occasion, auth_headers):
        """Should reject negative or zero budget"""
        response = client.patch(
            f"/api/occasions/{occasion.id}/budget",
            json={"budget_total": -100.00},
            headers=auth_headers
        )

        assert response.status_code == 422  # Validation error

    def test_create_sub_budget_success(self, client, occasion, person, auth_headers):
        """Should create sub-budget for person"""
        response = client.post(
            "/api/budgets/sub-budget",
            json={
                "entity_type": "person",
                "entity_id": person.id,
                "occasion_id": occasion.id,
                "budget_amount": 200.00
            },
            headers=auth_headers
        )

        assert response.status_code == 200
        assert response.json()["budget_amount"] == 200.0
        assert response.json()["entity_id"] == person.id

    def test_get_sub_budget_context(self, client, occasion, person, sub_budget, auth_headers):
        """Should retrieve sub-budget context"""
        response = client.get(
            f"/api/budgets/sub-budget/person/{person.id}/{occasion.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        assert response.json()["budget_amount"] == 200.0
        assert response.json()["entity_type"] == "person"
```

### Quality Gates for Phase 4

- [ ] All endpoints tested and returning correct status codes
- [ ] Error handling with proper error envelope
- [ ] Authorization verified (user can only see own data)
- [ ] Input validation on all endpoints
- [ ] Integration tests >70% coverage
- [ ] Endpoint documentation complete
- [ ] Performance acceptable (<100ms per request)

---

## Phase 5: Frontend Components

**Duration**: 2 days
**Effort**: 3 story points
**Dependencies**: Phase 4 (API must be available)
**Primary Agent**: `ui-engineer-enhanced`

### Epic: BUDGET-UI - React Components for Budget Display

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| BUDGET-UI-001 | BudgetMeterComponent | Create horizontal progress bar with 3 colored segments | Component renders segments (green/blue/gray), shows dollar amounts, responsive design, touch targets 44px | 1.5 pts | ui-engineer-enhanced |
| BUDGET-UI-002 | BudgetTooltip | Create tooltip showing list of gifts in each segment | Tooltip displays on hover/click, lists gifts with prices, dismissible, accessible | 1 pt | ui-engineer-enhanced |
| BUDGET-UI-003 | BudgetWarningCard | Create warning display for budget overspend | Shows severity indicator, message, non-blocking, dismissible, accessible | 0.5 pt | ui-engineer-enhanced |

### Files to Create

**Frontend**:
```
apps/web/
├── components/budget/
│   ├── BudgetMeterComponent.tsx         # Main meter component
│   ├── BudgetMeterComponent.stories.tsx # Storybook stories
│   ├── BudgetTooltip.tsx                # Tooltip component
│   ├── BudgetWarningCard.tsx            # Warning component
│   └── BudgetMeterSkeleton.tsx          # Loading skeleton
└── __tests__/
    └── BudgetMeterComponent.test.tsx    # Component tests
```

### Detailed Task Descriptions

#### BUDGET-UI-001: BudgetMeterComponent

**Instructions for ui-engineer-enhanced**:

1. Create file: `apps/web/components/budget/BudgetMeterComponent.tsx`
2. Component structure:
   ```typescript
   import React from 'react';

   interface BudgetMeterProps {
     budgetData: {
       total_budget: number | null;
       purchased: number;
       planned: number;
       remaining: number | null;
       percentage_used: number | null;
       currency: string;
     };
     onSegmentClick?: (segment: 'purchased' | 'planned' | 'remaining') => void;
     showTooltip?: boolean;
     isLoading?: boolean;
   }

   export const BudgetMeterComponent: React.FC<BudgetMeterProps> = ({
     budgetData,
     onSegmentClick,
     showTooltip = true,
     isLoading = false,
   }) => {
     if (isLoading) {
       return <BudgetMeterSkeleton />;
     }

     if (!budgetData.total_budget) {
       return <div>No budget set</div>;
     }

     const purchased = budgetData.purchased;
     const planned = budgetData.planned;
     const remaining = Math.max(0, budgetData.remaining || 0);
     const total = purchased + planned + remaining;

     const purchasedPercent = (purchased / total) * 100;
     const plannedPercent = (planned / total) * 100;
     const remainingPercent = (remaining / total) * 100;

     return (
       <div className="w-full space-y-2">
         {/* Meter bar */}
         <div className="flex h-8 gap-1 rounded bg-gray-100 overflow-hidden">
           {/* Purchased segment (green) */}
           {purchasedPercent > 0 && (
             <button
               className="bg-green-500 hover:bg-green-600 transition-colors cursor-pointer"
               style={{ width: `${purchasedPercent}%` }}
               onClick={() => onSegmentClick?.('purchased')}
               title={`Purchased: $${purchased.toFixed(2)}`}
             />
           )}

           {/* Planned segment (blue) */}
           {plannedPercent > 0 && (
             <button
               className="bg-blue-500 hover:bg-blue-600 transition-colors cursor-pointer"
               style={{ width: `${plannedPercent}%` }}
               onClick={() => onSegmentClick?.('planned')}
               title={`Planned: $${planned.toFixed(2)}`}
             />
           )}

           {/* Remaining segment (gray) */}
           {remainingPercent > 0 && (
             <div
               className="bg-gray-300"
               style={{ width: `${remainingPercent}%` }}
             />
           )}
         </div>

         {/* Labels with amounts */}
         <div className="flex justify-between text-sm font-medium">
           <span className="text-green-600">
             Purchased: ${purchased.toFixed(2)}
           </span>
           <span className="text-blue-600">
             Planned: ${planned.toFixed(2)}
           </span>
           <span className="text-gray-600">
             Remaining: ${remaining.toFixed(2)}
           </span>
         </div>

         {/* Total and percentage */}
         <div className="flex justify-between text-xs text-gray-500">
           <span>Total: ${budgetData.total_budget.toFixed(2)}</span>
           <span>
             {budgetData.percentage_used?.toFixed(0)}% used
           </span>
         </div>

         {/* Tooltip if enabled */}
         {showTooltip && (
           <BudgetTooltip budgetData={budgetData} />
         )}
       </div>
     );
   };
   ```
3. Style with Tailwind CSS
4. Make responsive: full width on mobile, constrained on desktop
5. Touch targets: buttons should be ≥44px on mobile
6. Support dark mode (if app supports it)
7. Add Storybook stories for different states

**Key Features**:
- Three-segment horizontal bar
- Color-coded: green (purchased), blue (planned), gray (remaining)
- Interactive segments (clickable)
- Dollar amounts displayed
- Responsive design
- Accessible ARIA labels

---

#### BUDGET-UI-002: BudgetTooltip

**Instructions for ui-engineer-enhanced**:

1. Create file: `apps/web/components/budget/BudgetTooltip.tsx`
2. Component structure:
   ```typescript
   import React, { useState } from 'react';
   import { useBudgetGifts } from '@/hooks/useBudgetGifts';

   interface BudgetTooltipProps {
     budgetData: {
       occasion_id: number;
       purchased: number;
       planned: number;
     };
     isOpen?: boolean;
     onClose?: () => void;
   }

   export const BudgetTooltip: React.FC<BudgetTooltipProps> = ({
     budgetData,
     isOpen = true,
     onClose,
   }) => {
     const { purchasedGifts, plannedGifts, isLoading } = useBudgetGifts(
       budgetData.occasion_id
     );

     if (!isOpen || isLoading) {
       return null;
     }

     return (
       <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded text-sm">
         <div className="mb-2 flex justify-between">
           <span className="font-semibold">Gift Details</span>
           <button
             onClick={onClose}
             className="text-gray-400 hover:text-gray-600"
           >
             ×
           </button>
         </div>

         <div className="space-y-2">
           {/* Purchased gifts */}
           {purchasedGifts.length > 0 && (
             <div>
               <div className="text-green-600 font-medium text-xs">
                 Purchased ({purchasedGifts.length})
               </div>
               {purchasedGifts.map(gift => (
                 <div key={gift.id} className="text-xs text-gray-600 ml-2">
                   {gift.name} - ${gift.price?.toFixed(2)}
                 </div>
               ))}
             </div>
           )}

           {/* Planned gifts */}
           {plannedGifts.length > 0 && (
             <div>
               <div className="text-blue-600 font-medium text-xs">
                 Planned ({plannedGifts.length})
               </div>
               {plannedGifts.map(gift => (
                 <div key={gift.id} className="text-xs text-gray-600 ml-2">
                   {gift.name} - ${gift.price?.toFixed(2)}
                 </div>
               ))}
             </div>
           )}
         </div>
       </div>
     );
   };
   ```
3. Show list of gifts by category (purchased, planned)
4. Display gift names and prices
5. Dismissible with close button
6. Accessible with ARIA labels
7. Loading state while fetching

---

#### BUDGET-UI-003: BudgetWarningCard

**Instructions for ui-engineer-enhanced**:

1. Create file: `apps/web/components/budget/BudgetWarningCard.tsx`
2. Component structure:
   ```typescript
   import React from 'react';

   interface BudgetWarningCardProps {
     warning: {
       has_warning: boolean;
       severity?: 'approaching' | 'exceeding' | 'critical' | null;
       message: string;
       percentage_over?: number | null;
     };
     onDismiss?: () => void;
   }

   export const BudgetWarningCard: React.FC<BudgetWarningCardProps> = ({
     warning,
     onDismiss,
   }) => {
     if (!warning.has_warning) {
       return null;
     }

     const severityColors = {
       approaching: 'bg-yellow-50 border-yellow-200 text-yellow-800',
       exceeding: 'bg-orange-50 border-orange-200 text-orange-800',
       critical: 'bg-red-50 border-red-200 text-red-800',
     };

     const iconEmoji = {
       approaching: '⚠️',
       exceeding: '⛔',
       critical: '🚨',
     };

     const colorClass = severityColors[warning.severity] || severityColors.approaching;
     const icon = iconEmoji[warning.severity] || '⚠️';

     return (
       <div
         className={`p-3 border rounded-md ${colorClass}`}
         role="alert"
       >
         <div className="flex items-start justify-between">
           <div className="flex items-start gap-2">
             <span className="text-lg">{icon}</span>
             <p className="text-sm font-medium">{warning.message}</p>
           </div>
           {onDismiss && (
             <button
               onClick={onDismiss}
               className="ml-2 text-gray-400 hover:text-gray-600"
               aria-label="Dismiss warning"
             >
               ×
             </button>
           )}
         </div>
       </div>
     );
   };
   ```
3. Color-coded by severity: yellow (approaching), orange (exceeding), red (critical)
4. Dismissible with close button
5. Non-blocking (doesn't prevent form submission)
6. Accessible role="alert"

---

### Component Stories (Storybook)

**File**: `apps/web/components/budget/BudgetMeterComponent.stories.tsx`

```typescript
import type { StoryObj } from '@storybook/react';
import { BudgetMeterComponent } from './BudgetMeterComponent';

const meta = {
  title: 'Components/Budget/BudgetMeter',
  component: BudgetMeterComponent,
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Complete: Story = {
  args: {
    budgetData: {
      total_budget: 500,
      purchased: 200,
      planned: 100,
      remaining: 200,
      percentage_used: 60,
      currency: 'USD',
    },
  },
};

export const NearLimit: Story = {
  args: {
    budgetData: {
      total_budget: 500,
      purchased: 300,
      planned: 150,
      remaining: 50,
      percentage_used: 90,
      currency: 'USD',
    },
  },
};

export const NoBudgetSet: Story = {
  args: {
    budgetData: {
      total_budget: null,
      purchased: 100,
      planned: 50,
      remaining: null,
      percentage_used: null,
      currency: 'USD',
    },
  },
};

export const Loading: Story = {
  args: {
    budgetData: {
      total_budget: 500,
      purchased: 0,
      planned: 0,
      remaining: 500,
      percentage_used: 0,
      currency: 'USD',
    },
    isLoading: true,
  },
};
```

### Quality Gates for Phase 5

- [ ] Components render without errors
- [ ] Responsive design on mobile (iPhone), tablet, desktop
- [ ] Touch targets ≥44px on mobile
- [ ] Color contrast meets WCAG AA
- [ ] Accessible ARIA labels and roles
- [ ] Storybook stories cover all states
- [ ] Unit tests for rendering and interaction
- [ ] Mobile testing on iOS Safari and Android Chrome

---

## Phase 6: Frontend Integration

**Duration**: 2 days
**Effort**: 2 story points
**Dependencies**: Phase 5 (components must be ready)
**Primary Agent**: `frontend-developer`

### Epic: BUDGET-INTEGRATION - Integrate Components into App

| Task ID | Task Name | Description | Acceptance Criteria | Estimate | Assigned To |
|---------|-----------|-------------|-------------------|----------|-------------|
| BUDGET-INTEG-001 | useBudgetMeter hook | Create React Query hook with WebSocket invalidation | Hook fetches meter data, subscribes to WS events, invalidates on mutations, returns loading state | 1 pt | frontend-developer |
| BUDGET-INTEG-002 | Occasion detail integration | Add meter to OccasionDetail component | Meter displays prominently, real-time updates, mobile responsive | 0.5 pt | frontend-developer |
| BUDGET-INTEG-003 | Dashboard integration | Add meter for upcoming occasion | Only shows if budget set, positioned above Idea Inbox, clickable | 0.25 pt | frontend-developer |
| BUDGET-INTEG-004 | Gift form integration | Add budget context to ManualGiftForm | Shows remaining budget sidebar, updates on price change, warnings | 0.5 pt | frontend-developer |
| BUDGET-INTEG-005 | List/Kanban integration | Add price totals to list and Kanban views | List header shows "$N / $Z", Kanban columns show totals | 0.5 pt | frontend-developer |
| BUDGET-INTEG-006 | WebSocket invalidation | Integrate cache invalidation on list item updates | When gift status/price changes, meter refetches | 0.25 pt | frontend-developer |

### Files to Create/Modify

**Frontend**:
```
apps/web/
├── hooks/
│   └── useBudgetMeter.ts                # React Query hook (new)
├── components/
│   ├── occasions/
│   │   └── OccasionDetail.tsx           # Add meter (modify)
│   ├── dashboard/
│   │   └── Dashboard.tsx                # Add meter for upcoming (modify)
│   ├── gifts/
│   │   └── ManualGiftForm.tsx           # Add budget context (modify)
│   ├── lists/
│   │   ├── KanbanBoard.tsx              # Add column totals (modify)
│   │   └── ListView.tsx                 # Add header totals (modify)
│   └── budget/
│       └── BudgetMeterSkeleton.tsx      # Loading skeleton (new)
└── __tests__/
    └── useBudgetMeter.test.ts           # Hook tests (new)
```

### Detailed Task Descriptions

#### BUDGET-INTEG-001: useBudgetMeter hook

**Instructions for frontend-developer**:

1. Create file: `apps/web/hooks/useBudgetMeter.ts`
2. Implement hook with React Query:
   ```typescript
   import { useQuery, useQueryClient } from '@tanstack/react-query';
   import { useEffect } from 'react';
   import { useWebSocket } from '@/hooks/useWebSocket';

   interface BudgetMeterDTO {
     occasion_id: number;
     total_budget: number | null;
     purchased: number;
     planned: number;
     remaining: number | null;
     percentage_used: number | null;
     currency: string;
   }

   export function useBudgetMeter(occasionId: number) {
     const queryClient = useQueryClient();
     const { subscribe } = useWebSocket();

     const query = useQuery({
       queryKey: ['budget-meter', occasionId],
       queryFn: async () => {
         const response = await fetch(
           `/api/budgets/meter/${occasionId}`,
           {
             headers: { Authorization: `Bearer ${getAuthToken()}` },
           }
         );
         if (!response.ok) throw new Error('Failed to fetch meter');
         return response.json() as Promise<BudgetMeterDTO>;
       },
       staleTime: 5 * 60 * 1000, // 5 minutes
       refetchOnWindowFocus: true,
     });

     // Subscribe to WebSocket updates
     useEffect(() => {
       const unsubscribe = subscribe(`list-items:family-${getFamilyId()}`, (event) => {
         if (event.event === 'UPDATED' || event.event === 'STATUS_CHANGED') {
           // Invalidate cache to trigger refetch
           queryClient.invalidateQueries({
             queryKey: ['budget-meter', occasionId],
           });
         }
       });

       return unsubscribe;
     }, [occasionId, queryClient, subscribe]);

     return query;
   }
   ```
3. Integrate with WebSocket for real-time updates
4. Use React Query for caching and refetch management
5. Expose loading, error, and data states

---

#### BUDGET-INTEG-002: Occasion detail integration

**Instructions for frontend-developer**:

1. Modify file: `apps/web/components/occasions/OccasionDetail.tsx`
2. Add meter display:
   ```typescript
   import { useBudgetMeter } from '@/hooks/useBudgetMeter';
   import { BudgetMeterComponent } from '@/components/budget/BudgetMeterComponent';

   export const OccasionDetail: React.FC<{ occasionId: number }> = ({ occasionId }) => {
     const { data: budgetData, isLoading } = useBudgetMeter(occasionId);

     return (
       <div className="space-y-6">
         {/* Occasion info */}
         <section>
           <h2>{occasion.name}</h2>
           <p>{occasion.date}</p>
         </section>

         {/* Budget meter - if budget set */}
         {budgetData?.total_budget !== null && (
           <section className="bg-blue-50 p-4 rounded-lg">
             <h3 className="font-semibold mb-3">Budget Status</h3>
             <BudgetMeterComponent
               budgetData={budgetData}
               isLoading={isLoading}
             />
           </section>
         )}

         {/* Occasion lists, gifts, etc. */}
         ...
       </div>
     );
   };
   ```
3. Position meter prominently (after occasion info)
4. Only show if budget is set
5. Mobile-responsive layout

---

#### BUDGET-INTEG-003: Dashboard integration

**Instructions for frontend-developer**:

1. Modify file: `apps/web/components/dashboard/Dashboard.tsx`
2. Add meter for upcoming occasion:
   ```typescript
   import { useBudgetMeter } from '@/hooks/useBudgetMeter';
   import { BudgetMeterComponent } from '@/components/budget/BudgetMeterComponent';

   export const Dashboard: React.FC = () => {
     const upcomingOccasion = getUpcomingOccasion(); // Existing logic
     const { data: budgetData } = useBudgetMeter(upcomingOccasion?.id);

     return (
       <div className="space-y-6">
         {/* Budget status for upcoming occasion */}
         {upcomingOccasion && budgetData?.total_budget !== null && (
           <section className="bg-white p-6 rounded-lg border">
             <h2 className="text-lg font-semibold mb-4">
               {upcomingOccasion.name} Budget
             </h2>
             <BudgetMeterComponent
               budgetData={budgetData}
               onSegmentClick={(segment) => {
                 // Navigate to occasion detail or filtered view
                 navigate(`/occasions/${upcomingOccasion.id}?filter=${segment}`);
               }}
             />
           </section>
         )}

         {/* Idea inbox */}
         <section>...</section>
       </div>
     );
   };
   ```
3. Only show if occasion has budget
4. Position above Idea Inbox
5. Clickable segments navigate to occasion detail

---

#### BUDGET-INTEG-004: Gift form integration

**Instructions for frontend-developer**:

1. Modify file: `apps/web/components/gifts/ManualGiftForm.tsx`
2. Add budget context sidebar:
   ```typescript
   import { useBudgetMeter } from '@/hooks/useBudgetMeter';

   export const ManualGiftForm: React.FC<{ occasionId: number }> = ({ occasionId }) => {
     const { data: budgetData } = useBudgetMeter(occasionId);
     const [giftPrice, setGiftPrice] = useState<number>(0);

     const remainingBudget = budgetData?.remaining ?? null;
     const projectedRemaining = remainingBudget ? remainingBudget - giftPrice : null;

     return (
       <form className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Form fields - left column */}
         <div className="lg:col-span-2 space-y-4">
           <Input
             label="Gift name"
             value={giftName}
             onChange={setGiftName}
           />

           <Input
             label="Estimated price"
             type="number"
             value={giftPrice}
             onChange={setGiftPrice}
           />

           <select label="Recipient" value={selectedPerson} onChange={setSelectedPerson} />

           <Submit>Add Gift</Submit>
         </div>

         {/* Budget context - right sidebar */}
         <aside className="lg:col-span-1">
           <div className="bg-gray-50 p-4 rounded-lg sticky top-4">
             <h3 className="font-semibold text-sm mb-3">Budget Info</h3>

             {budgetData?.total_budget ? (
               <>
                 <div className="space-y-2 text-sm">
                   <div className="flex justify-between">
                     <span className="text-gray-600">Total budget:</span>
                     <span className="font-semibold">
                       ${budgetData.total_budget.toFixed(2)}
                     </span>
                   </div>

                   <div className="flex justify-between">
                     <span className="text-gray-600">Currently spent:</span>
                     <span className="font-semibold text-green-600">
                       ${(budgetData.purchased + budgetData.planned).toFixed(2)}
                     </span>
                   </div>

                   <hr className="my-2" />

                   <div className="flex justify-between">
                     <span className="text-gray-600">Remaining:</span>
                     <span className="font-semibold text-blue-600">
                       ${remainingBudget?.toFixed(2)}
                     </span>
                   </div>

                   {projectedRemaining !== null && giftPrice > 0 && (
                     <div className="flex justify-between">
                       <span className="text-gray-600">After this gift:</span>
                       <span className={`font-semibold ${
                         projectedRemaining < 0 ? 'text-red-600' : 'text-blue-600'
                       }`}>
                         ${projectedRemaining.toFixed(2)}
                       </span>
                     </div>
                   )}
                 </div>

                 {/* Warning if over budget */}
                 {projectedRemaining !== null && projectedRemaining < 0 && (
                   <BudgetWarningCard
                     warning={{
                       has_warning: true,
                       severity: 'exceeding',
                       message: `This gift would exceed budget by $${Math.abs(projectedRemaining).toFixed(2)}`,
                     }}
                   />
                 )}
               </>
             ) : (
               <p className="text-gray-500 text-sm">No budget set for this occasion</p>
             )}
           </div>
         </aside>
       </form>
     );
   };
   ```
3. Show real-time remaining budget as user enters price
4. Display warnings if price would exceed budget
5. Show sub-budget context if recipient assigned

---

#### BUDGET-INTEG-005: List/Kanban integration

**Instructions for frontend-developer**:

1. Modify file: `apps/web/components/lists/KanbanBoard.tsx`
2. Add column totals:
   ```typescript
   import { useBudgetMeter } from '@/hooks/useBudgetMeter';

   // In KanbanColumn component
   <div className="mb-4 p-3 bg-gray-50 rounded text-sm font-medium text-gray-700">
     {columnName}: ${columnTotal.toFixed(2)}
   </div>
   ```

3. Modify file: `apps/web/components/lists/ListView.tsx`
4. Add header totals:
   ```typescript
   <div className="flex justify-between items-center mb-4 p-4 bg-gray-50 rounded">
     <span>Total for this list:</span>
     <span className="font-semibold">
       ${listTotal.toFixed(2)} / ${occasionBudget.toFixed(2)}
     </span>
   </div>
   ```

---

#### BUDGET-INTEG-006: WebSocket invalidation

**Instructions for frontend-developer**:

1. Integrate with existing WebSocket listener in app
2. When list item is updated/status changed:
   ```typescript
   // In existing WebSocket listener or hook
   if (event.topic === `list-items:family-${familyId}`) {
     if (event.event === 'UPDATED' || event.event === 'STATUS_CHANGED') {
       // Invalidate budget meter queries
       const occasionId = getOccasionIdFromListItem(event.data);
       queryClient.invalidateQueries({
         queryKey: ['budget-meter', occasionId],
       });
     }
   }
   ```
3. Ensure cache invalidation happens before re-render
4. Test with multiple users simultaneously

---

### Quality Gates for Phase 6

- [ ] useBudgetMeter hook working with React Query
- [ ] WebSocket invalidation triggering refetches
- [ ] Meter displays on occasion detail
- [ ] Meter displays on dashboard for upcoming occasion
- [ ] Budget context shows in gift form
- [ ] Warnings display non-blocking in form
- [ ] List/Kanban totals calculating and displaying
- [ ] Mobile responsive on all integration points
- [ ] Real-time updates visible within 500ms
- [ ] All components load correctly from server

---

**End of Phase 4-6 Detailed Plan**

**Total Lines**: 800+
**Next**: Review Phase 7-8 for testing and documentation

