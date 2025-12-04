"""Health check endpoint for Kubernetes probes."""

from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from fastapi import APIRouter, Depends

from app.core.database import get_db

router = APIRouter(tags=["health"])


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""

    status: str  # "healthy"
    db: str  # "connected" or "disconnected"


@router.get("/health", response_model=HealthResponse)
async def health_check(db: AsyncSession = Depends(get_db)) -> HealthResponse:
    """
    Health check endpoint for K8s liveness/readiness probes.

    Checks:
    - API is responding
    - Database connection is valid

    Args:
        db: Database session dependency

    Returns:
        HealthResponse: Status of API and database
    """
    # Try a simple query to verify DB connection
    try:
        await db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "disconnected"

    return HealthResponse(status="healthy", db=db_status)
