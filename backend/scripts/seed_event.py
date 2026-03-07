from sqlalchemy import select

from backend.constants import DEFAULT_COLOR_SCHEME
from backend.updated_2025_conference_data import EVENT_ITEMS_2025
from ..test_event_data import TEST_EVENT_ITEMS
from ..models.event import Event
from ..models.event_item import Event_Item
from ..db import get_session_factory
import asyncio


def _build_event_items(event: Event, items: list[dict]) -> list[Event_Item]:
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
    return [
        Event_Item(event=event, **{k: v for k, v in item.items() if k in allowed_keys})
        for item in items
    ]


async def seed_event_database():
    """Seed conference events and their items."""
    session_factory = get_session_factory()
    async with session_factory() as session:  # type: ignore
        color_scheme = (
            DEFAULT_COLOR_SCHEME.model_dump()  # type: ignore[attr-defined]
            if hasattr(DEFAULT_COLOR_SCHEME, "model_dump")
            else DEFAULT_COLOR_SCHEME.dict()
        )
        events_to_seed = [
            {
                "title": "TAM Annual Meeting 2025",
                "slug": "austin-2025",
                "items": EVENT_ITEMS_2025,
            },
            {
                "title": "Test Event",
                "slug": "test-event",
                "items": TEST_EVENT_ITEMS,
            },
        ]

        created_events: list[tuple[Event, list[Event_Item]]] = []

        for event_data in events_to_seed:
            existing = await session.execute(
                select(Event).where(Event.slug == event_data["slug"])
            )
            if existing.scalar_one_or_none() is not None:
                print(f"Event with slug '{event_data['slug']}' already exists, skipping.")
                continue

            event = Event(
                title=event_data["title"],
                slug=event_data["slug"],
                hero_image_url=None,
                color_scheme=color_scheme,
            )
            session.add(event)
            await session.flush()  # Flush to get event.id for related items.

            event_items = _build_event_items(event, event_data["items"])
            session.add_all(event_items)
            created_events.append((event, event_items))

        await session.commit()

        if not created_events:
            print("No new events were seeded.")
            return

        for event, event_items in created_events:
            print(f"✓ Event (ID: {event.id}, slug: {event.slug}) created with {len(event_items)} items")


if __name__ == "__main__":
    asyncio.run(seed_event_database())
