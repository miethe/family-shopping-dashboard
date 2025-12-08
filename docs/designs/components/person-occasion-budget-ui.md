---
title: Person Budget per Occasion UI Specification
description: Complete UI design specification for PersonOccasionBudgetCard and PersonBudgetsTab components
audience: UI Designers, Frontend Developers
tags: [design, ui, components, budgets, person, occasion]
created: 2025-12-07
updated: 2025-12-07
version: 1.0
---

# Person Budget per Occasion — UI Specification

Complete design specification for budget management UI components following the "Soft Modernity" design system.

**Related Documentation:**
- [DESIGN-TOKENS.md](../DESIGN-TOKENS.md) — Color values, spacing, typography
- [COMPONENTS.md](../COMPONENTS.md) — Base component specifications
- [DESIGN-GUIDE.md](../DESIGN-GUIDE.md) — Design philosophy and principles

---

## Overview

This feature enables users to set and track budgets for gifts they give TO each person and gifts they buy BY each person, scoped per occasion.

### Components

1. **PersonOccasionBudgetCard** — Displayed in the People section of Occasion detail page
2. **PersonBudgetsTab** — Tab in Person modal showing budgets across all occasions

### User Flows

**Flow 1: Set Budget on Occasion Page**
```
View Occasion → People Section → PersonOccasionBudgetCard → Edit budget inputs → Auto-save
```

**Flow 2: View Budgets in Person Modal**
```
Click Person → Person Modal → Budgets Tab → PersonBudgetsTab → See all occasion budgets
```

---

## Component 1: PersonOccasionBudgetCard

### Context

Displayed in a responsive grid on `/occasions/{id}` page, one card per linked person. Shows both recipient and purchaser budget roles for that occasion.

### Layout Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ PersonOccasionBudgetCard                                │
├─────────────────────────────────────────────────────────┤
│ [Header Section]                                        │
│   • Avatar (48px) + Name + Relationship Badge           │
│   • Edit icon button (top right)                        │
├─────────────────────────────────────────────────────────┤
│ [Recipient Budget Section]                              │
│   • Label: "Budget for Gifts TO [Name]"                 │
│   • Currency Input (auto-save)                          │
│   • StackedProgressBar (if budget set)                  │
│   • Amounts summary                                     │
├─────────────────────────────────────────────────────────┤
│ [Purchaser Budget Section]                              │
│   • Label: "Budget for Gifts BY [Name]"                 │
│   • Currency Input (auto-save)                          │
│   • StackedProgressBar (if budget set)                  │
│   • Amounts summary                                     │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌──────────────────────────────────────────┐
│ ┌────┐ John Smith            [Edit ✎]   │
│ │ JS │ Relationship: Brother            │
│ └────┘                                   │
├──────────────────────────────────────────┤
│ Budget for Gifts TO John                 │
│ ┌──────────────────────────────────┐     │
│ │ $ 200.00             [✓ Saved]   │     │
│ └──────────────────────────────────┘     │
│ [████████████░░░░░░░░] 80%              │
│ $50 • $150 planned • $200 budget         │
├──────────────────────────────────────────┤
│ Budget for Gifts BY John                 │
│ ┌──────────────────────────────────┐     │
│ │ $ 50.00              [✓ Saved]   │     │
│ └──────────────────────────────────┘     │
│ [█████████████████████] 105% ⚠️         │
│ $30 • $52.50 planned • $50 budget        │
└──────────────────────────────────────────┘
```

### Specifications

#### Card Container

**Base Styles:**
```css
background: var(--color-surface-primary);        /* #FFFFFF */
border: 1px solid var(--color-border-subtle);    /* #E8E3DC */
border-radius: var(--radius-xlarge);             /* 20px */
box-shadow: var(--shadow-low);
padding: var(--spacing-5);                       /* 20px */
transition: all 200ms ease-out;
```

**Hover State:**
```css
box-shadow: var(--shadow-medium);
transform: translateY(-1px);
border-color: var(--color-border-medium);        /* #D4CDC4 */
```

**Responsive Sizing:**
- Mobile: `width: 100%` (single column)
- Tablet (≥768px): `width: calc(50% - 12px)` (2 columns, 24px gap)
- Desktop (≥1024px): `width: calc(33.333% - 16px)` (3 columns, 24px gap)

#### Header Section

**Avatar:**
```css
width: 48px;
height: 48px;
border: 2px solid white;
border-radius: 9999px;                           /* Full circle */
box-shadow: var(--shadow-low);
```

**Name:**
```css
font-size: 18px;                                 /* heading-3 */
font-weight: 600;                                /* Semibold */
color: var(--color-text-primary);                /* #2D2520 */
line-height: 26px;
```

**Relationship Badge:**
```css
display: inline-flex;
padding: 4px 10px;
background: var(--color-status-idea-100);        /* #FAF1DC */
border: 1px solid var(--color-status-idea-300);  /* #E8CC85 */
border-radius: var(--radius-small);              /* 8px */
font-size: 12px;                                 /* label-small */
font-weight: 600;
color: var(--color-status-idea-800);             /* #735A2B */
text-transform: uppercase;
letter-spacing: 0.05em;
```

**Edit Icon Button:**
```css
position: absolute;
top: 20px;
right: 20px;
width: 44px;                                     /* Touch target */
height: 44px;
border-radius: var(--radius-medium);             /* 12px */
background: transparent;
color: var(--color-text-tertiary);               /* #8A827C */
transition: all 150ms ease-out;

