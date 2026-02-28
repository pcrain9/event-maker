from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend import db
from backend.constants import DEFAULT_COLOR_SCHEME
from backend.models.event import Event
from backend.models.event_item import Event_Item
from backend.schema.event_item import EventItemResponse, EventItemDetail, ColorScheme

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
    # Use default color scheme if not set
    color_scheme = ColorScheme(**event.color_scheme) if event.color_scheme else DEFAULT_COLOR_SCHEME
    
    # Query event items
    items_query = select(Event_Item).where(Event_Item.event_id == event_id_val)
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
        event_items=items_list
    )


