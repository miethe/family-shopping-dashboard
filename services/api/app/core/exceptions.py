"""Custom exception classes for application errors."""

from typing import Any


class AppException(Exception):
    """
    Base application exception with error code, message, and HTTP status code.

    All custom exceptions should inherit from this class to ensure
    consistent error handling across the application.

    Attributes:
        code: Error code identifier (e.g., "NOT_FOUND", "VALIDATION_ERROR")
        message: Human-readable error message
        status_code: HTTP status code to return
        details: Optional additional error details

    Example:
        ```python
        raise AppException(
            code="CUSTOM_ERROR",
            message="Something went wrong",
            status_code=500
        )
        ```
    """

    def __init__(
        self,
        code: str,
        message: str,
        status_code: int = 500,
        details: dict[str, Any] | None = None,
    ) -> None:
        """
        Initialize application exception.

        Args:
            code: Error code identifier
            message: Human-readable error message
            status_code: HTTP status code (default: 500)
            details: Optional additional error details
        """
        self.code = code
        self.message = message
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class NotFoundError(AppException):
    """
    Exception for resource not found errors (HTTP 404).

    Raised when a requested resource does not exist in the system.

    Example:
        ```python
        raise NotFoundError(
            code="GIFT_NOT_FOUND",
            message="Gift with ID 123 not found"
        )
        ```
    """

    def __init__(
        self,
        code: str = "NOT_FOUND",
        message: str = "Resource not found",
        details: dict[str, Any] | None = None,
    ) -> None:
        """
        Initialize not found exception.

        Args:
            code: Error code (default: "NOT_FOUND")
            message: Error message (default: "Resource not found")
            details: Optional additional error details
        """
        super().__init__(code=code, message=message, status_code=404, details=details)


class ValidationError(AppException):
    """
    Exception for validation errors (HTTP 400).

    Raised when input data fails validation checks.

    Example:
        ```python
        raise ValidationError(
            code="INVALID_PRICE",
            message="Price must be greater than 0",
            details={"field": "price", "value": -10}
        )
        ```
    """

    def __init__(
        self,
        code: str = "VALIDATION_ERROR",
        message: str = "Validation failed",
        details: dict[str, Any] | None = None,
    ) -> None:
        """
        Initialize validation exception.

        Args:
            code: Error code (default: "VALIDATION_ERROR")
            message: Error message (default: "Validation failed")
            details: Optional additional error details
        """
        super().__init__(code=code, message=message, status_code=400, details=details)


class UnauthorizedError(AppException):
    """
    Exception for authentication errors (HTTP 401).

    Raised when authentication is required but not provided or invalid.

    Example:
        ```python
        raise UnauthorizedError(
            code="INVALID_TOKEN",
            message="JWT token is invalid or expired"
        )
        ```
    """

    def __init__(
        self,
        code: str = "UNAUTHORIZED",
        message: str = "Authentication required",
        details: dict[str, Any] | None = None,
    ) -> None:
        """
        Initialize unauthorized exception.

        Args:
            code: Error code (default: "UNAUTHORIZED")
            message: Error message (default: "Authentication required")
            details: Optional additional error details
        """
        super().__init__(code=code, message=message, status_code=401, details=details)


class ForbiddenError(AppException):
    """
    Exception for authorization errors (HTTP 403).

    Raised when a user is authenticated but lacks permission for the resource.

    Example:
        ```python
        raise ForbiddenError(
            code="INSUFFICIENT_PERMISSIONS",
            message="You don't have permission to delete this gift"
        )
        ```
    """

    def __init__(
        self,
        code: str = "FORBIDDEN",
        message: str = "Access denied",
        details: dict[str, Any] | None = None,
    ) -> None:
        """
        Initialize forbidden exception.

        Args:
            code: Error code (default: "FORBIDDEN")
            message: Error message (default: "Access denied")
            details: Optional additional error details
        """
        super().__init__(code=code, message=message, status_code=403, details=details)
