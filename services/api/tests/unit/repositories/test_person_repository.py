"""Unit tests for PersonRepository budget methods."""

from decimal import Decimal

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.occasion import Occasion
from app.models.person import Person, PersonOccasion
from app.repositories.person import PersonRepository


@pytest_asyncio.fixture
async def person_repo(async_session: AsyncSession) -> PersonRepository:
    """Create PersonRepository with test session."""
    return PersonRepository(async_session)


@pytest_asyncio.fixture
async def test_person_occasion(
    async_session: AsyncSession, test_person: Person, test_occasion: Occasion
) -> PersonOccasion:
    """Create test person-occasion link with budget fields."""
    person_occasion = PersonOccasion(
        person_id=test_person.id,
        occasion_id=test_occasion.id,
        recipient_budget_total=Decimal("100.00"),
        purchaser_budget_total=Decimal("50.00"),
    )
    async_session.add(person_occasion)
    await async_session.commit()
    await async_session.refresh(person_occasion)
    return person_occasion


class TestGetPersonOccasionBudget:
    """Tests for get_person_occasion_budget method."""

    @pytest.mark.asyncio
    async def test_returns_existing_budget(
        self,
        person_repo: PersonRepository,
        test_person: Person,
        test_occasion: Occasion,
        test_person_occasion: PersonOccasion,
    ) -> None:
        """Test retrieving budget for existing person-occasion link."""
        result = await person_repo.get_person_occasion_budget(
            person_id=test_person.id, occasion_id=test_occasion.id
        )

        assert result is not None
        assert result.person_id == test_person.id
        assert result.occasion_id == test_occasion.id
        assert result.recipient_budget_total == Decimal("100.00")
        assert result.purchaser_budget_total == Decimal("50.00")

    @pytest.mark.asyncio
    async def test_returns_none_for_nonexistent_link(
        self,
        person_repo: PersonRepository,
        test_person: Person,
        test_occasion: Occasion,
    ) -> None:
        """Test returning None for non-existent person-occasion link."""
        result = await person_repo.get_person_occasion_budget(
            person_id=test_person.id, occasion_id=test_occasion.id
        )

        assert result is None

    @pytest.mark.asyncio
    async def test_returns_none_for_invalid_person_id(
        self,
        person_repo: PersonRepository,
        test_person_occasion: PersonOccasion,
    ) -> None:
        """Test returning None for invalid person ID."""
        result = await person_repo.get_person_occasion_budget(
            person_id=99999, occasion_id=test_person_occasion.occasion_id
        )

        assert result is None


class TestUpdatePersonOccasionBudget:
    """Tests for update_person_occasion_budget method."""

    @pytest.mark.asyncio
    async def test_updates_budget_successfully(
        self,
        person_repo: PersonRepository,
        test_person: Person,
        test_occasion: Occasion,
        test_person_occasion: PersonOccasion,
    ) -> None:
        """Test updating budget fields successfully."""
        result = await person_repo.update_person_occasion_budget(
            person_id=test_person.id,
            occasion_id=test_occasion.id,
            recipient_budget_total=Decimal("200.00"),
            purchaser_budget_total=Decimal("75.00"),
        )

        assert result.recipient_budget_total == Decimal("200.00")
        assert result.purchaser_budget_total == Decimal("75.00")

    @pytest.mark.asyncio
    async def test_allows_null_budgets(
        self,
        person_repo: PersonRepository,
        test_person: Person,
        test_occasion: Occasion,
        test_person_occasion: PersonOccasion,
    ) -> None:
        """Test setting budget to None (no limit)."""
        result = await person_repo.update_person_occasion_budget(
            person_id=test_person.id,
            occasion_id=test_occasion.id,
            recipient_budget_total=None,
            purchaser_budget_total=None,
        )

        assert result.recipient_budget_total is None
        assert result.purchaser_budget_total is None

    @pytest.mark.asyncio
    async def test_rejects_negative_recipient_budget(
        self,
        person_repo: PersonRepository,
        test_person: Person,
        test_occasion: Occasion,
        test_person_occasion: PersonOccasion,
    ) -> None:
        """Test that negative recipient budget raises ValueError."""
        with pytest.raises(ValueError, match="recipient_budget_total must be >= 0"):
            await person_repo.update_person_occasion_budget(
                person_id=test_person.id,
                occasion_id=test_occasion.id,
                recipient_budget_total=Decimal("-100.00"),
            )

    @pytest.mark.asyncio
    async def test_rejects_negative_purchaser_budget(
        self,
        person_repo: PersonRepository,
        test_person: Person,
        test_occasion: Occasion,
        test_person_occasion: PersonOccasion,
    ) -> None:
        """Test that negative purchaser budget raises ValueError."""
        with pytest.raises(ValueError, match="purchaser_budget_total must be >= 0"):
            await person_repo.update_person_occasion_budget(
                person_id=test_person.id,
                occasion_id=test_occasion.id,
                purchaser_budget_total=Decimal("-50.00"),
            )

    @pytest.mark.asyncio
    async def test_raises_error_for_nonexistent_link(
        self,
        person_repo: PersonRepository,
        test_person: Person,
        test_occasion: Occasion,
    ) -> None:
        """Test that updating non-existent link raises ValueError."""
        with pytest.raises(ValueError, match="PersonOccasion link not found"):
            await person_repo.update_person_occasion_budget(
                person_id=test_person.id,
                occasion_id=test_occasion.id,
                recipient_budget_total=Decimal("100.00"),
            )

    @pytest.mark.asyncio
    async def test_allows_zero_budget(
        self,
        person_repo: PersonRepository,
        test_person: Person,
        test_occasion: Occasion,
        test_person_occasion: PersonOccasion,
    ) -> None:
        """Test that zero budget is allowed."""
        result = await person_repo.update_person_occasion_budget(
            person_id=test_person.id,
            occasion_id=test_occasion.id,
            recipient_budget_total=Decimal("0.00"),
            purchaser_budget_total=Decimal("0.00"),
        )

        assert result.recipient_budget_total == Decimal("0.00")
        assert result.purchaser_budget_total == Decimal("0.00")


class TestGetGiftBudgetWithOccasionFilter:
    """Tests for get_gift_budget method with occasion_id filter."""

    @pytest.mark.asyncio
    async def test_returns_global_totals_without_filter(
        self,
        person_repo: PersonRepository,
        test_person: Person,
    ) -> None:
        """Test getting global totals without occasion filter."""
        result = await person_repo.get_gift_budget(person_id=test_person.id)

        assert result.person_id == test_person.id
        assert result.occasion_id is None
        # Default to 0 when no gifts assigned
        assert result.gifts_assigned_count == 0
        assert result.gifts_assigned_total == Decimal("0")

    @pytest.mark.asyncio
    async def test_returns_filtered_totals_with_occasion(
        self,
        person_repo: PersonRepository,
        test_person: Person,
        test_occasion: Occasion,
    ) -> None:
        """Test getting totals filtered by occasion."""
        result = await person_repo.get_gift_budget(
            person_id=test_person.id, occasion_id=test_occasion.id
        )

        assert result.person_id == test_person.id
        assert result.occasion_id == test_occasion.id
        # Default to 0 when no gifts assigned
        assert result.gifts_assigned_count == 0
        assert result.gifts_assigned_total == Decimal("0")
