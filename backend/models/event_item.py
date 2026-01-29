from typing import TYPE_CHECKING
from sqlalchemy import Identity, Integer, String, Boolean, JSON, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db import Base

if TYPE_CHECKING:
    from .event import Event

class Event_Item(Base):
    __tablename__ = "event_items"

    id: Mapped[int] = mapped_column(Integer, Identity(), primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False)
    event_id: Mapped[int] = mapped_column(Integer, ForeignKey("events.id"), nullable=False)

    # Relationship to Event
    event: Mapped["Event"] = relationship("Event", back_populates="items")

    def __repr__(self) -> str:  # pragma: no cover - tiny helper
        return f"<Event_Item id={self.id} name={self.name} quantity={self.quantity}>"
    