/* Hover */
&:hover {
  background: var(--color-surface-secondary);    /* #F5F2ED */
  color: var(--color-text-primary);
}

/* Icon size */
svg {
  width: 20px;
  height: 20px;
}
```

#### Budget Section (Recipient/Purchaser)

**Section Layout:**
```css
display: flex;
flex-direction: column;
gap: var(--spacing-3);                           /* 12px */
padding: var(--spacing-4) 0;                     /* 16px vertical */
border-top: 1px solid var(--color-border-subtle); /* Only on second section */
```

**Label:**
```css
font-size: 14px;                                 /* body-medium */
font-weight: 500;                                /* Medium */
color: var(--color-text-secondary);              /* #5C534D */
line-height: 20px;
```

**Currency Input:**
```css
width: 100%;
height: 48px;                                    /* Touch target */
padding: 12px 16px;
border: 2px solid var(--color-border-medium);    /* #D4CDC4 */
border-radius: var(--radius-medium);             /* 12px */
background: white;
font-size: 16px;                                 /* Prevent iOS zoom */
font-weight: 600;                                /* Semibold */
color: var(--color-text-primary);
transition: all 200ms ease-out;

/* Dollar sign prefix (pseudo-element) */
&::before {
  content: "$";
  color: var(--color-text-tertiary);
}

/* Focus state */
&:focus {
  border-color: var(--color-border-focus);       /* #E8846B coral */
  outline: 2px solid rgba(232, 132, 107, 0.2);   /* Ring */
  outline-offset: 2px;
}
```

**Currency Input States:**

*Default State:*
```css
border-color: var(--color-border-medium);
```

*Saving State:*
```css
border-color: var(--color-status-progress-400);  /* #A08DB4 lavender */
pointer-events: none;
opacity: 0.7;

/* Spinner icon */
.spinner {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  animation: spin 1s linear infinite;
}
```

*Saved State (1s flash):*
```css
border-color: var(--color-status-success-500);   /* #7BA676 sage */

/* Checkmark icon */
.checkmark {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 16px;
  height: 16px;
  color: var(--color-status-success-600);
  animation: scaleIn 200ms ease-out;
}
```

*Error State:*
```css
border-color: var(--color-status-warning-500);   /* #C97B63 terracotta */
outline: 2px solid rgba(201, 123, 99, 0.2);

/* Error message below */
.error-message {
  margin-top: 8px;
  font-size: 12px;
  color: var(--color-status-warning-700);
}
```

*Over-Budget State:*
```css
border-color: var(--color-status-warning-500);   /* #C97B63 */
outline: 2px solid rgba(201, 123, 99, 0.2);

/* Warning badge on progress bar */
.over-budget-badge {
  background: var(--color-status-warning-100);
  color: var(--color-status-warning-800);
  border: 1px solid var(--color-status-warning-300);
}
```

**Progress Bar Integration:**
```css
/* Uses existing StackedProgressBar component */
/* Only shown when budget is set (non-null) */

margin-top: var(--spacing-3);                    /* 12px */

/* If no budget: Show TotalsOnly component instead */
.totals-only {
  font-size: 14px;
  color: var(--color-text-secondary);

  .purchased { color: var(--color-status-success-600); }
  .planned { color: var(--color-status-idea-600); }
  .total { color: var(--color-text-primary); font-weight: 600; }
}
```

**Amounts Summary:**
```css
display: flex;
gap: var(--spacing-2);                           /* 8px */
flex-wrap: wrap;
font-size: 12px;                                 /* body-small */
color: var(--color-text-tertiary);

.amount {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.purchased { color: var(--color-status-success-600); }
.planned { color: var(--color-status-idea-600); }
.budget { color: var(--color-text-primary); font-weight: 600; }
.separator { color: var(--color-text-disabled); }
```

### State Matrix

| Condition | Budget Input | Progress Bar | Summary |
|-----------|-------------|--------------|---------|
| **No budget, no gifts** | Hidden | Hidden | Hidden |
| **No budget, has gifts** | Editable, empty | Hidden | TotalsOnly (purchased/planned) |
| **Has budget, no gifts** | Editable, shows value | Empty bar (0%) | "$0 • $0 of $[budget]" |
| **Has budget, has gifts** | Editable, shows value | Progress bar | Full amounts display |
| **Over budget** | Red border/ring | Red warning badge | Over 100% indicator |

### Animations

**Card Entrance:**
```css
@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Stagger each card by 100ms */
animation: slideInUp 300ms ease-out;
animation-delay: calc(var(--card-index) * 100ms);
```

**Save Feedback:**
```css
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}

