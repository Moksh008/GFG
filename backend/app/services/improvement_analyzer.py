"""Temporal comparison between two scans of the same body area."""
from __future__ import annotations

import logging

from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.entities import ImprovementRecord, SkinDiagnosis
from app.services import skin_knowledge
from app.services.gemini import gemini
from app.utils.timefmt import days_between

log = logging.getLogger("dermora.improvement")


def _norm_area(area: str) -> str:
    return " ".join(area.lower().split())


def previous_scan(db: Session, user_id: int, body_area: str, before_id: int | None = None) -> SkinDiagnosis | None:
    stmt = (
        select(SkinDiagnosis)
        .where(SkinDiagnosis.user_id == user_id)
        .order_by(SkinDiagnosis.created_at.desc(), SkinDiagnosis.id.desc())
    )
    if before_id is not None:
        stmt = stmt.where(SkinDiagnosis.id != before_id)
    target = _norm_area(body_area)
    for d in db.scalars(stmt):
        if _norm_area(d.body_area) == target:
            return d
    return None


def status_from_delta(severity_delta: int | None, severity: int) -> str:
    if severity_delta is None:
        return "Elevated Risk" if severity >= 65 else "Baseline"
    if severity_delta <= -15:
        return "Significant Improvement"
    if severity_delta <= -5:
        return "Improving"
    if severity_delta >= 10:
        return "Worsening"
    if severity_delta >= 5:
        return "Elevated Risk" if severity >= 65 else "Mild Flare"
    return "Stable"


class _Narrative(BaseModel):
    analysis: str


def compare(db: Session, baseline: SkinDiagnosis, current: SkinDiagnosis) -> ImprovementRecord:
    sev_delta = current.severity_score - baseline.severity_score
    red_delta = current.redness_index - baseline.redness_index
    area_delta = round(current.area_cm2 - baseline.area_cm2, 2)
    days = round(days_between(baseline.created_at, current.created_at), 1)
    pct = round(-sev_delta / baseline.severity_score * 100, 1) if baseline.severity_score else 0.0
    trend = "improving" if sev_delta <= -5 else "worsening" if sev_delta >= 5 else "stable"

    analysis = _rule_based_analysis(baseline, current, sev_delta, red_delta, area_delta, days, trend)
    ai = gemini.generate_json(
        "You are a dermatology progress analyst. Write 2-3 plain-language sentences comparing two scans "
        "of the same body area for the patient. Be factual, encouraging where warranted, never diagnose, and "
        "suggest seeing a dermatologist if worsening.\n"
        f"Body area: {current.body_area}\nDays between scans: {days}\n"
        f"Before: condition={baseline.predicted_label}, severity={baseline.severity_score}/100, redness={baseline.redness_index}%, area≈{baseline.area_cm2}cm²\n"
        f"After: condition={current.predicted_label}, severity={current.severity_score}/100, redness={current.redness_index}%, area≈{current.area_cm2}cm²\n"
        f"Patient notes: {current.notes or 'none'}",
        _Narrative,
    )
    if ai and ai.get("analysis"):
        analysis = ai["analysis"]

    rec = ImprovementRecord(
        user_id=current.user_id,
        baseline_diagnosis_id=baseline.id,
        current_diagnosis_id=current.id,
        body_area=current.body_area,
        days_between=days,
        severity_delta=sev_delta,
        redness_delta=red_delta,
        area_delta_cm2=area_delta,
        improvement_pct=pct,
        trend=trend,
        analysis=analysis,
        details={
            "symmetryDelta": current.symmetry - baseline.symmetry,
            "borderDelta": current.border_regularity - baseline.border_regularity,
            "conditionChanged": baseline.predicted_label != current.predicted_label,
        },
    )
    db.add(rec)
    return rec


def _rule_based_analysis(b, c, sev_delta, red_delta, area_delta, days, trend) -> str:
    name = skin_knowledge.info(c.predicted_label)["short"].lower()
    span = f"over {days:g} days" if days >= 1 else "since your last scan"
    if trend == "improving":
        s = f"Your {c.body_area} shows improvement {span}: severity fell {abs(sev_delta)} points"
        if red_delta < 0:
            s += f", redness dropped {abs(red_delta)}%"
        if area_delta < 0:
            s += f" and the affected area contracted by about {abs(area_delta):.1f} cm²"
        return s + ". Keep following your current routine."
    if trend == "worsening":
        return (
            f"Your {c.body_area} looks more active {span} (severity +{sev_delta}). "
            f"Consider recent stress, sleep or environmental triggers, and book a dermatologist review if it keeps worsening."
        )
    return f"Your {c.body_area} {name} pattern is stable {span} (severity change {sev_delta:+d}). Continue your current care plan."
