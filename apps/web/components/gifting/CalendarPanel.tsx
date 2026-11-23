"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { phases, phaseLabel, type Occurrence } from "@/lib/api/gifting";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { dateLabel, Empty, money, QueryState, styles } from "./shared";
import { EventCards } from "./EventCards";

type View = "month" | "upcoming" | "season";
const views: View[] = ["month", "upcoming", "season"];
const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const season = (date: string) => {
  const month = Number(date.slice(5, 7));
  return month <= 2 || month === 12 ? "Winter" : month <= 5 ? "Spring" : month <= 8 ? "Summer" : "Autumn";
};

export function AgendaRow({ occurrence: o }: { occurrence: Occurrence }) {
  const date = new Date(`${o.date}T12:00:00`);
  const gifts = Object.values(o.phases).reduce((sum, count) => sum + count, 0);
  return <Link href={`/events/${o.id}`} className={styles.agendaRow}>
    <time dateTime={o.date} className={styles.agendaDate}>
      <span>{date.toLocaleDateString("en-US", { month: "short" })}</span>
      <strong>{date.getDate()}</strong><span>{date.getFullYear()}</span>
    </time>
    <div className={styles.agendaDetails}>
      <h4>{o.name}</h4>
      <div className={styles.agendaMeta}>
        <span>Recipients: {o.envelopes.length ? o.envelopes.map(e => e.person_name).join(", ") : "Not set"}</span>
        <span>{gifts} {gifts === 1 ? "gift" : "gifts"}</span>
        <span>{o.phases.bought} bought · {o.phases.in_hand} in hand</span>
        <span>Budget: {money(o.budget_total)}</span>
      </div>
    </div><span className={styles.agendaCount}>{Math.max(0,Math.round((new Date(`${o.date}T12:00:00`).getTime()-new Date(`${localDate(new Date())}T12:00:00`).getTime())/86400000))}d →</span>
  </Link>;
}

