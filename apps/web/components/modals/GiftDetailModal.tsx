"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusSelector } from "@/components/ui/status-selector";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@/components/ui/collapsible";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ExternalLink, Gift as GiftIcon, DollarSign, Calendar, User, Tag, Edit, Trash2, Heart, Lightbulb, CheckSquare, ShoppingBag, Plus, CalendarCheck, Store, Pencil, X, Package, ChevronRight } from "@/components/ui/icons";
import { formatDate } from "@/lib/date-utils";
import { formatPrice } from "@/lib/utils";
import { giftApi } from "@/lib/api/endpoints";
import { useDeleteGift, useUpdateGift, useAttachPeopleToGift, useDetachPersonFromGift, useMarkGiftPurchased } from "@/hooks/useGifts";
import { useListsForGift } from "@/hooks/useLists";
import { useConfirmDialog } from "@/components/ui/confirm-dialog";
import type { Gift, GiftPriority, Person } from "@/types";
import type { GiftStatus } from "@/components/ui/status-pill";
import { StatusPill } from "@/components/ui/status-pill";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ListDetailModal } from "./ListDetailModal";
import { LinkGiftToListsModal } from "../gifts/LinkGiftToListsModal";
import { PeopleMultiSelect } from "@/components/common/PeopleMultiSelect";
import { Avatar, AvatarFallback, AvatarImage, getInitials } from "@/components/ui/avatar";
import { usePersons } from "@/hooks/usePersons";
import { CommentsTab } from "@/components/comments";
import { GiftTitleLink } from "@/components/common/GiftTitleLink";
import { PersonDetailModal } from "./PersonDetailModal";
import { Select } from "@/components/ui/select";
import { PurchaserAssignDialog } from "./PurchaserAssignDialog";
import { useAuth } from "@/lib/context/AuthContext";

