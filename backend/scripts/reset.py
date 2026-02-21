"""
Quick database reset: drop tables, recreate, and re-seed.

Usage:
    python3 -m backend.scripts.reset
"""

import asyncio
import os
from pathlib import Path

if __package__ != "backend.scripts":
    raise SystemExit(
        "Run from the project root: python3 -m backend.scripts.reset"
    )

from .seed import seed_database, drop_all_tables
from ..db import init_models


def _running_in_docker() -> bool:
    if Path("/.dockerenv").exists():
        return True
    try:
        return "docker" in Path("/proc/1/cgroup").read_text()
    except FileNotFoundError:
        return False


async def reset_database():
    """Drop tables, recreate schema, and re-seed with sample data."""
    database_url = os.getenv("DATABASE_URL", "")
    if "@db:5432" in database_url and not _running_in_docker():
        raise SystemExit(
            "DATABASE_URL points to '@db:5432', which only resolves inside Docker. "
            "Run: docker compose exec backend python -m backend.scripts.reset"
        )
    print("🔄 Resetting database...\n")
    
    # Drop all existing tables
    print("  Dropping existing tables...")
    await drop_all_tables()
    
    # Recreate tables with fresh schema
    print("  Creating tables from models...")
    await init_models()
    
    # Seed with fresh data
    await seed_database(clear=False)  # No need to clear since we just dropped tables
    print("\n✅ Database reset complete!")


if __name__ == "__main__":
    asyncio.run(reset_database())
