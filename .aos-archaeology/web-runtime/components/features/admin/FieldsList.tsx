'use client';

import { useState } from 'react';
import { Icon } from '@/components/ui/icon';
import { OptionsList } from './OptionsList';

interface FieldConfig {
  name: string;
  label: string;
  category: string;
}

interface FieldsListProps {
  entity: string;
  fields: FieldConfig[];
}

/**
 * FieldsList displays fields grouped by category
 * Each field is expandable to show its options
 */
export function FieldsList({ entity, fields }: FieldsListProps) {
  const [expandedFields, setExpandedFields] = useState<Set<string>>(new Set());

  const toggleField = (fieldName: string) => {
    setExpandedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldName)) {
        next.delete(fieldName);
      } else {
        next.add(fieldName);
      }
      return next;
    });
  };

  // Group fields by category
  const groupedFields = fields.reduce<Record<string, FieldConfig[]>>(
    (acc, field) => {
      const category = field.category || 'Other';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(field);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-8">
      {Object.entries(groupedFields).map(([category, categoryFields]) => (
        <div key={category}>
          {/* Category Header */}
          <h3 className="text-base font-semibold text-warm-800 mb-4">
            {category}
          </h3>

          {/* Fields in Category */}
          <div className="space-y-3">
            {categoryFields.map((field) => {
              const isExpanded = expandedFields.has(field.name);

              return (
                <div
                  key={field.name}
                  className="border border-warm-200 rounded-xlarge overflow-hidden"
                >
                  {/* Field Header - Clickable */}
                  <button
                    type="button"
                    onClick={() => toggleField(field.name)}
                    className="
                      w-full px-4 py-3 flex items-center justify-between
                      bg-white hover:bg-warm-50 transition-colors
                      min-h-[44px] text-left
                    "
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-warm-900">
                        {field.label}
                      </h4>
                      <p className="text-xs text-warm-500 mt-0.5">
                        {field.name}
                      </p>
                    </div>

                    <Icon
                      name="expand_more"
                      className={`
                        w-5 h-5 text-warm-400 transition-transform duration-200
                        ${isExpanded ? 'rotate-180' : ''}
                      `}
                    />
                  </button>

                  {/* Expanded Content - Options List */}
                  {isExpanded && (
                    <div className="border-t border-warm-200 bg-warm-50 p-4">
                      <OptionsList entity={entity} fieldName={field.name} />
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
