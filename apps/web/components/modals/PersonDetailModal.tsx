"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal, useEntityModal } from "./EntityModal";
import { ListDetailModal } from "./ListDetailModal";
import { GiftDetailModal } from "./GiftDetailModal";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Cake, Calendar, CheckSquare, Edit, ExternalLink, Heart, Sparkles, Trash2, X, Plus } from "@/components/ui/icons";
import { formatDate, getAge, getNextBirthday } from "@/lib/date-utils";
import { personApi } from "@/lib/api/endpoints";
import { useUpdatePerson, useDeletePerson } from "@/hooks/usePersons";
import { useListsForPerson } from "@/hooks/useLists";
import type { Person, PersonUpdate, GiftList } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";
import { LinkListsToContextModal } from "./LinkListsToContextModal";
import { GroupMultiSelect } from "@/components/common/GroupMultiSelect";
import { AdvancedInterestsView } from '@/components/people/AdvancedInterestsView';
import { AdvancedInterestsEdit } from '@/components/people/AdvancedInterestsEdit';
import { PersonBudgetBar } from '@/components/people/PersonBudgetBar';
import { LinkedGiftsSection } from '@/components/people/LinkedGiftsSection';
import { PersonBudgetsTab } from '@/components/people/PersonBudgetsTab';
import type { AdvancedInterests, SizeEntry } from '@/types';
import { CommentThread } from '@/components/comments';
import { useAuth } from '@/hooks/useAuth';
import { ImagePicker } from '@/components/ui/image-picker';
import { ImageEditDialog } from './ImageEditDialog';

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
  const { toast } = useToast();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);
  const [showLinkListsModal, setShowLinkListsModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("overview");
  const [isEditingGroups, setIsEditingGroups] = React.useState(false);
  const [editingGroupIds, setEditingGroupIds] = React.useState<number[]>([]);
  const [showImageDialog, setShowImageDialog] = React.useState(false);

  const { loading: authLoading } = useAuth();

  const { data: person, isLoading } = useQuery<Person>({
    queryKey: ["persons", Number(personId)],
    queryFn: () => personApi.get(Number(personId)),
    enabled: !!personId && open && !authLoading,
  });

  const updateMutation = useUpdatePerson(Number(personId));
  const deleteMutation = useDeletePerson();

  // List modal management
  const {
    open: listModalOpen,
    entityId: listModalId,
    openModal: openListModal,
    closeModal: closeListModal
  } = useEntityModal('list');

  // Gift modal management
  const {
    open: giftModalOpen,
    entityId: giftModalId,
    openModal: openGiftModal,
    closeModal: closeGiftModal
  } = useEntityModal('gift');

  // Fetch lists for this person
  const {
    data: listsResponse,
    isLoading: listsLoading
  } = useListsForPerson(personId ? Number(personId) : undefined, { enabled: open });

  const lists = listsResponse?.items || [];

  // Form state
  const [formData, setFormData] = React.useState<PersonUpdate>({});

  // Initialize form data when person loads or edit mode changes
  React.useEffect(() => {
    if (person && isEditing) {
      setFormData({
        display_name: person.display_name,
        relationship: person.relationship || "",
        birthdate: person.birthdate || "",
        notes: person.notes || "",
        interests: person.interests || [],
        size_profile: person.size_profile || [],
        sizes: person.sizes || {},
        advanced_interests: person.advanced_interests || undefined,
        constraints: person.constraints || "",
        photo_url: person.photo_url || "",
      });
    }
  }, [person, isEditing]);

  // Reset editing state when modal closes
  React.useEffect(() => {
    if (!open) {
      setIsEditing(false);
      setShowDeleteConfirm(false);
      setShowLinkListsModal(false);
      setActiveTab("overview");
      setIsEditingGroups(false);
      setFormData({});
      setShowImageDialog(false);
    }
  }, [open]);

  if (!person && !isLoading) {
    return null;
  }

  const age = person?.birthdate ? getAge(person.birthdate) : null;
  const nextBirthday = person?.birthdate
    ? getNextBirthday(person.birthdate)
    : null;

  const handleSave = async () => {
    try {
      // Clean up empty fields
      const updateData: PersonUpdate = {};
      if (formData.display_name) updateData.display_name = formData.display_name;
      if (formData.relationship) updateData.relationship = formData.relationship;
      if (formData.birthdate) updateData.birthdate = formData.birthdate;
      if (formData.notes) updateData.notes = formData.notes;
      if (formData.interests && formData.interests.length > 0) updateData.interests = formData.interests;
      if (formData.size_profile && formData.size_profile.length > 0) updateData.size_profile = formData.size_profile;
      if (formData.sizes && Object.keys(formData.sizes).length > 0) updateData.sizes = formData.sizes;
      if (formData.advanced_interests) updateData.advanced_interests = formData.advanced_interests;
      if (formData.constraints) updateData.constraints = formData.constraints;
      if (formData.photo_url) updateData.photo_url = formData.photo_url;

      await updateMutation.mutateAsync(updateData);

      toast({
        title: "Success",
        description: "Person updated successfully",
      });

      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update person",
        variant: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(Number(personId));

      toast({
        title: "Success",
        description: "Person deleted successfully",
      });

      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete person",
        variant: "error",
      });
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({});
  };

  const handleInterestsChange = (value: string) => {
    // Parse comma-separated interests
    const interests = value.split(",").map(i => i.trim()).filter(Boolean);
    setFormData({ ...formData, interests });
  };

  const handleSizesChange = (key: string, value: string) => {
    setFormData({
      ...formData,
      sizes: {
        ...(formData.sizes || {}),
        [key]: value,
      },
    });
  };

  const handleRemoveSize = (key: string) => {
    const newSizes = { ...(formData.sizes || {}) };
    delete newSizes[key];
    setFormData({ ...formData, sizes: newSizes });
  };

  const handleEditGroups = () => {
    const groupIds = person?.groups?.map(g => g.id) || [];
    setEditingGroupIds(groupIds);
    setIsEditingGroups(true);
  };

  const handleSaveGroups = async () => {
    try {
      await updateMutation.mutateAsync({
        group_ids: editingGroupIds
      });

      toast({
        title: "Success",
        description: "Groups updated successfully",
      });

      setIsEditingGroups(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update groups",
        variant: "error",
      });
    }
  };

  return (
    <>
    <EntityModal
      open={open}
      onOpenChange={onOpenChange}
      entityType="person"
      title={isEditing ? "Edit Person" : person?.display_name || "Loading..."}
      size="xl"
      footer={
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-between w-full">
          {/* Left side: Delete button (only in edit mode) */}
          <div className="flex gap-3">
            {isEditing && !showDeleteConfirm && (
              <Button
                variant="outline"
                size="md"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={updateMutation.isPending || deleteMutation.isPending}
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
            {!isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsEditing(true)}
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
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  size="md"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSave}
                  disabled={updateMutation.isPending || !formData.display_name}
                >
                  <CheckSquare className="h-4 w-4 mr-2" />
                  {updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
        </div>
      ) : person ? (
        <div className="space-y-6">
          {!isEditing ? (
            <>
              {/* VIEW MODE */}
              {/* Hero Section with Avatar */}
              <div
                className={cn(
                  "flex flex-col items-center text-center py-12 px-6",
                  "min-h-[240px]",
                  "bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50",
                  "rounded-2xl border border-orange-100"
                )}
              >
                <button
                  type="button"
                  onClick={() => setShowImageDialog(true)}
                  className="relative group cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-full"
                  aria-label="Edit photo"
                >
                  <Avatar
                    size="xl"
                    className="ring-4 ring-white shadow-xl mb-4 group-hover:ring-orange-200 transition-all"
                  >
                    {person.photo_url && (
                      <AvatarImage src={person.photo_url} alt={person.display_name} />
                    )}
                    <AvatarFallback>
                      {getInitials(person.display_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/20 rounded-full transition-all mb-4">
                    <Edit className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>

                <h2 className="text-3xl font-bold text-warm-900 mb-2">
                  {person.display_name}
                </h2>

                {person.relationship && (
                  <Badge
                    variant="default"
                    className="text-sm px-4 py-1"
                  >
                    <Heart className="h-3 w-3 mr-1.5 text-orange-500" />
                    {person.relationship}
                  </Badge>
                )}
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="overview" className="flex-1">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="budgets" className="flex-1">
                    Budgets
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">
                    Advanced
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
                  {/* Budget Section */}
                  <div>
                    <h3 className="font-semibold text-warm-900 mb-3">Budget Overview</h3>
                    <PersonBudgetBar personId={person.id} variant="modal" />
                  </div>

                  {/* Birthday Info */}
                  {person.birthdate && (
                    <div
                      className={cn(
                        "bg-gradient-to-br from-amber-50 to-orange-50",
                        "rounded-xl p-5 border border-amber-200"
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
                    <div>
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
                              "hover:shadow-md transition-shadow"
                            )}
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Groups */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-warm-900">Groups</h3>
                      {!isEditingGroups && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleEditGroups}
                          className="min-h-[44px] min-w-[44px]"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {!isEditingGroups ? (
                      person.groups && person.groups.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {person.groups.map(group => (
                            <Badge
                              key={group.id}
                              variant="default"
                              style={{ borderColor: group.color || undefined }}
                              className={cn(
                                "gap-1.5 px-3 py-1.5",
                                "bg-white border-2"
                              )}
                            >
                              {group.color && (
                                <span
                                  className="h-2 w-2 rounded-full flex-shrink-0"
                                  style={{ backgroundColor: group.color }}
                                />
                              )}
                              <span className="text-sm">{group.name}</span>
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-warm-600">Not assigned to any groups</p>
                      )
                    ) : (
                      <div className="space-y-4 p-4 border-2 border-warm-300 rounded-xl bg-warm-50">
                        <GroupMultiSelect
                          value={editingGroupIds}
                          onChange={setEditingGroupIds}
                        />
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditingGroups(false)}
                            className="min-h-[44px]"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveGroups}
                            disabled={updateMutation.isPending}
                            className="min-h-[44px]"
                          >
                            {updateMutation.isPending ? 'Saving...' : 'Save'}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sizes */}
                  {person.size_profile && person.size_profile.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-warm-900 mb-2">Sizes</h3>
                      <div className="grid grid-cols-2 gap-2">
                        {person.size_profile.map((entry, index) => (
                          <div key={index} className="flex justify-between bg-warm-50 rounded-lg p-2">
                            <span className="font-medium text-warm-700 capitalize">{entry.type}:</span>
                            <span className="text-warm-900">{entry.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Constraints */}
                  {person.constraints && (
                    <div>
                      <h3 className="font-semibold text-warm-900 mb-2">Constraints</h3>
                      <p className="text-warm-700 whitespace-pre-wrap">{person.constraints}</p>
                    </div>
                  )}


                  {/* Metadata */}
                  <div
                    className={cn(
                      "pt-4 border-t border-warm-200",
                      "text-sm text-warm-600 space-y-1"
                    )}
                  >
                    {person.created_at && (
                      <p>Added on {formatDate(person.created_at)}</p>
                    )}
                    {person.updated_at && person.updated_at !== person.created_at && (
                      <p>Last updated {formatDate(person.updated_at)}</p>
                    )}
                  </div>
                  {/* Notes */}
                  {person.notes && (
                    <div>
                      <h3 className="font-semibold text-warm-900 mb-2">Notes</h3>
                      <p className="text-warm-700 whitespace-pre-wrap">{person.notes}</p>
                    </div>
                  )}

                </TabsContent>

                {/* Budgets Tab */}
                <TabsContent value="budgets" className="space-y-6">
                  <PersonBudgetsTab
                    personId={person.id}
                    occasionIds={person.occasion_ids || []}
                  />
                </TabsContent>

                {/* Advanced Interests Tab */}
                <TabsContent value="advanced" className="space-y-4">
                  <AdvancedInterestsView data={person.advanced_interests} />
                </TabsContent>

                {/* Linked Entities Tab */}
                <TabsContent value="linked" className="space-y-6">
                  {/* Gifts Section */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-warm-900 text-lg mb-1">
                      Gifts
                    </h3>
                    <p className="text-warm-600 text-sm mb-4">
                      Gifts linked to this person
                    </p>
                    <LinkedGiftsSection
                      personId={person.id}
                      onOpenGiftDetail={openGiftModal}
                    />
                  </div>

                  {/* Lists Section */}
                  <div className="space-y-3 pt-6 border-t border-warm-200">
                    {listsLoading ? (
                      <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500" />
                      </div>
                    ) : lists.length > 0 ? (
                      <div className="space-y-3">
                        <h3 className="font-semibold text-warm-900 text-sm mb-3">
                          Lists for this person
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

                        {lists.map((list: GiftList) => (
                          <Card
                            key={list.id}
                            variant="interactive"
                            padding="default"
                            onClick={() => openListModal(String(list.id))}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-warm-900 truncate">
                                  {list.name}
                                </h4>
                                <p className="text-sm text-warm-600">
                                  {list.item_count || 0} {list.item_count === 1 ? 'item' : 'items'}
                                </p>
                              </div>
                              <Badge variant="default" className="ml-3">
                                {list.type}
                              </Badge>
                            </div>
                          </Card>
                        ))}
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
                            "bg-warm-50 rounded-xl p-12 border border-warm-200",
                            "text-center"
                          )}
                        >
                          <p className="text-warm-600">
                            No lists attached to this person
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* Comments Tab */}
                <TabsContent value="comments" className="space-y-4">
                  <CommentThread
                    entityType="person"
                    entityId={person.id}
                    currentUserId={user?.id}
                  />
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
                      Track changes and updates to this person
                    </p>
                    <div className="text-warm-500 text-sm italic">
                      Coming soon: Activity log will be displayed here
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <>
              {/* EDIT MODE */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="overview" className="flex-1">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="advanced" className="flex-1">
                    Advanced
                  </TabsTrigger>
                </TabsList>

                {/* Overview Tab - Basic fields */}
                <TabsContent value="overview" className="space-y-4">
                  <Input
                    label="Display Name"
                    value={formData.display_name || ""}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    required
                    placeholder="Enter display name"
                  />

                  <Input
                    label="Relationship"
                    value={formData.relationship || ""}
                    onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                    placeholder="e.g., Spouse, Child, Friend"
                  />

                  <Input
                    label="Birthdate"
                    type="date"
                    value={formData.birthdate || ""}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                  />

                  <div>
                    <label className="block mb-2 text-xs font-semibold text-warm-800 uppercase tracking-wide">
                      Photo
                    </label>
                    <ImagePicker
                      value={formData.photo_url || null}
                      onChange={(url) => setFormData({ ...formData, photo_url: url || '' })}
                      onError={(error) => {
                        toast({
                          title: 'Image upload failed',
                          description: error,
                          variant: 'error',
                        });
                      }}
                      disabled={updateMutation.isPending}
                    />
                  </div>

                  <div>
                    <Input
                      label="Interests"
                      value={(formData.interests || []).join(", ")}
                      onChange={(e) => handleInterestsChange(e.target.value)}
                      placeholder="Comma-separated (e.g., Reading, Hiking, Cooking)"
                      helperText="Separate multiple interests with commas"
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-xs font-semibold text-warm-800 uppercase tracking-wide">
                      Sizes
                    </label>
                    <div className="space-y-2">
                      {(formData.size_profile || []).map((entry, index) => (
                        <div key={index} className="flex gap-2">
                          <Input
                            value={entry.type}
                            onChange={(e) => {
                              const newProfile = [...(formData.size_profile || [])];
                              newProfile[index] = { ...entry, type: e.target.value };
                              setFormData({ ...formData, size_profile: newProfile });
                            }}
                            placeholder="Type (e.g., Shirt)"
                            className="flex-1"
                          />
                          <Input
                            value={entry.value}
                            onChange={(e) => {
                              const newProfile = [...(formData.size_profile || [])];
                              newProfile[index] = { ...entry, value: e.target.value };
                              setFormData({ ...formData, size_profile: newProfile });
                            }}
                            placeholder="Size (e.g., M)"
                            className="flex-1"
                          />
                          <Button
                            variant="outline"
                            size="md"
                            onClick={() => {
                              const newProfile = (formData.size_profile || []).filter((_, i) => i !== index);
                              setFormData({ ...formData, size_profile: newProfile });
                            }}
                            className="min-w-[44px]"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newProfile = [...(formData.size_profile || []), { type: '', value: '' }];
                          setFormData({ ...formData, size_profile: newProfile });
                        }}
                        className="w-full"
                      >
                        Add Size
                      </Button>
                    </div>
                  </div>

                  <Textarea
                    label="Constraints"
                    value={formData.constraints || ""}
                    onChange={(e) => setFormData({ ...formData, constraints: e.target.value })}
                    placeholder="Allergies, preferences, restrictions, etc."
                    rows={3}
                  />

                  <Textarea
                    label="Notes"
                    value={formData.notes || ""}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Add any notes about this person"
                    rows={3}
                  />
                </TabsContent>

                {/* Advanced Tab */}
                <TabsContent value="advanced" className="space-y-4">
                  <AdvancedInterestsEdit
                    value={formData.advanced_interests || {}}
                    onChange={(advanced_interests) => setFormData({ ...formData, advanced_interests })}
                  />
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      ) : null}

      {/* List Detail Modal */}
      <ListDetailModal
        listId={listModalId}
        open={listModalOpen}
        onOpenChange={closeListModal}
      />

      {/* Gift Detail Modal */}
      <GiftDetailModal
        giftId={giftModalId}
        open={giftModalOpen}
        onOpenChange={closeGiftModal}
      />

      {personId && (
        <LinkListsToContextModal
          contextId={Number(personId)}
          contextType="person"
          isOpen={showLinkListsModal}
          onClose={() => setShowLinkListsModal(false)}
          existingListIds={lists.map((list) => list.id)}
        />
      )}
    </EntityModal>

    <ImageEditDialog
      open={showImageDialog}
      onOpenChange={setShowImageDialog}
      value={person?.photo_url || null}
      onSave={async (url) => {
        try {
          await updateMutation.mutateAsync({ photo_url: url || '' });
          toast({
            title: 'Success',
            description: 'Photo updated successfully',
          });
          setShowImageDialog(false);
        } catch (error) {
          toast({
            title: 'Error',
            description: error instanceof Error ? error.message : 'Failed to update photo',
            variant: 'error',
          });
        }
      }}
      disabled={updateMutation.isPending}
      title={`Edit ${person?.display_name}'s Photo`}
    />
  </>
  );
}
