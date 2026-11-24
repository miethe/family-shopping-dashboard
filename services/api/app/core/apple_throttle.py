"""Bounded per-process Apple endpoint limiter (shared by challenge and exchange)."""

from collections import deque
from collections.abc import Callable
from threading import Lock
from time import monotonic

from fastapi import Request

from app.core.exceptions import AppException


class AppleRateLimiter:
    def __init__(
        self,
        per_ip: int = 20,
        global_limit: int = 120,
        window: float = 60,
        clock: Callable[[], float] = monotonic,
    ):
        self.per_ip = per_ip
        self.global_limit = global_limit
        self.window = window
        self.clock = clock
        self.events: deque[tuple[float, str]] = deque()
        self.lock = Lock()

    def check(self, ip: str) -> None:
        with self.lock:
            now = self.clock()
            while self.events and self.events[0][0] <= now - self.window:
                self.events.popleft()
            if (
                len(self.events) >= self.global_limit
                or sum(event_ip == ip for _, event_ip in self.events) >= self.per_ip
            ):
                raise AppException(
                    "APPLE_RATE_LIMITED", "Please try Apple sign-in again later", 429
                )
            self.events.append((now, ip))


apple_limiter = AppleRateLimiter()


def throttle_apple(request: Request) -> None:
    # Do not trust caller-supplied forwarding headers.
    apple_limiter.check(request.client.host if request.client else "unknown")
