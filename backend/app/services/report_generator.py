"""Multi-source report synthesis (JSON + doctor-ready PDF)."""
from __future__ import annotations

from datetime import datetime, timezone

import qrcode
from fpdf import FPDF
from pydantic import BaseModel, Field

from app.services import skin_knowledge
from app.services.gemini import gemini
from app.services.mood_inference_service import correlations
from app.services.patient_context import describe
from app.services.scheduling import format_slot
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
        "appointments": [{"doctor": a.doctor_name, "date": format_slot(a.slot), "type": a.type} for a in snap["appointments"]],
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
    report_id: str | None = None
    title_text: str = "Dermora.ai - Clinical Progress Report"

    def header(self):
        self.set_fill_color(*_TEAL)
        self.rect(0, 0, 210, 22, "F")
        self.set_text_color(255, 255, 255)
        self.set_font("Helvetica", "B", 15)
        self.set_xy(12, 6)
        self.cell(0, 10, _latin1(self.title_text))
        self.set_text_color(0, 0, 0)
        self.ln(20)

    def footer(self):
        self.set_y(-14)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(*_MUTED)
        ref = f"Report {self.report_id}  |  " if self.report_id else ""
        self.cell(0, 8, _latin1(f"{ref}AI-assisted observations for tracking only - not a medical diagnosis.  Page {self.page_no()}"), align="C")

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


def _verification_block(pdf: _PDF, report_id: str, verify_url: str) -> None:
    """Boxed note with a QR code linking to the public verification page."""
    top = pdf.get_y() + 2
    pdf.set_fill_color(236, 244, 243)
    pdf.set_draw_color(*_TEAL)
    pdf.rect(pdf.l_margin, top, 210 - pdf.l_margin - pdf.r_margin, 30, "DF")
    qr = qrcode.make(verify_url, border=1).get_image()
    pdf.image(qr, x=210 - pdf.r_margin - 28, y=top + 1, w=28, h=28)
    pdf.set_xy(pdf.l_margin + 3, top + 3)
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*_TEAL)
    pdf.cell(0, 5, "Tamper-evident report", new_x="LMARGIN", new_y="NEXT")
    pdf.set_text_color(0, 0, 0)
    pdf.set_font("Helvetica", "", 8.5)
    width = 210 - pdf.l_margin - pdf.r_margin - 36
    for line in (
        f"Report ID: {report_id}",
        "This file's SHA-256 fingerprint is recorded on a public blockchain by Dermora.",
        f"To confirm it is authentic and unaltered, scan the code or open: {verify_url}",
    ):
        pdf.set_x(pdf.l_margin + 3)
        pdf.multi_cell(width, 4.5, _latin1(line), align="L", new_x="LMARGIN", new_y="NEXT")
    pdf.set_y(top + 33)


def render_pdf(summary: dict, report_id: str | None = None, verify_url: str | None = None) -> bytes:
    pdf = _PDF()
    pdf.report_id = report_id
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    p = summary["patient"]
    pdf.para(f"Patient: {p['name'] or '-'}    Email: {p['email']}    Condition: {p['primaryCondition'] or '-'}    Skin type: {p['skinType'] or '-'}")
    pdf.para(f"Generated: {summary['generatedAt'][:16].replace('T', ' ')} UTC", size=9)
    if report_id and verify_url:
        _verification_block(pdf, report_id, verify_url)

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


# ------------------------------------------------------------------ daily doctor report
def _signed(v, digits: int = 0, unit: str = "") -> str:
    if v is None:
        return "-"
    return f"{v:+.{digits}f}{unit}"


def _table(pdf: _PDF, cols: list[tuple[str, int]], rows: list[list]) -> None:
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.set_fill_color(230, 240, 240)
    for name, w in cols:
        pdf.cell(w, 7, _latin1(name), border=1, fill=True)
    pdf.ln()
    pdf.set_font("Helvetica", "", 8.5)
    for row in rows:
        for (_, w), val in zip(cols, row):
            text = _latin1(str(val))
            while len(text) > 3 and pdf.get_string_width(text) > w - 2:
                text = text[:-2] + "."
            pdf.cell(w, 6.5, text, border=1)
        pdf.ln()


