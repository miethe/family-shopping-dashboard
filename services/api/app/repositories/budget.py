"""Budget repository for managing budget-related queries."""

from decimal import Decimal

from sqlalchemy import and_, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entity_budget import EntityBudget
from app.models.list import List
from app.models.list_item import ListItem, ListItemStatus
from app.models.occasion import Occasion


class BudgetRepository:
    """
    Repository for budget-related database queries.

    Provides methods for:
    - Getting and setting occasion-level budgets
    - Managing entity-level budgets (gifts and lists)
    - Querying budget allocations within occasions

    Example:
        ```python
        repo = BudgetRepository(session)

        # Get occasion budget
        budget = await repo.get_occasion_budget(occasion_id=123)

        # Set entity budget
        entity_budget = await repo.set_entity_budget(
            occasion_id=123,
            entity_type="gift",
            entity_id=456,
            budget_amount=Decimal("150.00")
        )
        ```
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            session: SQLAlchemy async session
        """
        self.session = session

    async def get_occasion_budget(self, occasion_id: int) -> Decimal | None:
        """
        Get the total budget for an occasion.

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            Total budget amount as Decimal, or None if occasion not found
            or budget not set

        Example:
            ```python
            budget = await repo.get_occasion_budget(123)
            if budget:
                print(f"Total budget: ${budget}")
            ```
        """
        stmt = select(Occasion.budget_total).where(Occasion.id == occasion_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def set_occasion_budget(
        self, occasion_id: int, budget_total: Decimal
    ) -> bool:
        """
        Set the budget for an occasion.

        Updates the budget_total field on the Occasion model.

        Args:
            occasion_id: Primary key of the occasion
            budget_total: New budget amount

        Returns:
            True if occasion was found and updated, False if not found

        Example:
            ```python
            success = await repo.set_occasion_budget(123, Decimal("500.00"))
            if success:
                print("Budget updated successfully")
            ```
        """
        stmt = select(Occasion).where(Occasion.id == occasion_id)
        result = await self.session.execute(stmt)
        occasion = result.scalar_one_or_none()

        if occasion is None:
            return False

        occasion.budget_total = budget_total
        await self.session.commit()
        return True

    async def get_entity_budget(
        self, occasion_id: int, entity_type: str, entity_id: int
    ) -> Decimal | None:
        """
        Get budget for a specific entity (gift or list) within an occasion.

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")
            entity_id: Primary key of the gift or list

        Returns:
            Budget amount as Decimal, or None if entity budget not found

        Example:
            ```python
            gift_budget = await repo.get_entity_budget(
                occasion_id=123,
                entity_type="gift",
                entity_id=456
            )
            ```
        """
        stmt = select(EntityBudget.budget_amount).where(
            EntityBudget.occasion_id == occasion_id,
            EntityBudget.entity_type == entity_type,
            EntityBudget.entity_id == entity_id,
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def set_entity_budget(
        self,
        occasion_id: int,
        entity_type: str,
        entity_id: int,
        budget_amount: Decimal,
    ) -> EntityBudget:
        """
        Set or update budget for an entity. Creates if not exists.

        Uses the unique constraint on (occasion_id, entity_type, entity_id)
        to ensure only one budget per entity.

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")
            entity_id: Primary key of the gift or list
            budget_amount: Budget amount to allocate

        Returns:
            EntityBudget ORM model instance (created or updated)

        Example:
            ```python
            entity_budget = await repo.set_entity_budget(
                occasion_id=123,
                entity_type="gift",
                entity_id=456,
                budget_amount=Decimal("150.00")
            )
            print(f"Budget ID: {entity_budget.id}")
            ```

        Note:
            If an entity budget already exists, it will be updated.
            Otherwise, a new EntityBudget record is created.
        """
        # Check if entity budget already exists
        stmt = select(EntityBudget).where(
            EntityBudget.occasion_id == occasion_id,
            EntityBudget.entity_type == entity_type,
            EntityBudget.entity_id == entity_id,
        )
        result = await self.session.execute(stmt)
        existing = result.scalar_one_or_none()

        if existing:
            # Update existing budget
            existing.budget_amount = budget_amount
            await self.session.commit()
            await self.session.refresh(existing)
            return existing
        else:
            # Create new entity budget
            entity_budget = EntityBudget(
                occasion_id=occasion_id,
                entity_type=entity_type,
                entity_id=entity_id,
                budget_amount=budget_amount,
            )
            self.session.add(entity_budget)
            await self.session.commit()
            await self.session.refresh(entity_budget)
            return entity_budget

    async def get_all_entity_budgets(self, occasion_id: int) -> list[EntityBudget]:
        """
        Get all entity budgets for an occasion.

        Retrieves all EntityBudget records (gifts and lists) associated
        with the given occasion.

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            List of EntityBudget ORM model instances

        Example:
            ```python
            budgets = await repo.get_all_entity_budgets(123)
            for budget in budgets:
                print(f"{budget.entity_type} {budget.entity_id}: ${budget.budget_amount}")
            ```

        Note:
            Returns empty list if no entity budgets exist for the occasion.
        """
        stmt = select(EntityBudget).where(EntityBudget.occasion_id == occasion_id)
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def get_purchased_amount(self, occasion_id: int) -> Decimal:
        """
        Calculate total spent on purchased items for an occasion.

        Sums the total cost (effective_price * quantity) of all list items
        with status='purchased' that belong to lists associated with the occasion.

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            Total purchased amount as Decimal (0.00 if no purchased items)

        Example:
            ```python
            purchased = await repo.get_purchased_amount(123)
            print(f"Total purchased: ${purchased}")
            ```

        Note:
            Uses COALESCE to handle discount_price fallback to price.
            Returns Decimal("0.00") if no items found.
        """
        # Calculate effective_price: COALESCE(discount_price, price)
        effective_price = func.coalesce(ListItem.discount_price, ListItem.price)
        total_cost = effective_price * ListItem.quantity

        # Join ListItem -> List -> Occasion, filter by status
        stmt = (
            select(func.coalesce(func.sum(total_cost), Decimal("0.00")))
            .select_from(ListItem)
            .join(List, ListItem.list_id == List.id)
            .where(
                and_(
                    List.occasion_id == occasion_id,
                    ListItem.status == ListItemStatus.purchased,
                )
            )
        )

        result = await self.session.execute(stmt)
        return result.scalar_one() or Decimal("0.00")

    async def get_planned_amount(self, occasion_id: int) -> Decimal:
        """
        Calculate total planned spending (reserved but not purchased).

        Sums the total cost (effective_price * quantity) of all list items
        with status='selected' that belong to lists associated with the occasion.

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            Total planned amount as Decimal (0.00 if no reserved items)

        Example:
            ```python
            planned = await repo.get_planned_amount(123)
            print(f"Total planned: ${planned}")
            ```

        Note:
            Uses COALESCE to handle discount_price fallback to price.
            Returns Decimal("0.00") if no items found.
        """
        # Calculate effective_price: COALESCE(discount_price, price)
        effective_price = func.coalesce(ListItem.discount_price, ListItem.price)
        total_cost = effective_price * ListItem.quantity

        # Join ListItem -> List -> Occasion, filter by status
        stmt = (
            select(func.coalesce(func.sum(total_cost), Decimal("0.00")))
            .select_from(ListItem)
            .join(List, ListItem.list_id == List.id)
            .where(
                and_(
                    List.occasion_id == occasion_id,
                    ListItem.status == ListItemStatus.selected,
                )
            )
        )

        result = await self.session.execute(stmt)
        return result.scalar_one() or Decimal("0.00")

    async def get_total_committed(self, occasion_id: int) -> Decimal:
        """
        Calculate total committed spending (purchased + reserved).

        Sums the total cost (effective_price * quantity) of all list items
        with status in ('purchased', 'selected') that belong to lists
        associated with the occasion.

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            Total committed amount as Decimal (0.00 if no committed items)

        Example:
            ```python
            committed = await repo.get_total_committed(123)
            print(f"Total committed: ${committed}")
            ```

        Note:
            Uses COALESCE to handle discount_price fallback to price.
            Returns Decimal("0.00") if no items found.
        """
        # Calculate effective_price: COALESCE(discount_price, price)
        effective_price = func.coalesce(ListItem.discount_price, ListItem.price)
        total_cost = effective_price * ListItem.quantity

        # Join ListItem -> List -> Occasion, filter by status
        stmt = (
            select(func.coalesce(func.sum(total_cost), Decimal("0.00")))
            .select_from(ListItem)
            .join(List, ListItem.list_id == List.id)
            .where(
                and_(
                    List.occasion_id == occasion_id,
                    ListItem.status.in_(
                        [ListItemStatus.purchased, ListItemStatus.selected]
                    ),
                )
            )
        )

        result = await self.session.execute(stmt)
        return result.scalar_one() or Decimal("0.00")

    async def get_remaining_budget(self, occasion_id: int) -> Decimal | None:
        """
        Calculate remaining budget for an occasion.

        Computes: budget_total - total_committed (purchased + reserved).

        Args:
            occasion_id: Primary key of the occasion

        Returns:
            Remaining budget as Decimal, or None if no budget is set

        Example:
            ```python
            remaining = await repo.get_remaining_budget(123)
            if remaining is not None:
                print(f"Remaining budget: ${remaining}")
            else:
                print("No budget set")
            ```

        Note:
            Returns None if the occasion has no budget_total set.
            May return negative value if over budget.
        """
        # Get occasion budget
        budget_total = await self.get_occasion_budget(occasion_id)

        if budget_total is None:
            return None

        # Get total committed amount
        total_committed = await self.get_total_committed(occasion_id)

        return budget_total - total_committed

    async def get_entity_spent(
        self, occasion_id: int, entity_type: str, entity_id: int
    ) -> Decimal:
        """
        Calculate amount spent on a specific entity (gift or list).

        For entity_type='list': Sum all purchased items in that list
        For entity_type='gift': Sum all purchased items for that gift across lists

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")
            entity_id: Primary key of the gift or list

        Returns:
            Total spent amount as Decimal (returns Decimal("0") if nothing spent)

        Example:
            ```python
            spent = await repo.get_entity_spent(
                occasion_id=123,
                entity_type="list",
                entity_id=456
            )
            print(f"Spent on list: ${spent}")
            ```

        Note:
            Only includes items with status='purchased'.
            Uses effective_price pattern: COALESCE(discount_price, price) * quantity
        """
        # Calculate effective_price: COALESCE(discount_price, price)
        effective_price = func.coalesce(ListItem.discount_price, ListItem.price)
        total_cost = effective_price * ListItem.quantity

        # Build query based on entity type
        if entity_type == "list":
            # Sum all purchased items in the specified list
            stmt = select(
                func.coalesce(func.sum(total_cost), Decimal("0"))
            ).where(
                and_(
                    ListItem.list_id == entity_id,
                    ListItem.status == ListItemStatus.purchased,
                )
            )
        elif entity_type == "gift":
            # Sum all purchased items for the specified gift across all lists
            # Join with lists to filter by occasion_id
            stmt = (
                select(func.coalesce(func.sum(total_cost), Decimal("0")))
                .select_from(ListItem)
                .join(List, ListItem.list_id == List.id)
                .where(
                    and_(
                        ListItem.gift_id == entity_id,
                        ListItem.status == ListItemStatus.purchased,
                        List.occasion_id == occasion_id,
                    )
                )
            )
        else:
            # Invalid entity type, return 0
            return Decimal("0")

        result = await self.session.execute(stmt)
        # scalar_one() is guaranteed to return Decimal due to func.coalesce()
        return result.scalar_one()  # type: ignore[return-value]

    async def get_entity_budget_status(
        self, occasion_id: int, entity_type: str, entity_id: int
    ) -> dict:
        """
        Get complete budget status for an entity.

        Combines budget allocation and actual spending to provide a
        comprehensive status view.

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")
            entity_id: Primary key of the gift or list

        Returns:
            Dictionary with:
            - budget: Decimal | None - Allocated budget from entity_budgets
            - spent: Decimal - Total spent (purchased items)
            - remaining: Decimal | None - budget - spent (None if no budget)
            - over_budget: bool - True if spent > budget

        Example:
            ```python
            status = await repo.get_entity_budget_status(
                occasion_id=123,
                entity_type="gift",
                entity_id=456
            )
            print(f"Budget: ${status['budget']}")
            print(f"Spent: ${status['spent']}")
            print(f"Remaining: ${status['remaining']}")
            print(f"Over budget: {status['over_budget']}")
            ```

        Note:
            If no budget is allocated, budget and remaining will be None,
            but over_budget will be False.
        """
        # Get the allocated budget
        budget = await self.get_entity_budget(occasion_id, entity_type, entity_id)

        # Get the amount spent
        spent = await self.get_entity_spent(occasion_id, entity_type, entity_id)

        # Calculate remaining and over_budget status
        remaining = None
        over_budget = False

        if budget is not None:
            remaining = budget - spent
            over_budget = spent > budget

        return {
            "budget": budget,
            "spent": spent,
            "remaining": remaining,
            "over_budget": over_budget,
        }

    async def delete_entity_budget(
        self, occasion_id: int, entity_type: str, entity_id: int
    ) -> bool:
        """
        Delete an entity budget allocation.

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")
            entity_id: Primary key of the gift or list

        Returns:
            True if entity budget was found and deleted, False if not found

        Example:
            ```python
            deleted = await repo.delete_entity_budget(
                occasion_id=123,
                entity_type="gift",
                entity_id=456
            )
            if deleted:
                print("Budget allocation removed")
            else:
                print("No budget allocation found")
            ```

        Note:
            This is a hard delete operation. The budget allocation record
            will be permanently removed from the database.
        """
        # Find the entity budget
        stmt = select(EntityBudget).where(
            EntityBudget.occasion_id == occasion_id,
            EntityBudget.entity_type == entity_type,
            EntityBudget.entity_id == entity_id,
        )
        result = await self.session.execute(stmt)
        entity_budget = result.scalar_one_or_none()

        if entity_budget is None:
            return False

        # Delete the entity budget
        await self.session.delete(entity_budget)
        await self.session.commit()
        return True

    async def get_budgets_by_entity_type(
        self, occasion_id: int, entity_type: str
    ) -> list[EntityBudget]:
        """
        Get all budgets for a specific entity type within an occasion.

        Args:
            occasion_id: Primary key of the occasion
            entity_type: Type of entity ("gift" or "list")

        Returns:
            List of EntityBudget ORM model instances matching the entity type

        Example:
            ```python
            # Get all list budgets for Christmas 2024
            list_budgets = await repo.get_budgets_by_entity_type(
                occasion_id=123,
                entity_type="list"
            )
            for budget in list_budgets:
                print(f"List {budget.entity_id}: ${budget.budget_amount}")
            ```

        Note:
            Returns empty list if no budgets exist for the specified
            entity type in the occasion.
        """
        stmt = select(EntityBudget).where(
            EntityBudget.occasion_id == occasion_id,
            EntityBudget.entity_type == entity_type,
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())
