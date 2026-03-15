"""footer links

Revision ID: cf9364e36128
Revises: 87e153041028
Create Date: 2026-03-15 13:14:49.958657

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'cf9364e36128'
down_revision = '87e153041028'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('events', sa.Column('footer_links', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('events', 'footer_links')
