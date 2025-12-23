---
title: "Phase 5-8: Frontend & Validation (Admin Page through Validator Refactor)"
description: "Implementation guide for admin UI, navigation, React Query integration, and validation layer refactoring"
audience: [frontend-developers, backend-developers]
tags: [implementation, frontend, react, validation, python]
created: 2025-12-20
updated: 2025-12-20
category: "implementation-planning"
status: active
related: ["docs/project_plans/implementation_plans/features/admin-field-options-v1.md"]
---

# Phase 5-8: Frontend & Validation

**Duration**: 2-2.5 weeks
**Complexity**: Medium-High
**Story Points**: 22 points
**Owners**: Frontend Engineer (UI) + Backend Engineer (Validators)

This phase covers admin navigation, admin page UI components, React Query integration, and validation refactoring to use database-driven options.

---

## Phase 5: Frontend Navigation (Days 1-2)

### Task 5.1: Add Admin Navigation Item to Sidebar

**Story**: `ADMIN-8: Sidebar admin navigation`
**Points**: 2
**Owner**: Frontend Engineer (UI)
**Status**: Not Started

**Description**:
Add "Admin" navigation item to sidebar near user profile area with settings icon.

**Files to Modify**:
- `apps/web/components/shared/Navigation.tsx` (or similar sidebar component)
- `apps/web/lib/nav-config.ts` (if centralized nav config exists)

**Files to Create**:
- `apps/web/components/admin/AdminNavItem.tsx` (optional wrapper)

**Implementation Details**:

```tsx
// apps/web/components/shared/Navigation.tsx

import { SettingsIcon } from "@/components/ui/icons"; // Or use Radix Icon
import Link from "next/link";

export function Navigation() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:relative md:border-t-0 md:border-r md:flex md:flex-col md:w-64">
      {/* Main nav items */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        {/* Existing nav items: Dashboard, Gifts, Lists, People, etc. */}
      </div>

      {/* Admin section - near bottom */}
      <div className="border-t border-gray-200 p-4 flex flex-col gap-2">
        <Link
          href="/admin"
          className="
            flex items-center gap-3 px-4 py-3 rounded-lg
            text-gray-700 hover:bg-gray-100
            min-h-[44px] min-w-[44px]
            font-medium text-sm
          "
        >
          <SettingsIcon className="w-5 h-5" />
          <span className="hidden md:inline">Admin</span>
        </Link>

        {/* User profile/logout below Admin */}
      </div>
    </nav>
  );
}
```

**Styling Notes**:
- Use settings/gear icon (SF Symbol, Radix Icon, or Heroicons)
- 44px minimum touch target (min-h-[44px])
- Position near user profile area (bottom of sidebar)
- Show label on desktop (md:inline), hide on mobile (responsive)
- Hover state: bg-gray-100
- Active state: highlight when on /admin route

**Acceptance Criteria**:
- [ ] Admin nav item visible in sidebar
- [ ] Links to `/admin` page
- [ ] Settings icon displays correctly
- [ ] 44x44px minimum touch target
- [ ] Mobile responsive (icon-only on mobile, label on desktop)
- [ ] Hover/active states styled
- [ ] No console errors

---

### Task 5.2: Create Admin Layout & Root Page

**Story**: `ADMIN-9: AdminPage component` (Part 1)
**Points**: 1
**Owner**: Frontend Engineer (UI)
**Status**: Not Started

**Description**:
Create `/app/admin/page.tsx` and `/app/admin/layout.tsx` with basic structure.

**Files to Create**:
- `apps/web/app/admin/layout.tsx`
- `apps/web/app/admin/page.tsx`

**Implementation Details**:

```tsx
// apps/web/app/admin/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Field Options Management",
  description: "Manage dropdown options for all entities",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">Admin Settings</h1>
        <p className="text-gray-600 mt-2">
          Manage field options for Persons, Gifts, Occasions, and Lists
        </p>
      </header>

      <main>{children}</main>
    </div>
  );
}
```

