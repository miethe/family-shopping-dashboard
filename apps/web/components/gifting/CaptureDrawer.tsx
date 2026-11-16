"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePersons } from "@/hooks/usePersons";
import { useOccurrences, useGiftingMutation } from "@/hooks/useGifting";
import { giftingApi, type Capture } from "@/lib/api/gifting";
import { StoreLink, styles, dateLabel } from "./shared";

export function CaptureDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const people = usePersons({ limit: 100 }, { enabled: isOpen });
  const occurrences = useOccurrences();
  const [person, setPerson] = useState("");
  const [url, setUrl] = useState("");
  const save = useGiftingMutation((data: Capture) => giftingApi.capture(data));
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className={styles.drawer}>
        <p className={styles.eyebrow}>Keep a good thought</p>
        <DialogTitle className="font-serif text-3xl mt-3">
          Save an idea
        </DialogTitle>
        <DialogDescription className="mt-2">
          A person now, an event whenever you’re ready.
        </DialogDescription>
        <form
          className={styles.form}
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const occurrence = String(form.get("occurrence") || "");
            save.mutate(
              {
                name: String(form.get("name")).trim(),
                kind: String(form.get("kind")) as Capture["kind"],
                ...(url ? { url } : {}),
                ...(form.get("price")
                  ? { price: String(form.get("price")) }
                  : {}),
                ...(person ? { person_id: Number(person) } : {}),
                ...(occurrence ? { occurrence_id: Number(occurrence) } : {}),
              },
              {
                onSuccess: () => {
                  onClose();
                  setUrl("");
                  setPerson("");
                  router.push("/ideas");
                },
              },
            );
          }}
        >
          <Input
            label="Gift name"
            name="name"
            required
            maxLength={255}
            placeholder="What caught your eye?"
          />
          <Input
            label="Source link (optional)"
            name="url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
          <div className={styles.fields}>
            <Input
              label="Price (optional)"
              name="price"
              type="number"
              min="0"
              step="0.01"
              placeholder="Not known"
            />
            <label className={styles.label}>
              Save to
              <select name="kind" className={styles.select}>
                <option value="ideas">Ideas</option>
                <option value="wishlist" disabled={!person}>
                  Wishlist
                </option>
              </select>
            </label>
          </div>
          <label className={styles.label}>
            Recipient
            <select
              name="person"
              className={styles.select}
              value={person}
              onChange={(e) => setPerson(e.target.value)}
            >
              <option value="">Decide later</option>
              {people.data?.items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.label}>
            Event (optional)
            <select
              name="occurrence"
              className={styles.select}
              disabled={!person}
              key={person}
            >
              <option value="">No event yet</option>
              {occurrences.data
                ?.filter((o) => !o.closed)
                .map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.name} · {dateLabel(o.date)}
                  </option>
                ))}
            </select>
          </label>
          {(people.error || occurrences.error) && (
            <p role="alert">
              Some choices couldn’t load. You can save an unassigned idea.
            </p>
          )}
          {save.error && (
            <p role="alert" className={styles.error}>
              {save.error.message}
            </p>
          )}
          <Button type="submit" disabled={save.isPending}>
            {save.isPending ? "Saving…" : "Save idea"}
          </Button>
          <StoreLink url={url} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
