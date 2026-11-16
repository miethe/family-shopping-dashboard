"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  phases,
  phaseLabel,
  type GiftCardData,
  type Totals,
} from "@/lib/api/gifting";
import styles from "./gifting.module.css";
export { styles };
export const money = (value: string | number | null | undefined) =>
  value == null
    ? "Not set"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 2,
      }).format(Number(value));
export const dateLabel = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
export function Hero({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <header className={styles.hero}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h1>{title}</h1>
      {children}
      <span className={styles.sprig} aria-hidden="true">
        ✦
      </span>
    </header>
  );
}
export function QueryState({
  loading,
  error,
  retry,
}: {
  loading: boolean;
  error: unknown;
  retry: () => void;
}) {
  if (loading)
    return (
      <p className={styles.empty} role="status">
        Gathering your gifts…
      </p>
    );
  if (error)
    return (
      <div className={styles.empty} role="alert">
        <p>We couldn’t load this. Please try again.</p>
        <Button onClick={retry}>Try again</Button>
      </div>
    );
  return null;
}
export function PhaseCounts({ totals }: { totals: Totals }) {
  return (
    <div className={styles.phases}>
      {phases.map((p) => (
        <div key={p} data-phase={p}>
          <span>{phaseLabel[p]}</span>
          <strong>{totals.phases[p]}</strong>
        </div>
      ))}
    </div>
  );
}
export function StoreLink({ url }: { url: string | null }) {
  // Reject unsafe legacy links too, not only newly captured URLs.
  if (!url || !/^https?:\/\//i.test(url)) return null;
  return (
    <a
      className={styles.store}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      Open link ↗
    </a>
  );
}
export function GiftCard({
  gift,
  compact = false,
  children,
}: {
  gift: GiftCardData;
  compact?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <article className={compact ? styles.compactGift : styles.gift}>
      <span className={styles.giftMark} aria-hidden="true">
        ✧
      </span>
      <div className="min-w-0">
        <h3>{gift.name}</h3>
        <p>
          {gift.price == null ? "Price unknown" : money(gift.price)}
          {gift.quantity > 1 ? ` × ${gift.quantity}` : ""}
        </p>
        {compact && gift.phase === "given" && <small>Given</small>}
        <StoreLink url={gift.url} />
      </div>
      {children}
    </article>
  );
}
export function Shelves({
  title,
  count,
  children,
  open = true,
}: {
  title: string;
  count: number;
  children: React.ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className={styles.shelf}>
      <summary>
        {title}
        <span>{count}</span>
      </summary>
      <div className={styles.shelfBody}>{children}</div>
    </details>
  );
}
export function Empty({ children }: { children: React.ReactNode }) {
  return <p className={styles.empty}>{children}</p>;
}
export function EventLink({
  id,
  children,
}: {
  id: number;
  children: React.ReactNode;
}) {
  return (
    <Link className={styles.textLink} href={`/events/${id}`}>
      {children} →
    </Link>
  );
}
