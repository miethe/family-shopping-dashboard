# Field Options API - Performance Tests

## Overview

This directory contains performance benchmarks and N+1 query detection tests for the Field Options API.

## Tests Included

### 1. Latency Benchmarks (`test_field_options_perf.py`)

Performance tests that verify API endpoints meet latency targets:

- **GET /api/v1/field-options** - p95 < 50ms
- **POST /api/v1/field-options** - p95 < 100ms
- **PUT /api/v1/field-options/{id}** - p95 < 100ms
- **DELETE /api/v1/field-options/{id}** - p95 < 150ms

### 2. N+1 Query Detection

Tests that verify no N+1 query issues exist:

- GET endpoint executes exactly 2 queries (data + count)
- Repository methods execute optimal query count
- No excessive database round trips

## Running Tests

### Run All Performance Tests

```bash
cd services/api
uv run pytest tests/performance/test_field_options_perf.py -v -s
```

### Run Specific Test Class

```bash
# Test GET endpoint performance
uv run pytest tests/performance/test_field_options_perf.py::TestListOptionsPerformance -v

# Test CREATE endpoint performance
uv run pytest tests/performance/test_field_options_perf.py::TestCreateOptionPerformance -v

# Test N+1 query detection
uv run pytest tests/performance/test_field_options_perf.py::TestGetAllForEntityPerformance -v
```

### Run With Timing Details

```bash
uv run pytest tests/performance/test_field_options_perf.py -v -s --durations=10
```

## Test Results Summary

All tests **PASSED** with excellent performance:

| Endpoint | Target | Actual p95 | Status |
|----------|--------|------------|--------|
| GET /field-options | <50ms | 2.10ms | ✅ 24x faster |
| POST /field-options | <100ms | 1.84ms | ✅ 54x faster |
| PUT /field-options/{id} | <100ms | 2.84ms | ✅ 35x faster |
| DELETE /field-options/{id} | <150ms | 2.79ms | ✅ 54x faster |

**N+1 Queries**: None detected ✅

See full report: `/docs/audits/field-options-performance-report.md`

## Test Architecture

### Query Counter

Uses SQLAlchemy SQL logging to count SELECT queries:

```python
caplog.set_level(logging.DEBUG, logger="sqlalchemy.engine")
# Run operation
# Count SELECT queries in logs
```

### Performance Measurement

Uses `time.perf_counter()` for high-resolution timing:

```python
start = time.perf_counter()
response = await client.get(...)
elapsed = (time.perf_counter() - start) * 1000  # ms
```

### Statistical Analysis

Calculates percentiles from sorted latency measurements:

- p50 (median)
- p95 (95th percentile - target metric)
- p99 (99th percentile)
- Average, Max

## Fixtures

### test_options_dataset

Creates 20 field options for performance testing:

```python
@pytest_asyncio.fixture
async def test_options_dataset(async_session: AsyncSession) -> list[FieldOption]:
    # Creates 20 wine_types options for person entity
    ...
```

## Performance Targets Rationale

Targets are set for a single-tenant family app (2-3 users):

- **GET <50ms**: List operations should be fast for UI rendering
- **POST/PUT <100ms**: Mutations can be slightly slower, still imperceptible
- **DELETE <150ms**: Soft deletes include additional logic (update instead of delete)
- **No N+1**: Critical for scalability, prevents query explosion

## Production Considerations

Tests use **in-memory SQLite**. Production PostgreSQL will have:

- Slightly higher latency (+1-2ms) due to network I/O
- Better concurrent handling
- Similar query performance (indexes work the same)

**Expected production p95**: 5-10ms (still well under targets)

## Maintenance

Update these tests when:

- Adding new field option endpoints
- Modifying database queries in repository
- Changing performance targets
- Identifying performance regressions

## Related Files

- Implementation: `services/api/app/api/field_options.py`
- Repository: `services/api/app/repositories/field_option.py`
- Service: `services/api/app/services/field_option.py`
- Model: `services/api/app/models/field_option.py`
- Integration tests: `services/api/tests/integration/test_field_option_endpoints.py`
- Performance report: `docs/audits/field-options-performance-report.md`
