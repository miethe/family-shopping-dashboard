"""Field option service for admin management of dropdown options."""

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import NotFoundError, ValidationError
from app.models.field_option import FieldOption
from app.repositories.field_option import FieldOptionRepository
from app.schemas.field_option import (
    VALID_ENTITIES,
    VALID_FIELDS,
    FieldOptionCreate,
    FieldOptionDeleteResponse,
    FieldOptionListResponse,
    FieldOptionResponse,
    FieldOptionUpdate,
)


class FieldOptionService:
    """
    Field option service handling CRUD operations for dynamic dropdown options.

    Manages field options across multiple entities (person, gift, occasion, list)
    providing validation, business logic, and ORM→DTO conversion.

    Example:
        ```python
        async with async_session() as session:
            service = FieldOptionService(session)

            # Create a new option
            option = await service.create_option(
                data=FieldOptionCreate(
                    entity="person",
                    field_name="wine_types",
                    value="cabernet",
                    display_label="Cabernet Sauvignon",
                    display_order=1
                ),
                current_user_id=123
            )

            # Get options for a field
            options = await service.get_options(
                entity="person",
                field_name="wine_types",
                include_inactive=False,
                skip=0,
                limit=50
            )
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize field option service with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = FieldOptionRepository(session)

    async def create_option(
        self,
        data: FieldOptionCreate,
        current_user_id: int | None = None
    ) -> FieldOptionResponse:
        """
        Create a new field option with validation.

        Validates that the entity and field_name combination is valid
        before creating the option. The entity and field_name validation
        happens at both the schema level and service level for defense
        in depth.

        Args:
            data: Field option creation data
            current_user_id: ID of user creating the option (optional)

        Returns:
            FieldOptionResponse DTO with created option details

        Raises:
            ValidationError: If entity/field_name combination is invalid
                           or if duplicate option exists

        Example:
            ```python
            option = await service.create_option(
                data=FieldOptionCreate(
                    entity="person",
                    field_name="wine_types",
                    value="pinot_noir",
                    display_label="Pinot Noir",
                    display_order=2
                ),
                current_user_id=123
            )
            print(f"Created: {option.display_label}")
            ```
        """
        # Validate entity (should already be validated by schema, but double-check)
        if data.entity not in VALID_ENTITIES:
            raise ValidationError(
                code="INVALID_ENTITY",
                message=f"Entity must be one of {sorted(VALID_ENTITIES)}, got '{data.entity}'",
                details={"entity": data.entity, "valid_entities": sorted(VALID_ENTITIES)}
            )

        # Validate field_name for this entity
        valid_fields = VALID_FIELDS.get(data.entity, set())
        if data.field_name not in valid_fields:
            raise ValidationError(
                code="INVALID_FIELD",
                message=f"Field '{data.field_name}' is not valid for entity '{data.entity}'",
                details={
                    "entity": data.entity,
                    "field_name": data.field_name,
                    "valid_fields": sorted(valid_fields)
                }
            )

        # Create option via repository
        option = await self.repo.create(
            data={
                "entity": data.entity,
                "field_name": data.field_name,
                "value": data.value,
                "display_label": data.display_label,
                "display_order": data.display_order,
                "is_system": False,  # User-created options are never system options
            },
            created_by=current_user_id
        )

        return self._to_response(option, usage_count=0)

    async def get_option(self, option_id: int) -> FieldOptionResponse:
        """
        Get a single field option by ID.

        Args:
            option_id: Primary key of the option

        Returns:
            FieldOptionResponse DTO

        Raises:
            NotFoundError: If option not found

        Example:
            ```python
            option = await service.get_option(option_id=123)
            print(f"Option: {option.display_label}")
            ```
        """
        option = await self.repo.get_by_id(option_id)
        if option is None:
            raise NotFoundError(
                code="FIELD_OPTION_NOT_FOUND",
                message=f"Field option with ID {option_id} not found",
                details={"option_id": option_id}
            )

        # TODO: Calculate actual usage_count in TASK-2.2
        usage_count = 0

        return self._to_response(option, usage_count=usage_count)

    async def get_options(
        self,
        entity: str,
        field_name: str,
        include_inactive: bool = False,
        skip: int = 0,
        limit: int = 100
    ) -> FieldOptionListResponse:
        """
        Get paginated list of field options for a specific entity/field.

        Args:
            entity: Entity type (person, gift, occasion, list)
            field_name: Field identifier within the entity
            include_inactive: Include soft-deleted options (default: False)
            skip: Number of records to skip for pagination
            limit: Maximum number of records to return

        Returns:
            FieldOptionListResponse with items, total, pagination info

        Raises:
            ValidationError: If entity is invalid

        Example:
            ```python
            response = await service.get_options(
                entity="person",
                field_name="wine_types",
                include_inactive=False,
                skip=0,
                limit=50
            )
            print(f"Found {response.total} options, showing {len(response.items)}")
            for option in response.items:
                print(f"  - {option.display_label}")
            ```
        """
        # Validate entity
        if entity not in VALID_ENTITIES:
            raise ValidationError(
                code="INVALID_ENTITY",
                message=f"Entity must be one of {sorted(VALID_ENTITIES)}, got '{entity}'",
                details={"entity": entity, "valid_entities": sorted(VALID_ENTITIES)}
            )

        # Get options from repository
        options, total = await self.repo.get_options(
            entity=entity,
            field_name=field_name,
            include_inactive=include_inactive,
            skip=skip,
            limit=limit
        )

        # Convert to DTOs
        items = [self._to_response(opt, usage_count=0) for opt in options]

        # Calculate pagination info
        has_more = (skip + len(items)) < total
        next_cursor = items[-1].id if has_more and items else None

        return FieldOptionListResponse(
            items=items,
            total=total,
            has_more=has_more,
            next_cursor=next_cursor
        )

    async def update_option(
        self,
        option_id: int,
        data: FieldOptionUpdate,
        current_user_id: int | None = None
    ) -> FieldOptionResponse:
        """
        Update an existing field option.

        Note: Only display_label and display_order can be updated.
        The value field is immutable after creation to prevent breaking
        references from other entities.

        Args:
            option_id: Primary key of the option to update
            data: Update data (only label and order)
            current_user_id: ID of user performing update (optional)

        Returns:
            Updated FieldOptionResponse DTO

        Raises:
            NotFoundError: If option not found

        Example:
            ```python
            updated = await service.update_option(
                option_id=123,
                data=FieldOptionUpdate(
                    display_label="Red Wine - Cabernet",
                    display_order=5
                ),
                current_user_id=456
            )
            print(f"Updated: {updated.display_label}")
            ```
        """
        # Check option exists
        existing = await self.repo.get_by_id(option_id)
        if existing is None:
            raise NotFoundError(
                code="FIELD_OPTION_NOT_FOUND",
                message=f"Field option with ID {option_id} not found",
                details={"option_id": option_id}
            )

        # Build update dict (only non-None fields)
        update_data = {}
        if data.display_label is not None:
            update_data["display_label"] = data.display_label
        if data.display_order is not None:
            update_data["display_order"] = data.display_order

        # Update via repository
        updated_option = await self.repo.update(
            option_id=option_id,
            data=update_data,
            updated_by=current_user_id
        )

        # Should not be None since we checked existence, but handle gracefully
        if updated_option is None:
            raise NotFoundError(
                code="FIELD_OPTION_NOT_FOUND",
                message=f"Field option with ID {option_id} not found",
                details={"option_id": option_id}
            )

        # TODO: Calculate actual usage_count in TASK-2.2
        usage_count = 0

        return self._to_response(updated_option, usage_count=usage_count)

    async def delete_option(
        self,
        option_id: int,
        hard_delete: bool = False,
        current_user_id: int | None = None
    ) -> FieldOptionDeleteResponse:
        """
        Delete a field option (soft or hard delete).

        System options cannot be hard-deleted. Hard deletes are blocked
        if the option is in use by any records.

        Args:
            option_id: Primary key of the option to delete
            hard_delete: If True, permanently delete; if False, soft delete
            current_user_id: ID of user performing deletion (optional)

        Returns:
            FieldOptionDeleteResponse with operation result

        Raises:
            NotFoundError: If option not found
            ValidationError: If attempting to hard-delete a system option

        Example:
            ```python
            # Soft delete (default)
            result = await service.delete_option(option_id=123)
            print(f"Soft deleted: {result.success}")

            # Hard delete (if allowed)
            result = await service.delete_option(
                option_id=123,
                hard_delete=True
            )
            if not result.success:
                print(f"Cannot delete: {result.message}")
            ```
        """
        # Check option exists
        option = await self.repo.get_by_id(option_id)
        if option is None:
            raise NotFoundError(
                code="FIELD_OPTION_NOT_FOUND",
                message=f"Field option with ID {option_id} not found",
                details={"option_id": option_id}
            )

        # Prevent hard deletion of system options
        if option.is_system and hard_delete:
            raise ValidationError(
                code="CANNOT_DELETE_SYSTEM_OPTION",
                message="System options cannot be hard-deleted. Use soft delete instead.",
                details={
                    "option_id": option_id,
                    "entity": option.entity,
                    "field_name": option.field_name,
                    "value": option.value
                }
            )

        # TODO: Calculate actual usage_count in TASK-2.2
        usage_count = 0

        # Block hard delete if option is in use
        if hard_delete and usage_count > 0:
            return FieldOptionDeleteResponse(
                success=False,
                id=option_id,
                soft_deleted=False,
                usage_count=usage_count,
                message=f"Cannot delete option: still used by {usage_count} records. Use soft delete instead."
            )

        # Perform deletion
        if hard_delete:
            deleted = await self.repo.hard_delete(option_id)
            return FieldOptionDeleteResponse(
                success=deleted,
                id=option_id,
                soft_deleted=False,
                usage_count=0,
                message="Option permanently deleted" if deleted else "Option not found"
            )
        else:
            # Soft delete
            soft_deleted_option = await self.repo.soft_delete(
                option_id=option_id,
                updated_by=current_user_id
            )
            return FieldOptionDeleteResponse(
                success=soft_deleted_option is not None,
                id=option_id,
                soft_deleted=True,
                usage_count=usage_count,
                message="Option soft-deleted successfully" if soft_deleted_option else "Option not found"
            )

    def _to_response(
        self,
        option: FieldOption,
        usage_count: int = 0
    ) -> FieldOptionResponse:
        """
        Convert ORM FieldOption model to FieldOptionResponse DTO.

        Args:
            option: FieldOption ORM model instance
            usage_count: Number of records using this option (default: 0)

        Returns:
            FieldOptionResponse DTO

        Note:
            This is a helper method to centralize ORM → DTO conversion.
            The usage_count is currently a placeholder (always 0) until
            TASK-2.2 implements actual usage tracking.
        """
        return FieldOptionResponse(
            id=option.id,
            entity=option.entity,
            field_name=option.field_name,
            value=option.value,
            display_label=option.display_label,
            display_order=option.display_order,
            is_system=option.is_system,
            is_active=option.is_active,
            created_by=option.created_by,
            updated_by=option.updated_by,
            usage_count=usage_count,
            created_at=option.created_at,
            updated_at=option.updated_at
        )
