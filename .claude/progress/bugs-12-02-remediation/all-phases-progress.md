---
type: progress
prd: "bugs-12-02-remediation"
status: not_started
progress: 0
total_tasks: 21
completed_tasks: 0
created: 2025-12-02
updated: 2025-12-02

phases:
  - id: "phase-0"
    title: "Wire Up Existing Components (ROOT CAUSE)"
    priority: P0
    status: not_started
    tasks: 4
    completed: 0
  - id: "phase-1"
    title: "Critical Bug Fix"
    priority: P0
    status: not_started
    tasks: 3
    completed: 0
  - id: "phase-2"
    title: "Linked Entities Implementation"
    priority: P1
    status: not_started
    tasks: 7
    completed: 0
  - id: "phase-3"
    title: "Gift Filter UI Redesign"
    priority: P2
    status: not_started
    tasks: 7
    completed: 0
  - id: "phase-4"
    title: "History Tab Implementation"
    priority: P3
    status: not_started
    tasks: 6
    completed: 0
    stretch: true

tasks:
  # Phase 0: Wire Up Existing Components
  - id: "TASK-0.1"
    phase: 0
    title: "Refactor /people page to use PersonCard"
    status: pending
    priority: P0
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    file: "apps/web/app/people/page.tsx"
    description: "Replace inline card rendering (lines 299-333) with PersonCard component"

  - id: "TASK-0.2"
    phase: 0
    title: "Remove inline Dialog from /people page"
    status: pending
    priority: P0
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-0.1"]
    file: "apps/web/app/people/page.tsx"
    description: "PersonCard already includes PersonDetailModal; remove Dialog code (lines 399-522)"

  - id: "TASK-0.3"
    phase: 0
    title: "Clean up unused state"
    status: pending
    priority: P0
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-0.2"]
    file: "apps/web/app/people/page.tsx"
    description: "Remove selectedRecipient state and related code"

  - id: "TASK-0.4"
    phase: 0
    title: "Verify PersonCard features work"
    status: pending
    priority: P0
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-0.3"]
    description: "Test age, birthday, gift count, lists display after wiring up"

  # Phase 1: Critical Bug Fix
  - id: "TASK-1.1"
    phase: 1
    title: "Fix null reference in totalValue calculation"
    status: pending
    priority: P0
    assigned_to: ["ui-engineer"]
    dependencies: []
    file: "apps/web/components/modals/ListDetailModal.tsx"
    line: 148
    fix: "Change item.gift.price to item.gift?.price"

  - id: "TASK-1.2"
    phase: 1
    title: "Audit all .gift. property accesses"
    status: pending
    priority: P0
    assigned_to: ["ui-engineer"]
    dependencies: ["TASK-1.1"]
    file: "apps/web/components/modals/ListDetailModal.tsx"

  - id: "TASK-1.3"
    phase: 1
    title: "Add type guard for ListItemWithGift"
    status: pending
    priority: P0
    assigned_to: ["ui-engineer"]
    dependencies: ["TASK-1.2"]
    file: "apps/web/components/modals/ListDetailModal.tsx"

  # Phase 2: Linked Entities Implementation
  - id: "TASK-2.1"
    phase: 2
    title: "Add useListsForPerson hook"
    status: pending
    priority: P1
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    file: "apps/web/hooks/useLists.ts"

  - id: "TASK-2.2"
    phase: 2
    title: "Add useListsForOccasion hook"
    status: pending
    priority: P1
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    file: "apps/web/hooks/useLists.ts"

  - id: "TASK-2.3"
    phase: 2
    title: "Add useListsForGift hook"
    status: pending
    priority: P1
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    file: "apps/web/hooks/useLists.ts"

  - id: "TASK-2.4"
    phase: 2
    title: "Implement PersonDetailModal linked tab"
    status: pending
    priority: P1
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.1"]
    file: "apps/web/components/modals/PersonDetailModal.tsx"
    lines: "421-439"

  - id: "TASK-2.5"
    phase: 2
    title: "Implement OccasionDetailModal linked tab"
    status: pending
    priority: P1
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.2"]
    file: "apps/web/components/modals/OccasionDetailModal.tsx"
    lines: "326-343"

  - id: "TASK-2.6"
    phase: 2
    title: "Implement GiftDetailModal linked tab"
    status: pending
    priority: P1
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.3"]
    file: "apps/web/components/modals/GiftDetailModal.tsx"

  - id: "TASK-2.7"
    phase: 2
    title: "Add list item click navigation"
    status: pending
    priority: P1
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-2.4", "TASK-2.5", "TASK-2.6"]

  # Phase 3: Gift Filter UI Redesign
  - id: "TASK-3.1"
    phase: 3
    title: "Install Radix Collapsible"
    status: pending
    priority: P2
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: []
    command: "pnpm add @radix-ui/react-collapsible"

  - id: "TASK-3.2"
    phase: 3
    title: "Create Collapsible UI component"
    status: pending
    priority: P2
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.1"]
    file: "apps/web/components/ui/collapsible.tsx"

  - id: "TASK-3.3"
    phase: 3
    title: "Update FilterBar to be collapsible"
    status: pending
    priority: P2
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.2"]
    file: "apps/web/components/ui/filter-bar.tsx"

  - id: "TASK-3.4"
    phase: 3
    title: "Update FilterGroup to be collapsible"
    status: pending
    priority: P2
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.2"]
    file: "apps/web/components/ui/filter-bar.tsx"

  - id: "TASK-3.5"
    phase: 3
    title: "Add collapse state management"
    status: pending
    priority: P2
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.3", "TASK-3.4"]
    file: "apps/web/components/gifts/GiftFilters.tsx"

  - id: "TASK-3.6"
    phase: 3
    title: "Add active filter summary"
    status: pending
    priority: P2
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.5"]
    file: "apps/web/components/gifts/GiftFilters.tsx"

  - id: "TASK-3.7"
    phase: 3
    title: "Mobile-first collapse defaults"
    status: pending
    priority: P2
    assigned_to: ["ui-engineer-enhanced"]
    dependencies: ["TASK-3.6"]
    file: "apps/web/components/gifts/GiftFilters.tsx"

