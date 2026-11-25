"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useGiftingIdeas } from "@/hooks/useGifting";
import {
  Hero,
  GiftCard,
  QueryState,
  Empty,
  styles,
} from "@/components/gifting/shared";
export default function IdeasPage() {
  const query = useGiftingIdeas();
  const router = useRouter();
  return (
    <div className={styles.page}>
      <Hero eyebrow="Thoughts worth keeping" title="Ideas">
        <p>Saved for someone, or for a moment still to come.</p>
      </Hero>
      <Link href="/gifts" className={styles.textLink}>All gifts &amp; status →</Link>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {query.data && (
        <div className={styles.grid}>
          {query.data.map((g) => (
            <div key={g.id} role="link" tabIndex={0} aria-label={`Open ${g.name}`}
              onClick={(event) => { if (!(event.target as HTMLElement).closest("a")) router.push(`/gifts/${g.id}`); }}
              onKeyDown={(event) => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); router.push(`/gifts/${g.id}`); } }}>
              <GiftCard gift={g} />
            </div>
          ))}
        </div>
      )}
      {query.data?.length === 0 && (
        <Empty>No ideas yet. Tap + to catch the first one.</Empty>
      )}
    </div>
  );
}
