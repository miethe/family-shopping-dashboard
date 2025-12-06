"""add comment visibility and gift parent type

Revision ID: 1d2e5f3c4b21
Revises: 7a6f30d7b2b2
Create Date: 2025-12-05 21:30:00.000000

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "1d2e5f3c4b21"
down_revision = "7a6f30d7b2b2"
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add visibility enum/column and extend parent type enum with gift."""
    # Add visibility enum/type
    comment_visibility = postgresql.ENUM(
        "public", "private", name="commentvisibility", create_type=False
    )
    comment_visibility.create(op.get_bind(), checkfirst=True)

    op.add_column(
        "comments",
        sa.Column(
            "visibility",
            comment_visibility,
            nullable=False,
            server_default="public",
        ),
    )

    # Replace parent index with visibility-aware index
    # Note: Index was renamed from idx_ to ix_ in migration 39be0dfc7e1d
    op.drop_index(
        "ix_comments_parent_type_parent_id",
        table_name="comments",
    )
    op.create_index(
        "idx_comments_parent_type_parent_id_visibility",
        "comments",
        ["parent_type", "parent_id", "visibility"],
        unique=False,
    )

    # Extend enum for parent_type
    op.execute("ALTER TYPE commentparenttype ADD VALUE IF NOT EXISTS 'gift'")


def downgrade() -> None:
    """Revert visibility column and parent_type enum addition."""
    # Drop new index and restore original
    op.drop_index(
        "idx_comments_parent_type_parent_id_visibility",
        table_name="comments",
    )
    # Restore index with ix_ prefix (as renamed in migration 39be0dfc7e1d)
    op.create_index(
        "ix_comments_parent_type_parent_id",
        "comments",
        ["parent_type", "parent_id"],
        unique=False,
    )

    # Remove visibility column
    op.drop_column("comments", "visibility")
    op.execute("DROP TYPE IF EXISTS commentvisibility")

    # Recreate commentparenttype without gift
    bind = op.get_bind()
    old_enum = postgresql.ENUM(
        "list_item", "list", "occasion", "person", name="commentparenttype_old"
    )
    new_enum = postgresql.ENUM(
        "list_item", "list", "occasion", "person", name="commentparenttype"
    )

    # Rename existing type, create new type, and alter column
    op.execute("ALTER TYPE commentparenttype RENAME TO commentparenttype_old")
    new_enum.create(bind, checkfirst=True)
    op.alter_column(
        "comments",
        "parent_type",
        existing_type=old_enum,
        type_=new_enum,
        postgresql_using="parent_type::text::commentparenttype",
    )
    op.execute("DROP TYPE commentparenttype_old")
