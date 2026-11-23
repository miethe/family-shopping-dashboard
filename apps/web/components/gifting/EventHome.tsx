"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { holidayApi } from "@/lib/api/holidays";
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
import { CalendarPanel, AgendaRow } from "./CalendarPanel";

export function EventHome() {
  const query = useOccurrences();
  const occasions = useOccasions({ limit: 100 });
  const [showCalendar, setShowCalendar] = useState(false);
  const planRef = useRef<HTMLDetailsElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [calendarMounted, setCalendarMounted] = useState(false);
  useEffect(() => {
    if (showCalendar) { setCalendarMounted(true); return; }
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setCalendarMounted(false); return; }
    const timer = window.setTimeout(() => setCalendarMounted(false), 260);
    return () => window.clearTimeout(timer);
  }, [showCalendar]);
  const [eventId, setEventId] = useState("");
  const [holidayId, setHolidayId] = useState("");
  const [name, setName] = useState("");
  const [dateValue, setDateValue] = useState("");
  const [addingHoliday, setAddingHoliday] = useState(false);
  const [holidayName, setHolidayName] = useState("");
  const [holidayDate, setHolidayDate] = useState("");
  const [major, setMajor] = useState(false);
  const client = useQueryClient();
  const holidays = useQuery({ queryKey: ["holidays"], queryFn: holidayApi.list, enabled: eventId === "holiday" });
  const addHoliday = useMutation({
    mutationFn: () => {
      const [, month, day] = holidayDate.split("-").map(Number);
      return holidayApi.create({ name: holidayName, key: holidayName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""), month, day, is_major: major, theme_key: null, theme_window_days: 30 });
    },
    onSuccess: (holiday) => {
      client.invalidateQueries({ queryKey: ["holidays"] });
      setHolidayId(String(holiday.id)); setName(holiday.name); setDateValue(holiday.next_date); setAddingHoliday(false);
    },
  });
  const create = useGiftingMutation(async (form: FormData) => {
    const date = String(form.get("date"));
    const event = eventId && eventId !== "holiday"
      ? Number(eventId)
      : (
          await occasionApi.create({
            name: String(form.get("name")),
            type: eventId === "holiday" ? OccasionType.HOLIDAY : OccasionType.OTHER,
            date,
            ...(eventId === "holiday" ? { holiday_id: Number(holidayId) } : {}),
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
    query.data?.filter((o) => !o.closed && o.date >= today).sort((a,b)=>a.date.localeCompare(b.date)) ?? [];
  const past = query.data?.filter((o) => o.closed || o.date < today) ?? [];
  return (
    <div className={styles.page}>
      <Hero eyebrow="Gather & give" title="Good days ahead.">
        <p>Your family calendar, all in one place.</p>
      </Hero>
      <div className={styles.toolbar}>
        <h2>Upcoming events</h2>
        <Button onClick={()=>{if(planRef.current){planRef.current.open=true;planRef.current.scrollIntoView({block:"start"});planRef.current.querySelector("select")?.focus();}}}>+ Event</Button>
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
          <div className={styles.agendaList}>{upcoming.map(o=><AgendaRow key={o.id} occurrence={o}/>)}</div>
        ))}</>}
      <details ref={planRef} className={styles.shelf}>
        <summary>Plan an event</summary>
        <div className={styles.shelfBody}>
          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              create.mutate(new FormData(form), {
                onSuccess: () => { form.reset(); setEventId(""); setHolidayId(""); setName(""); setDateValue(""); },
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
                <option value="holiday">Holiday</option>
                {occasions.data?.items.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name}
                  </option>
                ))}
              </select>
            </label>
            {eventId === "holiday" && <>
              <label className={styles.label}>Holiday
                <select className={styles.select} value={holidayId} required onChange={(e) => {
                  const selected = holidays.data?.find((h) => String(h.id) === e.target.value);
                  setHolidayId(e.target.value); setName(selected?.name ?? ""); setDateValue(selected?.next_date ?? "");
                }}>
                  <option value="">Choose a holiday</option>
                  {holidays.data?.map((h) => <option key={h.id} value={h.id}>{h.name}{h.is_major ? " ★" : ""} — {h.next_date} ({h.days_until} days)</option>)}
                </select>
              </label>
              {holidays.error && <p role="alert">Could not load holidays.</p>}
              <Button type="button" variant="outline" onClick={() => setAddingHoliday(!addingHoliday)}>Add a holiday</Button>
              {addingHoliday && <fieldset>
                <legend>New holiday</legend>
                <Input label="Holiday name" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} />
                <Input label="Holiday date" type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} />
                <label><input type="checkbox" checked={major} onChange={(e) => setMajor(e.target.checked)} /> Major holiday</label>
                <Button type="button" disabled={!holidayName.trim() || !holidayDate || addHoliday.isPending} onClick={() => addHoliday.mutate()}>Save holiday</Button>
                {addHoliday.error && <p role="alert">{addHoliday.error.message}</p>}
              </fieldset>}
            </>}
            {(!eventId || eventId === "holiday") && (
              <Input label="Event name" name="name" required maxLength={255} value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <div className={styles.fields}>
              <Input label="Date" name="date" type="date" required value={dateValue} onChange={(e) => setDateValue(e.target.value)} />
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
