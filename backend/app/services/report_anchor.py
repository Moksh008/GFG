"""Issue fingerprinted reports and anchor them on-chain in the background."""
from __future__ import annotations

import hashlib
import logging
import threading
import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.blockchain.registry import registry
from app.core.database import SessionLocal
from app.entities import IssuedReport

log = logging.getLogger("dermora.reports")

MAX_ATTEMPTS = 5


def new_report_id() -> str:
    return str(uuid.uuid4())


def register_report(db: Session, user_id: int, report_id: str, pdf: bytes) -> IssuedReport:
    """Store the fingerprint and queue on-chain anchoring. Returns the (committed) record."""
    registry.connect()
    rec = IssuedReport(
        id=report_id,
        user_id=user_id,
        sha256=hashlib.sha256(pdf).hexdigest(),
        size_bytes=len(pdf),
        chain_mode=registry.mode,
        chain_status="pending" if registry.enabled else "off",
    )
    db.add(rec)
    db.commit()
    if registry.enabled:
        anchor_async(rec.id)
    return rec


def anchor_async(report_id: str) -> None:
    threading.Thread(target=_anchor_job, args=(report_id,), daemon=True, name=f"anchor-{report_id[:8]}").start()


def _anchor_job(report_id: str) -> None:
    db = SessionLocal()
    try:
        rec = db.get(IssuedReport, report_id)
        if rec is None or rec.chain_status == "anchored":
            return
        rec.attempts += 1
        db.commit()
        try:
            receipt = registry.anchor(rec.sha256)
            rec.chain_status = "anchored"
            rec.chain_mode = registry.mode
            rec.chain_id = registry.chain_id
            rec.contract_address = registry.status()["contract"]
            if not receipt.already_anchored:
                rec.tx_hash = receipt.tx_hash
                rec.block_number = receipt.block_number
            rec.anchored_at = datetime.now(timezone.utc)
            rec.error = None
            log.info("Report %s anchored in tx %s", report_id, receipt.tx_hash or "(already anchored)")
        except Exception as exc:
            rec.chain_status = "failed"
            rec.error = f"{type(exc).__name__}: {exc}"[:500]
            log.warning("Anchoring report %s failed (attempt %s): %s", report_id, rec.attempts, rec.error)
        db.commit()
    finally:
        db.close()


def retry_unanchored() -> int:
    """Queue reports that aren't on the current chain yet.

    Covers: API restarted mid-anchor, earlier failures, reports issued while the chain was
    off, and — in "local" mode, whose dev chain resets on every restart — re-anchoring
    everything previously anchored locally so verification keeps working in development.
    """
    registry.connect()
    if not registry.enabled:
        return 0
    retryable = (
        IssuedReport.chain_status.in_(("pending", "failed")) & (IssuedReport.attempts < MAX_ATTEMPTS)
    ) | (IssuedReport.chain_status == "off") | (IssuedReport.chain_mode != registry.mode)
    if registry.mode == "local":
        retryable = retryable | (IssuedReport.chain_mode == "local")
    with SessionLocal() as db:
        stale = list(db.scalars(select(IssuedReport).where(retryable)))
        for rec in stale:
            if rec.chain_mode != registry.mode or rec.chain_status in ("off", "anchored"):
                rec.chain_mode = registry.mode
                rec.chain_status = "pending"
                rec.attempts = 0
                rec.tx_hash = rec.block_number = rec.anchored_at = None
        db.commit()
        ids = [r.id for r in stale]
    for rid in ids:
        anchor_async(rid)
    return len(ids)
