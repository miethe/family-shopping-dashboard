"""Performance benchmarks for field options API.

Tests verify that Field Options API meets performance targets:
- GET options: <50ms (p95)
- POST create: <100ms (p95)
- PUT update: <100ms (p95)
- DELETE: <150ms (p95)
- No N+1 queries (verified via query counting)
"""

import logging
import statistics
import time
import uuid
from collections.abc import AsyncGenerator
from typing import Any

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import event
from sqlalchemy.engine import Engine
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.field_option import FieldOption


# Query counter for N+1 detection
class QueryCounter:
    """Tracks SQL queries for N+1 detection."""

    def __init__(self) -> None:
        self.queries: list[str] = []
        self.count = 0

    def reset(self) -> None:
        """Reset query counter."""
        self.queries = []
        self.count = 0

    def increment(self, statement: str) -> None:
        """Record a query execution."""
        self.queries.append(statement)
        self.count += 1


@pytest.fixture
def query_counter() -> QueryCounter:
    """Create query counter fixture."""
    return QueryCounter()


@pytest_asyncio.fixture
async def test_options_dataset(async_session: AsyncSession) -> list[FieldOption]:
    """Create test dataset of 20 field options for performance testing.

    Returns:
        List of created FieldOption instances
    """
    options = []
    for i in range(20):
        option = FieldOption(
            entity="person",
            field_name="wine_types",
            value=f"wine_{i:02d}",
            display_label=f"Wine Type {i}",
            display_order=i,
            is_system=False,
            is_active=True,
        )
        async_session.add(option)
        options.append(option)

    await async_session.commit()
    return options


class TestListOptionsPerformance:
    """Performance tests for GET /api/v1/field-options endpoint."""

    @pytest.mark.asyncio
    async def test_list_options_latency_p95(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_options_dataset: list[FieldOption],
    ) -> None:
        """GET options should have p95 latency <50ms.

        Measures request latency over 100 iterations to calculate p95.
        Target: p95 < 50ms
        """
        times: list[float] = []
        iterations = 100

        # Warmup (exclude from measurements)
        for _ in range(5):
            await client.get(
                "/api/v1/field-options",
                params={"entity": "person", "field_name": "wine_types"},
                headers=auth_headers,
            )

        # Measure performance
        for _ in range(iterations):
            start = time.perf_counter()
            response = await client.get(
                "/api/v1/field-options",
                params={"entity": "person", "field_name": "wine_types"},
                headers=auth_headers,
            )
            elapsed = (time.perf_counter() - start) * 1000  # Convert to ms
            times.append(elapsed)

            assert response.status_code == 200

        # Calculate statistics
        times_sorted = sorted(times)
        p50 = statistics.median(times)
        p95 = times_sorted[int(iterations * 0.95)]
        p99 = times_sorted[int(iterations * 0.99)]
        avg = statistics.mean(times)
        max_time = max(times)

        # Log results
        print(f"\n--- GET /api/v1/field-options Performance ({iterations} requests) ---")
        print(f"Average: {avg:.2f}ms")
        print(f"p50:     {p50:.2f}ms")
        print(f"p95:     {p95:.2f}ms (target: <50ms)")
        print(f"p99:     {p99:.2f}ms")
        print(f"Max:     {max_time:.2f}ms")

        # Assert performance target
        assert p95 < 50, f"GET p95 latency was {p95:.1f}ms, should be <50ms"

    @pytest.mark.asyncio
    async def test_list_options_query_count(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_options_dataset: list[FieldOption],
        async_engine: Any,
        caplog: pytest.LogCaptureFixture,
    ) -> None:
        """GET options should execute exactly 2 queries (data + count).

        Verifies no N+1 query issues by counting SQL statements.
        Expected: 2 queries (SELECT options + SELECT count)
        """
        # Enable SQL logging to count queries
        caplog.set_level(logging.DEBUG, logger="sqlalchemy.engine")

        response = await client.get(
            "/api/v1/field-options",
            params={"entity": "person", "field_name": "wine_types"},
            headers=auth_headers,
        )

        assert response.status_code == 200

        # Count SELECT queries in logs (excluding schema queries, BEGIN, COMMIT)
        select_queries = [
            log for log in caplog.records
            if "SELECT" in log.message.upper()
            and "field_options" in log.message.lower()
            and "sqlite_master" not in log.message.lower()
        ]

        # Should be exactly 2: one for options, one for count
        query_count = len(select_queries)
        print(f"\n--- Query Count Analysis ---")
        print(f"SELECT queries executed: {query_count}")
        print(f"Expected: 2 (options query + count query)")

        if query_count > 2:
            print("\nQueries found:")
            for i, query in enumerate(select_queries, 1):
                print(f"{i}. {query.message[:200]}")

        assert query_count == 2, f"Expected 2 queries, got {query_count} (possible N+1 issue)"


