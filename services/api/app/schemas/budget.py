"""Budget DTOs for budget tracking and progression meters."""

from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.base import BaseSchema


class BudgetMeterDTO(BaseSchema):
    """Budget meter data for frontend display."""

    budget_total: Decimal | None = Field(
        None,
        description="Total budget for the occasion (None if not set)",
    )
    purchased_amount: Decimal = Field(
        default=Decimal("0"),
        description="Total amount spent on purchased items",
    )
    planned_amount: Decimal = Field(
        default=Decimal("0"),
        description="Total amount for reserved/planned items",
    )
    remaining_amount: Decimal | None = Field(
        None,
        description="Remaining budget (None if no budget set)",
    )

    # Calculated percentages (for progress bar display)
    purchased_percent: float = Field(
        default=0.0,
        ge=0.0,
        description="Percentage of budget that's been purchased",
    )
    planned_percent: float = Field(
        default=0.0,
        ge=0.0,
        description="Percentage of budget that's planned/reserved",
    )
    remaining_percent: float = Field(
        default=100.0,
        ge=0.0,
        description="Percentage of budget remaining",
    )

    # Status flags
    is_over_budget: bool = Field(
        default=False,
        description="True if total committed exceeds budget",
    )
    has_budget: bool = Field(
        default=False,
        description="True if a budget is set for this occasion",
    )


class BudgetWarningDTO(BaseModel):
    """Warning information when approaching or exceeding budget."""

    level: str = Field(
        ...,
        description="Warning level: 'none', 'approaching', 'near_limit', 'exceeded'",
    )
    message: str = Field(
        ...,
        description="Human-readable warning message",
    )
    threshold_percent: float = Field(
        ...,
        description="The threshold percentage that triggered this warning",
    )
    current_percent: float = Field(
        ...,
        description="Current usage percentage",
    )


class EntityBudgetDTO(BaseSchema):
    """Budget information for a specific entity (gift or list)."""

    entity_type: str = Field(
        ...,
        description="'gift' or 'list'",
    )
    entity_id: int = Field(
        ...,
        description="ID of the gift or list",
    )
    budget_amount: Decimal | None = Field(
        None,
        description="Allocated budget (None if not set)",
    )
    spent_amount: Decimal = Field(
        default=Decimal("0"),
        description="Amount spent on this entity",
    )
    remaining_amount: Decimal | None = Field(
        None,
        description="Remaining budget (None if no budget set)",
    )
    is_over_budget: bool = Field(
        default=False,
        description="True if spent exceeds allocated budget",
    )


class SetBudgetRequest(BaseModel):
    """Request to set/update a budget."""

    budget_amount: Decimal = Field(
        ...,
        gt=0,
        description="Budget amount (must be positive)",
    )


class SetEntityBudgetRequest(BaseModel):
    """Request to set/update an entity budget."""

    entity_type: str = Field(
        ...,
        description="'gift' or 'list'",
    )
    entity_id: int = Field(
        ...,
        description="ID of the gift or list",
    )
    budget_amount: Decimal = Field(
        ...,
        gt=0,
        description="Budget amount (must be positive)",
    )
