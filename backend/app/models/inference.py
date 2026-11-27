"""Lazy-loaded singleton prediction pipeline for the skin classifier."""
from __future__ import annotations

import logging
import threading
import time
from dataclasses import dataclass
from pathlib import Path

import torch
from PIL import Image

from app.core.config import settings
from app.models.model import DermoraClassifier
from app.models.transforms import eval_transform, load_rgb, tta_views

log = logging.getLogger("dermora.model")


@dataclass
class Prediction:
    label: str
    confidence: float
    probabilities: dict[str, float]
    latency_ms: float
    model_version: str


class ModelUnavailable(RuntimeError):
    pass


class SkinClassifier:
    def __init__(self) -> None:
        self._model: DermoraClassifier | None = None
        self._lock = threading.Lock()
        self._error: str | None = None
        self.classes = settings.class_names
        self.size = settings.model_input_size
        self.device = self._pick_device()
        self.transform = eval_transform(self.size)

    @staticmethod
    def _pick_device() -> torch.device:
        if settings.model_device == "cpu":
            return torch.device("cpu")
        if settings.model_device == "cuda" or torch.cuda.is_available():
            return torch.device("cuda" if torch.cuda.is_available() else "cpu")
        return torch.device("cpu")

    @property
    def version(self) -> str:
        return f"{settings.model_hf_repo}:{Path(settings.model_path).name}@{self.size}px"

    @property
    def loaded(self) -> bool:
        return self._model is not None

    @property
    def error(self) -> str | None:
        return self._error

    def _resolve_weights(self) -> Path:
        path = settings.abs_path(settings.model_path)
        if path.exists():
            return path
        if not settings.model_auto_download:
            raise ModelUnavailable(f"Model weights not found at {path}")
        log.info("Downloading model weights from Hugging Face (%s)...", settings.model_hf_repo)
        from huggingface_hub import hf_hub_download

        downloaded = hf_hub_download(
            settings.model_hf_repo, settings.model_hf_filename, local_dir=path.parent
        )
        dl = Path(downloaded)
        if dl != path:
            dl.replace(path)
        return path

    def load(self) -> None:
        if self._model is not None:
            return
        with self._lock:
            if self._model is not None:
                return
            try:
                t0 = time.perf_counter()
                weights = self._resolve_weights()
                model = DermoraClassifier(num_classes=len(self.classes), img_size=self.size)
                state = torch.load(weights, map_location="cpu", weights_only=True)
                model.load_checkpoint(state)
                model.eval().to(self.device)
                self._model = model
                self._error = None
                log.info("Skin model loaded on %s in %.1fs", self.device, time.perf_counter() - t0)
            except Exception as exc:  # surfaced via /health and 503s
                self._error = f"{type(exc).__name__}: {exc}"
                log.exception("Failed to load skin model")
                raise ModelUnavailable(self._error) from exc

    @torch.inference_mode()
    def predict(self, image: Image.Image) -> Prediction:
        self.load()
        assert self._model is not None
        t0 = time.perf_counter()
        img = load_rgb(image)
        batch = torch.stack([self.transform(v) for v in tta_views(img)]).to(self.device)
        probs = self._model(batch).softmax(-1).mean(0).cpu().tolist()
        idx = max(range(len(probs)), key=probs.__getitem__)
        return Prediction(
            label=self.classes[idx],
            confidence=round(probs[idx], 4),
            probabilities={c: round(p, 4) for c, p in zip(self.classes, probs)},
            latency_ms=round((time.perf_counter() - t0) * 1000, 1),
            model_version=self.version,
        )


classifier = SkinClassifier()