.saving .input {
  animation: pulse 1s infinite;
}

.checkmark {
  animation: scaleIn 200ms ease-out, fadeOut 200ms ease-out 800ms;
}
```

**Hover Lift:**
```css
.card:hover {
  transform: translateY(-2px) scale(1.005);
  transition: all 200ms ease-out;
}
```

### Accessibility

**ARIA Attributes:**
```html
<div
  role="article"
  aria-label="Budget card for [Person Name]"
  class="person-occasion-budget-card"
>
  <input
    type="text"
    inputmode="decimal"
    aria-label="Budget for gifts to [Person Name]"
    aria-describedby="recipient-budget-description"
    aria-invalid={hasError}
  />

  <div
    role="status"
    aria-live="polite"
    aria-atomic="true"
    class="save-status"
  >
    {saveStatus === 'saving' && 'Saving...'}
    {saveStatus === 'saved' && 'Saved'}
    {saveStatus === 'error' && error.message}
  </div>
</div>
```

**Keyboard Navigation:**
- Tab order: Avatar → Edit button → Recipient input → Purchaser input → Next card
- Enter on edit button: Focus first input
- Escape while editing: Blur input, restore previous value
- Auto-save on blur (500ms debounce)

**Screen Reader:**
- Announce budget changes: "Budget updated to $200"
- Announce over-budget: "Warning: Over budget by $5.50"
- Announce save status: "Saving...", "Saved", "Error saving budget"

### Responsive Breakpoints

**Mobile (<768px):**
```css
.person-occasion-budget-card {
  width: 100%;
  margin-bottom: 16px;
}
```

**Tablet (768px - 1023px):**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
```

**Desktop (≥1024px):**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}
```

**Large Desktop (≥1280px):**
```css
.grid {
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
}
```

---

## Component 2: PersonBudgetsTab

### Context

Tab content in PersonDetailModal showing all occasions for this person with budget inputs for each occasion.

### Layout Hierarchy

```
┌─────────────────────────────────────────────────────────┐
│ PersonBudgetsTab                                        │
├─────────────────────────────────────────────────────────┤
│ [Filter Toggle]                                         │
│   • Active Occasions ○━━━━━● All Occasions             │
├─────────────────────────────────────────────────────────┤
│ [Occasion Rows]                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │ Christmas 2024              12/25/2024          │   │
│   │ ───────────────────────────────────────────     │   │
│   │ Gifts TO John   $ [200.00]  ✓  80%             │   │
│   │ Gifts BY John   $ [50.00]   🔴 105%            │   │
│   └─────────────────────────────────────────────────┘   │
│   ┌─────────────────────────────────────────────────┐   │
│   │ Birthday - Mom              01/15/2025          │   │
│   │ ───────────────────────────────────────────     │   │
│   │ Gifts TO John   $ [_____]   — No budget        │   │
│   │ Gifts BY John   $ [_____]   — No budget        │   │
│   └─────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────┤
│ [Past Occasions Accordion]                              │
│   ▶ Past Occasions (3)                                  │
└─────────────────────────────────────────────────────────┘
```

### Mobile Layout (375px)

```
┌──────────────────────────────────────────┐
│ Active ○━━━━━━━━━━━━━━━● All           │
├──────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐ │
│ │ Christmas 2024        12/25/2024     │ │
│ │ ────────────────────────────────     │ │
│ │                                      │ │
│ │ Gifts TO John                        │ │
│ │ $ 200.00             [80% ✓]        │ │
│ │                                      │ │
│ │ Gifts BY John                        │ │
│ │ $ 50.00              [105% 🔴]      │ │
│ └──────────────────────────────────────┘ │
│                                          │
│ ┌──────────────────────────────────────┐ │
│ │ Birthday - Mom        01/15/2025     │ │
│ │ ────────────────────────────────     │ │
│ │                                      │ │
│ │ Gifts TO John                        │ │
│ │ $ [_____]            [No budget]    │ │
│ │                                      │ │
│ │ Gifts BY John                        │ │
│ │ $ [_____]            [No budget]    │ │
│ └──────────────────────────────────────┘ │
├──────────────────────────────────────────┤
│ ▶ Past Occasions (3)                    │
└──────────────────────────────────────────┘
```

### Specifications

#### Tab Container

```css
display: flex;
flex-direction: column;
gap: var(--spacing-4);                           /* 16px */
padding: var(--spacing-6);                       /* 24px */
max-height: 600px;                               /* Modal constraint */
overflow-y: auto;
```

#### Filter Toggle

**iOS-Style Switch:**
```css
.filter-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4);
  background: var(--color-surface-secondary);    /* #F5F2ED */
  border-radius: var(--radius-large);            /* 16px */
  margin-bottom: var(--spacing-4);
}

