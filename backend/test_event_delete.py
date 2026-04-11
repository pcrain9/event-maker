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
            sponsors=[
                "https://cdn.example.com/sponsors/acme-logo.png",
                "https://cdn.example.com/sponsors/contoso-logo.png",
            ],
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


def test_event_persists_sponsor_image_urls() -> None:
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)

    sponsor_urls = [
        "https://cdn.example.com/sponsors/acme-logo.png",
        "https://cdn.example.com/sponsors/contoso-logo.png",
    ]

    with Session(engine) as session:
        event = Event(
            slug="sponsor-event",
            title="Sponsor Event",
            hero_image_url=None,
            color_scheme={"primary": "#111111", "secondary": "#eeeeee"},
            sponsors=sponsor_urls,
            footer_links=None,
        )

        session.add(event)
        session.commit()
        session.expire_all()

        saved_event = session.scalar(
            select(Event).where(Event.slug == "sponsor-event")
        )

        assert saved_event is not None
        assert saved_event.sponsors == sponsor_urls
*** Add File: /home/pc9/code/full-stack-1/backend/alembic/versions/9c5f7d3d6e21_event_sponsors.py
"""event sponsors

Revision ID: 9c5f7d3d6e21
Revises: cf9364e36128
Create Date: 2026-04-11 00:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9c5f7d3d6e21'
down_revision = 'cf9364e36128'
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column('events', sa.Column('sponsors', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('events', 'sponsors')