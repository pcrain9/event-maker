"""
Quick database reset: drop tables, recreate, and re-seed.

Usage:
    python -m backend.scripts.reset
"""

from .seed import seed_database, drop_all_tables
from ..db import init_models
import asyncio


async def reset_database():
    """Drop tables, recreate schema, and re-seed with sample data."""
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
