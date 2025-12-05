"""gift_model_expansion

Revision ID: cf29065501d1
Revises: 268c9faeabe7
Create Date: 2025-12-04 21:19:35.225415

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'cf29065501d1'
down_revision = '268c9faeabe7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create priority enum type
    priority_enum = postgresql.ENUM('low', 'medium', 'high', name='gift_priority')
    priority_enum.create(op.get_bind(), checkfirst=True)

    # Add new columns to gifts table
    # Description field - longer text description of the gift
    op.add_column('gifts', sa.Column('description', sa.Text(), nullable=True))

    # Notes field - internal notes (not visible to recipient)
    op.add_column('gifts', sa.Column('notes', sa.Text(), nullable=True))

    # Priority field - importance/urgency of the gift
    op.add_column(
        'gifts',
        sa.Column(
            'priority',
            postgresql.ENUM('low', 'medium', 'high', name='gift_priority'),
            nullable=False,
            server_default='medium'
        )
    )

    # Quantity field - how many of this item to purchase
    op.add_column(
        'gifts',
        sa.Column('quantity', sa.Integer(), nullable=False, server_default='1')
    )

    # Sale price field - discounted/sale price if available
    op.add_column(
        'gifts',
        sa.Column('sale_price', sa.Numeric(precision=10, scale=2), nullable=True)
    )

    # Purchase date field - when the gift was purchased
    op.add_column('gifts', sa.Column('purchase_date', sa.Date(), nullable=True))

    # Additional URLs field - array of supplementary URLs (reviews, videos, etc.)
    op.add_column(
        'gifts',
        sa.Column('additional_urls', postgresql.ARRAY(sa.Text()), nullable=True)
    )

    # Create index on priority for filtering
    op.create_index('ix_gifts_priority', 'gifts', ['priority'], unique=False)

    # Create index on purchase_date for filtering purchased vs unpurchased gifts
    op.create_index('ix_gifts_purchase_date', 'gifts', ['purchase_date'], unique=False)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_gifts_purchase_date', table_name='gifts')
    op.drop_index('ix_gifts_priority', table_name='gifts')

    # Drop columns in reverse order
    op.drop_column('gifts', 'additional_urls')
    op.drop_column('gifts', 'purchase_date')
    op.drop_column('gifts', 'sale_price')
    op.drop_column('gifts', 'quantity')
    op.drop_column('gifts', 'priority')
    op.drop_column('gifts', 'notes')
    op.drop_column('gifts', 'description')

    # Drop priority enum type
    priority_enum = postgresql.ENUM('low', 'medium', 'high', name='gift_priority')
    priority_enum.drop(op.get_bind(), checkfirst=True)
