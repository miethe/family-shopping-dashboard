"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { GiftEditModal } from "@/components/gifts";
import { useGift } from "@/hooks/useGift";
import { PageHeader } from "@/components/layout";

type GiftEditPageProps = {
  params: Promise<{ id: string }>;
};

export default function GiftEditPage({ params }: GiftEditPageProps) {
  const router = useRouter();
  const { id } = use(params);
  const giftId = Number(id);
  const { data: gift, isLoading, error } = useGift(giftId);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!open) {
      // Navigate back to gift detail (or list page if missing) when modal closes
      router.push(gift ? `/gifts/${giftId}` : "/gifts");
    }
  }, [open, router, gift, giftId]);

  if (isLoading) {
    return (
      <div className="space-y-4 p-6">
        <PageHeader title="Loading gift..." backHref="/gifts" />
        <p className="text-sm text-slate-600">Fetching gift details.</p>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div className="space-y-4 p-6">
        <PageHeader title="Gift not found" backHref="/gifts" />
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
          Unable to load this gift. It may have been deleted or the link is invalid.
        </div>
      </div>
    );
  }

  return (
    <GiftEditModal
      gift={gift}
      isOpen={open}
      onClose={() => setOpen(false)}
      onSuccess={() => {
        setOpen(false);
        router.push(`/gifts/${giftId}`);
      }}
    />
  );
}
