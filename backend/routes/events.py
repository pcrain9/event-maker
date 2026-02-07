from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.db import get_db
from backend.schema.event_item import GetEventItemsRequest, EventItemResponse
from backend.models.event_item import Event_Item
from backend.services.events import get_event_with_items, get_event_ids

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/")
async def get_event_ids_route(db: AsyncSession = Depends(get_db)):
    """Fetch all event IDs."""
    result = await get_event_ids(db)
    
    if result is None:
        raise HTTPException(status_code=404, detail="No events found")
    
    return result

@router.get("/{event_id}")
async def get_events(event_id: int, db: AsyncSession = Depends(get_db)):
    """Fetch an event with all its items."""
    result = await get_event_with_items(event_id, db)
    
    if result is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return result