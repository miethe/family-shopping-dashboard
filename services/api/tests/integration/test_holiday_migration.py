"""The additive migration preserves existing occasion rows on upgrade and downgrade."""
import importlib.util
from pathlib import Path
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import create_engine, text


def test_holiday_migration_round_trip(tmp_path, monkeypatch):
    engine = create_engine(f"sqlite:///{tmp_path / 'migration.db'}")
    path = Path(__file__).parents[2] / 'alembic/versions/a84_holidays.py'
    spec = importlib.util.spec_from_file_location('holiday_migration', path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    with engine.begin() as connection:
        connection.execute(text('CREATE TABLE occasions (id INTEGER PRIMARY KEY, name TEXT NOT NULL)'))
        connection.execute(text("INSERT INTO occasions VALUES (1, 'Example')"))
        monkeypatch.setattr(migration, 'op', Operations(MigrationContext.configure(connection)))
        migration.upgrade()
        assert connection.execute(text('SELECT name, theme_window_days FROM holidays')).one() == ('Christmas', 45)
        assert connection.execute(text('SELECT name, holiday_id FROM occasions')).one() == ('Example', None)
        migration.downgrade()
        assert connection.execute(text('SELECT name FROM occasions')).scalar_one() == 'Example'
        migration.upgrade()
        assert connection.execute(text('SELECT COUNT(*) FROM holidays')).scalar_one() == 1
    engine.dispose()
