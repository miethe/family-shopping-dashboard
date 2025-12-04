"""FastAPI application entry point."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.core.database import engine


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan manager.

    Handles startup and shutdown events.
    """
    # Startup
    yield
    # Shutdown
    await engine.dispose()


app = FastAPI(
    title="Family Gifting Dashboard API",
    version="0.1.0",
    description="Real-time collaborative gift list management for families",
    lifespan=lifespan,
)


@app.get("/health")
async def health_check() -> dict[str, str]:
    """
    Health check endpoint.

    Returns:
        dict: Status information
    """
    return {"status": "healthy"}
