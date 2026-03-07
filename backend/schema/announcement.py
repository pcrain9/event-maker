from datetime import datetime
from pydantic import BaseModel
from typing import Optional


class AnnouncementCreate(BaseModel):
    """Schema for creating an announcement."""
    title: str
    body: str
    tone: str  # info, success, warning, danger
    starts: datetime
    ends: datetime
    event_id: int

    class Config:
        from_attributes = True


class AnnouncementUpdate(BaseModel):
    """Schema for updating an announcement - all fields optional."""
    title: Optional[str] = None
    body: Optional[str] = None
    tone: Optional[str] = None
    starts: Optional[datetime] = None
    ends: Optional[datetime] = None

    class Config:
        from_attributes = True


class AnnouncementResponse(BaseModel):
    """Schema for announcement response."""
    id: int
    title: str
    body: str
    tone: str
    starts: datetime
    ends: datetime
    event_id: int
    created_at: datetime

    class Config:
        from_attributes = True
