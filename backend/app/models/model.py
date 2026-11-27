"""DINOv2 ViT-B/14 skin classifier matching the `rachitgoyell/dermora-dinov2-vit-b-skin` checkpoint.

Checkpoint layout (a plain state_dict):
  backbone.*  -> DINOv2 ViT-B/14 (facebookresearch/dinov2 naming, identical to timm's
                 `vit_base_patch14_dinov2`), pos_embed stored for a 37x37 (518px) grid
  head.*      -> Linear(768,512) BN ReLU Dropout Linear(512,256) ReLU Dropout Linear(256,4)
The head consumes the normalised CLS token.
"""
from __future__ import annotations

import timm
import torch
from torch import nn
from timm.layers import resample_abs_pos_embed

EMBED_DIM = 768
PATCH = 14


class DermoraClassifier(nn.Module):
    def __init__(self, num_classes: int = 4, img_size: int = 518, dropout: float = 0.3):
        super().__init__()
        # num_classes=0 -> timm returns the pooled CLS token (after final norm).
        self.backbone = timm.create_model(
            "vit_base_patch14_dinov2", pretrained=False, num_classes=0, img_size=img_size
        )
        self.head = nn.Sequential(
            nn.Linear(EMBED_DIM, 512),
            nn.BatchNorm1d(512),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(512, 256),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(256, num_classes),
        )
        self.img_size = img_size

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.head(self.backbone(x))

    def load_checkpoint(self, state_dict: dict) -> None:
        if "state_dict" in state_dict and isinstance(state_dict["state_dict"], dict):
            state_dict = state_dict["state_dict"]
        if "model_state_dict" in state_dict and isinstance(state_dict["model_state_dict"], dict):
            state_dict = state_dict["model_state_dict"]

        bb = {k.removeprefix("backbone."): v for k, v in state_dict.items() if k.startswith("backbone.")}
        bb.pop("mask_token", None)  # present in some torch.hub exports, unused for inference
        grid = self.img_size // PATCH
        if bb["pos_embed"].shape[1] != grid * grid + 1:
            bb["pos_embed"] = resample_abs_pos_embed(bb["pos_embed"], new_size=(grid, grid), num_prefix_tokens=1)
        self.backbone.load_state_dict(bb, strict=True)

        head = {k.removeprefix("head."): v for k, v in state_dict.items() if k.startswith("head.")}
        self.head.load_state_dict(head, strict=True)
