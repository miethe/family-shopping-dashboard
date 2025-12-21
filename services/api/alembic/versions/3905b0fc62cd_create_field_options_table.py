"""create field_options table

Revision ID: 3905b0fc62cd
Revises: d7b9b25e3eda
Create Date: 2025-12-21 15:05:55.272214

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '3905b0fc62cd'
down_revision = 'd7b9b25e3eda'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create field_options table
    op.create_table(
        'field_options',
        sa.Column('id', sa.BigInteger(), nullable=False, autoincrement=True),
        sa.Column('entity', sa.String(length=50), nullable=False),
        sa.Column('field_name', sa.String(length=100), nullable=False),
        sa.Column('value', sa.String(length=255), nullable=False),
        sa.Column('display_label', sa.String(length=255), nullable=False),
        sa.Column('display_order', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('is_system', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'),
        sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text('NOW()')
        ),
        sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text('NOW()')
        ),
        sa.Column('created_by', sa.Integer(), nullable=True),
        sa.Column('updated_by', sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('entity', 'field_name', 'value', name='uq_field_options_entity_field_value'),
        sa.ForeignKeyConstraint(
            ['created_by'],
            ['users.id'],
            name='fk_field_options_created_by',
            ondelete='SET NULL'
        ),
        sa.ForeignKeyConstraint(
            ['updated_by'],
            ['users.id'],
            name='fk_field_options_updated_by',
            ondelete='SET NULL'
        )
    )

    # Create index for efficient lookups by entity, field_name, and is_active
    op.create_index(
        'idx_field_options_entity_field',
        'field_options',
        ['entity', 'field_name', 'is_active'],
        unique=False
    )


def downgrade() -> None:
    # Drop index first
    op.drop_index('idx_field_options_entity_field', table_name='field_options')

    # Drop table (cascades constraints automatically)
    op.drop_table('field_options')
