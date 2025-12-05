"""Add anniversary field to persons table

Revision ID: 003_person_anniversary
Revises: 002_person_occasions
Create Date: 2025-12-04 21:40:00.000000

Changes:
- Add anniversary (date, nullable) field to persons table
- Add index for anniversary date lookups

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003_person_anniversary'
down_revision = '002_person_occasions'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add anniversary field to persons table."""

    # Add anniversary column (nullable for existing records)
    op.add_column(
        'persons',
        sa.Column('anniversary', sa.Date(), nullable=True)
    )

    # Add index for anniversary lookups (useful for finding upcoming anniversaries)
    op.create_index(
        'idx_persons_anniversary',
        'persons',
        ['anniversary']
    )


def downgrade() -> None:
    """Remove anniversary field from persons table."""

    # Drop index
    op.drop_index('idx_persons_anniversary', table_name='persons')

    # Drop column
    op.drop_column('persons', 'anniversary')
