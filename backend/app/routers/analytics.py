from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.entities import SkinDiagnosis, User, VoiceSession
from app.services import skin_knowledge
from app.services.mood_inference_service import correlations
from app.services.patient_context import snapshot
from app.services.report_generator import build_insights

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/dashboard", summary="Aggregated dashboard metrics")
def dashboard(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    snap = snapshot(db, user)
    latest = snap["latest"]
    scans = snap["scans"]
    prev = next((s for s in scans[1:] if latest and s.body_area == latest.body_area), None)
    mp = snap["mood_patterns"]
    sessions = db.scalar(select(func.count()).select_from(VoiceSession).where(VoiceSession.user_id == user.id))
    return {
        "scansCount": len(scans),
        "medsTakenToday": snap["meds_taken_today"],
        "medsTotal": len(snap["meds"]),
        "adherence7d": snap["adherence_7d"],
        "upcomingAppointments": len(snap["appointments"]),
        "openCareSteps": len(snap["care_steps"]),
        "solaceSessions": sessions,
        "latestScan": None if not latest else {
            "id": latest.id,
            "condition": latest.predicted_label,
            "conditionDisplay": skin_knowledge.info(latest.predicted_label)["short"],
            "severityScore": latest.severity_score,
            "status": latest.status,
            "bodyArea": latest.body_area,
            "severityChange": (latest.severity_score - prev.severity_score) if prev else None,
        },
        "skinHealthScore": None if not latest else 100 - latest.severity_score,
        "mood": {
            "average": mp["averageMood"], "averageStress": mp["averageStress"], "trend": mp["trend"],
            "streakDays": mp["streakDays"], "latest": snap["moods"][0].mood_score if snap["moods"] else None,
        },
    }


@router.get("/correlations", summary="Mood/stress/sleep vs skin severity correlation")
def get_correlations(
    window_days: int = Query(7, ge=1, le=30, alias="windowDays"),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return correlations(db, user.id, window_days)


@router.get("/insights", summary="Personalised health insights")
def insights(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    snap = snapshot(db, user)
    return build_insights(snap, correlations(db, user.id))


@router.get("/trend", summary="Skin health trend series for charts")
def trend(user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    scans = list(db.scalars(
        select(SkinDiagnosis).where(SkinDiagnosis.user_id == user.id).order_by(SkinDiagnosis.created_at)
    ))
    return [
        {"scanId": s.id, "date": s.created_at.date().isoformat(), "severity": s.severity_score,
         "skinHealth": 100 - s.severity_score, "redness": s.redness_index, "bodyArea": s.body_area}
        for s in scans
    ]
