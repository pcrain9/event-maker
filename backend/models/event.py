from sqlalchemy import Integer, String, Boolean, JSON, Text
from sqlalchemy.orm import Mapped, mapped_column
from ..db import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    sponsor: Mapped[str | None] = mapped_column(String(255), nullable=True)
    time: Mapped[str] = mapped_column(String(255), nullable=False)
    speakers: Mapped[list | None] = mapped_column(JSON, nullable=True)
    link: Mapped[str | None] = mapped_column(String(2048), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)
    cancelled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    slides: Mapped[list | None] = mapped_column(JSON, nullable=True)

    def __repr__(self) -> str:  # pragma: no cover - tiny helper
        return f"<Event id={self.id} title={self.title}>"
