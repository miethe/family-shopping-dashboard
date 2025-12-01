"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Gift as GiftIcon, DollarSign, Calendar, User, Tag, Edit, Trash2 } from "@/components/ui/icons";
import { formatDate } from "@/lib/date-utils";
import { formatPrice } from "@/lib/utils";
import { giftApi } from "@/lib/api/endpoints";
import { useDeleteGift } from "@/hooks/useGifts";
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
  const [activeTab, setActiveTab] = React.useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const { data: gift, isLoading } = useQuery<Gift>({
    queryKey: ["gifts", giftId],
    queryFn: () => giftApi.get(Number(giftId)),
    enabled: !!giftId && open,
  });

  const deleteGift = useDeleteGift();

  const handleDelete = async () => {
    if (!giftId) return;

    try {
      await deleteGift.mutateAsync(Number(giftId));
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Failed to delete gift:", error);
    }
  };

  const handleEdit = () => {
    if (!giftId) return;
    window.location.href = `/gifts/${giftId}/edit`;
  };

  // Reset tab when modal closes
  React.useEffect(() => {
    if (!open) {
      setActiveTab("overview");
    }
  }, [open]);

  if (!gift && !isLoading) {
    return null;
  }

  return (
    <>
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
                onClick={handleEdit}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
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
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-6">
              <TabsTrigger value="overview" className="flex-1">
                Overview
              </TabsTrigger>
              <TabsTrigger value="linked" className="flex-1">
                Linked Entities
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                History
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Hero Section with Image */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Image */}
                <div
                  className={cn(
                    "relative aspect-square rounded-2xl overflow-hidden",
                    "bg-gradient-to-br from-purple-50 via-fuchsia-50 to-pink-50",
                    "border border-purple-100",
                    "flex items-center justify-center"
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
                <div className="space-y-4">
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
                      <Badge variant="default" className="text-sm">
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
                  "text-sm text-warm-600 space-y-1"
                )}
              >
                {gift.created_at && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Added on {formatDate(gift.created_at)}</span>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Linked Entities Tab */}
            <TabsContent value="linked" className="space-y-4">
              <div
                className={cn(
                  "bg-warm-50 rounded-xl p-6 border border-warm-200",
                  "text-center"
                )}
              >
                <h3 className="font-semibold text-warm-900 text-lg mb-2">
                  Linked Entities
                </h3>
                <p className="text-warm-600 text-sm mb-4">
                  View which lists and occasions include this gift
                </p>
                <div className="text-warm-500 text-sm italic">
                  Coming soon: List and occasion associations will be displayed here
                </div>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              <div
                className={cn(
                  "bg-warm-50 rounded-xl p-6 border border-warm-200",
                  "text-center"
                )}
              >
                <h3 className="font-semibold text-warm-900 text-lg mb-2">
                  Activity History
                </h3>
                <p className="text-warm-600 text-sm mb-4">
                  Track changes and updates to this gift
                </p>
                <div className="text-warm-500 text-sm italic">
                  Coming soon: Activity log will be displayed here
                </div>
              </div>
            </TabsContent>
          </Tabs>
        ) : null}
      </EntityModal>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gift</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{gift?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
              disabled={deleteGift.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteGift.isPending}
            >
              {deleteGift.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
