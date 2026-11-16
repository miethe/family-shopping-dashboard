"""Exercise authentication after repairing the dropped activity table."""

import importlib.util
from pathlib import Path

import pytest
from alembic.migration import MigrationContext
from alembic.operations import Operations
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncEngine


@pytest.mark.asyncio
async def test_auth_after_activity_table_repair(
    async_engine: AsyncEngine, client: AsyncClient, monkeypatch: pytest.MonkeyPatch
) -> None:
    # Model-based setup normally hides the table dropped by revision a9a8b7496861.
    path = Path(__file__).parents[2] / "alembic/versions/restore_activity_logs.py"
    spec = importlib.util.spec_from_file_location("restore_activity_logs", path)
    assert spec and spec.loader
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    async with async_engine.begin() as connection:
        await connection.execute(text("DROP TABLE activity_logs"))

        def upgrade(sync_connection):
            operations = Operations(MigrationContext.configure(sync_connection))
            monkeypatch.setattr(migration, "op", operations)
            migration.upgrade()

        await connection.run_sync(upgrade)

    credentials = {"email": "demo@example.com", "password": "password123"}
    assert (await client.post("/api/v1/auth/register", json=credentials)).status_code == 201
    login = await client.post("/api/v1/auth/login", json=credentials)
    assert login.status_code == 200
    token = login.json()["token"]["access_token"]
    response = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
