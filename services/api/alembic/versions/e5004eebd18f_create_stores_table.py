"""create_stores_table

Revision ID: e5004eebd18f
Revises: 37835ac72a46
Create Date: 2025-12-04 21:18:34.965755

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e5004eebd18f'
down_revision = '37835ac72a46'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create stores table
    op.create_table(
        'stores',
        sa.Column('name', sa.String(length=255), nullable=False),
        sa.Column('url', sa.Text(), nullable=True),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index on store name for search queries
    op.create_index('ix_stores_name', 'stores', ['name'], unique=False)

    # Create gift_stores join table
    op.create_table(
        'gift_stores',
        sa.Column('gift_id', sa.Integer(), nullable=False),
        sa.Column('store_id', sa.Integer(), nullable=False),
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['gift_id'], ['gifts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['store_id'], ['stores.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create unique constraint to prevent duplicate gift-store associations
    op.create_index(
        'ix_gift_stores_unique',
        'gift_stores',
        ['gift_id', 'store_id'],
        unique=True
    )

    # Create indexes for efficient lookups
    op.create_index('ix_gift_stores_gift_id', 'gift_stores', ['gift_id'], unique=False)
    op.create_index('ix_gift_stores_store_id', 'gift_stores', ['store_id'], unique=False)


def downgrade() -> None:
    # Drop gift_stores table and its indexes first (due to foreign key dependencies)
    op.drop_index('ix_gift_stores_store_id', table_name='gift_stores')
    op.drop_index('ix_gift_stores_gift_id', table_name='gift_stores')
    op.drop_index('ix_gift_stores_unique', table_name='gift_stores')
    op.drop_table('gift_stores')

    # Drop stores table and its indexes
    op.drop_index('ix_stores_name', table_name='stores')
    op.drop_table('stores')
