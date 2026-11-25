"""Reusable holiday definitions."""
from sqlalchemy import Boolean, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class Holiday(BaseModel):
    __tablename__ = "holidays"
    name: Mapped[str] = mapped_column(String(255))
    key: Mapped[str] = mapped_column(String(100), unique=True)
    recurrence_rule: Mapped[dict] = mapped_column(JSON)
    is_major: Mapped[bool] = mapped_column(Boolean, default=False, server_default="false")
    theme_key: Mapped[str | None] = mapped_column(String(100))
    theme_window_days: Mapped[int] = mapped_column(Integer, default=30, server_default="30")
