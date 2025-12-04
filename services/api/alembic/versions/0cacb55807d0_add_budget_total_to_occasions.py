"""add budget_total to occasions

Revision ID: 0cacb55807d0
Revises: be6fd164193f
Create Date: 2025-12-04 14:24:12.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '0cacb55807d0'
down_revision = 'be6fd164193f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add budget_total column to occasions table
    op.add_column('occasions', sa.Column('budget_total', sa.Numeric(precision=10, scale=2), nullable=True))


def downgrade() -> None:
    # Remove budget_total column from occasions table
    op.drop_column('occasions', 'budget_total')
