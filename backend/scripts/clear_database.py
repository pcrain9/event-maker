"""
Clear all data from the database while keeping tables intact.

Usage:
    python -m backend.scripts.clear_database
"""

from sqlalchemy import delete
from ..models.event_item import Event_Item
from ..models.event import Event
from ..models.user import User
from ..db import AsyncSessionLocal
import asyncio


async def clear_all_data():
    """Delete all rows from all tables, respecting foreign key constraints."""
    async with AsyncSessionLocal() as session:  # type: ignore
        try:
            # Delete in order of foreign key dependencies
            # event_items references events, so delete first
            await session.execute(delete(Event_Item))
            print("✓ Cleared event_items")
            
            # events is independent
            await session.execute(delete(Event))
            print("✓ Cleared events")
            
            # users is independent
            await session.execute(delete(User))
            print("✓ Cleared users")
            
            # Commit all deletions
            await session.commit()
            print("\n✅ Database cleared successfully!")
            
        except Exception as e:
            await session.rollback()
            print(f"\n❌ Error clearing database: {e}")
            raise


if __name__ == "__main__":
    asyncio.run(clear_all_data())
