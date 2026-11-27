"""Classical computer-vision lesion measurements from a single photo.

These are heuristic estimates (no calibration marker in frame), intended for tracking
change over time on the same body area — not absolute clinical measurements.

Pipeline: downscale -> sRGB to CIELAB -> condition-aware anomaly map (a* for
erythematous conditions, L*/chroma for depigmentation) -> Otsu threshold -> morphology
-> metrics on the lesion mask.
"""
from __future__ import annotations

import math
from dataclasses import asdict, dataclass

import numpy as np
from PIL import Image
from scipy import ndimage

from app.core.config import settings
from app.models.transforms import load_rgb

WORK_SIZE = 320


@dataclass
class LesionMetrics:
    redness_index: int  # 0-100 (mean erythema of lesion)
    depigmentation_index: int  # 0-100 (lightness contrast vs surrounding skin)
    area_fraction: float  # lesion pixels / image pixels
    area_cm2: float  # estimated using FIELD_OF_VIEW_CM
    border_regularity: int  # 0-100 (100 = perfectly smooth/circular border)
    symmetry: int  # 0-100 (100 = perfectly symmetric)
    lesion_count: int
    mask_confidence: float  # 0-1, how clearly lesion separates from skin

    def as_dict(self) -> dict:
        return asdict(self)


