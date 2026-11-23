"use client";
import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePersons } from "@/hooks/usePersons";
import {
  useGiftingMutation,
  useGiftingOccurrence,
  usePersonShelf,
} from "@/hooks/useGifting";
import {
  giftingApi,
  phases,
  phaseLabel,
  type Envelope,
  type Phase,
} from "@/lib/api/gifting";
import {
  Hero,
  GiftCard,
  PhaseCounts,
  QueryState,
  Empty,
  styles,
  money,
  dateLabel,
} from "./shared";

export function AllowanceForm({
  occurrenceId,
  personId,
  envelope,
}: {
  occurrenceId: number;
  personId: number;
  envelope?: Envelope;
}) {
  const mutation = useGiftingMutation((form: FormData) =>
    giftingApi.allowance(occurrenceId, personId, {
      money_allowance:
        form.get("money") === "" ? null : String(form.get("money")),
      count_allowance:
        form.get("count") === "" ? null : Number(form.get("count")),
    }),
  );
  return (
    <form
      className={styles.form}
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(new FormData(e.currentTarget));
      }}
    >
      <div className={styles.fields}>
        <Input
          label="Money allowance"
          name="money"
          type="number"
          min="0"
          step="0.01"
          defaultValue={envelope?.money_allowance ?? ""}
          placeholder="Not set"
        />
        <Input
          label="Gift count allowance"
          name="count"
          type="number"
          min="0"
          step="1"
          defaultValue={envelope?.count_allowance ?? ""}
          placeholder="Not set"
        />
      </div>
      <p className={styles.note}>
        Leave blank for no cap. Zero means no allowance.
      </p>
      <Button type="submit" disabled={mutation.isPending}>
        Save allowance
      </Button>
      {mutation.isSuccess && <p role="status">Allowance saved.</p>}
      {mutation.error && (
        <p role="alert" className={styles.error}>
          {mutation.error.message}
        </p>
      )}
    </form>
  );
}
function EnvelopeCard({
  envelope,
  occurrenceId,
}: {
  envelope: Envelope;
  occurrenceId: number;
}) {
  const shelf = usePersonShelf(envelope.person_id);
  const phase = useGiftingMutation(
    ({ id, value }: { id: number; value: Phase }) =>
      giftingApi.phase(id, value),
  );
  const place = useGiftingMutation((id: number) =>
    giftingApi.place(envelope.id, id),
  );
  const choices = [
    ...(shelf.data?.ideas ?? []),
    ...(shelf.data?.wishlist ?? []),
  ].filter(
    (g, i, all) =>
      all.findIndex((x) => x.id === g.id) === i &&
      !envelope.gifts.some((x) => x.id === g.id),
  );
  return (
    <article className={styles.envelope}>
      <div className={styles.envelopeHeader}>
        <div>
          <Link href={`/people/${envelope.person_id}`}>
            <h3>{envelope.person_name} →</h3>
          </Link>
          <p>
            {envelope.count_allowance == null
              ? "Count not set"
              : `${envelope.count_allowance} gifts maximum`}{" "}
            · {money(envelope.money_allowance)}
          </p>
        </div>
      </div>
      <p>
        {money(envelope.spent)} bought ·{" "}
        {envelope.remaining_money == null
          ? "Money allowance not set"
          : `${money(envelope.remaining_money)} remaining`}
      </p>
      {envelope.remaining_count != null && (
        <p>{envelope.remaining_count} gifts remaining</p>
      )}
      {envelope.money_allowance != null &&
        Number(envelope.money_allowance) > 0 && (
          <progress
            aria-label={`${envelope.person_name} spending`}
            className={styles.meter}
            value={Number(envelope.spent)}
            max={Number(envelope.money_allowance)}
          />
        )}
      {envelope.unknown_prices > 0 && (
        <p className={styles.note}>
          {envelope.unknown_prices} gifts have unknown prices; totals are
          incomplete.
        </p>
      )}
      {envelope.gifts.map((g) => (
        <GiftCard compact gift={g} key={g.placement_id}>
          <label className={styles.label}>
            Phase
            <select
              aria-label={`Phase for ${g.name}`}
              className={styles.select}
              value={g.phase}
              disabled={phase.isPending}
              onChange={(e) =>
                phase.mutate({
                  id: g.placement_id!,
                  value: e.target.value as Phase,
                })
              }
            >
              {phases.map((p) => (
                <option key={p} value={p}>
                  {phaseLabel[p]}
                </option>
              ))}
            </select>
          </label>
        </GiftCard>
      ))}
      {!envelope.gifts.length && <Empty>No gifts attached yet.</Empty>}
      {phase.error && (
        <p role="alert" className={styles.error}>
          {phase.error.message}
        </p>
      )}
      <details className="mt-4">
        <summary className={styles.textLink}>Add from ideas & wishlist</summary>
        {choices.length ? (
          <label className={styles.label}>
            Choose a saved gift
            <select
              className={styles.select}
              value=""
              disabled={place.isPending}
              onChange={(e) => {
                if (e.target.value) place.mutate(Number(e.target.value));
              }}
            >
              <option value="">Choose a gift…</option>
              {choices.map((g) => (
                <option value={g.id} key={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className={styles.note}>Save a new idea with the + button.</p>
        )}
        {place.error && <p role="alert">{place.error.message}</p>}
      </details>
      <details className="mt-3">
        <summary className={styles.textLink}>Edit allowance</summary>
        <AllowanceForm
          occurrenceId={occurrenceId}
          personId={envelope.person_id}
          envelope={envelope}
        />
      </details>
    </article>
  );
}
export function EventOccurrence({ id }: { id: number }) {
  const query = useGiftingOccurrence(id);
  const people = usePersons({ limit: 100 });
  const [recipient, setRecipient] = useState("");
  const close = useGiftingMutation((closed: boolean) =>
    giftingApi.close(id, closed),
  );
  const o = query.data;
  return (
    <div className={styles.page}>
      <Link href="/dashboard" className={styles.textLink}>
        ← Events
      </Link>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {o && (
        <>
          <Hero
            eyebrow={o.closed ? "Closed event" : "A celebration to plan"}
            title={o.name}
          >
            <p>{dateLabel(o.date)}</p>
          </Hero>
          <p className={styles.total}>{money(o.spent)} bought</p>
          <p>
            {o.remaining_money == null
              ? "Event budget not set"
              : `${money(o.remaining_money)} remaining`}{" "}
            · {money(o.allocated)} in recipient allowances
          </p>
          <PhaseCounts totals={o} />
          <div className={styles.toolbar}>
            <h2>Recipient envelopes</h2>
            <Button
              variant="outline"
              disabled={close.isPending}
              onClick={() => close.mutate(!o.closed)}
            >
              {o.closed ? "Reopen event" : "Close event"}
            </Button>
          </div>
          {close.error && <p role="alert">{close.error.message}</p>}
          <div className={styles.grid}>
            {o.envelopes.map((e) => (
              <EnvelopeCard key={e.id} envelope={e} occurrenceId={id} />
            ))}
          </div>
          <details className={styles.shelf}>
            <summary>Add a recipient</summary>
            <div className={styles.shelfBody}>
              <label className={styles.label}>
                Person
                <select
                  value={recipient}
                  className={styles.select}
                  onChange={(e) => setRecipient(e.target.value)}
                >
                  <option value="">Choose someone…</option>
                  {people.data?.items
                    .filter(
                      (p) => !o.envelopes.some((e) => e.person_id === p.id),
                    )
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.display_name}
                      </option>
                    ))}
                </select>
              </label>
              {recipient && (
                <AllowanceForm
                  key={recipient}
                  occurrenceId={id}
                  personId={Number(recipient)}
                />
              )}
              <Link className={styles.textLink} href="/people/new">
                Create a person →
              </Link>
            </div>
          </details>
        </>
      )}
    </div>
  );
}
