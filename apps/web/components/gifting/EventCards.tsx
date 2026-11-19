import Link from "next/link";
import type { Occurrence } from "@/lib/api/gifting";
import { PhaseCounts, styles, money, dateLabel } from "./shared";

export function EventCards({ rows, headingLevel = 2 }: { rows: Occurrence[]; headingLevel?: 2 | 4 | 5 }) {
  const Heading = `h${headingLevel}` as "h2" | "h4" | "h5";
  return <div className={styles.grid}>{rows.map((o) => <Link key={o.id} href={`/events/${o.id}`} className={styles.event}>
    <span className={styles.date}>{dateLabel(o.date)}{o.closed ? " · Closed" : ""}</span>
    <Heading className={styles.eventTitle}>{o.name}</Heading>
    {o.envelopes.slice(0, 3).map((e) => <div key={e.id} className={styles.miniEnvelope}><strong>{e.person_name}</strong><span>{e.count_allowance == null ? "Count not set" : `${e.count_allowance} gifts`} · {money(e.money_allowance)}</span></div>)}
    {!o.envelopes.length && <p>Open to add recipient envelopes</p>}
    <PhaseCounts totals={o} />
    <p>{money(o.spent)} bought · {o.remaining_money == null ? "Event budget not set" : `${money(o.remaining_money)} remaining`}</p>
  </Link>)}</div>;
}
