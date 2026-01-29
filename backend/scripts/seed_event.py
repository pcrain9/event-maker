from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from ..models.event import Event
from ..models.event_item import Event_Item
from ..db import AsyncSessionLocal
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
        
        # Create a new event
        event = Event()
        session.add(event)
        await session.flush()  # Flush to get the event ID
        
        # Define 10 mock event items (reference the event object directly)
        event_items = [
            Event_Item(name="Appetizers", quantity=50, event=event),
            Event_Item(name="Main Course Plates", quantity=75, event=event),
            Event_Item(name="Desserts", quantity=100, event=event),
            Event_Item(name="Beverages", quantity=200, event=event),
            Event_Item(name="Napkins", quantity=500, event=event),
            Event_Item(name="Plates", quantity=150, event=event),
            Event_Item(name="Utensils Set", quantity=150, event=event),
            Event_Item(name="Glasses", quantity=200, event=event),
            Event_Item(name="Chairs", quantity=100, event=event),
            Event_Item(name="Tables", quantity=15, event=event),
        ]
        
        # Add all event items to the session
        session.add_all(event_items)
        await session.commit()
        
        print(f"✓ Event (ID: {event.id}) created with 10 items:")
        for item in event_items:
            print(f"  - {item.name}: {item.quantity}")


if __name__ == "__main__":
    asyncio.run(seed_event_database())
