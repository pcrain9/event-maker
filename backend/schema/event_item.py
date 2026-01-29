from pydantic import BaseModel


class EventItemResponse(BaseModel):
    """Schema for event item response."""
    id: int
    name: str
    quantity: int
    event_id: int

    class Config:
        from_attributes = True


class GetEventItemsRequest(BaseModel):
    """Schema for requesting event items by event_id."""
    event_id: str