interface GiftDetailModalProps {
  giftId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Purchasing statuses that trigger the purchaser assignment dialog
const PURCHASING_STATUSES: GiftStatus[] = ['buying', 'ordered', 'purchased'];

export function GiftDetailModal({
  giftId,
  open,
  onOpenChange,
}: GiftDetailModalProps) {
  const [activeTab, setActiveTab] = React.useState("overview");
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [selectedListId, setSelectedListId] = React.useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(null);
  const [showLinkListsModal, setShowLinkListsModal] = React.useState(false);
  const [isEditingPeople, setIsEditingPeople] = React.useState(false);
  const [editingPersonIds, setEditingPersonIds] = React.useState<number[]>([]);
  const [showMarkPurchasedDialog, setShowMarkPurchasedDialog] = React.useState(false);
  const [quantityPurchased, setQuantityPurchased] = React.useState<string>("1");

  // Purchaser assignment dialog state
  const [showPurchaserDialog, setShowPurchaserDialog] = React.useState(false);
  const [pendingStatus, setPendingStatus] = React.useState<GiftStatus | null>(null);

  const { loading: authLoading } = useAuth();

  const { data: gift, isLoading } = useQuery<Gift>({
    queryKey: ["gifts", giftId ? Number(giftId) : null],
    queryFn: () => giftApi.get(Number(giftId)),
    enabled: !!giftId && open && !authLoading,
  });

  const { data: listsData, isLoading: isLoadingLists } = useListsForGift(
    giftId ? Number(giftId) : undefined,
    { enabled: open }
  );

  const { data: personsData } = usePersons({}, { enabled: open });

  const deleteGift = useDeleteGift();
  const updateGiftMutation = useUpdateGift(giftId ? Number(giftId) : 0);
  const attachPeopleMutation = useAttachPeopleToGift(giftId ? Number(giftId) : 0);
  const detachPersonMutation = useDetachPersonFromGift(giftId ? Number(giftId) : 0);
  const markPurchasedMutation = useMarkGiftPurchased(giftId ? Number(giftId) : 0);
  const { confirm: confirmUnlink, dialog: unlinkDialog } = useConfirmDialog();

  const handleStatusChange = (newStatus: GiftStatus) => {
    if (!giftId) return;

    const currentStatus = gift?.status;
    const wasPurchasingStatus = currentStatus && PURCHASING_STATUSES.includes(currentStatus as GiftStatus);
    const isPurchasingStatus = PURCHASING_STATUSES.includes(newStatus);

    // Show purchaser dialog if:
    // 1. Moving to a purchasing status AND
    // 2. Not already in a purchasing status AND
    // 3. No purchaser assigned
    if (isPurchasingStatus && !wasPurchasingStatus && !gift?.extra_data?.purchaser_id) {
      setPendingStatus(newStatus);
      setShowPurchaserDialog(true);
    } else {
      // Directly update status without purchaser dialog
      updateGiftMutation.mutate({
        status: newStatus,
      });
    }
  };

  const handlePurchaserAssign = (purchaserId: number | null) => {
    if (!giftId || !pendingStatus) return;

    // Update both status and purchaser_id
    updateGiftMutation.mutate(
      {
        status: pendingStatus,
        extra_data: {
          ...gift?.extra_data,
          purchaser_id: purchaserId,
        },
      },
      {
        onSuccess: () => {
          // Close dialog and reset state
          setShowPurchaserDialog(false);
          setPendingStatus(null);
        },
        onError: () => {
          // On error, just close the dialog
          setShowPurchaserDialog(false);
          setPendingStatus(null);
        },
      }
    );
  };

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

  const handleListClick = (listId: number) => {
    setSelectedListId(String(listId));
  };

  const handleSavePeople = async () => {
    if (!giftId) return;

    try {
      // Use the dedicated attach people endpoint
      await attachPeopleMutation.mutateAsync(editingPersonIds);
      setIsEditingPeople(false);
    } catch (error) {
      console.error("Failed to update linked people:", error);
    }
  };

  const handleUnlinkPerson = async (person: Person) => {
    if (!giftId) return;

    const confirmed = await confirmUnlink({
      title: "Unlink Person",
      description: `Are you sure you want to unlink ${person.display_name} from this gift?`,
      confirmLabel: "Unlink",
      cancelLabel: "Cancel",
      variant: "destructive",
    });

    if (confirmed) {
      try {
        await detachPersonMutation.mutateAsync(person.id);
      } catch (error) {
        console.error("Failed to unlink person:", error);
      }
    }
  };

  const handleMarkPurchased = async () => {
    if (!giftId) return;

    try {
      await markPurchasedMutation.mutateAsync({
        quantity_purchased: Number(quantityPurchased),
      });
      setShowMarkPurchasedDialog(false);
    } catch (error) {
      console.error("Failed to mark gift as purchased:", error);
    }
  };

  // Get linked people based on gift's person_ids
  const linkedPeople = React.useMemo(() => {
    const allPeople = personsData?.items || [];
    if (!gift?.person_ids || !allPeople.length) return [];
    return allPeople.filter((person) => gift.person_ids.includes(person.id));
  }, [gift?.person_ids, personsData?.items]);

  // Helper function to get priority badge variant
  const getPriorityVariant = (priority: GiftPriority) => {
    switch (priority) {
      case 'high':
        return 'error' as const;
      case 'medium':
        return 'warning' as const;
      case 'low':
        return 'info' as const;
      default:
        return 'default' as const;
    }
  };

  // Compute price display conditions (for TypeScript strict mode)
  const hasPrice = gift?.price !== null && gift?.price !== undefined;
  const hasSalePrice = gift?.sale_price !== null && gift?.sale_price !== undefined;
  const showSalePriceOnly = Boolean(!hasPrice && hasSalePrice);
  const priceDisplay = hasPrice ? formatPrice(gift?.price) : '';
  const salePriceDisplay = hasSalePrice ? formatPrice(gift?.sale_price) : '';
  const giftStatus = gift?.status ?? 'idea';

  // Reset tab and editing state when modal closes
  React.useEffect(() => {
    if (!open) {
      setActiveTab("overview");
      setIsEditingPeople(false);
      setEditingPersonIds([]);
      setShowMarkPurchasedDialog(false);
      setQuantityPurchased("1");
      setShowPurchaserDialog(false);
      setPendingStatus(null);
    }
  }, [open]);

  // Initialize editing person IDs when opening edit mode
  React.useEffect(() => {
    if (isEditingPeople && gift?.person_ids) {
      setEditingPersonIds(gift.person_ids);
    }
  }, [isEditingPeople, gift?.person_ids]);

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
                <TabsTrigger value="comments" className="flex-1">
                  Comments
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
                    <>
                      <Image
                        src={gift.image_url}
                        alt={gift.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      {/* Price & Status Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 rounded-b-2xl">
                        <div className="flex flex-col gap-2">
                          {/* Price Row */}
                          {(hasPrice || hasSalePrice) && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {hasSalePrice && (
                                  <span className="text-white font-bold text-lg">
                                    {salePriceDisplay}
                                  </span>
                                )}
                                {hasPrice && hasSalePrice && (
                                  <span className="text-white/70 line-through text-sm">
                                    {priceDisplay}
                                  </span>
                                )}
                                {hasPrice && !hasSalePrice && (
                                  <span className="text-white font-bold text-lg">
                                    {priceDisplay}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {/* Quantity & Status Row */}
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2">
                              {gift.quantity && (
                                <span className="text-white text-sm font-medium">
                                  Qty: {gift.quantity}
                                </span>
                              )}
                            </div>
                            {giftStatus && (
                              <StatusPill
                                status={giftStatus as GiftStatus}
                                size="sm"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </>
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
                    <GiftTitleLink name={gift.name} url={gift.url} showExternalIcon />
                  </h2>

                  {/* Linked People - Inline Display */}
                  {linkedPeople && linkedPeople.length > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-warm-600">For:</span>
                      {linkedPeople.map((person, index) => (
                        <React.Fragment key={person.id}>
                          <button
                            onClick={() => setSelectedPersonId(String(person.id))}
                            className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity"
                          >
                            <Avatar size="sm">
                              {person.photo_url && (
                                <AvatarImage src={person.photo_url} alt={person.display_name} />
                              )}
                              <AvatarFallback className="text-xs">
                                {getInitials(person.display_name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-semibold text-warm-900 hover:underline">
                              {person.display_name}
                            </span>
                            {person.relationship && (
                              <span className="text-warm-600">({person.relationship})</span>
                            )}
                          </button>
                          {index < linkedPeople.length - 1 && (
                            <span className="text-warm-400">,</span>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Priority & Quantity */}
                  {(gift.priority || gift.quantity) && (
                    <div className="flex items-center gap-4">
                      {gift.priority && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-warm-600">Priority:</span>
                          <Badge variant={getPriorityVariant(gift.priority)}>
                            {gift.priority.toUpperCase()}
                          </Badge>
                        </div>
                      )}
                      {gift.quantity && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-warm-600">Qty:</span>
                          <span className="font-medium">{gift.quantity}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Price */}
                  {hasPrice && (
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
                      <div className="flex-1">
                          <p className="text-sm text-warm-600 mb-0.5">Price</p>
                          <div className="flex items-center gap-3">
                            <p className={cn(
                              "text-2xl font-bold",
                              hasSalePrice ? "line-through text-warm-600" : "text-warm-900"
                            )}>
                              {priceDisplay}
                            </p>
                            {hasSalePrice && (
                              <p className="text-2xl font-bold text-green-600">
                                {salePriceDisplay}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                  )}

                  {showSalePriceOnly ? (
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
                          <div className="flex-1">
                            <p className="text-sm text-warm-600 mb-0.5">Price</p>
                            <p className="text-2xl font-bold text-green-600">
                              {salePriceDisplay}
                            </p>
                          </div>
                        </div>
                      ) : null}

                  {/* Purchase Date */}
                  {gift.purchase_date && (
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarCheck className="h-4 w-4 text-warm-500" />
                      <span>Purchased on {formatDate(gift.purchase_date)}</span>
                    </div>
                  )}

                  {/* Status Selector */}
                  {giftStatus ? (
                    <div>
                      <p className="text-sm text-warm-600 mb-2">Status</p>
                      <StatusSelector
                        status={giftStatus as GiftStatus}
                        onChange={handleStatusChange}
                        size="md"
                        disabled={updateGiftMutation.isPending}
                      />
                    </div>
                  ) : null}

                  {/* Mark as Purchased Button */}
                  {!gift.purchase_date && giftStatus !== 'purchased' && (
                    <div>
                      <Button
                        variant="outline"
                        size="md"
                        onClick={() => {
                          setQuantityPurchased(String(gift.quantity || 1));
                          setShowMarkPurchasedDialog(true);
                        }}
                        disabled={markPurchasedMutation.isPending}
                        className="w-full"
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Mark as Purchased
                      </Button>
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
                </div>
              </div>

              {/* Description */}
              {gift.description && (
                <div className="space-y-2 pt-4 border-t border-warm-200">
                  <h3 className="text-sm font-semibold text-warm-900">Description</h3>
                  <p className="text-sm text-warm-700 whitespace-pre-wrap">{gift.description}</p>
                </div>
              )}

              {/* Notes */}
              {gift.notes && (
                <div className="space-y-2 bg-warm-50/50 rounded-xl p-4 border border-warm-200">
                  <h3 className="text-sm font-semibold text-warm-900">Notes</h3>
                  <p className="text-sm text-warm-700 italic whitespace-pre-wrap">{gift.notes}</p>
                </div>
              )}

              {/* Stores */}
              {gift.stores && gift.stores.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-warm-900">Available at</h3>
                  <div className="flex flex-wrap gap-2">
                    {gift.stores.map((store) => (
                      <Badge key={store.id} variant="default" className="gap-1.5">
                        <Store className="h-3 w-3" />
                        {store.url ? (
                          <a
                            href={store.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:underline"
                          >
                            {store.name}
                          </a>
                        ) : (
                          store.name
                        )}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional URLs */}
              {gift.additional_urls && gift.additional_urls.length > 0 && (
                <Collapsible defaultOpen={false}>
                  <CollapsibleTrigger className="flex items-center gap-2 text-sm text-warm-600 hover:text-warm-900 transition-colors">
                    <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                    <span className="font-semibold">Other Links ({gift.additional_urls.length})</span>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-2 pl-6">
                    {gift.additional_urls.map((link, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <span className="text-sm text-warm-600 font-medium min-w-[80px]">{link.label}:</span>
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-600 hover:text-primary-700 hover:underline flex items-center gap-1 break-all"
                        >
                          <span className="truncate max-w-[300px]">{new URL(link.url).hostname}</span>
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Extra Data (for any other metadata) */}
              {gift.extra_data && Object.keys(gift.extra_data).filter(k => k !== 'status').length > 0 && (
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
                    {Object.entries(gift.extra_data)
                      .filter(([key]) => key !== 'status')
                      .map(([key, value]) => (
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
            <TabsContent value="linked" className="space-y-6">
              {/* People Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-warm-900 text-lg">
                      Linked People
                    </h3>
                    <p className="text-warm-600 text-sm">
                      People this gift is for
                    </p>
                  </div>
                  {!isEditingPeople && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingPeople(true)}
                      className="min-h-[36px]"
                    >
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>

                {isEditingPeople ? (
                  <div className="mt-4 p-4 border border-warm-200 rounded-xl bg-warm-50/30">
                    <PeopleMultiSelect
                      value={editingPersonIds}
                      onChange={setEditingPersonIds}
                    />
                    <div className="flex justify-end gap-2 mt-4">
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setIsEditingPeople(false);
                          setEditingPersonIds(gift?.person_ids || []);
                        }}
                        disabled={attachPeopleMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleSavePeople}
                        disabled={attachPeopleMutation.isPending}
                        isLoading={attachPeopleMutation.isPending}
                      >
                        Save
                      </Button>
                    </div>
                  </div>
                ) : linkedPeople && linkedPeople.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {linkedPeople.map((person) => (
                      <div
                        key={person.id}
                        className={cn(
                          "inline-flex items-center gap-2 pl-1 pr-2 py-1.5",
                          "bg-warm-100 border border-warm-200 rounded-full",
                          "group hover:bg-warm-150 transition-colors"
                        )}
                      >
                        <Avatar size="xs">
                          <AvatarFallback className="text-xs">
                            {getInitials(person.display_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-warm-900">{person.display_name}</span>
                        <button
                          onClick={() => handleUnlinkPerson(person)}
                          disabled={detachPersonMutation.isPending}
                          className={cn(
                            "min-h-[44px] min-w-[44px] -mr-2 -my-2",
                            "flex items-center justify-center rounded-full",
                            "hover:bg-red-100 transition-colors",
                            "text-warm-500 hover:text-red-600",
                            "disabled:opacity-50 disabled:cursor-not-allowed",
                            "focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                          )}
                          aria-label={`Unlink ${person.display_name}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-warm-50 rounded-xl border border-warm-200">
                    <User className="h-8 w-8 mx-auto mb-2 text-warm-400" />
                    <p className="text-sm text-warm-600">No people linked to this gift</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingPeople(true)}
                      className="mt-3"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Link People
                    </Button>
                  </div>
                )}
              </div>

              {/* Lists Section */}
              <div className="space-y-4 pt-4 border-t border-warm-200">
                <div>
                  <h3 className="font-semibold text-warm-900 text-lg mb-1">
                    Lists Containing This Gift
                  </h3>
                  <p className="text-warm-600 text-sm mb-4">
                    This gift appears in the following lists
                  </p>
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowLinkListsModal(true)}
                      className="min-h-[36px]"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add or Link Lists
                    </Button>
                  </div>
                </div>

                {isLoadingLists ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
                  </div>
                ) : listsData && listsData.data.length > 0 ? (
                  <div className="space-y-3">
                    {listsData.data.map((list) => {
                      const typeIcon = {
                        wishlist: Heart,
                        ideas: Lightbulb,
                        assigned: CheckSquare,
                      }[list.type];
                      const TypeIcon = typeIcon || ShoppingBag;

                      return (
                        <button
                          key={list.id}
                          onClick={() => handleListClick(list.id)}
                          className={cn(
                            "w-full text-left",
                            "bg-white rounded-xl p-4 border border-warm-200",
                            "hover:border-purple-300 hover:shadow-md",
                            "transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* List Type Icon */}
                            <div
                              className={cn(
                                "rounded-full p-2 mt-1",
                                list.type === "wishlist" && "bg-rose-100",
                                list.type === "ideas" && "bg-amber-100",
                                list.type === "assigned" && "bg-blue-100"
                              )}
                            >
                              <TypeIcon
                                className={cn(
                                  "h-4 w-4",
                                  list.type === "wishlist" && "text-rose-600",
                                  list.type === "ideas" && "text-amber-600",
                                  list.type === "assigned" && "text-blue-600"
                                )}
                              />
                            </div>

                            {/* List Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className="font-semibold text-warm-900 text-base">
                                  {list.name}
                                </h4>
                              </div>

                              <div className="flex flex-wrap items-center gap-2 text-sm">
                                {/* List Type Badge */}
                                <Badge
                                  variant="default"
                                  className={cn(
                                    "text-xs",
                                    list.type === "wishlist" && "bg-rose-100 text-rose-700 border-rose-200",
                                    list.type === "ideas" && "bg-amber-100 text-amber-700 border-amber-200",
                                    list.type === "assigned" && "bg-blue-100 text-blue-700 border-blue-200"
                                  )}
                                >
                                  {list.type.charAt(0).toUpperCase() + list.type.slice(1)}
                                </Badge>

                                {/* Item Count */}
                                {list.item_count !== undefined && (
                                  <span className="text-warm-500 text-xs">
                                    {list.item_count} {list.item_count === 1 ? "item" : "items"}
                                  </span>
                                )}

                                {/* Visibility Badge */}
                                <Badge variant="default" className="text-xs text-warm-600">
                                  {list.visibility.charAt(0).toUpperCase() + list.visibility.slice(1)}
                                </Badge>
                              </div>
                            </div>

                            {/* Arrow Icon */}
                            <div className="text-warm-400 mt-1">
                              <ExternalLink className="h-4 w-4" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div
                      className={cn(
                        "bg-warm-50 rounded-xl p-8 border border-warm-200",
                        "text-center"
                      )}
                    >
                      <div className="flex flex-col items-center">
                        <div className="bg-warm-100 rounded-full p-4 mb-4">
                          <ShoppingBag className="h-8 w-8 text-warm-400" />
                        </div>
                        <h4 className="font-semibold text-warm-900 text-base mb-1">
                          Not in Any Lists
                        </h4>
                        <p className="text-warm-600 text-sm">
                          This gift has not been added to any lists yet
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowLinkListsModal(true)}
                          className="mt-4"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add to a List
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-4">
              <CommentsTab entityType="gift" entityId={gift?.id} />
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

      {/* Mark as Purchased Dialog */}
      <Dialog open={showMarkPurchasedDialog} onOpenChange={setShowMarkPurchasedDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Purchased</DialogTitle>
            <DialogDescription>
              How many of this gift did you purchase?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={quantityPurchased}
              onChange={setQuantityPurchased}
              options={[
                { value: "1", label: "1" },
                { value: "2", label: "2" },
                { value: "3", label: "3" },
                { value: "4", label: "4" },
                { value: "5", label: "5" },
                { value: "6", label: "6" },
                { value: "7", label: "7" },
                { value: "8", label: "8" },
                { value: "9", label: "9" },
                { value: "10", label: "10" },
              ]}
              label="Quantity Purchased"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowMarkPurchasedDialog(false)}
              disabled={markPurchasedMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              onClick={handleMarkPurchased}
              disabled={markPurchasedMutation.isPending}
              isLoading={markPurchasedMutation.isPending}
            >
              Mark Purchased
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Purchaser Assign Dialog */}
      <PurchaserAssignDialog
        isOpen={showPurchaserDialog}
        onClose={() => {
          setShowPurchaserDialog(false);
          setPendingStatus(null);
        }}
        onAssign={handlePurchaserAssign}
        isLoading={updateGiftMutation.isPending}
        giftName={gift?.name}
      />

      {/* List Detail Modal - Only render when needed to avoid subscription storm */}
      {selectedListId && (
        <ListDetailModal
          listId={selectedListId}
          open={true}
          onOpenChange={(open) => !open && setSelectedListId(null)}
        />
      )}

      {/* Add List Modal - Only render when needed to avoid subscription storm */}
      {showLinkListsModal && giftId && (
        <LinkGiftToListsModal
          giftId={Number(giftId)}
          isOpen={showLinkListsModal}
          onClose={() => setShowLinkListsModal(false)}
          onLinked={() => setShowLinkListsModal(false)}
        />
      )}

      {/* Person Detail Modal - Only render when needed to avoid subscription storm */}
      {selectedPersonId && (
        <PersonDetailModal
          personId={selectedPersonId}
          open={true}
          onOpenChange={(open) => !open && setSelectedPersonId(null)}
        />
      )}

      {/* Unlink Confirmation Dialog */}
      {unlinkDialog}
    </>
  );
}
