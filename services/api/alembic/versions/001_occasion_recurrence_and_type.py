"""Add recurrence fields and update OccasionType enum

Revision ID: 001_occasion_recurrence
Revises: 37835ac72a46
Create Date: 2025-12-04 21:30:00.000000

Changes:
- Update OccasionType enum from {birthday, holiday, anniversary, other} to {holiday, recurring, other}
- Add recurrence_rule (JSONB) for storing recurrence patterns
- Add is_active (boolean) to track active recurring occasions
- Add next_occurrence (date) as computed helper field
- Add subtype (string) for birthday/anniversary classification under recurring
- Migrate existing 'birthday' → 'recurring' with subtype='birthday'

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from sqlalchemy import text

# revision identifiers, used by Alembic.
revision = '001_occasion_recurrence'
down_revision = '37835ac72a46'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add recurrence fields and update OccasionType enum."""

    # Step 1: Add new columns (all nullable initially for safe migration)
    op.add_column('occasions', sa.Column('recurrence_rule', postgresql.JSONB(), nullable=True))
    op.add_column('occasions', sa.Column('is_active', sa.Boolean(), nullable=True, server_default='true'))
    op.add_column('occasions', sa.Column('next_occurrence', sa.Date(), nullable=True))
    op.add_column('occasions', sa.Column('subtype', sa.String(50), nullable=True))

    # Step 2: Migrate existing 'birthday' occasions to 'recurring' with subtype
    # First, add temporary column for new type
    op.add_column('occasions', sa.Column('type_new', sa.String(20), nullable=True))

    # Update data migration
    connection = op.get_bind()

    # Set type_new based on current type
    connection.execute(text("""
        UPDATE occasions
        SET type_new = CASE
            WHEN type = 'birthday' THEN 'recurring'
            ELSE type::text
        END
    """))

    # Set subtype for birthday occasions
    connection.execute(text("""
        UPDATE occasions
        SET subtype = 'birthday'
        WHERE type = 'birthday'
    """))

    # Set is_active to true for all existing occasions (handle null)
    connection.execute(text("""
        UPDATE occasions
        SET is_active = true
        WHERE is_active IS NULL
    """))

    # Step 3: Drop old enum type and column
    op.drop_index('idx_occasions_type', table_name='occasions')
    op.drop_column('occasions', 'type')

    # Drop the old enum type
    connection.execute(text("DROP TYPE IF EXISTS occasiontype"))

    # Step 4: Create new enum type with updated values
    connection.execute(text("""
        CREATE TYPE occasiontype AS ENUM ('holiday', 'recurring', 'other')
    """))

    # Step 5: Add new type column with proper enum type
    op.add_column('occasions', sa.Column(
        'type',
        postgresql.ENUM('holiday', 'recurring', 'other', name='occasiontype', create_type=False),
        nullable=True
    ))

    # Step 6: Copy data from type_new to type
    connection.execute(text("""
        UPDATE occasions
        SET type = type_new::occasiontype
    """))

    # Step 7: Make type NOT NULL now that data is migrated
    op.alter_column('occasions', 'type', nullable=False)

    # Step 8: Make is_active NOT NULL
    op.alter_column('occasions', 'is_active', nullable=False, server_default='true')

    # Step 9: Drop temporary column
    op.drop_column('occasions', 'type_new')

    # Step 10: Recreate index
    op.create_index('idx_occasions_type', 'occasions', ['type'])

    # Step 11: Add index for is_active (for filtering active occasions)
    op.create_index('idx_occasions_is_active', 'occasions', ['is_active'])


def downgrade() -> None:
    """Revert recurrence fields and OccasionType enum changes."""

    connection = op.get_bind()

    # Step 1: Drop new indexes
    op.drop_index('idx_occasions_is_active', table_name='occasions')
    op.drop_index('idx_occasions_type', table_name='occasions')

    # Step 2: Add temporary column for data migration
    op.add_column('occasions', sa.Column('type_old', sa.String(20), nullable=True))

    # Step 3: Migrate data back - recurring with subtype=birthday → birthday
    connection.execute(text("""
        UPDATE occasions
        SET type_old = CASE
            WHEN type = 'recurring' AND subtype = 'birthday' THEN 'birthday'
            ELSE type::text
        END
    """))

    # Step 4: Drop current type column and enum
    op.drop_column('occasions', 'type')
    connection.execute(text("DROP TYPE IF EXISTS occasiontype"))

    # Step 5: Recreate old enum type
    connection.execute(text("""
        CREATE TYPE occasiontype AS ENUM ('birthday', 'holiday', 'other')
    """))

    # Step 6: Add type column with old enum
    op.add_column('occasions', sa.Column(
        'type',
        postgresql.ENUM('birthday', 'holiday', 'other', name='occasiontype', create_type=False),
        nullable=True
    ))

    # Step 7: Copy data back
    connection.execute(text("""
        UPDATE occasions
        SET type = type_old::occasiontype
    """))

    # Step 8: Make type NOT NULL
    op.alter_column('occasions', 'type', nullable=False)

    # Step 9: Drop temporary column
    op.drop_column('occasions', 'type_old')

    # Step 10: Recreate original index
    op.create_index('idx_occasions_type', 'occasions', ['type'])

    # Step 11: Drop new columns
    op.drop_column('occasions', 'subtype')
    op.drop_column('occasions', 'next_occurrence')
    op.drop_column('occasions', 'is_active')
    op.drop_column('occasions', 'recurrence_rule')
