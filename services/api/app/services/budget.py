"""Service layer for budget-related business logic."""

from decimal import Decimal

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.budget import BudgetRepository
from app.schemas.budget import (
    BudgetMeterDTO,
    BudgetWarningDTO,
    EntityBudgetDTO,
)


class BudgetService:
    """
    Service layer for budget-related business logic.

    Orchestrates budget calculations and returns DTOs.
    Delegates all database operations to BudgetRepository.

    Example:
        ```python
        service = BudgetService(db_session)

        # Get budget meter
        meter = await service.get_budget_meter(occasion_id=123)
        print(f"Budget: ${meter.budget_total}")
        print(f"Purchased: {meter.purchased_percent}%")

        # Set occasion budget
        success = await service.set_occasion_budget(123, Decimal("500.00"))

        # Get budget warning
        warning = await service.get_budget_warning(123)
        if warning.level != "none":
            print(f"Warning: {warning.message}")
        ```
    """

    # Warning thresholds (as percentages)
    WARNING_THRESHOLDS = {
        "approaching": 75.0,  # 75% - Yellow warning
        "near_limit": 90.0,  # 90% - Orange warning
        "exceeded": 100.0,  # 100%+ - Red warning
    }

    WARNING_MESSAGES = {
        "none": "Budget is on track",
        "approaching": "Approaching {percent:.0f}% of budget",
        "near_limit": "Near budget limit at {percent:.0f}%",
        "exceeded": "Budget exceeded by {amount:.2f}",
    }

    def __init__(self, db: AsyncSession):
        """
        Initialize service with database session.

        Args:
            db: SQLAlchemy async session
        """
        self.db = db
        self.repo = BudgetRepository(db)

    async def get_budget_meter(self, occasion_id: int) -> BudgetMeterDTO:
        """
        Get complete budget meter data for an occasion.

        Calculates:
        - Total budget, purchased, planned, remaining amounts
        - Percentages for progress bar display
        - Over-budget status

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            BudgetMeterDTO with complete budget breakdown

        Example:
            ```python
            meter = await service.get_budget_meter(123)
            if meter.is_over_budget:
                print("Warning: Over budget!")
            ```
        """
        # Get budget total
        budget_total = await self.repo.get_occasion_budget(occasion_id)

        # Get amounts
        purchased = await self.repo.get_purchased_amount(occasion_id)
        planned = await self.repo.get_planned_amount(occasion_id)
        committed = purchased + planned

        # Calculate remaining
        remaining = None
        if budget_total is not None:
            remaining = budget_total - committed

        # Calculate percentages (avoid division by zero)
        purchased_pct = 0.0
        planned_pct = 0.0
        remaining_pct = 100.0
        is_over_budget = False

        if budget_total and budget_total > 0:
            purchased_pct = float(purchased / budget_total * 100)
            planned_pct = float(planned / budget_total * 100)
            remaining_pct = (
                max(0.0, float(remaining / budget_total * 100)) if remaining else 0.0
            )
            is_over_budget = committed > budget_total

        return BudgetMeterDTO(
            budget_total=budget_total,
            purchased_amount=purchased,
            planned_amount=planned,
            remaining_amount=remaining,
            purchased_percent=purchased_pct,
            planned_percent=planned_pct,
            remaining_percent=remaining_pct,
            is_over_budget=is_over_budget,
            has_budget=budget_total is not None,
        )

    async def set_occasion_budget(self, occasion_id: int, amount: Decimal) -> bool:
        """
        Set the budget for an occasion.

        Args:
            occasion_id: Primary key of the occasion
            amount: Budget amount to set

        Returns:
            True if occasion was found and updated, False if not found

        Example:
            ```python
            success = await service.set_occasion_budget(123, Decimal("500.00"))
            if success:
                print("Budget updated successfully")
            ```
        """
        return await self.repo.set_occasion_budget(occasion_id, amount)

    async def get_entity_budget(
        self, occasion_id: int, entity_type: str, entity_id: int
    ) -> EntityBudgetDTO:
        """
        Get budget status for a specific entity (gift or list).

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")
            entity_id: Primary key of the gift or list

        Returns:
            EntityBudgetDTO with budget status

        Example:
            ```python
            budget = await service.get_entity_budget(123, "gift", 456)
            print(f"Gift budget: ${budget.budget_amount}")
            print(f"Spent: ${budget.spent_amount}")
            print(f"Remaining: ${budget.remaining_amount}")
            ```
        """
        status = await self.repo.get_entity_budget_status(
            occasion_id, entity_type, entity_id
        )

        return EntityBudgetDTO(
            entity_type=entity_type,
            entity_id=entity_id,
            budget_amount=status["budget"],
            spent_amount=status["spent"],
            remaining_amount=status["remaining"],
            is_over_budget=status["over_budget"],
        )

    async def set_entity_budget(
        self, occasion_id: int, entity_type: str, entity_id: int, amount: Decimal
    ) -> EntityBudgetDTO:
        """
        Set budget for a specific entity and return updated status.

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")
            entity_id: Primary key of the gift or list
            amount: Budget amount to allocate

        Returns:
            EntityBudgetDTO with updated budget status

        Example:
            ```python
            budget = await service.set_entity_budget(
                occasion_id=123,
                entity_type="gift",
                entity_id=456,
                amount=Decimal("150.00")
            )
            print(f"Budget set: ${budget.budget_amount}")
            ```
        """
        await self.repo.set_entity_budget(occasion_id, entity_type, entity_id, amount)
        return await self.get_entity_budget(occasion_id, entity_type, entity_id)

    async def delete_entity_budget(
        self, occasion_id: int, entity_type: str, entity_id: int
    ) -> bool:
        """
        Remove budget allocation for an entity.

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")
            entity_id: Primary key of the gift or list

        Returns:
            True if budget was found and deleted, False if not found

        Example:
            ```python
            deleted = await service.delete_entity_budget(123, "gift", 456)
            if deleted:
                print("Budget allocation removed")
            ```
        """
        return await self.repo.delete_entity_budget(
            occasion_id, entity_type, entity_id
        )

    async def get_all_entity_budgets(self, occasion_id: int) -> list[EntityBudgetDTO]:
        """
        Get all entity budgets for an occasion.

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            List of EntityBudgetDTO objects

        Example:
            ```python
            budgets = await service.get_all_entity_budgets(123)
            for budget in budgets:
                print(f"{budget.entity_type} {budget.entity_id}: ${budget.budget_amount}")
            ```
        """
        budgets = await self.repo.get_all_entity_budgets(occasion_id)
        result = []
        for budget in budgets:
            status = await self.repo.get_entity_budget_status(
                occasion_id, budget.entity_type, budget.entity_id
            )
            result.append(
                EntityBudgetDTO(
                    entity_type=budget.entity_type,
                    entity_id=budget.entity_id,
                    budget_amount=status["budget"],
                    spent_amount=status["spent"],
                    remaining_amount=status["remaining"],
                    is_over_budget=status["over_budget"],
                )
            )
        return result

    async def get_budget_warning(self, occasion_id: int) -> BudgetWarningDTO:
        """
        Get warning status for an occasion's budget.

        Returns warning level based on thresholds:
        - "none": Under 75% used
        - "approaching": 75-89% used
        - "near_limit": 90-99% used
        - "exceeded": 100%+ used (over budget)

        If no budget is set, returns "none" with appropriate message.

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            BudgetWarningDTO with warning level, message, and percentages

        Example:
            ```python
            warning = await service.get_budget_warning(123)
            if warning.level == "exceeded":
                print(f"Alert: {warning.message}")
            elif warning.level in ["approaching", "near_limit"]:
                print(f"Warning: {warning.message}")
            ```

        Note:
            Uses total committed spending (purchased + reserved items)
            against the occasion's budget_total.
        """
        budget_total = await self.repo.get_occasion_budget(occasion_id)

        # No budget set - no warning needed
        if budget_total is None or budget_total <= 0:
            return BudgetWarningDTO(
                level="none",
                message="No budget set for this occasion",
                threshold_percent=0.0,
                current_percent=0.0,
            )

        committed = await self.repo.get_total_committed(occasion_id)
        current_percent = float(committed / budget_total * 100)

        # Determine warning level
        if current_percent >= self.WARNING_THRESHOLDS["exceeded"]:
            over_amount = committed - budget_total
            return BudgetWarningDTO(
                level="exceeded",
                message=self.WARNING_MESSAGES["exceeded"].format(amount=over_amount),
                threshold_percent=self.WARNING_THRESHOLDS["exceeded"],
                current_percent=current_percent,
            )
        elif current_percent >= self.WARNING_THRESHOLDS["near_limit"]:
            return BudgetWarningDTO(
                level="near_limit",
                message=self.WARNING_MESSAGES["near_limit"].format(
                    percent=current_percent
                ),
                threshold_percent=self.WARNING_THRESHOLDS["near_limit"],
                current_percent=current_percent,
            )
        elif current_percent >= self.WARNING_THRESHOLDS["approaching"]:
            return BudgetWarningDTO(
                level="approaching",
                message=self.WARNING_MESSAGES["approaching"].format(
                    percent=current_percent
                ),
                threshold_percent=self.WARNING_THRESHOLDS["approaching"],
                current_percent=current_percent,
            )
        else:
            return BudgetWarningDTO(
                level="none",
                message=self.WARNING_MESSAGES["none"],
                threshold_percent=0.0,
                current_percent=current_percent,
            )

    async def get_entity_warning(
        self, occasion_id: int, entity_type: str, entity_id: int
    ) -> BudgetWarningDTO:
        """
        Get warning status for a specific entity's budget.

        Same threshold logic as occasion-level warnings.

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")
            entity_id: Primary key of the gift or list

        Returns:
            BudgetWarningDTO with warning level, message, and percentages

        Example:
            ```python
            warning = await service.get_entity_warning(
                occasion_id=123,
                entity_type="gift",
                entity_id=456
            )
            if warning.level != "none":
                print(f"Gift budget warning: {warning.message}")
            ```

        Note:
            Uses actual spent amount (purchased items only) against
            the entity's allocated budget from entity_budgets table.
        """
        budget = await self.repo.get_entity_budget(occasion_id, entity_type, entity_id)

        # No budget set for entity
        if budget is None or budget <= 0:
            return BudgetWarningDTO(
                level="none",
                message=f"No budget set for this {entity_type}",
                threshold_percent=0.0,
                current_percent=0.0,
            )

        spent = await self.repo.get_entity_spent(occasion_id, entity_type, entity_id)
        current_percent = float(spent / budget * 100)

        # Same threshold logic as occasion warnings
        if current_percent >= self.WARNING_THRESHOLDS["exceeded"]:
            over_amount = spent - budget
            return BudgetWarningDTO(
                level="exceeded",
                message=self.WARNING_MESSAGES["exceeded"].format(amount=over_amount),
                threshold_percent=self.WARNING_THRESHOLDS["exceeded"],
                current_percent=current_percent,
            )
        elif current_percent >= self.WARNING_THRESHOLDS["near_limit"]:
            return BudgetWarningDTO(
                level="near_limit",
                message=self.WARNING_MESSAGES["near_limit"].format(
                    percent=current_percent
                ),
                threshold_percent=self.WARNING_THRESHOLDS["near_limit"],
                current_percent=current_percent,
            )
        elif current_percent >= self.WARNING_THRESHOLDS["approaching"]:
            return BudgetWarningDTO(
                level="approaching",
                message=self.WARNING_MESSAGES["approaching"].format(
                    percent=current_percent
                ),
                threshold_percent=self.WARNING_THRESHOLDS["approaching"],
                current_percent=current_percent,
            )
        else:
            return BudgetWarningDTO(
                level="none",
                message=self.WARNING_MESSAGES["none"],
                threshold_percent=0.0,
                current_percent=current_percent,
            )