# ---------------------------------------------------------------- colour maths
def _srgb_to_lab(rgb: np.ndarray) -> np.ndarray:
    c = rgb.astype(np.float32) / 255.0
    c = np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)
    m = np.array([[0.4124564, 0.3575761, 0.1804375],
                  [0.2126729, 0.7151522, 0.0721750],
                  [0.0193339, 0.1191920, 0.9503041]], dtype=np.float32)
    xyz = c @ m.T
    xyz /= np.array([0.95047, 1.0, 1.08883], dtype=np.float32)
    eps, k = 216 / 24389, 24389 / 27
    f = np.where(xyz > eps, np.cbrt(xyz), (k * xyz + 16) / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return np.stack([L, a, b], axis=-1)


def _otsu(values: np.ndarray, bins: int = 128) -> tuple[float, float]:
    """Return (threshold, separability in [0,1])."""
    hist, edges = np.histogram(values, bins=bins)
    hist = hist.astype(np.float64)
    total = hist.sum()
    if total == 0:
        return float(values.mean()), 0.0
    centers = (edges[:-1] + edges[1:]) / 2
    w0 = np.cumsum(hist)
    w1 = total - w0
    s0 = np.cumsum(hist * centers)
    mu0 = s0 / np.maximum(w0, 1)
    mu1 = (s0[-1] - s0) / np.maximum(w1, 1)
    between = w0 * w1 * (mu0 - mu1) ** 2
    idx = int(np.argmax(between))
    var_total = values.var() * total * total
    sep = float(between[idx] / var_total) if var_total > 0 else 0.0
    return float(centers[idx]), sep


# ------------------------------------------------------------------- analysis
def analyze_lesion(image: Image.Image, condition: str) -> LesionMetrics:
    img = load_rgb(image)
    img.thumbnail((WORK_SIZE, WORK_SIZE))
    rgb = np.asarray(img)
    h, w = rgb.shape[:2]
    lab = _srgb_to_lab(rgb)
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    chroma = np.hypot(a, b)

    depigmenting = condition == "vitiligo"
    if depigmenting:
        # Vitiligo patches are lighter and less saturated than surrounding skin.
        anomaly = (L - np.median(L)) / (L.std() + 1e-6) - (chroma - np.median(chroma)) / (chroma.std() + 1e-6)
    else:
        # Eczema / psoriasis: erythema (a*) plus scaling (bright, low chroma) contribute.
        anomaly = (a - np.median(a)) / (a.std() + 1e-6)

    smooth = ndimage.gaussian_filter(anomaly, sigma=1.5)
    thr, sep = _otsu(smooth.ravel())
    mask = smooth > thr

    mask = ndimage.binary_opening(mask, iterations=2)
    mask = ndimage.binary_closing(mask, iterations=2)
    mask = ndimage.binary_fill_holes(mask)
    labels, n = ndimage.label(mask)
    min_px = 0.004 * h * w
    if n:
        sizes = ndimage.sum(mask, labels, index=range(1, n + 1))
        keep = [i + 1 for i, s in enumerate(sizes) if s >= min_px]
        mask = np.isin(labels, keep)
        n = len(keep)

    area_fraction = float(mask.mean())
    if condition == "normal" or area_fraction == 0 or sep < 0.25:
        # No clearly separable lesion.
        mask_conf = round(sep, 3)
        a_mean = float(np.mean(a))
        return LesionMetrics(
            redness_index=_redness_from_a(a_mean),
            depigmentation_index=0,
            area_fraction=0.0 if condition == "normal" else round(area_fraction, 4),
            area_cm2=0.0 if condition == "normal" else _area_cm2(area_fraction, h, w),
            border_regularity=100,
            symmetry=100,
            lesion_count=0 if condition == "normal" else n,
            mask_confidence=mask_conf,
        )

    skin = ~ndimage.binary_dilation(mask, iterations=3)
    if skin.sum() < 0.05 * h * w:  # lesion fills frame — compare against frame median
        skin = np.ones_like(mask)

    redness = _redness_from_a(float(a[mask].mean()) - max(0.0, float(np.median(a[skin])) - 12.0))
    # ΔL* of 50 maps to 100 — wide enough not to saturate on darker skin tones.
    depig = int(np.clip((float(L[mask].mean()) - float(np.median(L[skin]))) / 50 * 100, 0, 100))

    largest = _largest_component(mask)
    return LesionMetrics(
        redness_index=redness,
        depigmentation_index=depig if depigmenting else 0,
        area_fraction=round(area_fraction, 4),
        area_cm2=_area_cm2(area_fraction, h, w),
        border_regularity=_border_regularity(largest),
        symmetry=_symmetry(largest),
        lesion_count=int(n),
        mask_confidence=round(sep, 3),
    )


def _redness_from_a(a_star: float) -> int:
    # Typical healthy skin a* ~ 10-15, inflamed plaques ~ 25-40.
    return int(np.clip((a_star - 5.0) / 35.0 * 100, 0, 100))


def _area_cm2(fraction: float, h: int, w: int) -> float:
    fov_w = settings.field_of_view_cm
    fov_h = fov_w * h / w
    return round(fraction * fov_w * fov_h, 2)


def _largest_component(mask: np.ndarray) -> np.ndarray:
    labels, n = ndimage.label(mask)
    if n <= 1:
        return mask
    sizes = ndimage.sum(mask, labels, index=range(1, n + 1))
    return labels == (int(np.argmax(sizes)) + 1)


def _border_regularity(mask: np.ndarray) -> int:
    area = mask.sum()
    if area < 10:
        return 100
    boundary = mask & ~ndimage.binary_erosion(mask)
    perimeter = boundary.sum() * 1.05  # pixel-count perimeter underestimates diagonals slightly
    compactness = 4 * math.pi * area / max(perimeter**2, 1)
    # Pixelised discs score ~0.85-0.95; normalise so a clean round lesion ≈ 100.
    return int(np.clip(compactness / 0.85, 0, 1) * 100)


def _symmetry(mask: np.ndarray) -> int:
    ys, xs = np.nonzero(mask)
    if len(xs) < 10:
        return 100
    cy, cx = ys.mean(), xs.mean()
    # Align with principal axes so rotation doesn't penalise symmetry.
    cov = np.cov(np.stack([xs - cx, ys - cy]))
    evals, evecs = np.linalg.eigh(cov)
    rot = evecs[:, ::-1]
    pts = np.stack([xs - cx, ys - cy], axis=1) @ rot
    pts = np.round(pts).astype(int)
    pset = set(map(tuple, pts))
    flip_x = {(-x, y) for x, y in pset}
    flip_y = {(x, -y) for x, y in pset}

    def iou(other: set) -> float:
        return len(pset & other) / max(len(pset | other), 1)

    # Rounding after rotation leaves small gaps; dilate the score accordingly.
    score = (iou(flip_x) + iou(flip_y)) / 2
    return int(np.clip(score / 0.9, 0, 1) * 100)


# ---------------------------------------------------------------- severity
SEVERITY_BANDS = [(25, "mild"), (50, "moderate"), (75, "marked"), (101, "severe")]


def severity_band(score: int) -> str:
    return next(name for limit, name in SEVERITY_BANDS if score < limit)


def compute_severity(probabilities: dict[str, float], condition: str, m: LesionMetrics) -> int:
    """Composite 0-100 severity: disease probability x lesion intensity/extent/irregularity."""
    p_disease = 1.0 - probabilities.get("normal", 0.0)
    if condition == "normal":
        return int(round(min(15, 30 * p_disease)))
    intensity = (m.depigmentation_index if condition == "vitiligo" else m.redness_index) / 100
    extent = min(1.0, m.area_fraction / 0.35)
    irregularity = 1 - m.border_regularity / 100
    raw = 0.15 + 0.4 * intensity + 0.3 * extent + 0.15 * irregularity
    return int(np.clip(round(100 * p_disease * raw), 0, 100))


def symmetry_label(score: int) -> str:
    if score >= 85:
        return "Symmetric"
    if score >= 70:
        return "Mild Asymmetry"
    if score >= 50:
        return "Moderate Asymmetry"
    return "Marked Asymmetry"
