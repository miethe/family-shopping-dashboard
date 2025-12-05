"""add person advanced interests and size profile

Revision ID: 7a6f30d7b2b2
Revises: ca7196997ff4
Create Date: 2025-12-05 18:45:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '7a6f30d7b2b2'
down_revision = 'ca7196997ff4'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add advanced_interests and size_profile columns with backfill."""
    op.add_column('persons', sa.Column('advanced_interests', sa.JSON(), nullable=True))
    op.add_column('persons', sa.Column('size_profile', sa.JSON(), nullable=True))

    # Backfill size_profile from legacy sizes map
    conn = op.get_bind()
    persons_table = sa.table(
        'persons',
        sa.column('id', sa.Integer),
        sa.column('sizes', sa.JSON),
        sa.column('size_profile', sa.JSON),
    )

    result = conn.execute(sa.select(persons_table.c.id, persons_table.c.sizes))
    rows = result.fetchall()

    for row in rows:
        sizes = row.sizes or {}
        if not isinstance(sizes, dict) or not sizes:
            continue

        size_profile = []
        for raw_type, raw_value in sizes.items():
            size_type = str(raw_type).strip() if raw_type is not None else ""
            size_value = str(raw_value).strip() if raw_value is not None else ""
            if not size_type or not size_value:
                continue
            size_profile.append({"type": size_type, "value": size_value})

        if size_profile:
            conn.execute(
                sa.update(persons_table)
                .where(persons_table.c.id == row.id)
                .values(size_profile=size_profile)
            )


def downgrade() -> None:
    """Remove advanced_interests and size_profile columns."""
    op.drop_column('persons', 'size_profile')
    op.drop_column('persons', 'advanced_interests')