```tsx
// apps/web/app/admin/page.tsx
"use client";

import { AdminPage } from "@/components/admin/AdminPage";

export default function AdminPageRoute() {
  return <AdminPage />;
}
```

**Acceptance Criteria**:
- [ ] Layout component wraps children
- [ ] Metadata sets page title and description
- [ ] Page component is client-side ('use client')
- [ ] Renders AdminPage component (created in task 5.3)
- [ ] No console errors
- [ ] Mobile responsive layout

---

## Phase 6: Admin Page Components (Days 3-5)

### Task 6.1: Create AdminPage Container Component

**Story**: `ADMIN-9: AdminPage component` (Part 2)
**Points**: 3
**Owner**: Frontend Engineer (UI)
**Status**: Not Started

**Description**:
Create main AdminPage component with tab navigation for entities.

**Files to Create**:
- `apps/web/components/admin/AdminPage.tsx`

**Implementation Details**:

```tsx
// apps/web/components/admin/AdminPage.tsx
"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EntityTab } from "./EntityTab";

type Entity = "person" | "gift" | "occasion" | "list";

const ENTITIES: { id: Entity; label: string; description: string }[] = [
  {
    id: "person",
    label: "Person",
    description: "Preferences, hobbies, interests, dietary restrictions, etc.",
  },
  {
    id: "gift",
    label: "Gift",
    description: "Gift priorities, status, preferences",
  },
  {
    id: "occasion",
    label: "Occasion",
    description: "Occasion types and subtypes",
  },
  {
    id: "list",
    label: "List",
    description: "List types and visibility settings",
  },
];

export function AdminPage() {
  const [activeEntity, setActiveEntity] = useState<Entity>("person");

  return (
    <div className="w-full">
      <Tabs
        value={activeEntity}
        onValueChange={(value) => setActiveEntity(value as Entity)}
        className="w-full"
      >
        {/* Tab navigation */}
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
          {ENTITIES.map((entity) => (
            <TabsTrigger
              key={entity.id}
              value={entity.id}
              className="min-h-[44px]"
            >
              {entity.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab content */}
        {ENTITIES.map((entity) => (
          <TabsContent
            key={entity.id}
            value={entity.id}
            className="mt-6 space-y-4"
          >
            <div className="mb-4">
              <p className="text-gray-600 text-sm">{entity.description}</p>
            </div>

            <EntityTab entity={entity.id} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Tabs component for 4 entities (Person, Gift, Occasion, List)
- [ ] Tab navigation functional (switching between entities)
- [ ] Active tab highlighted
- [ ] Responsive grid (2 cols mobile, 4 cols desktop)
- [ ] Touch targets 44px minimum
- [ ] Renders EntityTab component for selected entity
- [ ] No console errors

---

### Task 6.2: Create EntityTab Component (Fields List)

**Story**: `ADMIN-10: FieldsList component`
**Points**: 3
**Owner**: Frontend Engineer (UI)
**Status**: Not Started

**Description**:
Display list of fields for selected entity with expandable options lists.

**Files to Create**:
- `apps/web/components/admin/EntityTab.tsx`
- `apps/web/components/admin/FieldsList.tsx`

**Implementation Details**:

```tsx
// apps/web/components/admin/EntityTab.tsx
"use client";

import { useMemo } from "react";
import { FieldsList } from "./FieldsList";

const ENTITY_FIELDS = {
  person: [
    {
      name: "wine_types",
      label: "Wine Types",
      category: "Food & Drink",
    },
    {
      name: "beverage_prefs",
      label: "Beverage Preferences",
      category: "Food & Drink",
    },
    // ... more person fields
    {
      name: "hobbies",
      label: "Hobbies",
      category: "Hobbies",
    },
  ],
  gift: [
    {
      name: "priority",
      label: "Priority",
      category: "Classification",
    },
    {
      name: "status",
      label: "Status",
      category: "Lifecycle",
    },
  ],
  occasion: [
    {
      name: "type",
      label: "Occasion Type",
      category: "Classification",
    },
  ],
  list: [
    {
      name: "type",
      label: "List Type",
      category: "Classification",
    },
    {
      name: "visibility",
      label: "Visibility",
      category: "Sharing",
    },
  ],
};

