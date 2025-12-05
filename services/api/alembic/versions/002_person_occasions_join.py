"""Create person_occasions join table for person-occasion many-to-many relationship

Revision ID: 002_person_occasions
Revises: 001_occasion_recurrence
Create Date: 2025-12-04 21:35:00.000000

Changes:
- Create person_occasions join table
- Add foreign keys to persons and occasions with CASCADE delete
- Add unique constraint on (person_id, occasion_id)
- Add indexes for efficient lookups

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '002_person_occasions'
down_revision = '001_occasion_recurrence'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create person_occasions join table."""

    # Create the join table
    op.create_table(
        'person_occasions',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('person_id', sa.Integer(), nullable=False),
        sa.Column('occasion_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),

        # Primary key
        sa.PrimaryKeyConstraint('id'),

        # Foreign keys with CASCADE delete
        sa.ForeignKeyConstraint(
            ['person_id'],
            ['persons.id'],
            name='fk_person_occasions_person_id',
            ondelete='CASCADE'
        ),
        sa.ForeignKeyConstraint(
            ['occasion_id'],
            ['occasions.id'],
            name='fk_person_occasions_occasion_id',
            ondelete='CASCADE'
        ),

        # Unique constraint - one link per person-occasion pair
        sa.UniqueConstraint('person_id', 'occasion_id', name='uq_person_occasions_person_occasion')
    )

    # Create indexes for efficient lookups in both directions
    op.create_index(
        'idx_person_occasions_person_id',
        'person_occasions',
        ['person_id']
    )
    op.create_index(
        'idx_person_occasions_occasion_id',
        'person_occasions',
        ['occasion_id']
    )

    # Optional: Create composite index for the unique constraint (PostgreSQL automatically creates this)
    # But explicit for query optimization
    op.create_index(
        'idx_person_occasions_person_occasion',
        'person_occasions',
        ['person_id', 'occasion_id'],
        unique=True
    )


def downgrade() -> None:
    """Drop person_occasions join table."""

    # Drop indexes
    op.drop_index('idx_person_occasions_person_occasion', table_name='person_occasions')
    op.drop_index('idx_person_occasions_occasion_id', table_name='person_occasions')
    op.drop_index('idx_person_occasions_person_id', table_name='person_occasions')

    # Drop table (foreign keys and constraints are dropped automatically)
    op.drop_table('person_occasions')
