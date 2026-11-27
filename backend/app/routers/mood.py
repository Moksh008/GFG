from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities import MoodLog, User
from app.schemas.requests import MoodIn
from app.schemas.serializers import mood_out
from app.services.mood_inference_service import lexicon_sentiment, mood_patterns
from app.services.safety import CRISIS_RESOURCES, detect_risk

router = APIRouter(prefix="/mood", tags=["mood"])


@router.post("/log", status_code=201)
def log_mood(body: MoodIn, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = MoodLog(
        user_id=user.id,
        mood_score=body.mood_score,
        stress_level=body.stress_level,
        anxiety_level=body.anxiety_level,
        sleep_hours=body.sleep_hours,
        itch_level=body.itch_level,
        emotions=[e.strip().lower() for e in body.emotions if e.strip()],
        triggers=[t.strip().lower() for t in body.triggers if t.strip()],
        note=body.note.strip(),
        sentiment=round(lexicon_sentiment(body.note), 3) if body.note.strip() else None,
    )
    db.add(entry)
    db.commit()
    out = mood_out(entry)
    if detect_risk(body.note) or body.mood_score <= 2:
        out["support"] = CRISIS_RESOURCES
    return out


@router.get("/history")
def history(
    days: int = Query(30, ge=1, le=365),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    logs = db.scalars(
        select(MoodLog).where(MoodLog.user_id == user.id, MoodLog.logged_at >= since).order_by(MoodLog.logged_at.desc())
    )
    return [mood_out(m) for m in logs]


@router.get("/patterns")
def patterns(
    days: int = Query(30, ge=1, le=365),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    since = datetime.now(timezone.utc) - timedelta(days=days)
    logs = list(db.scalars(select(MoodLog).where(MoodLog.user_id == user.id, MoodLog.logged_at >= since)))
    return {"days": days, **mood_patterns(logs)}


@router.delete("/log/{log_id}", status_code=204)
def delete_log(log_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    entry = db.get(MoodLog, log_id)
    if not entry or entry.user_id != user.id:
        raise HTTPException(status_code=404, detail="Mood entry not found")
    db.delete(entry)
    db.commit()
