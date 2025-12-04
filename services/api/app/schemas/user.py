"""User DTOs for authentication and profile management."""

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.base import BaseSchema, TimestampSchema


class UserCreate(BaseModel):
    """DTO for creating a new user (registration)."""

    email: str = Field(
        ...,
        min_length=3,
        max_length=320,
        description="User email address (RFC 5321 max length)",
        examples=["user@example.com"],
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        description="Plain text password (will be hashed)",
    )


class UserUpdate(BaseModel):
    """DTO for updating user profile."""

    email: str | None = Field(
        None,
        min_length=3,
        max_length=320,
        description="New email address",
    )


class UserResponse(TimestampSchema):
    """DTO for user response (never includes password_hash)."""

    id: int
    email: str


class UserProfile(UserResponse):
    """Extended user profile with additional information."""

    # Future: add profile fields like name, avatar_url, etc.
    pass


class UserLogin(BaseModel):
    """DTO for user login request."""

    email: str = Field(..., description="User email address")
    password: str = Field(..., description="Plain text password")


class TokenResponse(BaseModel):
    """DTO for JWT token response."""

    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiry in seconds")
