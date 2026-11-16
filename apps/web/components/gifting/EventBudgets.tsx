"use client";
import { useState } from "react";
import Link from "next/link";
import { useGiftingBudget } from "@/hooks/useGifting";
import { AllowanceForm } from "./EventOccurrence";
import {
  Hero,
  QueryState,
  Empty,
  EventLink,
  styles,
  money,
  dateLabel,
} from "./shared";

export function EventBudgets() {
  const [year, setYear] = useState(new Date().getFullYear());
  const query = useGiftingBudget(year);
  const data = query.data;
  return (
    <div className={styles.page}>
      <Hero eyebrow="A little room for giving" title="Event envelopes">
        <p>Allowances for each person. A clear picture for each celebration.</p>
      </Hero>
      <div className={styles.toolbar}>
        <h2>Your celebrations</h2>
        <label className={styles.label}>
          Year
          <select
            className={styles.select}
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from(
              { length: 11 },
              (_, i) => new Date().getFullYear() - 5 + i,
            ).map((y) => (
              <option key={y}>{y}</option>
            ))}
          </select>
        </label>
      </div>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {data && (
        <>
          <p className={styles.total}>{money(data.allocated)} allocated</p>
          <p>
            {money(data.spent)} bought across {year}
            {data.budget_total != null
              ? ` · ${money(Number(data.budget_total) - Number(data.spent))} remaining`
              : " · Some event budgets are not set"}
          </p>
          {data.unknown_prices > 0 && (
            <p className={styles.note}>
              Unknown prices on {data.unknown_prices} gifts are excluded from
              money totals.
            </p>
          )}
          {!data.events.length && (
            <Empty>
              No event envelopes for this year.{" "}
              <Link href="/dashboard">Plan an event →</Link>
            </Empty>
          )}
          {data.events.map((event) => (
            <section key={event.occasion_id} className={styles.shelf}>
              <div className="p-5">
                <h2>{event.name}</h2>
                <p className={styles.note}>
                  {money(event.spent)} bought · {money(event.allocated)}{" "}
                  allocated to recipients
                </p>
                {event.occurrences.map((o) => (
                  <div key={o.id} className="mt-4">
                    <EventLink id={o.id}>
                      {dateLabel(o.date)}
                      {o.closed ? " · Closed" : ""}
                    </EventLink>
                    <p className={styles.note}>
                      Event budget: {money(o.budget_total)} ·{" "}
                      {o.remaining_money == null
                        ? "Remaining not set"
                        : `${money(o.remaining_money)} remaining`}
                    </p>
                    {o.envelopes.map((e) => (
                      <article key={e.id} className={styles.envelope}>
                        <h3>
                          <Link href={`/people/${e.person_id}`}>
                            {e.person_name}
                          </Link>
                        </h3>
                        <p>{money(e.money_allowance)} allowance</p>
                        <p>
                          {money(e.spent)} bought ·{" "}
                          {e.remaining_money == null
                            ? "Money cap not set"
                            : `${money(e.remaining_money)} remaining`}
                        </p>
                        <p>
                          {e.count_allowance == null
                            ? "Gift cap not set"
                            : `${e.count_allowance} gifts maximum · ${e.remaining_count} remaining`}
                        </p>
                        <details>
                          <summary className={styles.textLink}>
                            Adjust allowance
                          </summary>
                          <AllowanceForm
                            occurrenceId={o.id}
                            personId={e.person_id}
                            envelope={e}
                          />
                        </details>
                      </article>
                    ))}
                    {!o.envelopes.length && (
                      <p className={styles.note}>
                        Add recipient envelopes from the event.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
          <p className={styles.note}>
            Considering gifts are planned, not spent. Bought, in hand and given
            count toward allowances. Negative remaining amounts show an overage.
          </p>
        </>
      )}
    </div>
  );
}
