from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, Identity, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db import Base

if TYPE_CHECKING:
    from .event_item import Event_Item
    from .announcement import Announcement


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True, index=True)
    slug: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    hero_image_url: Mapped[str] = mapped_column(String(255), nullable=True) 
    color_scheme: Mapped[dict] = mapped_column(JSON, nullable=False) 
    
    # Relationship to Event_Item
    items: Mapped[list["Event_Item"]] = relationship("Event_Item", back_populates="event")
    
    # Relationship to Announcement
    announcements: Mapped[list["Announcement"]] = relationship("Announcement", back_populates="event")

    def __repr__(self) -> str:  # pragma: no cover - tiny helper
        return f"<Event id={self.id}>"