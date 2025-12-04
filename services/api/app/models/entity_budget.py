"""EntityBudget model for sub-budgets within occasions."""

from decimal import Decimal
from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Index, Numeric, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.occasion import Occasion


class EntityBudget(BaseModel):
    """
    EntityBudget model representing sub-budgets for gifts or lists within an occasion.

    This allows occasions to have fine-grained budget allocations for specific
    entities (gifts or lists), enabling better budget tracking and progression.

    Attributes:
        id: Primary key (inherited from BaseModel)
        occasion_id: Foreign key to Occasion (required)
        entity_type: Type of entity ("gift" or "list")
        entity_id: ID of the specific gift or list
        budget_amount: Allocated budget amount (DECIMAL(10,2) for currency precision)
        created_at: Timestamp of creation (inherited from BaseModel)
        updated_at: Timestamp of last update (inherited from BaseModel)
    """

    __tablename__ = "entity_budgets"

    # Foreign key to occasion
    occasion_id: Mapped[int] = mapped_column(
        ForeignKey("occasions.id", ondelete="CASCADE"),
        nullable=False,
    )

    # Entity type and ID (polymorphic reference)
    entity_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )

    entity_id: Mapped[int] = mapped_column(
        nullable=False,
    )

    # Budget amount
    budget_amount: Mapped[Decimal] = mapped_column(
        Numeric(10, 2),  # DECIMAL(10,2) for currency precision
        nullable=False,
    )

    # Relationships
    occasion: Mapped["Occasion"] = relationship(
        "Occasion",
        lazy="select",
    )

    # Table arguments for indexes
    __table_args__ = (
        Index("ix_entity_budgets_occasion_id", "occasion_id"),
        Index("ix_entity_budgets_entity", "entity_type", "entity_id"),
        # Unique constraint to prevent duplicate budgets for the same entity
        Index(
            "ix_entity_budgets_unique",
            "occasion_id",
            "entity_type",
            "entity_id",
            unique=True,
        ),
    )

    def __repr__(self) -> str:
        """String representation of EntityBudget."""
        return f"<EntityBudget(id={self.id}, occasion_id={self.occasion_id}, entity_type='{self.entity_type}', entity_id={self.entity_id}, budget_amount={self.budget_amount})>"
