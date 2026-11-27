"""Skin disease detection, history, questionnaire and progress tracking."""
from __future__ import annotations

import io
import logging

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile
from PIL import Image, UnidentifiedImageError
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user
from app.entities import ImprovementRecord, SkinDiagnosis, SkinImage, User
from app.models.inference import ModelUnavailable, classifier
from app.schemas.requests import QuestionnaireIn
from app.schemas.serializers import improvement_out, scan_out
from app.services import improvement_analyzer, skin_knowledge
from app.services.azure_vision import assess_quality
from app.services.gemini import gemini
from app.services.lesion_analysis import analyze_lesion, compute_severity, severity_band
from app.utils.storage import IMAGE_TYPES, delete_image, save_image

log = logging.getLogger("dermora.skin")
router = APIRouter(prefix="/skin", tags=["skin"])

try:  # optional HEIC support for iPhone photos
    from pillow_heif import register_heif_opener

    register_heif_opener()
except ImportError:
    pass


def _get_owned(db: Session, user: User, diagnosis_id: int) -> SkinDiagnosis:
    d = db.get(SkinDiagnosis, diagnosis_id)
    if not d or d.user_id != user.id:
        raise HTTPException(status_code=404, detail="Diagnosis not found")
    return d


def _ai_result(label: str, severity: int, confidence: float) -> str:
    if label == "normal":
        return "No active lesion pattern detected"
    return f"{skin_knowledge.info(label)['short']} pattern — {severity_band(severity).capitalize()} activity"


class _Summary(BaseModel):
    summary: str = Field(description="2-3 sentence patient-friendly explanation of the scan result")


def _summary(label: str, conf: float, severity: int, metrics, body_area: str, notes: str, quality: dict) -> str:
    info = skin_knowledge.info(label)
    ai = gemini.generate_json(
        "You are a dermatology assistant explaining an AI skin-scan result to a patient. Do not diagnose; describe "
        "the observed pattern, what the measurements suggest, and one practical next step.\n"
        f"Predicted pattern: {info['display']} (confidence {conf:.0%}). Severity {severity}/100. "
        f"Redness index {metrics.redness_index}%. Estimated area {metrics.area_cm2} cm². Border regularity "
        f"{metrics.border_regularity}%. Symmetry {metrics.symmetry}%. Body area: {body_area}. Patient notes: {notes or 'none'}. "
        f"Photo quality warnings: {', '.join(quality['warnings']) or 'none'}.",
        _Summary,
    )
    if ai:
        return ai["summary"]
    if label == "normal":
        return f"{info['description']} {info['care'][0]}"
    conf_txt = "high" if conf >= 0.85 else "moderate" if conf >= 0.6 else "low"
    return (
        f"The scan shows a pattern consistent with {info['short'].lower()} ({conf_txt} model confidence) with "
        f"{severity_band(severity)} activity. {info['care'][0]} {info['see_doctor']}"
    )


