"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Cake, Sparkles, Calendar as CalendarIcon, ExternalLink, Clock, Edit, Trash2, Heart, Lightbulb, CheckSquare, Plus, User } from "@/components/ui/icons";
import { formatDate, getDaysUntil } from "@/lib/date-utils";
import { occasionApi } from "@/lib/api/endpoints";
import { useDeleteOccasion } from "@/hooks/useOccasions";
import { useListsForOccasion } from "@/hooks/useLists";
import { usePersons } from "@/hooks/usePersons";
import { AddOccasionModal } from "@/components/occasions/AddOccasionModal";
import { ListDetailModal } from "./ListDetailModal";
import { PersonDetailModal } from "./PersonDetailModal";
import type { Occasion, RecurrenceRule, OccasionType } from "@/types";
import { cn } from "@/lib/utils";
import { LinkListsToContextModal } from "./LinkListsToContextModal";
import { CommentsTab } from "@/components/comments";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/context/AuthContext";

interface OccasionDetailModalProps {
  occasionId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const occasionTypeConfig: Record<string, {
  icon: typeof Cake;
  label: string;
  bgColor: string;
  iconColor: string;
  gradient: string;
}> = {
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
  recurring: {
    icon: CalendarIcon,
    label: "Recurring",
    bgColor: "bg-green-100",
    iconColor: "text-green-600",
    gradient: "from-green-500/20 via-emerald-500/20 to-teal-500/20",
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

// Helper functions for formatting
function formatOccasionType(type: OccasionType): string {
  switch (type) {
    case 'holiday':
      return 'Holiday';
    case 'recurring':
      return 'Recurring';
    case 'other':
      return 'Other';
    default:
      return type;
  }
}

function formatRecurrenceRule(rule: RecurrenceRule): string {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  if (rule.day) {
    return `${months[rule.month - 1]} ${rule.day}`;
  }

  // Handle weekday patterns
  const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const weekNums = ['1st', '2nd', '3rd', '4th', 'last'];
  const weekNum = rule.week_of_month === -1 ? 4 : (rule.week_of_month || 1) - 1;

  return `the ${weekNums[weekNum]} ${weekdays[rule.weekday || 0]} of ${months[rule.month - 1]}`;
}

function getTypeBadgeVariant(type: OccasionType): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' {
  switch (type) {
    case 'holiday':
      return 'error';
    case 'recurring':
      return 'primary';
    case 'other':
      return 'default';
    default:
      return 'default';
  }
}

export function OccasionDetailModal({
  occasionId,
  open,
  onOpenChange,
}: OccasionDetailModalProps) {
  const { toast } = useToast();
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showLinkListsModal, setShowLinkListsModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [selectedListId, setSelectedListId] = React.useState<string | null>(null);
  const [selectedPersonId, setSelectedPersonId] = React.useState<string | null>(null);

  const { loading: authLoading } = useAuth();

  const { data: occasion, isLoading } = useQuery<Occasion>({
    queryKey: ["occasions", occasionId],
    queryFn: () => occasionApi.get(Number(occasionId)),
    enabled: !!occasionId && open && !authLoading,
  });

  // Fetch lists attached to this occasion
  const { data: listsData, isLoading: listsLoading } = useListsForOccasion(
    occasionId ? Number(occasionId) : undefined,
    { enabled: open }
  );

  // Fetch all persons to display linked ones
  const { data: personsData } = usePersons(undefined, { enabled: open });

  const deleteMutation = useDeleteOccasion();

  // Reset state when modal closes
  React.useEffect(() => {
    if (!open) {
      setShowDeleteConfirm(false);
      setShowEditModal(false);
      setShowLinkListsModal(false);
      setActiveTab("overview");
      setSelectedListId(null);
      setSelectedPersonId(null);
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
              <TabsTrigger value="comments" className="flex-1">
                Comments
              </TabsTrigger>
              <TabsTrigger value="history" className="flex-1">
                History
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Type & Recurrence Info */}
              <div
                className={cn(
                  "bg-gradient-to-br from-warm-50 to-amber-50",
                  "rounded-xl p-5 border border-warm-200"
                )}
              >
                <h3 className="font-semibold text-warm-900 mb-3">Type & Status</h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={getTypeBadgeVariant(occasion.type)}>
                    {formatOccasionType(occasion.type)}
                  </Badge>
                  {occasion.subtype && (
                    <Badge variant="default">{occasion.subtype}</Badge>
                  )}
                  {!occasion.is_active && (
                    <Badge variant="warning">Inactive</Badge>
                  )}
                  {occasion.is_active && (
                    <Badge variant="success">Active</Badge>
                  )}
                </div>
              </div>

              {/* Recurrence Pattern */}
              {occasion.recurrence_rule && (
                <div
                  className={cn(
                    "bg-blue-50 rounded-xl p-5 border border-blue-200"
                  )}
                >
                  <h3 className="font-semibold text-warm-900 mb-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600" />
                    Recurrence Pattern
                  </h3>
                  <p className="text-warm-700">
                    Repeats every year on {formatRecurrenceRule(occasion.recurrence_rule)}
                  </p>
                </div>
              )}

              {/* Next Occurrence */}
              {occasion.next_occurrence && (
                <div
                  className={cn(
                    "bg-gradient-to-br from-green-50 to-emerald-50",
                    "rounded-xl p-5 border border-green-200"
                  )}
                >
                  <h3 className="font-semibold text-warm-900 mb-3 flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-green-600" />
                    Next Occurrence
                  </h3>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-warm-900">
                      {formatDate(occasion.next_occurrence)}
                    </span>
                    <span className="text-sm text-warm-600">
                      ({getDaysUntil(occasion.next_occurrence)} days away)
                    </span>
                  </div>
                </div>
              )}

              {/* Recipients */}
              {occasion.person_ids && occasion.person_ids.length > 0 && (
                <div
                  className={cn(
                    "bg-purple-50 rounded-xl p-5 border border-purple-200"
                  )}
                >
                  <h3 className="font-semibold text-warm-900 mb-3 flex items-center gap-2">
                    <User className="h-4 w-4 text-purple-600" />
                    Recipients
                  </h3>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <button
                          className={cn(
                            "text-left px-4 py-2.5 rounded-lg",
                            "bg-white border-2 border-purple-200",
                            "hover:border-purple-400 hover:shadow-md",
                            "transition-all duration-200",
                            "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                            "min-h-[44px]"
                          )}
                        >
                          <span className="text-warm-900 font-medium">
                            {occasion.person_ids.length} {occasion.person_ids.length === 1 ? 'person' : 'people'}
                          </span>
                        </button>
                      </TooltipTrigger>
                      <TooltipContent
                        side="bottom"
                        align="start"
                        className={cn(
                          "bg-white border border-warm-200 shadow-lg p-3 rounded-lg",
                          "max-w-xs w-72"
                        )}
                      >
                        <div className="space-y-2">
                          {occasion.person_ids.slice(0, 5).map((personId) => {
                            const person = personsData?.items?.find((p) => p.id === personId);
                            if (!person) {
                              return (
                                <div
                                  key={personId}
                                  className="flex items-center gap-3 p-2 rounded-md bg-warm-50"
                                >
                                  <Avatar size="sm">
                                    <AvatarFallback>?</AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm text-warm-600">Person #{personId}</span>
                                </div>
                              );
                            }
                            return (
                              <button
                                key={personId}
                                onClick={() => setSelectedPersonId(String(person.id))}
                                className={cn(
                                  "w-full flex items-center gap-3 p-2 rounded-md",
                                  "hover:bg-purple-50 transition-colors",
                                  "focus:outline-none focus:ring-2 focus:ring-purple-500",
                                  "min-h-[44px]"
                                )}
                              >
                                <Avatar size="sm">
                                  {person.photo_url && (
                                    <AvatarImage src={person.photo_url} alt={person.display_name} />
                                  )}
                                  <AvatarFallback>
                                    {getInitials(person.display_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 text-left min-w-0">
                                  <div className="font-medium text-warm-900 text-sm truncate">
                                    {person.display_name}
                                  </div>
                                  {person.relationship && (
                                    <div className="text-xs text-warm-600 truncate">
                                      {person.relationship}
                                    </div>
                                  )}
                                </div>
                              </button>
                            );
                          })}
                          {occasion.person_ids.length > 5 && (
                            <div className="pt-2 border-t border-warm-200 text-center">
                              <span className="text-xs text-warm-600 font-medium">
                                +{occasion.person_ids.length - 5} more
                              </span>
                            </div>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              )}

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
                    onClick={() => setShowLinkListsModal(true)}
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
                    onClick={() => setShowLinkListsModal(true)}
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

            {/* Comments Tab */}
            <TabsContent value="comments" className="space-y-4">
              <CommentsTab entityType="occasion" entityId={occasion?.id} />
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

      {/* Person Detail Modal */}
      <PersonDetailModal
        personId={selectedPersonId}
        open={!!selectedPersonId}
        onOpenChange={(open) => !open && setSelectedPersonId(null)}
      />

      {occasionId && (
        <LinkListsToContextModal
          contextId={Number(occasionId)}
          contextType="occasion"
          isOpen={showLinkListsModal}
          onClose={() => setShowLinkListsModal(false)}
          existingListIds={listsData?.items?.map((list) => list.id) || []}
        />
      )}
    </>
  );
}
