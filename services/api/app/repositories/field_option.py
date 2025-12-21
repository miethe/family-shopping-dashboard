"""Repository for field option database operations."""

from sqlalchemy import and_, func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationError
from app.models.field_option import FieldOption


class FieldOptionRepository:
    """
    Repository for field option CRUD operations.

    Handles database access for dynamic dropdown options across entities.
    Uses SQLAlchemy 2.x async patterns with proper error handling.

    Attributes:
        session: SQLAlchemy async database session
    """

    def __init__(self, session: AsyncSession):
        """
        Initialize repository with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session

    async def create(
        self,
        data: dict,
        created_by: int | None = None
    ) -> FieldOption:
        """
        Create a new field option with duplicate detection.

        Args:
            data: Dictionary with entity, field_name, value, display_label, etc.
            created_by: ID of user creating the option (optional)

        Returns:
            Created FieldOption ORM model

        Raises:
            ValidationError: If option with same entity/field_name/value exists

        Example:
            ```python
            option = await repo.create(
                data={
                    "entity": "person",
                    "field_name": "wine_types",
                    "value": "cabernet",
                    "display_label": "Cabernet Sauvignon",
                    "display_order": 1
                },
                created_by=123
            )
            ```
        """
        try:
            # Add created_by if provided
            if created_by is not None:
                data["created_by"] = created_by

            option = FieldOption(**data)
            self.session.add(option)
            await self.session.commit()
            await self.session.refresh(option)
            return option

        except IntegrityError as e:
            await self.session.rollback()
            # Check if it's the unique constraint violation (PostgreSQL or SQLite)
            error_str = str(e).lower()
            if "uq_field_options_entity_field_value" in error_str or "unique constraint failed" in error_str:
                raise ValidationError(
                    code="DUPLICATE_OPTION",
                    message=(
                        f"Option with value '{data.get('value')}' already exists for "
                        f"{data.get('entity')}.{data.get('field_name')}"
                    ),
                    details={
                        "entity": data.get("entity"),
                        "field_name": data.get("field_name"),
                        "value": data.get("value")
                    }
                )
            raise

    async def get_by_id(self, option_id: int) -> FieldOption | None:
        """
        Get a single field option by ID.

        Args:
            option_id: Primary key of the option

        Returns:
            FieldOption if found, None otherwise

        Example:
            ```python
            option = await repo.get_by_id(123)
            if option:
                print(f"Option: {option.display_label}")
            ```
        """
        stmt = select(FieldOption).where(FieldOption.id == option_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_options(
        self,
        entity: str,
        field_name: str,
        include_inactive: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> tuple[list[FieldOption], int]:
        """
        Get field options with filtering and pagination.

        Args:
            entity: Entity type (person, gift, occasion, list)
            field_name: Field identifier (wine_types, priority, etc.)
            include_inactive: Include soft-deleted options (default: False)
            skip: Number of records to skip for pagination
            limit: Maximum number of records to return

        Returns:
            Tuple of (options list, total count)

        Example:
            ```python
            options, total = await repo.get_options(
                entity="person",
                field_name="wine_types",
                skip=0,
                limit=50
            )
            print(f"Found {total} wine types, showing {len(options)}")
            ```
        """
        # Build base query with filters
        conditions = [
            FieldOption.entity == entity,
            FieldOption.field_name == field_name
        ]
        if not include_inactive:
            conditions.append(FieldOption.is_active == True)

        # Query for options
        stmt = (
            select(FieldOption)
            .where(and_(*conditions))
            .order_by(FieldOption.display_order, FieldOption.display_label)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.execute(stmt)
        options = list(result.scalars().all())

        # Query for total count
        count_stmt = (
            select(func.count())
            .select_from(FieldOption)
            .where(and_(*conditions))
        )
        count_result = await self.session.execute(count_stmt)
        total = count_result.scalar_one()

        return options, total

    async def get_all_for_entity(
        self,
        entity: str,
        include_inactive: bool = False
    ) -> list[FieldOption]:
        """
        Get all field options for an entity across all fields.

        Useful for admin interfaces that need to see all options
        for a given entity type.

        Args:
            entity: Entity type (person, gift, occasion, list)
            include_inactive: Include soft-deleted options (default: False)

        Returns:
            List of all FieldOption records for the entity

        Example:
            ```python
            all_options = await repo.get_all_for_entity(
                entity="person",
                include_inactive=True
            )
            # Group by field_name if needed
            by_field = {}
            for opt in all_options:
                by_field.setdefault(opt.field_name, []).append(opt)
            ```
        """
        conditions = [FieldOption.entity == entity]
        if not include_inactive:
            conditions.append(FieldOption.is_active == True)

        stmt = (
            select(FieldOption)
            .where(and_(*conditions))
            .order_by(
                FieldOption.field_name,
                FieldOption.display_order,
                FieldOption.display_label
            )
        )
        result = await self.session.execute(stmt)
        return list(result.scalars().all())

    async def update(
        self,
        option_id: int,
        data: dict,
        updated_by: int | None = None
    ) -> FieldOption | None:
        """
        Update an existing field option.

        Note: The 'value' field should not be updated as it may be
        referenced by other entities. Only display_label, display_order,
        and is_active should typically be updated.

        Args:
            option_id: Primary key of the option to update
            data: Dictionary of fields to update
            updated_by: ID of user updating the option (optional)

        Returns:
            Updated FieldOption if found, None if not found

        Example:
            ```python
            updated = await repo.update(
                option_id=123,
                data={"display_label": "Red Wine - Cabernet", "display_order": 5},
                updated_by=456
            )
            if updated:
                print(f"Updated: {updated.display_label}")
            ```
        """
        option = await self.get_by_id(option_id)
        if option is None:
            return None

        # Add updated_by if provided
        if updated_by is not None:
            data["updated_by"] = updated_by

        # Update fields
        for field, value in data.items():
            setattr(option, field, value)

        await self.session.commit()
        await self.session.refresh(option)
        return option

    async def soft_delete(
        self,
        option_id: int,
        updated_by: int | None = None
    ) -> FieldOption | None:
        """
        Soft delete a field option by setting is_active=False.

        Preserves the record for historical data integrity while
        hiding it from active use.

        Args:
            option_id: Primary key of the option to soft delete
            updated_by: ID of user performing the deletion (optional)

        Returns:
            Updated FieldOption if found, None if not found

        Example:
            ```python
            deleted = await repo.soft_delete(option_id=123, updated_by=456)
            if deleted:
                print(f"Soft deleted: {deleted.display_label}")
            ```
        """
        return await self.update(
            option_id=option_id,
            data={"is_active": False},
            updated_by=updated_by
        )

    async def hard_delete(self, option_id: int) -> bool:
        """
        Permanently delete a field option from the database.

        WARNING: This is a destructive operation. Use soft_delete
        instead unless you need to permanently remove the record.

        Args:
            option_id: Primary key of the option to delete

        Returns:
            True if deleted, False if not found

        Raises:
            IntegrityError: If option is referenced by other entities

        Example:
            ```python
            deleted = await repo.hard_delete(option_id=123)
            if deleted:
                print("Option permanently removed")
            ```
        """
        option = await self.get_by_id(option_id)
        if option is None:
            return False

        await self.session.delete(option)
        await self.session.commit()
        return True
