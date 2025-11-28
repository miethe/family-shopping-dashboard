#!/usr/bin/env python3
"""
Development Database Reset Script

This script safely resets the development database by:
1. Dropping all tables (respecting foreign key constraints)
2. Dropping all custom enum types
3. Optionally re-running Alembic migrations

SAFETY FEATURES:
- Only runs against localhost databases by default
- Requires confirmation unless --yes flag is provided
- Verbose output showing all operations
- Graceful error handling

USAGE:
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

EXAMPLES:
    # Fix corrupted enum types
    uv run python scripts/reset_dev_db.py --yes

    # Clean database before running fresh migrations
    uv run python scripts/reset_dev_db.py --drop-only --yes
    uv run alembic upgrade head

    # Complete database reset (fixes persistent enum issues)
    uv run python scripts/reset_dev_db.py --recreate-db --yes

COMMON USE CASES:
    - Database in corrupted state after failed migration
    - Enum type conflicts ("type already exists" errors)
    - Need to reset to clean slate for testing
    - Want to re-run all migrations from scratch

REQUIREMENTS:
    - PostgreSQL database
    - Alembic configured (for migration step)
    - DATABASE_URL environment variable set (or .env file in api directory)
    - python-dotenv package installed
"""

import argparse
import os
import sys
from pathlib import Path
from urllib.parse import urlparse

import psycopg
from psycopg.rows import dict_row
from dotenv import load_dotenv


def parse_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(
        description="Reset development database (drops tables, enums, and optionally re-runs migrations)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__
    )
    parser.add_argument(
        "--drop-only",
        action="store_true",
        help="Only drop tables/enums, don't run migrations"
    )
    parser.add_argument(
        "--yes", "-y",
        action="store_true",
        help="Skip confirmation prompt"
    )
    parser.add_argument(
        "--force",
        action="store_true",
        help="Allow running against non-localhost databases (DANGEROUS)"
    )
    parser.add_argument(
        "--quiet", "-q",
        action="store_true",
        help="Reduce output verbosity"
    )
    parser.add_argument(
        "--recreate-db",
        action="store_true",
        help="Drop and recreate the entire database (most thorough)"
    )
    return parser.parse_args()


def get_database_url():
    """Get DATABASE_URL from environment or config."""
    # Try to load from .env file in api directory
    api_dir = Path(__file__).parent.parent
    env_file = api_dir / ".env"
    if env_file.exists():
        load_dotenv(env_file)

    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        print("❌ ERROR: DATABASE_URL environment variable not set")
        print("\nSet it with:")
        print("  export DATABASE_URL='postgresql+psycopg://user:pass@localhost:5432/dbname'")
        sys.exit(1)

    return database_url


def is_localhost_database(database_url: str) -> bool:
    """Check if database URL points to localhost."""
    parsed = urlparse(database_url)
    hostname = parsed.hostname or ""

    localhost_indicators = ["localhost", "127.0.0.1", "::1", "0.0.0.0"]
    return any(indicator in hostname.lower() for indicator in localhost_indicators)


def get_psycopg_connection_string(database_url: str) -> str:
    """Convert SQLAlchemy DATABASE_URL to psycopg connection string."""
    # Handle both postgresql+psycopg:// and postgresql://
    if database_url.startswith("postgresql+psycopg://"):
        return database_url.replace("postgresql+psycopg://", "postgresql://")
    elif database_url.startswith("postgresql://"):
        return database_url
    else:
        print(f"❌ ERROR: Unsupported database URL format: {database_url}")
        print("Expected: postgresql+psycopg://... or postgresql://...")
        sys.exit(1)


def confirm_reset(database_url: str, drop_only: bool, force: bool):
    """Prompt user for confirmation before proceeding."""
    parsed = urlparse(database_url)
    db_name = parsed.path.lstrip("/")
    hostname = parsed.hostname or "unknown"

    print("\n" + "=" * 70)
    print("⚠️  DATABASE RESET WARNING")
    print("=" * 70)
    print(f"\nDatabase: {db_name}")
    print(f"Host: {hostname}")
    print(f"Operation: {'Drop only' if drop_only else 'Drop + Migrate'}")

    if not is_localhost_database(database_url):
        print("\n⚠️  WARNING: This is NOT a localhost database!")
        if not force:
            print("❌ Refusing to proceed without --force flag")
            sys.exit(1)
        print("🚨 DANGER: Proceeding because --force was specified")

    print("\nThis will:")
    print("  1. Drop ALL tables (CASCADE)")
    print("  2. Drop ALL custom enum types")
    if not drop_only:
        print("  3. Run 'alembic upgrade head' to recreate schema")

    print("\n⚠️  ALL DATA WILL BE LOST")
    print("=" * 70)

    response = input("\nType 'yes' to proceed: ").strip().lower()
    if response != "yes":
        print("❌ Aborted by user")
        sys.exit(0)


