'use client';

import { AssignmentCard } from './AssignmentCard';
import type { AssignmentItem } from '@/hooks/useMyAssignments';
import { ListIcon, UserIcon } from '@/components/layout/icons';

export interface AssignmentListProps {
  assignments: AssignmentItem[];
  groupBy: 'list' | 'person';
}

/**
 * Assignment List Component
 *
 * Groups and displays assignments by list or person.
 * Shows section headers with counts and lists assignment cards.
 */
export function AssignmentList({ assignments, groupBy }: AssignmentListProps) {
  if (groupBy === 'list') {
    return <AssignmentListByList assignments={assignments} />;
  } else {
    return <AssignmentListByPerson assignments={assignments} />;
  }
}

/**
 * Group assignments by list
 */
function AssignmentListByList({ assignments }: { assignments: AssignmentItem[] }) {
  // Group by list
  const grouped = new Map<number, { listName: string; items: AssignmentItem[] }>();

  assignments.forEach((assignment) => {
    const listId = assignment.list_id;
    const listName = assignment.list?.name || 'Unknown List';

    if (!grouped.has(listId)) {
      grouped.set(listId, {
        listName,
        items: [],
      });
    }
    grouped.get(listId)!.items.push(assignment);
  });

  const groupedArray = Array.from(grouped.values());

  return (
    <div className="space-y-6">
      {groupedArray.map((group, index) => (
        <div key={index}>
          <div className="flex items-center gap-2 mb-3">
            <ListIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              {group.listName}
            </h2>
            <span className="text-sm text-gray-500">({group.items.length})</span>
          </div>
          <div className="space-y-2">
            {group.items.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Group assignments by person
 */
function AssignmentListByPerson({ assignments }: { assignments: AssignmentItem[] }) {
  // Group by person
  const grouped = new Map<string, { personName: string; items: AssignmentItem[] }>();

  assignments.forEach((assignment) => {
    const personName = assignment.list?.person_name || 'Unknown Person';

    if (!grouped.has(personName)) {
      grouped.set(personName, {
        personName,
        items: [],
      });
    }
    grouped.get(personName)!.items.push(assignment);
  });

  const groupedArray = Array.from(grouped.values());

  return (
    <div className="space-y-6">
      {groupedArray.map((group, index) => (
        <div key={index}>
          <div className="flex items-center gap-2 mb-3">
            <UserIcon className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-semibold text-gray-900">
              {group.personName}
            </h2>
            <span className="text-sm text-gray-500">({group.items.length})</span>
          </div>
          <div className="space-y-2">
            {group.items.map((assignment) => (
              <AssignmentCard key={assignment.id} assignment={assignment} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
