"""Exercise the Apple throttle through Uvicorn's proxy-header middleware."""

import pytest
from httpx import ASGITransport, AsyncClient
from uvicorn import Config
from uvicorn.middleware.proxy_headers import ProxyHeadersMiddleware

from app.core.apple_throttle import AppleRateLimiter
from app.main import app

APPLE_PATH = "/api/v1/auth/apple"
CLIENT_A = "192.0.2.10"
CLIENT_B = "192.0.2.11"


def api_transport(monkeypatch: pytest.MonkeyPatch, *, trust: str, peer: str) -> ASGITransport:
    monkeypatch.setenv("FORWARDED_ALLOW_IPS", trust)
    monkeypatch.setattr("app.core.apple_throttle.apple_limiter", AppleRateLimiter(per_ip=1))
    config = Config(app, log_config=None, proxy_headers=True, ws="none")
    config.load()
    assert isinstance(config.loaded_app, ProxyHeadersMiddleware)
    return ASGITransport(app=config.loaded_app, client=(peer, 43123))


@pytest.mark.parametrize("gateway_peer", ["172.31.255.242", "127.0.0.1"])
@pytest.mark.asyncio
async def test_trusted_gateway_keeps_each_lan_client_in_its_own_bucket(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch, gateway_peer: str
) -> None:
    transport = api_transport(monkeypatch, trust=gateway_peer, peer=gateway_peer)
    async with AsyncClient(transport=transport, base_url=client.base_url) as proxied:
        first_client = {"X-Forwarded-For": CLIENT_A}
        first = await proxied.post(APPLE_PATH + "/challenge", headers=first_client)
        blocked = await proxied.post(
            APPLE_PATH, headers=first_client, json={"identity_token": "invalid"}
        )
        second = await proxied.post(
            APPLE_PATH + "/challenge", headers={"X-Forwarded-For": CLIENT_B}
        )

    assert first.status_code == 200
    assert blocked.status_code == 429
    assert second.status_code == 200


@pytest.mark.parametrize(
    ("trust", "peer"),
    [("172.31.255.242", "172.31.255.243"), ("127.0.0.1", CLIENT_A), ("", "127.0.0.1")],
)
@pytest.mark.asyncio
async def test_untrusted_peer_cannot_choose_an_apple_throttle_bucket(
    client: AsyncClient, monkeypatch: pytest.MonkeyPatch, trust: str, peer: str
) -> None:
    transport = api_transport(monkeypatch, trust=trust, peer=peer)
    async with AsyncClient(transport=transport, base_url=client.base_url) as direct:
        first = await direct.post(APPLE_PATH + "/challenge", headers={"X-Forwarded-For": CLIENT_A})
        blocked = await direct.post(
            APPLE_PATH + "/challenge",
            headers={
                "X-Forwarded-For": CLIENT_B,
                "X-Real-IP": CLIENT_B,
                "Forwarded": f"for={CLIENT_B}",
            },
        )

    assert first.status_code == 200
    assert blocked.status_code == 429
