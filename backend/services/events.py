from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.constants import DEFAULT_COLOR_SCHEME
from backend.models.event import Event
from backend.models.event_item import Event_Item
from backend.schema.event_item import EventItemResponse, EventItemDetail, ColorScheme


async def get_event_ids(db: AsyncSession) -> dict | None:
    """
    Fetch all distinct event IDs.
    
    Args:
        db: The database session
    
    Returns:
        Dictionary with list of event IDs, or None if no events found
    """
    query = select(Event_Item.event_id).distinct()
    result = await db.execute(query)
    event_ids = result.scalars().all()
    
    if not event_ids:
        return None
    
    return {"event_ids": event_ids}


async def get_event_with_items(event_id: int, db: AsyncSession) -> EventItemResponse | None:
    """
    Fetch an event and all its items, returning a flattened response.
    
    Args:
        event_id: The ID of the event to fetch
        db: The database session
    
    Returns:
        EventItemResponse with event data and list of items, or None if event not found
    """
    # Query the Event model
    event_query = select(Event).where(Event.id == event_id)
    event_result = await db.execute(event_query)
    event = event_result.scalar_one_or_none()
    
    if not event:
        return None
    
    # Store event data in method constants
    event_id_val = event.id
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
        title=event_title,
        hero_image_url=hero_image_url,
        color_scheme=color_scheme,
        event_items=items_list
    )