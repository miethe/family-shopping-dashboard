"""add activity_logs table

Revision ID: be6fd164193f
Revises: 39be0dfc7e1d
Create Date: 2025-12-01 22:20:58.894824

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision = 'be6fd164193f'
down_revision = '39be0dfc7e1d'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create activity_logs table
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
        sa.Column('action', sa.String(length=50), nullable=False, comment='Type of action performed'),
        sa.Column('actor_id', sa.Integer(), nullable=False, comment='User who performed the action'),
        sa.Column('entity_type', sa.String(length=50), nullable=False, comment='Type of entity affected'),
        sa.Column('entity_id', sa.Integer(), nullable=False, comment='ID of the affected entity'),
        sa.Column('entity_name', sa.String(length=255), nullable=False, comment='Denormalized entity name for display'),
        sa.Column('extra_data', sa.JSON(), nullable=True, comment='Additional context (old/new values, etc.)'),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        comment='Activity log for tracking user actions and displaying recent activity feed'
    )

    # Create indexes
    op.create_index('ix_activity_logs_action', 'activity_logs', ['action'])
    op.create_index('ix_activity_logs_actor_id', 'activity_logs', ['actor_id'])
    op.create_index('ix_activity_logs_entity_type', 'activity_logs', ['entity_type'])
    op.create_index('ix_activity_logs_created_at', 'activity_logs', ['created_at'])
    op.create_index('ix_activity_logs_actor_entity', 'activity_logs', ['actor_id', 'entity_type'])


def downgrade() -> None:
    # Drop indexes
    op.drop_index('ix_activity_logs_actor_entity', table_name='activity_logs')
    op.drop_index('ix_activity_logs_created_at', table_name='activity_logs')
    op.drop_index('ix_activity_logs_entity_type', table_name='activity_logs')
    op.drop_index('ix_activity_logs_actor_id', table_name='activity_logs')
    op.drop_index('ix_activity_logs_action', table_name='activity_logs')

    # Drop table
    op.drop_table('activity_logs')
