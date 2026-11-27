"""Photo quality gate for medical photography.

Local checks (always on): resolution, blur, exposure, glare.
Optional Azure AI Vision (AZURE_VISION_KEY + AZURE_VISION_ENDPOINT): caption + tags,
used to warn when the photo doesn't appear to show skin.
"""
from __future__ import annotations

import io
import logging

import httpx
import numpy as np
from PIL import Image
from scipy import ndimage

from app.core.config import settings
from app.models.transforms import load_rgb

log = logging.getLogger("dermora.vision")

SKIN_TAGS = {"skin", "person", "human", "arm", "hand", "face", "leg", "finger", "close-up", "human body", "neck", "back", "wrist", "elbow", "knee", "foot", "cheek", "forehead"}


def assess_quality(image: Image.Image) -> dict:
    img = load_rgb(image)
    w, h = img.size
    small = img.copy()
    small.thumbnail((512, 512))
    gray = np.asarray(small.convert("L"), dtype=np.float32)

    sharpness = float(ndimage.laplace(gray).var())
    brightness = float(gray.mean())
    glare = float((gray > 245).mean())

    warnings: list[str] = []
    if min(w, h) < 224:
        warnings.append("Low resolution — move closer or use the rear camera.")
    if sharpness < 40:
        warnings.append("Image looks blurry — hold steady and tap to focus.")
    if brightness < 50:
        warnings.append("Image is too dark — use natural daylight.")
    elif brightness > 220:
        warnings.append("Image is overexposed — avoid direct flash.")
    if glare > 0.08:
        warnings.append("Strong glare detected — change the angle to reduce reflections.")

    score = 100
    score -= 25 if sharpness < 40 else 0
    score -= 20 if brightness < 50 or brightness > 220 else 0
    score -= 15 if glare > 0.08 else 0
    score -= 20 if min(w, h) < 224 else 0

    result = {
        "score": max(score, 0),
        "acceptable": score >= 55,
        "sharpness": round(sharpness, 1),
        "brightness": round(brightness, 1),
        "glareFraction": round(glare, 4),
        "width": w,
        "height": h,
        "warnings": warnings,
    }
    azure = _azure_analyze(img)
    if azure:
        result["azure"] = azure
        if azure.get("tags") and not (SKIN_TAGS & set(azure["tags"])):
            result["warnings"].append("This photo may not show skin — please photograph the affected area.")
    return result


def _azure_analyze(img: Image.Image) -> dict | None:
    if not (settings.azure_vision_key and settings.azure_vision_endpoint):
        return None
    buf = io.BytesIO()
    img.save(buf, format="JPEG", quality=90)
    url = settings.azure_vision_endpoint.rstrip("/") + "/computervision/imageanalysis:analyze"
    try:
        r = httpx.post(
            url,
            params={"api-version": "2024-02-01", "features": "caption,tags"},
            headers={"Ocp-Apim-Subscription-Key": settings.azure_vision_key, "Content-Type": "application/octet-stream"},
            content=buf.getvalue(),
            timeout=10,
        )
        r.raise_for_status()
        data = r.json()
        return {
            "caption": (data.get("captionResult") or {}).get("text"),
            "tags": [t["name"] for t in (data.get("tagsResult") or {}).get("values", []) if t.get("confidence", 0) > 0.6],
        }
    except Exception:
        log.warning("Azure Vision analysis failed", exc_info=True)
        return None
