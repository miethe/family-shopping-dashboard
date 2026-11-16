"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOccurrences, useGiftingMutation } from "@/hooks/useGifting";
import { useOccasions } from "@/hooks/useOccasions";
import { occasionApi } from "@/lib/api/endpoints";
import { OccasionType } from "@/types";
import { giftingApi } from "@/lib/api/gifting";
import {
  Hero,
  PhaseCounts,
  QueryState,
  Empty,
  styles,
  money,
  dateLabel,
} from "./shared";

export function EventHome() {
  const query = useOccurrences();
  const occasions = useOccasions({ limit: 100 });
  const [showCalendar, setShowCalendar] = useState(false);
  const [eventId, setEventId] = useState("");
  const create = useGiftingMutation(async (form: FormData) => {
    const date = String(form.get("date"));
    const event = eventId
      ? Number(eventId)
      : (
          await occasionApi.create({
            name: String(form.get("name")),
            type: OccasionType.OTHER,
            date,
          })
        ).id;
    return giftingApi.create({
      occasion_id: event,
      date,
      ...(form.get("budget")
        ? { budget_total: String(form.get("budget")) }
        : {}),
    });
  });
  const today = new Date().toLocaleDateString("en-CA");
  const upcoming =
    query.data?.filter((o) => !o.closed && o.date >= today) ?? [];
  const past = query.data?.filter((o) => o.closed || o.date < today) ?? [];
  const cards = (rows: typeof upcoming) => (
    <div className={styles.grid}>
      {rows.map((o) => (
        <Link key={o.id} href={`/events/${o.id}`} className={styles.event}>
          <span className={styles.date}>
            {dateLabel(o.date)}
            {o.closed ? " · Closed" : ""}
          </span>
          <h2>{o.name}</h2>
          {o.envelopes.slice(0, 3).map((e) => (
            <div key={e.id} className={styles.miniEnvelope}>
              <strong>{e.person_name}</strong>
              <span>
                {e.count_allowance == null
                  ? "Count not set"
                  : `${e.count_allowance} gifts`}{" "}
                · {money(e.money_allowance)}
              </span>
            </div>
          ))}
          {!o.envelopes.length && <p>Open to add recipient envelopes</p>}
          <PhaseCounts totals={o} />
          <p>
            {money(o.spent)} bought ·{" "}
            {o.remaining_money == null
              ? "Event budget not set"
              : `${money(o.remaining_money)} remaining`}
          </p>
        </Link>
      ))}
    </div>
  );
  return (
    <div className={styles.page}>
      <Hero eyebrow="Gather & give" title="The event shelf">
        <p>A little thought, saved for the right moment.</p>
      </Hero>
      <div className={styles.toolbar}>
        <h2>Upcoming events</h2>
        <Button
          variant="outline"
          onClick={() => setShowCalendar((v) => !v)}
          aria-expanded={showCalendar}
        >
          Calendar view
        </Button>
      </div>
      {showCalendar && (
        <p className={styles.empty} role="status">
          The calendar and seasonal timeline are coming in milestone 2. Your
          events are ready below.
        </p>
      )}
      <QueryState
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {!query.isLoading &&
        !query.error &&
        (!upcoming.length ? (
          <Empty>No upcoming events yet. Start with a celebration below.</Empty>
        ) : (
          cards(upcoming)
        ))}
      <details className={styles.shelf}>
        <summary>Plan an event</summary>
        <div className={styles.shelfBody}>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              create.mutate(new FormData(form), {
                onSuccess: () => form.reset(),
              });
            }}
          >
            <label className={styles.label}>
              Event
              <select
                className={styles.select}
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              >
                <option value="">New event</option>
                {occasions.data?.items.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            {!eventId && (
              <Input label="Event name" name="name" required maxLength={255} />
            )}
            <div className={styles.fields}>
              <Input label="Date" name="date" type="date" required />
              <Input
                label="Money budget (optional)"
                name="budget"
                type="number"
                min="0"
                step="0.01"
              />
            </div>
            <Button disabled={create.isPending} type="submit">
              {create.isPending ? "Saving…" : "Create occurrence"}
            </Button>
            {create.error && (
              <p role="alert" className={styles.error}>
                {create.error.message}
              </p>
            )}
          </form>
        </div>
      </details>
      <details className={styles.shelf}>
        <summary>
          Past & closed events <span>{past.length}</span>
        </summary>
        <div className={styles.shelfBody}>{cards(past)}</div>
      </details>
      <Link className={styles.textLink} href="/occasions">
        Manage recurring events →
      </Link>
    </div>
  );
}
