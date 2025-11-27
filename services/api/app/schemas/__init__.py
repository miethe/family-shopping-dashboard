"""Pydantic schemas (DTOs) for the Family Gifting Dashboard API.

These schemas define the data transfer objects used for API request/response
validation and serialization. They are separate from ORM models.

Architecture:
    Router (schemas) → Service (ORM → schema) → Repository (ORM)
"""

from app.schemas.base import (
    BaseSchema,
    ErrorDetail,
    ErrorResponse,
    PaginatedResponse,
    TimestampSchema,
)
from app.schemas.gift import GiftCreate, GiftResponse, GiftUpdate
from app.schemas.list import ListCreate, ListResponse, ListUpdate
from app.schemas.list_item import ListItemCreate, ListItemResponse, ListItemUpdate
from app.schemas.occasion import OccasionCreate, OccasionResponse, OccasionUpdate
from app.schemas.person import PersonCreate, PersonResponse, PersonUpdate
from app.schemas.tag import TagCreate, TagResponse, TagUpdate
from app.schemas.comment import CommentCreate, CommentResponse, CommentUpdate
from app.schemas.dashboard import DashboardOccasionSummary, DashboardResponse, PersonSummary
from app.schemas.user import UserCreate, UserResponse

__all__ = [
    # Base
    "BaseSchema",
    "TimestampSchema",
    "PaginatedResponse",
    "ErrorDetail",
    "ErrorResponse",
    # User
    "UserCreate",
    "UserResponse",
    # Person
    "PersonCreate",
    "PersonResponse",
    "PersonUpdate",
    # Occasion
    "OccasionCreate",
    "OccasionResponse",
    "OccasionUpdate",
    # List
    "ListCreate",
    "ListResponse",
    "ListUpdate",
    # Gift
    "GiftCreate",
    "GiftResponse",
    "GiftUpdate",
    # ListItem
    "ListItemCreate",
    "ListItemResponse",
    "ListItemUpdate",
    # Tag
    "TagCreate",
    "TagResponse",
    "TagUpdate",
    # Comment
    "CommentCreate",
    "CommentResponse",
    "CommentUpdate",
    # Dashboard
    "DashboardResponse",
    "DashboardOccasionSummary",
    "PersonSummary",
]
