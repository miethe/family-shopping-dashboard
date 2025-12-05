"""merge_all_heads

Revision ID: ca7196997ff4
Revises: 003_person_anniversary, cf29065501d1, e21fa4490d9d
Create Date: 2025-12-05 10:33:19.397141

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'ca7196997ff4'
down_revision = ('003_person_anniversary', 'cf29065501d1', 'e21fa4490d9d')
branch_labels = None
depends_on = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass
