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


def downgrade() -> None:
    op.drop_index("ix_users_apple_subject", table_name="users")
    op.drop_column("users", "apple_subject")
