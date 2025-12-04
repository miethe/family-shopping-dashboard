"""add price, discount_price, quantity to list_items

Revision ID: 6e0330de314e
Revises: be6fd164193f
Create Date: 2025-12-04 12:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = '6e0330de314e'
down_revision = 'be6fd164193f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """
    Add pricing and quantity columns to list_items table for budget tracking.

    These columns enable:
    - List-specific pricing (copied from Gift at creation)
    - Discount/sale prices
    - Multiple quantities of the same item
    - Accurate budget calculations per list
    """
    # Add price column (nullable, copied from Gift.price when list_item created)
    op.add_column(
        'list_items',
        sa.Column(
            'price',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='List-specific price (copied from Gift at creation)'
        )
    )

    # Add discount_price column (nullable, for sales/discounts)
    op.add_column(
        'list_items',
        sa.Column(
            'discount_price',
            sa.Numeric(precision=10, scale=2),
            nullable=True,
            comment='Optional sale/discount price'
        )
    )

    # Add quantity column (default 1, not nullable)
    op.add_column(
        'list_items',
        sa.Column(
            'quantity',
            sa.Integer(),
            nullable=False,
            server_default='1',
            comment='Quantity of items (default 1)'
        )
    )


def downgrade() -> None:
    """Remove pricing and quantity columns from list_items table."""
    op.drop_column('list_items', 'quantity')
    op.drop_column('list_items', 'discount_price')
    op.drop_column('list_items', 'price')
