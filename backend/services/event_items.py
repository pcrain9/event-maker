from sqlalchemy import select

from backend.models.event import Event
from backend.models.event_item import Event_Item
from backend.schema.event_item import EventItemDetail
from sqlalchemy.ext.asyncio import AsyncSession



async def get_event_item(db:AsyncSession, event_id: int, event_item_id: int) -> Event_Item | None:
    """
    Fetch an event item by its event ID and event item ID.
    
    Args:
        db: The database session
        event_id: The ID of the event to fetch
        event_item_id: The ID of the event item to fetch
    
    Returns:
        The Event_Item object if found, or None if not found
    """
    query = select(Event_Item).where(Event_Item.event_id == event_id, Event_Item.id == event_item_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()

async def update_event_item(db:AsyncSession, event_id: int, event_item: EventItemDetail) -> dict | None:
    """
    Update an event item given event item ID and new data.
    
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
   
