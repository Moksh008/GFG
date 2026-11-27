"""Sentiment scoring, mood pattern statistics and mood↔skin correlation."""
from __future__ import annotations

import math
import re
from collections import Counter, defaultdict
from datetime import datetime, timedelta, timezone

from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.entities import MoodLog, SkinDiagnosis
from app.services.gemini import gemini
from app.utils.timefmt import aware

# Compact affect lexicon (valence -1..1) used when Gemini isn't configured.
_LEXICON = {
    "happy": 0.8, "calm": 0.6, "relaxed": 0.7, "good": 0.5, "great": 0.8, "better": 0.5, "hopeful": 0.6,
    "grateful": 0.7, "proud": 0.6, "confident": 0.6, "peaceful": 0.7, "content": 0.5, "okay": 0.1, "fine": 0.1,
    "excited": 0.6, "loved": 0.8, "rested": 0.5, "improving": 0.5, "relief": 0.6, "relieved": 0.6,
    "sad": -0.6, "stressed": -0.6, "stress": -0.5, "anxious": -0.6, "anxiety": -0.6, "worried": -0.5,
    "angry": -0.6, "frustrated": -0.5, "tired": -0.3, "exhausted": -0.6, "lonely": -0.6, "embarrassed": -0.5,
    "ashamed": -0.7, "itchy": -0.3, "itch": -0.3, "pain": -0.5, "painful": -0.5, "hopeless": -0.9,
    "depressed": -0.8, "overwhelmed": -0.7, "scared": -0.6, "afraid": -0.6, "ugly": -0.6, "hate": -0.7,
    "awful": -0.7, "terrible": -0.7, "bad": -0.5, "worse": -0.5, "insecure": -0.5, "cry": -0.5, "crying": -0.6,
    "can't sleep": -0.5, "nervous": -0.5, "irritated": -0.4, "burning": -0.4, "flare": -0.4,
}
_NEGATORS = {"not", "no", "never", "don't", "dont", "isn't", "wasn't", "hardly"}


def lexicon_sentiment(text: str) -> float:
    if not text:
        return 0.0
    tokens = re.findall(r"[a-z']+", text.lower())
    total, hits = 0.0, 0
    for i, tok in enumerate(tokens):
        if tok in _LEXICON:
            v = _LEXICON[tok]
            if any(t in _NEGATORS for t in tokens[max(0, i - 2):i]):
                v = -v * 0.7
            total += v
            hits += 1
    if not hits:
        return 0.0
    return max(-1.0, min(1.0, total / math.sqrt(hits * 2)))


def sentiment_to_mood(sentiment: float) -> int:
    return int(round(min(10, max(1, 5.5 + sentiment * 4.5))))


class ConversationAnalysis(BaseModel):
    sentiment: float = Field(description="Overall emotional valence of the USER from -1 (very negative) to 1 (very positive)")
    mood_score: int = Field(description="Estimated user mood at the end of the conversation, 1-10")
    stress_level: int = Field(description="Estimated user stress level, 1-10")
    emotions: list[str] = Field(description="Up to 4 emotions the user expressed, lowercase single words")
    triggers: list[str] = Field(description="Stressors or skin triggers mentioned, short phrases")
    summary: str = Field(description="2-3 sentence compassionate summary of the session written to the user")
    insights: list[str] = Field(description="2-4 short actionable insights linking mood and skin health")


