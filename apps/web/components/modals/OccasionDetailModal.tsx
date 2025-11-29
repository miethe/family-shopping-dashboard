"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cake, Sparkles, Calendar as CalendarIcon, ExternalLink, Clock } from "@/components/ui/icons";
import { formatDate, getDaysUntil } from "@/lib/date-utils";
import type { Occasion } from "@/types";
import { cn } from "@/lib/utils";

interface OccasionDetailModalProps {
  occasionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const occasionTypeConfig = {
  birthday: {
    icon: Cake,
    label: "Birthday",
    bgColor: "bg-pink-100",
    iconColor: "text-pink-600",
    gradient: "from-pink-500/20 via-rose-500/20 to-red-500/20",
  },
  holiday: {
    icon: Sparkles,
    label: "Holiday",
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600",
    gradient: "from-purple-500/20 via-fuchsia-500/20 to-pink-500/20",
  },
  anniversary: {
    icon: CalendarIcon,
    label: "Anniversary",
    bgColor: "bg-amber-100",
    iconColor: "text-amber-600",
    gradient: "from-amber-500/20 via-yellow-500/20 to-orange-500/20",
  },
  other: {
    icon: CalendarIcon,
    label: "Other",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
    gradient: "from-blue-500/20 via-cyan-500/20 to-teal-500/20",
  },
};

export function OccasionDetailModal({
  occasionId,
  open,
  onOpenChange,
}: OccasionDetailModalProps) {
  const { data: occasion, isLoading } = useQuery<Occasion>({
    queryKey: ["occasions", occasionId],
    queryFn: async () => {
      const res = await fetch(`/api/occasions/${occasionId}`);
      if (!res.ok) throw new Error("Failed to fetch occasion");
      return res.json();
    },
    enabled: !!occasionId && open,
  });

  if (!occasion && !isLoading) {
    return null;
  }

  const typeConfig = occasion
    ? occasionTypeConfig[occasion.type] || occasionTypeConfig.other
    : null;
  const TypeIcon = typeConfig?.icon;

  const daysUntil = occasion?.date ? getDaysUntil(occasion.date) : null;
  const isPast = daysUntil !== null && daysUntil < 0;
  const isToday = daysUntil === 0;

  return (
    <EntityModal
      open={open}
      onOpenChange={onOpenChange}
      entityType="occasion"
      title={occasion?.name || "Loading..."}
      size="lg"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
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
              window.location.href = `/occasions/${occasionId}`;
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500" />
        </div>
      ) : occasion ? (
        <div className="space-y-6">
          {/* Hero Section */}
          <div
            className={cn(
              "relative overflow-hidden",
              "bg-gradient-to-br",
              typeConfig?.gradient,
              "rounded-2xl p-8 border border-amber-100",
              "animate-in fade-in-0 zoom-in-95 duration-500"
            )}
          >
            {/* Decorative background element */}
            <div
              className={cn(
                "absolute -top-20 -right-20 w-64 h-64 rounded-full",
                "bg-gradient-to-br from-white/40 to-transparent",
                "blur-3xl"
              )}
            />

            <div className="relative z-10">
              {/* Icon and Type */}
              <div
                className={cn(
                  "flex items-center gap-3 mb-4",
                  "animate-in slide-in-from-left-4 fade-in-0 duration-500",
                  "[animation-delay:100ms]"
                )}
              >
                {TypeIcon && (
                  <div className={cn("rounded-xl p-3", typeConfig.bgColor)}>
                    <TypeIcon className={cn("h-6 w-6", typeConfig.iconColor)} />
                  </div>
                )}
                <Badge variant="default" className="text-sm">
                  {typeConfig?.label}
                </Badge>
              </div>

              {/* Name */}
              <h2
                className={cn(
                  "text-3xl font-bold text-warm-900 mb-2",
                  "animate-in slide-in-from-left-4 fade-in-0 duration-500",
                  "[animation-delay:200ms]"
                )}
              >
                {occasion.name}
              </h2>

              {/* Date */}
              <div
                className={cn(
                  "flex items-center gap-2 text-warm-700 mb-4",
                  "animate-in slide-in-from-left-4 fade-in-0 duration-500",
                  "[animation-delay:300ms]"
                )}
              >
                <CalendarIcon className="h-5 w-5" />
                <span className="text-lg">{formatDate(occasion.date)}</span>
              </div>

              {/* Countdown */}
              {daysUntil !== null && (
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 rounded-full",
                    "animate-in slide-in-from-left-4 fade-in-0 duration-500",
                    "[animation-delay:400ms]",
                    isToday
                      ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50"
                      : isPast
                        ? "bg-warm-100 text-warm-700"
                        : "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/50"
                  )}
                >
                  <Clock className="h-5 w-5" />
                  <span className="font-semibold text-lg">
                    {isToday
                      ? "🎉 Today!"
                      : isPast
                        ? `${Math.abs(daysUntil)} days ago`
                        : `${daysUntil} days to go`}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          {occasion.description && (
            <div
              className={cn(
                "bg-warm-50 rounded-xl p-5 border border-warm-200",
                "animate-in slide-in-from-bottom-4 fade-in-0 duration-500",
                "[animation-delay:500ms]"
              )}
            >
              <h3 className="font-semibold text-warm-900 mb-2">Description</h3>
              <p className="text-warm-700 leading-relaxed">
                {occasion.description}
              </p>
            </div>
          )}

          {/* Metadata */}
          <div
            className={cn(
              "pt-4 border-t border-warm-200",
              "text-sm text-warm-600 space-y-1",
              "animate-in fade-in-0 duration-500",
              "[animation-delay:600ms]"
            )}
          >
            {occasion.created_at && (
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Created on {formatDate(occasion.created_at)}</span>
              </div>
            )}
            {occasion.updated_at && occasion.updated_at !== occasion.created_at && (
              <p>Last updated {formatDate(occasion.updated_at)}</p>
            )}
          </div>
        </div>
      ) : null}
    </EntityModal>
  );
}
