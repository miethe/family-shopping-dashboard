"use client";
import { useEffect, useRef, useState } from "react";
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
  QueryState,
  Empty,
  styles,
} from "./shared";
import { EventCards } from "./EventCards";
import { CalendarPanel } from "./CalendarPanel";

export function EventHome() {
  const query = useOccurrences();
  const occasions = useOccasions({ limit: 100 });
  const [showCalendar, setShowCalendar] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [calendarMounted, setCalendarMounted] = useState(false);
  useEffect(() => {
    if (showCalendar) { setCalendarMounted(true); return; }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setCalendarMounted(false); return; }
    const timer = window.setTimeout(() => setCalendarMounted(false), 260);
    return () => window.clearTimeout(timer);
  }, [showCalendar]);
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
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const upcoming =
    query.data?.filter((o) => !o.closed && o.date >= today) ?? [];
  const past = query.data?.filter((o) => o.closed || o.date < today) ?? [];
  return (
    <div className={styles.page}>
      <Hero eyebrow="Gather & give" title="The event shelf">
        <p>A little thought, saved for the right moment.</p>
      </Hero>
      <div className={styles.toolbar}>
        <h2>Upcoming events</h2>
        <Button
          ref={triggerRef}
          variant="outline"
          aria-controls="calendar-panel"
          onClick={() => setShowCalendar((v) => !v)}
          aria-expanded={showCalendar}
        >
          {showCalendar ? "Close calendar" : "Calendar view"}
        </Button>
      </div>
      <div className={styles.calendarReveal} data-open={showCalendar} inert={!showCalendar}>
        <div>
          {(showCalendar || calendarMounted) && <CalendarPanel occurrences={query.data ?? []} loading={query.isLoading} error={query.error} retry={() => query.refetch()} onClose={() => { setShowCalendar(false); triggerRef.current?.focus(); }} />}
        </div>
      </div>
      {!showCalendar && <><QueryState
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {!query.isLoading &&
        !query.error &&
        (!upcoming.length ? (
          <Empty>No upcoming events yet. Start with a celebration below.</Empty>
        ) : (
          <EventCards rows={upcoming} />
        ))}</>}
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
      {!showCalendar && <details className={styles.shelf}>
        <summary>
          Past & closed events <span>{past.length}</span>
        </summary>
        <div className={styles.shelfBody}><EventCards rows={past} /></div>
      </details>}
      <Link className={styles.textLink} href="/occasions">
        Manage recurring events →
      </Link>
    </div>
  );
}
