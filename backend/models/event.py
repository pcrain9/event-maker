from typing import TYPE_CHECKING
from sqlalchemy import Integer, String, Identity
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db import Base

if TYPE_CHECKING:
    from .event_item import Event_Item


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True, index=True)
    
    # Relationship to Event_Item
    items: Mapped[list["Event_Item"]] = relationship("Event_Item", back_populates="event")

    def __repr__(self) -> str:  # pragma: no cover - tiny helper
        return f"<Event id={self.id}>"