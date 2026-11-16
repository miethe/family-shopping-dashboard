"use client";
import Link from "next/link";
import { usePersonShelf } from "@/hooks/useGifting";
import {
  Hero,
  GiftCard,
  Shelves,
  QueryState,
  Empty,
  EventLink,
  styles,
  money,
  dateLabel,
} from "./shared";

export function PersonShelves({ id }: { id: number }) {
  const query = usePersonShelf(id);
  const person = query.data;
  return (
    <div className={styles.page}>
      <Link href="/people" className={styles.textLink}>
        ← People
      </Link>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {person && (
        <>
          <Hero eyebrow="Keepsake shelves" title={person.name}>
            <p>Ideas that last beyond one event.</p>
          </Hero>
          <Shelves title="Wishlist" count={person.wishlist.length}>
            <div className={styles.cardGrid}>
              {person.wishlist.map((g) => (
                <GiftCard key={g.id} gift={g} />
              ))}
            </div>
            {!person.wishlist.length && (
              <Empty>No wishes yet. Use + to save one.</Empty>
            )}
          </Shelves>
          <Shelves title="Ideas" count={person.ideas.length}>
            <div className={styles.cardGrid}>
              {person.ideas.map((g) => (
                <GiftCard key={g.id} gift={g} />
              ))}
            </div>
            {!person.ideas.length && (
              <Empty>Something they mentioned? Save it with +.</Empty>
            )}
          </Shelves>
          <Shelves
            title="Past gifts"
            count={person.past_gifts.length}
            open={false}
          >
            {person.occasions.flatMap((o) =>
              o.envelopes
                .filter((e) => e.person_id === id)
                .flatMap((e) =>
                  e.gifts
                    .filter((g) => g.phase === "given")
                    .map((g) => (
                      <div key={`${o.id}-${g.placement_id}`}>
                        <GiftCard compact gift={g} />
                        <small>
                          {o.name} · {dateLabel(o.date)}
                        </small>
                      </div>
                    )),
                ),
            )}
            {!person.past_gifts.length && (
              <Empty>Gifts marked Given will appear here.</Empty>
            )}
          </Shelves>
          <Shelves
            title="Events & allowances"
            count={person.occasions.length}
            open={false}
          >
            {person.occasions.map((o) => (
              <article className={styles.compactGift} key={o.id}>
                <div>
                  <EventLink id={o.id}>{o.name}</EventLink>
                  <p>
                    {dateLabel(o.date)} ·{" "}
                    {money(
                      o.envelopes.find((e) => e.person_id === id)
                        ?.money_allowance,
                    )}{" "}
                    allowance
                  </p>
                </div>
              </article>
            ))}
          </Shelves>
          <Shelves
            title="Interests & preferences"
            count={person.interests.length}
            open={false}
          >
            <p>{person.interests.join(" · ") || "No interests saved yet."}</p>
            <Link className={styles.textLink} href={`/people/${id}/profile`}>
              Edit profile & preferences →
            </Link>
          </Shelves>
        </>
      )}
    </div>
  );
}