def analyze_conversation(transcript: list[dict]) -> dict:
    user_text = " ".join(t["text"] for t in transcript if t["role"] == "user")
    convo = "\n".join(f"{t['role'].upper()}: {t['text']}" for t in transcript)
    if transcript:
        ai = gemini.generate_json(
            "Analyse this supportive conversation between a user living with a chronic skin condition and the "
            "Solace wellbeing agent. Focus on the user's emotional state.\n\n" + convo,
            ConversationAnalysis,
        )
        if ai:
            ai["mood_score"] = min(10, max(1, int(ai["mood_score"])))
            ai["stress_level"] = min(10, max(1, int(ai["stress_level"])))
            ai["sentiment"] = max(-1.0, min(1.0, float(ai["sentiment"])))
            return ai

    s = lexicon_sentiment(user_text)
    found = [w for w in _LEXICON if w in user_text.lower() and _LEXICON[w] != 0]
    neg = [w for w in found if _LEXICON[w] < 0]
    stress = int(round(min(10, max(1, 5 - s * 4))))
    insights = []
    if any(w in user_text.lower() for w in ("sleep", "tired", "exhausted")):
        insights.append("Sleep came up — poor sleep raises inflammation; a consistent wind-down routine may help your skin.")
    if any(w in user_text.lower() for w in ("stress", "stressed", "work", "exam", "deadline")):
        insights.append("Stress was a theme — try a 5-minute breathing exercise when you notice the urge to scratch.")
    if any(w in user_text.lower() for w in ("itch", "itchy", "scratch")):
        insights.append("Itch was mentioned — cool compresses and moisturiser can break the itch-scratch cycle.")
    if not insights:
        insights.append("Keep logging your mood daily so Dermora can spot links between how you feel and your skin.")
    return {
        "sentiment": round(s, 3),
        "mood_score": sentiment_to_mood(s),
        "stress_level": stress,
        "emotions": neg[:4] if neg else [w for w in found][:4],
        "triggers": [],
        "summary": (
            "Thank you for sharing today. "
            + ("It sounds like things have felt heavy lately — that's understandable when your skin is flaring. "
               if s < -0.2 else "It sounds like you're managing well — keep building on what's working. ")
            + "Remember that small, consistent steps for both mind and skin add up."
        ),
        "insights": insights,
    }


# ------------------------------------------------------------------ patterns
def mood_patterns(logs: list[MoodLog]) -> dict:
    if not logs:
        return {"count": 0, "averageMood": None, "averageStress": None, "trend": "insufficient-data",
                "byWeekday": {}, "topEmotions": [], "topTriggers": [], "streakDays": 0, "series": []}
    logs = sorted(logs, key=lambda m: aware(m.logged_at))
    moods = [m.mood_score for m in logs]
    stress = [m.stress_level for m in logs]

    by_wd: dict[str, list[int]] = defaultdict(list)
    for m in logs:
        by_wd[aware(m.logged_at).strftime("%a")].append(m.mood_score)

    # Linear trend of mood over time (points per week)
    t0 = aware(logs[0].logged_at)
    xs = [(aware(m.logged_at) - t0).total_seconds() / 86400 for m in logs]
    slope = _slope(xs, moods) * 7 if len(logs) >= 3 else 0.0
    trend = "improving" if slope > 0.3 else "declining" if slope < -0.3 else "steady"
    if len(logs) < 3:
        trend = "insufficient-data"

    days = sorted({aware(m.logged_at).date() for m in logs}, reverse=True)
    streak = 0
    today = datetime.now(timezone.utc).date()
    expected = today if days and days[0] == today else today - timedelta(days=1)
    for d in days:
        if d == expected:
            streak += 1
            expected -= timedelta(days=1)
        elif d < expected:
            break

    series = _daily_series(logs)
    return {
        "count": len(logs),
        "averageMood": round(sum(moods) / len(moods), 2),
        "averageStress": round(sum(stress) / len(stress), 2),
        "trend": trend,
        "slopePerWeek": round(slope, 2),
        "byWeekday": {k: round(sum(v) / len(v), 2) for k, v in by_wd.items()},
        "topEmotions": [e for e, _ in Counter(e for m in logs for e in (m.emotions or [])).most_common(5)],
        "topTriggers": [t for t, _ in Counter(t for m in logs for t in (m.triggers or [])).most_common(5)],
        "streakDays": streak,
        "series": series,
    }


