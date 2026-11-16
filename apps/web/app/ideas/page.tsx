"use client";
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
  return (
    <div className={styles.page}>
      <Hero eyebrow="Thoughts worth keeping" title="Ideas">
        <p>Saved for someone, or for a moment still to come.</p>
      </Hero>
      <QueryState
        loading={query.isLoading}
        error={query.error}
        retry={() => query.refetch()}
      />
      {query.data && (
        <div className={styles.grid}>
          {query.data.map((g) => (
            <GiftCard gift={g} key={g.id} />
          ))}
        </div>
      )}
      {query.data?.length === 0 && (
        <Empty>No ideas yet. Tap + to catch the first one.</Empty>
      )}
    </div>
  );
}
