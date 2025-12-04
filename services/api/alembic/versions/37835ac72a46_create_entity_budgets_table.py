"""create_entity_budgets_table

Revision ID: 37835ac72a46
Revises: 59b95e08971c
Create Date: 2025-12-04 14:25:36.687572

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '37835ac72a46'
down_revision = '59b95e08971c'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create entity_budgets table
    op.create_table(
        'entity_budgets',
        sa.Column('occasion_id', sa.Integer(), nullable=False),
        sa.Column('entity_type', sa.String(length=50), nullable=False),
        sa.Column('entity_id', sa.Integer(), nullable=False),
        sa.Column('budget_amount', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['occasion_id'], ['occasions.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create indexes for efficient lookups
    op.create_index('ix_entity_budgets_occasion_id', 'entity_budgets', ['occasion_id'], unique=False)
    op.create_index('ix_entity_budgets_entity', 'entity_budgets', ['entity_type', 'entity_id'], unique=False)

    # Create unique constraint to prevent duplicate budgets for the same entity within an occasion
    op.create_index(
        'ix_entity_budgets_unique',
        'entity_budgets',
        ['occasion_id', 'entity_type', 'entity_id'],
        unique=True
    )


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_entity_budgets_unique', table_name='entity_budgets')
    op.drop_index('ix_entity_budgets_entity', table_name='entity_budgets')
    op.drop_index('ix_entity_budgets_occasion_id', table_name='entity_budgets')

    # Drop table
    op.drop_table('entity_budgets')