blockers: []

parallelization:
  # Phase 0: Sequential (must wire up components first)
  phase_0_batch_1: ["TASK-0.1", "TASK-0.2", "TASK-0.3", "TASK-0.4"]

  # Phase 1: Sequential (P0 critical path)
  phase_1_batch_1: ["TASK-1.1"]
  phase_1_batch_2: ["TASK-1.2"]
  phase_1_batch_3: ["TASK-1.3"]

  # Phase 2: Hooks parallel, then modal implementations, then integration
  phase_2_batch_1: ["TASK-2.1", "TASK-2.2", "TASK-2.3"]
  phase_2_batch_2: ["TASK-2.4", "TASK-2.5", "TASK-2.6"]
  phase_2_batch_3: ["TASK-2.7"]

  # Phase 3: Package install, then component, then integration
  phase_3_batch_1: ["TASK-3.1"]
  phase_3_batch_2: ["TASK-3.2"]
  phase_3_batch_3: ["TASK-3.3", "TASK-3.4"]
  phase_3_batch_4: ["TASK-3.5"]
  phase_3_batch_5: ["TASK-3.6", "TASK-3.7"]

notes:
  - "ROOT CAUSE DISCOVERED: Pages have inline rendering instead of using enhanced components"
  - "/people page doesn't use PersonCard or PersonDetailModal - has duplicate inline code"
  - "Phase 0 must complete first - this is why 'fixes' appear broken"
  - "Phase 1 must complete before Phase 2-3 - blocks /lists page"
  - "Phases 2-3 can run in parallel after Phase 0 and 1"
  - "Phase 4 (History tabs) is stretch goal - implement only if time permits"
---

# Bugs 12-02 Remediation Progress

## Orchestration Quick Reference

### Phase 0: Wire Up Existing Components (P0 - ROOT CAUSE)

**Batch 1** - Refactor /people page to use existing enhanced components:
```
Task("ui-engineer-enhanced", "TASK-0.1 through TASK-0.4: Refactor /people page to use PersonCard.

ROOT CAUSE: The /people page has inline card rendering that doesn't use the enhanced PersonCard component.

CURRENT STATE (broken):
- app/people/page.tsx lines 299-333: Inline div rendering with only avatar, name, group
- app/people/page.tsx lines 399-522: Uses basic Dialog instead of PersonDetailModal
- PersonCard component EXISTS at components/people/PersonCard.tsx with ALL features
- PersonDetailModal EXISTS with hero section fix, tabs, edit/delete

TASK 0.1 - Replace inline rendering:
File: apps/web/app/people/page.tsx

1. Add import: import { PersonCard } from '@/components/people/PersonCard';

2. Replace lines 299-333 (the inline div) with:
{filteredPeople.map((person: Person) => (
  <PersonCard key={person.id} person={person} />
))}

TASK 0.2 - Remove inline Dialog:
Delete lines 399-522 (the <Dialog> component). PersonCard already includes PersonDetailModal.

TASK 0.3 - Clean up state:
Remove these now-unused items:
- const [selectedRecipient, setSelectedRecipient] = useState<Person | null>(null);
- Remove import: Dialog, DialogContent, DialogHeader, DialogTitle (if not used elsewhere)

TASK 0.4 - Verify:
After changes, test that:
- Cards show age and birthday (e.g., '🎂 Jan 15 • 25 years')
- Cards show gift count (e.g., '🎁 3/15 gifts')
- Cards show attached lists with +N overflow
- Clicking card opens PersonDetailModal with proper hero section
- Modal has tabs (Overview, Linked Entities, History)
- Modal has Edit and Delete buttons

ACCEPTANCE CRITERIA:
- All #1 and #2 requirements from bugs-12-02.md now visible on /people page
- No duplicate modal code
- PersonCard component used consistently")
```

