"""Real-time speech-to-speech bridge: browser WebSocket <-> Gemini Live API.

Client -> server frames
  binary                         raw PCM16 mono 16 kHz audio
  {"type":"audio","data":b64}    same, base64-encoded
  {"type":"text","text":"..."}   typed message
  {"type":"audio_end"}           mic paused (flushes server VAD)
  {"type":"end"}                 close session
Server -> client frames
  {"type":"ready","sessionId":..,"greeting":..}
  {"type":"audio","data":b64,"mimeType":"audio/pcm;rate=24000"}
  {"type":"transcript","role":"user"|"agent","text":..}
  {"type":"turn_complete"} | {"type":"interrupted"}
  {"type":"safety","resources":{..}}
  {"type":"error","message":..}
"""
from __future__ import annotations

import asyncio
import base64
import json
import logging

from fastapi import WebSocket, WebSocketDisconnect
from starlette.concurrency import run_in_threadpool

from app.core.config import settings
from app.core.database import SessionLocal
from app.entities import VoiceMessage
from app.services.gemini import gemini
from app.services.safety import CRISIS_RESOURCES, detect_risk

log = logging.getLogger("dermora.solace.live")

try:
    from google.genai import types
except ImportError:  # pragma: no cover
    types = None


def _save_message(session_id: int, role: str, text: str, risk: bool) -> None:
    db = SessionLocal()
    try:
        db.add(VoiceMessage(session_id=session_id, role=role, text=text))
        if risk:
            from app.entities import VoiceSession

            s = db.get(VoiceSession, session_id)
            if s:
                s.risk_flag = True
        db.commit()
    finally:
        db.close()


async def run_live_bridge(ws: WebSocket, session_id: int, system_prompt: str, greeting: str) -> None:
    config = types.LiveConnectConfig(
        response_modalities=[types.Modality.AUDIO],
        system_instruction=types.Content(parts=[types.Part(text=system_prompt)]),
        input_audio_transcription=types.AudioTranscriptionConfig(),
        output_audio_transcription=types.AudioTranscriptionConfig(),
        speech_config=types.SpeechConfig(
            voice_config=types.VoiceConfig(
                prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=settings.gemini_tts_voice)
            )
        ),
    )
    async with gemini.client.aio.live.connect(model=settings.gemini_live_model, config=config) as live:
        await ws.send_json({"type": "ready", "sessionId": session_id, "greeting": greeting})
        # Have Solace speak the greeting so the conversation opens naturally.
        await live.send_client_content(
            turns=types.Content(role="user", parts=[types.Part(text=f"(Session started. Greet the user warmly with: \"{greeting}\")")]),
            turn_complete=True,
        )

        async def upstream() -> None:
            while True:
                msg = await ws.receive()
                if msg["type"] == "websocket.disconnect":
                    raise WebSocketDisconnect()
                if msg.get("bytes"):
                    await live.send_realtime_input(audio=types.Blob(data=msg["bytes"], mime_type="audio/pcm;rate=16000"))
                    continue
                if not msg.get("text"):
                    continue
                try:
                    data = json.loads(msg["text"])
                except json.JSONDecodeError:
                    continue
                kind = data.get("type")
                if kind == "audio" and data.get("data"):
                    await live.send_realtime_input(
                        audio=types.Blob(data=base64.b64decode(data["data"]), mime_type="audio/pcm;rate=16000")
                    )
                elif kind == "audio_end":
                    await live.send_realtime_input(audio_stream_end=True)
                elif kind == "text" and data.get("text", "").strip():
                    text = data["text"].strip()
                    risk = detect_risk(text)
                    await run_in_threadpool(_save_message, session_id, "user", text, risk)
                    if risk:
                        await ws.send_json({"type": "safety", "resources": CRISIS_RESOURCES})
                    await live.send_client_content(
                        turns=types.Content(role="user", parts=[types.Part(text=text)]), turn_complete=True
                    )
                elif kind == "end":
                    return

        async def downstream() -> None:
            user_buf: list[str] = []
            agent_buf: list[str] = []
            while True:
                async for msg in live.receive():
                    sc = msg.server_content
                    if msg.data:
                        await ws.send_json({"type": "audio", "data": base64.b64encode(msg.data).decode(),
                                            "mimeType": "audio/pcm;rate=24000"})
                    if not sc:
                        continue
                    if sc.input_transcription and sc.input_transcription.text:
                        user_buf.append(sc.input_transcription.text)
                        await ws.send_json({"type": "transcript", "role": "user", "text": sc.input_transcription.text})
                    if sc.output_transcription and sc.output_transcription.text:
                        agent_buf.append(sc.output_transcription.text)
                        await ws.send_json({"type": "transcript", "role": "agent", "text": sc.output_transcription.text})
                    if sc.interrupted:
                        await ws.send_json({"type": "interrupted"})
                    if sc.turn_complete:
                        if user_buf:
                            text = "".join(user_buf).strip()
                            risk = detect_risk(text)
                            await run_in_threadpool(_save_message, session_id, "user", text, risk)
                            if risk:
                                await ws.send_json({"type": "safety", "resources": CRISIS_RESOURCES})
                        if agent_buf:
                            await run_in_threadpool(_save_message, session_id, "agent", "".join(agent_buf).strip(), False)
                        user_buf.clear()
                        agent_buf.clear()
                        await ws.send_json({"type": "turn_complete"})

        up = asyncio.create_task(upstream())
        down = asyncio.create_task(downstream())
        done, pending = await asyncio.wait({up, down}, return_when=asyncio.FIRST_COMPLETED)
        for t in pending:
            t.cancel()
        for t in done:
            exc = t.exception()
            if exc and not isinstance(exc, WebSocketDisconnect):
                raise exc
