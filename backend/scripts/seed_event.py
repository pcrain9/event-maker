from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from backend.constants import DEFAULT_COLOR_SCHEME
from ..models.event import Event
from ..models.event_item import Event_Item
from ..db import AsyncSessionLocal
from ..schema.event_item import ColorScheme
import asyncio


async def seed_event_database():
    """Seed a mock event with 10 event items."""
    async with AsyncSessionLocal() as session:  # type: ignore
        # Check if we already have events
        res = await session.execute(select(Event))
        events = res.scalars().all()
        if events:
            print("Events already seeded!")
            return
        
        event = Event(title="Tech Conference 2026", hero_image_url="https://example.com/hero.jpg", color_scheme=DEFAULT_COLOR_SCHEME)
        session.add(event)
        await session.flush()  # Flush to get the event ID
        
        # Define 10 mock event items (reference the event object directly)
        event_items = [
            Event_Item(
                title="Opening Keynote",
                sponsor="TechCorp",
                time=datetime(2026, 2, 15, 9, 0, 0),
                speakers=[{"name": "John Doe", "headshot": "https://example.com/john.jpg", "institution": "MIT"}],
                location="Main Hall",
                event=event
            ),
            Event_Item(
                title="Web Development Workshop",
                time=datetime(2026, 2, 15, 10, 30, 0),
                speakers=[{"name": "Jane Smith", "headshot": "https://example.com/jane.jpg", "institution": "Stanford"}],
                description="Learn modern web development practices",
                location="Room 101",
                event=event
            ),
            Event_Item(
                title="AI and Machine Learning Panel",
                time=datetime(2026, 2, 15, 12, 0, 0),
                speakers=[
                    {"name": "Dr. Alan Turing", "headshot": "https://example.com/alan.jpg", "institution": "Cambridge"},
                    {"name": "Dr. Grace Hopper", "headshot": "https://example.com/grace.jpg", "institution": "Yale"}
                ],
                location="Auditorium",
                event=event
            ),
            Event_Item(
                title="Lunch Break",
                time=datetime(2026, 2, 15, 13, 0, 0),
                location="Cafeteria",
                event=event
            ),
            Event_Item(
                title="Cloud Infrastructure Deep Dive",
                sponsor="CloudTech Inc",
                time=datetime(2026, 2, 15, 14, 0, 0),
                speakers=[{"name": "Bob Wilson", "headshot": "https://example.com/bob.jpg", "institution": "Google"}],
                link="https://example.com/cloud-session",
                location="Room 201",
                event=event
            ),
            Event_Item(
                title="Mobile Development Trends",
                time=datetime(2026, 2, 15, 15, 30, 0),
                speakers=[{"name": "Alice Johnson", "headshot": "https://example.com/alice.jpg", "institution": "Apple"}],
                slides=[{"title": "Introduction", "href": "https://example.com/slides1.pdf"}],
                location="Room 102",
                event=event
            ),
            Event_Item(
                title="DevOps Best Practices",
                time=datetime(2026, 2, 15, 17, 0, 0),
                speakers=[{"name": "Charlie Brown", "headshot": "https://example.com/charlie.jpg", "institution": "Netflix"}],
                description="Modern deployment strategies",
                location="Room 301",
                event=event
            ),
            Event_Item(
                title="Networking Reception",
                time=datetime(2026, 2, 15, 18, 30, 0),
                location="Rooftop Lounge",
                event=event
            ),
            Event_Item(
                title="Closing Remarks",
                time=datetime(2026, 2, 15, 20, 0, 0),
                speakers=[{"name": "CEO", "headshot": "https://example.com/ceo.jpg", "institution": "TechConf"}],
                cancelled=False,
                location="Main Hall",
                event=event
            ),
            Event_Item(
                title="After-Party",
                time=datetime(2026, 2, 15, 21, 0, 0),
                location="Downtown Bar",
                event=event
            ),
        ]
        
        # Add all event items to the session
        session.add_all(event_items)
        await session.commit()
        
        print(f"✓ Event (ID: {event.id}) created with 10 items:")
        for item in event_items:
            print(f"  - {item.title}: {item.time}")


if __name__ == "__main__":
    asyncio.run(seed_event_database())
