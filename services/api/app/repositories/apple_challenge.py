"""Persist and atomically consume server-issued Apple challenges."""

from datetime import datetime, timedelta, timezone
from hashlib import sha256

from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.apple_challenge import AppleChallenge


class AppleChallengeRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def issue(self, nonce: str) -> None:
        now = datetime.now(timezone.utc)
        await self.session.execute(
            delete(AppleChallenge)
            .where(AppleChallenge.expires_at <= now)
            .execution_options(synchronize_session="fetch")
        )
        self.session.add(
            AppleChallenge(
                nonce_hash=sha256(nonce.encode()).hexdigest(),
                created_at=now,
                expires_at=now + timedelta(minutes=5),
            )
        )
        await self.session.commit()

    async def consume(self, nonce: str) -> bool:
        query = (
            delete(AppleChallenge)
            .where(
                AppleChallenge.nonce_hash == sha256(nonce.encode()).hexdigest(),
                AppleChallenge.expires_at > datetime.now(timezone.utc),
            )
            .returning(AppleChallenge.nonce_hash)
            .execution_options(synchronize_session="fetch")
        )
        consumed = (await self.session.execute(query)).scalar_one_or_none() is not None
        # Commit separately: account rejection/rollback must never resurrect the challenge.
        await self.session.commit()
        return consumed
