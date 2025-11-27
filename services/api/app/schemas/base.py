"""Base Pydantic schemas with common patterns."""

from datetime import datetime
from typing import Generic, TypeVar

from pydantic import BaseModel, ConfigDict

T = TypeVar("T")


class BaseSchema(BaseModel):
    """Base schema with ORM mode enabled."""

    model_config = ConfigDict(from_attributes=True)


class TimestampSchema(BaseSchema):
    """Schema mixin for entities with timestamps."""

    created_at: datetime
    updated_at: datetime


class PaginatedResponse(BaseSchema, Generic[T]):
    """Generic paginated response with cursor-based pagination."""

    items: list[T]
    has_more: bool
    next_cursor: int | None = None


class ErrorDetail(BaseModel):
    """Error detail structure."""

    code: str
    message: str
    trace_id: str | None = None


class ErrorResponse(BaseModel):
    """Standard error response envelope."""

    error: ErrorDetail
