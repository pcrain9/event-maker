from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from backend.models.announcement import Announcement
from backend.schema.announcement import AnnouncementCreate, AnnouncementUpdate


async def get_announcements_by_event(db: AsyncSession, event_id: int) -> list[Announcement]:
    """
    Fetch all announcements for a specific event.
    
    Args:
        db: The database session
        event_id: The ID of the event
    
    Returns:
        List of Announcement objects
    """
    query = select(Announcement).where(Announcement.event_id == event_id)
    result = await db.execute(query)
    return list(result.scalars().all())


async def get_announcement(db: AsyncSession, announcement_id: int) -> Announcement | None:
    """
    Fetch a single announcement by ID.
    
    Args:
        db: The database session
        announcement_id: The ID of the announcement
    
    Returns:
        The Announcement object if found, or None if not found
    """
    query = select(Announcement).where(Announcement.id == announcement_id)
    result = await db.execute(query)
    return result.scalar_one_or_none()


async def create_announcement(db: AsyncSession, announcement_data: AnnouncementCreate) -> Announcement:
    """
    Create a new announcement.
    
    Args:
        db: The database session
        announcement_data: The announcement creation data
    
    Returns:
        The created Announcement object
    """
    announcement = Announcement(
        title=announcement_data.title,
        body=announcement_data.body,
        tone=announcement_data.tone,
        starts=announcement_data.starts,
        ends=announcement_data.ends,
        event_id=announcement_data.event_id,
    )
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return announcement


async def update_announcement(db: AsyncSession, announcement_id: int, announcement_data: AnnouncementUpdate) -> Announcement | None:
    """
    Update an existing announcement.
    
    Args:
        db: The database session
        announcement_id: The ID of the announcement to update
        announcement_data: The update data
    
    Returns:
        The updated Announcement object, or None if not found
    """
    announcement = await get_announcement(db, announcement_id)
    if not announcement:
        return None
    
    update_data = announcement_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(announcement, field, value)
    
    await db.commit()
    await db.refresh(announcement)
    return announcement


async def delete_announcement(db: AsyncSession, announcement_id: int) -> bool:
    """
    Delete an announcement.
    
    Args:
        db: The database session
        announcement_id: The ID of the announcement to delete
    
    Returns:
        True if deleted, False if not found
    """
    announcement = await get_announcement(db, announcement_id)
    if not announcement:
        return False
    
    await db.delete(announcement)
    await db.commit()
    return True
