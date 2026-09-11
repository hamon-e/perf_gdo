"""add versionvoie validity periods

Revision ID: c3d8f61a94b7
Revises: eaeefbb999a2
Create Date: 2026-09-11 14:05:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'c3d8f61a94b7'
down_revision = 'eaeefbb999a2'
branch_labels = None
depends_on = None


def _backfill_periods(connection) -> None:
    """Reconstruct validity periods from the legacy active flag: every version
    stays valid until the next one starts, the active one remains open."""
    rows = connection.execute(
        sa.text("SELECT id, date, active FROM versionvoie ORDER BY date ASC, id ASC")
    ).fetchall()
    for index, row in enumerate(rows):
        if row.active or index + 1 >= len(rows):
            end_date = None
        else:
            end_date = rows[index + 1].date
        connection.execute(
            sa.text("UPDATE versionvoie SET end_date = :end_date WHERE id = :version_id"),
            {"end_date": end_date, "version_id": row.id},
        )


def upgrade() -> None:
    op.add_column('versionvoie', sa.Column('end_date', sa.DateTime(), nullable=True))
    _backfill_periods(op.get_bind())
    op.drop_column('versionvoie', 'active')


def downgrade() -> None:
    op.add_column('versionvoie', sa.Column('active', sa.Boolean(), nullable=False, server_default=sa.false()))
    connection = op.get_bind()
    connection.execute(sa.text(
        "UPDATE versionvoie SET active = TRUE "
        "WHERE id = (SELECT id FROM versionvoie ORDER BY COALESCE(end_date, date) DESC, id DESC LIMIT 1)"
    ))
    op.drop_column('versionvoie', 'end_date')
