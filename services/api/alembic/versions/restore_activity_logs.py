"""Restore the activity table accidentally removed by a9a8b7496861.

Revision ID: c0f34d8e192a
Revises: a9a8b7496861
"""

import sqlalchemy as sa

from alembic import op

revision = "c0f34d8e192a"
down_revision = "a9a8b7496861"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "activity_logs",
        sa.Column("id", sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column("action", sa.String(50), nullable=False),
        sa.Column(
            "actor_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False
        ),
        sa.Column("entity_type", sa.String(50), nullable=False),
        sa.Column("entity_id", sa.Integer(), nullable=False),
        sa.Column("entity_name", sa.String(255), nullable=False),
        sa.Column("extra_data", sa.JSON(), nullable=True),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    )
    for name, columns in (
        ("action", ["action"]),
        ("actor_id", ["actor_id"]),
        ("entity_type", ["entity_type"]),
        ("created_at", ["created_at"]),
        ("actor_entity", ["actor_id", "entity_type"]),
    ):
        op.create_index(f"ix_activity_logs_{name}", "activity_logs", columns)


def downgrade() -> None:
    op.drop_table("activity_logs")
