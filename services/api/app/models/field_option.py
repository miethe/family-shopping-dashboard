"""FieldOption model for dynamic dropdown options."""

from typing import Optional

from sqlalchemy import Boolean, ForeignKey, Index, Integer, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import BaseModel


class FieldOption(BaseModel):
    """
    Field option for dynamic dropdowns and enums.

    Replaces hardcoded Python sets with database-driven options.
    Supports soft-delete via is_active flag.

    Attributes:
        id: Primary key (inherited from BaseModel)
        entity: Entity type (person, gift, occasion, list)
        field_name: Field identifier (wine_types, priority, etc.)
        value: Option value/key (immutable)
        display_label: Human-readable label
        display_order: Sort order in UI
        is_system: Whether this is a hardcoded system default
        is_active: Whether option is active (soft-delete)
        created_at: Timestamp (inherited)
        updated_at: Timestamp (inherited)
        created_by: ID of user who created
        updated_by: ID of user who last updated
    """

    __tablename__ = "field_options"
    __table_args__ = (
        UniqueConstraint("entity", "field_name", "value", name="uq_field_options_entity_field_value"),
        Index("idx_field_options_entity_field", "entity", "field_name", "is_active"),
    )

    entity: Mapped[str] = mapped_column(String(50), nullable=False)
    field_name: Mapped[str] = mapped_column(String(100), nullable=False)
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    display_label: Mapped[str] = mapped_column(String(255), nullable=False)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    is_system: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    created_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )
    updated_by: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True
    )

    def __repr__(self) -> str:
        return f"<FieldOption(entity='{self.entity}', field='{self.field_name}', value='{self.value}')>"
