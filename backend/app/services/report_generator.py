"""Multi-source report synthesis (JSON + doctor-ready PDF)."""
from __future__ import annotations

from datetime import datetime, timezone

from fpdf import FPDF
from pydantic import BaseModel, Field

from app.services import skin_knowledge
from app.services.gemini import gemini
from app.services.mood_inference_service import correlations
from app.services.patient_context import describe
from app.utils.timefmt import display_date


class _Insights(BaseModel):
    summary: str = Field(description="3-4 sentence clinical-style overview for the patient's dermatologist")
    insights: list[str] = Field(description="3-5 personalised, actionable insights for the patient")


def build_insights(snap: dict, corr: dict) -> dict:
    ai = gemini.generate_json(
        "Create a concise progress overview and personalised insights for this dermatology patient, linking skin "
        "status, treatment adherence, mood/stress patterns and correlations. Do not diagnose; recommend clinician "
        "review where appropriate.\n\n" + describe(snap) + "\nCorrelation findings: " + "; ".join(corr["findings"]),
        _Insights,
    )
    if ai:
        return {**ai, "aiPowered": True}
    return {**_rule_insights(snap, corr), "aiPowered": False}


def _rule_insights(snap: dict, corr: dict) -> dict:
    latest, impr, mp = snap["latest"], snap["latest_improvement"], snap["mood_patterns"]
    insights: list[str] = []
    if impr is not None:
        insights.append(impr.analysis)
    if snap["adherence_7d"] is not None:
        a = snap["adherence_7d"]
        insights.append(
            f"Medication adherence is {a}% this week — "
            + ("excellent, keep it up." if a >= 85 else "try linking doses to a daily habit like brushing teeth.")
        )
    if mp["count"]:
        if mp["averageStress"] and mp["averageStress"] >= 6:
            insights.append("Stress has been elevated; short daily relaxation or a Solace session may reduce flare risk.")
        if mp["trend"] == "declining":
            insights.append("Your mood has been trending down — consider talking it through with Solace or someone you trust.")
        elif mp["trend"] == "improving":
            insights.append("Your mood is trending upward — whatever you're doing is helping.")
    insights.extend(f for f in corr["findings"] if "unlock" not in f)
    if latest:
        insights.append(skin_knowledge.info(latest.predicted_label)["care"][0])
    if not insights:
        insights.append("Start by running a skin scan and logging your mood to receive personalised insights.")

    if latest:
        summary = (
            f"Most recent scan ({display_date(latest.created_at)}) of {latest.body_area} shows a "
            f"{skin_knowledge.info(latest.predicted_label)['short'].lower()} pattern with severity {latest.severity_score}/100 "
            f"({latest.status}). {len(snap['scans'])} scans on record."
        )
    else:
        summary = "No scans on record yet."
    return {"summary": summary, "insights": insights[:5]}


def build_summary(db, snap: dict) -> dict:
    corr = correlations(db, snap["user"].id)
    ins = build_insights(snap, corr)
    u = snap["user"]
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "patient": {"name": u.full_name, "email": u.email, "primaryCondition": u.primary_condition, "skinType": u.skin_type},
        "overview": ins["summary"],
        "insights": ins["insights"],
        "aiPowered": ins["aiPowered"],
        "scans": [
            {"date": display_date(s.created_at), "bodyArea": s.body_area, "condition": skin_knowledge.info(s.predicted_label)["short"],
             "confidence": s.confidence, "severityScore": s.severity_score, "rednessIndex": s.redness_index,
             "areaCm2": s.area_cm2, "status": s.status, "notes": s.notes}
            for s in snap["scans"][:10]
        ],
        "medications": [
            {"name": m.name, "dosage": m.dosage, "frequency": m.frequency, "timing": m.timing, "area": m.area}
            for m in snap["meds"]
        ],
        "adherence7d": snap["adherence_7d"],
        "mood": {k: v for k, v in snap["mood_patterns"].items() if k != "series"},
        "correlations": corr,
        "appointments": [{"doctor": a.doctor_name, "date": a.slot, "type": a.type} for a in snap["appointments"]],
        "disclaimer": "AI-assisted observations for tracking purposes only; not a medical diagnosis.",
    }


# ------------------------------------------------------------------ PDF
_TEAL = (15, 59, 63)
_MUTED = (110, 125, 130)


