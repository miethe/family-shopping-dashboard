"""Budget API routes for budget tracking and progression meters."""

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import get_current_user, get_db
from app.core.exceptions import NotFoundError
from app.schemas.budget import (
    BudgetMeterDTO,
    BudgetWarningDTO,
    EntityBudgetDTO,
    SetBudgetRequest,
    SetEntityBudgetRequest,
)
from app.services.budget import BudgetService

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get(
    "/occasions/{occasion_id}/meter",
    response_model=BudgetMeterDTO,
    status_code=status.HTTP_200_OK,
    summary="Get budget meter for occasion",
    description="Returns budget breakdown with purchased, planned, remaining amounts",
)
async def get_budget_meter(
    occasion_id: int,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BudgetMeterDTO:
    """
    Get budget meter for an occasion.

    Calculates and returns comprehensive budget information including:
    - Total budget amount (if set)
    - Purchased amount (items with status 'purchased')
    - Planned amount (items with status 'reserved' or 'planned')
    - Remaining amount
    - Progress percentages for visualization
    - Over-budget status flag

    Args:
        occasion_id: Occasion ID to get budget meter for
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        BudgetMeterDTO with budget breakdown and progress data

    Raises:
        HTTPException: 404 if occasion not found

    Example:
        ```json
        GET /budgets/occasions/1/meter
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "budget_total": 1000.00,
            "purchased_amount": 450.00,
            "planned_amount": 300.00,
            "remaining_amount": 250.00,
            "purchased_percent": 45.0,
            "planned_percent": 30.0,
            "remaining_percent": 25.0,
            "is_over_budget": false,
            "has_budget": true
        }
        ```

    Note:
        - Requires Bearer token in Authorization header
        - If no budget is set, budget_total and remaining_amount will be null
        - Percentages are calculated against total budget (0-100+)
    """
    service = BudgetService(session)
    return await service.get_budget_meter(occasion_id)


@router.post(
    "/occasions/{occasion_id}",
    response_model=BudgetMeterDTO,
    status_code=status.HTTP_200_OK,
    summary="Set or update occasion budget",
    description="Sets the total budget for an occasion and returns updated budget meter",
)
async def set_occasion_budget(
    occasion_id: int,
    data: SetBudgetRequest,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BudgetMeterDTO:
    """
    Set or update the total budget for an occasion.

    Creates or updates the budget_total for the specified occasion.
    Returns the updated budget meter with recalculated progress.

    Args:
        occasion_id: Occasion ID to set budget for
        data: Budget amount (must be positive decimal)
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        BudgetMeterDTO with updated budget breakdown

    Raises:
        HTTPException: 404 if occasion not found
        HTTPException: 422 if budget_amount is not positive

    Example:
        ```json
        POST /budgets/occasions/1
        Headers: Authorization: Bearer eyJhbGc...
        Content-Type: application/json

        Request:
        {
            "budget_amount": 1000.00
        }

        Response 200:
        {
            "budget_total": 1000.00,
            "purchased_amount": 0.00,
            "planned_amount": 0.00,
            "remaining_amount": 1000.00,
            "purchased_percent": 0.0,
            "planned_percent": 0.0,
            "remaining_percent": 100.0,
            "is_over_budget": false,
            "has_budget": true
        }
        ```

    Note:
        - Requires Bearer token in Authorization header
        - Budget amount must be positive (validated by Pydantic)
        - Updates existing budget if one is already set
    """
    service = BudgetService(session)
    return await service.set_occasion_budget(occasion_id, data.budget_amount)


@router.get(
    "/occasions/{occasion_id}/warning",
    response_model=BudgetWarningDTO,
    status_code=status.HTTP_200_OK,
    summary="Get budget warning status",
    description="Returns warning information if approaching or exceeding budget threshold",
)
async def get_budget_warning(
    occasion_id: int,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> BudgetWarningDTO:
    """
    Get budget warning information for an occasion.

    Calculates warning level based on budget usage thresholds:
    - 'none': Below 75% of budget
    - 'approaching': 75-89% of budget
    - 'near_limit': 90-100% of budget
    - 'exceeded': Over 100% of budget

    Args:
        occasion_id: Occasion ID to check warning status for
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        BudgetWarningDTO with warning level, message, and percentage data

    Raises:
        HTTPException: 404 if occasion not found

    Example:
        ```json
        GET /budgets/occasions/1/warning
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "level": "approaching",
            "message": "You've spent 80% of your budget",
            "threshold_percent": 75.0,
            "current_percent": 80.0
        }
        ```

    Note:
        - Requires Bearer token in Authorization header
        - If no budget is set, returns 'none' level
        - Warning is based on total committed (purchased + planned)
    """
    service = BudgetService(session)
    return await service.get_budget_warning(occasion_id)


@router.get(
    "/occasions/{occasion_id}/entities",
    response_model=list[EntityBudgetDTO],
    status_code=status.HTTP_200_OK,
    summary="Get all entity budgets for occasion",
    description="Returns budget information for all gifts and lists within an occasion",
)
async def get_all_entity_budgets(
    occasion_id: int,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> list[EntityBudgetDTO]:
    """
    Get budget information for all entities in an occasion.

    Returns a list of all gift and list budgets that have been explicitly set
    for the specified occasion.

    Args:
        occasion_id: Occasion ID to get entity budgets for
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        List of EntityBudgetDTO with budget details for each entity

    Raises:
        HTTPException: 404 if occasion not found

    Example:
        ```json
        GET /budgets/occasions/1/entities
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        [
            {
                "entity_type": "gift",
                "entity_id": 10,
                "budget_amount": 150.00,
                "spent_amount": 120.00,
                "remaining_amount": 30.00,
                "is_over_budget": false
            },
            {
                "entity_type": "list",
                "entity_id": 5,
                "budget_amount": 500.00,
                "spent_amount": 520.00,
                "remaining_amount": -20.00,
                "is_over_budget": true
            }
        ]
        ```

    Note:
        - Requires Bearer token in Authorization header
        - Only returns entities with explicitly set budgets
        - Empty list if no entity budgets are set
    """
    service = BudgetService(session)
    return await service.get_all_entity_budgets(occasion_id)


@router.post(
    "/occasions/{occasion_id}/entities",
    response_model=EntityBudgetDTO,
    status_code=status.HTTP_201_CREATED,
    summary="Set entity budget",
    description="Sets or updates budget for a specific gift or list",
)
async def set_entity_budget(
    occasion_id: int,
    data: SetEntityBudgetRequest,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> EntityBudgetDTO:
    """
    Set or update budget for a specific entity (gift or list).

    Creates or updates a budget allocation for a gift or list within an occasion.
    This allows tracking budgets at a more granular level than just occasion-level.

    Args:
        occasion_id: Occasion ID that the entity belongs to
        data: Entity budget request (type, id, amount)
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        EntityBudgetDTO with created/updated budget information

    Raises:
        HTTPException: 404 if occasion or entity not found
        HTTPException: 422 if entity_type is not 'gift' or 'list'

    Example:
        ```json
        POST /budgets/occasions/1/entities
        Headers: Authorization: Bearer eyJhbGc...
        Content-Type: application/json

        Request:
        {
            "entity_type": "gift",
            "entity_id": 10,
            "budget_amount": 150.00
        }

        Response 201:
        {
            "entity_type": "gift",
            "entity_id": 10,
            "budget_amount": 150.00,
            "spent_amount": 0.00,
            "remaining_amount": 150.00,
            "is_over_budget": false
        }
        ```

    Note:
        - Requires Bearer token in Authorization header
        - Entity must belong to the specified occasion
        - Budget amount must be positive (validated by Pydantic)
        - Updates existing budget if one is already set
    """
    service = BudgetService(session)
    return await service.set_entity_budget(
        occasion_id=occasion_id,
        entity_type=data.entity_type,
        entity_id=data.entity_id,
        budget_amount=data.budget_amount,
    )


@router.get(
    "/occasions/{occasion_id}/entities/{entity_type}/{entity_id}",
    response_model=EntityBudgetDTO,
    status_code=status.HTTP_200_OK,
    summary="Get entity budget",
    description="Returns budget information for a specific gift or list",
)
async def get_entity_budget(
    occasion_id: int,
    entity_type: str,
    entity_id: int,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> EntityBudgetDTO:
    """
    Get budget information for a specific entity.

    Retrieves budget details for a single gift or list within an occasion.

    Args:
        occasion_id: Occasion ID that the entity belongs to
        entity_type: Type of entity ('gift' or 'list')
        entity_id: ID of the specific entity
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        EntityBudgetDTO with budget details

    Raises:
        HTTPException: 404 if occasion, entity, or budget not found

    Example:
        ```json
        GET /budgets/occasions/1/entities/gift/10
        Headers: Authorization: Bearer eyJhbGc...

        Response 200:
        {
            "entity_type": "gift",
            "entity_id": 10,
            "budget_amount": 150.00,
            "spent_amount": 120.00,
            "remaining_amount": 30.00,
            "is_over_budget": false
        }
        ```

    Note:
        - Requires Bearer token in Authorization header
        - Returns 404 if no budget has been set for this entity
        - Entity must belong to the specified occasion
    """
    service = BudgetService(session)
    entity_budget = await service.get_entity_budget(occasion_id, entity_type, entity_id)

    if entity_budget is None:
        raise NotFoundError(
            code="ENTITY_BUDGET_NOT_FOUND",
            message=f"Budget for {entity_type} {entity_id} in occasion {occasion_id} not found",
        )

    return entity_budget


@router.delete(
    "/occasions/{occasion_id}/entities/{entity_type}/{entity_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete entity budget",
    description="Removes budget allocation for a specific gift or list",
)
async def delete_entity_budget(
    occasion_id: int,
    entity_type: str,
    entity_id: int,
    user_id: int = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> None:
    """
    Delete budget allocation for a specific entity.

    Removes the budget setting for a gift or list. The entity itself is not deleted,
    only its budget allocation.

    Args:
        occasion_id: Occasion ID that the entity belongs to
        entity_type: Type of entity ('gift' or 'list')
        entity_id: ID of the specific entity
        user_id: Authenticated user ID (from JWT, injected)
        session: Database session (injected)

    Returns:
        204 No Content (empty response body)

    Raises:
        HTTPException: 404 if budget not found

    Example:
        ```json
        DELETE /budgets/occasions/1/entities/gift/10
        Headers: Authorization: Bearer eyJhbGc...

        Response 204: (no content)
        ```

    Note:
        - Requires Bearer token in Authorization header
        - Returns 204 even if budget didn't exist (idempotent)
        - Does not delete the gift/list, only the budget allocation
    """
    service = BudgetService(session)
    deleted = await service.delete_entity_budget(occasion_id, entity_type, entity_id)

    if not deleted:
        raise NotFoundError(
            code="ENTITY_BUDGET_NOT_FOUND",
            message=f"Budget for {entity_type} {entity_id} in occasion {occasion_id} not found",
        )

    # 204 No Content - no response body needed
