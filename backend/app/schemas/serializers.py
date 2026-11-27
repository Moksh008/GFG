"""Entity -> JSON shapes consumed by the React dashboard (mirrors src/data/mockData.js)."""
from __future__ import annotations

from datetime import datetime

from app.entities import (
    Appointment, CareStep, ChatMessage, Doctor, ImprovementRecord, Medicine, MoodLog, SkinDiagnosis, User,
    VoiceMessage, VoiceSession,
)
from app.services import skin_knowledge
from app.services.lesion_analysis import symmetry_label
from app.services.scheduling import clinic_times, parse_slot
from app.utils.timefmt import aware, display_date, relative_time


def image_url(storage_path: str, base_url: str) -> str:
    if storage_path.startswith(("http://", "https://")):
        return storage_path
    return f"{base_url.rstrip('/')}/uploads/{storage_path}"


def user_out(u: User) -> dict:
    return {
        "id": u.id,
        "email": u.email,
        "fullName": u.full_name,
        "dateOfBirth": u.date_of_birth,
        "skinType": u.skin_type,
        "primaryCondition": u.primary_condition,
        "medicalHistory": u.medical_history,
        "knownTriggers": u.known_triggers or [],
        "latitude": u.latitude,
        "longitude": u.longitude,
        "notificationsEnabled": u.notifications_enabled,
        "dataSharingConsent": u.data_sharing_consent,
        "createdAt": aware(u.created_at).isoformat(),
    }


def scan_out(d: SkinDiagnosis, base_url: str, improvement: ImprovementRecord | None = None) -> dict:
    info = skin_knowledge.info(d.predicted_label)
    out = {
        "id": d.id,
        "date": display_date(d.created_at),
        "relativeTime": relative_time(d.created_at),
        "createdAt": aware(d.created_at).isoformat(),
        "bodyArea": d.body_area,
        "imageUrl": image_url(d.image.storage_path, base_url) if d.image else None,
        "aiResult": d.ai_result,
        "aiSummary": d.ai_summary,
        "severityScore": d.severity_score,
        "status": d.status,
        "rednessIndex": d.redness_index,
        "areaCm2": d.area_cm2,
        "borderRegularity": f"{d.border_regularity}% Regular",
        "borderRegularityScore": d.border_regularity,
        "symmetry": symmetry_label(d.symmetry),
        "symmetryScore": d.symmetry,
        "notes": d.notes,
        "condition": d.predicted_label,
        "conditionDisplay": info["display"],
        "confidence": d.confidence,
        "probabilities": d.probabilities,
        "modelVersion": d.model_version,
        "quality": d.image.quality if d.image else None,
        "questionnaire": d.questionnaire,
        "questionnaireAnswers": d.questionnaire_answers,
        "consultation": d.consultation,
    }
    if improvement is not None:
        out["improvement"] = improvement_out(improvement)
    return out


def improvement_out(r: ImprovementRecord) -> dict:
    return {
        "id": r.id,
        "baselineScanId": r.baseline_diagnosis_id,
        "currentScanId": r.current_diagnosis_id,
        "bodyArea": r.body_area,
        "daysBetween": r.days_between,
        "severityDelta": r.severity_delta,
        "rednessDelta": r.redness_delta,
        "areaDeltaCm2": r.area_delta_cm2,
        "improvementPct": r.improvement_pct,
        "trend": r.trend,
        "analysis": r.analysis,
        "details": r.details,
        "createdAt": aware(r.created_at).isoformat(),
    }


def mood_out(m: MoodLog) -> dict:
    return {
        "id": m.id,
        "moodScore": m.mood_score,
        "stressLevel": m.stress_level,
        "anxietyLevel": m.anxiety_level,
        "sleepHours": m.sleep_hours,
        "itchLevel": m.itch_level,
        "emotions": m.emotions or [],
        "triggers": m.triggers or [],
        "note": m.note,
        "source": m.source,
        "sentiment": m.sentiment,
        "loggedAt": aware(m.logged_at).isoformat(),
        "relativeTime": relative_time(m.logged_at),
    }


def medicine_out(m: Medicine, taken_today: int) -> dict:
    return {
        "id": m.id,
        "name": m.name,
        "dosage": m.dosage,
        "timing": m.timing,
        "frequency": m.frequency,
        "takenToday": taken_today >= m.doses_per_day,
        "totalDoses": m.doses_per_day,
        "takenDoses": taken_today,
        "area": m.area,
        "refillDate": m.refill_date,
        "active": m.active,
    }


def care_step_out(s: CareStep) -> dict:
    return {
        "id": s.id,
        "category": s.category,
        "title": s.title,
        "dateRange": s.date_range,
        "status": s.status,
        "bullets": s.bullets or [],
        "completed": s.completed,
    }


def doctor_out(d: Doctor, slots: list[str] | None = None) -> dict:
    """``slots`` are concrete open booking slots (see services.scheduling)."""
    slots = slots or []
    return {
        "id": d.id,
        "name": d.name,
        "title": d.title,
        "specialty": d.specialty,
        "department": d.department,
        "contact": d.contact,
        "email": d.email,
        "rating": d.rating,
        "reviews": d.reviews,
        "status": d.status,
        "avatar": d.avatar,
        "clinicTimes": clinic_times(d),
        "slots": slots,
        "nextAvailable": slots[0] if slots else None,
    }


def appointment_out(a: Appointment) -> dict:
    starts = parse_slot(a.slot)
    return {
        "id": a.id,
        "doctorId": a.doctor_id,
        "doctor": a.doctor_name,
        "date": a.slot,
        # Local wall-clock ISO start time when the slot is a structured booking (else None).
        "startsAt": a.slot if starts else None,
        "upcoming": a.status == "confirmed" and (starts is None or starts >= datetime.now()),
        "department": a.department,
        "type": a.type,
        "reportAttached": a.report_attached,
        "status": a.status,
        "notes": a.notes,
        "createdAt": aware(a.created_at).isoformat(),
    }


def chat_out(c: ChatMessage) -> dict:
    return {"id": c.id, "sender": c.role, "text": c.text, "createdAt": aware(c.created_at).isoformat()}


def voice_message_out(m: VoiceMessage, base_url: str) -> dict:
    return {
        "id": m.id,
        "role": m.role,
        "text": m.text,
        "audioUrl": f"{base_url.rstrip('/')}/voice/audio/{m.audio_path}" if m.audio_path else None,
        "createdAt": aware(m.created_at).isoformat(),
    }


def voice_session_out(s: VoiceSession, base_url: str, include_messages: bool = True) -> dict:
    out = {
        "id": s.id,
        "status": s.status,
        "promptProfile": s.prompt_profile,
        "preMoodScore": s.pre_mood_score,
        "postMoodScore": s.post_mood_score,
        "moodChange": (s.post_mood_score - s.pre_mood_score) if s.post_mood_score is not None and s.pre_mood_score is not None else None,
        "sentiment": s.sentiment,
        "summary": s.summary,
        "insights": s.insights or [],
        "riskFlag": s.risk_flag,
        "startedAt": aware(s.started_at).isoformat(),
        "endedAt": aware(s.ended_at).isoformat() if s.ended_at else None,
    }
    if include_messages:
        out["messages"] = [voice_message_out(m, base_url) for m in s.messages]
    return out