---

### Phase 1: Critical Bug Fix (P0)

**Batch 1** - Fix crash:
```
Task("ui-engineer", "TASK-1.1: Fix null reference crash in ListDetailModal.

FILE: apps/web/components/modals/ListDetailModal.tsx
LINE: 148

CURRENT CODE:
const totalValue = list?.items?.reduce((sum, item) => {
  return sum + (item.gift.price || 0);  // CRASHES when item.gift is undefined
}, 0);

FIX: Add optional chaining:
const totalValue = list?.items?.reduce((sum, item) => {
  return sum + (item.gift?.price || 0);  // Safe with optional chaining
}, 0);

ACCEPTANCE: /lists page loads without TypeError")
```

**Batch 2** - Audit other accesses:
```
Task("ui-engineer", "TASK-1.2: Audit all .gift property accesses in ListDetailModal.

FILE: apps/web/components/modals/ListDetailModal.tsx

Search for all instances of 'item.gift.' and ensure each has optional chaining.
Report all locations found and fix any unguarded accesses.

ACCEPTANCE: No runtime errors when list items have undefined gifts")
```

**Batch 3** - Add type guard:
```
Task("ui-engineer", "TASK-1.3: Add type guard helper for safe gift access.

FILE: apps/web/components/modals/ListDetailModal.tsx

Create helper function:
const hasGift = (item: ListItemWithGift): item is ListItemWithGift & { gift: GiftSummary } => {
  return item.gift !== undefined && item.gift !== null;
};

Use consistently throughout component for type-safe gift access.

ACCEPTANCE: Consistent null-safety pattern throughout file")
```

---

### Phase 2: Linked Entities Implementation (P1)

**Batch 1** - Create hooks (parallel):
```
Task("ui-engineer-enhanced", "TASK-2.1: Add useListsForPerson hook.

FILE: apps/web/hooks/useLists.ts

Add new hook:
export function useListsForPerson(personId: number | undefined) {
  return useQuery({
    queryKey: ['lists', 'person', personId],
    queryFn: () => api.lists.getAll({ person_id: personId }),
    enabled: !!personId,
  });
}

ACCEPTANCE: Hook returns lists filtered by person_id")

Task("ui-engineer-enhanced", "TASK-2.2: Add useListsForOccasion hook.

FILE: apps/web/hooks/useLists.ts

Add new hook:
export function useListsForOccasion(occasionId: number | undefined) {
  return useQuery({
    queryKey: ['lists', 'occasion', occasionId],
    queryFn: () => api.lists.getAll({ occasion_id: occasionId }),
    enabled: !!occasionId,
  });
}

ACCEPTANCE: Hook returns lists filtered by occasion_id")

Task("ui-engineer-enhanced", "TASK-2.3: Add useListsForGift hook.

FILE: apps/web/hooks/useLists.ts

Add hook that queries lists containing a specific gift.
May need to check existing list item queries or add new endpoint.

ACCEPTANCE: Hook returns all lists containing the specified gift")
```

