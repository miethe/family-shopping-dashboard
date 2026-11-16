"""Event history, count/money math, phase corrections and privacy contracts."""

import pytest

from app.models.list import ListVisibility

BASE = "/api/v1/gifting"


async def occurrence(client, headers, occasion_id, date="2026-12-25"):
    response = await client.post(
        f"{BASE}/occurrences",
        headers=headers,
        json={"occasion_id": occasion_id, "date": date, "budget_total": "100.00"},
    )
    assert response.status_code == 201, response.text
    return response.json()


@pytest.mark.asyncio
async def test_allowances_phases_history_and_rollups(
    client, auth_headers, test_occasion, test_person, test_gift
):
    current = await occurrence(client, auth_headers, test_occasion.id)
    following = await occurrence(client, auth_headers, test_occasion.id, "2027-12-25")
    path = f"{BASE}/occurrences/{current['id']}"
    response = await client.put(
        f"{path}/people/{test_person.id}",
        headers=auth_headers,
        json={"money_allowance": "50.00", "count_allowance": 2},
    )
    envelope = response.json()["envelopes"][0]
    assert envelope["remaining_count"] == 2
    response = await client.post(
        f"{BASE}/envelopes/{envelope['id']}/gifts",
        headers=auth_headers,
        json={"gift_id": test_gift.id, "quantity": 3, "unit_price": "20.00"},
    )
    assert response.status_code == 201, response.text
    placement = response.json()["placement_id"]
    for phase in ["bought", "in_hand", "given", "considering", "given"]:
        assert (
            await client.patch(
                f"{BASE}/gifts/{placement}", headers=auth_headers, json={"phase": phase}
            )
        ).status_code == 200
    data = (await client.get(path, headers=auth_headers)).json()
    assert data["spent"] == "60.00"
    assert data["envelopes"][0]["remaining_money"] == "-10.00"
    assert data["envelopes"][0]["remaining_count"] == -1
    assert data["phases"]["given"] == 3
    assert (await client.get(f"{BASE}/occurrences/{following['id']}", headers=auth_headers)).json()[
        "spent"
    ] == "0"
    rollup = (await client.get(f"{BASE}/budgets?year=2026", headers=auth_headers)).json()
    assert rollup["spent"] == "60.00"
    assert len(rollup["events"][0]["occurrences"]) == 1
    assert rollup["allocated"] == "50.00"
    person = (await client.get(f"{BASE}/people/{test_person.id}", headers=auth_headers)).json()
    assert person["past_gifts"][0]["phase"] == "given"
    assert (await client.patch(path, headers=auth_headers, json={"closed": True})).json()[
        "closed"
    ] is True


@pytest.mark.asyncio
async def test_validation_duplicates_missing_and_auth(
    client, auth_headers, test_occasion, test_person, test_gift
):
    person_id, gift_id, occasion_id = test_person.id, test_gift.id, test_occasion.id
    assert (await client.get(f"{BASE}/occurrences")).status_code in (401, 403)
    current = await occurrence(client, auth_headers, occasion_id)
    assert (
        await client.post(
            f"{BASE}/occurrences",
            headers=auth_headers,
            json={"occasion_id": occasion_id, "date": "2026-12-25"},
        )
    ).status_code == 409
    path = f"{BASE}/occurrences/{current['id']}/people/{person_id}"
    assert (
        await client.put(path, headers=auth_headers, json={"count_allowance": -1})
    ).status_code == 422
    assert (
        await client.put(path, headers=auth_headers, json={"money_allowance": -1})
    ).status_code == 422
    assert (
        await client.put(
            f"{BASE}/occurrences/99999/people/{person_id}", headers=auth_headers, json={}
        )
    ).status_code == 404
    response = await client.put(
        path, headers=auth_headers, json={"money_allowance": 0, "count_allowance": 0}
    )
    envelope = response.json()["envelopes"][0]
    assert envelope["remaining_money"] == "0.00"
    assert envelope["remaining_count"] == 0
    assert (await client.put(path, headers=auth_headers, json={})).json()["envelopes"][0][
        "remaining_count"
    ] is None
    gift_path = f"{BASE}/envelopes/{envelope['id']}/gifts"
    assert (
        await client.post(gift_path, headers=auth_headers, json={"gift_id": gift_id})
    ).status_code == 201
    assert (
        await client.post(gift_path, headers=auth_headers, json={"gift_id": gift_id})
    ).status_code == 409
    assert (
        await client.patch(f"{BASE}/gifts/99999", headers=auth_headers, json={"phase": "given"})
    ).status_code == 404
    assert (
        await client.patch(f"{BASE}/gifts/1", headers=auth_headers, json={"phase": "received"})
    ).status_code == 422


@pytest.mark.asyncio
async def test_capture_person_and_unknown_prices(client, auth_headers, test_person, test_occasion):
    current = await occurrence(client, auth_headers, test_occasion.id)
    payload = {
        "name": "Demo telescope",
        "url": "https://example.com/telescope",
        "person_id": test_person.id,
        "occurrence_id": current["id"],
    }
    response = await client.post(f"{BASE}/ideas", headers=auth_headers, json=payload)
    assert response.status_code == 201, response.text
    person = (await client.get(f"{BASE}/people/{test_person.id}", headers=auth_headers)).json()
    assert person["ideas"][0]["url"] == payload["url"]
    wish = await client.post(
        f"{BASE}/ideas",
        headers=auth_headers,
        json={"name": "Demo wishlist book", "person_id": test_person.id, "kind": "wishlist"},
    )
    assert wish.status_code == 201
    saved = (await client.get(f"{BASE}/ideas", headers=auth_headers)).json()
    assert any(g["id"] == wish.json()["id"] for g in saved)

    data = (await client.get(f"{BASE}/occurrences/{current['id']}", headers=auth_headers)).json()
    assert data["unknown_prices"] == 1
    assert data["spent"] == "0"
    assert data["envelopes"][0]["remaining_money"] is None
    assert (
        await client.post(f"{BASE}/ideas", headers=auth_headers, json={"name": "   "})
    ).status_code == 400
    assert (
        await client.post(
            f"{BASE}/ideas",
            headers=auth_headers,
            json={"name": "Demo", "url": "javascript:alert(1)"},
        )
    ).status_code == 422
    assert (
        await client.post(
            f"{BASE}/ideas",
            headers=auth_headers,
            json={"name": "Demo", "occurrence_id": current["id"]},
        )
    ).status_code == 400
    assert (
        await client.post(f"{BASE}/ideas", headers=auth_headers, json={"name": "Floating demo"})
    ).status_code == 201
    assert (await client.get(f"{BASE}/ideas", headers=auth_headers)).json()[0][
        "name"
    ] == "Floating demo"


@pytest.mark.asyncio
async def test_private_wishlist_hidden_from_other_user(
    client, auth_headers, test_list, test_list_item, test_person, async_session
):
    test_list.visibility = ListVisibility.private
    test_list.user_id = 99999
    await async_session.commit()
    person = (await client.get(f"{BASE}/people/{test_person.id}", headers=auth_headers)).json()
    assert person["wishlist"] == []
