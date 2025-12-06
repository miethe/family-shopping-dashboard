"""Change gift.additional_urls to JSON for labeled links."""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "f0d1f6c21c8f"
down_revision = "ca7196997ff4"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.alter_column(
        "gifts",
        "additional_urls",
        existing_type=postgresql.ARRAY(sa.Text()),
        type_=sa.JSON(),
        postgresql_using="to_json(additional_urls)",
        nullable=True,
    )


def downgrade() -> None:
    op.alter_column(
        "gifts",
        "additional_urls",
        existing_type=sa.JSON(),
        type_=postgresql.ARRAY(sa.Text()),
        postgresql_using="""
            (
                SELECT array_agg(elem::text)
                FROM json_array_elements(COALESCE(additional_urls, '[]'::json)) AS elem
            )
        """,
        nullable=True,
    )
