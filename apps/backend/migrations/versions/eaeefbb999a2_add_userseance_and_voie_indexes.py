"""add userseance and voie indexes

Revision ID: eaeefbb999a2
Revises: b8e53f42f1e8
Create Date: 2026-09-11 13:20:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'eaeefbb999a2'
down_revision = 'b8e53f42f1e8'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_index('ix_userseance_user_id_date', 'userseance', ['user_id', 'date'], unique=False)
    op.create_index('ix_userseance_voie_id', 'userseance', ['voie_id'], unique=False)
    op.create_index('ix_voie_versionvoie_id', 'voie', ['versionvoie_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_voie_versionvoie_id', table_name='voie')
    op.drop_index('ix_userseance_voie_id', table_name='userseance')
    op.drop_index('ix_userseance_user_id_date', table_name='userseance')