def render_daily_pdf(r: dict, report_id: str | None = None, verify_url: str | None = None) -> bytes:
    pdf = _PDF()
    pdf.report_id = report_id
    pdf.title_text = f"Dermora.ai - Daily Report for Doctor ({r['date']})"
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.add_page()
    p = r["patient"]
    pdf.para(f"Patient: {p['name'] or '-'}    DOB: {p['dateOfBirth'] or '-'}    Condition: {p['primaryCondition'] or '-'}"
             f"    Skin type: {p['skinType'] or '-'}")
    pdf.para(f"Report date: {r['date']}    Generated: {r['generatedAt'][:16].replace('T', ' ')} UTC", size=9)
    if report_id and verify_url:
        _verification_block(pdf, report_id, verify_url)

    pdf.section("Summary")
    pdf.para(r["summary"])
    if r["flags"]:
        pdf.set_text_color(160, 80, 0)
        for f in r["flags"]:
            pdf.para(f"(!) {f}")
        pdf.set_text_color(0, 0, 0)

    pdf.section("Scans recorded today")
    if r["scansToday"]:
        _table(pdf, [("Time", 16), ("Body area", 36), ("Pattern", 26), ("Sev.", 14), ("Red.", 14), ("Area", 22),
                     ("vs prev. sev", 26), ("vs prev. area", 32)],
               [[s["takenAt"][11:16], s["bodyArea"], s["condition"], s["severityScore"], f"{s['rednessIndex']}%",
                 f"{s['areaCm2']} cm2", _signed((s["vsPrevious"] or {}).get("severity")),
                 _signed((s["vsPrevious"] or {}).get("areaCm2"), 1, " cm2")] for s in r["scansToday"]])
    else:
        pdf.para("No scans were taken on this day.")

    pdf.section("Tracked areas (latest vs first scan)")
    if r["areas"]:
        _table(pdf, [("Body area", 36), ("Scans", 14), ("Last scan", 24), ("Severity", 18), ("Area", 22),
                     ("Sev. change", 24), ("Area change", 24), ("Status", 24)],
               [[a["bodyArea"], a["scanCount"], a["latest"]["takenAt"][:10], a["latest"]["severityScore"],
                 f"{a['latest']['areaCm2']} cm2", _signed((a["vsBaseline"] or {}).get("severity")),
                 _signed((a["vsBaseline"] or {}).get("areaPct"), 0, "%"), a["latest"]["status"]] for a in r["areas"]])
    else:
        pdf.para("No body areas tracked yet.")

    pdf.section("Medications today")
    meds = r["medications"]
    if meds["items"]:
        _table(pdf, [("Medication", 50), ("Dosage", 34), ("Schedule", 42), ("Applied to", 36), ("Taken", 24)],
               [[m["name"], m["dosage"], f"{m['frequency']} ({m['timing']})", m["area"] or "-",
                 f"{m['taken']}/{m['expected']}"] for m in meds["items"]])
        pdf.para(f"Doses today: {meds['taken']}/{meds['expected']}"
                 + (f"   7-day adherence: {meds['adherence7d']}%" if meds["adherence7d"] is not None else ""))
    else:
        pdf.para("No active medications.")

    pdf.section("Mood & symptoms today")
    if r["mood"]:
        _table(pdf, [("Time", 16), ("Mood", 16), ("Stress", 16), ("Itch", 16), ("Sleep", 18), ("Emotions / triggers", 104)],
               [[m["loggedAt"][11:16], f"{m['mood']}/10", f"{m['stress']}/10",
                 "-" if m["itch"] is None else f"{m['itch']}/10", "-" if m["sleepHours"] is None else f"{m['sleepHours']}h",
                 ", ".join(m["emotions"] + m["triggers"]) or "-"] for m in r["mood"]])
    else:
        pdf.para("No mood check-in on this day.")

    if r["appointments"]:
        pdf.section("Upcoming appointments")
        for a in r["appointments"]:
            pdf.para(f"- {a['doctor']} ({a['department']}) - {a['when']} - {a['type']}")

    pdf.ln(2)
    pdf.para(r["disclaimer"], size=8)
    return bytes(pdf.output())