@router.post("/detect", summary="Upload a skin photo for AI classification and lesion analysis")
async def detect(
    request: Request,
    image: UploadFile = File(...),
    body_area: str = Form("Unspecified", alias="bodyArea", max_length=120),
    notes: str = Form("", max_length=2000),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if image.content_type not in IMAGE_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported image type {image.content_type}; use JPEG, PNG or WebP")
    data = await image.read()
    if len(data) > settings.max_upload_mb * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Image exceeds {settings.max_upload_mb} MB")
    try:
        pil = Image.open(io.BytesIO(data))
        pil.load()
    except (UnidentifiedImageError, OSError):
        raise HTTPException(status_code=400, detail="Could not read image file")

    # The CPU/GPU-bound work runs in a worker thread so the event loop stays responsive.
    from starlette.concurrency import run_in_threadpool

    return await run_in_threadpool(
        _process_scan, request, db, user, pil, data, image.content_type, body_area.strip() or "Unspecified", notes.strip()
    )


def _process_scan(request, db, user, pil, data, content_type, body_area, notes):
    quality = assess_quality(pil)
    try:
        pred = classifier.predict(pil)
    except ModelUnavailable as exc:
        raise HTTPException(status_code=503, detail=f"Skin model unavailable: {exc}")
    metrics = analyze_lesion(pil, pred.label)
    severity = compute_severity(pred.probabilities, pred.label, metrics)

    prev = improvement_analyzer.previous_scan(db, user.id, body_area)
    status = improvement_analyzer.status_from_delta(
        severity - prev.severity_score if prev else None, severity
    )

    rel, sha = save_image(user.id, data, content_type)
    img = SkinImage(
        user_id=user.id, storage_path=rel, content_type=content_type, sha256=sha,
        width=pil.width, height=pil.height, quality={**quality, "lesion": metrics.as_dict()},
    )
    db.add(img)
    db.flush()
    diag = SkinDiagnosis(
        user_id=user.id, image_id=img.id, body_area=body_area, notes=notes,
        predicted_label=pred.label, confidence=pred.confidence, probabilities=pred.probabilities,
        model_version=pred.model_version, severity_score=severity, redness_index=metrics.redness_index,
        area_cm2=metrics.area_cm2, border_regularity=metrics.border_regularity, symmetry=metrics.symmetry,
        status=status, ai_result=_ai_result(pred.label, severity, pred.confidence),
        ai_summary=_summary(pred.label, pred.confidence, severity, metrics, body_area, notes, quality),
        questionnaire=skin_knowledge.questionnaire(pred.label),
    )
    db.add(diag)
    db.flush()
    diag.image = img
    improvement = improvement_analyzer.compare(db, prev, diag) if prev else None
    if user.primary_condition is None and pred.label != "normal":
        user.primary_condition = skin_knowledge.info(pred.label)["short"]
    db.commit()

    out = scan_out(diag, str(request.base_url), improvement)
    out["latencyMs"] = pred.latency_ms
    out["conditionInfo"] = skin_knowledge.info(pred.label)
    out["lesionMetrics"] = metrics.as_dict()
    return out


@router.get("/history")
def history(
    request: Request,
    body_area: str | None = Query(None, alias="bodyArea"),
    limit: int = Query(50, ge=1, le=200),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    stmt = (
        select(SkinDiagnosis).where(SkinDiagnosis.user_id == user.id)
        .order_by(SkinDiagnosis.created_at.desc(), SkinDiagnosis.id.desc())
    )
    scans = list(db.scalars(stmt))
    if body_area:
        target = " ".join(body_area.lower().split())
        scans = [s for s in scans if " ".join(s.body_area.lower().split()) == target]
    return [scan_out(s, str(request.base_url)) for s in scans[:limit]]


@router.get("/diagnosis/{diagnosis_id}")
def get_diagnosis(diagnosis_id: int, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = _get_owned(db, user, diagnosis_id)
    impr = db.scalars(
        select(ImprovementRecord).where(ImprovementRecord.current_diagnosis_id == d.id)
        .order_by(ImprovementRecord.id.desc())
    ).first()
    out = scan_out(d, str(request.base_url), impr)
    out["conditionInfo"] = skin_knowledge.info(d.predicted_label)
    return out


@router.delete("/diagnosis/{diagnosis_id}", status_code=204)
def delete_diagnosis(diagnosis_id: int, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    d = _get_owned(db, user, diagnosis_id)
    for r in db.scalars(select(ImprovementRecord).where(
        (ImprovementRecord.current_diagnosis_id == d.id) | (ImprovementRecord.baseline_diagnosis_id == d.id)
    )):
        db.delete(r)
    image = d.image
    db.delete(d)
    if image:
        delete_image(image.storage_path)
        db.delete(image)
    db.commit()


class _Consultation(BaseModel):
    assessment: str = Field(description="2-4 sentence personalised assessment based on scan + answers")
    recommendations: list[str] = Field(description="3-5 concrete self-care recommendations")
    urgency: str = Field(description="One of: routine, soon, urgent")
    see_dermatologist: bool
    mental_health_note: str = Field(description="One supportive sentence on the stress-skin link, suggest Solace if stress is high")


@router.post("/diagnosis/{diagnosis_id}/questionnaire", summary="Submit post-scan questionnaire for a personalised consultation")
def submit_questionnaire(
    diagnosis_id: int, body: QuestionnaireIn, request: Request,
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    d = _get_owned(db, user, diagnosis_id)
    valid_ids = {q["id"] for q in d.questionnaire}
    answers = {k: v for k, v in body.answers.items() if k in valid_ids}
    if not answers:
        raise HTTPException(status_code=422, detail=f"No recognised answers; expected keys: {sorted(valid_ids)}")
    info = skin_knowledge.info(d.predicted_label)
    qa = "\n".join(f"- {q['question']} -> {answers.get(q['id'], 'not answered')}" for q in d.questionnaire)
    consult = gemini.generate_json(
        "Act as a careful dermatology triage assistant (not a doctor). Using the AI scan and the patient's answers, "
        "write a personalised consultation. Urgency 'urgent' only for signs of infection, rapid spread, systemic "
        "symptoms or crisis; 'soon' for joint symptoms, spreading or poor response to care.\n"
        f"Scan: {info['display']} ({d.confidence:.0%}), severity {d.severity_score}/100, redness {d.redness_index}%, "
        f"area≈{d.area_cm2}cm², body area {d.body_area}. Notes: {d.notes or 'none'}\nAnswers:\n{qa}",
        _Consultation,
    )
    if consult:
        if consult["urgency"] not in ("routine", "soon", "urgent"):
            consult["urgency"] = "routine"
        consult["aiPowered"] = True
    else:
        consult = _rule_consultation(d, answers, info)
    d.questionnaire_answers = answers
    d.consultation = consult
    db.commit()
    return scan_out(d, str(request.base_url))


def _rule_consultation(d: SkinDiagnosis, a: dict, info: dict) -> dict:
    urgency = "routine"
    recs = list(info["care"][:3])
    if a.get("oozing") is True:
        urgency = "soon"
        recs.insert(0, "Oozing or crusting can signal infection — have it checked by a clinician soon.")
    if a.get("joint_pain") is True:
        urgency = "soon"
        recs.insert(0, "Joint pain with psoriasis should be assessed for psoriatic arthritis.")
    if a.get("spreading") is True:
        urgency = "soon"
        recs.insert(0, "Spreading patches respond best to early treatment — book a dermatologist review.")
    if d.severity_score >= 70:
        urgency = "soon" if urgency == "routine" else urgency
    stress = a.get("stress")
    try:
        stress = int(stress) if stress is not None else None
    except (TypeError, ValueError):
        stress = None
    mh = (
        "Your stress is high right now, and stress can intensify flares — a short session with Solace may help."
        if stress is not None and stress >= 7
        else "Managing stress and sleep supports your skin barrier; keep logging your mood to spot patterns."
    )
    return {
        "assessment": (
            f"Your scan suggests {info['short'].lower()} with severity {d.severity_score}/100. "
            + (f"Itch is rated {a['itch']}/10. " if "itch" in a else "")
            + ("Some answers suggest it should be looked at by a clinician. " if urgency != "routine" else "")
        ).strip(),
        "recommendations": recs[:5],
        "urgency": urgency,
        "see_dermatologist": urgency != "routine",
        "mental_health_note": mh,
        "aiPowered": False,
    }


@router.get("/progress", summary="Severity timeline and improvement records for a body area")
def progress(
    body_area: str | None = Query(None, alias="bodyArea"),
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    scans = list(db.scalars(select(SkinDiagnosis).where(SkinDiagnosis.user_id == user.id).order_by(SkinDiagnosis.created_at)))
    if body_area:
        target = " ".join(body_area.lower().split())
        scans = [s for s in scans if " ".join(s.body_area.lower().split()) == target]
    ids = {s.id for s in scans}
    records = [r for r in db.scalars(
        select(ImprovementRecord).where(ImprovementRecord.user_id == user.id).order_by(ImprovementRecord.created_at)
    ) if r.current_diagnosis_id in ids]
    overall = None
    if len(scans) >= 2:
        first, last = scans[0], scans[-1]
        overall = {
            "fromScanId": first.id, "toScanId": last.id,
            "severityChange": last.severity_score - first.severity_score,
            "improvementPct": round((first.severity_score - last.severity_score) / first.severity_score * 100, 1)
            if first.severity_score else 0.0,
        }
    return {
        "bodyArea": body_area,
        "series": [
            {"scanId": s.id, "date": s.created_at.date().isoformat(), "severity": s.severity_score,
             "redness": s.redness_index, "areaCm2": s.area_cm2, "condition": s.predicted_label}
            for s in scans
        ],
        "improvements": [improvement_out(r) for r in records],
        "overall": overall,
        "bodyAreas": sorted({s.body_area for s in db.scalars(select(SkinDiagnosis).where(SkinDiagnosis.user_id == user.id))}),
    }


@router.get("/compare", summary="Compare two scans (defaults to the two most recent of the same area)")
def compare(
    request: Request,
    baseline_id: int | None = Query(None, alias="baselineId"),
    current_id: int | None = Query(None, alias="currentId"),
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    if current_id is None:
        current = db.scalars(
            select(SkinDiagnosis).where(SkinDiagnosis.user_id == user.id)
            .order_by(SkinDiagnosis.created_at.desc(), SkinDiagnosis.id.desc())
        ).first()
        if not current:
            raise HTTPException(status_code=404, detail="No scans yet")
    else:
        current = _get_owned(db, user, current_id)
    if baseline_id is None:
        baseline = improvement_analyzer.previous_scan(db, user.id, current.body_area, before_id=current.id)
        if not baseline:
            raise HTTPException(status_code=404, detail="No earlier scan of this body area to compare against")
    else:
        baseline = _get_owned(db, user, baseline_id)
    if baseline.id == current.id:
        raise HTTPException(status_code=422, detail="Choose two different scans")

    existing = db.scalars(select(ImprovementRecord).where(
        ImprovementRecord.baseline_diagnosis_id == baseline.id, ImprovementRecord.current_diagnosis_id == current.id
    )).first()
    rec = existing or improvement_analyzer.compare(db, baseline, current)
    db.commit()
    base = str(request.base_url)
    return {"baseline": scan_out(baseline, base), "current": scan_out(current, base), "improvement": improvement_out(rec)}


@router.get("/conditions", summary="Condition reference information")
def conditions():
    return {k: {**v, "questionnaire": skin_knowledge.questionnaire(k)} for k, v in skin_knowledge.CONDITIONS.items()}
