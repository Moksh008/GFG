"""Doctor-ready reports: generation, blockchain anchoring and public verification."""
from __future__ import annotations

import re
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.blockchain.registry import registry
from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.entities import IssuedReport, User
from app.services.patient_context import snapshot
from app.services.report_anchor import new_report_id, register_report
from app.services.daily_report import build_daily_report
from app.services.report_generator import build_summary, render_daily_pdf, render_pdf
from app.utils.timefmt import aware, today_utc

router = APIRouter(prefix="/reports", tags=["reports"])

_HEX64 = re.compile(r"^(0x)?[0-9a-fA-F]{64}$")


def verify_url(report_id: str) -> str:
    return f"{settings.public_app_url.rstrip('/')}/verify/{report_id}"


def _iso(dt: datetime | None) -> str | None:
    return aware(dt).isoformat() if dt else None


def issued_out(r: IssuedReport) -> dict:
    return {
        "id": r.id,
        "sha256": r.sha256,
        "sizeBytes": r.size_bytes,
        "issuedAt": _iso(r.created_at),
        "verifyUrl": verify_url(r.id),
        "chain": {
            "status": r.chain_status,
            "mode": r.chain_mode,
            "chainId": r.chain_id,
            "contract": r.contract_address,
            "txHash": r.tx_hash,
            "txUrl": registry.tx_url(r.tx_hash),
            "blockNumber": r.block_number,
            "anchoredAt": _iso(r.anchored_at),
            "error": r.error if r.chain_status == "failed" else None,
        },
    }


def _patient_initials(db: Session, user_id: int) -> str | None:
    user = db.get(User, user_id)
    parts = (user.full_name or "").split() if user else []
    return ". ".join(p[0].upper() for p in parts[:2]) + "." if parts else None


def _verification(db: Session, rec: IssuedReport | None, sha256: str) -> dict:
    """Combine the Dermora record (if any) with a live on-chain lookup into one verdict."""
    onchain = registry.verify(sha256)
    if onchain and onchain["anchored"]:
        verdict = "verified" if onchain["issuerTrusted"] else "issuer_revoked"
    elif rec is not None:
        verdict = "registered"  # Dermora issued it, but it isn't (yet) confirmed on-chain
    else:
        verdict = "not_found"
    return {
        "verdict": verdict,
        "sha256": sha256,
        "report": None if rec is None else {
            "id": rec.id,
            "issuedAt": _iso(rec.created_at),
            "issuedTo": _patient_initials(db, rec.user_id),
            "anchorStatus": rec.chain_status,
            "txHash": rec.tx_hash,
            "txUrl": registry.tx_url(rec.tx_hash),
            "blockNumber": rec.block_number,
        },
        "onChain": None if onchain is None else {
            **onchain,
            "anchoredAt": datetime.fromtimestamp(onchain["timestamp"], timezone.utc).isoformat() if onchain["anchored"] else None,
        },
        "registry": registry.status(),
        "checkedAt": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/summary", summary="Doctor-ready report data (JSON)")
def summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_summary(db, snapshot(db, user))


@router.get("/pdf", summary="Doctor-ready clinical PDF, fingerprinted and anchored on-chain", response_class=Response)
def pdf(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    report_id = new_report_id()
    data = render_pdf(build_summary(db, snapshot(db, user)), report_id=report_id, verify_url=verify_url(report_id))
    rec = register_report(db, user.id, report_id, data)
    fname = f"dermora-report-{datetime.now(timezone.utc):%Y%m%d}-{report_id[:8]}.pdf"
    return Response(
        data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="{fname}"',
            "X-Report-Id": rec.id,
            "X-Report-Sha256": rec.sha256,
        },
    )


def _report_day(day: str | None) -> date:
    if not day:
        return today_utc()
    try:
        return date.fromisoformat(day)
    except ValueError:
        raise HTTPException(status_code=422, detail="date must be YYYY-MM-DD")


@router.get("/daily", summary="End-of-day report for the doctor (JSON)")
def daily(day: str | None = Query(None, alias="date", description="YYYY-MM-DD (UTC); defaults to today"),
          user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_daily_report(db, user, _report_day(day))


@router.get("/daily/pdf", summary="End-of-day doctor report as a fingerprinted PDF", response_class=Response)
def daily_pdf(day: str | None = Query(None, alias="date"),
              user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = _report_day(day)
    report_id = new_report_id()
    data = render_daily_pdf(build_daily_report(db, user, d), report_id=report_id, verify_url=verify_url(report_id))
    rec = register_report(db, user.id, report_id, data)
    return Response(
        data,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f'attachment; filename="dermora-daily-{d.isoformat()}-{report_id[:8]}.pdf"',
            "X-Report-Id": rec.id,
            "X-Report-Sha256": rec.sha256,
        },
    )


@router.get("/issued", summary="Reports issued to the current user, with on-chain status")
def issued(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = db.scalars(
        select(IssuedReport).where(IssuedReport.user_id == user.id).order_by(IssuedReport.created_at.desc()).limit(50)
    )
    return {"reports": [issued_out(r) for r in rows], "registry": registry.status()}


# ------------------------------------------------------------------ public (no auth)
@router.get("/verify", summary="PUBLIC: verify a report by its SHA-256 fingerprint")
def verify_by_hash(hash: str = Query(..., description="SHA-256 of the PDF, hex"), db: Session = Depends(get_db)):
    if not _HEX64.match(hash):
        raise HTTPException(status_code=422, detail="hash must be a 64-character hex SHA-256 digest")
    sha = hash.lower().removeprefix("0x")
    rec = db.scalars(select(IssuedReport).where(IssuedReport.sha256 == sha)).first()
    return _verification(db, rec, sha)


@router.get("/verify/{report_id}", summary="PUBLIC: look up a report by the ID printed on it")
def verify_by_id(report_id: str, db: Session = Depends(get_db)):
    rec = db.get(IssuedReport, report_id)
    if rec is None:
        raise HTTPException(status_code=404, detail="No report with this ID was issued by Dermora")
    return _verification(db, rec, rec.sha256)
