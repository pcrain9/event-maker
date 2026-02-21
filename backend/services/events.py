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

async def get_event_item(db:AsyncSession, event_id: int, event_item_id: int) -> Event | None:
    """
    Fetch an event item by its event ID and event item ID.
    
    Args:
        db: The database session
        event_id: The ID of the event to fetch
        event_item_id: The ID of the event item to fetch
    
    Returns:
        The Event object if found, or None if not found
    """
    query = select(Event_Item).where(Event_Item.event_id == event_id, Event_Item.id == event_item_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

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
    event = await get_event(db, event_id)
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

async def update_event_item(db:AsyncSession, event_id: int, event_item: EventItemDetail) -> dict | None:
    """
    Updat an event item given event item ID and new data.
    
    Args:
        event_id: The ID of the event to fetch
        event_item_id: The ID of the event item to fetch
        event_item_info: The new information for the event item
        db: The database session
    
    Returns:
        A success message (200) if update is successful, or None if event or item not found
    """
    # Ensure that the incoming event_item has proper format
    if not event_item or not event_item.id:
        return None
    # Get the event item
    fetched_event_item = await get_event_item(db, event_id, event_item.id)
    if not fetched_event_item:
        return None
    # Update the event item fields
    fetched_event_item.title = event_item.title
    fetched_event_item.sponsor = event_item.sponsor
    fetched_event_item.time = event_item.time
    fetched_event_item.speakers = event_item.speakers
    fetched_event_item.link = event_item.link
    fetched_event_item.description = event_item.description
    fetched_event_item.location = event_item.location
    fetched_event_item.cancelled = event_item.cancelled
    fetched_event_item.slides = event_item.slides
    # Commit the changes to the database
    await db.commit()
    await db.refresh(fetched_event_item)

    # response should be a simple 200 message.
    return {"message": "Event item updated successfully"}
   

