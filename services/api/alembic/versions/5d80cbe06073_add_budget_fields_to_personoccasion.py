"""Add budget fields to PersonOccasion

Revision ID: 5d80cbe06073
Revises: b2b770469096
Create Date: 2025-12-07 21:55:06.380545

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5d80cbe06073'
down_revision = 'b2b770469096'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add budget fields to person_occasions table
    op.add_column(
        'person_occasions',
        sa.Column(
            'recipient_budget_total',
            sa.NUMERIC(precision=10, scale=2),
            nullable=True,
            comment='Budget for gifts TO this person for this occasion'
        )
    )
    op.add_column(
        'person_occasions',
        sa.Column(
            'purchaser_budget_total',
            sa.NUMERIC(precision=10, scale=2),
            nullable=True,
            comment='Budget for gifts BY this person for this occasion'
        )
    )

    # Create composite index for budget lookup queries
    op.create_index(
        'idx_person_occasions_budget_lookup',
        'person_occasions',
        ['person_id', 'occasion_id']
    )


def downgrade() -> None:
    # Remove index
    op.drop_index('idx_person_occasions_budget_lookup', table_name='person_occasions')

    # Remove columns
    op.drop_column('person_occasions', 'purchaser_budget_total')
    op.drop_column('person_occasions', 'recipient_budget_total')
