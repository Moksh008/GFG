"""Solace — speech-to-speech mental-health companion.

Two ways to talk to Solace:
  1. Turn-based REST: POST /voice/process-audio (audio clip in -> transcript + spoken reply out),
     or POST /voice/session/{id}/message for typed input. Works with any recorder (MediaRecorder webm/ogg, wav, mp3).
  2. Real-time: WebSocket /voice/live — bidirectional PCM streaming through the Gemini Live API.
Ending a session (POST /voice/session/{id}/end) runs sentiment analysis, scores mood and logs it.
"""
from __future__ import annotations

import base64
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, Request, UploadFile, WebSocket
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import SessionLocal, get_db
from app.core.security import decode_token, get_current_user, oauth2_scheme, user_from_token
from app.entities import MoodLog, User, VoiceMessage, VoiceSession
from app.schemas.requests import VoiceTextIn
from app.schemas.serializers import voice_message_out, voice_session_out
from app.services import voice_prompt_selector
from app.services.gemini import gemini
from app.services.mood_inference_service import analyze_conversation
from app.services.safety import CRISIS_RESOURCES, detect_risk
from app.utils.storage import save_audio

log = logging.getLogger("dermora.solace")
router = APIRouter(prefix="/voice", tags=["solace"])

AUDIO_TYPES = {
    "audio/webm", "audio/ogg", "audio/wav", "audio/x-wav", "audio/wave", "audio/mpeg", "audio/mp3", "audio/mp4",
    "audio/aac", "audio/flac", "audio/x-m4a", "audio/m4a",
}
MAX_AUDIO_MB = 15


def _owned_session(db: Session, user: User, session_id: int) -> VoiceSession:
    s = db.get(VoiceSession, session_id)
    if not s or s.user_id != user.id:
        raise HTTPException(status_code=404, detail="Session not found")
    return s


def _history(s: VoiceSession, limit: int = 16) -> list[dict]:
    return [{"role": m.role, "text": m.text} for m in s.messages[-limit:]]


def _speak(db: Session, user: User, msg: VoiceMessage, text: str) -> str | None:
    wav = gemini.text_to_speech(text)
    if not wav:
        return None
    msg.audio_path = save_audio(user.id, wav, ".wav")
    return base64.b64encode(wav).decode()


_FALLBACK_REPLIES = [
    (("itch", "scratch"), "That itch can be exhausting. When the urge comes, try pausing, taking three slow breaths, and pressing a cool cloth on the area instead. What tends to set it off for you?"),
    (("stress", "work", "exam", "pressure", "deadline"), "It sounds like there's a lot of pressure on you right now. Let's try one slow breath together: in for four, hold for four, out for four. What feels heaviest today?"),
    (("sleep", "tired", "exhausted", "insomnia"), "Poor sleep makes everything harder, including your skin. Would it help to talk about what's keeping you up at night?"),
    (("embarrass", "ugly", "look", "stare", "ashamed", "confidence"), "Feeling self-conscious about your skin is really common, and it's completely valid. You are much more than your skin. When do you notice those feelings most?"),
    (("sad", "down", "lonely", "cry", "depress"), "I'm really sorry you're feeling this way. Thank you for telling me. Would you like to share a bit more about what's been bringing you down?"),
    (("better", "good", "great", "happy", "improv"), "That's really good to hear. What do you think has been helping the most lately?"),
]


def _fallback_reply(text: str) -> str:
    t = text.lower()
    for keys, reply in _FALLBACK_REPLIES:
        if any(k in t for k in keys):
            return reply
    return "I'm here and listening. Can you tell me a little more about how that's been feeling for you?"


def _agent_reply(s: VoiceSession, user_text: str) -> str:
    if detect_risk(user_text) and not gemini.available:
        return CRISIS_RESOURCES["message"]
    reply = gemini.generate_text(user_text, system=s.system_prompt, history=_history(s)[:-1], temperature=0.8, max_tokens=300)
    return reply or _fallback_reply(user_text)


