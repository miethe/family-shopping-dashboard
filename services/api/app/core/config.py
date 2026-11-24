"""Application configuration using Pydantic Settings."""

from pydantic_settings import BaseSettings, SettingsConfigDict


def _parse_household_emails(value: str) -> frozenset[str]:
    return frozenset(email.strip().lower() for email in value.split(",") if email.strip())


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    DATABASE_URL: str = "postgresql+psycopg://postgres:postgres@localhost:5432/family_gifting"
    APPLE_HOUSEHOLD_EMAILS: str = ""
    HOUSEHOLD_EMAILS: str = ""

    @property
    def apple_household_emails(self) -> frozenset[str]:
        return _parse_household_emails(self.APPLE_HOUSEHOLD_EMAILS) or _parse_household_emails(
            self.HOUSEHOLD_EMAILS
        )

    API_PORT: int = 8000
    DEBUG: bool = False
    JWT_SECRET_KEY: str = "dev-secret-key-change-in-production"
    CORS_ORIGINS: str = "http://localhost:3000"
    UPLOAD_DIR: str = "/tmp/uploads"
    MAX_UPLOAD_MB: int = 10
    CDN_BASE_URL: str | None = None
    PUBLIC_API_URL: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")


settings = Settings()
