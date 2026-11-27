"""Context-aware system prompt for the Solace voice agent."""
from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.entities import MoodLog, SkinDiagnosis, User, VoiceSession
from app.services import skin_knowledge
from app.services.safety import SAFETY_SYSTEM_RULES

BASE_PERSONA = (
    "You are Solace, a warm, calm and empathetic wellbeing companion inside the Dermora app, supporting people "
    "living with chronic skin conditions (eczema, psoriasis, vitiligo). You use evidence-based techniques from "
    "CBT, mindfulness and habit-reversal training for scratching. This is a spoken conversation: keep replies "
    "short (1-3 sentences), natural and conversational, ask one gentle question at a time, reflect feelings back, "
    "and never lecture. Do not use markdown, lists or emojis."
)

PROFILES = {
    "crisis-aware": (
        "The user's recent mood has been very low. Prioritise emotional safety: listen, validate, gently check in "
        "about their safety, and encourage connecting with trusted people or professional support."
    ),
    "stress-relief": (
        "The user has reported high stress recently. Help them name what's weighing on them, then offer a brief "
        "grounding or breathing exercise (for example box breathing) and explore how stress shows up in their skin."
    ),
    "flare-support": (
        "The user's skin is currently flaring or worsening. Acknowledge how frustrating and visible flares can feel, "
        "address itch-scratch cycles and self-image worries, and reinforce their care routine without blame."
    ),
    "maintenance": (
        "The user is doing reasonably well. Celebrate progress, reinforce healthy habits (sleep, routine, stress care) "
        "and help them plan for situations that usually trigger flares."
    ),
    "supportive": "Get to know how the user is feeling today and how their skin has been affecting them.",
}

GREETINGS = {
    "crisis-aware": "Hi, I'm really glad you're here. I've noticed things may have felt heavy lately. How are you doing right now?",
    "stress-relief": "Hi, it's Solace. It seems like stress has been high recently. What's been on your mind today?",
    "flare-support": "Hi, it's Solace. I can see your skin has been giving you a hard time lately. How are you feeling about it?",
    "maintenance": "Hi, it's Solace. It's good to talk again — it looks like things have been steadier. How's your day going?",
    "supportive": "Hi, I'm Solace. I'm here to listen. How are you feeling today, in your mind and in your skin?",
}


def build_context(db: Session, user: User) -> dict:
    moods = list(db.scalars(
        select(MoodLog).where(MoodLog.user_id == user.id).order_by(MoodLog.logged_at.desc()).limit(7)
    ))
    scans = list(db.scalars(
        select(SkinDiagnosis).where(SkinDiagnosis.user_id == user.id).order_by(SkinDiagnosis.created_at.desc()).limit(2)
    ))
    last_session = db.scalars(
        select(VoiceSession).where(VoiceSession.user_id == user.id, VoiceSession.status == "ended")
        .order_by(VoiceSession.started_at.desc()).limit(1)
    ).first()
    avg_mood = sum(m.mood_score for m in moods) / len(moods) if moods else None
    avg_stress = sum(m.stress_level for m in moods) / len(moods) if moods else None
    return {"moods": moods, "scans": scans, "avg_mood": avg_mood, "avg_stress": avg_stress, "last_session": last_session}


def select_profile(ctx: dict) -> str:
    avg_mood, avg_stress, scans = ctx["avg_mood"], ctx["avg_stress"], ctx["scans"]
    if avg_mood is not None and avg_mood <= 3:
        return "crisis-aware"
    if ctx["last_session"] is not None and ctx["last_session"].risk_flag:
        return "crisis-aware"
    if scans and scans[0].status in ("Worsening", "Elevated Risk", "Mild Flare"):
        return "flare-support"
    if avg_stress is not None and avg_stress >= 7:
        return "stress-relief"
    if avg_mood is not None and avg_mood >= 7:
        return "maintenance"
    return "supportive"


def build_system_prompt(db: Session, user: User) -> tuple[str, str, str, int | None]:
    """Return (profile, system_prompt, greeting, pre_mood_score)."""
    ctx = build_context(db, user)
    profile = select_profile(ctx)
    lines = [BASE_PERSONA, PROFILES[profile], SAFETY_SYSTEM_RULES, "", "What you know about the user (use naturally, don't recite):"]
    name = (user.full_name or "").split(" ")[0]
    if name:
        lines.append(f"- First name: {name}")
    if user.primary_condition:
        lines.append(f"- Lives with: {user.primary_condition}")
    if ctx["scans"]:
        s = ctx["scans"][0]
        lines.append(
            f"- Latest skin scan: {skin_knowledge.info(s.predicted_label)['short']} on {s.body_area}, "
            f"severity {s.severity_score}/100, status {s.status}."
        )
    if ctx["avg_mood"] is not None:
        lines.append(f"- Average mood over recent logs: {ctx['avg_mood']:.1f}/10; stress {ctx['avg_stress']:.1f}/10.")
        emotions = {e for m in ctx["moods"] for e in (m.emotions or [])}
        if emotions:
            lines.append(f"- Recently reported emotions: {', '.join(sorted(emotions)[:6])}.")
    if ctx["last_session"] is not None and ctx["last_session"].summary:
        lines.append(f"- Last Solace session summary: {ctx['last_session'].summary}")
    greeting = GREETINGS[profile]
    if name:
        greeting = greeting.replace("Hi,", f"Hi {name},", 1)
    pre_mood = ctx["moods"][0].mood_score if ctx["moods"] else None
    return profile, "\n".join(lines), greeting, pre_mood
