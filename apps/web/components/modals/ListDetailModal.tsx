"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
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
  Edit,
  Trash2,
  Plus,
} from "@/components/ui/icons";
import { formatDate } from "@/lib/date-utils";
import { formatPrice } from "@/lib/utils";
import { listApi } from "@/lib/api/endpoints";
import { useDeleteList } from "@/hooks/useLists";
import { AddListModal } from "@/components/lists/AddListModal";
import { AddListItemModal } from "@/components/lists/AddListItemModal";
import { GiftDetailModal } from "./GiftDetailModal";
import { PersonDetailModal } from "./PersonDetailModal";
import { GiftImage } from "@/components/common/GiftImage";
import { usePerson } from "@/hooks/usePersons";
import { useOccasion } from "@/hooks/useOccasions";
import type { ListWithItems, ListItemStatus, ListItemWithGift } from "@/types";
import { cn } from "@/lib/utils";

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

// Status filter configuration
type StatusFilter = 'all' | ListItemStatus;

const statusFilters: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'idea', label: 'Ideas' },
  { value: 'purchased', label: 'Purchased' },
  { value: 'received', label: 'Gifted' },
];

// Status badge colors mapping
const statusColors: Record<ListItemStatus, string> = {
  idea: 'bg-amber-100 text-amber-800 border-amber-200',
  to_buy: 'bg-rose-100 text-rose-800 border-rose-200',
  selected: 'bg-blue-100 text-blue-800 border-blue-200',
  purchased: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  received: 'bg-purple-100 text-purple-800 border-purple-200',
  gifted: 'bg-purple-100 text-purple-800 border-purple-200',
};