def _daily_series(logs: list[MoodLog]) -> list[dict]:
    buckets: dict = defaultdict(list)
    for m in logs:
        buckets[aware(m.logged_at).date()].append(m)
    out = []
    for d in sorted(buckets):
        ms = buckets[d]
        out.append({
            "date": d.isoformat(),
            "mood": round(sum(m.mood_score for m in ms) / len(ms), 2),
            "stress": round(sum(m.stress_level for m in ms) / len(ms), 2),
        })
    return out


def _slope(xs: list[float], ys: list[float]) -> float:
    n = len(xs)
    mx, my = sum(xs) / n, sum(ys) / n
    den = sum((x - mx) ** 2 for x in xs)
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / den if den else 0.0


def _pearson(xs: list[float], ys: list[float]) -> float | None:
    n = len(xs)
    if n < 3:
        return None
    mx, my = sum(xs) / n, sum(ys) / n
    sx = math.sqrt(sum((x - mx) ** 2 for x in xs))
    sy = math.sqrt(sum((y - my) ** 2 for y in ys))
    if sx == 0 or sy == 0:
        return None
    return sum((x - mx) * (y - my) for x, y in zip(xs, ys)) / (sx * sy)


def _strength(r: float | None) -> str:
    if r is None:
        return "insufficient-data"
    a = abs(r)
    return "strong" if a >= 0.6 else "moderate" if a >= 0.35 else "weak" if a >= 0.15 else "none"


def correlations(db: Session, user_id: int, window_days: int = 7) -> dict:
    """Pair each scan with the average mood/stress logged in the preceding ``window_days``."""
    scans = list(db.scalars(select(SkinDiagnosis).where(SkinDiagnosis.user_id == user_id)))
    moods = list(db.scalars(select(MoodLog).where(MoodLog.user_id == user_id)))
    pairs = []
    for s in sorted(scans, key=lambda s: aware(s.created_at)):
        end = aware(s.created_at)
        start = end - timedelta(days=window_days)
        window = [m for m in moods if start <= aware(m.logged_at) <= end]
        if not window:
            continue
        pairs.append({
            "scanId": s.id,
            "date": end.date().isoformat(),
            "severity": s.severity_score,
            "avgMood": round(sum(m.mood_score for m in window) / len(window), 2),
            "avgStress": round(sum(m.stress_level for m in window) / len(window), 2),
            "avgSleep": _avg([m.sleep_hours for m in window]),
        })
    sev = [p["severity"] for p in pairs]
    r_stress = _pearson([p["avgStress"] for p in pairs], sev)
    r_mood = _pearson([p["avgMood"] for p in pairs], sev)
    sleep_pairs = [(p["avgSleep"], p["severity"]) for p in pairs if p["avgSleep"] is not None]
    r_sleep = _pearson([a for a, _ in sleep_pairs], [b for _, b in sleep_pairs]) if sleep_pairs else None

    findings = []
    if r_stress is not None and r_stress >= 0.35:
        findings.append(f"Higher stress in the week before a scan tends to coincide with more severe skin (r={r_stress:.2f}).")
    if r_mood is not None and r_mood <= -0.35:
        findings.append(f"Lower mood tends to precede worse scans (r={r_mood:.2f}).")
    if r_sleep is not None and r_sleep <= -0.35:
        findings.append(f"Less sleep is associated with higher severity (r={r_sleep:.2f}).")
    if not pairs:
        findings.append("Log your mood regularly and re-scan to unlock mood–skin correlations.")
    elif len(pairs) < 3:
        findings.append("A few more scans with mood logs are needed for reliable correlations.")

    return {
        "windowDays": window_days,
        "pairs": pairs,
        "stressVsSeverity": {"r": _round(r_stress), "strength": _strength(r_stress)},
        "moodVsSeverity": {"r": _round(r_mood), "strength": _strength(r_mood)},
        "sleepVsSeverity": {"r": _round(r_sleep), "strength": _strength(r_sleep)},
        "findings": findings,
    }


def _avg(vals):
    vals = [v for v in vals if v is not None]
    return round(sum(vals) / len(vals), 2) if vals else None


def _round(v):
    return None if v is None else round(v, 3)
