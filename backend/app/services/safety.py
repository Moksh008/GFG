"""Crisis-language detection and support resources for Solace / Aria.

This is a safety net, not a diagnosis: when risk language appears, the agent is
instructed to respond with care and the API attaches helpline information.
"""
from __future__ import annotations

import re

_RISK_PATTERNS = [
    r"\bkill(ing)? my ?self\b", r"\bsuicid", r"\bend (it|my life|things)\b", r"\bwant to die\b",
    r"\bwish i (was|were) dead\b", r"\bno reason to live\b", r"\bbetter off without me\b",
    r"\bself[- ]?harm", r"\bhurt(ing)? my ?self\b", r"\bcut(ting)? my ?self\b", r"\bcan'?t go on\b",
    r"\bdon'?t want to (live|be here)\b", r"\boverdose\b",
]
_RISK_RE = re.compile("|".join(_RISK_PATTERNS), re.IGNORECASE)

CRISIS_RESOURCES = {
    "message": (
        "It sounds like you're going through something really painful. You don't have to face it alone — "
        "please reach out to someone right now. If you're in immediate danger, call your local emergency number."
    ),
    "helplines": [
        {"region": "International", "name": "Find a Helpline", "contact": "https://findahelpline.com"},
        {"region": "India", "name": "Tele-MANAS (24x7)", "contact": "14416 or 1-800-891-4416"},
        {"region": "India", "name": "KIRAN Mental Health Helpline", "contact": "1800-599-0019"},
        {"region": "US", "name": "988 Suicide & Crisis Lifeline", "contact": "Call or text 988"},
        {"region": "UK & ROI", "name": "Samaritans", "contact": "116 123"},
    ],
}

SAFETY_SYSTEM_RULES = (
    "Safety rules (always follow): You are not a doctor or licensed therapist and must not diagnose or prescribe. "
    "If the user mentions self-harm, suicide, or being in danger, respond with warmth, take it seriously, "
    "encourage them to contact a local emergency number or crisis line (e.g. Tele-MANAS 14416 in India, 988 in the US, "
    "Samaritans 116 123 in the UK) or a trusted person right now, and stay supportive. "
    "Encourage seeing a dermatologist for worsening, infected, bleeding or rapidly changing skin."
)


def detect_risk(text: str) -> bool:
    return bool(text and _RISK_RE.search(text))
