"""Family Gifting Dashboard API - FastAPI application entry point."""

import uuid
from typing import Any

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.exceptions import AppException
from app.schemas.base import ErrorDetail, ErrorResponse

# Create FastAPI application
app = FastAPI(
    title="Family Gifting Dashboard API",
    version="1.0.0",
    openapi_url="/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Configure CORS middleware
origins = [origin.strip() for origin in settings.CORS_ORIGINS.split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Exception handlers
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException) -> JSONResponse:
    """
    Handle all custom application exceptions.

    Converts AppException instances into properly formatted error responses
    following the standard error envelope pattern.

    Args:
        request: FastAPI request object
        exc: Application exception with code, message, and status_code

    Returns:
        JSONResponse with error envelope and appropriate HTTP status code
    """
    trace_id = str(uuid.uuid4())

    error_response = ErrorResponse(
        error=ErrorDetail(
            code=exc.code,
            message=exc.message,
            trace_id=trace_id,
        )
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=error_response.model_dump(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(
    request: Request, exc: RequestValidationError
) -> JSONResponse:
    """
    Handle FastAPI/Pydantic validation errors.

    Converts Pydantic validation errors into the standard error envelope format
    with a 422 Unprocessable Entity status code.

    Args:
        request: FastAPI request object
        exc: Pydantic validation error with details

    Returns:
        JSONResponse with error envelope and 422 status code
    """
    trace_id = str(uuid.uuid4())

    # Extract first validation error for simplicity
    # In production, you might want to include all errors
    first_error = exc.errors()[0] if exc.errors() else {}
    field = " -> ".join(str(loc) for loc in first_error.get("loc", []))
    message = first_error.get("msg", "Validation failed")

    error_response = ErrorResponse(
        error=ErrorDetail(
            code="VALIDATION_ERROR",
            message=f"{field}: {message}" if field else message,
            trace_id=trace_id,
        )
    )

    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=error_response.model_dump(),
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handle all unhandled exceptions.

    Catches any unexpected errors and returns a generic 500 error response
    while logging the actual error details for debugging.

    Args:
        request: FastAPI request object
        exc: Any unhandled exception

    Returns:
        JSONResponse with generic error envelope and 500 status code
    """
    trace_id = str(uuid.uuid4())

    # In production, log this error with trace_id for debugging
    # logger.error(f"Unhandled exception [{trace_id}]: {exc}", exc_info=True)

    error_response = ErrorResponse(
        error=ErrorDetail(
            code="INTERNAL_ERROR",
            message="An unexpected error occurred. Please try again later.",
            trace_id=trace_id,
        )
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=error_response.model_dump(),
    )


# Root endpoint
@app.get("/", include_in_schema=False)
async def root() -> dict[str, str]:
    """
    Root endpoint providing API information.

    Returns:
        Basic API metadata
    """
    return {
        "name": "Family Gifting Dashboard API",
        "version": "1.0.0",
        "status": "operational",
    }


# Health check endpoint
from app.api import health

app.include_router(health.router)

# Authentication routes
from app.api import auth

app.include_router(auth.router)

# List routes (CRUD + items)
from app.api import lists

app.include_router(lists.router)

# List item routes (status transitions, assignments)
from app.api import list_items

app.include_router(list_items.router)

# Gift routes (CRUD + search)
from app.api import gifts

app.include_router(gifts.router)

# Person routes (gift recipients CRUD)
from app.api import persons

app.include_router(persons.router)

# Dashboard routes (aggregated dashboard data)
from app.api import dashboard

app.include_router(dashboard.router)

# WebSocket routes (real-time updates)
from app.api import ws

app.include_router(ws.router)

# Additional routers to be added:
# from app.api import occasions, users
# app.include_router(occasions.router)
# app.include_router(users.router)
