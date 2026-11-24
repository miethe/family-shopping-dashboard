"""Add an optional unique Apple subject to users.

Revision ID: b49_apple_subject
Revises: a84_holidays
"""

import sqlalchemy as sa

from alembic import op

revision = "b49_apple_subject"
down_revision = "a84_holidays"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("apple_subject", sa.String(255), nullable=True))
    op.create_index("ix_users_apple_subject", "users", ["apple_subject"], unique=True)
    op.create_table(
        "apple_challenges",
        sa.Column("nonce_hash", sa.String(64), primary_key=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_apple_challenges_expires_at", "apple_challenges", ["expires_at"])


def downgrade() -> None:
    op.drop_index("ix_apple_challenges_expires_at", table_name="apple_challenges")
    op.drop_table("apple_challenges")
    op.drop_index("ix_users_apple_subject", table_name="users")
    op.drop_column("users", "apple_subject")
