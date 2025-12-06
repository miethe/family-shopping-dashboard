"""Lightweight image storage helpers for upload endpoints."""

from __future__ import annotations

from pathlib import Path
from typing import Tuple
from uuid import uuid4

from fastapi import UploadFile

from app.core.config import settings

ALLOWED_CONTENT_TYPES = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
    "image/heic": "heic",
    "image/heif": "heif",
}


def _ensure_upload_dir() -> Path:
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    return upload_dir


async def save_image_file(upload: UploadFile) -> Tuple[str, str]:
    """
    Persist an uploaded image to the configured upload directory.

    Returns:
        Tuple of (filename, public_url)
    Raises:
        ValueError for invalid content type or size.
    """
    if upload.content_type not in ALLOWED_CONTENT_TYPES:
        raise ValueError(
            f"Unsupported file type '{upload.content_type}'. "
            f"Allowed: {', '.join(ALLOWED_CONTENT_TYPES)}"
        )

    content = await upload.read()
    max_bytes = settings.MAX_UPLOAD_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise ValueError(f"File exceeds {settings.MAX_UPLOAD_MB}MB limit.")

    ext = ALLOWED_CONTENT_TYPES[upload.content_type]
    filename = f"{uuid4().hex}.{ext}"
    upload_dir = _ensure_upload_dir()
    destination = upload_dir / filename
    destination.write_bytes(content)

    public_url = _build_public_url(filename)
    return filename, public_url


def _build_public_url(filename: str) -> str:
    if settings.CDN_BASE_URL:
        base = settings.CDN_BASE_URL.rstrip("/")
        return f"{base}/uploads/{filename}"
    return f"/uploads/{filename}"
