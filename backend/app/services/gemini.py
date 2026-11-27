"""Thin wrapper around the Google Gen AI SDK.

Every method returns ``None`` on failure (no key, network error, quota, bad JSON) so
callers can fall back to deterministic logic and the API keeps working without keys.

Models are tried in the order given by GEMINI_MODEL (comma-separated). When one is
overloaded, rate-limited or retired (429/5xx/404) the next is used, so a demand spike
on a single model doesn't take the AI features down.
"""
from __future__ import annotations

import io
import json
import logging
import wave
from collections.abc import Callable
from typing import Any

from pydantic import BaseModel

from app.core.config import settings

log = logging.getLogger("dermora.gemini")

try:
    from google import genai
    from google.genai import errors as genai_errors
    from google.genai import types
except ImportError:  # pragma: no cover
    genai = None
    genai_errors = None
    types = None

# Errors worth retrying on the next model in the chain.
_FALLBACK_CODES = {404, 408, 429, 500, 502, 503, 504}


class GeminiService:
    def __init__(self) -> None:
        self._client = None
        if settings.gemini_api_key and genai is not None:
            try:
                self._client = genai.Client(
                    api_key=settings.gemini_api_key,
                    http_options=types.HttpOptions(
                        timeout=settings.gemini_timeout_seconds * 1000,
                        # Fail fast on one model and move to the next instead of retrying it.
                        retry_options=types.HttpRetryOptions(attempts=1),
                    ),
                )
            except Exception:
                log.exception("Could not initialise Gemini client")

    @property
    def available(self) -> bool:
        return self._client is not None

    @property
    def tts_available(self) -> bool:
        return self.available and bool(settings.gemini_tts_model)

    @property
    def live_available(self) -> bool:
        return self.available and bool(settings.gemini_live_model)

    @property
    def client(self):
        return self._client

    # ------------------------------------------------------------------ helpers
    def _generate(self, contents: Any, config) -> Any | None:
        """Call generate_content on each configured model until one succeeds."""
        for model in settings.gemini_model_chain:
            try:
                return self._client.models.generate_content(model=model, contents=contents, config=config)
            except Exception as exc:
                code = getattr(exc, "code", None)
                if genai_errors and isinstance(exc, genai_errors.APIError) and code in _FALLBACK_CODES:
                    log.warning("Gemini model %s unavailable (%s); trying next", model, code)
                    continue
                if isinstance(exc, TimeoutError) or "timed out" in str(exc).lower():
                    log.warning("Gemini model %s timed out; trying next", model)
                    continue
                raise
        log.error("All Gemini models failed: %s", ", ".join(settings.gemini_model_chain))
        return None

    def _safe(self, label: str, fn: Callable[[], Any]) -> Any | None:
        if not self.available:
            return None
        try:
            return fn()
        except Exception:
            log.exception("Gemini %s failed", label)
            return None

    @staticmethod
    def _history_to_contents(history: list[dict] | None, prompt_parts: list) -> list:
        # Gemini expects the conversation to open with a user turn and roles to alternate;
        # merge consecutive same-role turns and prepend a stub user turn if needed.
        merged: list[tuple[str, list[str]]] = []
        for turn in history or []:
            role = "model" if turn["role"] in ("model", "agent", "aria", "assistant") else "user"
            if merged and merged[-1][0] == role:
                merged[-1][1].append(turn["text"])
            else:
                merged.append((role, [turn["text"]]))
        if merged and merged[0][0] == "model":
            merged.insert(0, ("user", ["(conversation started)"]))
        contents = [
            types.Content(role=role, parts=[types.Part.from_text(text="\n".join(texts))]) for role, texts in merged
        ]
        if merged and merged[-1][0] == "user":
            contents.append(types.Content(role="model", parts=[types.Part.from_text(text="(listening)")]))
        contents.append(types.Content(role="user", parts=prompt_parts))
        return contents

    # -------------------------------------------------------------------- text
    def generate_text(
        self,
        prompt: str,
        *,
        system: str | None = None,
        history: list[dict] | None = None,
        temperature: float = 0.7,
        max_tokens: int = 800,
    ) -> str | None:
        def call():
            resp = self._generate(
                self._history_to_contents(history, [types.Part.from_text(text=prompt)]),
                types.GenerateContentConfig(system_instruction=system, temperature=temperature, max_output_tokens=max_tokens),
            )
            text = (resp.text or "").strip() if resp else ""
            return text or None

        return self._safe("generate_text", call)

    def generate_json(
        self,
        prompt: str,
        schema: type[BaseModel],
        *,
        system: str | None = None,
        parts: list | None = None,
        temperature: float = 0.3,
    ) -> dict[str, Any] | None:
        """Structured output validated against a Pydantic schema."""

        def call():
            resp = self._generate(
                [types.Content(role="user", parts=[*(parts or []), types.Part.from_text(text=prompt)])],
                types.GenerateContentConfig(
                    system_instruction=system,
                    temperature=temperature,
                    response_mime_type="application/json",
                    response_schema=schema,
                ),
            )
            if resp is None:
                return None
            return schema.model_validate(json.loads(resp.text)).model_dump()

        return self._safe("generate_json", call)

    # ------------------------------------------------------------------- audio
    def audio_part(self, audio: bytes, mime_type: str):
        return types.Part.from_bytes(data=audio, mime_type=mime_type) if types else None

    def image_part(self, image: bytes, mime_type: str):
        return types.Part.from_bytes(data=image, mime_type=mime_type) if types else None

    def text_to_speech(self, text: str) -> bytes | None:
        """WAV (24 kHz mono 16-bit) of ``text``, or None when GEMINI_TTS_MODEL isn't configured.

        When server TTS is unavailable the web client speaks replies with the browser's voice.
        """
        if not self.tts_available or not text.strip():
            return None

        def call():
            resp = self._client.models.generate_content(
                model=settings.gemini_tts_model,
                contents=text,
                config=types.GenerateContentConfig(
                    response_modalities=["AUDIO"],
                    speech_config=types.SpeechConfig(
                        voice_config=types.VoiceConfig(
                            prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=settings.gemini_tts_voice)
                        )
                    ),
                ),
            )
            return pcm_to_wav(resp.candidates[0].content.parts[0].inline_data.data, sample_rate=24000)

        return self._safe("text_to_speech", call)


def pcm_to_wav(pcm: bytes, sample_rate: int = 24000, channels: int = 1, sample_width: int = 2) -> bytes:
    buf = io.BytesIO()
    with wave.open(buf, "wb") as wf:
        wf.setnchannels(channels)
        wf.setsampwidth(sample_width)
        wf.setframerate(sample_rate)
        wf.writeframes(pcm)
    return buf.getvalue()


gemini = GeminiService()
