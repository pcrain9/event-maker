from typing import TYPE_CHECKING
from datetime import datetime
from sqlalchemy import Integer, String, Text, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from ..db import Base

if TYPE_CHECKING:
    from .event import Event


class Announcement(Base):
    __tablename__ = "announcements"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)
    tone: Mapped[str] = mapped_column(String(50), nullable=False)  # info, success, warning, danger
    starts: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    ends: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    event_id: Mapped[int] = mapped_column(ForeignKey("events.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationship to Event
    event: Mapped["Event"] = relationship("Event", back_populates="announcements")

    def __repr__(self) -> str:  # pragma: no cover - tiny helper
        return f"<Announcement id={self.id} title={self.title}>"
