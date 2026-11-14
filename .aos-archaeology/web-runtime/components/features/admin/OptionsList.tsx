'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { useFieldOptions } from '@/hooks/useFieldOptions';
import type { FieldOptionDTO } from '@/lib/api/field-options';
import { AddOptionModal } from './AddOptionModal';
import { EditOptionModal } from './EditOptionModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';

interface OptionsListProps {
  entity: string;
  fieldName: string;
}

/**
 * OptionsList displays all options for a specific field
 * with add, edit, and delete capabilities
 */
export function OptionsList({ entity, fieldName }: OptionsListProps) {
  const { data, isLoading, error } = useFieldOptions({
    entity,
    fieldName,
    includeInactive: true,
  });

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingOption, setDeletingOption] = useState<FieldOptionDTO | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-warm-500">
        <Icon name="progress_activity" className="w-4 h-4 animate-spin" />
        <span>Loading options...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
        <Icon name="error" className="w-4 h-4 inline mr-2" />
        Failed to load options: {error instanceof Error ? error.message : 'Unknown error'}
      </div>
    );
  }

  const options = data?.items || [];

  return (
    <div className="space-y-4">
      {/* Add Option Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowAddModal(true)}
        className="min-h-[44px]"
      >
        <Icon name="add" className="w-4 h-4 mr-2" />
        Add Option
      </Button>

      {/* Options List */}
      {options.length === 0 ? (
        <p className="text-warm-500 italic py-2">
          No options defined yet. Click &quot;Add Option&quot; to create one.
        </p>
      ) : (
        <ul className="space-y-2">
          {options.map((option) => (
            <li
              key={option.id}
              className={`
                flex items-center justify-between gap-3
                p-3 bg-white border rounded-lg
                ${option.is_active ? 'border-warm-200' : 'border-warm-100 opacity-60'}
                hover:bg-warm-50 transition-colors
              `}
            >
              {/* Option Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-warm-900 truncate">
                    {option.display_label}
                  </span>
                  {option.is_system && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      System
                    </span>
                  )}
                  {!option.is_active && (
                    <span className="px-2 py-0.5 bg-warm-100 text-warm-600 text-xs rounded-full">
                      Inactive
                    </span>
                  )}
                </div>
                <p className="text-xs text-warm-500 truncate">
                  {option.value}
                </p>
              </div>

              {/* Usage Badge */}
              {option.usage_count !== undefined && (
                <span
                  className={`
                    px-2 py-1 rounded text-xs whitespace-nowrap
                    ${option.usage_count > 0
                      ? 'bg-green-100 text-green-700'
                      : 'bg-warm-100 text-warm-600'
                    }
                  `}
                >
                  {option.usage_count > 0
                    ? `Used: ${option.usage_count}`
                    : 'Unused'}
                </span>
              )}

              {/* Action Buttons */}
              <div className="flex gap-1">
                {/* Edit Button */}
                <button
                  type="button"
                  onClick={() => setEditingId(option.id)}
                  className="
                    p-2 hover:bg-blue-100 rounded transition-colors
                    min-h-[44px] min-w-[44px] flex items-center justify-center
                  "
                  title="Edit option"
                  disabled={option.is_system}
                >
                  <Icon
                    name="edit"
                    className={`w-4 h-4 ${option.is_system ? 'text-warm-300' : 'text-blue-600'}`}
                  />
                </button>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => setDeletingOption(option)}
                  className="
                    p-2 hover:bg-red-100 rounded transition-colors
                    min-h-[44px] min-w-[44px] flex items-center justify-center
                  "
                  title="Delete option"
                  disabled={option.is_system}
                >
                  <Icon
                    name="delete"
                    className={`w-4 h-4 ${option.is_system ? 'text-warm-300' : 'text-red-600'}`}
                  />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add Option Modal */}
      {showAddModal && (
        <AddOptionModal
          entity={entity}
          fieldName={fieldName}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {/* Edit Option Modal */}
      {editingId && (
        <EditOptionModal
          optionId={editingId}
          entity={entity}
          fieldName={fieldName}
          onClose={() => setEditingId(null)}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingOption && (
        <DeleteConfirmationModal
          option={deletingOption}
          entity={entity}
          fieldName={fieldName}
          onClose={() => setDeletingOption(null)}
        />
      )}
    </div>
  );
}
