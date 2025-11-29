"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ExternalLink,
  Heart,
  Lightbulb,
  CheckSquare,
  Eye,
  EyeOff,
  Calendar,
  ShoppingBag,
  Gift as GiftIcon,
} from "@/components/ui/icons";
import { formatDate } from "@/lib/date-utils";
import { formatPrice } from "@/lib/utils";
import { listApi } from "@/lib/api/endpoints";
import type { ListWithItems } from "@/types";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ListDetailModalProps {
  listId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const listTypeConfig = {
  wishlist: {
    icon: Heart,
    label: "Wishlist",
    bgColor: "bg-rose-100",
    iconColor: "text-rose-600",
  },
  ideas: {
    icon: Lightbulb,
    label: "Ideas",
    bgColor: "bg-amber-100",
    iconColor: "text-amber-600",
  },
  assigned: {
    icon: CheckSquare,
    label: "Assigned",
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600",
  },
};

const visibilityConfig = {
  private: { icon: EyeOff, label: "Private" },
  family: { icon: Eye, label: "Family" },
  public: { icon: Eye, label: "Public" },
};

export function ListDetailModal({
  listId,
  open,
  onOpenChange,
}: ListDetailModalProps) {
  const { data: list, isLoading } = useQuery<ListWithItems>({
    queryKey: ["lists", listId],
    queryFn: () => listApi.get(Number(listId)),
    enabled: !!listId && open,
  });

  if (!list && !isLoading) {
    return null;
  }

  const typeConfig = list ? listTypeConfig[list.type] : null;
  const TypeIcon = typeConfig?.icon;
  const visConfig = list ? visibilityConfig[list.visibility] : null;
  const VisIcon = visConfig?.icon;

  const totalValue = list?.items?.reduce((sum, item) => {
    return sum + (item.gift.price || 0);
  }, 0);

  return (
    <EntityModal
      open={open}
      onOpenChange={onOpenChange}
      entityType="list"
      title={list?.name || "Loading..."}
      size="xl"
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
              window.location.href = `/lists/${listId}`;
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            Manage List
          </Button>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
        </div>
      ) : list ? (
        <div className="space-y-6">
          {/* Header Info */}
          <div
            className={cn(
              "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
              "bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50",
              "rounded-2xl p-5 border border-blue-100"
            )}
          >
            <div className="flex items-center gap-4">
              {TypeIcon && (
                <div
                  className={cn(
                    "flex-shrink-0 rounded-xl p-3",
                    typeConfig.bgColor
                  )}
                >
                  <TypeIcon className={cn("h-6 w-6", typeConfig.iconColor)} />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="default" className="text-xs">
                    {typeConfig?.label}
                  </Badge>
                  {VisIcon && (
                    <Badge variant="default" className="text-xs">
                      <VisIcon className="h-3 w-3 mr-1" />
                      {visConfig?.label}
                    </Badge>
                  )}
                </div>
                <h2 className="text-xl font-bold text-warm-900">
                  {list.name}
                </h2>
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-warm-900">
                  {list.item_count || list.items?.length || 0}
                </div>
                <div className="text-xs text-warm-600">Items</div>
              </div>
              {totalValue !== undefined && totalValue > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-warm-900">
                    {formatPrice(totalValue)}
                  </div>
                  <div className="text-xs text-warm-600">Total Value</div>
                </div>
              )}
            </div>
          </div>

          {/* Items Grid */}
          {list.items && list.items.length > 0 ? (
            <div>
              <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-blue-500" />
                List Items
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {list.items.map((item, index) => (
                  <Card
                    key={item.id}
                    variant="elevated"
                    padding="none"
                    className="overflow-hidden hover:shadow-lg transition-all duration-200"
                  >
                    {/* Gift Image */}
                    <div className="relative aspect-square bg-gradient-to-br from-purple-50 to-pink-50">
                      {item.gift.image_url ? (
                        <Image
                          src={item.gift.image_url}
                          alt={item.gift.name}
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <GiftIcon className="h-16 w-16 text-purple-200" />
                        </div>
                      )}
                      {item.status && (
                        <div className="absolute top-2 right-2">
                          <Badge
                            variant="default"
                            className="text-xs bg-white/90 backdrop-blur-sm"
                          >
                            {item.status}
                          </Badge>
                        </div>
                      )}
                    </div>

                    {/* Gift Info */}
                    <div className="p-4">
                      <h4 className="font-semibold text-warm-900 mb-1 line-clamp-2">
                        {item.gift.name}
                      </h4>
                      {item.gift.price !== null &&
                        item.gift.price !== undefined && (
                          <p className="text-lg font-bold text-blue-600 mb-2">
                            {formatPrice(item.gift.price)}
                          </p>
                        )}
                      {item.notes && (
                        <p className="text-sm text-warm-600 line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "text-center py-12",
                "bg-warm-50 rounded-xl border-2 border-dashed border-warm-200"
              )}
            >
              <ShoppingBag className="h-12 w-12 text-warm-300 mx-auto mb-3" />
              <p className="text-warm-600">This list is empty</p>
            </div>
          )}

          {/* Metadata */}
          <div
            className={cn(
              "pt-4 border-t border-warm-200",
              "text-sm text-warm-600 space-y-1"
            )}
          >
            {list.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" />
                <span>Created on {formatDate(list.created_at)}</span>
              </div>
            )}
            {list.person_id && (
              <p>Associated with Person ID: {list.person_id}</p>
            )}
            {list.occasion_id && (
              <p>Associated with Occasion ID: {list.occasion_id}</p>
            )}
          </div>
        </div>
      ) : null}
    </EntityModal>
  );
}
