"""Exercise native Apple sign-in with locally generated keys and stubbed JWKS."""

import asyncio
from collections.abc import Iterator
from dataclasses import dataclass, field
from pathlib import Path
from typing import Any

import httpx
import pytest
from cryptography.hazmat.primitives.asymmetric import rsa
from httpx import AsyncClient
from jose import jwt
from jose.utils import long_to_base64
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.apple_auth import JWKS_TTL_SECONDS, AppleTokenVerifier, get_apple_token_verifier
from app.main import app
from app.models.base import BaseModel
from app.models.list import List
from app.models.user import UNUSABLE_PASSWORD_HASH, User
from app.repositories.user import UserRepository

APPLE_PATH = "/api/v1/auth/apple"
PASSWORD_PATH = "/api/v1/auth/login"


@dataclass
class AppleProvider:
    private_keys: dict[str, rsa.RSAPrivateKey]
    requests: list[str] = field(default_factory=list)
    published: tuple[str, ...] = ("original",)
    status: int = 200
    clock: float = 0

    def respond(self, request: httpx.Request) -> httpx.Response:
        assert request.method == "GET"
        self.requests.append(str(request.url))
        assert str(request.url) == "https://appleid.apple.com/auth/keys"
        if self.status == 302:
            return httpx.Response(302, headers={"location": "https://keys.example.invalid/"})
        public_keys = []
        for kid in self.published:
            if kid == "malformed":
                public_keys.append(
                    {"kid": kid, "kty": "RSA", "alg": "RS256", "use": "sig", "n": "_", "e": "_"}
                )
                continue
            key = self.private_keys[kid].public_key().public_numbers()
            public_keys.append(
                {
                    "kid": kid,
                    "kty": "RSA",
                    "alg": "RS256",
                    "use": "sig",
                    "n": long_to_base64(key.n).decode(),
                    "e": long_to_base64(key.e).decode(),
                }
            )
        return httpx.Response(self.status, json={"keys": public_keys})

    def token(
        self,
        *,
        signing_key: str = "original",
        kid: str | None = None,
        headers: dict[str, str] | None = None,
        **claims: Any,
    ) -> str:
        payload = {
            "iss": "https://appleid.apple.com",
            "aud": "dev.familygifting.app",
            "exp": 4_102_444_800,
            "sub": "synthetic-apple-subject",
            "email": "new@example.com",
            "email_verified": True,
        } | claims
        payload = {name: value for name, value in payload.items() if value is not None}
        return jwt.encode(
            payload,
            self.private_keys[signing_key],
            algorithm="RS256",
            headers={"kid": signing_key if kid is None else kid} | (headers or {}),
        )


@pytest.fixture(scope="session")
def rsa_keys() -> dict[str, rsa.RSAPrivateKey]:
    return {
        kid: rsa.generate_private_key(public_exponent=65537, key_size=2048)
        for kid in ("original", "rotated")
    }


@pytest.fixture
def apple(rsa_keys: dict[str, rsa.RSAPrivateKey]) -> Iterator[AppleProvider]:
    provider = AppleProvider(rsa_keys)
    verifier = AppleTokenVerifier(
        transport=httpx.MockTransport(provider.respond), clock=lambda: provider.clock
    )
    app.dependency_overrides[get_apple_token_verifier] = lambda: verifier
    yield provider
    app.dependency_overrides.pop(get_apple_token_verifier, None)


@pytest.mark.asyncio
async def test_apple_links_existing_account_and_keeps_password_and_data(
    client: AsyncClient, test_user: User, test_list: List, apple: AppleProvider
) -> None:
    password_login = await client.post(
        PASSWORD_PATH, json={"email": test_user.email, "password": "password123"}
    )
    result = await client.post(
        APPLE_PATH,
        json={
            "identity_token": apple.token(email=test_user.email.upper(), nonce="challenge"),
            "nonce": "challenge",
        },
    )
    assert result.status_code == 200, result.text
    body = result.json()
    assert body.keys() == password_login.json().keys()
    assert body["token"].keys() == password_login.json()["token"].keys()
    assert body["id"] == test_user.id == test_list.user_id
    assert body["email"] == test_user.email
    assert body["token"]["expires_in"] == 86_400
    assert body["token"]["token_type"] == "bearer"

    bearer = body["token"]["access_token"]
    headers = {"Authorization": f"Bearer {bearer}"}
    me = await client.get("/api/v1/auth/me", headers=headers)
    assert me.status_code == 200
    assert me.json()["id"] == test_user.id
    owned_list = await client.get(f"/api/v1/lists/{test_list.id}", headers=headers)
    assert owned_list.status_code == 200

    for email in ("changed@example.com", None):
        token = apple.token(email=email, email_verified=True if email is not None else None)
        returning = await client.post(APPLE_PATH, json={"identity_token": token})
        assert returning.status_code == 200
        assert returning.json()["id"] == test_user.id
        assert returning.json()["email"] == test_user.email

    assert (
        await client.post(PASSWORD_PATH, json={"email": test_user.email, "password": "password123"})
    ).status_code == 200
    assert len(apple.requests) == 1