class TestCreateOptionPerformance:
    """Performance tests for POST /api/v1/field-options endpoint."""

    @pytest.mark.asyncio
    async def test_create_option_latency_p95(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
    ) -> None:
        """POST create should have p95 latency <100ms.

        Measures creation latency over 50 iterations.
        Target: p95 < 100ms
        """
        times: list[float] = []
        iterations = 50
        # Use UUID to ensure unique values across test runs
        test_id = str(uuid.uuid4())[:8]

        # Warmup (use valid field_name for person entity)
        for i in range(3):
            await client.post(
                "/api/v1/field-options",
                json={
                    "entity": "person",
                    "field_name": "hobbies",  # Valid field for person
                    "value": f"warmup_{test_id}_{i}",
                    "display_label": f"Warmup {i}",
                },
                headers=auth_headers,
            )

        # Measure performance
        for i in range(iterations):
            start = time.perf_counter()
            response = await client.post(
                "/api/v1/field-options",
                json={
                    "entity": "person",
                    "field_name": "hobbies",  # Valid field for person
                    "value": f"perf_test_{test_id}_{i}",
                    "display_label": f"Performance Test Hobby {i}",
                    "display_order": i,
                },
                headers=auth_headers,
            )
            elapsed = (time.perf_counter() - start) * 1000
            times.append(elapsed)

            if response.status_code != 201:
                print(f"\nFailed at iteration {i}")
                print(f"Status: {response.status_code}")
                print(f"Response: {response.json()}")
            assert response.status_code == 201

        # Calculate statistics
        times_sorted = sorted(times)
        p50 = statistics.median(times)
        p95 = times_sorted[int(iterations * 0.95)]
        avg = statistics.mean(times)
        max_time = max(times)

        print(f"\n--- POST /api/v1/field-options Performance ({iterations} requests) ---")
        print(f"Average: {avg:.2f}ms")
        print(f"p50:     {p50:.2f}ms")
        print(f"p95:     {p95:.2f}ms (target: <100ms)")
        print(f"Max:     {max_time:.2f}ms")

        assert p95 < 100, f"POST p95 latency was {p95:.1f}ms, should be <100ms"


class TestUpdateOptionPerformance:
    """Performance tests for PUT /api/v1/field-options/{id} endpoint."""

    @pytest.mark.asyncio
    async def test_update_option_latency_p95(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        test_options_dataset: list[FieldOption],
    ) -> None:
        """PUT update should have p95 latency <100ms.

        Measures update latency over 50 iterations.
        Target: p95 < 100ms
        """
        times: list[float] = []
        iterations = 50
        option_id = test_options_dataset[0].id

        # Warmup
        for i in range(3):
            await client.put(
                f"/api/v1/field-options/{option_id}",
                json={"display_label": f"Warmup {i}"},
                headers=auth_headers,
            )

        # Measure performance
        for i in range(iterations):
            start = time.perf_counter()
            response = await client.put(
                f"/api/v1/field-options/{option_id}",
                json={"display_label": f"Updated Label {i}"},
                headers=auth_headers,
            )
            elapsed = (time.perf_counter() - start) * 1000
            times.append(elapsed)

            assert response.status_code == 200

        # Calculate statistics
        times_sorted = sorted(times)
        p50 = statistics.median(times)
        p95 = times_sorted[int(iterations * 0.95)]
        avg = statistics.mean(times)
        max_time = max(times)

        print(f"\n--- PUT /api/v1/field-options/{{id}} Performance ({iterations} requests) ---")
        print(f"Average: {avg:.2f}ms")
        print(f"p50:     {p50:.2f}ms")
        print(f"p95:     {p95:.2f}ms (target: <100ms)")
        print(f"Max:     {max_time:.2f}ms")

        assert p95 < 100, f"PUT p95 latency was {p95:.1f}ms, should be <100ms"


