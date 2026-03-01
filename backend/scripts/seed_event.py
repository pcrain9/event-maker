from sqlalchemy import select

from backend.constants import DEFAULT_COLOR_SCHEME
from backend.updated_2025_conference_data import EVENT_ITEMS_2025
from ..models.event import Event
from ..models.event_item import Event_Item
from ..db import get_session_factory
import asyncio

async def seed_event_database():
    """Seed the 2025 conference event and its items."""
    session_factory = get_session_factory()
    async with session_factory() as session:  # type: ignore
        # Check if we already have events
        res = await session.execute(select(Event))
        events = res.scalars().all()
        if events:
            print("Events already seeded!")
            return
        
        color_scheme = (
            DEFAULT_COLOR_SCHEME.model_dump()
            if hasattr(DEFAULT_COLOR_SCHEME, "model_dump")
            else DEFAULT_COLOR_SCHEME.dict()
        )
        event = Event(
            title="TAM Annual Meeting 2025",
            slug="austin-2025",
            hero_image_url=None,
            color_scheme=color_scheme,
        )
        session.add(event)
        await session.flush()  # Flush to get the event ID
        
        allowed_keys = {
            "title",
            "sponsor",
            "time",
            "speakers",
            "link",
            "description",
            "location",
            "cancelled",
            "slides",
        }
        event_items = [
            Event_Item(event=event, **{k: v for k, v in item.items() if k in allowed_keys})
            for item in EVENT_ITEMS_2025
        ]
        # Add all event items to the session
        session.add_all(event_items)
        await session.commit()
        
        print(f"✓ Event (ID: {event.id}) created with {len(event_items)} items:")
        for item in event_items:
            print(f"  - {item.title}: {item.time}")


if __name__ == "__main__":
    asyncio.run(seed_event_database())
