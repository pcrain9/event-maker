from sqlalchemy import delete

from backend.scripts import seed_users
from ..models.user import User
from ..models.event import Event
from ..models.event_item import Event_Item
from ..db import get_session_factory
from .seed_event import seed_event_database
import asyncio


async def clear_all_data():
    """Delete all rows from all tables, respecting foreign key constraints."""
    session_factory = get_session_factory()
    async with session_factory() as session:  # type: ignore
        try:
            # Delete in order of foreign key dependencies
            # event_items references events, so delete first
            await session.execute(delete(Event_Item))
            
            # events is independent
            await session.execute(delete(Event))
            
            # users is independent
            await session.execute(delete(User))
            
            # Commit all deletions
            await session.commit()
            print("✓ Database cleared")
            
        except Exception as e:
            await session.rollback()
            print(f"❌ Error clearing database: {e}")
            raise


async def seed_database(clear: bool = False):
    """
    Seed the database with sample data.
    
    Args:
        clear: If True, delete all existing data before seeding. Default is False.
    """
    # Clear existing data if requested
    if clear:
        await clear_all_data()
    
    # Seed data
    await seed_users.seed_user_database()
    await seed_event_database()
    print("✅ Database seeded successfully!")


if __name__ == "__main__":
    asyncio.run(seed_database())