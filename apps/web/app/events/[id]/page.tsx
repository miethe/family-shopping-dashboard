"use client";
import { use } from "react";
import { EventOccurrence } from "@/components/gifting/EventOccurrence";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <EventOccurrence id={Number(id)} />;
}
