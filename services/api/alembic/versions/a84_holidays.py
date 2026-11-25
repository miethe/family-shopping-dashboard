"""Add holiday catalog and optional occasion link.

Revision ID: a84_holidays
Revises: f3a1_event_occurrences
"""
import sqlalchemy as sa
from alembic import op

revision = "a84_holidays"
down_revision = "f3a1_event_occurrences"
branch_labels = None
depends_on = None


def upgrade():
    holidays = op.create_table(
        "holidays",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("key", sa.String(100), nullable=False, unique=True),
        sa.Column("recurrence_rule", sa.JSON, nullable=False),
        sa.Column("is_major", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("theme_key", sa.String(100)),
        sa.Column("theme_window_days", sa.Integer, nullable=False, server_default="30"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )
    if op.get_bind().dialect.name == "sqlite":
        op.execute("ALTER TABLE occasions ADD COLUMN holiday_id INTEGER REFERENCES holidays(id)")
    else:
        op.add_column("occasions", sa.Column("holiday_id", sa.Integer, nullable=True))
        op.create_foreign_key("fk_occasions_holiday_id", "occasions", "holidays", ["holiday_id"], ["id"])
    connection = op.get_bind()
    if connection.execute(sa.select(holidays.c.id).where(holidays.c.key == "christmas")).first() is None:
        connection.execute(holidays.insert().values(name="Christmas", key="christmas", recurrence_rule={"month": 12, "day": 25}, is_major=True, theme_key="christmas", theme_window_days=45))


def downgrade():
    if op.get_bind().dialect.name != "sqlite":
        op.drop_constraint("fk_occasions_holiday_id", "occasions", type_="foreignkey")
    op.drop_column("occasions", "holiday_id")
    op.drop_table("holidays")
