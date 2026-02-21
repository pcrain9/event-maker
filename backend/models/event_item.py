from typing import TYPE_CHECKING, Optional
from datetime import datetime
from sqlalchemy import Identity, Integer, String, Boolean, JSON, Text, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db import Base
from ..schema.event_item import Speaker

if TYPE_CHECKING:
    from .event import Event

class Event_Item(Base):
    __tablename__ = "event_items"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String, nullable=False)
    sponsor: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    speakers: Mapped[Optional[list[Speaker]]] = mapped_column(JSON, nullable=True)
    link: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    location: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    cancelled: Mapped[Optional[bool]] = mapped_column(Boolean, default=False, nullable=True)
    slides: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)

    # Relationship to Event
    event: Mapped["Event"] = relationship("Event", back_populates="items")

    def __repr__(self) -> str:  # pragma: no cover - tiny helper
        return f"<Event_Item id={self.id} title={self.title} time={self.time}>"
    