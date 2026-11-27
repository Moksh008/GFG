from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.entities._base import utcnow


class MoodLog(Base):
    __tablename__ = "mood_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    mood_score: Mapped[int] = mapped_column(Integer)  # 1 (very low) .. 10 (great)
    stress_level: Mapped[int] = mapped_column(Integer, default=5)  # 1 .. 10
    anxiety_level: Mapped[int | None] = mapped_column(Integer, nullable=True)
    sleep_hours: Mapped[float | None] = mapped_column(Float, nullable=True)
    itch_level: Mapped[int | None] = mapped_column(Integer, nullable=True)  # 0 .. 10
    emotions: Mapped[list] = mapped_column(JSON, default=list)
    triggers: Mapped[list] = mapped_column(JSON, default=list)
    note: Mapped[str] = mapped_column(Text, default="")
    source: Mapped[str] = mapped_column(String(20), default="manual")  # manual | solace
    sentiment: Mapped[float | None] = mapped_column(Float, nullable=True)  # -1 .. 1
    logged_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
