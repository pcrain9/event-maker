"""event sponsors

Revision ID: 9c5f7d3d6e21
Revises: cf9364e36128
Create Date: 2026-04-11 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9c5f7d3d6e21'
down_revision = 'cf9364e36128'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('events', sa.Column('sponsors', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('events', 'sponsors')