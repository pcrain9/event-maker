from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from backend.db import get_db
from backend.models.user import User
from backend.schema.announcement import (
    AnnouncementCreate,
    AnnouncementUpdate,
    AnnouncementResponse,
)
from backend.services.announcements import (
    get_announcements_by_event,
    get_announcement,
    create_announcement,
    update_announcement,
    delete_announcement,
)
from backend.core.auth import require_admin

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.get("/", response_model=list[AnnouncementResponse])
async def list_announcements(
    event_id: int = Query(..., description="Event ID to filter announcements"),
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch all announcements for a specific event.
    
    Requires event_id query parameter.
    """
    announcements = await get_announcements_by_event(db, event_id)
    return announcements


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
async def get_announcement_route(
    announcement_id: int,
    db: AsyncSession = Depends(get_db),
):
    """
    Fetch a single announcement by ID.
    """
    announcement = await get_announcement(db, announcement_id)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    return announcement


@router.post("/", response_model=AnnouncementResponse, status_code=201)
async def create_announcement_route(
    announcement_data: AnnouncementCreate,
    _: Annotated[User, Depends(require_admin)],  # auth check
    db: AsyncSession = Depends(get_db),
):
    """
    Create a new announcement (admin only).
    
    Requires admin role to access.
    """
    announcement = await create_announcement(db, announcement_data)
    return announcement


@router.put("/{announcement_id}", response_model=AnnouncementResponse)
async def update_announcement_route(
    announcement_id: int,
    announcement_data: AnnouncementUpdate,
    _: Annotated[User, Depends(require_admin)],  # auth check
    db: AsyncSession = Depends(get_db),
):
    """
    Update an announcement (admin only).
    
    Requires admin role to access.
    """
    announcement = await update_announcement(db, announcement_id, announcement_data)
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    return announcement


@router.delete("/{announcement_id}")
async def delete_announcement_route(
    announcement_id: int,
    _: Annotated[User, Depends(require_admin)],  # auth check
    db: AsyncSession = Depends(get_db),
):
    """
    Delete an announcement (admin only).
    
    Requires admin role to access.
    """
    deleted = await delete_announcement(db, announcement_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Announcement not found")
    
    return {"message": "Announcement deleted successfully"}
