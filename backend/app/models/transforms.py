"""Image preprocessing for the skin classifier."""
from __future__ import annotations

from PIL import Image, ImageOps
from torchvision import transforms as T

IMAGENET_MEAN = (0.485, 0.456, 0.406)
IMAGENET_STD = (0.229, 0.224, 0.225)


def load_rgb(image: Image.Image) -> Image.Image:
    """Apply EXIF orientation (phone photos) and convert to RGB."""
    return ImageOps.exif_transpose(image).convert("RGB")


def eval_transform(size: int) -> T.Compose:
    return T.Compose([
        T.Resize((size, size), interpolation=T.InterpolationMode.BICUBIC),
        T.ToTensor(),
        T.Normalize(IMAGENET_MEAN, IMAGENET_STD),
    ])


def tta_views(image: Image.Image) -> list[Image.Image]:
    """Light test-time augmentation: original + horizontal flip."""
    return [image, ImageOps.mirror(image)]