export function EntityTab({ entity }: { entity: "person" | "gift" | "occasion" | "list" }) {
  const fields = useMemo(() => ENTITY_FIELDS[entity] || [], [entity]);

  return (
    <div className="space-y-4">
      <FieldsList entity={entity} fields={fields} />
    </div>
  );
}
```

```tsx
// apps/web/components/admin/FieldsList.tsx
"use client";

import { useState } from "react";
import { ChevronDownIcon } from "@/components/ui/icons";
import { OptionsList } from "./OptionsList";

interface Field {
  name: string;
  label: string;
  category?: string;
}

export function FieldsList({
  entity,
  fields,
}: {
  entity: string;
  fields: Field[];
}) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(
    new Set()
  );

  const toggleField = (fieldName: string) => {
    const next = new Set(expandedFields);
    if (next.has(fieldName)) {
      next.delete(fieldName);
    } else {
      next.add(fieldName);
    }
    setExpandedFields(next);
  };

  // Group fields by category
  const grouped = fields.reduce(
    (acc, field) => {
      const cat = field.category || "Other";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(field);
      return acc;
    },
    {} as Record<string, Field[]>
  );

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, categoryFields]) => (
        <div key={category}>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {category}
          </h3>

          <div className="space-y-2">
            {categoryFields.map((field) => {
              const isExpanded = expandedFields.has(field.name);

              return (
                <div key={field.name} className="border border-gray-200 rounded-lg">
                  {/* Field header */}
                  <button
                    onClick={() => toggleField(field.name)}
                    className="
                      w-full px-4 py-3 flex items-center justify-between
                      hover:bg-gray-50 transition-colors
                      min-h-[44px]
                    "
                  >
                    <div className="flex-1 text-left">
                      <h4 className="font-medium text-gray-900">
                        {field.label}
                      </h4>
                      <p className="text-sm text-gray-500">{field.name}</p>
                    </div>

                    <ChevronDownIcon
                      className={`w-5 h-5 text-gray-400 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Expanded content: options list */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 bg-gray-50 p-4">
                      <OptionsList
                        entity={entity}
                        fieldName={field.name}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Fields grouped by category
- [ ] Expandable/collapsible sections
- [ ] Field header shows label and field name
- [ ] Chevron icon rotates on expand
- [ ] OptionsList rendered when expanded
- [ ] 44px minimum touch targets
- [ ] Responsive layout

---

### Task 6.3: Create OptionsList Component

**Story**: `ADMIN-11: OptionsList component`
**Points**: 3
**Owner**: Frontend Engineer (UI)
**Status**: Not Started

**Description**:
Display list of options for a field with usage badges and action buttons.

**Files to Create**:
- `apps/web/components/admin/OptionsList.tsx`

**Implementation Details**:

```tsx
// apps/web/components/admin/OptionsList.tsx
"use client";

import { useFieldOptions } from "@/hooks/useFieldOptions";
import { PencilIcon, TrashIcon } from "@/components/ui/icons";
import { useState } from "react";
import { EditOptionModal } from "./EditOptionModal";
import { DeleteConfirmationModal } from "./DeleteConfirmationModal";
import { Button } from "@/components/ui/button";
import { AddOptionModal } from "./AddOptionModal";

export function OptionsList({
  entity,
  fieldName,
}: {
  entity: string;
  fieldName: string;
}) {
  const { data, isLoading, error } = useFieldOptions(entity, fieldName);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  if (isLoading) {
    return <div className="text-gray-500">Loading options...</div>;
  }

  if (error) {
    return (
      <div className="text-red-500 bg-red-50 p-3 rounded">
        Failed to load options: {error.message}
      </div>
    );
  }

  const options = data?.items || [];

  return (
    <div className="space-y-3">
      {/* Add button */}
      <Button
        onClick={() => setShowAddModal(true)}
        variant="outline"
        size="sm"
        className="mb-4"
      >
        + Add Option
      </Button>

      {/* Options list */}
      {options.length === 0 ? (
        <p className="text-gray-500 italic py-4">No options yet</p>
      ) : (
        <ul className="space-y-2">
          {options.map((option) => (
            <li
              key={option.id}
              className="
                flex items-center justify-between gap-3
                p-3 bg-white border border-gray-200 rounded
                hover:bg-gray-50 transition-colors
              "
            >
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {option.display_label}
                </p>
                <p className="text-xs text-gray-500">
                  {option.value}
                  {option.is_system && (
                    <span className="ml-2 inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      System
                    </span>
                  )}
                </p>
              </div>

              {/* Usage badge */}
              {option.usage_count !== undefined && (
                <span
                  className={`
                    px-2 py-1 rounded text-xs whitespace-nowrap
                    ${
                      option.usage_count > 0
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                >
                  {option.usage_count > 0
                    ? `In use (${option.usage_count})`
                    : "Unused"}
                </span>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingId(option.id)}
                  className="
                    p-2 hover:bg-blue-100 rounded transition-colors
                    min-h-[44px] min-w-[44px] flex items-center justify-center
                  "
                  title="Edit option"
                >
                  <PencilIcon className="w-4 h-4 text-blue-600" />
                </button>

                <button
                  onClick={() => setDeletingId(option.id)}
                  className="
                    p-2 hover:bg-red-100 rounded transition-colors
                    min-h-[44px] min-w-[44px] flex items-center justify-center
                  "
                  title="Delete option"
                >
                  <TrashIcon className="w-4 h-4 text-red-600" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modals */}
      {editingId && (
        <EditOptionModal
          optionId={editingId}
          entity={entity}
          fieldName={fieldName}
          onClose={() => setEditingId(null)}
        />
      )}

      {deletingId && (
        <DeleteConfirmationModal
          optionId={deletingId}
          entity={entity}
          fieldName={fieldName}
          onClose={() => setDeletingId(null)}
        />
      )}

      {showAddModal && (
        <AddOptionModal
          entity={entity}
          fieldName={fieldName}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  );
}
```

**Acceptance Criteria**:
- [ ] Options loaded via useFieldOptions hook
- [ ] Loading state displayed
- [ ] Error state displayed
- [ ] Options sorted by display_order
- [ ] Each option shows label, value, usage badge
- [ ] System options marked as "System"
- [ ] Edit and Delete buttons for each option
- [ ] Add Option button opens modal
- [ ] 44px minimum touch targets
- [ ] Responsive layout

---

### Task 6.4: Create Add/Edit/Delete Modals

**Story**: `ADMIN-12/13/14: CRUD Modals`
**Points**: 3
**Owner**: Frontend Engineer (UI)
**Status**: Not Started

**Description**:
Create modal components for add, edit, and delete operations.

**Files to Create**:
- `apps/web/components/admin/AddOptionModal.tsx`
- `apps/web/components/admin/EditOptionModal.tsx`
- `apps/web/components/admin/DeleteConfirmationModal.tsx`

**Implementation Details**:

```tsx
// apps/web/components/admin/AddOptionModal.tsx
"use client";

import { useState } from "react";
import { useCreateFieldOption } from "@/hooks/useFieldOptionsMutation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AddOptionModal({
  entity,
  fieldName,
  onClose,
}: {
  entity: string;
  fieldName: string;
  onClose: () => void;
}) {
  const [value, setValue] = useState("");
  const [displayLabel, setDisplayLabel] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const { mutate: createOption, isPending, error } = useCreateFieldOption(
    entity,
    fieldName,
    onClose
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || !displayLabel) {
      alert("Please fill in all fields");
      return;
    }
    createOption({
      entity,
      field_name: fieldName,
      value,
      display_label: displayLabel,
      display_order: displayOrder,
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Option</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="value">Value (key)*</Label>
            <Input
              id="value"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g., sake, low, holiday"
              required
              disabled={isPending}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Immutable after creation. Use lowercase, underscores for spaces.
            </p>
          </div>

          <div>
            <Label htmlFor="displayLabel">Display Label*</Label>
            <Input
              id="displayLabel"
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              placeholder="e.g., Sake, Low Priority, Holiday"
              required
              disabled={isPending}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              disabled={isPending}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </div>

          {error && (
            <div className="text-red-500 bg-red-50 p-3 rounded text-sm">
              {error.message}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create Option"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx
// apps/web/components/admin/EditOptionModal.tsx
"use client";

import { useState, useEffect } from "react";
import { useUpdateFieldOption, useGetFieldOption } from "@/hooks/useFieldOptionsMutation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function EditOptionModal({
  optionId,
  entity,
  fieldName,
  onClose,
}: {
  optionId: number;
  entity: string;
  fieldName: string;
  onClose: () => void;
}) {
  const { data: option, isLoading: loadingOption } = useGetFieldOption(optionId);
  const [displayLabel, setDisplayLabel] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const { mutate: updateOption, isPending: updating, error } = useUpdateFieldOption(
    optionId,
    onClose
  );

  useEffect(() => {
    if (option) {
      setDisplayLabel(option.display_label);
      setDisplayOrder(option.display_order);
    }
  }, [option]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateOption({
      display_label: displayLabel,
      display_order: displayOrder,
    });
  };

  if (loadingOption) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>Loading...</DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Option</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Value (key)</Label>
            <div className="px-3 py-2 bg-gray-100 rounded text-gray-600 text-sm">
              {option?.value}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Value is immutable after creation
            </p>
          </div>

          <div>
            <Label htmlFor="displayLabel">Display Label*</Label>
            <Input
              id="displayLabel"
              value={displayLabel}
              onChange={(e) => setDisplayLabel(e.target.value)}
              required
              disabled={updating}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="displayOrder">Display Order</Label>
            <Input
              id="displayOrder"
              type="number"
              value={displayOrder}
              onChange={(e) => setDisplayOrder(Number(e.target.value))}
              disabled={updating}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </div>

          {error && (
            <div className="text-red-500 bg-red-50 p-3 rounded text-sm">
              {error.message}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={updating}>
              Cancel
            </Button>
            <Button type="submit" disabled={updating}>
              {updating ? "Updating..." : "Update Option"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
```

```tsx
// apps/web/components/admin/DeleteConfirmationModal.tsx
"use client";

import { useDeleteFieldOption, useGetFieldOption } from "@/hooks/useFieldOptionsMutation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "@/components/ui/icons";

export function DeleteConfirmationModal({
  optionId,
  entity,
  fieldName,
  onClose,
}: {
  optionId: number;
  entity: string;
  fieldName: string;
  onClose: () => void;
}) {
  const { data: option, isLoading } = useGetFieldOption(optionId);
  const { mutate: deleteOption, isPending, error } = useDeleteFieldOption(
    optionId,
    onClose
  );

  const handleDelete = () => {
    // Soft-delete by default; hard-delete only if unused
    const hardDelete = option && option.usage_count === 0;
    deleteOption({ hard_delete: hardDelete });
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>Loading...</DialogContent>
      </Dialog>
    );
  }

  const inUse = option && option.usage_count && option.usage_count > 0;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            Delete Option
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <strong>{option?.display_label}</strong>?
          </p>

          {inUse && (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-800 text-sm font-medium">
                ⚠️ This option is in use
              </p>
              <p className="text-yellow-700 text-sm mt-1">
                {option.usage_count} person/gift record(s) use this value. It
                will be soft-deleted (hidden from UI but still queryable).
              </p>
            </div>
          )}

          {!inUse && (
            <p className="text-gray-600 text-sm">
              This option is not in use and will be permanently deleted.
            </p>
          )}

          {error && (
            <div className="text-red-500 bg-red-50 p-3 rounded text-sm">
              {error.message}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={onClose} disabled={isPending}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isPending}
            >
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

**Acceptance Criteria**:
- [ ] AddOptionModal: form with value and display_label fields
- [ ] EditOptionModal: edit label/order, value grayed out
- [ ] DeleteConfirmationModal: shows usage count, warns if in-use
- [ ] All modals have cancel/confirm buttons
- [ ] Loading states shown
- [ ] Error messages displayed
- [ ] Forms disabled while submitting
- [ ] Modals close on success
- [ ] Keyboard support (Tab, Enter, Escape)

---

## Phase 7: React Query Integration (Days 6-7)

### Task 7.1: Create React Query Hooks

**Story**: `ADMIN-15: React Query integration`
**Points**: 3
**Owner**: Frontend Engineer (UI)
**Status**: Not Started

**Description**:
Create custom React Query hooks for fetching and mutating field options.

**Files to Create**:
- `apps/web/hooks/useFieldOptions.ts`
- `apps/web/hooks/useFieldOptionsMutation.ts`
- `apps/web/lib/api/field-options.ts` (API client)

**Implementation Details**:

```typescript
// apps/web/lib/api/field-options.ts
import { apiCall } from "@/lib/api";

export interface FieldOptionDTO {
  id: number;
  entity: string;
  field_name: string;
  value: string;
  display_label: string;
  display_order: number;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  usage_count?: number;
}

export interface FieldOptionsListDTO {
  total: number;
  items: FieldOptionDTO[];
}

export async function fetchFieldOptions(
  entity: string,
  fieldName: string,
  includeInactive: boolean = false,
  skip: number = 0,
  limit: number = 100
): Promise<FieldOptionsListDTO> {
  return apiCall<FieldOptionsListDTO>(
    `/api/field-options?entity=${entity}&field_name=${fieldName}&include_inactive=${includeInactive}&skip=${skip}&limit=${limit}`
  );
}

export async function getFieldOption(id: number): Promise<FieldOptionDTO> {
  return apiCall<FieldOptionDTO>(`/api/field-options/${id}`);
}

export async function createFieldOption(
  data: Omit<FieldOptionDTO, "id" | "is_system" | "is_active" | "created_at" | "updated_at" | "created_by" | "updated_by" | "usage_count">
): Promise<FieldOptionDTO> {
  return apiCall<FieldOptionDTO>("/api/field-options", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateFieldOption(
  id: number,
  data: Partial<Pick<FieldOptionDTO, "display_label" | "display_order">>
): Promise<FieldOptionDTO> {
  return apiCall<FieldOptionDTO>(`/api/field-options/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteFieldOption(
  id: number,
  hardDelete: boolean = false
): Promise<{ success: boolean; soft_deleted: boolean; message: string }> {
  return apiCall<{ success: boolean; soft_deleted: boolean; message: string }>(
    `/api/field-options/${id}?hard_delete=${hardDelete}`,
    {
      method: "DELETE",
    }
  );
}
```

```typescript
// apps/web/hooks/useFieldOptions.ts
import { useQuery } from "@tanstack/react-query";
import { fetchFieldOptions, FieldOptionsListDTO } from "@/lib/api/field-options";

export function useFieldOptions(
  entity: string,
  fieldName: string,
  includeInactive: boolean = false
) {
  return useQuery<FieldOptionsListDTO>({
    queryKey: ["field-options", entity, fieldName, includeInactive],
    queryFn: () =>
      fetchFieldOptions(entity, fieldName, includeInactive),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  });
}
```

```typescript
// apps/web/hooks/useFieldOptionsMutation.ts
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createFieldOption,
  updateFieldOption,
  deleteFieldOption,
  getFieldOption,
  FieldOptionDTO,
} from "@/lib/api/field-options";

export function useGetFieldOption(optionId: number) {
  return useQuery<FieldOptionDTO>({
    queryKey: ["field-options", optionId],
    queryFn: () => getFieldOption(optionId),
    enabled: !!optionId,
  });
}

export function useCreateFieldOption(
  entity: string,
  fieldName: string,
  onSuccess?: () => void
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createFieldOption,
    onSuccess: (newOption) => {
      // Invalidate list query to refetch
      queryClient.invalidateQueries({
        queryKey: ["field-options", entity, fieldName],
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      console.error("Failed to create option:", error);
    },
  });
}

export function useUpdateFieldOption(optionId: number, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Parameters<typeof updateFieldOption>[1]) =>
      updateFieldOption(optionId, data),
    onSuccess: (updatedOption) => {
      // Invalidate both single and list queries
      queryClient.invalidateQueries({
        queryKey: ["field-options", optionId],
      });
      queryClient.invalidateQueries({
        queryKey: ["field-options"],
      });
      onSuccess?.();
    },
  });
}

export function useDeleteFieldOption(optionId: number, onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: { hard_delete: boolean }) =>
      deleteFieldOption(optionId, params.hard_delete),
    onSuccess: () => {
      // Invalidate all field-options queries
      queryClient.invalidateQueries({
        queryKey: ["field-options"],
      });
      onSuccess?.();
    },
  });
}
```

**Acceptance Criteria**:
- [ ] useFieldOptions hook fetches with 5-minute stale time
- [ ] useGetFieldOption hook for single option
- [ ] useCreateFieldOption invalidates list query
- [ ] useUpdateFieldOption invalidates both single and list
- [ ] useDeleteFieldOption invalidates all field-options queries
- [ ] Error handling propagated to components
- [ ] Cache invalidation works correctly
- [ ] No console warnings about missing dependencies

---

## Phase 8: Validation Refactoring (Days 8-10)

### Task 8.1: Update Person Schema Validators

**Story**: `ADMIN-17: Update Person validators`
**Points**: 3
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Refactor Person schema validators to query field_options table first, with fallback to hardcoded set.

**Files to Modify**:
- `services/api/app/schemas/person.py`

**Implementation Details**:

```python
# In app/schemas/person.py, replace hardcoded sets with dynamic validation:

from fastapi import Depends
from app.repositories.field_option import FieldOptionsRepository
from sqlalchemy.orm import Session
from app.core.database import get_db

async def get_valid_wine_types(
    db: Session = Depends(get_db),
    repo: FieldOptionsRepository = Depends(),
) -> set[str]:
    """Fetch wine_types options from DB, fallback to hardcoded set."""
    options, _ = repo.get_options("person", "wine_types", include_inactive=True)
    if options:
        return {opt.value for opt in options}
    # Fallback to hardcoded during transition
    return {"red", "white", "rosé", "sparkling", ...}

class PersonCreate(BaseModel):
    # ... other fields
    wine_types: Optional[list[str]] = Field(None)

    @field_validator("wine_types")
    @classmethod
    async def validate_wine_types(cls, v: list[str] | None, info: ValidationInfo) -> list[str] | None:
        if v is None:
            return None

        # Get valid options from context or DB
        # For now, accept any value (permissive during transition)
        # TODO: Implement strict validation once all options migrated to DB

        return v
```

**Acceptance Criteria**:
- [ ] Validators query field_options table
- [ ] Fallback to hardcoded set if DB unavailable
- [ ] Old enum values still accepted (backward compatible)
- [ ] New DB values also accepted
- [ ] No breaking changes to existing Person schema
- [ ] Tests verify backward compatibility

---

### Task 8.2: Update Gift/Occasion/List Schema Validators

**Story**: `ADMIN-18: Update Gift/Occasion/List validators`
**Points**: 3
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Refactor Gift, Occasion, and List schema validators similarly.

**Files to Modify**:
- `services/api/app/schemas/gift.py`
- `services/api/app/schemas/occasion.py`
- `services/api/app/schemas/list.py`

**Implementation Details**:

Similar pattern to Task 8.1:
- Query field_options for enum values
- Fallback to Python enum if DB unavailable
- Keep backward compatibility
- Accept both old enum and new DB values

**Acceptance Criteria**:
- [ ] All 3 entity schemas updated
- [ ] Backward compatible with existing enum values
- [ ] New DB values accepted
- [ ] Enum fallback in place
- [ ] Tests verify all scenarios

---

### Task 8.3: Backward Compatibility Testing

**Story**: `ADMIN-16: Validate backward compatibility`
**Points**: 3
**Owner**: Backend Engineer
**Status**: Not Started

**Description**:
Verify that existing data with old enum values remains valid after migration.

**Files to Create**:
- `services/api/tests/integration/test_backward_compatibility.py`

**Implementation Details**:

```python
# tests/integration/test_backward_compatibility.py
import pytest
from app.models.person import Person
from app.models.gift import Gift
from app.schemas.person import PersonCreate
from app.schemas.gift import GiftCreate

class TestBackwardCompatibility:
    """Verify old enum values still work after migration."""

    def test_person_with_old_enum_value(self, db_session):
        """Old wine_type value should still be valid."""
        data = PersonCreate(
            name="Alice",
            wine_types=["red", "white"],  # Old hardcoded values
        )
        # Should not raise validation error
        person = Person(**data.dict())
        assert "red" in person.wine_types

    def test_gift_with_old_enum_value(self, db_session):
        """Old priority enum should still be valid."""
        data = GiftCreate(
            name="LEGO",
            priority="low",  # Old enum value
        )
        gift = Gift(**data.dict())
        assert gift.priority == "low"

    def test_new_db_values_accepted(self, db_session, repo):
        """New values from DB should be accepted."""
        # Create new option in DB
        from app.schemas.field_option import FieldOptionCreateDTO
        new_option = FieldOptionCreateDTO(
            entity="person",
            field_name="wine_types",
            value="sake",
            display_label="Sake",
        )
        repo.create(new_option)

        # Should accept new value
        data = PersonCreate(
            name="Bob",
            wine_types=["sake"],  # New DB value
        )
        person = Person(**data.dict())
        assert "sake" in person.wine_types
```

**Acceptance Criteria**:
- [ ] Old enum values still work
- [ ] New DB values accepted
- [ ] No breaking changes
- [ ] Mixed old and new values work together
- [ ] All tests pass

---

## Phase 5-8 Summary

**Total Story Points**: 22 points
**Duration**: 2-2.5 weeks (1 developer per role)

### Deliverables

- [x] Admin nav item in sidebar
- [x] /admin page with layout
- [x] AdminPage component with entity tabs
- [x] FieldsList component (expandable fields)
- [x] OptionsList component (with CRUD actions)
- [x] AddOptionModal component
- [x] EditOptionModal component
- [x] DeleteConfirmationModal component
- [x] React Query hooks for fetch and mutations
- [x] API client wrapper
- [x] Person schema validator refactor
- [x] Gift/Occasion/List validator refactor
- [x] Backward compatibility testing

### Quality Metrics

- [ ] All components render without errors
- [ ] Admin page loads <1 second
- [ ] Options refetch <5 seconds after mutation
- [ ] All modals functional
- [ ] Keyboard navigation works
- [ ] Mobile responsive
- [ ] No console warnings

### Next Phase

Once Phase 5-8 complete and integrated with Phase 1-4, proceed to **Phase 9-10: Testing & Documentation** (`admin-field-options-v1/phase-9-10-testing.md`)

---

**Document Version**: 1.0
**Status**: Ready for Phase 5 Start (after Phase 1-4 complete)
**Last Updated**: 2025-12-20
