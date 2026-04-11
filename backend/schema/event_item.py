from pydantic import BaseModel, model_validator
from typing import Any, Optional
from datetime import datetime

class ColorScheme(BaseModel):
    primary: str
    secondary: str
    background: str
    text: str
    heading: Optional[str] = None
    alt_background: Optional[str] = None

    model_config = {"extra": "ignore"}

    @model_validator(mode="before")
    @classmethod
    def migrate_legacy_fields(cls, data: Any) -> Any:
        if isinstance(data, dict):
            # Map old title_text -> heading for backward compatibility
            if "heading" not in data and "title_text" in data:
                data = {**data, "heading": data["title_text"]}
            # Provide a default heading if still missing
            if not data.get("heading"):
                data = {**data, "heading": data.get("text", "#141414")}
        return data

class FooterLink(BaseModel):
    link_title: str
    href: str

class EventSummary(BaseModel):
    """Schema for event summary in list responses."""
    id: int
    slug: str
    title: str

    class Config:
        from_attributes = True


class EventCreate(BaseModel):
    """Schema for creating a new event."""
    slug: str
    title: str
    hero_image_url: Optional[str] = None
    color_scheme: ColorScheme
    event_items: Optional[list['EventItemCreate']] = None

    class Config:
        from_attributes = True


class EventAdminResponse(BaseModel):
    """Schema for create/update event responses in admin flows."""
    id: int
    slug: str
    title: str
    hero_image_url: Optional[str] = None
    color_scheme: ColorScheme
    footer_links: Optional[list[FooterLink]] = None

    class Config:
        from_attributes = True

class EventsListResponse(BaseModel):
    """Schema for list of events response."""
    events: list[EventSummary]

    class Config:
        from_attributes = True

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

class EventItemUpdate(BaseModel):
    """Schema for updating event items - all fields optional."""
    title: Optional[str] = None
    sponsor: Optional[str] = None
    time: Optional[datetime] = None
    speakers: Optional[list['Speaker']] = None
    link: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    cancelled: Optional[bool] = None
    slides: Optional[list] = None

    class Config:
        from_attributes = True

class EventItemCreate(BaseModel):
    """Schema for creating event items."""
    title: str
    sponsor: Optional[str] = None
    time: datetime
    speakers: Optional[list['Speaker']] = None
    link: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    cancelled: Optional[bool] = False
    slides: Optional[list] = None

    class Config:
        from_attributes = True

class EventUpdate(BaseModel):
    footer_links: Optional[list[FooterLink]] = None
    color_scheme: Optional[ColorScheme] = None

    class Config:
        from_attributes = True

class EventItemResponse(BaseModel):
    """Schema for event item response - event with list of event items."""
    # Event fields
    id: int
    slug: str
    title: str
    hero_image_url: Optional[str] = None
    color_scheme: ColorScheme
    footer_links: Optional[list[FooterLink]] = None
    
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