"""Forward/backward migration preserves legacy lists, quantities and budgets."""

import importlib.util
from decimal import Decimal
from pathlib import Path

import pytest
from alembic.migration import MigrationContext
from alembic.operations import Operations
from sqlalchemy import text

from app.models.list_item import ListItemStatus
from app.models.person import PersonOccasion


@pytest.mark.asyncio
async def test_migrate_existing_gifting_rows(
    async_engine, async_session, test_list_item, test_list, test_person, test_occasion, monkeypatch
):
    test_list_item.status = ListItemStatus.received
    test_list_item.quantity = 2
    test_list_item.price = Decimal("30")
    test_list_item.discount_price = Decimal("25")
    async_session.add(
        PersonOccasion(
            person_id=test_person.id,
            occasion_id=test_occasion.id,
            recipient_budget_total=Decimal("100"),
        )
    )
    await async_session.commit()
    path = Path(__file__).parents[2] / "alembic/versions/f3a1_event_occurrences.py"
    spec = importlib.util.spec_from_file_location("event_migration", path)
    migration = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(migration)
    async with async_engine.begin() as connection:
        for table in ("occurrence_gifts", "recipient_envelopes", "occurrences"):
            await connection.execute(text(f"DROP TABLE {table}"))

        def run(sync):
            monkeypatch.setattr(migration, "op", Operations(MigrationContext.configure(sync)))
            migration.upgrade()

        await connection.run_sync(run)
        row = (
            await connection.execute(
                text("SELECT phase, quantity, unit_price FROM occurrence_gifts")
            )
        ).one()
        assert tuple(row) == ("in_hand", 2, 25)
        assert (
            await connection.execute(text("SELECT money_allowance FROM recipient_envelopes"))
        ).scalar() == 100
        assert (await connection.execute(text("SELECT COUNT(*) FROM list_items"))).scalar() == 1
        await connection.run_sync(lambda sync: migration.downgrade())
        assert (await connection.execute(text("SELECT COUNT(*) FROM list_items"))).scalar() == 1
