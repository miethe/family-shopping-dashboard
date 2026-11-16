"""Add event occurrence history without replacing catalog/list records.

Revision ID: f3a1_event_occurrences
Revises: c0f34d8e192a

Existing occasion dates become occurrences; recipient budgets are copied. Existing
lists/items remain untouched, including duplicate references and private lists.
A gift in multiple lists for one person is placed once using its furthest phase;
all original statuses/prices remain in list_items. received means in_hand, never
assumed given. Downgrade removes only the new occurrence feature's records.
"""

import sqlalchemy as sa

from alembic import op

revision = "f3a1_event_occurrences"
down_revision = "c0f34d8e192a"
branch_labels = None
depends_on = None


def timestamps():
    return [
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
    ]


def upgrade():
    op.create_table(
        "occurrences",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("occasion_id", sa.Integer(), sa.ForeignKey("occasions.id"), nullable=False),
        sa.Column("date", sa.Date(), nullable=False),
        sa.Column("budget_total", sa.Numeric(10, 2)),
        sa.Column("closed", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.UniqueConstraint("occasion_id", "date", name="uq_occurrence_date"),
        sa.CheckConstraint("budget_total >= 0", name="ck_occurrence_budget"),
        *timestamps(),
    )
    op.create_index("ix_occurrences_occasion_id", "occurrences", ["occasion_id"])
    op.create_table(
        "recipient_envelopes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("occurrence_id", sa.Integer(), sa.ForeignKey("occurrences.id"), nullable=False),
        sa.Column("person_id", sa.Integer(), sa.ForeignKey("persons.id"), nullable=False),
        sa.Column("money_allowance", sa.Numeric(10, 2)),
        sa.Column("count_allowance", sa.Integer()),
        sa.UniqueConstraint("occurrence_id", "person_id", name="uq_envelope_person"),
        sa.CheckConstraint("money_allowance >= 0", name="ck_envelope_money"),
        sa.CheckConstraint("count_allowance >= 0", name="ck_envelope_count"),
        *timestamps(),
    )
    for col in ("occurrence_id", "person_id"):
        op.create_index(f"ix_recipient_envelopes_{col}", "recipient_envelopes", [col])
    op.create_table(
        "occurrence_gifts",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "envelope_id", sa.Integer(), sa.ForeignKey("recipient_envelopes.id"), nullable=False
        ),
        sa.Column("gift_id", sa.Integer(), sa.ForeignKey("gifts.id"), nullable=False),
        sa.Column("phase", sa.String(20), nullable=False, server_default="considering"),
        sa.Column("quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("unit_price", sa.Numeric(10, 2)),
        sa.Column(
            "source_list_item_id", sa.Integer(), sa.ForeignKey("list_items.id", ondelete="SET NULL")
        ),
        sa.UniqueConstraint("envelope_id", "gift_id", name="uq_envelope_gift"),
        sa.CheckConstraint(
            "phase IN ('considering', 'bought', 'in_hand', 'given')", name="ck_occurrence_phase"
        ),
        sa.CheckConstraint("quantity > 0", name="ck_occurrence_quantity"),
        sa.CheckConstraint("unit_price >= 0", name="ck_occurrence_price"),
        *timestamps(),
    )
    for col in ("envelope_id", "gift_id"):
        op.create_index(f"ix_occurrence_gifts_{col}", "occurrence_gifts", [col])
    connection = op.get_bind()
    metadata = sa.MetaData()
    tables = {
        name: sa.Table(name, metadata, autoload_with=connection)
        for name in (
            "occasions",
            "person_occasions",
            "lists",
            "list_items",
            "gifts",
            "gift_people",
            "occurrences",
            "recipient_envelopes",
            "occurrence_gifts",
        )
    }
    occurrences = {}
    envelopes = {}
    for row in connection.execute(sa.select(tables["occasions"])).mappings():
        result = connection.execute(
            tables["occurrences"]
            .insert()
            .values(occasion_id=row["id"], date=row["date"], budget_total=row["budget_total"])
        )
        occurrences[row["id"]] = result.inserted_primary_key[0]
    for row in connection.execute(sa.select(tables["person_occasions"])).mappings():
        key = (occurrences[row["occasion_id"]], row["person_id"])
        result = connection.execute(
            tables["recipient_envelopes"]
            .insert()
            .values(
                occurrence_id=key[0],
                person_id=key[1],
                money_allowance=row["recipient_budget_total"],
            )
        )
        envelopes[key] = result.inserted_primary_key[0]
    lists = {r["id"]: r for r in connection.execute(sa.select(tables["lists"])).mappings()}
    gifts = {r["id"]: r for r in connection.execute(sa.select(tables["gifts"])).mappings()}
    recipients = {}
    for row in connection.execute(sa.select(tables["gift_people"])).mappings():
        if row["role"] == "recipient":
            recipients.setdefault(row["gift_id"], []).append(row["person_id"])
    phases = {
        "idea": "considering",
        "selected": "considering",
        "purchased": "bought",
        "received": "in_hand",
    }
    ranks = {"considering": 0, "bought": 1, "in_hand": 2}
    placed = {}
    for item in connection.execute(
        sa.select(tables["list_items"]).order_by(tables["list_items"].c.id)
    ).mappings():
        gift_list = lists[item["list_id"]]
        occurrence_id = occurrences.get(gift_list["occasion_id"])
        if occurrence_id is None:
            continue
        people = (
            [gift_list["person_id"]]
            if gift_list["person_id"]
            else recipients.get(item["gift_id"], [])
        )
        for person_id in people:
            key = (occurrence_id, person_id)
            if key not in envelopes:
                result = connection.execute(
                    tables["recipient_envelopes"]
                    .insert()
                    .values(occurrence_id=occurrence_id, person_id=person_id)
                )
                envelopes[key] = result.inserted_primary_key[0]
            phase = phases[item["status"]]
            placement_key = (envelopes[key], item["gift_id"])
            if placement_key in placed and ranks[placed[placement_key]["phase"]] >= ranks[phase]:
                continue
            gift = gifts[item["gift_id"]]
            price = next(
                (
                    v
                    for v in (
                        item["discount_price"],
                        item["price"],
                        gift["sale_price"],
                        gift["price"],
                    )
                    if v is not None
                ),
                None,
            )
            placed[placement_key] = dict(
                envelope_id=envelopes[key],
                gift_id=item["gift_id"],
                phase=phase,
                quantity=item["quantity"],
                unit_price=price,
                source_list_item_id=item["id"],
            )
    for values in placed.values():
        connection.execute(tables["occurrence_gifts"].insert().values(**values))


def downgrade():
    op.drop_table("occurrence_gifts")
    op.drop_table("recipient_envelopes")
    op.drop_table("occurrences")
