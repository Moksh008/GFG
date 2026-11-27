"""End-of-day report for the treating doctor: what changed today, per tracked area, plus doses and mood."""
from __future__ import annotations

from collections import defaultdict
from datetime import date, datetime, time, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.entities import Appointment, DoseLog, Medicine, MoodLog, SkinDiagnosis, User
from app.services import skin_knowledge
from app.services.patient_context import adherence
from app.services.scheduling import format_slot, parse_slot
from app.utils.timefmt import aware

RESCAN_AFTER_DAYS = 7


def _norm(area: str) -> str:
    return " ".join(area.lower().split())


def _metrics(s: SkinDiagnosis) -> dict:
    return {
        "scanId": s.id,
        "takenAt": aware(s.created_at).isoformat(),
        "condition": skin_knowledge.info(s.predicted_label)["short"],
        "confidence": s.confidence,
        "severityScore": s.severity_score,
        "rednessIndex": s.redness_index,
        "areaCm2": s.area_cm2,
        "borderRegularity": s.border_regularity,
        "symmetry": s.symmetry,
        "status": s.status,
        "notes": s.notes,
        "urgency": (s.consultation or {}).get("urgency"),
    }


def _delta(cur: SkinDiagnosis, ref: SkinDiagnosis | None) -> dict | None:
    if ref is None:
        return None
    return {
        "severity": cur.severity_score - ref.severity_score,
        "redness": cur.redness_index - ref.redness_index,
        "areaCm2": round(cur.area_cm2 - ref.area_cm2, 2),
        "areaPct": round((cur.area_cm2 - ref.area_cm2) / ref.area_cm2 * 100, 1) if ref.area_cm2 else None,
        "days": round((aware(cur.created_at) - aware(ref.created_at)).total_seconds() / 86400, 1),
    }