def drop_all_tables(conn, quiet: bool):
    """Drop all tables in the public schema."""
    if not quiet:
        print("\n📋 Fetching table list...")

    with conn.cursor(row_factory=dict_row) as cur:
        cur.execute("""
            SELECT tablename
            FROM pg_tables
            WHERE schemaname = 'public'
            ORDER BY tablename;
        """)
        tables = [row["tablename"] for row in cur.fetchall()]

    if not tables:
        print("✓ No tables found to drop")
        return

    if not quiet:
        print(f"📋 Found {len(tables)} tables: {', '.join(tables)}")
        print("\n🗑️  Dropping tables...")

    with conn.cursor() as cur:
        for table in tables:
            if not quiet:
                print(f"   - Dropping table: {table}")
            cur.execute(f'DROP TABLE IF EXISTS "{table}" CASCADE;')

    conn.commit()
    print(f"✓ Dropped {len(tables)} tables")


def drop_all_enums(conn, quiet: bool):
    """Drop all custom enum types."""
    if not quiet:
        print("\n📋 Fetching enum types...")

    with conn.cursor(row_factory=dict_row) as cur:
        # Get all enum types (even corrupted ones without values)
        cur.execute("""
            SELECT t.typname
            FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE n.nspname = 'public'
              AND t.typtype = 'e'
            ORDER BY t.typname;
        """)
        enums = [row["typname"] for row in cur.fetchall()]

    # Also try to drop known enum types that might exist but not be detected
    # This handles cases where enums are corrupted or in a weird state
    known_enums = ["occasiontype", "giftpriority", "giftstatus", "assignmentstatus"]

    if not quiet:
        if enums:
            print(f"📋 Found {len(enums)} enum types: {', '.join(enums)}")
        print("\n🗑️  Dropping enum types (including known types)...")

    with conn.cursor() as cur:
        # Drop detected enums
        for enum_type in enums:
            if not quiet:
                print(f"   - Dropping enum: {enum_type}")
            cur.execute(f'DROP TYPE IF EXISTS "{enum_type}" CASCADE;')

        # Also try to drop known enums (idempotent with IF EXISTS)
        for enum_type in known_enums:
            if enum_type not in enums:  # Only try if not already dropped
                if not quiet:
                    print(f"   - Trying to drop known enum: {enum_type}")
                cur.execute(f'DROP TYPE IF EXISTS "{enum_type}" CASCADE;')

    conn.commit()

    total_dropped = len(set(enums + known_enums))
    if total_dropped > 0:
        print(f"✓ Dropped enum types (attempted {len(known_enums)} known types)")
    else:
        print("✓ No enum types found to drop")


