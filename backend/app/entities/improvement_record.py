from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.entities._base import utcnow


class ImprovementRecord(Base):
    __tablename__ = "improvement_records"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    baseline_diagnosis_id: Mapped[int] = mapped_column(ForeignKey("skin_diagnoses.id", ondelete="CASCADE"))
    current_diagnosis_id: Mapped[int] = mapped_column(ForeignKey("skin_diagnoses.id", ondelete="CASCADE"))
    body_area: Mapped[str] = mapped_column(String(120))
    days_between: Mapped[float] = mapped_column(Float)
    severity_delta: Mapped[int] = mapped_column(Integer)
    redness_delta: Mapped[int] = mapped_column(Integer)
    area_delta_cm2: Mapped[float] = mapped_column(Float)
    improvement_pct: Mapped[float] = mapped_column(Float)
    trend: Mapped[str] = mapped_column(String(30))  # improving | stable | worsening
    analysis: Mapped[str] = mapped_column(Text, default="")
    details: Mapped[dict] = mapped_column(JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow)