def build_daily_report(db: Session, user: User, day: date) -> dict:
    start = datetime.combine(day, time.min, tzinfo=timezone.utc)
    end = start + timedelta(days=1)

    # ---- skin: everything up to the end of the report day, grouped by body area
    scans = [s for s in db.scalars(
        select(SkinDiagnosis).where(SkinDiagnosis.user_id == user.id).order_by(SkinDiagnosis.created_at, SkinDiagnosis.id)
    ) if aware(s.created_at) < end]
    by_area: dict[str, list[SkinDiagnosis]] = defaultdict(list)
    for s in scans:
        by_area[_norm(s.body_area)].append(s)

    areas, todays_scans, flags = [], [], []
    for series in by_area.values():
        latest, baseline = series[-1], series[0]
        today_list = [s for s in series if aware(s.created_at) >= start]
        for s in today_list:
            idx = series.index(s)
            todays_scans.append({
                "bodyArea": s.body_area, **_metrics(s),
                "vsPrevious": _delta(s, series[idx - 1] if idx else None),
            })
        days_since = (end - aware(latest.created_at)).days
        vs_base = _delta(latest, baseline) if len(series) > 1 else None
        areas.append({
            "bodyArea": latest.body_area,
            "scanCount": len(series),
            "scannedToday": bool(today_list),
            "firstScanAt": aware(baseline.created_at).isoformat(),
            "daysSinceLastScan": days_since,
            "latest": _metrics(latest),
            "vsPrevious": _delta(latest, series[-2]) if len(series) > 1 else None,
            "vsBaseline": vs_base,
            "timeline": [{"takenAt": aware(s.created_at).isoformat(), "severityScore": s.severity_score,
                          "areaCm2": s.area_cm2, "rednessIndex": s.redness_index} for s in series],
        })
        if vs_base and vs_base["severity"] >= 10:
            flags.append(f"{latest.body_area}: severity up {vs_base['severity']} points since the first scan.")
        if (latest.consultation or {}).get("urgency") in ("soon", "urgent"):
            flags.append(f"{latest.body_area}: last check-in suggested review {latest.consultation['urgency']}.")
        if days_since >= RESCAN_AFTER_DAYS:
            flags.append(f"{latest.body_area}: not re-scanned for {days_since} days.")
    areas.sort(key=lambda a: a["latest"]["takenAt"], reverse=True)

    # ---- medications
    meds = [m for m in db.scalars(select(Medicine).where(Medicine.user_id == user.id, Medicine.active.is_(True))
                                  .order_by(Medicine.id)) if aware(m.created_at).date() <= day]
    logs = {l.medicine_id: l.doses_taken for l in db.scalars(
        select(DoseLog).where(DoseLog.medicine_id.in_([m.id for m in meds]), DoseLog.day == day))} if meds else {}
    med_rows = [{
        "name": m.name, "dosage": m.dosage, "frequency": m.frequency, "timing": m.timing, "area": m.area,
        "taken": min(logs.get(m.id, 0), m.doses_per_day), "expected": m.doses_per_day,
    } for m in meds]
    expected = sum(r["expected"] for r in med_rows)
    taken = sum(r["taken"] for r in med_rows)
    missed = [r["name"] for r in med_rows if r["taken"] < r["expected"]]
    if missed:
        flags.append(f"Doses not completed: {', '.join(missed)}.")

    # ---- mood
    moods = list(db.scalars(select(MoodLog).where(
        MoodLog.user_id == user.id, MoodLog.logged_at >= start, MoodLog.logged_at < end).order_by(MoodLog.logged_at)))
    mood_rows = [{
        "loggedAt": aware(m.logged_at).isoformat(), "mood": m.mood_score, "stress": m.stress_level, "itch": m.itch_level,
        "sleepHours": m.sleep_hours, "emotions": m.emotions or [], "triggers": m.triggers or [], "note": m.note,
    } for m in moods]
    if any(m.stress_level >= 8 for m in moods):
        flags.append("High stress reported today (8+/10).")
    if any((m.itch_level or 0) >= 7 for m in moods):
        flags.append("Strong itch reported today (7+/10).")

    # ---- appointments
    now = datetime.now()
    upcoming = sorted(
        (a for a in db.scalars(select(Appointment).where(Appointment.user_id == user.id, Appointment.status == "confirmed"))
         if (parse_slot(a.slot) or now) >= now),
        key=lambda a: parse_slot(a.slot) or datetime.max,
    )

    # ---- headline
    parts = []
    if todays_scans:
        parts.append(f"{len(todays_scans)} scan{'s' if len(todays_scans) != 1 else ''} recorded today")
    else:
        parts.append("no scans recorded today")
    if expected:
        parts.append(f"{taken}/{expected} medication doses taken")
    if mood_rows:
        avg = sum(m["mood"] for m in mood_rows) / len(mood_rows)
        parts.append(f"average mood {avg:.1f}/10")
    summary = "; ".join(parts).capitalize() + "."
    improving = [a for a in areas if a["vsBaseline"] and a["vsBaseline"]["severity"] <= -10]
    if improving:
        summary += " Improving since first scan: " + ", ".join(
            f"{a['bodyArea']} ({a['vsBaseline']['severity']:+d} severity, {a['vsBaseline']['areaCm2']:+.1f} cm²)"
            for a in improving) + "."

    return {
        "date": day.isoformat(),
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "patient": {"name": user.full_name, "email": user.email, "dateOfBirth": user.date_of_birth,
                    "skinType": user.skin_type, "primaryCondition": user.primary_condition,
                    "knownTriggers": user.known_triggers or []},
        "summary": summary,
        "flags": flags,
        "scansToday": todays_scans,
        "areas": areas,
        "medications": {"items": med_rows, "taken": taken, "expected": expected,
                        "pct": round(100 * taken / expected, 1) if expected else None,
                        "adherence7d": adherence(db, meds)},
        "mood": mood_rows,
        "appointments": [{"doctor": a.doctor_name, "department": a.department, "when": format_slot(a.slot),
                          "startsAt": a.slot if parse_slot(a.slot) else None, "type": a.type} for a in upcoming],
        "disclaimer": "AI-assisted observations for tracking purposes only; not a medical diagnosis.",
    }
