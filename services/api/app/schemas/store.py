"""Store schemas for CRUD operations."""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class StoreBase(BaseModel):
    """Base store schema with shared fields."""

    name: str = Field(..., min_length=1, max_length=255, description="Store name")
    url: str | None = Field(None, description="Optional URL to store website or product page")


class StoreCreate(StoreBase):
    """Schema for creating a new store."""

    pass


class StoreUpdate(BaseModel):
    """Schema for updating an existing store (all fields optional for partial updates)."""

    name: str | None = Field(None, min_length=1, max_length=255, description="Store name")
    url: str | None = Field(None, description="Optional URL to store website or product page")


class StoreResponse(StoreBase):
    """Schema for store responses including database fields."""

    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StoreWithGiftCount(StoreResponse):
    """Store response with count of associated gifts (for analytics)."""

    gift_count: int = Field(0, description="Number of gifts associated with this store")
