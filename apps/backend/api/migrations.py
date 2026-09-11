"""Database schema migrations, powered by Alembic.

Every schema change must go through a new revision in
`apps/backend/migrations/versions/` (generate one with `make migration`).
The app applies pending migrations automatically at startup.
"""

from pathlib import Path

from alembic import command
from alembic.config import Config
from sqlalchemy import inspect, text

from .db import engine
from . import models  # noqa: F401  (imports register every table on the metadata)

BACKEND_DIR = Path(__file__).resolve().parents[1]


def alembic_config() -> Config:
    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.set_main_option("script_location", str(BACKEND_DIR / "migrations"))
    return config


def _apply_legacy_fixes() -> None:
    """Idempotent additive fixes for databases created before Alembic."""
    with engine.begin() as connection:
        inspector = inspect(connection)
        tables = inspector.get_table_names()

        if "user" in tables and "group_id" not in {column["name"] for column in inspector.get_columns("user")}:
            connection.execute(text('ALTER TABLE "user" ADD COLUMN group_id INTEGER REFERENCES usergroup(id)'))

        if "versionvoie" in tables:
            version_columns = {column["name"] for column in inspector.get_columns("versionvoie")}
            if "parent_version_id" not in version_columns:
                connection.execute(text("ALTER TABLE versionvoie ADD COLUMN parent_version_id INTEGER REFERENCES versionvoie(id)"))
            if "subversion" not in version_columns:
                connection.execute(text("ALTER TABLE versionvoie ADD COLUMN subversion INTEGER NOT NULL DEFAULT 0"))
            if "end_date" not in version_columns:
                connection.execute(text("ALTER TABLE versionvoie ADD COLUMN end_date TIMESTAMP NULL"))
                # Reconstruct validity periods the same way c3d8f61a94b7 does:
                # each version stays valid until the next one starts, the
                # active one (if the legacy column exists) remains open.
                selected_columns = "id, date, active" if "active" in version_columns else "id, date"
                rows = connection.execute(
                    text(f"SELECT {selected_columns} FROM versionvoie ORDER BY date ASC, id ASC")
                ).fetchall()
                has_active_column = "active" in version_columns
                for index, row in enumerate(rows):
                    if (has_active_column and row.active) or index + 1 >= len(rows):
                        end_date = None
                    else:
                        end_date = rows[index + 1].date
                    connection.execute(
                        text("UPDATE versionvoie SET end_date = :end_date WHERE id = :version_id"),
                        {"end_date": end_date, "version_id": row.id},
                    )

        if "voie" in tables and "source_voie_id" not in {column["name"] for column in inspector.get_columns("voie")}:
            connection.execute(text("ALTER TABLE voie ADD COLUMN source_voie_id INTEGER REFERENCES voie(id)"))

        # Databases stamped past head never run eaeefbb999a2, so create its
        # indexes here as well (idempotent).
        for table_name in ("userseance", "voie"):
            if table_name not in tables:
                continue
            existing_indexes = {index["name"] for index in inspector.get_indexes(table_name)}
            wanted_indexes = {
                "userseance": [("ix_userseance_user_id_date", ["user_id", "date"]), ("ix_userseance_voie_id", ["voie_id"])],
                "voie": [("ix_voie_versionvoie_id", ["versionvoie_id"])],
            }
            for index_name, columns in wanted_indexes[table_name]:
                if index_name not in existing_indexes:
                    connection.execute(text(f'CREATE INDEX {index_name} ON {table_name} ({", ".join(columns)})'))


def run_migrations() -> None:
    """Bring the database schema up to date with the migration history."""
    inspector = inspect(engine)
    tables = inspector.get_table_names()

    if not tables:
        command.upgrade(alembic_config(), "head")
    elif "alembic_version" not in tables:
        # Database created before Alembic: apply the legacy fixes, then
        # register it as up to date with the initial revision.
        _apply_legacy_fixes()
        command.stamp(alembic_config(), "head")
    else:
        command.upgrade(alembic_config(), "head")