export function CalendarPanel({ occurrences, loading, error, retry, onClose }: { occurrences: Occurrence[]; loading: boolean; error: unknown; retry: () => void; onClose: () => void }) {
  const [view, setView] = useState<View>("upcoming");
  const [selected, setSelected] = useState(() => localDate(new Date()));
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [includeClosed, setIncludeClosed] = useState(true);
  const titleRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    try { const saved = localStorage.getItem("gifting-calendar-view"); if (views.includes(saved as View)) setView(saved as View); } catch { /* Storage may be unavailable. */ }
    if (window.matchMedia?.("(max-width: 639px)").matches) titleRef.current?.scrollIntoView({ block: "nearest" });
  }, []);
  const changeView = (value: string) => {
    const next = value as View; setView(next);
    try { localStorage.setItem("gifting-calendar-view", next); } catch { /* The planner remains usable without storage. */ }
  };
  const sorted = [...occurrences].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name));
  const visible = sorted.filter(o => includeClosed || !o.closed);
  const selectedRows = visible.filter(o => o.date === selected);
  const upcoming = visible.filter(o => !o.closed && o.date >= localDate(new Date()) && Number(o.date.slice(0, 4)) >= year && Number(o.date.slice(0, 4)) <= year + 1);
  const closed = visible.filter(o => o.closed && Number(o.date.slice(0, 4)) >= year && Number(o.date.slice(0, 4)) <= year + 1);
  const start = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const grouped = visible.filter(o => Number(o.date.slice(0, 4)) >= year && Number(o.date.slice(0, 4)) <= year + 1);
  let previous = "";
  return <section id="calendar-panel" className={styles.calendar} aria-labelledby="calendar-title" onKeyDown={e => { if (e.key === "Escape") onClose(); }}>
    <div className={styles.calendarHeader}><h2 id="calendar-title" ref={titleRef}>Your calendar</h2></div>
    <Tabs value={view} onValueChange={changeView}>
      <TabsList aria-label="Calendar view" data-view={view} className={styles.calendarTabs}>
        {views.map(v => <TabsTrigger key={v} value={v} className={styles.calendarTab}>{v[0].toUpperCase() + v.slice(1)}</TabsTrigger>)}
      </TabsList>
      <div className={styles.calendarColumns}>
        <div className={`${styles.monthNavigator} ${view !== "month" ? styles.desktopNavigator : ""}`}>
          <div className={styles.monthHeading}>
            <button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button>
            <strong>{month.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</strong>
            <button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button>
          </div>
          <label className={styles.mobileDatePicker}>Choose a date <input type="date" value={selected} onChange={e => { const date = e.target.value; if (date) { setSelected(date); const [y, m] = date.split("-").map(Number); setMonth(new Date(y, m - 1, 1)); } }} /></label>
          <div className={styles.dayGrid}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <span key={d} className={styles.weekday}>{d}</span>)}
            {Array.from({ length: start }, (_, i) => <span key={`blank-${i}`} />)}
            {Array.from({ length: days }, (_, i) => {
              const date = localDate(new Date(month.getFullYear(), month.getMonth(), i + 1));
              const count = visible.filter(o => o.date === date).length;
              return <button type="button" key={date} aria-label={`${dateLabel(date)}, ${count} ${count === 1 ? "event" : "events"}`} aria-pressed={selected === date} onClick={() => setSelected(date)}>{i + 1}{count > 0 && <span className={styles.dot} aria-hidden="true" />}</button>;
            })}
          </div>
          <div className={styles.dateSummary} aria-live="polite"><strong>{dateLabel(selected)}</strong><span>{selectedRows.length} {selectedRows.length === 1 ? "event" : "events"}</span></div>
        </div>
        <div className={styles.calendarContent}>
          <div className={styles.calendarFilters}>
            <label>Years <select aria-label="Starting year" value={year} onChange={e => setYear(Number(e.target.value))}>{Array.from({ length: 21 }, (_, i) => new Date().getFullYear() - 10 + i).map(y => <option key={y} value={y}>{y}–{y + 1}</option>)}</select></label>
            <label><input type="checkbox" checked={includeClosed} onChange={e => setIncludeClosed(e.target.checked)} /> Include closed</label>
          </div>
          <QueryState loading={loading} error={error} retry={retry} />
          {!loading && !error && <>
            <TabsContent value="month" className={styles.viewContent}><h3>Selected date</h3>{selectedRows.length ? <EventCards rows={selectedRows} headingLevel={4} /> : <Empty>No events on this date.</Empty>}</TabsContent>
            <TabsContent value="upcoming" className={styles.viewContent}><h3>Next celebrations</h3>{upcoming.length ? <div className={styles.agendaList}>{upcoming.map(o => <AgendaRow key={o.id} occurrence={o} />)}</div> : <Empty>No upcoming events in this year range.</Empty>}{closed.length > 0 && <div className={styles.closedList}><h3>Closed events</h3>{closed.map(o => <details key={o.id} className={styles.closedEvent}><summary>{dateLabel(o.date)} · {o.name} <span>Closed</span></summary><AgendaRow occurrence={o} /></details>)}</div>}</TabsContent>
            <TabsContent value="season" className={styles.viewContent}><h3>Season by season</h3>{grouped.length ? grouped.map(o => { const label = `${season(o.date)} ${o.date.slice(0, 4)}`; const show = label !== previous; previous = label; return <div key={o.id} className={styles.timelineItem}>{show && <h4>{label}</h4>}{o.closed ? <details className={styles.closedEvent}><summary>{dateLabel(o.date)} · {o.name} <span>Closed</span></summary><EventCards rows={[o]} headingLevel={5} /></details> : <SeasonCard occurrence={o}/>}</div>; }) : <Empty>No events in this year range.</Empty>}</TabsContent>
          </>}
        </div>
      </div>
    </Tabs>
  </section>;
}

function SeasonCard({occurrence:o}:{occurrence:Occurrence}) { return <article className={styles.seasonCard}><div className={styles.toolbar}><div><h5><Link href={`/events/${o.id}`}>{o.name} →</Link></h5><p>{dateLabel(o.date)}</p></div><strong>{money(o.spent)} / {money(o.budget_total)}</strong></div>{o.envelopes.length?<div className={styles.seasonTable}><table><thead><tr><th>Person</th>{phases.map(p=><th key={p}>{phaseLabel[p]}</th>)}</tr></thead><tbody>{o.envelopes.map(e=><tr key={e.id}><th scope="row"><Link href={`/people/${e.person_id}/profile`}>{e.person_name}</Link></th>{phases.map(p=><td key={p}>{e.phases[p]}</td>)}</tr>)}</tbody></table></div>:<p>No recipients yet. <Link href={`/events/${o.id}`}>Start the plan →</Link></p>}</article>; }
