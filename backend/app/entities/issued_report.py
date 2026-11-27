from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base
from app.entities._base import utcnow


class IssuedReport(Base):
    """A doctor-ready PDF Dermora issued, identified by its SHA-256 fingerprint."""

    __tablename__ = "issued_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)  # uuid4, printed in the PDF
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    sha256: Mapped[str] = mapped_column(String(64), unique=True, index=True)
    size_bytes: Mapped[int] = mapped_column(Integer)
    # Blockchain anchoring: off | pending | anchored | failed
    chain_status: Mapped[str] = mapped_column(String(16), default="pending")
    chain_mode: Mapped[str] = mapped_column(String(16), default="off")
    chain_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    contract_address: Mapped[str | None] = mapped_column(String(42), nullable=True)
    tx_hash: Mapped[str | None] = mapped_column(String(66), nullable=True)
    block_number: Mapped[int | None] = mapped_column(Integer, nullable=True)
    anchored_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    attempts: Mapped[int] = mapped_column(Integer, default=0)
    error: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, index=True)