class TestDeleteOptionPerformance:
    """Performance tests for DELETE /api/v1/field-options/{id} endpoint."""

    @pytest.mark.asyncio
    async def test_soft_delete_option_latency_p95(
        self,
        client: AsyncClient,
        auth_headers: dict[str, str],
        async_session: AsyncSession,
    ) -> None:
        """DELETE (soft) should have p95 latency <150ms.

        Measures soft delete latency over 50 iterations.
        Target: p95 < 150ms
        """
        times: list[float] = []
        iterations = 50

        # Create test options
        option_ids = []
        for i in range(iterations + 3):  # +3 for warmup
            option = FieldOption(
                entity="person",
                field_name="delete_test",
                value=f"delete_{i}",
                display_label=f"Delete Test {i}",
            )
            async_session.add(option)
        await async_session.commit()

        # Get all created option IDs
        from sqlalchemy import select
        result = await async_session.execute(
            select(FieldOption).where(FieldOption.field_name == "delete_test")
        )
        option_ids = [opt.id for opt in result.scalars().all()]

        # Warmup
        for i in range(3):
            await client.delete(
                f"/api/v1/field-options/{option_ids[i]}",
                headers=auth_headers,
            )

        # Measure performance
        for i in range(3, iterations + 3):
            start = time.perf_counter()
            response = await client.delete(
                f"/api/v1/field-options/{option_ids[i]}",
                headers=auth_headers,
            )
            elapsed = (time.perf_counter() - start) * 1000
            times.append(elapsed)

            assert response.status_code == 200

        # Calculate statistics
        times_sorted = sorted(times)
        p50 = statistics.median(times)
        p95 = times_sorted[int(iterations * 0.95)]
        avg = statistics.mean(times)
        max_time = max(times)

        print(f"\n--- DELETE /api/v1/field-options/{{id}} Performance ({iterations} requests) ---")
        print(f"Average: {avg:.2f}ms")
        print(f"p50:     {p50:.2f}ms")
        print(f"p95:     {p95:.2f}ms (target: <150ms)")
        print(f"Max:     {max_time:.2f}ms")

        assert p95 < 150, f"DELETE p95 latency was {p95:.1f}ms, should be <150ms"


class TestGetAllForEntityPerformance:
    """Performance tests for repository-level get_all_for_entity method."""

    @pytest.mark.asyncio
    async def test_get_all_for_entity_no_n_plus_1(
        self,
        async_session: AsyncSession,
        test_options_dataset: list[FieldOption],
        caplog: pytest.LogCaptureFixture,
    ) -> None:
        """get_all_for_entity should execute exactly 1 query.

        Verifies no N+1 query issues when fetching all options for an entity.
        Expected: 1 SELECT query
        """
        from app.repositories.field_option import FieldOptionRepository

        # Enable SQL logging
        caplog.set_level(logging.DEBUG, logger="sqlalchemy.engine")

        repo = FieldOptionRepository(async_session)
        options = await repo.get_all_for_entity(entity="person", include_inactive=False)

        # Verify results
        assert len(options) >= 20  # From test_options_dataset

        # Count SELECT queries
        select_queries = [
            log for log in caplog.records
            if "SELECT" in log.message.upper()
            and "field_options" in log.message.lower()
            and "sqlite_master" not in log.message.lower()
        ]

        query_count = len(select_queries)
        print(f"\n--- get_all_for_entity Query Count ---")
        print(f"Options returned: {len(options)}")
        print(f"SELECT queries executed: {query_count}")
        print(f"Expected: 1 (single batch query)")

        assert query_count == 1, f"Expected 1 query, got {query_count} (N+1 issue detected)"
