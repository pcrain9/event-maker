from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.exc import SQLAlchemyError

from backend.db import get_db
from backend.schema.event_item import (
    EventItemResponse, EventItemUpdate, EventUpdate,
    EventItemDetail,
)
from backend.models.user import User
from backend.services.events import get_event_with_items, get_all_events, update_event
from backend.services.event_items import update_event_item
from backend.core.auth import require_admin

router = APIRouter(prefix="/events", tags=["events"])

@router.get("/")
async def get_all_events_route(db: AsyncSession = Depends(get_db)):
    """Fetch all events with basic info."""
    events = await get_all_events(db)
    
    if not events:
        raise HTTPException(status_code=404, detail="No events found")
    
    return {"events": events}

@router.get("/{slug}")
async def get_events(slug: str, db: AsyncSession = Depends(get_db)):
    """Fetch an event by slug with all its items."""
    result = await get_event_with_items(slug, db)
    
    if result is None:
        raise HTTPException(status_code=404, detail="Event not found")
    
    return result


@router.put("/{event_id}", response_model=EventItemResponse)
async def update_event_route(
    event_id: int,
    event_update: EventUpdate,
    _: Annotated[User, Depends(require_admin)],
    db: AsyncSession = Depends(get_db)
):
    """
    Update an event (admin only).

    Requires admin role to access.
    """
    try:
        updated = await update_event(db, event_id, event_update)

        if not updated:
            raise HTTPException(status_code=404, detail="Event not found")

        result = await get_event_with_items(updated.slug, db)
        if result is None:
            raise HTTPException(status_code=404, detail="Event not found")

        return result
    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while updating event"
        )


@router.put("/{event_id}/items/{item_id}", response_model=EventItemDetail)
async def update_event_item_route(
    event_id: int,
    item_id: int,
    item_update: EventItemUpdate,
    _: Annotated[User, Depends(require_admin)],  # auth check
    db: AsyncSession = Depends(get_db)
):
    """
    Update an event item (admin only).
    
    Requires admin role to access.
    """
    try:
        updated = await update_event_item(db, event_id, item_id, item_update)
        
        if not updated:
            raise HTTPException(status_code=404, detail="Event item not found")
        
        return updated
    except SQLAlchemyError:
        raise HTTPException(
            status_code=500,
            detail="Database error occurred while updating event item"
        )