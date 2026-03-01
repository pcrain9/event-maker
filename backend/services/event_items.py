from sqlalchemy import select
from sqlalchemy.exc import SQLAlchemyError

from backend.models.event import Event
from backend.models.event_item import Event_Item
from backend.schema.event_item import EventItemDetail, EventItemUpdate
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

async def update_event_item(
    db: AsyncSession, 
    event_id: int, 
    event_item_id: int,
    event_item_data: EventItemUpdate
) -> Event_Item | None:
    """
    Update an event item with the provided data.
    
    Args:
        db: The database session
        event_id: The ID of the event
        event_item_id: The ID of the event item to update
        event_item_data: The update data (all fields optional)
    
    Returns:
        The updated Event_Item object if successful, or None if item not found
        
    Raises:
        SQLAlchemyError: If database operation fails
    """
    # Get the event item
    fetched_event_item = await get_event_item(db, event_id, event_item_id)
    if not fetched_event_item:
        return None
    
    # Update only provided fields
    update_data = event_item_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(fetched_event_item, field, value)
    
    try:
        await db.commit()
        await db.refresh(fetched_event_item)
        return fetched_event_item
    except SQLAlchemyError:
        await db.rollback()
        raise
   