.toggle-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.switch {
  position: relative;
  width: 56px;
  height: 32px;
  background: var(--color-border-medium);
  border-radius: 16px;
  transition: background 200ms ease-out;

  /* Active state */
  &.active {
    background: var(--color-primary-500);        /* #E8846B coral */
  }
}

.switch-handle {
  position: absolute;
  width: 28px;
  height: 28px;
  background: white;
  border-radius: 50%;
  top: 2px;
  left: 2px;
  transition: transform 200ms ease-out;
  box-shadow: var(--shadow-low);

  /* Active state */
  &.active {
    transform: translateX(24px);
  }
}
```

#### Occasion Row

**Container:**
```css
.occasion-row {
  background: white;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-large);            /* 16px */
  padding: var(--spacing-4);                     /* 16px */
  box-shadow: var(--shadow-subtle);
  transition: all 200ms ease-out;
}

/* Past occasion (muted) */
.occasion-row.past {
  opacity: 0.6;
  background: var(--color-surface-secondary);
}

/* Hover state */
.occasion-row:hover {
  box-shadow: var(--shadow-low);
  border-color: var(--color-border-medium);
}
```

**Occasion Header:**
```css
.occasion-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-3);               /* 12px */
  padding-bottom: var(--spacing-3);
  border-bottom: 1px solid var(--color-border-subtle);
}

.occasion-name {
  font-size: 16px;                               /* body-large */
  font-weight: 700;                              /* Bold */
  color: var(--color-text-primary);
}

.occasion-date {
  font-size: 14px;                               /* body-medium */
  font-weight: 500;
  color: var(--color-text-tertiary);
}
```

**Budget Row (Recipient/Purchaser):**
```css
.budget-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: var(--spacing-3);                         /* 12px */
  align-items: center;
  margin-bottom: var(--spacing-3);
}

/* Mobile stacking */
@media (max-width: 480px) {
  .budget-row {
    grid-template-columns: 1fr;
    gap: var(--spacing-2);
  }
}

.budget-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}

.budget-input-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);                         /* 8px */
}
```

**Compact Budget Input:**
```css
.budget-input-compact {
  width: 120px;
  height: 40px;
  padding: 8px 12px;
  border: 2px solid var(--color-border-medium);
  border-radius: var(--radius-medium);           /* 12px */
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-primary);
  transition: all 200ms ease-out;
}

/* Focus */
.budget-input-compact:focus {
  border-color: var(--color-border-focus);
  outline: 2px solid rgba(232, 132, 107, 0.2);
  outline-offset: 2px;
}

/* Empty state */
.budget-input-compact:placeholder-shown {
  color: var(--color-text-disabled);
}
```

**Progress Indicator Badge:**
```css
.progress-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border-radius: var(--radius-small);            /* 8px */
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}

/* Within budget (0-80%) */
.progress-indicator.within {
  background: var(--color-status-success-100);   /* #E4EDE2 */
  color: var(--color-status-success-800);        /* #3D543B */
  border: 1px solid var(--color-status-success-300);
}

/* Approaching (80-100%) */
.progress-indicator.approaching {
  background: var(--color-status-idea-100);      /* #FAF1DC */
  color: var(--color-status-idea-800);           /* #735A2B */
  border: 1px solid var(--color-status-idea-300);
}

/* Over budget (>100%) */
.progress-indicator.over {
  background: var(--color-status-warning-100);   /* #FCE9E5 */
  color: var(--color-status-warning-800);        /* #6D3C31 */
  border: 1px solid var(--color-status-warning-300);
}

/* No budget */
.progress-indicator.none {
  background: var(--color-surface-tertiary);     /* #EBE7E0 */
  color: var(--color-text-tertiary);             /* #8A827C */
  border: 1px solid var(--color-border-subtle);
}
```

**Icons in Progress Badges:**
```css
.progress-indicator svg {
  width: 14px;
  height: 14px;
}

/* Checkmark (within budget) */
.progress-indicator.within svg {
  color: var(--color-status-success-600);
}

/* Warning (over budget) */
.progress-indicator.over svg {
  color: var(--color-status-warning-600);
}
```

#### Past Occasions Accordion

```css
.past-occasions-accordion {
  border-top: 1px solid var(--color-border-subtle);
  padding-top: var(--spacing-4);
  margin-top: var(--spacing-4);
}