@pytest.mark.parametrize(
    "email,verified",
    [
        ("new@example.com", False),
        ("new@example.com", "false"),
        ("new@example.com", 0),
        ("new@example.com", ""),
        ("new@example.com", None),
        ("invalid-email", True),
    ],
)
@pytest.mark.asyncio
async def test_apple_rejects_unverified_or_invalid_email_for_bound_subject(
    client: AsyncClient, apple: AppleProvider, email: str, verified: object
) -> None:
    first_sign_in = await client.post(APPLE_PATH, json={"identity_token": apple.token()})
    assert first_sign_in.status_code == 200

    token = apple.token(email=email, email_verified=verified)
    response = await client.post(APPLE_PATH, json={"identity_token": token})
    assert response.status_code == 401
    assert response.json()["error"]["code"] == "INVALID_APPLE_CREDENTIALS"


@pytest.mark.asyncio
async def test_apple_creates_an_account_with_a_disabled_password(
    client: AsyncClient, async_session: AsyncSession, apple: AppleProvider
) -> None:
    result = await client.post(
        APPLE_PATH, json={"identity_token": apple.token(email_verified="true")}
    )
    assert result.status_code == 200, result.text
    body = result.json()
    assert body["email"] == "new@example.com"
    user = await async_session.get(User, body["id"])
    assert user is not None
    assert user.apple_subject == "synthetic-apple-subject"
    assert user.password_hash == UNUSABLE_PASSWORD_HASH

    password = await client.post(
        PASSWORD_PATH, json={"email": body["email"], "password": UNUSABLE_PASSWORD_HASH}
    )
    assert password.status_code == 401
    conflict = await client.post(
        APPLE_PATH, json={"identity_token": apple.token(sub="another-apple-subject")}
    )
    assert conflict.status_code == 401
    assert len((await async_session.scalars(select(User.id))).all()) == 1


@pytest.mark.asyncio
async def test_apple_rejects_ambiguous_case_variant_emails(
    client: AsyncClient, async_session: AsyncSession, apple: AppleProvider
) -> None:
    async_session.add_all(
        [User(email=email, password_hash="!") for email in ("new@example.com", "NEW@example.com")]
    )
    await async_session.commit()

    response = await client.post(APPLE_PATH, json={"identity_token": apple.token()})
    assert response.status_code == 401
    assert (await async_session.scalars(select(User.apple_subject))).all() == [None, None]


@pytest.mark.parametrize(
    "claims,nonce",
    [
        ({"aud": "different.example.com"}, None),
        ({"aud": ["dev.familygifting.app", "different.example.com"]}, None),
        ({"iss": "https://issuer.example.com"}, None),
        ({"iss": None}, None),
        ({"exp": 1}, None),
        ({"exp": None}, None),
        ({"exp": []}, None),
        ({"iat": 4_102_444_700}, None),
        ({"sub": None}, None),
        ({"sub": ""}, None),
        ({"email_verified": False}, None),
        ({"email_verified": "false"}, None),
        ({"email_verified": None}, None),
        ({"email": None}, None),
        ({"nonce": "different"}, "expected"),
        ({}, "expected"),
    ],
)
@pytest.mark.asyncio
async def test_apple_rejects_invalid_claims_without_creating_a_user(
    client: AsyncClient,
    async_session: AsyncSession,
    apple: AppleProvider,
    claims: dict[str, Any],
    nonce: str | None,
) -> None:
    response = await client.post(
        APPLE_PATH, json={"identity_token": apple.token(**claims), "nonce": nonce}
    )
    assert response.status_code == 401, response.text
    assert response.json()["error"]["code"] == "INVALID_APPLE_CREDENTIALS"
    assert not (await async_session.scalars(select(User.id))).all()


@pytest.mark.asyncio
async def test_apple_rejects_wrong_algorithm_and_invalid_signature(
    client: AsyncClient, apple: AppleProvider
) -> None:
    signed_with_wrong_algorithm = jwt.encode({}, "synthetic-fixture", "HS256", {"kid": "original"})
    wrong_algorithm = await client.post(
        APPLE_PATH, json={"identity_token": signed_with_wrong_algorithm}
    )
    assert wrong_algorithm.status_code == 401
    assert not apple.requests

    bad_signature = apple.token(signing_key="rotated", kid="original")
    assert (
        await client.post(APPLE_PATH, json={"identity_token": bad_signature})
    ).status_code == 401
    assert len(apple.requests) == 1


