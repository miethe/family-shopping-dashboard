"""initial_schema

Revision ID: e5d8200343c6
Revises:
Create Date: 2025-11-26 17:02:57.718527

"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = "e5d8200343c6"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create ENUMs first
    occasion_type = postgresql.ENUM(
        "birthday", "holiday", "other", name="occasiontype", create_type=False
    )
    occasion_type.create(op.get_bind(), checkfirst=True)

    list_type = postgresql.ENUM(
        "wishlist", "ideas", "assigned", name="listtype", create_type=False
    )
    list_type.create(op.get_bind(), checkfirst=True)

    list_visibility = postgresql.ENUM(
        "private", "family", "public", name="listvisibility", create_type=False
    )
    list_visibility.create(op.get_bind(), checkfirst=True)

    list_item_status = postgresql.ENUM(
        "idea", "selected", "purchased", "received", name="listitemstatus", create_type=False
    )
    list_item_status.create(op.get_bind(), checkfirst=True)

    comment_parent_type = postgresql.ENUM(
        "list_item", "list", "occasion", "person", name="commentparenttype", create_type=False
    )
    comment_parent_type.create(op.get_bind(), checkfirst=True)

    # Create users table
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=320), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    # Create persons table
    op.create_table(
        "persons",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("interests", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("sizes", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_persons_name", "persons", ["name"], unique=False)

    # Create occasions table
    op.create_table(
        "occasions",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "type",
            occasion_type,  # Use the already-created enum object
            nullable=False,
        ),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_occasions_date", "occasions", ["date"], unique=False)
    op.create_index("idx_occasions_type", "occasions", ["type"], unique=False)

    # Create gifts table
    op.create_table(
        "gifts",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("url", sa.Text(), nullable=True),
        sa.Column("price", sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=True),
        sa.Column("source", sa.Text(), nullable=True),
        sa.Column(
            "extra_data",
            postgresql.JSONB(astext_type=sa.Text()),
            server_default="{}",
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_gifts_name", "gifts", ["name"], unique=False)

    # Create tags table
    op.create_table(
        "tags",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )
    op.create_index("ix_tags_name", "tags", ["name"], unique=True)

    # Create lists table (depends on users, persons, occasions)
    op.create_table(
        "lists",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column(
            "type",
            list_type,  # Use the already-created enum object
            nullable=False,
        ),
        sa.Column(
            "visibility",
            list_visibility,  # Use the already-created enum object
            server_default="family",
            nullable=False,
        ),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("person_id", sa.Integer(), nullable=True),
        sa.Column("occasion_id", sa.Integer(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["occasion_id"], ["occasions.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["person_id"], ["persons.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_lists_occasion_id", "lists", ["occasion_id"], unique=False)
    op.create_index("idx_lists_person_id", "lists", ["person_id"], unique=False)
    op.create_index("idx_lists_type", "lists", ["type"], unique=False)
    op.create_index("idx_lists_user_id", "lists", ["user_id"], unique=False)
    op.create_index("idx_lists_visibility", "lists", ["visibility"], unique=False)
    op.create_index("idx_lists_user_id_type", "lists", ["user_id", "type"], unique=False)

    # Create list_items table (depends on gifts, lists, users)
    op.create_table(
        "list_items",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("gift_id", sa.Integer(), nullable=False),
        sa.Column("list_id", sa.Integer(), nullable=False),
        sa.Column(
            "status",
            list_item_status,  # Use the already-created enum object
            server_default="idea",
            nullable=False,
        ),
        sa.Column("assigned_to", sa.Integer(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(["gift_id"], ["gifts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["list_id"], ["lists.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("gift_id", "list_id", name="uq_list_items_gift_list"),
    )
    op.create_index("idx_list_items_assigned_to", "list_items", ["assigned_to"], unique=False)
    op.create_index("idx_list_items_gift_id", "list_items", ["gift_id"], unique=False)
    op.create_index("idx_list_items_list_id", "list_items", ["list_id"], unique=False)
    op.create_index("idx_list_items_status", "list_items", ["status"], unique=False)
    op.create_index("idx_list_items_list_id_status", "list_items", ["list_id", "status"], unique=False)

    # Create gift_tags association table
    op.create_table(
        "gift_tags",
        sa.Column("gift_id", sa.Integer(), nullable=False),
        sa.Column("tag_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(["gift_id"], ["gifts.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("gift_id", "tag_id"),
    )

    # Create comments table (depends on users)
    op.create_table(
        "comments",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("author_id", sa.Integer(), nullable=False),
        sa.Column(
            "parent_type",
            comment_parent_type,  # Use the already-created enum object
            nullable=False,
        ),
        sa.Column("parent_id", sa.Integer(), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False,
        ),
        sa.ForeignKeyConstraint(["author_id"], ["users.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("idx_comments_author_id", "comments", ["author_id"], unique=False)
    op.create_index(
        "idx_comments_parent_type_parent_id",
        "comments",
        ["parent_type", "parent_id"],
        unique=False,
    )


def downgrade() -> None:
    # Drop tables in reverse order (respecting foreign key dependencies)
    op.drop_table("comments")
    op.drop_table("gift_tags")
    op.drop_table("list_items")
    op.drop_table("lists")
    op.drop_table("tags")
    op.drop_table("gifts")
    op.drop_table("occasions")
    op.drop_table("persons")
    op.drop_table("users")

    # Drop ENUMs
    op.execute("DROP TYPE IF EXISTS commentparenttype")
    op.execute("DROP TYPE IF EXISTS listitemstatus")
    op.execute("DROP TYPE IF EXISTS listvisibility")
    op.execute("DROP TYPE IF EXISTS listtype")
    op.execute("DROP TYPE IF EXISTS occasiontype")
