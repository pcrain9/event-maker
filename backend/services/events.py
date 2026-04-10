from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from backend import db
from backend.constants import DEFAULT_COLOR_SCHEME
from backend.models.event import Event
from backend.models.event_item import Event_Item
from backend.schema.event_item import (
    EventItemResponse,
    EventItemDetail,
    ColorScheme,
    EventUpdate,
    FooterLink,
    EventCreate,
    EventItemCreate,
)


def _dump_model(model: object, *, exclude_unset: bool = False) -> dict:
    if hasattr(model, "model_dump"):
        return model.model_dump(exclude_unset=exclude_unset)  # type: ignore[attr-defined]
    return model.dict(exclude_unset=exclude_unset)  # type: ignore[attr-defined]


def _build_event_item_models(
    event: Event,
    event_items: list[EventItemCreate],
) -> list[Event_Item]:
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
        Event_Item(
            event=event,
            **{key: value for key, value in _dump_model(item).items() if key in allowed_keys},
        )
        for item in event_items
    ]

async def get_event(db:AsyncSession, event_id: int) -> Event | None:
    """
    Fetch an event by its ID.
    
    Args:
        db: The database session
        event_id: The ID of the event to fetch
    
    Returns:
        The Event object if found, or None if not found
    """
    query = select(Event).where(Event.id == event_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def get_event_by_slug(db: AsyncSession, slug: str) -> Event | None:
    """
    Fetch an event by its slug.
    
    Args:
        db: The database session
        slug: The slug of the event to fetch
    
    Returns:
        The Event object if found, or None if not found
    """
    query = select(Event).where(Event.slug == slug)
    result = await db.execute(query)
    return result.scalar_one_or_none()



async def get_event_ids(db: AsyncSession) -> dict | None:
    """
    Fetch all distinct event slugs.
    
    Args:
        db: The database session
    
    Returns:
        Dictionary with list of event slugs, or None if no events found
    """
    query = select(Event.slug).distinct()
    result = await db.execute(query)
    event_slugs = result.scalars().all()
    
    if not event_slugs:
        return None
    
    return {"event_slugs": event_slugs}


async def get_event_with_items(slug: str, db: AsyncSession) -> EventItemResponse | None:
    """
    Fetch an event by slug and all its items, returning a flattened response.
    
    Args:
        slug: The slug of the event to fetch
        db: The database session
    
    Returns:
        EventItemResponse with event data and list of items, or None if event not found
    """
    # Query the Event model by slug
    event = await get_event_by_slug(db, slug)
    if not event:
        return None
    
    # Store event data in method constants
    event_id_val = event.id
    event_slug = event.slug
    event_title = event.title
    hero_image_url = event.hero_image_url
    footer_links = (
        [
            link if isinstance(link, FooterLink) else FooterLink(**link)
            for link in event.footer_links
        ]
        if event.footer_links is not None
        else None
    )
    # Use default color scheme if not set
    color_scheme = ColorScheme(**event.color_scheme) if event.color_scheme else DEFAULT_COLOR_SCHEME
    
    # Query event items ordered by time (chronological)
    items_query = select(Event_Item).where(Event_Item.event_id == event_id_val).order_by(Event_Item.time)
    items_result = await db.execute(items_query)
    event_items = items_result.scalars().all()
    
    # Build event item details list
    items_list = [
        EventItemDetail(
            id=item.id,
            title=item.title,
            sponsor=item.sponsor,
            time=item.time,
            speakers=item.speakers,
            link=item.link,
            description=item.description,
            location=item.location,
            cancelled=item.cancelled,
            slides=item.slides,
            event_id=item.event_id
        )
        for item in event_items
    ]
    
    # Build and return response
    return EventItemResponse(
        id=event_id_val,
        slug=event_slug,
        title=event_title,
        hero_image_url=hero_image_url,
        color_scheme=color_scheme,
        footer_links=footer_links,
        event_items=items_list
    )


async def update_event(
    db: AsyncSession,
    event_id: int,
    event_data: EventUpdate,
) -> Event | None:
    """
    Update an event with the provided data.

    Args:
        db: The database session
        event_id: The ID of the event to update
        event_data: The partial update data

    Returns:
        The updated Event object if successful, or None if event not found

    Raises:
        SQLAlchemyError: If database operation fails
    """
    event = await get_event(db, event_id)
    if not event:
        return None

    update_data = (
        event_data.model_dump(exclude_unset=True)  # type: ignore[attr-defined]
        if hasattr(event_data, "model_dump")
        else event_data.dict(exclude_unset=True)
    )
    for field, value in update_data.items():
        setattr(event, field, value)

    # Explicitly flag JSON columns as modified so SQLAlchemy always writes them
    from sqlalchemy.orm.attributes import flag_modified
    if "color_scheme" in update_data:
        flag_modified(event, "color_scheme")
    if "footer_links" in update_data:
        flag_modified(event, "footer_links")

    try:
        await db.commit()
        await db.refresh(event)
        return event
    except SQLAlchemyError:
        await db.rollback()
        raise


async def create_event(db: AsyncSession, event_data: EventCreate) -> Event:
    """
    Create a new event.

    Args:
        db: The database session
        event_data: Event creation payload

    Returns:
        The created Event object

    Raises:
        SQLAlchemyError: If database operation fails
    """
    event = Event(
        slug=event_data.slug,
        title=event_data.title,
        hero_image_url=event_data.hero_image_url,
        color_scheme=_dump_model(event_data.color_scheme),
    )
    db.add(event)

    try:
        await db.flush()

        if event_data.event_items:
            db.add_all(_build_event_item_models(event, event_data.event_items))

        await db.commit()
        await db.refresh(event)
        return event
    except SQLAlchemyError:
        await db.rollback()
        raise


async def delete_event(db: AsyncSession, event_id: int) -> bool:
    """
    Delete an event by id.

    Args:
        db: The database session
        event_id: The id of the event to delete

    Returns:
        True when deleted, False when not found

    Raises:
        SQLAlchemyError: If database operation fails
    """
    event = await get_event(db, event_id)
    if not event:
        return False

    try:
        await db.delete(event)
        await db.commit()
        return True
    except SQLAlchemyError:
        await db.rollback()
        raise


async def get_all_events(db: AsyncSession) -> list[dict]:
    """
    Fetch all events with basic info for list views.
    
    Args:
        db: The database session
    
    Returns:
        List of event dictionaries with id, slug, title
    """
    query = select(Event).order_by(Event.id)
    result = await db.execute(query)
    events = result.scalars().all()
    
    return [
        {
            "id": event.id,
            "slug": event.slug,
            "title": event.title
        }
        for event in events
    ]