def _latin1(text: str) -> str:
    """Core PDF fonts are Latin-1 only; swap common Unicode punctuation."""
    repl = {"—": "-", "–": "-", "’": "'", "‘": "'", "“": '"', "”": '"', "≈": "~", "²": "2", "•": "-", "…": "...", "→": "->"}
    for k, v in repl.items():
        text = text.replace(k, v)
    return text.encode("latin-1", "replace").decode("latin-1")


class _PDF(FPDF):
    def header(self):
        self.set_fill_color(*_TEAL)
        self.rect(0, 0, 210, 22, "F")
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 15)
        self.set_xy(12, 6)
        self.cell(0, 10, "Dermora.ai - Clinical Progress Report")
        self.set_text_color(0, 0, 0)
        self.ln(20)

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*_MUTED)
        self.cell(0, 8, _latin1("AI-assisted observations for tracking only - not a medical diagnosis.  Page ") + str(self.page_no()), align="C")

    def section(self, title: str):
        self.ln(3)
        self.set_font("Helvetica", "B", 12)
        self.set_text_color(*_TEAL)
        self.cell(0, 8, _latin1(title), new_x="LMARGIN", new_y="NEXT")
        self.set_draw_color(*_TEAL)
        self.line(self.l_margin, self.get_y(), 210 - self.r_margin, self.get_y())
        self.ln(2)
        self.set_text_color(0, 0, 0)

    def para(self, text: str, size: int = 10):
        self.set_font("Helvetica", "", size)
        self.multi_cell(0, 5, _latin1(text), new_x="LMARGIN", new_y="NEXT")


def render_pdf(summary: dict) -> bytes:
    pdf = _PDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    p = summary["patient"]
    pdf.para(f"Patient: {p['name'] or '-'}    Email: {p['email']}    Condition: {p['primaryCondition'] or '-'}    Skin type: {p['skinType'] or '-'}")
    pdf.para(f"Generated: {summary['generatedAt'][:16].replace('T', ' ')} UTC", size=9)

    pdf.section("Overview")
    pdf.para(summary["overview"])

    pdf.section("Key insights")
    for i in summary["insights"]:
        pdf.para(f"- {i}")

    pdf.section("Scan history")
    if summary["scans"]:
        cols = [("Date", 26), ("Body area", 46), ("Pattern", 28), ("Sev.", 14), ("Red.", 14), ("Area", 18), ("Status", 40)]
        pdf.set_font("Helvetica", "B", 9)
        pdf.set_fill_color(230, 240, 240)
        for name, w in cols:
            pdf.cell(w, 7, name, border=1, fill=True)
        pdf.ln()
        pdf.set_font("Helvetica", "", 8.5)
        for s in summary["scans"]:
            row = [s["date"], s["bodyArea"][:28], s["condition"], str(s["severityScore"]), f"{s['rednessIndex']}%",
                   f"{s['areaCm2']} cm2", s["status"]]
            for (_, w), val in zip(cols, row):
                pdf.cell(w, 6.5, _latin1(val), border=1)
            pdf.ln()
    else:
        pdf.para("No scans recorded.")

    pdf.section("Medications")
    if summary["medications"]:
        for m in summary["medications"]:
            pdf.para(f"- {m['name']} - {m['dosage']}, {m['frequency']} ({m['timing']}) - {m['area']}")
        if summary["adherence7d"] is not None:
            pdf.para(f"7-day adherence: {summary['adherence7d']}%")
    else:
        pdf.para("No medications recorded.")

    pdf.section("Mood & stress")
    mood = summary["mood"]
    if mood.get("count"):
        pdf.para(
            f"{mood['count']} entries. Average mood {mood['averageMood']}/10, average stress {mood['averageStress']}/10, "
            f"trend: {mood['trend']}. Frequent emotions: {', '.join(mood['topEmotions']) or '-'}. "
            f"Reported triggers: {', '.join(mood['topTriggers']) or '-'}."
        )
    else:
        pdf.para("No mood entries recorded.")
    for f in summary["correlations"]["findings"]:
        pdf.para(f"- {f}")

    if summary["appointments"]:
        pdf.section("Upcoming appointments")
        for a in summary["appointments"]:
            pdf.para(f"- {a['doctor']} - {a['date']} ({a['type']})")

    return bytes(pdf.output())
