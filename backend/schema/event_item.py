from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ColorScheme(BaseModel):
    primary: str
    secondary: str
    tertiary: str
    background: str
    alt_background: str
    text: str
    title_text: str
class EventItemDetail(BaseModel):
    """Schema for individual event item data."""
    id: int
    title: str
    sponsor: Optional[str] = None
    time: datetime
    speakers: Optional[list['Speaker']] = None
    link: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    cancelled: Optional[bool] = False
    slides: Optional[list] = None
    event_id: int

    class Config:
        from_attributes = True

class EventItemResponse(BaseModel):
    """Schema for event item response - event with list of event items."""
    # Event fields
    id: int
    title: str
    hero_image_url: Optional[str] = None
    color_scheme: ColorScheme
    
    # List of event items
    event_items: list[EventItemDetail]

    class Config:
        from_attributes = True

class GetEventItemsRequest(BaseModel):
    """Schema for requesting event items by event_id."""
    event_id: str

class Speaker(BaseModel):
    name: str
    headshot: str
    institution: str