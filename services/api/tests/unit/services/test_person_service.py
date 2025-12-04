"""Unit tests for PersonService."""

from unittest.mock import AsyncMock

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.person import Person
from app.repositories.person import PersonRepository
from app.schemas.person import PersonCreate, PersonResponse, PersonUpdate
from app.services.person import PersonService


@pytest.fixture
def mock_person_repo() -> AsyncMock:
    """Create mock PersonRepository."""
    return AsyncMock(spec=PersonRepository)


@pytest.fixture
def person_service(mock_person_repo: AsyncMock) -> PersonService:
    """Create PersonService with mocked repository."""
    service = PersonService(session=AsyncMock(spec=AsyncSession))
    service.repo = mock_person_repo
    return service


class TestPersonService:
    """Test suite for PersonService."""

    @pytest.mark.asyncio
    async def test_create_person(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test creating a person."""
        # Arrange
        person_data = PersonCreate(
            name="John Doe",
            interests=["Reading", "Hiking"],
            sizes={"shirt": "M", "shoe": "10"},
        )

        mock_person = Person(
            id=1,
            name="John Doe",
            interests=["Reading", "Hiking"],
            sizes={"shirt": "M", "shoe": "10"},
        )
        mock_person_repo.create.return_value = mock_person

        # Act
        result = await person_service.create(person_data)

        # Assert
        assert isinstance(result, PersonResponse)
        assert result.id == 1
        assert result.name == "John Doe"
        assert result.interests == ["Reading", "Hiking"]
        assert result.sizes == {"shirt": "M", "shoe": "10"}
        mock_person_repo.create.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_person_minimal_data(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test creating person with only required fields."""
        # Arrange
        person_data = PersonCreate(name="Jane Doe")

        mock_person = Person(id=2, name="Jane Doe", interests=None, sizes=None)
        mock_person_repo.create.return_value = mock_person

        # Act
        result = await person_service.create(person_data)

        # Assert
        assert result.name == "Jane Doe"
        assert result.interests is None
        assert result.sizes is None

    @pytest.mark.asyncio
    async def test_get_person_found(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test getting an existing person."""
        # Arrange
        mock_person = Person(id=1, name="John Doe")
        mock_person_repo.get.return_value = mock_person

        # Act
        result = await person_service.get(person_id=1)

        # Assert
        assert result is not None
        assert result.id == 1
        assert result.name == "John Doe"
        mock_person_repo.get.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_get_person_not_found(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test getting a non-existent person returns None."""
        # Arrange
        mock_person_repo.get.return_value = None

        # Act
        result = await person_service.get(person_id=999)

        # Assert
        assert result is None
        mock_person_repo.get.assert_called_once_with(999)

    @pytest.mark.asyncio
    async def test_list_persons(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test listing persons with pagination."""
        # Arrange
        mock_people = [
            Person(id=1, name="Person 1"),
            Person(id=2, name="Person 2"),
        ]
        mock_person_repo.get_multi.return_value = (mock_people, True, 2)

        # Act
        people, has_more, next_cursor = await person_service.list(limit=2)

        # Assert
        assert len(people) == 2
        assert people[0].name == "Person 1"
        assert people[1].name == "Person 2"
        assert has_more is True
        assert next_cursor == 2
        mock_person_repo.get_multi.assert_called_once_with(
            cursor=None, limit=2, order_by="id", descending=False
        )

    @pytest.mark.asyncio
    async def test_list_persons_with_cursor(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test listing persons with cursor pagination."""
        # Arrange
        mock_people = [Person(id=3, name="Person 3")]
        mock_person_repo.get_multi.return_value = (mock_people, False, None)

        # Act
        people, has_more, next_cursor = await person_service.list(cursor=2, limit=2)

        # Assert
        assert len(people) == 1
        assert has_more is False
        assert next_cursor is None
        mock_person_repo.get_multi.assert_called_once_with(
            cursor=2, limit=2, order_by="id", descending=False
        )

    @pytest.mark.asyncio
    async def test_update_person(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test updating a person."""
        # Arrange
        existing_person = Person(id=1, name="Old Name", interests=["Old"])
        updated_person = Person(
            id=1, name="New Name", interests=["Reading", "Gaming"]
        )

        mock_person_repo.get.return_value = existing_person
        mock_person_repo.update.return_value = updated_person

        update_data = PersonUpdate(name="New Name", interests=["Reading", "Gaming"])

        # Act
        result = await person_service.update(person_id=1, data=update_data)

        # Assert
        assert result is not None
        assert result.name == "New Name"
        assert result.interests == ["Reading", "Gaming"]
        mock_person_repo.update.assert_called_once()

    @pytest.mark.asyncio
    async def test_update_person_partial(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test partial update of person."""
        # Arrange
        existing_person = Person(
            id=1, name="John", interests=["Reading"], sizes={"shirt": "M"}
        )

        mock_person_repo.get.return_value = existing_person
        mock_person_repo.update.return_value = Person(
            id=1, name="John", interests=["Reading"], sizes={"shirt": "L"}
        )

        update_data = PersonUpdate(sizes={"shirt": "L"})

        # Act
        result = await person_service.update(person_id=1, data=update_data)

        # Assert
        assert result is not None
        assert result.sizes == {"shirt": "L"}

    @pytest.mark.asyncio
    async def test_update_person_not_found(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test updating non-existent person returns None."""
        # Arrange
        mock_person_repo.get.return_value = None

        update_data = PersonUpdate(name="New Name")

        # Act
        result = await person_service.update(person_id=999, data=update_data)

        # Assert
        assert result is None
        mock_person_repo.get.assert_called_once_with(999)
        mock_person_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_update_person_no_changes(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test updating person with no actual changes."""
        # Arrange
        existing_person = Person(id=1, name="John")
        mock_person_repo.get.return_value = existing_person

        # Update with no fields set
        update_data = PersonUpdate()

        # Act
        result = await person_service.update(person_id=1, data=update_data)

        # Assert
        assert result is not None
        assert result.name == "John"
        mock_person_repo.update.assert_not_called()

    @pytest.mark.asyncio
    async def test_delete_person_success(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test deleting a person successfully."""
        # Arrange
        mock_person_repo.delete.return_value = True

        # Act
        result = await person_service.delete(person_id=1)

        # Assert
        assert result is True
        mock_person_repo.delete.assert_called_once_with(1)

    @pytest.mark.asyncio
    async def test_delete_person_not_found(
        self, person_service: PersonService, mock_person_repo: AsyncMock
    ) -> None:
        """Test deleting non-existent person returns False."""
        # Arrange
        mock_person_repo.delete.return_value = False

        # Act
        result = await person_service.delete(person_id=999)

        # Assert
        assert result is False
        mock_person_repo.delete.assert_called_once_with(999)
