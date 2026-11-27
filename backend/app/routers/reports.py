from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities import User
from app.services.patient_context import snapshot
from app.services.report_generator import build_summary, render_pdf

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/summary", summary="Doctor-ready report data (JSON)")
def summary(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return build_summary(db, snapshot(db, user))


@router.get("/pdf", summary="Doctor-ready clinical PDF", response_class=Response)
def pdf(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    data = render_pdf(build_summary(db, snapshot(db, user)))
    fname = f"dermora-report-{datetime.now(timezone.utc):%Y%m%d}.pdf"
    return Response(data, media_type="application/pdf", headers={"Content-Disposition": f'attachment; filename="{fname}"'})
