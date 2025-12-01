"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { EntityModal } from "./EntityModal";
import { Avatar, AvatarImage, AvatarFallback, getInitials } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Cake, Calendar, CheckSquare, Edit, ExternalLink, Heart, Sparkles, Trash2, X } from "@/components/ui/icons";
import { formatDate, getAge, getNextBirthday } from "@/lib/date-utils";
import { personApi } from "@/lib/api/endpoints";
import { useUpdatePerson, useDeletePerson } from "@/hooks/usePersons";
import type { Person, PersonUpdate } from "@/types";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/use-toast";

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
  const [isEditing, setIsEditing] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const { data: person, isLoading } = useQuery<Person>({
    queryKey: ["people", personId],
    queryFn: () => personApi.get(Number(personId)),
    enabled: !!personId && open,
  });

  const updateMutation = useUpdatePerson(Number(personId));
  const deleteMutation = useDeletePerson();

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
        sizes: person.sizes || {},
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
      if (formData.sizes && Object.keys(formData.sizes).length > 0) updateData.sizes = formData.sizes;
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

  return (
    <EntityModal
      open={open}
      onOpenChange={onOpenChange}
      entityType="person"
      title={isEditing ? "Edit Person" : person?.display_name || "Loading..."}
      size="lg"
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
                  "flex flex-col items-center text-center py-8",
                  "bg-gradient-to-br from-orange-50 via-pink-50 to-rose-50",
                  "rounded-2xl border border-orange-100"
                )}
              >
                <Avatar
                  size="xl"
                  className="ring-4 ring-white shadow-xl mb-4"
                >
                  {person.photo_url && (
                    <AvatarImage src={person.photo_url} alt={person.display_name} />
                  )}
                  <AvatarFallback>
                    {getInitials(person.display_name)}
                  </AvatarFallback>
                </Avatar>

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

              {/* Notes */}
              {person.notes && (
                <div>
                  <h3 className="font-semibold text-warm-900 mb-2">Notes</h3>
                  <p className="text-warm-700 whitespace-pre-wrap">{person.notes}</p>
                </div>
              )}

              {/* Sizes */}
              {person.sizes && Object.keys(person.sizes).length > 0 && (
                <div>
                  <h3 className="font-semibold text-warm-900 mb-2">Sizes</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(person.sizes).map(([key, value]) => (
                      <div key={key} className="flex justify-between bg-warm-50 rounded-lg p-2">
                        <span className="font-medium text-warm-700">{key}:</span>
                        <span className="text-warm-900">{value}</span>
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
            </>
          ) : (
            <>
              {/* EDIT MODE */}
              <div className="space-y-4">
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

                <Input
                  label="Photo URL"
                  value={formData.photo_url || ""}
                  onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />

                <Textarea
                  label="Notes"
                  value={formData.notes || ""}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add any notes about this person"
                  rows={3}
                />

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
                    {Object.entries(formData.sizes || {}).map(([key, value]) => (
                      <div key={key} className="flex gap-2">
                        <Input
                          value={key}
                          onChange={(e) => {
                            const newSizes = { ...(formData.sizes || {}) };
                            delete newSizes[key];
                            newSizes[e.target.value] = value;
                            setFormData({ ...formData, sizes: newSizes });
                          }}
                          placeholder="Type (e.g., Shirt)"
                          className="flex-1"
                        />
                        <Input
                          value={value}
                          onChange={(e) => handleSizesChange(key, e.target.value)}
                          placeholder="Size (e.g., M)"
                          className="flex-1"
                        />
                        <Button
                          variant="outline"
                          size="md"
                          onClick={() => handleRemoveSize(key)}
                          className="min-w-[44px]"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSizesChange("", "")}
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
              </div>
            </>
          )}
        </div>
      ) : null}
    </EntityModal>
  );
}
