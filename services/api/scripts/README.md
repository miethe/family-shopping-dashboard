# API Scripts

Utility scripts for database management and development workflows.

---

## Scripts Overview

### `populate_test_data.py`

**Purpose**: Populate the database with comprehensive test data for development and testing.

**What it creates**:
- 3 Users (Alice, Bob, Carol - family members)
- 5 People (Grandma Betty, Uncle Tom, Cousin Emma, Friend Sarah, Nephew Jake)
- 5 Occasions (Christmas 2024, Grandma's Birthday, Mother's Day, Anniversary, Emma's Birthday)
- 10 Tags (Books, Electronics, Clothing, Home & Garden, Experiences, Hobbies, Toys & Games, Food & Drink, Jewelry, Sports & Outdoors)
- 22 Gifts (diverse items with prices $10-$500, various categories)
- 8 Lists (wishlists, ideas, assigned lists with different visibility levels)
- 26 ListItems (gifts added to lists with statuses: idea, selected, purchased, received)
- 11 Comments (on list_items, lists, occasions, persons)

**Usage**:
```bash
# From services/api directory

# Interactive mode (prompts for confirmation)
uv run python scripts/populate_test_data.py

# Skip confirmation prompt
uv run python scripts/populate_test_data.py --yes

# Show help
uv run python scripts/populate_test_data.py --help
```

**Test User Credentials**:
All users have password: `testpass1`
- `alice@family.test` - Mom, creates wishlists and manages family lists
- `bob@family.test` - Dad, creates ideas and assigned lists
- `carol@family.test` - Daughter, personal wishlist and family contributions

**Warning**: This script **DROPS ALL TABLES** and recreates them. All existing data will be permanently deleted. Only use in development environments.

**When to use**:
- Setting up new development environment
- Resetting database to known state for testing
- Demonstrating features with realistic data
- Manual testing of UI components

---

### `reset_dev_db.py`

**Purpose**: Safely reset the development database by dropping tables, enums, and optionally re-running migrations.

**Safety features**:
- Only runs against localhost databases by default
- Requires confirmation unless `--yes` flag is provided
- Verbose output showing all operations
- Graceful error handling

**Usage**:
```bash
# From services/api directory

# Interactive (prompts for confirmation)
uv run python scripts/reset_dev_db.py

# Drop and migrate automatically
uv run python scripts/reset_dev_db.py --yes

# Drop and recreate entire database (most thorough)
uv run python scripts/reset_dev_db.py --recreate-db --yes

# Just drop tables/enums (no migration)
uv run python scripts/reset_dev_db.py --drop-only

# Force run against non-localhost database (dangerous!)
uv run python scripts/reset_dev_db.py --force --yes
```

**Common use cases**:
- Database in corrupted state after failed migration
- Enum type conflicts ("type already exists" errors)
- Need to reset to clean slate for testing
- Want to re-run all migrations from scratch

---

## Common Workflows

### Initial Setup (New Developer)

```bash
cd services/api

# 1. Run migrations
uv run alembic upgrade head

# 2. Populate with test data
uv run python scripts/populate_test_data.py --yes
```

### Reset Database After Failed Migration

```bash
cd services/api

# 1. Reset database completely
uv run python scripts/reset_dev_db.py --yes

# 2. Re-run migrations
uv run alembic upgrade head

# 3. Populate test data (optional)
uv run python scripts/populate_test_data.py --yes
```

### Daily Development Workflow

```bash
cd services/api

# Reset to clean state with fresh test data
uv run python scripts/populate_test_data.py --yes
```

### Fix Enum Type Conflicts

```bash
cd services/api

# Complete reset including database recreation
uv run python scripts/reset_dev_db.py --recreate-db --yes

# Re-run migrations
uv run alembic upgrade head

# Populate test data
uv run python scripts/populate_test_data.py --yes
```

---

## Environment Requirements

Both scripts require:
- PostgreSQL database running
- `DATABASE_URL` environment variable set (async format: `postgresql+asyncpg://...`)
- `JWT_SECRET_KEY` environment variable set
- Python 3.12+ with dependencies installed via `uv`

Example `.env` file:
```bash
DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/family_gifting_dev
JWT_SECRET_KEY=your-secret-key-here
DEBUG=True
```

---

## Safety Notes

**Production Warning**: These scripts are **ONLY** for development environments. Never run against production databases:
- `populate_test_data.py` drops all tables unconditionally
- `reset_dev_db.py` has safety checks but can be bypassed with `--force`

**Best Practices**:
- Always use separate databases for dev/test/prod
- Use localhost-only databases for development
- Never commit `.env` files with real credentials
- Back up data before running reset scripts (if needed)

---

## Troubleshooting

### "Permission denied" Error

```bash
# Make scripts executable
chmod +x scripts/*.py
```

### "Module not found" Error

```bash
# Set PYTHONPATH or run from correct directory
cd services/api
PYTHONPATH="$PWD" python scripts/populate_test_data.py
```

### Database Connection Errors

```bash
# Verify DATABASE_URL is set
echo $DATABASE_URL

# Verify PostgreSQL is running
psql -d family_gifting_dev -c "SELECT 1"

# Check .env file exists
cat .env
```

### Enum Type Conflicts

```bash
# Use complete database reset
uv run python scripts/reset_dev_db.py --recreate-db --yes
```

---

## Adding New Scripts

When creating new database scripts:

1. **Add comprehensive docstring** at the top explaining purpose, usage, options
2. **Use async/await patterns** for SQLAlchemy async compatibility
3. **Include confirmation prompts** for destructive operations
4. **Print progress** as operations complete
5. **Handle errors gracefully** with clear error messages
6. **Make executable**: `chmod +x scripts/your_script.py`
7. **Document in this README** with usage examples

Example template:
```python
#!/usr/bin/env python3
"""
Script Title

Purpose: Brief description

Usage:
    python scripts/your_script.py [--option]

Options:
    --option    Description
"""

import asyncio
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

async def main():
    # Your implementation
    pass

if __name__ == "__main__":
    asyncio.run(main())
```

---

Last updated: 2024-11-28
