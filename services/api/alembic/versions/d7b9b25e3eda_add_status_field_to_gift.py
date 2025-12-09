"""add_status_field_to_gift

Revision ID: d7b9b25e3eda
Revises: 5d80cbe06073
Create Date: 2025-12-08 22:26:07.538748

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'd7b9b25e3eda'
down_revision = '5d80cbe06073'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the giftstatus enum type
    giftstatus = postgresql.ENUM('idea', 'selected', 'purchased', 'received', name='giftstatus', create_type=False)
    giftstatus.create(op.get_bind(), checkfirst=True)

    # Add status column to gifts table with default value
    op.add_column('gifts', sa.Column('status', sa.Enum('idea', 'selected', 'purchased', 'received', name='giftstatus'), server_default='idea', nullable=False))


def downgrade() -> None:
    # Drop status column
    op.drop_column('gifts', 'status')

    # Drop the enum type
    op.execute('DROP TYPE IF EXISTS giftstatus')
