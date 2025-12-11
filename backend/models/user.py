from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from ..db import Base


class User(Base):
	__tablename__ = "users"

	id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
	username: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
	hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
	full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
	is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
	created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

	def __repr__(self) -> str:  # pragma: no cover - tiny helper
		return f"<User id={self.id} username={self.username}>"