**Batch 2** - Implement modal tabs (parallel):
```
Task("ui-engineer-enhanced", "TASK-2.4: Implement PersonDetailModal linked entities tab.

FILE: apps/web/components/modals/PersonDetailModal.tsx
LINES: 421-439 (replace placeholder)

1. Import useListsForPerson hook
2. Query lists for this person
3. Replace 'Coming soon' placeholder with:
   - List of attached lists as cards
   - Each shows name, type, item count
   - Click opens ListDetailModal
   - Empty state: 'No lists attached to this person'

ACCEPTANCE: Linked Entities tab shows actual lists for person")

Task("ui-engineer-enhanced", "TASK-2.5: Implement OccasionDetailModal linked entities tab.

FILE: apps/web/components/modals/OccasionDetailModal.tsx
LINES: 326-343 (replace placeholder)

Same pattern as PersonDetailModal but for occasion.

ACCEPTANCE: Linked Entities tab shows actual lists for occasion")

Task("ui-engineer-enhanced", "TASK-2.6: Implement GiftDetailModal linked entities tab.

FILE: apps/web/components/modals/GiftDetailModal.tsx

1. Use useListsForGift hook
2. Show all lists containing this gift
3. Include status badge showing item status in each list

ACCEPTANCE: Linked Entities tab shows lists containing this gift")
```

**Batch 3** - Integration:
```
Task("ui-engineer-enhanced", "TASK-2.7: Add list item click navigation.

Ensure clicking any list card in linked entities tabs opens ListDetailModal.
Use existing useEntityModal pattern.

ACCEPTANCE: Smooth navigation between entity modals via linked lists")
```

---

### Phase 3: Gift Filter UI Redesign (P2)

**Batch 1** - Install package:
```
Task("ui-engineer-enhanced", "TASK-3.1: Install Radix Collapsible.

Run: cd apps/web && pnpm add @radix-ui/react-collapsible

ACCEPTANCE: Package in package.json dependencies")
```

**Batch 2** - Create component:
```
Task("ui-engineer-enhanced", "TASK-3.2: Create Collapsible UI component.

FILE: apps/web/components/ui/collapsible.tsx (NEW)

Create styled wrapper around @radix-ui/react-collapsible.
Export: Collapsible, CollapsibleTrigger, CollapsibleContent

Follow existing UI component patterns (cn utility, forwardRef).
Add smooth height animation (300ms ease-out).

ACCEPTANCE: Component works with proper animations")
```

**Batch 3** - Update filter components (parallel):
```
Task("ui-engineer-enhanced", "TASK-3.3: Update FilterBar to be collapsible.

FILE: apps/web/components/ui/filter-bar.tsx

1. Wrap filter content in Collapsible
2. Add header toggle button with chevron icon
3. Show 'X filters active' summary when collapsed
4. Animate chevron rotation (rotate-180)

ACCEPTANCE: Entire filter bar can collapse/expand")

Task("ui-engineer-enhanced", "TASK-3.4: Update FilterGroup to be collapsible.

FILE: apps/web/components/ui/filter-bar.tsx

1. Wrap FilterGroup children in Collapsible
2. Make group label clickable toggle
3. Add chevron icon that rotates
4. 44px minimum touch target

ACCEPTANCE: Each filter group independently collapsible")
```

**Batch 4** - State management:
```
Task("ui-engineer-enhanced", "TASK-3.5: Add collapse state management.

FILE: apps/web/components/gifts/GiftFilters.tsx

Track which groups are expanded:
const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
  status: true,
  recipient: false,
  list: false,
  occasion: false
});

Pass to FilterGroup components.

ACCEPTANCE: Groups remember their expanded state during session")
```

**Batch 5** - Polish (parallel):
```
Task("ui-engineer-enhanced", "TASK-3.6: Add active filter summary.

FILE: apps/web/components/gifts/GiftFilters.tsx

When filter bar collapsed, show badge: 'X filters active'
Count selected filters across all groups.

ACCEPTANCE: Summary visible when collapsed")

Task("ui-engineer-enhanced", "TASK-3.7: Mobile-first collapse defaults.

FILE: apps/web/components/gifts/GiftFilters.tsx

Default collapsed on mobile (<768px).
Use window.matchMedia or CSS media queries.

ACCEPTANCE: Appropriate defaults per viewport")
```

---

## Quality Gates

### Phase 1 Complete
- [ ] `/lists` page loads without errors
- [ ] ListDetailModal opens for all lists
- [ ] No TypeScript errors
- [ ] Tested with lists that have items without gifts

### Phase 2 Complete
- [ ] PersonDetailModal shows linked lists
- [ ] OccasionDetailModal shows linked lists
- [ ] GiftDetailModal shows containing lists
- [ ] Empty states display correctly
- [ ] Modal navigation works

### Phase 3 Complete
- [ ] Filter bar collapses/expands smoothly
- [ ] Each group independently collapsible
- [ ] Active filter count visible when collapsed
- [ ] 44px touch targets on mobile
- [ ] Animations smooth (no jank)

---

## Status Log

| Date | Phase | Action | Notes |
|------|-------|--------|-------|
| 2025-12-02 | All | Created | Initial progress tracking file |
