"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Cake, Sparkles, Calendar as CalendarIcon, ExternalLink, Clock, Edit, Trash2, Heart, Lightbulb, CheckSquare, Plus } from "@/components/ui/icons";
import { formatDate, getDaysUntil } from "@/lib/date-utils";
import { occasionApi } from "@/lib/api/endpoints";
import { useDeleteOccasion } from "@/hooks/useOccasions";
import { useListsForOccasion } from "@/hooks/useLists";
import { AddOccasionModal } from "@/components/occasions/AddOccasionModal";
import { AddListModal } from "@/components/lists/AddListModal";
import { ListDetailModal } from "./ListDetailModal";
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

export function OccasionDetailModal({
  occasionId,
  open,
  onOpenChange,
}: OccasionDetailModalProps) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showAddListModal, setShowAddListModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [selectedListId, setSelectedListId] = React.useState<string | null>(null);

  const { data: occasion, isLoading } = useQuery<Occasion>({
    queryKey: ["occasions", occasionId],
    queryFn: () => occasionApi.get(Number(occasionId)),
    enabled: !!occasionId && open,
  });

  // Fetch lists attached to this occasion
  const { data: listsData, isLoading: listsLoading } = useListsForOccasion(
    occasionId ? Number(occasionId) : undefined,
    { enabled: open }
  );

  const deleteMutation = useDeleteOccasion();

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setShowDeleteConfirm(false);
      setShowEditModal(false);
      setShowAddListModal(false);
      setActiveTab("overview");
      setSelectedListId(null);
    }
  }, [open]);

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

  const handleDelete = async () => {
    if (!occasionId) return;

    try {
      await deleteMutation.mutateAsync(Number(occasionId));

      toast({
        title: "Success",
        description: "Occasion deleted successfully",
      });

      // Close modal
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete occasion",
        variant: "error",
      });
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    toast({
      title: "Success",
      description: "Occasion updated successfully",
    });
  };

  return (
    <>
      <EntityModal
        open={open}
        onOpenChange={onOpenChange}
        entityType="occasion"
        title={occasion?.name || "Loading..."}
        size="lg"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between w-full">
          {/* Left side: Delete button */}
          <div className="flex gap-3">
            {!showDeleteConfirm && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={deleteMutation.isPending}
                className="border-status-warning-500 text-status-warning-600 hover:bg-status-warning-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
            {showDeleteConfirm && (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={deleteMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="border-status-warning-500 bg-status-warning-500 text-white hover:bg-status-warning-600"
                >
                  {deleteMutation.isPending ? "Deleting..." : "Confirm Delete"}
                </Button>
              </>
            )}
          </div>

          {/* Right side: Main action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto">
            <Button
              variant="outline"
              size="md"
              onClick={() => setShowEditModal(true)}
              disabled={showDeleteConfirm}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
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
              "rounded-2xl p-8 border border-amber-100"
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
              <div className="flex items-center gap-3 mb-4">
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
              <h2 className="text-3xl font-bold text-warm-900 mb-2">
                {occasion.name}
              </h2>

              {/* Date */}
              <div className="flex items-center gap-2 text-warm-700 mb-4">
                <CalendarIcon className="h-5 w-5" />
                <span className="text-lg">{formatDate(occasion.date)}</span>
              </div>

              {/* Countdown */}
              {daysUntil !== null && (
                <div
                  className={cn(
                    "inline-flex items-center gap-2 px-6 py-3 rounded-full",
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

          {/* Tabs */}
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
              {/* Description */}
              {occasion.description && (
                <div
                  className={cn(
                    "bg-warm-50 rounded-xl p-5 border border-warm-200"
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
                  "text-sm text-warm-600 space-y-1"
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
            </TabsContent>

            {/* Linked Entities Tab */}
            <TabsContent value="linked" className="space-y-4">
              {listsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500" />
                </div>
              ) : listsData?.items && listsData.items.length > 0 ? (
                <div className="space-y-3">
                  <h3 className="font-semibold text-warm-900 text-sm mb-3">
                    Lists for this occasion
                  </h3>

                  {/* Add New List Card */}
                  <button
                    onClick={() => setShowAddListModal(true)}
                    className={cn(
                      "w-full text-left",
                      "bg-white rounded-xl p-4 border-2 border-dashed border-warm-300",
                      "hover:border-blue-500 hover:bg-blue-50/50",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      "min-h-[44px]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warm-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <Plus className="h-5 w-5 text-warm-400 group-hover:text-blue-500" />
                      </div>
                      <span className="text-sm font-medium text-warm-600 group-hover:text-blue-600">
                        Add New List
                      </span>
                    </div>
                  </button>

                  {listsData.items.map((list) => {
                    const listConfig = listTypeConfig[list.type as keyof typeof listTypeConfig];
                    const ListIcon = listConfig?.icon;

                    return (
                      <button
                        key={list.id}
                        onClick={() => setSelectedListId(String(list.id))}
                        className={cn(
                          "w-full text-left",
                          "bg-gradient-to-br from-blue-50 to-cyan-50",
                          "rounded-xl p-4 border border-blue-100",
                          "hover:shadow-md hover:border-blue-200 transition-all",
                          "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                          "min-h-[44px]"
                        )}
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {ListIcon && (
                              <div
                                className={cn(
                                  "flex-shrink-0 rounded-lg p-2",
                                  listConfig.bgColor
                                )}
                              >
                                <ListIcon className={cn("h-5 w-5", listConfig.iconColor)} />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="default" className="text-xs">
                                  {listConfig?.label}
                                </Badge>
                              </div>
                              <div className="font-semibold text-warm-900 truncate">
                                {list.name}
                              </div>
                              <div className="text-xs text-warm-600">
                                {list.item_count || 0} {list.item_count === 1 ? 'item' : 'items'}
                              </div>
                            </div>
                          </div>
                          <ExternalLink className="h-4 w-4 text-warm-400 flex-shrink-0" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Add New List Card */}
                  <button
                    onClick={() => setShowAddListModal(true)}
                    className={cn(
                      "w-full text-left",
                      "bg-white rounded-xl p-4 border-2 border-dashed border-warm-300",
                      "hover:border-blue-500 hover:bg-blue-50/50",
                      "transition-all duration-200",
                      "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                      "min-h-[44px]"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-warm-100 hover:bg-blue-100 flex items-center justify-center transition-colors">
                        <Plus className="h-5 w-5 text-warm-400 group-hover:text-blue-500" />
                      </div>
                      <span className="text-sm font-medium text-warm-600 group-hover:text-blue-600">
                        Add New List
                      </span>
                    </div>
                  </button>

                  <div
                    className={cn(
                      "bg-warm-50 rounded-xl p-6 border border-warm-200",
                      "text-center"
                    )}
                  >
                    <h3 className="font-semibold text-warm-900 text-lg mb-2">
                      No Lists Attached
                    </h3>
                    <p className="text-warm-600 text-sm">
                      No lists have been created for this occasion yet
                    </p>
                  </div>
                </div>
              )}
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
                  Track changes and updates to this occasion
                </p>
                <div className="text-warm-500 text-sm italic">
                  Coming soon: Activity log will be displayed here
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      ) : null}
      </EntityModal>

      {/* Edit Modal */}
      {occasion && (
        <AddOccasionModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          mode="edit"
          occasionToEdit={occasion}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* List Detail Modal */}
      <ListDetailModal
        listId={selectedListId}
        open={!!selectedListId}
        onOpenChange={(open) => !open && setSelectedListId(null)}
      />

      {/* Add List Modal */}
      <AddListModal
        isOpen={showAddListModal}
        onClose={() => setShowAddListModal(false)}
        mode="create"
      />
    </>
  );
}
