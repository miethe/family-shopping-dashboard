"""Upload schema DTOs."""

from pydantic import BaseModel, Field


class ImageUploadResponse(BaseModel):
    """Response for successful image upload or ingestion."""

    image_url: str = Field(..., description="Public URL for the uploaded/ingested image")
    filename: str | None = Field(
        default=None,
        description="Stored filename when file upload was used",
    )
