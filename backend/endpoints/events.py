from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db import get_db
from backend.schema.event_item import GetEventItemsRequest, EventItemResponse
from backend.models.event_item import Event_Item

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/")
async def get_event_ids(db: AsyncSession = Depends(get_db)):
    """Fetch all event IDs."""
    query = select(Event_Item.event_id).distinct()
    result = await db.execute(query)
    event_ids = result.scalars().all()
    return {"event_ids": event_ids}

@router.get("/{event_id}")
async def get_events(event_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch all event items for a specific event."""
    query = select(Event_Item).where(Event_Item.event_id == event_id)
    result = await db.execute(query)
    event_items = result.scalars().all()
    
    return [
        EventItemResponse(
            id=item.id,
            name=item.name,
            quantity=item.quantity,
            event_id=item.event_id
        )
        for item in event_items
    ]

    