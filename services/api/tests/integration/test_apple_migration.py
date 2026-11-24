"""Test the additive Apple migration against a disposable legacy schema."""

from pathlib import Path

import pytest
import sqlalchemy as sa
from alembic.config import Config

from alembic import command
from app.core.config import settings


def test_apple_migration_preserves_legacy_accounts_and_data(
    tmp_path: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    path = tmp_path / "apple-migration.db"
    engine = sa.create_engine(f"sqlite:///{path}")
    monkeypatch.setattr(settings, "DATABASE_URL", f"sqlite+aiosqlite:///{path}")
    api_dir = Path(__file__).parents[2]
    config = Config(str(api_dir / "alembic.ini"))
    config.set_main_option("script_location", str(api_dir / "alembic"))

    try:
        with engine.begin() as conn:
            conn.exec_driver_sql(
                "CREATE TABLE users (id INTEGER PRIMARY KEY, email VARCHAR(320) NOT NULL, "
                "password_hash VARCHAR(255) NOT NULL, created_at DATETIME NOT NULL, "
                "updated_at DATETIME NOT NULL)"
            )
            conn.exec_driver_sql("CREATE UNIQUE INDEX ix_users_email ON users(email)")
            conn.exec_driver_sql(
                "CREATE TABLE lists (id INTEGER PRIMARY KEY, user_id INTEGER REFERENCES users(id))"
            )
            conn.exec_driver_sql(
                "INSERT INTO users VALUES "
                "(41, 'legacy@example.com', 'legacy-hash', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
            )
            conn.exec_driver_sql("INSERT INTO lists VALUES (1, 41)")
            old_columns = conn.exec_driver_sql("PRAGMA table_info(users)").all()
            old_indexes = sa.inspect(conn).get_indexes("users")

        command.stamp(config, "a84_holidays")
        command.upgrade(config, "head")
        with engine.begin() as conn:
            assert (
                conn.exec_driver_sql("SELECT apple_subject FROM users WHERE id = 41").scalar()
                is None
            )
            conn.exec_driver_sql(
                "INSERT INTO users VALUES "
                "(42, 'apple@example.com', '!', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'subject')"
            )
            with pytest.raises(sa.exc.IntegrityError):
                conn.exec_driver_sql("UPDATE users SET apple_subject = 'subject' WHERE id = 41")
            conn.exec_driver_sql("INSERT INTO lists VALUES (2, 42)")

        command.downgrade(config, "a84_holidays")
        with engine.connect() as conn:
            assert conn.exec_driver_sql("PRAGMA table_info(users)").all() == old_columns
            assert sa.inspect(conn).get_indexes("users") == old_indexes
            assert conn.exec_driver_sql(
                "SELECT id, email, password_hash FROM users ORDER BY id"
            ).all() == [(41, "legacy@example.com", "legacy-hash"), (42, "apple@example.com", "!")]
            assert conn.exec_driver_sql("SELECT id, user_id FROM lists ORDER BY id").all() == [
                (1, 41),
                (2, 42),
            ]
    finally:
        engine.dispose()
