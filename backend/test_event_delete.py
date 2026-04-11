from datetime import datetime, timezone

from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from backend.db import Base
from backend.models.announcement import Announcement
from backend.models.event import Event
from backend.models.event_item import Event_Item


def test_deleting_event_cascades_to_items_and_announcements() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    with Session(engine) as session:
        event = Event(
            slug="test-event",
            title="Test Event",
            hero_image_url=None,
            color_scheme={"primary": "#000000", "secondary": "#ffffff"},
            footer_links=None,
        )
        event.items.append(
            Event_Item(
                title="Opening Session",
                sponsor=None,
                time=datetime(2026, 4, 20, 9, 0),
                speakers=None,
                link=None,
                description=None,
                location="Main Hall",
                cancelled=False,
                slides=None,
            )
        )
        event.announcements.append(
            Announcement(
                title="Doors Open",
                body="Welcome",
                tone="info",
                starts=datetime(2026, 4, 20, 8, 0, tzinfo=timezone.utc),
                ends=datetime(2026, 4, 20, 10, 0, tzinfo=timezone.utc),
            )
        )

        session.add(event)
        session.commit()

        session.delete(event)
        session.commit()

        assert session.scalar(select(Event.id)) is None
        assert session.scalar(select(Event_Item.id)) is None
        assert session.scalar(select(Announcement.id)) is None