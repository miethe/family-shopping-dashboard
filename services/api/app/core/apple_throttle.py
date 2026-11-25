"""Per-process Apple limits, keyed only by verified identities."""

from collections import deque
from collections.abc import Callable
from threading import Lock
from time import monotonic

from fastapi import Request

from app.core.exceptions import AppException
from app.services.auth import AuthService


class AppleRateLimiter:
    def __init__(
        self,
        per_subject: int = 20,
        anonymous_limit: int = 20,
        window: float = 60,
        clock: Callable[[], float] = monotonic,
    ):
        self.per_subject = per_subject
        self.anonymous_limit = anonymous_limit
        self.window = window
        self.clock = clock
        self.events: deque[tuple[float, str]] = deque()
        self.lock = Lock()

    def check(self, subject: str | None, *, anonymous_bucket: str = "exchange") -> None:
        key = subject if subject is not None else f"anonymous:{anonymous_bucket}"
        limit = self.per_subject if subject is not None else self.anonymous_limit
        with self.lock:
            now = self.clock()
            while self.events and self.events[0][0] <= now - self.window:
                self.events.popleft()
            if sum(event_key == key for _, event_key in self.events) >= limit:
                raise AppException(
                    "APPLE_RATE_LIMITED", "Please try Apple sign-in again later", 429
                )
            self.events.append((now, key))


apple_limiter = AppleRateLimiter()


def authenticated_subject(request: Request) -> str | None:
    scheme, _, token = request.headers.get("Authorization", "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    user_id = AuthService().decode_token(token)
    return f"user:{user_id}" if user_id is not None else None


def throttle_apple(request: Request) -> None:
    apple_limiter.check(authenticated_subject(request), anonymous_bucket="challenge")
