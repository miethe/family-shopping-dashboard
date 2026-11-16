"""Opt-in real PostgreSQL regression: fresh Alembic schema, register, login, /me.

Set TEST_FRESH_POSTGRES_URL to an EMPTY disposable PostgreSQL database. This test
refuses populated databases and never creates ORM tables or drops existing data.
"""

import os
import subprocess
import sys
from pathlib import Path

import pytest
from sqlalchemy import text
from sqlalchemy.ext.asyncio import async_sessionmaker, create_async_engine

from app.core.database import get_db
from app.main import app


@pytest.mark.asyncio
@pytest.mark.skipif(
    not os.environ.get("TEST_FRESH_POSTGRES_URL"),
    reason="Requires an empty disposable PostgreSQL database",
)
async def test_fresh_postgres_migrations_and_auth(client):
    url = os.environ["TEST_FRESH_POSTGRES_URL"]
    assert url.startswith("postgresql+psycopg://"), "A real PostgreSQL database is required"
    engine = create_async_engine(url)
    try:
        async with engine.connect() as connection:
            count = await connection.scalar(
                text("SELECT count(*) FROM information_schema.tables WHERE table_schema='public'")
            )
            assert count == 0, "Refusing to migrate a populated database"
        result = subprocess.run(
            [sys.executable, "-m", "alembic", "upgrade", "head"],
            cwd=Path(__file__).parents[2],
            env={**os.environ, "DATABASE_URL": url},
            capture_output=True,
            text=True,
            timeout=120,
        )
        assert result.returncode == 0, result.stdout + result.stderr
        print(result.stderr)
        sessions = async_sessionmaker(engine, expire_on_commit=False)

        async def database():
            async with sessions() as session:
                yield session

        app.dependency_overrides[get_db] = database
        credentials = {"email": "demo-postgres@example.com", "password": "DemoPassword123!"}
        register = await client.post("/api/v1/auth/register", json=credentials)
        assert register.status_code == 201, register.text
        login = await client.post("/api/v1/auth/login", json=credentials)
        assert login.status_code == 200, login.text
        token = login.json()["token"]["access_token"]
        me = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert me.status_code == 200, me.text
        assert me.json()["email"] == credentials["email"]
        print("Fresh PostgreSQL: alembic upgrade head=0; register=201; login=200; /auth/me=200")
    finally:
        app.dependency_overrides.pop(get_db, None)
        await engine.dispose()