def run_alembic_upgrade(quiet: bool):
    """Run Alembic migrations to recreate schema."""
    import subprocess

    print("\n🔄 Running Alembic migrations...")

    # Change to api directory (where alembic.ini is located)
    api_dir = Path(__file__).parent.parent

    try:
        cmd = ["uv", "run", "alembic", "upgrade", "head"]
        if not quiet:
            print(f"   Command: {' '.join(cmd)}")
            print(f"   Working directory: {api_dir}")

        result = subprocess.run(
            cmd,
            cwd=api_dir,
            capture_output=True,
            text=True,
            check=True
        )

        if not quiet and result.stdout:
            print("\n--- Alembic Output ---")
            print(result.stdout)
            print("--- End Alembic Output ---\n")

        print("✓ Alembic migrations completed successfully")

    except subprocess.CalledProcessError as e:
        print(f"\n❌ ERROR: Alembic migration failed")
        print(f"Exit code: {e.returncode}")
        if e.stdout:
            print("\nStdout:")
            print(e.stdout)
        if e.stderr:
            print("\nStderr:")
            print(e.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("\n❌ ERROR: 'uv' command not found")
        print("Install uv: https://github.com/astral-sh/uv")
        sys.exit(1)


def drop_and_recreate_database(database_url: str, quiet: bool):
    """Drop and recreate the entire database (most thorough method)."""
    parsed = urlparse(database_url.replace("postgresql+psycopg://", "postgresql://"))
    db_name = parsed.path.lstrip("/")

    # Connect to postgres database to drop/create target database
    postgres_url = database_url.replace(f"/{db_name}", "/postgres")
    postgres_url = postgres_url.replace("postgresql+psycopg://", "postgresql://")

    if not quiet:
        print(f"\n🗑️  Dropping database: {db_name}")

    try:
        with psycopg.connect(postgres_url, autocommit=True) as conn:
            with conn.cursor() as cur:
                # Terminate existing connections
                cur.execute(f"""
                    SELECT pg_terminate_backend(pg_stat_activity.pid)
                    FROM pg_stat_activity
                    WHERE pg_stat_activity.datname = '{db_name}'
                      AND pid <> pg_backend_pid();
                """)

                # Drop database
                cur.execute(f'DROP DATABASE IF EXISTS "{db_name}";')
                if not quiet:
                    print(f"✓ Database dropped: {db_name}")

                # Recreate database
                cur.execute(f'CREATE DATABASE "{db_name}";')
                if not quiet:
                    print(f"✓ Database created: {db_name}")

    except Exception as e:
        print(f"❌ ERROR: Failed to drop/recreate database: {e}")
        raise


def verify_database_clean(conn, quiet: bool):
    """Verify database is clean after reset."""
    if not quiet:
        print("\n🔍 Verifying database is clean...")

    with conn.cursor(row_factory=dict_row) as cur:
        # Check for remaining tables
        cur.execute("""
            SELECT COUNT(*) as count
            FROM pg_tables
            WHERE schemaname = 'public';
        """)
        table_count = cur.fetchone()["count"]

        # Check for remaining enums
        cur.execute("""
            SELECT COUNT(*) as count
            FROM pg_type t
            JOIN pg_namespace n ON t.typnamespace = n.oid
            WHERE n.nspname = 'public'
              AND t.typtype = 'e';
        """)
        enum_count = cur.fetchone()["count"]

    if table_count > 0:
        print(f"⚠️  Warning: {table_count} tables still exist")
    else:
        print("✓ No tables remaining")

    if enum_count > 0:
        print(f"⚠️  Warning: {enum_count} enum types still exist")
    else:
        print("✓ No enum types remaining")


def main():
    """Main entry point."""
    args = parse_args()

    # Get database URL
    database_url = get_database_url()

    # Safety check for localhost
    if not is_localhost_database(database_url) and not args.force:
        print("❌ ERROR: Database is not on localhost")
        print("This script only runs against local databases for safety.")
        print("Use --force flag to override (DANGEROUS)")
        sys.exit(1)

    # Confirm with user (unless --yes)
    if not args.yes:
        confirm_reset(database_url, args.drop_only, args.force)

    # Convert to psycopg connection string
    conn_string = get_psycopg_connection_string(database_url)

    try:
        if args.recreate_db:
            # Drop and recreate entire database (most thorough)
            drop_and_recreate_database(database_url, args.quiet)
        else:
            # Drop tables and enums only
            if not args.quiet:
                print("\n🔌 Connecting to database...")

            with psycopg.connect(conn_string) as conn:
                if not args.quiet:
                    print("✓ Connected successfully")

                # Drop all tables
                drop_all_tables(conn, args.quiet)

                # Drop all enums
                drop_all_enums(conn, args.quiet)

                # Verify clean
                verify_database_clean(conn, args.quiet)

        # Run migrations (unless --drop-only)
        if not args.drop_only:
            run_alembic_upgrade(args.quiet)
        else:
            print("\n⏭️  Skipping migrations (--drop-only flag)")

        print("\n" + "=" * 70)
        print("✅ Database reset completed successfully!")
        print("=" * 70)

        if args.drop_only:
            print("\nNext steps:")
            print("  1. Run migrations: uv run alembic upgrade head")
            print("  2. Start API: uv run uvicorn app.main:app --reload")
        else:
            print("\nNext steps:")
            print("  1. Start API: uv run uvicorn app.main:app --reload")
            print("  2. Verify API health: curl http://localhost:8000/health")

    except psycopg.OperationalError as e:
        print(f"\n❌ ERROR: Failed to connect to database")
        print(f"Details: {e}")
        print("\nCheck:")
        print("  1. PostgreSQL is running")
        print("  2. DATABASE_URL is correct")
        print("  3. Database exists and is accessible")
        sys.exit(1)

    except Exception as e:
        print(f"\n❌ ERROR: Unexpected error occurred")
        print(f"Type: {type(e).__name__}")
        print(f"Details: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
