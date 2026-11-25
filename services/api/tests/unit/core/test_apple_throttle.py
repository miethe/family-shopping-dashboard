"""Check limiter capacity and isolation under a subject flood."""

import pytest

from app.core.apple_throttle import AppleRateLimiter
from app.core.exceptions import AppException


def test_capacity_evicts_oldest_verified_but_never_for_garbage() -> None:
    limiter = AppleRateLimiter(per_subject=1, anonymous_limit=1, max_keys=5)
    for subject in ("apple:a", "apple:b", "apple:c"):
        limiter.check(subject)
    limiter.check(None)
    with pytest.raises(AppException):
        limiter.check(None, anonymous_bucket="unrecognized")
    with pytest.raises(AppException):
        limiter.check(None)
    assert list(limiter.subjects) == ["apple:a", "apple:b", "apple:c"]
    with pytest.raises(AppException):
        limiter.check("apple:a")
    limiter.check("apple:d")
    assert list(limiter.subjects) == ["apple:b", "apple:c", "apple:d"]
    for index in range(10000):
        limiter.check(f"apple:flood-{index}")
        assert len(limiter.subjects) + len(limiter.anonymous) <= limiter.max_keys


def test_expired_subjects_are_reclaimed_before_active_subjects() -> None:
    now = [0.0]
    limiter = AppleRateLimiter(max_keys=4, window=60, clock=lambda: now[0])
    limiter.check("apple:old")
    now[0] = 30
    limiter.check("apple:active")
    now[0] = 61
    limiter.check("apple:new")
    assert list(limiter.subjects) == ["apple:active", "apple:new"]
