"""Group service for organizing persons into groups."""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.group_repository import GroupRepository
from app.schemas.group import GroupCreate, GroupResponse, GroupUpdate


class GroupService:
    """
    Group service handling CRUD operations for person organization.

    Converts ORM models to DTOs for all operations. Groups are used to organize
    persons into logical collections like "Immediate Family", "Extended Family",
    "Kids", etc.

    Example:
        ```python
        async with async_session() as session:
            service = GroupService(session)
            group = await service.create(GroupCreate(
                name="Immediate Family",
                description="Close family members",
                color="#4CAF50"
            ))
        ```
    """

    def __init__(self, session: AsyncSession) -> None:
        """
        Initialize group service with database session.

        Args:
            session: SQLAlchemy async session for database operations
        """
        self.session = session
        self.repo = GroupRepository(session)

    async def create(self, data: GroupCreate) -> GroupResponse:
        """
        Create a new group for organizing persons.

        Args:
            data: Group creation data (name, description, color)

        Returns:
            GroupResponse DTO with created group details

        Example:
            ```python
            group = await service.create(GroupCreate(
                name="Kids",
                description="Children in the family",
                color="#2196F3"
            ))
            print(f"Created group: {group.name}")
            ```

        Note:
            - Name is required, must be unique, and 1-100 characters
            - Description and color are optional
            - Color must be hex format (#RRGGBB) if provided
            - Timestamps (created_at, updated_at) are auto-generated
        """
        # Create group in database
        group_data = data.model_dump(exclude_unset=True, exclude_none=True)
        group = await self.repo.create(group_data)

        # Fetch group with members loaded (will be empty for new group)
        group_with_members = await self.repo.get_with_members(group.id)
        if group_with_members is None:
            # Should not happen, but handle gracefully
            group_with_members = group

        # Convert ORM model to DTO
        response = GroupResponse.model_validate(group_with_members)
        # Set member count (will be 0 for new group)
        response.member_count = len(group_with_members.members) if hasattr(group_with_members, 'members') else 0
        return response

    async def get(self, group_id: int) -> GroupResponse | None:
        """
        Get group by ID with members loaded.

        Args:
            group_id: Group ID to retrieve

        Returns:
            GroupResponse DTO if found, None otherwise

        Example:
            ```python
            group = await service.get(group_id=1)
            if group:
                print(f"Found: {group.name}")
                print(f"Members: {group.member_count}")
                print(f"Color: {group.color}")
            else:
                print("Group not found")
            ```
        """
        # Get group with members eagerly loaded
        group = await self.repo.get_with_members(group_id)
        if group is None:
            return None

        # Convert ORM model to DTO
        response = GroupResponse.model_validate(group)
        # Set member count
        response.member_count = len(group.members) if hasattr(group, 'members') else 0
        return response

    async def list(
        self,
        cursor: int | None = None,
        limit: int = 50,
    ) -> tuple[list[GroupResponse], bool, int | None]:
        """
        List groups with cursor-based pagination.

        Cursor-based pagination provides better performance than offset-based
        pagination, especially for large datasets.

        Args:
            cursor: ID of the last group from the previous page (None for first page)
            limit: Maximum number of groups to return (default: 50)

        Returns:
            Tuple of (groups, has_more, next_cursor):
            - groups: List of GroupResponse DTOs (up to `limit` items)
            - has_more: True if more groups exist after this page
            - next_cursor: ID to use for next page (None if no more items)

        Example:
            ```python
            # First page
            groups, has_more, next_cursor = await service.list(limit=20)
            for group in groups:
                print(f"- {group.name} ({group.member_count} members)")

            # Second page
            if has_more:
                groups, has_more, next_cursor = await service.list(
                    cursor=next_cursor, limit=20
                )
            ```

        Note:
            Results are ordered by ID in ascending order.
            Member counts are included for each group.
        """
        # Get paginated list from repository
        groups, has_more, next_cursor = await self.repo.get_multi_with_members(
            cursor=cursor,
            limit=limit,
            order_by="id",
            descending=False,
        )

        # Convert ORM models to DTOs with member counts
        groups_dtos = []
        for group in groups:
            response = GroupResponse.model_validate(group)
            response.member_count = len(group.members) if hasattr(group, 'members') else 0
            groups_dtos.append(response)

        return groups_dtos, has_more, next_cursor

    async def update(self, group_id: int, data: GroupUpdate) -> GroupResponse | None:
        """
        Update group details.

        Args:
            group_id: Group ID to update
            data: Update data (all fields optional)

        Returns:
            Updated GroupResponse DTO if group found, None otherwise

        Example:
            ```python
            group = await service.update(
                group_id=1,
                data=GroupUpdate(
                    name="Extended Family",
                    description="Updated description",
                    color="#FF9800"
                )
            )
            if group:
                print(f"Updated: {group.name}")
            ```

        Note:
            - Only updates provided fields (partial update)
            - Returns None if group not found
            - updated_at timestamp is automatically updated
            - Name must remain unique if changed
        """
        # Check group exists
        existing_group = await self.repo.get(group_id)
        if existing_group is None:
            return None

        # Update group fields
        update_dict = data.model_dump(exclude_unset=True)
        if not update_dict:
            # No fields to update, return existing group
            return await self.get(group_id)

        updated_group = await self.repo.update(group_id, update_dict)
        if updated_group is None:
            # Should not happen since we checked existence, but handle gracefully
            return None

        # Fetch group with members loaded
        group_with_members = await self.repo.get_with_members(group_id)
        if group_with_members is None:
            # Should not happen, but handle gracefully
            group_with_members = updated_group

        # Convert ORM model to DTO
        response = GroupResponse.model_validate(group_with_members)
        response.member_count = len(group_with_members.members) if hasattr(group_with_members, 'members') else 0
        return response

    async def delete(self, group_id: int) -> bool:
        """
        Delete a group by ID.

        Args:
            group_id: Group ID to delete

        Returns:
            True if group was deleted, False if not found

        Example:
            ```python
            deleted = await service.delete(group_id=1)
            if deleted:
                print("Group deleted successfully")
            else:
                print("Group not found")
            ```

        Note:
            - Returns False if group doesn't exist
            - Deletion is permanent and cannot be undone
            - Related person-group links will be removed (CASCADE)
            - Persons remain in the database (only group membership removed)
        """
        return await self.repo.delete(group_id)
