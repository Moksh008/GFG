from datetime import datetime

from sqlalchemy import JSON, Boolean, DateTime, Float, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.entities._base import utcnow


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    full_name: Mapped[str] = mapped_column(String(120), default="")
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    # Health profile
    date_of_birth: Mapped[str | None] = mapped_column(String(20), nullable=True)
    skin_type: Mapped[str | None] = mapped_column(String(40), nullable=True)  # e.g. Fitzpatrick III
    primary_condition: Mapped[str | None] = mapped_column(String(60), nullable=True)
    medical_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    known_triggers: Mapped[list] = mapped_column(JSON, default=list)

    # Preferences
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    notifications_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    data_sharing_consent: Mapped[bool] = mapped_column(Boolean, default=False)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
