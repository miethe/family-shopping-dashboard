"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Gift as GiftIcon, DollarSign, Calendar, User, Tag } from "@/components/ui/icons";
import { formatDate } from "@/lib/date-utils";
import { formatPrice } from "@/lib/utils";
import type { Gift } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface GiftDetailModalProps {
  giftId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GiftDetailModal({
  giftId,
  open,
  onOpenChange,
}: GiftDetailModalProps) {
  const { data: gift, isLoading } = useQuery<Gift>({
    queryKey: ["gifts", giftId],
    queryFn: async () => {
      const res = await fetch(`/api/gifts/${giftId}`);
      if (!res.ok) throw new Error("Failed to fetch gift");
      return res.json();
    },
    enabled: !!giftId && open,
  });

  if (!gift && !isLoading) {
    return null;
  }

  return (
    <EntityModal
      open={open}
      onOpenChange={onOpenChange}
      entityType="gift"
      title={gift?.name || "Loading..."}
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between">
          <div className="flex gap-3">
            {gift?.url && (
              <Button
                variant="outline"
                size="md"
                onClick={() => window.open(gift.url!, "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                View Product
              </Button>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              size="md"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={() => {
                window.location.href = `/gifts/${giftId}`;
              }}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              View Full Details
            </Button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
        </div>
      ) : gift ? (
        <div className="space-y-6">
          {/* Hero Section with Image */}
          <div
            className={cn(
              "grid md:grid-cols-2 gap-6",
              "animate-in fade-in-0 zoom-in-95 duration-500"
            )}
          >
            {/* Image */}
            <div
              className={cn(
                "relative aspect-square rounded-2xl overflow-hidden",
                "bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50",
                "border border-purple-100",
                "flex items-center justify-center",
                "animate-in slide-in-from-left-4 fade-in-0 duration-500",
                "[animation-delay:100ms]"
              )}
            >
              {gift.image_url ? (
                <Image
                  src={gift.image_url}
                  alt={gift.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="flex flex-col items-center text-purple-300">
                  <GiftIcon className="h-24 w-24 mb-2" />
                  <p className="text-sm text-purple-400">No image available</p>
                </div>
              )}
            </div>

            {/* Info */}
            <div
              className={cn(
                "space-y-4",
                "animate-in slide-in-from-right-4 fade-in-0 duration-500",
                "[animation-delay:200ms]"
              )}
            >
              <h2 className="text-2xl font-bold text-warm-900 leading-tight">
                {gift.name}
              </h2>

              {/* Price */}
              {gift.price !== null && gift.price !== undefined && (
                <div
                  className={cn(
                    "flex items-center gap-3",
                    "bg-gradient-to-br from-green-50 to-emerald-50",
                    "rounded-xl p-4 border border-green-200"
                  )}
                >
                  <div className="bg-green-100 rounded-full p-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-warm-600 mb-0.5">Price</p>
                    <p className="text-2xl font-bold text-warm-900">
                      {formatPrice(gift.price)}
                    </p>
                  </div>
                </div>
              )}

              {/* Source */}
              {gift.source && (
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4 text-warm-500" />
                  <Badge variant="secondary" className="text-sm">
                    {gift.source}
                  </Badge>
                </div>
              )}

              {/* Extra Data */}
              {gift.extra_data && Object.keys(gift.extra_data).length > 0 && (
                <div
                  className={cn(
                    "bg-warm-50 rounded-xl p-4 border border-warm-200",
                    "space-y-2"
                  )}
                >
                  <h3 className="font-semibold text-warm-900 text-sm mb-2">
                    Additional Details
                  </h3>
                  <div className="space-y-1.5 text-sm">
                    {Object.entries(gift.extra_data).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-warm-600 capitalize">
                          {key.replace(/_/g, " ")}:
                        </span>
                        <span className="text-warm-900 font-medium">
                          {String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Metadata */}
          <div
            className={cn(
              "pt-4 border-t border-warm-200",
              "text-sm text-warm-600 space-y-1",
              "animate-in fade-in-0 duration-500",
              "[animation-delay:400ms]"
            )}
          >
            {gift.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Added on {formatDate(gift.created_at)}</span>
              </div>
            )}
            {gift.user_id && (
              <div className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" />
                <span>Added by User {gift.user_id}</span>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </EntityModal>
  );
}
