from datetime import date, timedelta
import pytest


@pytest.mark.asyncio
async def test_catalog_and_linked_theme(client, auth_headers):
    today = date.today()
    data = {"name": "Celebration", "key": "celebration", "month": today.month,
            "day": today.day, "is_major": True, "theme_key": "celebration", "theme_window_days": 45}
    created = await client.post("/api/v1/holidays", json=data, headers=auth_headers)
    assert created.status_code == 201
    item = created.json()
    assert item["next_date"] == today.isoformat() and item["days_until"] == 0
    assert (await client.get("/api/v1/holidays/active-theme", headers=auth_headers)).json() == {"theme_key": None}
    occasion = await client.post("/api/v1/occasions", headers=auth_headers,
        json={"name": "Celebration", "type": "holiday", "date": today.isoformat(), "holiday_id": item["id"]})
    assert occasion.status_code == 201 and occasion.json()["holiday_id"] == item["id"]
    assert (await client.get("/api/v1/holidays/active-theme", headers=auth_headers)).json() == {"theme_key": "celebration"}
    data.pop("key")
    data["name"] = "Celebration edited"
    edited = await client.put(f"/api/v1/holidays/{item['id']}", json=data, headers=auth_headers)
    assert edited.status_code == 200 and edited.json()["key"] == "celebration"
    assert (await client.get("/api/v1/holidays", headers=auth_headers)).json()[0]["name"] == "Celebration edited"
    assert (await client.get("/api/v1/holidays")).status_code in (401, 403)
