"""Per-process Apple limits, keyed only by verified identities."""

from collections import OrderedDict, deque
from collections.abc import Callable
from threading import Lock
from time import monotonic
from typing import NoReturn

from fastapi import Request

from app.core.exceptions import AppException
from app.services.auth import AuthService


class AppleRateLimiter:
    def __init__(
        self,
        per_subject: int = 20,
        anonymous_limit: int = 20,
        window: float = 60,
        max_keys: int = 4096,
        clock: Callable[[], float] = monotonic,
    ):
        if max_keys < 3:
            raise ValueError("max_keys must reserve two anonymous buckets and one subject")
        self.max_keys = max_keys
        self.per_subject = per_subject
        # 20/min permits normal retries for a small household while bounding the shared
        # garbage budget; it is not a pre-verification or per-client resource limit.
        self.anonymous_limit = anonymous_limit
        self.window = window
        self.clock = clock
        # Reserve both anonymous keys: garbage never displaces an active subject.
        self.anonymous: dict[str, deque[float]] = {"exchange": deque(), "challenge": deque()}
        self.subjects: OrderedDict[str, deque[float]] = OrderedDict()
        self.lock = Lock()

    def check(self, subject: str | None, *, anonymous_bucket: str = "exchange") -> None:
        with self.lock:
            now = self.clock()
            cutoff = now - self.window
            # Last accepted request orders the subject keys, so expired keys are at the front.
            while self.subjects:
                oldest = next(iter(self.subjects))
                if self.subjects[oldest][-1] > cutoff:
                    break
                self.subjects.popitem(last=False)

            if subject is None:
                events = self.anonymous.get(anonymous_bucket)
                if events is None:
                    self._reject()
                limit = self.anonymous_limit
            else:
                events = self.subjects.get(subject)
                if events is None:
                    if len(self.subjects) >= self.max_keys - len(self.anonymous):
                        # New verified identities may replace the least recently active identity.
                        self.subjects.popitem(last=False)
                    events = deque()
                    self.subjects[subject] = events
                limit = self.per_subject

            while events and events[0] <= cutoff:
                events.popleft()
            if len(events) >= limit:
                self._reject()
            events.append(now)
            if subject is not None:
                self.subjects.move_to_end(subject)

    @staticmethod
    def _reject() -> NoReturn:
        raise AppException("APPLE_RATE_LIMITED", "Please try Apple sign-in again later", 429)


apple_limiter = AppleRateLimiter()


def authenticated_subject(request: Request) -> str | None:
    scheme, _, token = request.headers.get("Authorization", "").partition(" ")
    if scheme.lower() != "bearer" or not token:
        return None
    user_id = AuthService().decode_token(token)
    return f"user:{user_id}" if user_id is not None else None


def throttle_apple(request: Request) -> None:
    apple_limiter.check(authenticated_subject(request), anonymous_bucket="challenge")
