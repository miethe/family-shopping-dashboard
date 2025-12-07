"""Add updated_at to gift_people join table."""

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = "b1b18e1a4691"
down_revision = "8b7f5d2e1c5a"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add missing updated_at column to align with BaseModel."""
    op.add_column(
        "gift_people",
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
    )


def downgrade() -> None:
    """Remove updated_at column from gift_people."""
    op.drop_column("gift_people", "updated_at")
