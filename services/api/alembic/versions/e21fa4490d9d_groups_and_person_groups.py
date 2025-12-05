"""groups_and_person_groups

Revision ID: e21fa4490d9d
Revises: 268c9faeabe7
Create Date: 2025-12-04 21:19:10.994369

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e21fa4490d9d'
down_revision = '268c9faeabe7'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create groups table
    op.create_table(
        'groups',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('color', sa.String(length=7), nullable=True),  # Hex color code (e.g., "#FF5733")
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('name')
    )

    # Create index on name for lookups
    op.create_index('ix_groups_name', 'groups', ['name'], unique=True)

    # Create person_groups join table for person ↔ group many-to-many relationship
    op.create_table(
        'person_groups',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('person_id', sa.Integer(), nullable=False),
        sa.Column('group_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['person_id'], ['persons.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['group_id'], ['groups.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create unique constraint to prevent duplicate person-group memberships
    op.create_index(
        'uq_person_groups_person_group',
        'person_groups',
        ['person_id', 'group_id'],
        unique=True
    )

    # Create indexes for query performance
    op.create_index('ix_person_groups_person_id', 'person_groups', ['person_id'], unique=False)
    op.create_index('ix_person_groups_group_id', 'person_groups', ['group_id'], unique=False)


def downgrade() -> None:
    # Drop person_groups table and indexes
    op.drop_index('ix_person_groups_group_id', table_name='person_groups')
    op.drop_index('ix_person_groups_person_id', table_name='person_groups')
    op.drop_index('uq_person_groups_person_group', table_name='person_groups')
    op.drop_table('person_groups')

    # Drop groups table and indexes
    op.drop_index('ix_groups_name', table_name='groups')
    op.drop_table('groups')
