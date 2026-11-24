"""Issue opaque one-time challenges for native Apple sign-in."""

from secrets import token_urlsafe

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.apple_auth import InvalidAppleCredentialsError
from app.repositories.apple_challenge import AppleChallengeRepository
from app.schemas.user import AppleChallengeResponse


class AppleChallengeService:
    def __init__(self, session: AsyncSession):
        self.repo = AppleChallengeRepository(session)

    async def issue(self) -> AppleChallengeResponse:
        nonce = token_urlsafe(32)
        await self.repo.issue(nonce)
        return AppleChallengeResponse(nonce=nonce, expires_in=300)

    async def consume(self, nonce: str | None) -> None:
        if not nonce or not await self.repo.consume(nonce):
            raise InvalidAppleCredentialsError()
