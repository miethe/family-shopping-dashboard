"""Integration tests for person-occasion budget API endpoints."""

from datetime import date
from decimal import Decimal

import pytest
from httpx import AsyncClient
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.gift import Gift
from app.models.list_item import ListItem, ListItemStatus
from app.models.occasion import Occasion, OccasionType
from app.models.person import Person, PersonOccasion


@pytest.mark.asyncio
class TestGetPersonOccasionBudget:
    """Tests for GET /persons/{person_id}/occasions/{occasion_id}/budget endpoint."""

    async def test_get_budget_success(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test getting budget for valid person-occasion link returns 200."""
        # Setup: Create person, occasion, and link them with budget
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        # Create person-occasion link with budgets
        person_occasion = PersonOccasion(
            person_id=person.id,
            occasion_id=occasion.id,
            recipient_budget_total=Decimal("200.00"),
            purchaser_budget_total=Decimal("50.00"),
        )
        async_session.add(person_occasion)
        await async_session.commit()

        # Execute
        response = await client.get(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["person_id"] == person.id
        assert data["occasion_id"] == occasion.id
        assert data["recipient_budget_total"] == 200.00
        assert data["purchaser_budget_total"] == 50.00
        assert data["recipient_spent"] == 0.00
        assert data["purchaser_spent"] == 0.00
        assert data["recipient_progress"] == 0.0
        assert data["purchaser_progress"] == 0.0

    async def test_get_budget_person_not_linked(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test getting budget when person-occasion link doesn't exist returns 404."""
        # Setup: Create person and occasion WITHOUT linking them
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        # Execute - person and occasion exist but not linked
        response = await client.get(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["error"]["code"] == "PERSON_OCCASION_NOT_FOUND"

    async def test_get_budget_with_spending(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test that spending amounts are calculated correctly from gifts."""
        # Setup: Create person, occasion, link them
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        # Create person-occasion link with budgets
        person_occasion = PersonOccasion(
            person_id=person.id,
            occasion_id=occasion.id,
            recipient_budget_total=Decimal("200.00"),
            purchaser_budget_total=Decimal("100.00"),
        )
        async_session.add(person_occasion)
        await async_session.commit()

        # Create gifts for this person-occasion with different roles
        # Gift TO this person (recipient_spent)
        gift_to = Gift(
            name="Gift For Person",
            price=Decimal("75.50"),
            source="Test",
        )
        async_session.add(gift_to)
        await async_session.commit()
        await async_session.refresh(gift_to)

        # Link gift as recipient
        list_item_recipient = ListItem(
            gift_id=gift_to.id,
            status=ListItemStatus.purchased,
            for_person_id=person.id,
            for_occasion_id=occasion.id,
        )
        async_session.add(list_item_recipient)

        # Gift BY this person (purchaser_spent)
        gift_by = Gift(
            name="Gift By Person",
            price=Decimal("40.25"),
            source="Test",
        )
        async_session.add(gift_by)
        await async_session.commit()
        await async_session.refresh(gift_by)

        # Link gift as purchaser
        list_item_purchaser = ListItem(
            gift_id=gift_by.id,
            status=ListItemStatus.purchased,
            purchased_by_person_id=person.id,
            for_occasion_id=occasion.id,
        )
        async_session.add(list_item_purchaser)
        await async_session.commit()

        # Execute
        response = await client.get(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["recipient_spent"] == 75.50
        assert data["purchaser_spent"] == 40.25
        # Progress = spent / budget * 100
        assert abs(data["recipient_progress"] - 37.75) < 0.01  # 75.5 / 200 * 100
        assert abs(data["purchaser_progress"] - 40.25) < 0.01  # 40.25 / 100 * 100

    async def test_get_budget_progress_calculation(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test that progress percentage is calculated correctly (spent/budget * 100)."""
        # Setup
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        # Create link with budget of 100
        person_occasion = PersonOccasion(
            person_id=person.id,
            occasion_id=occasion.id,
            recipient_budget_total=Decimal("100.00"),
            purchaser_budget_total=Decimal("200.00"),
        )
        async_session.add(person_occasion)
        await async_session.commit()

        # Add gift worth 50 (50% of recipient budget)
        gift = Gift(name="Test Gift", price=Decimal("50.00"), source="Test")
        async_session.add(gift)
        await async_session.commit()
        await async_session.refresh(gift)

        list_item = ListItem(
            gift_id=gift.id,
            status=ListItemStatus.purchased,
            for_person_id=person.id,
            for_occasion_id=occasion.id,
        )
        async_session.add(list_item)
        await async_session.commit()

        # Execute
        response = await client.get(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["recipient_spent"] == 50.00
        assert data["recipient_progress"] == 50.0  # 50 / 100 * 100
        assert data["purchaser_spent"] == 0.00
        assert data["purchaser_progress"] == 0.0

    async def test_get_budget_no_budget_set(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test that progress is None when no budget is set."""
        # Setup: Create link WITHOUT budget values
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        # Create link with NO budgets (None)
        person_occasion = PersonOccasion(
            person_id=person.id,
            occasion_id=occasion.id,
            recipient_budget_total=None,
            purchaser_budget_total=None,
        )
        async_session.add(person_occasion)
        await async_session.commit()

        # Execute
        response = await client.get(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["recipient_budget_total"] is None
        assert data["purchaser_budget_total"] is None
        assert data["recipient_progress"] is None  # No budget = no progress
        assert data["purchaser_progress"] is None

    async def test_get_budget_unauthenticated(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
    ) -> None:
        """Test that unauthenticated request returns 401/403."""
        # Setup
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        # Execute WITHOUT auth headers
        response = await client.get(
            f"/persons/{person.id}/occasions/{occasion.id}/budget"
        )

        # Assert
        assert response.status_code in [401, 403]


@pytest.mark.asyncio
class TestUpdatePersonOccasionBudget:
    """Tests for PUT /persons/{person_id}/occasions/{occasion_id}/budget endpoint."""

    async def test_put_budget_success(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test updating budget returns 200 with updated values."""
        # Setup: Create person, occasion, and link them
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        # Create link with initial budgets
        person_occasion = PersonOccasion(
            person_id=person.id,
            occasion_id=occasion.id,
            recipient_budget_total=Decimal("100.00"),
            purchaser_budget_total=Decimal("50.00"),
        )
        async_session.add(person_occasion)
        await async_session.commit()

        # Execute - update both budgets
        response = await client.put(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
            json={
                "recipient_budget_total": 200.00,
                "purchaser_budget_total": 75.00,
            },
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["recipient_budget_total"] == 200.00
        assert data["purchaser_budget_total"] == 75.00

        # Verify database was updated
        await async_session.refresh(person_occasion)
        assert person_occasion.recipient_budget_total == Decimal("200.00")
        assert person_occasion.purchaser_budget_total == Decimal("75.00")

    async def test_put_budget_person_not_linked(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test updating budget when person-occasion link doesn't exist returns 404."""
        # Setup: Create person and occasion WITHOUT linking them
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        # Execute - try to update budget for non-existent link
        response = await client.put(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
            json={
                "recipient_budget_total": 200.00,
                "purchaser_budget_total": 50.00,
            },
        )

        # Assert
        assert response.status_code == 404
        data = response.json()
        assert data["error"]["code"] == "PERSON_OCCASION_NOT_FOUND"

    async def test_put_budget_null_values(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test that None values are accepted (removes budget limit)."""
        # Setup: Create link with existing budgets
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        person_occasion = PersonOccasion(
            person_id=person.id,
            occasion_id=occasion.id,
            recipient_budget_total=Decimal("100.00"),
            purchaser_budget_total=Decimal("50.00"),
        )
        async_session.add(person_occasion)
        await async_session.commit()

        # Execute - set budgets to None (remove limits)
        response = await client.put(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
            json={
                "recipient_budget_total": None,
                "purchaser_budget_total": None,
            },
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["recipient_budget_total"] is None
        assert data["purchaser_budget_total"] is None

        # Verify database
        await async_session.refresh(person_occasion)
        assert person_occasion.recipient_budget_total is None
        assert person_occasion.purchaser_budget_total is None

    async def test_put_budget_zero_value(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test that zero is a valid budget value."""
        # Setup
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        person_occasion = PersonOccasion(
            person_id=person.id,
            occasion_id=occasion.id,
        )
        async_session.add(person_occasion)
        await async_session.commit()

        # Execute - set budget to 0
        response = await client.put(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
            json={
                "recipient_budget_total": 0.00,
                "purchaser_budget_total": 0.00,
            },
        )

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert data["recipient_budget_total"] == 0.00
        assert data["purchaser_budget_total"] == 0.00

    async def test_put_budget_negative_rejected(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test that negative budget values are rejected (422 validation error)."""
        # Setup
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        person_occasion = PersonOccasion(
            person_id=person.id,
            occasion_id=occasion.id,
        )
        async_session.add(person_occasion)
        await async_session.commit()

        # Execute - try to set negative budget
        response = await client.put(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
            json={
                "recipient_budget_total": -100.00,
                "purchaser_budget_total": 50.00,
            },
        )

        # Assert - Pydantic validation error
        assert response.status_code == 422

    async def test_put_budget_unauthenticated(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
    ) -> None:
        """Test that unauthenticated request returns 401/403."""
        # Setup
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        # Execute WITHOUT auth headers
        response = await client.put(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            json={
                "recipient_budget_total": 200.00,
                "purchaser_budget_total": 50.00,
            },
        )

        # Assert
        assert response.status_code in [401, 403]

    async def test_put_budget_partial_update(
        self,
        client: AsyncClient,
        async_session: AsyncSession,
        auth_headers: dict[str, str],
    ) -> None:
        """Test that only updating one budget field works correctly."""
        # Setup
        person = Person(display_name="Test Person")
        occasion = Occasion(name="Test Birthday", type=OccasionType.RECURRING, date=date(2025, 6, 15))
        async_session.add(person)
        async_session.add(occasion)
        await async_session.commit()
        await async_session.refresh(person)
        await async_session.refresh(occasion)

        person_occasion = PersonOccasion(
            person_id=person.id,
            occasion_id=occasion.id,
            recipient_budget_total=Decimal("100.00"),
            purchaser_budget_total=Decimal("50.00"),
        )
        async_session.add(person_occasion)
        await async_session.commit()

        # Execute - update only recipient budget
        response = await client.put(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
            json={
                "recipient_budget_total": 150.00,
            },
        )

        # Assert - recipient updated, purchaser unchanged
        assert response.status_code == 200
        data = response.json()
        assert data["recipient_budget_total"] == 150.00
        assert data["purchaser_budget_total"] == 50.00  # Unchanged

        # Execute - update only purchaser budget
        response = await client.put(
            f"/persons/{person.id}/occasions/{occasion.id}/budget",
            headers=auth_headers,
            json={
                "purchaser_budget_total": 75.00,
            },
        )

        # Assert - purchaser updated, recipient unchanged
        assert response.status_code == 200
        data = response.json()
        assert data["recipient_budget_total"] == 150.00  # Unchanged from previous update
        assert data["purchaser_budget_total"] == 75.00
