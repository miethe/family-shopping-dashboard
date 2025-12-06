"""Media upload endpoints for entity images."""

from urllib.parse import urlparse

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status

from app.core.config import settings
from app.core.storage import ALLOWED_CONTENT_TYPES, save_image_file
from app.schemas.upload import ImageUploadResponse
from app.core.deps import get_current_user

router = APIRouter(prefix="/upload", tags=["upload"])


@router.post(
    "/image",
    response_model=ImageUploadResponse,
    status_code=status.HTTP_200_OK,
    summary="Upload or ingest an image",
    description="Accepts multipart file uploads or an image URL. Validates size/type for file uploads.",
)
async def upload_image(
    file: UploadFile | None = File(default=None),
    url: str | None = Form(default=None),
    current_user_id: int = Depends(get_current_user),
) -> ImageUploadResponse:
    if file is None and (url is None or not url.strip()):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Provide either a file upload or an image URL.",
        )

    if file is not None:
        try:
            filename, public_url = await save_image_file(file)
            return ImageUploadResponse(image_url=public_url, filename=filename)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

    assert url is not None
    parsed = urlparse(url)
    if parsed.scheme not in {"http", "https"} or not parsed.netloc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL must start with http:// or https://",
        )

    # No storage for URL ingestion; we rely on external hosting
    return ImageUploadResponse(image_url=url.strip(), filename=None)


@router.get(
    "/image/config",
    summary="Get upload configuration",
    description="Returns client configuration for uploads (max size and allowed content types).",
)
async def upload_config(
    current_user_id: int = Depends(get_current_user),
) -> dict:
    return {
        "max_mb": settings.MAX_UPLOAD_MB,
        "allowed_content_types": list(ALLOWED_CONTENT_TYPES.keys()),
    }
