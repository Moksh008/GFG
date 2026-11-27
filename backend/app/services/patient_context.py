"""Aggregates a patient's current state; shared by Aria, reports and the dashboard."""
from __future__ import annotations

from datetime import timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.entities import Appointment, CareStep, DoseLog, ImprovementRecord, Medicine, MoodLog, SkinDiagnosis, User
from app.services import skin_knowledge
from app.services.mood_inference_service import mood_patterns
from app.utils.timefmt import today_utc


def doses_today(db: Session, med_ids: list[int]) -> dict[int, int]:
    if not med_ids:
        return {}
    rows = db.scalars(select(DoseLog).where(DoseLog.medicine_id.in_(med_ids), DoseLog.day == today_utc()))
    return {r.medicine_id: r.doses_taken for r in rows}


def adherence(db: Session, meds: list[Medicine], days: int = 7) -> float | None:
    """Percentage of scheduled doses taken over the last ``days`` days (including today)."""
    if not meds:
        return None
    start = today_utc() - timedelta(days=days - 1)
    logs = db.scalars(select(DoseLog).where(DoseLog.medicine_id.in_([m.id for m in meds]), DoseLog.day >= start))
    taken = sum(min(l.doses_taken, next(m.doses_per_day for m in meds if m.id == l.medicine_id)) for l in logs)
    expected = sum(m.doses_per_day for m in meds) * days
    return round(100 * taken / expected, 1) if expected else None


def snapshot(db: Session, user: User) -> dict:
    scans = list(db.scalars(
        select(SkinDiagnosis).where(SkinDiagnosis.user_id == user.id)
        .order_by(SkinDiagnosis.created_at.desc(), SkinDiagnosis.id.desc())
    ))
    meds = list(db.scalars(select(Medicine).where(Medicine.user_id == user.id, Medicine.active.is_(True))))
    today = doses_today(db, [m.id for m in meds])
    moods = list(db.scalars(
        select(MoodLog).where(MoodLog.user_id == user.id).order_by(MoodLog.logged_at.desc()).limit(30)
    ))
    steps = list(db.scalars(select(CareStep).where(CareStep.user_id == user.id, CareStep.completed.is_(False))))
    apts = list(db.scalars(
        select(Appointment).where(Appointment.user_id == user.id, Appointment.status == "confirmed")
    ))
    latest_impr = db.scalars(
        select(ImprovementRecord).where(ImprovementRecord.user_id == user.id)
        .order_by(ImprovementRecord.created_at.desc()).limit(1)
    ).first()
    return {
        "user": user,
        "scans": scans,
        "latest": scans[0] if scans else None,
        "meds": meds,
        "doses_today": today,
        "meds_taken_today": sum(1 for m in meds if today.get(m.id, 0) >= m.doses_per_day),
        "adherence_7d": adherence(db, meds),
        "moods": moods,
        "mood_patterns": mood_patterns(moods),
        "care_steps": steps,
        "appointments": apts,
        "latest_improvement": latest_impr,
    }


def describe(snap: dict) -> str:
    """Compact plain-text context for LLM prompts."""
    u = snap["user"]
    lines = [f"Patient: {u.full_name or 'the user'}"]
    if u.primary_condition:
        lines.append(f"Primary condition: {u.primary_condition}")
    for s in snap["scans"][:3]:
        lines.append(
            f"Scan {s.created_at:%Y-%m-%d} — {s.body_area}: {skin_knowledge.info(s.predicted_label)['short']} "
            f"({s.confidence:.0%} conf), severity {s.severity_score}/100, redness {s.redness_index}%, "
            f"area≈{s.area_cm2}cm², status {s.status}. Notes: {s.notes or '-'}"
        )
    if snap["latest_improvement"] is not None:
        lines.append(f"Latest progress analysis: {snap['latest_improvement'].analysis}")
    for m in snap["meds"]:
        taken = snap["doses_today"].get(m.id, 0)
        lines.append(f"Medication: {m.name}, {m.dosage}, {m.frequency} ({m.timing}) for {m.area} — today {taken}/{m.doses_per_day}")
    if snap["adherence_7d"] is not None:
        lines.append(f"7-day medication adherence: {snap['adherence_7d']}%")
    mp = snap["mood_patterns"]
    if mp["count"]:
        lines.append(
            f"Mood: avg {mp['averageMood']}/10, stress avg {mp['averageStress']}/10, trend {mp['trend']}, "
            f"frequent emotions {', '.join(mp['topEmotions']) or '-'}, triggers {', '.join(mp['topTriggers']) or '-'}"
        )
    for a in snap["appointments"][:2]:
        lines.append(f"Upcoming appointment: {a.doctor_name}, {a.slot} ({a.type})")
    return "\n".join(lines)