export function ListDetailModal({
  listId,
  open,
  onOpenChange,
}: ListDetailModalProps) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showAddItemModal, setShowAddItemModal] = React.useState(false);
  const [selectedGiftId, setSelectedGiftId] = React.useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(null);
  const [statusFilter, setStatusFilter] = React.useState<StatusFilter>('all');
  const [activeTab, setActiveTab] = React.useState("overview");

  const { data: list, isLoading } = useQuery<ListWithItems>({
    queryKey: ["lists", listId],
    queryFn: () => listApi.get(Number(listId)),
    enabled: !!listId && open,
  });

  // Fetch attached person and occasion details
  const { data: attachedPerson } = usePerson(list?.person_id || 0);
  const { data: attachedOccasion } = useOccasion(list?.occasion_id || 0);

  const deleteMutation = useDeleteList();

  // Filter items based on selected status
  const filteredItems = React.useMemo(() => {
    if (!list?.items) return [];
    if (statusFilter === 'all') return list.items;
    return list.items.filter(item => item.status === statusFilter);
  }, [list?.items, statusFilter]);

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setShowDeleteConfirm(false);
      setShowEditModal(false);
      setShowAddItemModal(false);
      setSelectedGiftId(null);
      setSelectedPersonId(null);
      setStatusFilter('all');
      setActiveTab("overview");
    }
  }, [open]);

  if (!list && !isLoading) {
    return null;
  }

  const typeConfig = list ? listTypeConfig[list.type] : null;
  const TypeIcon = typeConfig?.icon;
  const visConfig = list ? visibilityConfig[list.visibility] : null;
  const VisIcon = visConfig?.icon;

  const totalValue = list?.items?.reduce((sum, item) => {
    return sum + (item.gift?.price || 0);
  }, 0);

  const handleDelete = async () => {
    if (!listId) return;

    try {
      await deleteMutation.mutateAsync(Number(listId));

      toast({
        title: "Success",
        description: "List deleted successfully",
      });

      // Close modal
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete list",
        variant: "error",
      });
    }
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    toast({
      title: "Success",
      description: "List updated successfully",
    });
  };

  const handleAddItemClick = () => {
    setShowAddItemModal(true);
  };

  const handleGiftCardClick = (giftId: number) => {
    setSelectedGiftId(String(giftId));
  };

  const handleAddItemSuccess = () => {
    setShowAddItemModal(false);
    toast({
      title: "Success",
      description: "Item added to list successfully",
    });
  };

  return (
    <>
      <EntityModal
        open={open}
        onOpenChange={onOpenChange}
        entityType="list"
        title={list?.name || "Loading..."}
        size="xl"
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
                  window.location.href = `/lists/${listId}`;
                }}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Manage List
              </Button>
            </div>
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

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="overview" className="flex-1">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="items" className="flex-1">
                  Items
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
                <div
                  className={cn(
                    "bg-warm-50 rounded-xl p-6 border border-warm-200"
                  )}
                >
                  <h3 className="font-semibold text-warm-900 text-lg mb-2">
                    List Information
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-warm-600">Type:</span>
                      <span className="font-medium text-warm-900">{typeConfig?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-600">Visibility:</span>
                      <span className="font-medium text-warm-900">{visConfig?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-warm-600">Total Items:</span>
                      <span className="font-medium text-warm-900">
                        {list.item_count || list.items?.length || 0}
                      </span>
                    </div>
                    {totalValue !== undefined && totalValue > 0 && (
                      <div className="flex justify-between">
                        <span className="text-warm-600">Total Value:</span>
                        <span className="font-medium text-warm-900">
                          {formatPrice(totalValue)}
                        </span>
                      </div>
                    )}
                    {list.created_at && (
                      <div className="flex justify-between pt-3 border-t border-warm-200">
                        <span className="text-warm-600">Created:</span>
                        <span className="font-medium text-warm-900">
                          {formatDate(list.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Items Tab */}
              <TabsContent value="items" className="space-y-6">
                {/* Status Filter Tabs */}
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((filter) => (
                    <button
                      key={filter.value}
                      onClick={() => setStatusFilter(filter.value)}
                      className={cn(
                        "px-4 py-2 rounded-lg font-medium text-sm transition-all min-h-[44px]",
                        statusFilter === filter.value
                          ? "bg-blue-500 text-white shadow-md"
                          : "bg-warm-100 text-warm-700 hover:bg-warm-200"
                      )}
                    >
                      {filter.label}
                      {filter.value !== 'all' && list.items && (
                        <span className="ml-2 opacity-75">
                          ({list.items.filter(item => item.status === filter.value).length})
                        </span>
                      )}
                      {filter.value === 'all' && list.items && (
                        <span className="ml-2 opacity-75">
                          ({list.items.length})
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Gift Catalog Grid */}
                <div>
                  <h3 className="font-semibold text-warm-900 mb-4 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-blue-500" />
                    Gift Catalog
                  </h3>

                  {/* Scrollable container with smaller cards */}
                  <div className="max-h-[400px] overflow-y-auto pr-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {/* Add New Gift Card - NOW FIRST */}
                      <button
                        onClick={handleAddItemClick}
                        className={cn(
                          "aspect-square rounded-xl border-2 border-dashed border-warm-300",
                          "flex flex-col items-center justify-center gap-1.5",
                          "hover:border-blue-500 hover:bg-blue-50/50 transition-all duration-200",
                          "group min-h-[44px]"
                        )}
                      >
                        <div className="w-8 h-8 rounded-full bg-warm-100 group-hover:bg-blue-100 flex items-center justify-center transition-colors">
                          <Plus className="h-5 w-5 text-warm-400 group-hover:text-blue-500" />
                        </div>
                        <span className="text-xs font-medium text-warm-600 group-hover:text-blue-600 px-1 text-center">
                          Add New
                        </span>
                      </button>

                      {/* Filtered Gift Cards */}
                      {filteredItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleGiftCardClick(item.gift_id)}
                          className={cn(
                            "text-left group cursor-pointer",
                            "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded-xl"
                          )}
                        >
                          {/* Gift Image - Smaller */}
                          <div className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-warm-50 to-warm-100 mb-1.5 relative">
                            <GiftImage
                              src={item.gift?.image_url}
                              alt={item.gift?.name || 'Gift'}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              fallbackClassName="aspect-square"
                              sizes="(max-width: 640px) 33vw, (max-width: 1024px) 25vw, 20vw"
                            />
                            {/* Status Badge Overlay - Smaller */}
                            <div className="absolute top-1 right-1">
                              <Badge
                                className={cn(
                                  "text-[10px] font-semibold shadow-sm border px-1.5 py-0.5",
                                  statusColors[item.status]
                                )}
                              >
                                {item.status === 'idea' ? 'Idea' :
                                 item.status === 'purchased' ? 'Purchased' :
                                 item.status === 'received' ? 'Gifted' :
                                 item.status}
                              </Badge>
                            </div>
                          </div>

                          {/* Gift Info - Smaller text */}
                          <h4 className="font-semibold text-warm-900 text-xs line-clamp-2 mb-0.5 group-hover:text-blue-600 transition-colors">
                            {item.gift?.name || 'Unknown Gift'}
                          </h4>

                          {/* Price - Smaller */}
                          <div className="flex items-center justify-between gap-1">
                            {item.gift?.price !== null && item.gift?.price !== undefined && (
                              <span className="text-xs font-bold text-warm-700">
                                {formatPrice(item.gift?.price)}
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Empty State */}
                  {filteredItems.length === 0 && list.items && list.items.length > 0 && (
                    <div
                      className={cn(
                        "text-center py-12 mt-4",
                        "bg-warm-50 rounded-xl border-2 border-dashed border-warm-200"
                      )}
                    >
                      <ShoppingBag className="h-12 w-12 text-warm-300 mx-auto mb-3" />
                      <p className="text-warm-600">No items match this filter</p>
                    </div>
                  )}

                  {/* Completely Empty State */}
                  {list.items && list.items.length === 0 && (
                    <div
                      className={cn(
                        "text-center py-12 mt-4",
                        "bg-warm-50 rounded-xl border-2 border-dashed border-warm-200"
                      )}
                    >
                      <ShoppingBag className="h-12 w-12 text-warm-300 mx-auto mb-3" />
                      <p className="text-warm-600 mb-2">This list is empty</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddItemClick}
                        className="mt-2"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Your First Gift
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Linked Entities Tab */}
              <TabsContent value="linked" className="space-y-4">
                {(attachedPerson || attachedOccasion) ? (
                  <div className="space-y-3">
                    {attachedPerson && (
                      <div
                        className={cn(
                          "bg-blue-50 rounded-xl p-4 border border-blue-100"
                        )}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-xs font-medium text-blue-600 mb-1">
                              For Recipient
                            </div>
                            <div className="text-sm font-semibold text-warm-900">
                              {attachedPerson.display_name}
                            </div>
                            {attachedPerson.relationship && (
                              <div className="text-xs text-warm-600">
                                {attachedPerson.relationship}
                              </div>
                            )}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPersonId(String(attachedPerson.id))}
                            className="min-h-[44px]"
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    )}

                    {attachedOccasion && (
                      <div
                        className={cn(
                          "bg-purple-50 rounded-xl p-4 border border-purple-100"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Calendar className="h-5 w-5 text-purple-600 flex-shrink-0" />
                          <div>
                            <div className="text-xs font-medium text-purple-600 mb-1">
                              For Occasion
                            </div>
                            <div className="text-sm font-semibold text-warm-900">
                              {attachedOccasion.name}
                            </div>
                            <div className="text-xs text-warm-600">
                              {formatDate(attachedOccasion.date)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
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
                      No recipient or occasion attached to this list
                    </p>
                    <div className="text-warm-500 text-sm italic">
                      Edit the list to attach a person or occasion
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
                    Track changes and updates to this list
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
      {list && (
        <AddListModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          mode="edit"
          listToEdit={list}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Add Item Modal */}
      {listId && (
        <AddListItemModal
          isOpen={showAddItemModal}
          onClose={() => setShowAddItemModal(false)}
          listId={Number(listId)}
          onSuccess={handleAddItemSuccess}
        />
      )}

      {/* Gift Detail Modal */}
      <GiftDetailModal
        giftId={selectedGiftId}
        open={!!selectedGiftId}
        onOpenChange={(open) => !open && setSelectedGiftId(null)}
      />

      {/* Person Detail Modal */}
      <PersonDetailModal
        personId={selectedPersonId}
        open={!!selectedPersonId}
        onOpenChange={(open) => !open && setSelectedPersonId(null)}
      />
    </>
  );
}
