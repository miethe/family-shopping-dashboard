# Bug Fixes - November 2025

Monthly log of bug fixes and remediations for the Family Gifting Dashboard project.

---

## OccasionType Enum Duplicate Type Error

**Issue**: API failing on startup with `sqlalchemy.exc.ProgrammingError: (psycopg.errors.DuplicateObject) type "occasiontype" already exists`

- **Location**: `services/api/app/models/occasion.py:43-47`
- **Root Cause**: Name mismatch between migration (`name="occasiontype"`) and model (`name="occasion_type"`), combined with `create_type=True` in model causing SQLAlchemy to attempt creating the enum type at runtime even though the migration already created it
- **Fix**: Aligned model enum definition with migration by changing `name="occasion_type"` to `name="occasiontype"` and `create_type=True` to `create_type=False` to prevent duplicate type creation
- **Commit(s)**: `18bf915`
- **Status**: RESOLVED

---
