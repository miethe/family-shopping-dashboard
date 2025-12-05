"""gift_people_link

Revision ID: 268c9faeabe7
Revises: e5004eebd18f
Create Date: 2025-12-04 21:18:40.877153

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '268c9faeabe7'
down_revision = 'e5004eebd18f'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create gift_people join table for gift ↔ person many-to-many relationship
    op.create_table(
        'gift_people',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('gift_id', sa.Integer(), nullable=False),
        sa.Column('person_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['gift_id'], ['gifts.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['person_id'], ['persons.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create unique constraint to prevent duplicate gift-person links
    op.create_index(
        'uq_gift_people_gift_person',
        'gift_people',
        ['gift_id', 'person_id'],
        unique=True
    )

    # Create indexes for query performance
    op.create_index('ix_gift_people_gift_id', 'gift_people', ['gift_id'], unique=False)
    op.create_index('ix_gift_people_person_id', 'gift_people', ['person_id'], unique=False)


def downgrade() -> None:
    # Drop indexes first
    op.drop_index('ix_gift_people_person_id', table_name='gift_people')
    op.drop_index('ix_gift_people_gift_id', table_name='gift_people')
    op.drop_index('uq_gift_people_gift_person', table_name='gift_people')

    # Drop table
    op.drop_table('gift_people')
