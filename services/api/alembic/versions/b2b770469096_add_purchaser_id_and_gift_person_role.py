"""add_purchaser_id_and_gift_person_role

Revision ID: b2b770469096
Revises: b1b18e1a4691
Create Date: 2025-12-06 21:08:43.971160

Phase 1 of planned-v1: Add purchaser tracking to gifts

Changes:
- Add purchaser_id FK to gifts table (who is buying the gift)
- Add role enum to gift_people junction table (recipient/purchaser/contributor)
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'b2b770469096'
down_revision = 'b1b18e1a4691'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create the gift_person_role enum type
    gift_person_role = sa.Enum('recipient', 'purchaser', 'contributor', name='gift_person_role')
    gift_person_role.create(op.get_bind(), checkfirst=True)

    # Add purchaser_id column to gifts table
    op.add_column('gifts', sa.Column('purchaser_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_gifts_purchaser_id'), 'gifts', ['purchaser_id'], unique=False)
    op.create_foreign_key(
        'fk_gifts_purchaser_id_persons',
        'gifts',
        'persons',
        ['purchaser_id'],
        ['id'],
        ondelete='SET NULL'
    )

    # Add role column to gift_people table with default 'recipient'
    op.add_column(
        'gift_people',
        sa.Column(
            'role',
            sa.Enum('recipient', 'purchaser', 'contributor', name='gift_person_role', create_type=False),
            nullable=False,
            server_default='recipient'
        )
    )

    # Create the new unique constraint with role
    op.create_unique_constraint('uq_gift_person_role', 'gift_people', ['gift_id', 'person_id', 'role'])


def downgrade() -> None:
    # Drop unique constraint
    op.drop_constraint('uq_gift_person_role', 'gift_people', type_='unique')

    # Remove role column from gift_people
    op.drop_column('gift_people', 'role')

    # Remove purchaser_id from gifts
    op.drop_constraint('fk_gifts_purchaser_id_persons', 'gifts', type_='foreignkey')
    op.drop_index(op.f('ix_gifts_purchaser_id'), table_name='gifts')
    op.drop_column('gifts', 'purchaser_id')

    # Drop the enum type
    gift_person_role = sa.Enum('recipient', 'purchaser', 'contributor', name='gift_person_role')
    gift_person_role.drop(op.get_bind(), checkfirst=True)