@pytest.mark.parametrize("header", ["jku", "x5u"])
@pytest.mark.asyncio
async def test_apple_rejects_token_controlled_key_urls(
    client: AsyncClient, apple: AppleProvider, header: str
) -> None:
    token = apple.token(headers={header: "https://keys.example.invalid/"})
    response = await client.post(APPLE_PATH, json={"identity_token": token})
    assert response.status_code == 401
    assert not apple.requests


@pytest.mark.asyncio
async def test_jwks_refreshes_cache_on_rotation_and_expires_keys(
    client: AsyncClient, apple: AppleProvider
) -> None:
    async def login(kid: str) -> httpx.Response:
        return await client.post(APPLE_PATH, json={"identity_token": apple.token(signing_key=kid)})

    assert (await login("original")).status_code == 200
    assert (await login("original")).status_code == 200
    assert len(apple.requests) == 1
    apple.published = ("rotated",)
    assert (await login("rotated")).status_code == 200
    assert (await login("original")).status_code == 401
    assert len(apple.requests) == 2

    apple.clock += JWKS_TTL_SECONDS
    apple.status = 503
    assert (await login("rotated")).status_code == 503
    assert (await login("rotated")).status_code == 503
    assert len(apple.requests) == 3


@pytest.mark.asyncio
async def test_jwks_limits_unknown_key_refreshes(client: AsyncClient, apple: AppleProvider) -> None:
    assert (
        await client.post(APPLE_PATH, json={"identity_token": apple.token()})
    ).status_code == 200
    for kid in ("unknown-1", "unknown-2", "unknown-3"):
        response = await client.post(APPLE_PATH, json={"identity_token": apple.token(kid=kid)})
        assert response.status_code == 401
    assert len(apple.requests) == 2


@pytest.mark.parametrize("status", [200, 302, 503])
@pytest.mark.asyncio
async def test_apple_fails_closed_for_unusable_jwks(
    client: AsyncClient, apple: AppleProvider, status: int
) -> None:
    apple.published = ("malformed",)
    apple.status = status
    response = await client.post(APPLE_PATH, json={"identity_token": apple.token()})
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "APPLE_KEYS_UNAVAILABLE"
    assert len(apple.requests) == 1


@pytest.mark.parametrize("same_email", [True, False])
@pytest.mark.asyncio
async def test_concurrent_apple_creation_resolves_the_same_subject(
    tmp_path: Path, same_email: bool
) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'race.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(BaseModel.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    start_insert = asyncio.Barrier(2)

    class ConcurrentRepository(UserRepository):
        async def create(self, obj_in: dict[str, Any]) -> User:
            await start_insert.wait()
            return await super().create(obj_in)

    async def login(email: str) -> int:
        async with sessions() as session:
            user = await ConcurrentRepository(session).resolve_apple_user("same-subject", email)
            assert user is not None
            return user.id

    try:
        second_email = "NEW@example.com" if same_email else "changed@example.com"
        first_id, second_id = await asyncio.wait_for(
            asyncio.gather(login("new@example.com"), login(second_email)), timeout=15
        )
        async with sessions() as session:
            assert (await session.scalars(select(User.id))).all() == [first_id]
        assert first_id == second_id
    finally:
        await engine.dispose()


@pytest.mark.asyncio
async def test_concurrent_apple_link_cannot_replace_another_subject(tmp_path: Path) -> None:
    engine = create_async_engine(f"sqlite+aiosqlite:///{tmp_path / 'link.db'}")
    async with engine.begin() as connection:
        await connection.run_sync(BaseModel.metadata.create_all)
    sessions = async_sessionmaker(engine, expire_on_commit=False)
    async with sessions() as session:
        existing = await UserRepository(session).create(
            {"email": "existing@example.com", "password_hash": "!"}
        )
        existing_id = existing.id

    start = asyncio.Barrier(2)

    async def link(subject: str) -> int | None:
        async with sessions() as session:
            await start.wait()
            result = await UserRepository(session).resolve_apple_user(
                subject, "existing@example.com"
            )
            return result.id if result is not None else None

    try:
        results = await asyncio.gather(link("subject-a"), link("subject-b"))
        assert results.count(existing_id) == 1
        assert results.count(None) == 1
        async with sessions() as session:
            assert (await session.scalars(select(User.id))).all() == [existing_id]
            assert (await session.scalar(select(User.apple_subject))) in {"subject-a", "subject-b"}
    finally:
        await engine.dispose()
