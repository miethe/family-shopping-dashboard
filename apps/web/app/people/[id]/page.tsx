"use client";
import { use } from "react";
import { PersonShelves } from "@/components/gifting/PersonShelves";
export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <PersonShelves id={Number(id)} />;
}
