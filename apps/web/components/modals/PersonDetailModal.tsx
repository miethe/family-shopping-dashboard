"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Cake, Calendar, ExternalLink, Heart, Sparkles } from "@/components/ui/icons";
import { formatDate, getAge, getNextBirthday } from "@/lib/date-utils";
import { personApi } from "@/lib/api/endpoints";
import type { Person } from "@/types";
import { cn } from "@/lib/utils";

interface PersonDetailModalProps {
  personId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PersonDetailModal({
  personId,
  open,
  onOpenChange,
}: PersonDetailModalProps) {
  const { data: person, isLoading } = useQuery<Person>({
    queryKey: ["people", personId],
    queryFn: () => personApi.get(Number(personId)),
    enabled: !!personId && open,
  });

  if (!person && !isLoading) {
    return null;
  }

  const age = person?.birthdate ? getAge(person.birthdate) : null;
  const nextBirthday = person?.birthdate
    ? getNextBirthday(person.birthdate)
    : null;

  return (
    <EntityModal
      open={open}
      onOpenChange={onOpenChange}
      entityType="person"
      title={person?.display_name || "Loading..."}
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
              window.location.href = `/people/${personId}`;
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Profile
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
        </div>
      ) : person ? (
        <div className="space-y-6">
          {/* Hero Section with Avatar */}
          <div
            className={cn(
              "flex flex-col items-center text-center py-8",
              "bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50",
              "rounded-2xl border border-orange-100",
              "animate-in fade-in-0 zoom-in-95 duration-500"
            )}
          >
            <Avatar
              size="xl"
              className={cn(
                "ring-4 ring-white shadow-xl mb-4",
                "animate-in zoom-in-95 duration-700",
                "[animation-delay:100ms]"
              )}
            >
              {person.photo_url && (
                <AvatarImage src={person.photo_url} alt={person.display_name} />
              )}
              <AvatarFallback>
                {getInitials(person.display_name)}
              </AvatarFallback>
            </Avatar>

            <h2
              className={cn(
                "text-3xl font-bold text-warm-900 mb-2",
                "animate-in slide-in-from-bottom-4 fade-in-0 duration-500",
                "[animation-delay:200ms]"
              )}
            >
              {person.display_name}
            </h2>

            {person.relationship && (
              <Badge
                variant="default"
                className={cn(
                  "text-sm px-4 py-1",
                  "animate-in slide-in-from-bottom-4 fade-in-0 duration-500",
                  "[animation-delay:300ms]"
                )}
              >
                <Heart className="h-3 w-3 mr-1.5 text-orange-500" />
                {person.relationship}
              </Badge>
            )}
          </div>

          {/* Birthday Info */}
          {person.birthdate && (
            <div
              className={cn(
                "bg-gradient-to-br from-amber-50 to-orange-50",
                "rounded-xl p-5 border border-amber-200",
                "animate-in slide-in-from-left-4 fade-in-0 duration-500",
                "[animation-delay:400ms]"
              )}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="bg-amber-100 rounded-full p-3">
                    <Cake className="h-6 w-6 text-amber-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-warm-900 mb-1">Birthday</h3>
                  <p className="text-warm-700 mb-1">
                    {formatDate(person.birthdate)}
                    {age !== null && (
                      <span className="text-warm-600 ml-2">({age} years old)</span>
                    )}
                  </p>
                  {nextBirthday && (
                    <p className="text-sm text-warm-600">
                      <Calendar className="h-3 w-3 inline mr-1" />
                      {nextBirthday.isPast
                        ? `Was ${nextBirthday.daysUntil} days ago`
                        : nextBirthday.daysUntil === 0
                          ? "🎉 Today!"
                          : `${nextBirthday.daysUntil} days until next birthday`}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Interests */}
          {person.interests && person.interests.length > 0 && (
            <div
              className={cn(
                "animate-in slide-in-from-right-4 fade-in-0 duration-500",
                "[animation-delay:500ms]"
              )}
            >
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold text-warm-900">Interests</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {person.interests.map((interest, index) => (
                  <Badge
                    key={index}
                    variant="default"
                    className={cn(
                      "text-sm px-3 py-1.5",
                      "bg-gradient-to-br from-purple-50 to-pink-50",
                      "border-purple-200",
                      "hover:shadow-md transition-shadow",
                      "animate-in zoom-in-95 fade-in-0 duration-300",
                      `[animation-delay:${600 + index * 50}ms]`
                    )}
                  >
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div
            className={cn(
              "pt-4 border-t border-warm-200",
              "text-sm text-warm-600 space-y-1",
              "animate-in fade-in-0 duration-500",
              "[animation-delay:700ms]"
            )}
          >
            {person.created_at && (
              <p>Added on {formatDate(person.created_at)}</p>
            )}
            {person.updated_at && person.updated_at !== person.created_at && (
              <p>Last updated {formatDate(person.updated_at)}</p>
            )}
          </div>
        </div>
      ) : null}
    </EntityModal>
  );
}