.accordion-trigger {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  background: transparent;
  border: none;
  border-radius: var(--radius-medium);
  cursor: pointer;
  transition: background 150ms ease-out;
}

.accordion-trigger:hover {
  background: var(--color-surface-secondary);
}

.accordion-icon {
  width: 20px;
  height: 20px;
  color: var(--color-text-tertiary);
  transition: transform 200ms ease-out;

  /* Expanded state */
  &.expanded {
    transform: rotate(90deg);
  }
}

.accordion-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
}

.accordion-content {
  display: none;
  flex-direction: column;
  gap: var(--spacing-3);
  padding-top: var(--spacing-3);

  /* Expanded state */
  &.expanded {
    display: flex;
    animation: slideDown 300ms ease-out;
  }
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

#### Empty State

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);                    /* 48px */
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-4);
  opacity: 0.3;
  color: var(--color-text-tertiary);
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.empty-state-description {
  font-size: 14px;
  color: var(--color-text-tertiary);
  max-width: 320px;
}
```

### State Matrix

| Filter | Occasion Status | Display Behavior |
|--------|----------------|------------------|
| **Active** | Current/Future | Show in main list |
| **Active** | Past | Collapse in accordion |
| **All** | Any | Show all in main list |

| Budget State | Input | Progress Badge |
|-------------|-------|----------------|
| **Null** | Empty placeholder | "No budget" (grey) |
| **0-80%** | Shows value | "[%] ✓" (sage green) |
| **80-100%** | Shows value | "[%] ⚠" (mustard) |
| **>100%** | Shows value + red border | "[%] 🔴" (terracotta) |

### Animations

**Tab Entrance:**
```css
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.tab-content {
  animation: fadeIn 200ms ease-out;
}
```

**Occasion Row Stagger:**
```css
.occasion-row {
  animation: slideInRight 300ms ease-out;
  animation-delay: calc(var(--row-index) * 50ms);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

**Filter Toggle:**
```css
.switch-handle {
  transition: transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1); /* Spring */
}
```

### Accessibility

**ARIA Attributes:**
```html
<div role="tabpanel" aria-labelledby="budgets-tab">
  <div
    role="switch"
    aria-checked={showAll}
    aria-label="Toggle between active and all occasions"
  >
    <span class="switch-label">Active Occasions</span>
    <button
      class="switch"
      onClick={toggleFilter}
    />
  </div>

  <div
    role="region"
    aria-label="Occasion budgets"
  >
    {occasions.map(occasion => (
      <div
        role="group"
        aria-label={`${occasion.name} budgets`}
      >
        <input
          aria-label={`Budget for gifts to ${personName} for ${occasionName}`}
          aria-describedby={`progress-${occasion.id}-recipient`}
        />
        <div
          id={`progress-${occasion.id}-recipient`}
          role="status"
          aria-live="polite"
        >
          {progressText}
        </div>
      </div>
    ))}
  </div>

  <details>
    <summary
      aria-label="Past occasions (3)"
      aria-expanded={isExpanded}
    >
      Past Occasions (3)
    </summary>
    {/* Past occasion rows */}
  </details>
</div>
```

**Keyboard Navigation:**
- Tab order: Filter toggle → Active occasion inputs (top to bottom) → Accordion trigger → Past inputs
- Space/Enter on accordion: Toggle expand/collapse
- Arrow keys in input group: Navigate between TO/BY inputs
- Escape while editing: Blur, restore value

**Screen Reader:**
- Announce filter change: "Showing all occasions" / "Showing active occasions"
- Announce progress: "80% of budget used, within budget"
- Announce over-budget: "105% of budget used, over budget by $5.50"

---

## Component 3: Occasion Detail Page Integration

### People Section Layout

**Section Structure:**
```
┌─────────────────────────────────────────────────────────┐
│ /occasions/{id}                                         │
├─────────────────────────────────────────────────────────┤
│ [Occasion Header]                                       │
│   • Name, Date, Status                                  │
├─────────────────────────────────────────────────────────┤
│ [Budget Meter - Existing]                               │
│   • Overall occasion budget overview                    │
├─────────────────────────────────────────────────────────┤
│ People (4)                            [+ Add Person]    │
│ ───────────────────────────────────────────────────────│
│ [PersonOccasionBudgetCard Grid]                         │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐       │
│   │    Mom     │  │    Dad     │  │  Sister    │       │
│   └────────────┘  └────────────┘  └────────────┘       │
│   ┌────────────┐                                        │
│   │  Brother   │                                        │
│   └────────────┘                                        │
├─────────────────────────────────────────────────────────┤
│ [Gifts Section - Existing]                              │
└─────────────────────────────────────────────────────────┘
```

### Specifications

**Section Header:**
```css
.people-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-6);               /* 24px */
  padding-bottom: var(--spacing-4);
  border-bottom: 2px solid var(--color-border-subtle);
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);                         /* 8px */
  font-size: 24px;                               /* heading-1 */
  font-weight: 700;
  color: var(--color-text-primary);
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0 8px;
  background: var(--color-primary-100);          /* #FDE5E0 */
  color: var(--color-primary-700);               /* #B95440 */
  border-radius: 14px;                           /* Pill */
  font-size: 14px;
  font-weight: 600;
}
```

**Add Person Button:**
```css
.add-person-button {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-2);
  height: 44px;
  padding: 12px 20px;
  background: var(--color-primary-500);          /* #E8846B coral */
  color: white;
  border: none;
  border-radius: var(--radius-medium);           /* 12px */
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 200ms ease-out;
  box-shadow: var(--shadow-low);
}

.add-person-button:hover {
  background: var(--color-primary-600);          /* #D66A51 */
  box-shadow: var(--shadow-medium);
  transform: translateY(-1px);
}

.add-person-button:active {
  transform: translateY(0);
  box-shadow: var(--shadow-subtle);
}

.add-person-button svg {
  width: 20px;
  height: 20px;
}
```

**Card Grid:**
```css
.people-cards-grid {
  display: grid;
  gap: var(--spacing-6);                         /* 24px */
  margin-bottom: var(--spacing-12);              /* 48px - Section spacing */
}

/* Responsive columns */
@media (min-width: 768px) {
  .people-cards-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .people-cards-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1440px) {
  .people-cards-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
```

**Empty State:**
```css
.people-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-12);
  background: var(--color-surface-secondary);
  border: 2px dashed var(--color-border-medium);
  border-radius: var(--radius-xlarge);           /* 20px */
  text-align: center;
}

.people-empty-icon {
  width: 64px;
  height: 64px;
  margin-bottom: var(--spacing-4);
  color: var(--color-text-tertiary);
  opacity: 0.5;
}

.people-empty-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-2);
}

.people-empty-description {
  font-size: 14px;
  color: var(--color-text-tertiary);
  margin-bottom: var(--spacing-4);
}
```

---

## Design Tokens Reference

### Colors Used

```css
/* Backgrounds */
--color-bg-base: #FAF8F5;
--color-surface-primary: #FFFFFF;
--color-surface-secondary: #F5F2ED;
--color-surface-tertiary: #EBE7E0;

/* Text */
--color-text-primary: #2D2520;
--color-text-secondary: #5C534D;
--color-text-tertiary: #8A827C;
--color-text-disabled: #C4BDB7;

/* Primary Accent (Coral) */
--color-primary-100: #FDE5E0;
--color-primary-500: #E8846B;
--color-primary-600: #D66A51;
--color-primary-700: #B95440;

/* Status: Success (Sage) */
--color-status-success-100: #E4EDE2;
--color-status-success-300: #C5D8C1;
--color-status-success-500: #7BA676;
--color-status-success-600: #668B61;
--color-status-success-800: #3D543B;

/* Status: Idea (Mustard) */
--color-status-idea-100: #FAF1DC;
--color-status-idea-300: #E8CC85;
--color-status-idea-500: #D4A853;
--color-status-idea-600: #B88F45;
--color-status-idea-800: #735A2B;

/* Status: Warning (Terracotta) */
--color-status-warning-100: #FCE9E5;
--color-status-warning-300: #F6CEC5;
--color-status-warning-500: #C97B63;
--color-status-warning-600: #AC6350;
--color-status-warning-800: #6D3C31;

/* Status: Progress (Lavender) */
--color-status-progress-400: #A08DB4;

/* Borders */
--color-border-subtle: #E8E3DC;
--color-border-medium: #D4CDC4;
--color-border-focus: #E8846B;

/* Shadows */
--shadow-subtle: 0 1px 2px rgba(45, 37, 32, 0.04), 0 0 0 1px rgba(45, 37, 32, 0.02);
--shadow-low: 0 2px 8px rgba(45, 37, 32, 0.06), 0 0 0 1px rgba(45, 37, 32, 0.03);
--shadow-medium: 0 4px 16px rgba(45, 37, 32, 0.08), 0 1px 4px rgba(45, 37, 32, 0.04);
```

### Spacing Scale

```css
--spacing-2: 8px;
--spacing-3: 12px;
--spacing-4: 16px;
--spacing-5: 20px;
--spacing-6: 24px;
--spacing-8: 32px;
--spacing-12: 48px;
```

### Border Radius

```css
--radius-small: 8px;
--radius-medium: 12px;
--radius-large: 16px;
--radius-xlarge: 20px;
--radius-2xlarge: 24px;
--radius-full: 9999px;
```

### Typography

```css
/* Sizes */
--font-size-heading-1: 24px;
--font-size-heading-3: 18px;
--font-size-body-large: 16px;
--font-size-body-medium: 14px;
--font-size-body-small: 12px;

/* Weights */
--font-weight-regular: 400;
--font-weight-medium: 500;
--font-weight-semibold: 600;
--font-weight-bold: 700;
```

---

## Tailwind Class Reference

### Recommended Tailwind Classes

**PersonOccasionBudgetCard:**
```tsx
<div className="
  bg-white
  border border-warm-200
  rounded-xlarge
  shadow-low
  p-5
  transition-all duration-200 ease-out
  hover:shadow-medium hover:-translate-y-0.5 hover:border-warm-300
">
  {/* Avatar */}
  <div className="
    w-12 h-12
    border-2 border-white
    rounded-full
    shadow-low
  "/>

  {/* Name */}
  <h3 className="
    text-lg font-semibold
    text-warm-900
    leading-relaxed
  "/>

  {/* Relationship Badge */}
  <span className="
    inline-flex
    px-2.5 py-1
    bg-mustard-100
    border border-mustard-300
    rounded-small
    text-xs font-semibold
    text-mustard-800
    uppercase tracking-wide
  "/>

  {/* Currency Input */}
  <input className="
    w-full h-12
    px-4 py-3
    border-2 border-warm-300
    rounded-medium
    text-base font-semibold
    text-warm-900
    transition-all duration-200
    focus:border-coral-500
    focus:ring-2 focus:ring-coral-200
    focus:ring-offset-2
  "/>

  {/* Over-budget state */}
  <input className="
    border-terracotta-500
    ring-2 ring-terracotta-200
  "/>
</div>
```

**PersonBudgetsTab:**
```tsx
<div className="
  flex flex-col
  gap-4
  p-6
  max-h-[600px]
  overflow-y-auto
">
  {/* Filter Toggle */}
  <div className="
    flex items-center justify-between
    p-4
    bg-warm-100
    rounded-large
  ">
    <span className="text-sm font-semibold text-warm-700">
      Active Occasions
    </span>
    <button className="
      relative
      w-14 h-8
      bg-warm-300
      rounded-full
      transition-colors duration-200
      data-[active]:bg-coral-500
    ">
      <div className="
        absolute
        w-7 h-7
        bg-white
        rounded-full
        top-0.5 left-0.5
        shadow-low
        transition-transform duration-200
        data-[active]:translate-x-6
      "/>
    </button>
  </div>

  {/* Occasion Row */}
  <div className="
    bg-white
    border border-warm-200
    rounded-large
    p-4
    shadow-subtle
    transition-all duration-200
    hover:shadow-low hover:border-warm-300
  ">
    {/* Occasion Header */}
    <div className="
      flex justify-between items-center
      mb-3 pb-3
      border-b border-warm-200
    ">
      <h4 className="text-base font-bold text-warm-900">
        Christmas 2024
      </h4>
      <span className="text-sm font-medium text-warm-600">
        12/25/2024
      </span>
    </div>

    {/* Budget Row */}
    <div className="grid grid-cols-[1fr_auto] gap-3 items-center mb-3">
      <span className="text-sm font-medium text-warm-700">
        Gifts TO John
      </span>

      <div className="flex items-center gap-2">
        <input className="
          w-30 h-10
          px-3 py-2
          border-2 border-warm-300
          rounded-medium
          text-sm font-semibold
          text-warm-900
          focus:border-coral-500
          focus:ring-2 focus:ring-coral-200
        "/>

        {/* Progress Badge */}
        <span className="
          inline-flex items-center gap-1
          px-2.5 py-1.5
          bg-sage-100
          border border-sage-300
          rounded-small
          text-xs font-semibold
          text-sage-800
          whitespace-nowrap
        ">
          80% ✓
        </span>
      </div>
    </div>
  </div>

  {/* Empty State */}
  <div className="
    flex flex-col items-center justify-center
    p-12
    text-center
  ">
    <svg className="w-16 h-16 mb-4 opacity-30 text-warm-600"/>
    <h3 className="text-lg font-semibold text-warm-900 mb-2">
      No budgets set for any occasion
    </h3>
    <p className="text-sm text-warm-600 max-w-xs">
      Link this person to occasions to start tracking budgets.
    </p>
  </div>
</div>
```

---

## Implementation Checklist

### PersonOccasionBudgetCard

- [ ] Card container with hover lift effect
- [ ] Avatar with white border and shadow
- [ ] Name and relationship badge header
- [ ] Edit icon button (top right, 44px touch target)
- [ ] Recipient budget section with label
- [ ] Currency input with auto-save (500ms debounce)
- [ ] StackedProgressBar integration (recipient role)
- [ ] Purchaser budget section with label
- [ ] Currency input with auto-save
- [ ] StackedProgressBar integration (purchaser role)
- [ ] Loading state (saving spinner)
- [ ] Saved state (checkmark flash)
- [ ] Error state (red border + message)
- [ ] Over-budget state (red border + warning badge)
- [ ] Empty state handling (no budget, no gifts)
- [ ] TotalsOnly component (no budget, has gifts)
- [ ] Responsive grid layout (1/2/3/4 columns)
- [ ] Card entrance animation (staggered)
- [ ] Keyboard navigation support
- [ ] Screen reader announcements
- [ ] ARIA labels and roles

### PersonBudgetsTab

- [ ] Tab container with scroll
- [ ] iOS-style filter toggle switch
- [ ] Active/All filter logic
- [ ] Occasion row container
- [ ] Occasion header (name + date)
- [ ] Recipient budget row
- [ ] Purchaser budget row
- [ ] Compact currency inputs
- [ ] Progress indicator badges (within/approaching/over/none)
- [ ] Badge color logic (0-80% sage, 80-100% mustard, >100% terracotta)
- [ ] Icons in badges (checkmark, warning)
- [ ] Past occasions accordion
- [ ] Accordion expand/collapse animation
- [ ] Empty state component
- [ ] Row entrance animation (staggered)
- [ ] Filter toggle animation (spring easing)
- [ ] Keyboard navigation support
- [ ] Screen reader support
- [ ] ARIA expanded/collapsed states

### Occasion Page Integration

- [ ] People section header with count badge
- [ ] Add Person button (coral, 44px height)
- [ ] Card grid responsive layout
- [ ] Empty state (no people linked)
- [ ] Section spacing (48px below)
- [ ] Integration with existing Budget Meter
- [ ] Integration with existing Gifts section

### Data Integration

- [ ] Connect to PersonBudget API endpoints
- [ ] Auto-save on input blur (500ms debounce)
- [ ] Optimistic updates with rollback
- [ ] Error handling and user feedback
- [ ] Loading states during save
- [ ] React Query cache invalidation
- [ ] Real-time updates (if WebSocket enabled)

---

## Accessibility Requirements

### WCAG 2.1 AA Compliance

**Color Contrast:**
- Text on white: ≥4.5:1 (all text meets this)
- Badges: ≥3:1 (all status badges meet this)
- Focus rings: Visible 2px coral ring with 2px offset

**Keyboard Navigation:**
- All inputs reachable via Tab
- Logical tab order (top to bottom, left to right)
- Escape to cancel editing
- Enter to save (optional, auto-save on blur)
- Arrow keys to navigate between budget inputs

**Screen Reader Support:**
- Semantic HTML (article, section, input)
- ARIA labels on all inputs
- ARIA live regions for save status
- ARIA describedby for error messages
- Status announcements (saving, saved, error)

**Focus Management:**
- Clear focus indicators (coral ring)
- Focus never lost during state changes
- Modal focus trap (when modal open)
- First input focused on edit click

**Reduced Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Testing Scenarios

### Visual Testing

1. **Card states**: Default, hover, saving, saved, error, over-budget
2. **Empty states**: No budget, no gifts, no people
3. **Responsive layouts**: 375px, 768px, 1024px, 1440px
4. **Dark mode** (if implemented): All colors adapted
5. **Long names**: Truncation and wrapping behavior
6. **Large numbers**: $10,000+ formatting
7. **Zero amounts**: $0.00 display

### Interaction Testing

1. **Auto-save**: 500ms debounce, success feedback
2. **Validation**: Negative numbers, non-numeric input
3. **Over-budget**: Warning display when >100%
4. **Progress bar**: Accurate percentage calculation
5. **Filter toggle**: Smooth animation, correct filtering
6. **Accordion**: Expand/collapse, content visibility
7. **Tab navigation**: Logical order, no skipped elements

### Accessibility Testing

1. **Screen reader**: Proper announcements, labels
2. **Keyboard only**: All functions accessible
3. **High contrast**: Text remains readable
4. **Zoom 200%**: Layout doesn't break
5. **Focus visible**: All interactive elements
6. **Error handling**: Clear, accessible messages

### Performance Testing

1. **Render time**: <100ms for 10 cards
2. **Animation smoothness**: 60fps throughout
3. **Auto-save debounce**: No duplicate requests
4. **Scroll performance**: Smooth with 20+ occasions
5. **Memory leaks**: No retention after unmount

---

## Version History

**v1.0** (2025-12-07)
- Initial specification
- PersonOccasionBudgetCard complete specs
- PersonBudgetsTab complete specs
- Occasion page integration
- Accessibility requirements
- Tailwind class reference

---

**Maintained By:** Family Gifting Dashboard Design Team
**Questions?** Refer to [COMPONENTS.md](../COMPONENTS.md) or [DESIGN-GUIDE.md](../DESIGN-GUIDE.md)
