"""Aria — the text-based skin assistant on the dashboard."""
from __future__ import annotations

from app.services import skin_knowledge
from app.services.gemini import gemini
from app.services.patient_context import describe
from app.services.safety import CRISIS_RESOURCES, SAFETY_SYSTEM_RULES, detect_risk

ARIA_SYSTEM = (
    "You are Aria, the personal AI skin assistant in the Dermora app, which connects dermatology and mental "
    "wellbeing for people with eczema, psoriasis and vitiligo. Answer using the patient's data below when relevant. "
    "Be concise (2-4 sentences), warm and practical; explain medical terms simply; never claim to diagnose and "
    "recommend a dermatologist for anything worsening, infected, bleeding or rapidly changing. "
    "If the user asks to export a report, tell them to tap 'Export PDF'. If they seem emotionally distressed, "
    "suggest a voice session with Solace, Dermora's wellbeing companion.\n" + SAFETY_SYSTEM_RULES
)


def greeting(snap: dict) -> str:
    name = (snap["user"].full_name or "").split(" ")[0] or "there"
    latest, impr = snap["latest"], snap["latest_improvement"]
    if latest is None:
        return f"Hi {name}! I'm Aria. Run your first skin scan and I'll help you track how it changes."
    if impr is not None and impr.current_diagnosis_id == latest.id and impr.trend == "improving":
        return (f"Hi {name}. Your {latest.body_area} scan shows a {abs(impr.improvement_pct):.0f}% improvement in severity. "
                "Want to compare lesion changes or export your clinical PDF?")
    return (f"Hi {name}. Your latest {latest.body_area} scan scored {latest.severity_score}/100 ({latest.status}). "
            "Ask me anything about your skin or treatment.")


def reply(message: str, snap: dict, history: list[dict]) -> dict:
    risk = detect_risk(message)
    system = ARIA_SYSTEM + "\n\nPatient data:\n" + describe(snap)
    text = gemini.generate_text(message, system=system, history=history[-12:], temperature=0.6, max_tokens=400)
    if not text:
        text = _fallback(message, snap)
    if risk:
        text = CRISIS_RESOURCES["message"] + " " + text if not gemini.available else text
    return {"text": text, "risk": risk, "resources": CRISIS_RESOURCES if risk else None, "aiPowered": gemini.available}


def _fallback(message: str, snap: dict) -> str:
    q = message.lower()
    latest = snap["latest"]
    cond = skin_knowledge.info(latest.predicted_label) if latest else None
    impr = snap["latest_improvement"]

    if detect_risk(message):
        return "Please consider talking to Solace or someone you trust right now — you deserve support."
    if any(w in q for w in ("pdf", "report", "export", "doctor summary")):
        return "Tap “Export PDF” above to download a doctor-ready summary of your scans, medications and progress."
    if any(w in q for w in ("itch", "itchy", "scratch")):
        tip = "Itch usually settles as the skin barrier rebuilds. Apply your moisturiser or prescribed ointment, use a cool compress, and keep nails short."
        if snap["mood_patterns"]["averageStress"] and snap["mood_patterns"]["averageStress"] >= 6:
            tip += " Your recent stress levels are high, which can amplify itch — a short breathing exercise may help."
        return tip
    if any(w in q for w in ("improv", "better", "progress", "recover", "healing")):
        if impr is not None:
            return impr.analysis
        if latest:
            return f"Your latest scan scored {latest.severity_score}/100. Re-scan the same area in a few days and I'll measure the change."
        return "Run a skin scan and I'll start tracking your progress."
    if any(w in q for w in ("medic", "meds", "dose", "cream", "ointment", "pill", "tablet", "prescription")):
        if not snap["meds"]:
            return "You haven't added any medications yet — add them from the adherence card to get reminders."
        pending = [m.name for m in snap["meds"] if snap["doses_today"].get(m.id, 0) < m.doses_per_day]
        if pending:
            return f"Still to take today: {', '.join(pending)}. Your 7-day adherence is {snap['adherence_7d']}%."
        return f"You've taken all your medications today — great job. 7-day adherence: {snap['adherence_7d']}%."
    if any(w in q for w in ("stress", "anxious", "sad", "mood", "feel")):
        return "Stress and skin are closely linked. Logging your mood helps me spot your triggers — and Solace is available for a voice session any time you want to talk."
    if any(w in q for w in ("sun", "uv", "weather", "humid")):
        return "Check the environment panel for today's UV and humidity — low humidity dries the skin barrier and high UV can burn treated or depigmented skin."
    if cond:
        return f"{cond['description']} {cond['care'][0]}"
    return "I can help with your scans, medications, triggers and progress. Try asking “Is my skin improving?”"
