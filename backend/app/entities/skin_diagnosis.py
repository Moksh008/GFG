from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.entities._base import utcnow


class SkinDiagnosis(Base):
    __tablename__ = "skin_diagnoses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    image_id: Mapped[int] = mapped_column(ForeignKey("skin_images.id", ondelete="CASCADE"))
    body_area: Mapped[str] = mapped_column(String(120), default="Unspecified")
    notes: Mapped[str] = mapped_column(Text, default="")

    # Model output
    predicted_label: Mapped[str] = mapped_column(String(60))
    confidence: Mapped[float] = mapped_column(Float)
    probabilities: Mapped[dict] = mapped_column(JSON, default=dict)
    model_version: Mapped[str] = mapped_column(String(120), default="")

    # Image-derived lesion metrics
    severity_score: Mapped[int] = mapped_column(Integer)
    redness_index: Mapped[int] = mapped_column(Integer)
    area_cm2: Mapped[float] = mapped_column(Float)
    border_regularity: Mapped[int] = mapped_column(Integer)  # 0-100
    symmetry: Mapped[int] = mapped_column(Integer)  # 0-100
    status: Mapped[str] = mapped_column(String(40), default="Baseline")
    ai_result: Mapped[str] = mapped_column(String(255), default="")
    ai_summary: Mapped[str] = mapped_column(Text, default="")

    # Post-diagnosis contextual questionnaire
    questionnaire: Mapped[list] = mapped_column(JSON, default=list)
    questionnaire_answers: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    consultation: Mapped[dict | None] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)

    image = relationship("SkinImage", back_populates="diagnosis", lazy="joined")
