"""Verify native Sign in with Apple identity tokens using Apple's public keys."""

from asyncio import Lock
from collections.abc import Callable
from dataclasses import dataclass
from hashlib import sha256
from hmac import compare_digest
from time import monotonic, time
from typing import TypeGuard

import httpx
from jose import JOSEError, jwk, jwt
from jose.backends.base import Key

from app.core.exceptions import AppException, UnauthorizedError

APPLE_ISSUER = "https://appleid.apple.com"
APPLE_JWKS_URL = f"{APPLE_ISSUER}/auth/keys"
APPLE_AUDIENCE = "dev.familygifting.app"
APPLE_ALGORITHM = "RS256"
JWKS_TTL_SECONDS = 3600
JWKS_REFRESH_COOLDOWN_SECONDS = 10


class InvalidAppleCredentialsError(UnauthorizedError):
    def __init__(self) -> None:
        super().__init__("INVALID_APPLE_CREDENTIALS", "Apple sign-in could not be verified")


class AppleNotHouseholdError(AppException):
    def __init__(self) -> None:
        super().__init__("APPLE_NOT_HOUSEHOLD", "This Apple ID is not on the family list", 403)


class AppleKeysUnavailableError(AppException):
    def __init__(self) -> None:
        super().__init__("APPLE_KEYS_UNAVAILABLE", "Apple sign-in is temporarily unavailable", 503)


@dataclass(frozen=True)
class AppleIdentity:
    subject: str
    verified_email: str | None


class AppleTokenVerifier:
    """Cache Apple signing keys and serialize refreshes within this process."""

    def __init__(
        self,
        *,
        transport: httpx.AsyncBaseTransport | None = None,
        clock: Callable[[], float] = monotonic,
    ) -> None:
        self._transport = transport
        self._clock = clock
        self._keys: dict[str, Key] = {}
        self._expires_at = float("-inf")
        self._refresh_after = float("-inf")
        self._lock = Lock()

    async def verify(
        self,
        identity_token: str,
        nonce: str | None,
        *,
        on_subject: Callable[[str], None] | None = None,
    ) -> AppleIdentity:
        try:
            header = jwt.get_unverified_header(identity_token)
            kid = header.get("kid")
            if (
                header.get("alg") != APPLE_ALGORITHM
                or not isinstance(kid, str)
                or not 0 < len(kid) <= 255
                or "jku" in header
                or "x5u" in header
            ):
                raise InvalidAppleCredentialsError()

            key = await self._get_key(kid)
            claims = jwt.decode(
                identity_token,
                key,
                algorithms=[APPLE_ALGORITHM],
                issuer=APPLE_ISSUER,
                audience=APPLE_AUDIENCE,
                options={
                    "require_iss": True,
                    "require_aud": True,
                    "require_exp": True,
                    "require_sub": True,
                    "verify_at_hash": False,
                },
            )
        except (JOSEError, ValueError, TypeError, OverflowError) as exc:
            raise InvalidAppleCredentialsError() from exc

        now = time()
        subject = claims["sub"]
        expiry = claims["exp"]
        issued_at = claims.get("iat")
        if (
            claims["aud"] != APPLE_AUDIENCE
            or type(expiry) is not int
            or expiry <= now
            or ("iat" in claims and (type(issued_at) is not int or issued_at > now + 60))
            or not subject.strip()
            or len(subject) > 255
            or not subject.isprintable()
        ):
            raise InvalidAppleCredentialsError()

        if on_subject is not None:
            on_subject(subject)

        token_nonce = claims.get("nonce")
        if not nonce or (
            not isinstance(token_nonce, str)
            or not compare_digest(
                token_nonce.encode("utf-8", errors="surrogatepass"),
                sha256(nonce.encode("utf-8")).hexdigest().encode("ascii"),
            )
        ):
            raise InvalidAppleCredentialsError()

        if "email" not in claims:
            return AppleIdentity(subject, None)

        email = claims["email"]
        verified = claims.get("email_verified")
        if (verified is not True and verified != "true") or not _is_email(email):
            raise InvalidAppleCredentialsError()
        return AppleIdentity(subject, email)

    async def _get_key(self, kid: str) -> Key:
        async with self._lock:
            now = self._clock()
            expired = now >= self._expires_at
            if (expired or kid not in self._keys) and now >= self._refresh_after:
                try:
                    await self._refresh_keys()
                except AppleKeysUnavailableError:
                    self._refresh_after = self._clock() + JWKS_REFRESH_COOLDOWN_SECONDS
                    raise
                if not expired or kid not in self._keys:
                    self._refresh_after = self._clock() + JWKS_REFRESH_COOLDOWN_SECONDS

            if self._clock() >= self._expires_at:
                raise AppleKeysUnavailableError()
            key = self._keys.get(kid)
            if key is None:
                raise InvalidAppleCredentialsError()
            return key

    async def _refresh_keys(self) -> None:
        try:
            async with httpx.AsyncClient(
                timeout=5.0, follow_redirects=False, transport=self._transport
            ) as client:
                response = await client.get(APPLE_JWKS_URL)
                response.raise_for_status()
                payload = response.json()
        except (httpx.HTTPError, ValueError) as exc:
            raise AppleKeysUnavailableError() from exc

        if not isinstance(payload, dict) or not isinstance(payload.get("keys"), list):
            raise AppleKeysUnavailableError()

        keys: dict[str, Key] = {}
        for raw in payload["keys"]:
            if not isinstance(raw, dict):
                continue
            kid = raw.get("kid")
            if (
                not isinstance(kid, str)
                or not kid
                or raw.get("kty") != "RSA"
                or raw.get("alg") != APPLE_ALGORITHM
                or raw.get("use") != "sig"
                or not isinstance(raw.get("n"), str)
                or not isinstance(raw.get("e"), str)
            ):
                continue
            try:
                key = jwk.construct(
                    {"kty": "RSA", "n": raw["n"], "e": raw["e"]}, algorithm=APPLE_ALGORITHM
                )
            except (JOSEError, ValueError, TypeError, OverflowError):
                continue
            if kid in keys:
                raise AppleKeysUnavailableError()
            keys[kid] = key

        if not keys:
            raise AppleKeysUnavailableError()
        self._keys = keys
        self._expires_at = self._clock() + JWKS_TTL_SECONDS


def _is_email(email: object) -> TypeGuard[str]:
    if not isinstance(email, str) or len(email.lower()) > 320 or not email.isprintable():
        return False
    local, separator, domain = email.partition("@")
    return bool(local and separator and domain and "@" not in domain) and not any(
        character.isspace() for character in email
    )


_verifier = AppleTokenVerifier()


def get_apple_token_verifier() -> AppleTokenVerifier:
    return _verifier
