"use client";
import { useEffect, useRef, useState } from "react";
import type { Occurrence } from "@/lib/api/gifting";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { dateLabel, Empty, QueryState, styles } from "./shared";
import { EventCards } from "./EventCards";

type View = "month" | "upcoming" | "season";
const views: View[] = ["month", "upcoming", "season"];
const localDate = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const season = (date: string) => {
  const month = Number(date.slice(5, 7));
  return month <= 2 || month === 12 ? "Winter" : month <= 5 ? "Spring" : month <= 8 ? "Summer" : "Autumn";
};

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
  const upcoming = visible.filter(o => (o.closed || o.date >= localDate(new Date())) && Number(o.date.slice(0, 4)) >= year && Number(o.date.slice(0, 4)) <= year + 1).sort((a, b) => Number(a.closed) - Number(b.closed) || a.date.localeCompare(b.date));
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
            <TabsContent value="month" className={styles.viewContent}><h3>Selected date</h3>{selectedRows.length ? <EventCards rows={selectedRows} /> : <Empty>No events on this date.</Empty>}</TabsContent>
            <TabsContent value="upcoming" className={styles.viewContent}><h3>Next celebrations</h3>{upcoming.length ? <EventCards rows={upcoming} /> : <Empty>No upcoming events in this year range.</Empty>}</TabsContent>
            <TabsContent value="season" className={styles.viewContent}><h3>Season by season</h3>{grouped.length ? grouped.map(o => { const label = `${season(o.date)} ${o.date.slice(0, 4)}`; const show = label !== previous; previous = label; return <div key={o.id} className={styles.timelineItem}>{show && <h4>{label}</h4>}{o.closed ? <details className={styles.closedEvent}><summary>{dateLabel(o.date)} · {o.name} <span>Closed</span></summary><EventCards rows={[o]} /></details> : <EventCards rows={[o]} />}</div>; }) : <Empty>No events in this year range.</Empty>}</TabsContent>
          </>}
        </div>
      </div>
    </Tabs>
  </section>;
}