# ---------------------------------------------------------------- sessions
@router.post("/start-session", status_code=201)
def start_session(
    request: Request, speak: bool = Query(True), user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    profile, prompt, greeting, pre_mood = voice_prompt_selector.build_system_prompt(db, user)
    s = VoiceSession(user_id=user.id, prompt_profile=profile, system_prompt=prompt, pre_mood_score=pre_mood)
    db.add(s)
    db.flush()
    msg = VoiceMessage(session_id=s.id, role="agent", text=greeting)
    db.add(msg)
    audio = _speak(db, user, msg, greeting) if speak else None
    db.commit()
    db.refresh(s)
    out = voice_session_out(s, str(request.base_url))
    out.update({
        "greeting": greeting,
        "audioBase64": audio,
        "audioMimeType": "audio/wav" if audio else None,
        "capabilities": {
            "speechToText": gemini.available,
            "textToSpeech": gemini.tts_available,
            "realtime": gemini.live_available,
        },
    })
    return out


class _Turn(BaseModel):
    transcript: str = Field(description="Verbatim transcription of what the user said in the audio")
    reply: str = Field(description="Solace's spoken reply to the user, 1-3 sentences, no markdown")


@router.post("/process-audio", summary="Send a recorded audio clip; returns transcript and Solace's spoken reply")
async def process_audio(
    request: Request,
    session_id: int = Form(..., alias="sessionId"),
    audio: UploadFile = File(...),
    speak: bool = Form(True),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    s = _owned_session(db, user, session_id)
    if s.status != "active":
        raise HTTPException(status_code=409, detail="Session has ended")
    if not gemini.available:
        raise HTTPException(status_code=503, detail="Voice transcription requires GEMINI_API_KEY; use POST /voice/session/{id}/message for text")
    mime = (audio.content_type or "").split(";")[0]
    if mime not in AUDIO_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported audio type {audio.content_type}")
    data = await audio.read()
    if not data or len(data) > MAX_AUDIO_MB * 1024 * 1024:
        raise HTTPException(status_code=413, detail=f"Audio must be between 1 byte and {MAX_AUDIO_MB} MB")

    from starlette.concurrency import run_in_threadpool

    return await run_in_threadpool(_process_audio_sync, request, db, user, s, data, mime, speak)


def _process_audio_sync(request, db, user, s, data, mime, speak):
    convo = "\n".join(f"{t['role'].upper()}: {t['text']}" for t in _history(s))
    turn = gemini.generate_json(
        "Transcribe the user's audio exactly, then respond as Solace following your instructions.\n"
        f"Conversation so far:\n{convo or '(none)'}",
        _Turn,
        system=s.system_prompt,
        parts=[gemini.audio_part(data, mime)],
        temperature=0.7,
    )
    if not turn or not turn["transcript"].strip():
        raise HTTPException(status_code=422, detail="Could not understand the audio — please try again")

    ext = "." + (mime.split("/")[-1].replace("x-", "").replace("mpeg", "mp3"))
    user_msg = VoiceMessage(session_id=s.id, role="user", text=turn["transcript"].strip(), audio_path=save_audio(user.id, data, ext))
    risk = detect_risk(user_msg.text)
    if risk:
        s.risk_flag = True
    agent_msg = VoiceMessage(session_id=s.id, role="agent", text=turn["reply"].strip())
    db.add_all([user_msg, agent_msg])
    audio_b64 = _speak(db, user, agent_msg, agent_msg.text) if speak else None
    db.commit()
    base = str(request.base_url)
    return {
        "sessionId": s.id,
        "transcript": user_msg.text,
        "reply": agent_msg.text,
        "userMessage": voice_message_out(user_msg, base),
        "agentMessage": voice_message_out(agent_msg, base),
        "audioBase64": audio_b64,
        "audioMimeType": "audio/wav" if audio_b64 else None,
        "safety": CRISIS_RESOURCES if risk else None,
    }


@router.post("/session/{session_id}/message", summary="Send a typed message to Solace")
def text_message(
    session_id: int, body: VoiceTextIn, request: Request,
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    s = _owned_session(db, user, session_id)
    if s.status != "active":
        raise HTTPException(status_code=409, detail="Session has ended")
    user_msg = VoiceMessage(session_id=s.id, role="user", text=body.text.strip())
    db.add(user_msg)
    db.flush()
    db.refresh(s)
    risk = detect_risk(user_msg.text)
    if risk:
        s.risk_flag = True
    reply = _agent_reply(s, user_msg.text)
    agent_msg = VoiceMessage(session_id=s.id, role="agent", text=reply)
    db.add(agent_msg)
    audio_b64 = _speak(db, user, agent_msg, reply) if body.speak else None
    db.commit()
    base = str(request.base_url)
    return {
        "sessionId": s.id,
        "reply": reply,
        "userMessage": voice_message_out(user_msg, base),
        "agentMessage": voice_message_out(agent_msg, base),
        "audioBase64": audio_b64,
        "audioMimeType": "audio/wav" if audio_b64 else None,
        "safety": CRISIS_RESOURCES if risk else None,
        "aiPowered": gemini.available,
    }


@router.post("/session/{session_id}/end", summary="End a session: sentiment analysis, mood scoring and insights")
def end_session(session_id: int, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    s = _owned_session(db, user, session_id)
    if s.status == "ended":
        return voice_session_out(s, str(request.base_url))
    transcript = _history(s, limit=200)
    analysis = analyze_conversation(transcript) if any(t["role"] == "user" for t in transcript) else None
    s.status = "ended"
    s.ended_at = datetime.now(timezone.utc)
    if analysis:
        s.sentiment = analysis["sentiment"]
        s.post_mood_score = analysis["mood_score"]
        s.summary = analysis["summary"]
        s.insights = analysis["insights"]
        db.add(MoodLog(
            user_id=user.id, mood_score=analysis["mood_score"], stress_level=analysis["stress_level"],
            emotions=analysis["emotions"], triggers=analysis["triggers"], note=f"Solace session #{s.id}: {analysis['summary']}",
            source="solace", sentiment=analysis["sentiment"],
        ))
    else:
        s.summary = "Session ended before any conversation took place."
    db.commit()
    out = voice_session_out(s, str(request.base_url))
    if s.risk_flag:
        out["safety"] = CRISIS_RESOURCES
    return out


@router.get("/session/{session_id}")
def get_session(session_id: int, request: Request, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    return voice_session_out(_owned_session(db, user, session_id), str(request.base_url))


@router.get("/sessions")
def list_sessions(
    request: Request, limit: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user), db: Session = Depends(get_db),
):
    sessions = db.scalars(
        select(VoiceSession).where(VoiceSession.user_id == user.id).order_by(VoiceSession.started_at.desc()).limit(limit)
    )
    return [voice_session_out(s, str(request.base_url), include_messages=False) for s in sessions]


@router.get("/audio/{user_id}/{filename}", summary="Stream stored session audio (Bearer header or ?token=)")
def get_audio(
    user_id: int, filename: str, request: Request, token: str | None = Query(None),
    db: Session = Depends(get_db),
):
    raw = token
    if raw is None:
        auth = request.headers.get("authorization", "")
        raw = auth[7:] if auth.lower().startswith("bearer ") else None
    if not raw:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if decode_token(raw, "access") != user_id or "/" in filename or "\\" in filename or ".." in filename:
        raise HTTPException(status_code=404, detail="Not found")
    path = settings.audio_path / str(user_id) / filename
    if not path.is_file():
        raise HTTPException(status_code=404, detail="Not found")
    return FileResponse(path)


# ---------------------------------------------------------------- realtime
@router.websocket("/live")
async def live(ws: WebSocket, token: str = Query(...), session_id: int | None = Query(None, alias="sessionId")):
    """Real-time speech-to-speech via Gemini Live. Connect with ?token=<access token>&sessionId=<optional>."""
    await ws.accept()
    db = SessionLocal()
    try:
        try:
            user = user_from_token(token, db)
        except HTTPException:
            await ws.send_json({"type": "error", "message": "Unauthorized"})
            await ws.close(code=4401)
            return
        if not gemini.live_available:
            await ws.send_json({"type": "error", "message": "Realtime voice requires GEMINI_API_KEY and GEMINI_LIVE_MODEL"})
            await ws.close(code=4503)
            return
        if session_id is not None:
            s = db.get(VoiceSession, session_id)
            if not s or s.user_id != user.id or s.status != "active":
                await ws.send_json({"type": "error", "message": "Session not found or ended"})
                await ws.close(code=4404)
                return
            greeting = s.messages[0].text if s.messages else "Hi, I'm Solace. How are you feeling today?"
        else:
            profile, prompt, greeting, pre_mood = voice_prompt_selector.build_system_prompt(db, user)
            s = VoiceSession(user_id=user.id, prompt_profile=profile, system_prompt=prompt, pre_mood_score=pre_mood)
            db.add(s)
            db.commit()
        sid, prompt = s.id, s.system_prompt
    finally:
        db.close()

    from app.services.solace_live import run_live_bridge

    try:
        await run_live_bridge(ws, sid, prompt, greeting)
    except Exception as exc:
        log.exception("Live session %s failed", sid)
        try:
            await ws.send_json({"type": "error", "message": f"Live session error: {type(exc).__name__}"})
        except Exception:
            pass
    finally:
        try:
            await ws.close()
        except Exception:
            pass
