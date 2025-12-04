"""Unit tests for AuthService."""

from datetime import timedelta

import pytest

from app.services.auth import AuthService


class TestAuthService:
    """Test suite for AuthService."""

    def test_hash_password(self, auth_service: AuthService) -> None:
        """Test password hashing produces valid bcrypt hash."""
        password = "my_secure_password"
        hashed = auth_service.hash_password(password)

        # Bcrypt hashes start with $2b$ and are at least 60 characters
        assert hashed.startswith("$2b$")
        assert len(hashed) >= 60
        # Different from plain password
        assert hashed != password

    def test_hash_password_different_salts(self, auth_service: AuthService) -> None:
        """Test that same password produces different hashes (due to salt)."""
        password = "same_password"
        hash1 = auth_service.hash_password(password)
        hash2 = auth_service.hash_password(password)

        # Same password should produce different hashes
        assert hash1 != hash2

    def test_verify_password_correct(self, auth_service: AuthService) -> None:
        """Test password verification with correct password."""
        password = "correct_password"
        hashed = auth_service.hash_password(password)

        # Correct password should verify
        assert auth_service.verify_password(password, hashed) is True

    def test_verify_password_incorrect(self, auth_service: AuthService) -> None:
        """Test password verification with incorrect password."""
        password = "correct_password"
        hashed = auth_service.hash_password(password)

        # Wrong password should not verify
        assert auth_service.verify_password("wrong_password", hashed) is False

    def test_verify_password_case_sensitive(self, auth_service: AuthService) -> None:
        """Test password verification is case-sensitive."""
        password = "CaseSensitive"
        hashed = auth_service.hash_password(password)

        # Different case should not verify
        assert auth_service.verify_password("casesensitive", hashed) is False
        assert auth_service.verify_password("CASESENSITIVE", hashed) is False

    def test_create_access_token_default_expiry(self, auth_service: AuthService) -> None:
        """Test JWT token creation with default expiry."""
        user_id = 42
        token = auth_service.create_access_token(user_id=user_id)

        # Token should be a non-empty string
        assert isinstance(token, str)
        assert len(token) > 0
        # JWT tokens have 3 parts separated by dots
        assert token.count(".") == 2

    def test_create_access_token_custom_expiry(self, auth_service: AuthService) -> None:
        """Test JWT token creation with custom expiry."""
        user_id = 42
        custom_expiry = timedelta(hours=1)
        token = auth_service.create_access_token(
            user_id=user_id, expires_delta=custom_expiry
        )

        # Token should be valid
        assert isinstance(token, str)
        assert len(token) > 0

    def test_decode_token_valid(self, auth_service: AuthService) -> None:
        """Test decoding valid JWT token returns correct user_id."""
        user_id = 42
        token = auth_service.create_access_token(user_id=user_id)

        # Decode should return original user_id
        decoded_user_id = auth_service.decode_token(token)
        assert decoded_user_id == user_id

    def test_decode_token_invalid_signature(self, auth_service: AuthService) -> None:
        """Test decoding token with invalid signature returns None."""
        user_id = 42
        token = auth_service.create_access_token(user_id=user_id)

        # Tamper with token (change last character)
        tampered_token = token[:-1] + ("A" if token[-1] != "A" else "B")

        # Should return None for invalid signature
        assert auth_service.decode_token(tampered_token) is None

    def test_decode_token_malformed(self, auth_service: AuthService) -> None:
        """Test decoding malformed token returns None."""
        malformed_tokens = [
            "not.a.jwt",
            "invalid",
            "",
            "only.two",
        ]

        for token in malformed_tokens:
            assert auth_service.decode_token(token) is None

    def test_decode_token_expired(self, auth_service: AuthService) -> None:
        """Test decoding expired token returns None."""
        user_id = 42
        # Create token that expires immediately
        token = auth_service.create_access_token(
            user_id=user_id, expires_delta=timedelta(seconds=-1)
        )

        # Should return None for expired token
        assert auth_service.decode_token(token) is None

    def test_decode_token_missing_subject(self, auth_service: AuthService) -> None:
        """Test decoding token without 'sub' claim returns None."""
        from datetime import datetime, timezone

        from jose import jwt

        # Create token without 'sub' claim
        expire = datetime.now(timezone.utc) + auth_service.default_expiry
        payload = {"exp": expire}
        token = jwt.encode(payload, auth_service.secret_key, algorithm=auth_service.algorithm)

        # Should return None for missing subject
        assert auth_service.decode_token(token) is None

    def test_token_contains_correct_claims(self, auth_service: AuthService) -> None:
        """Test JWT token contains expected claims (sub, exp, iat)."""
        from jose import jwt

        user_id = 42
        token = auth_service.create_access_token(user_id=user_id)

        # Decode without verification to check claims
        payload = jwt.decode(
            token, auth_service.secret_key, algorithms=[auth_service.algorithm]
        )

        # Should contain sub (user_id as string)
        assert "sub" in payload
        assert payload["sub"] == str(user_id)

        # Should contain exp (expiration timestamp)
        assert "exp" in payload
        assert isinstance(payload["exp"], int)

        # Should contain iat (issued at timestamp)
        assert "iat" in payload
        assert isinstance(payload["iat"], int)

    def test_different_users_different_tokens(self, auth_service: AuthService) -> None:
        """Test different user IDs produce different tokens."""
        token1 = auth_service.create_access_token(user_id=1)
        token2 = auth_service.create_access_token(user_id=2)

        # Tokens should be different
        assert token1 != token2

        # Should decode to correct user IDs
        assert auth_service.decode_token(token1) == 1
        assert auth_service.decode_token(token2) == 2

    def test_password_hash_empty_string(self, auth_service: AuthService) -> None:
        """Test hashing empty password (edge case)."""
        hashed = auth_service.hash_password("")

        # Should still produce valid hash
        assert hashed.startswith("$2b$")
        # Should verify correctly
        assert auth_service.verify_password("", hashed) is True

    def test_verify_password_empty_hash(self, auth_service: AuthService) -> None:
        """Test verify with invalid empty hash returns False."""
        # Empty hash should not verify
        result = auth_service.verify_password("password", "")
        # passlib returns False for invalid hashes
        assert result is False
