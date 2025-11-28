# Data-testid Attributes Checklist

This checklist shows which `data-testid` attributes need to be added to components for E2E test reliability.

## Priority: HIGH (Critical for tests to work)

### QuickAddModal.tsx
- [ ] `data-testid="quick-add-modal"` on dialog root
- [ ] `data-testid="gift-name-input"` on name input
- [ ] `data-testid="submit-button"` on submit button

### ListItemRow.tsx
- [ ] `data-testid="list-item"` on row container
- [ ] `data-testid="status-button"` on status dropdown/button
- [ ] `data-status={item.status}` on row container

### ListCard.tsx
- [ ] `data-testid="list-card"` on card container
- [ ] `data-testid="list-name"` on name element

### GiftCard.tsx
- [ ] `data-testid="gift-card"` on card container
- [ ] `data-status={gift.status}` on card container

## Priority: MEDIUM (Important for test stability)

### PipelineSummary.tsx
- [ ] `data-testid="pipeline-summary"` on container
- [ ] `data-testid="ideas-count"` on ideas stat card
- [ ] `data-testid="purchased-count"` on purchased stat card
- [ ] `data-testid="my-assignments-count"` on assignments stat card

### PrimaryOccasion.tsx
- [ ] `data-testid="primary-occasion"` on container
- [ ] `data-testid="occasion-name"` on name element

### ConnectionIndicator.tsx
- [ ] `data-testid="ws-connection-indicator"` on indicator
- [ ] `data-connection-state={state}` with values: "connected", "connecting", "disconnected"

### ListDetail.tsx
- [ ] `data-testid="list-detail"` on container
- [ ] `data-testid="list-name"` on name element

## Priority: LOW (Nice to have)

### OccasionCard.tsx
- [ ] `data-testid="occasion-card"` on card container
- [ ] `data-testid="occasion-name"` on name element

### OccasionDetail.tsx
- [ ] `data-testid="occasion-detail"` on container
- [ ] `data-testid="occasion-lists"` on lists section

### PersonCard.tsx
- [ ] `data-testid="person-card"` on card container
- [ ] `data-testid="person-name"` on name element

### PersonDetail.tsx
- [ ] `data-testid="person-detail"` on container
- [ ] `data-testid="person-lists"` on lists section

### PeopleNeeding.tsx
- [ ] `data-testid="people-needing"` on container

### GiftDetail.tsx
- [ ] `data-testid="gift-detail"` on container
- [ ] `data-testid="gift-status"` on status badge

### PipelineView.tsx
- [ ] `data-testid="pipeline-view"` on container
- [ ] `data-testid="idea-section"` on ideas column
- [ ] `data-testid="selected-section"` on selected column
- [ ] `data-testid="purchased-section"` on purchased column
- [ ] `data-testid="received-section"` on received column

### AssignmentList.tsx
- [ ] `data-testid="assignments-list"` on container
- [ ] `data-testid="assignment-card"` on each card
- [ ] `data-testid="assignment-person"` on person name
- [ ] `data-testid="assignment-status"` on status element

## Additional Attributes

### ListItemRow.tsx (Status Actions)
- [ ] `data-testid="move-to-selected"` on "Select" button
- [ ] `data-testid="move-to-idea"` on "Move to Idea" button
- [ ] `data-testid="delete-item"` on delete button
- [ ] `data-item-id={item.id}` on row container

### Form Inputs
- [ ] `data-testid="gift-description-input"` on QuickAddModal description
- [ ] `data-testid="gift-price-input"` on QuickAddModal price

### Button Actions
- [ ] `data-testid="create-occasion-button"` on occasions page
- [ ] `data-testid="create-person-button"` on people page
- [ ] `data-testid="create-list-button"` on lists page

### Progress Indicators
- [ ] `data-testid="list-progress"` on list progress bar
- [ ] `data-progress-value={current}` on progress element
- [ ] `data-progress-max={total}` on progress element
- [ ] `role="progressbar"` (ARIA standard)
- [ ] `aria-valuenow={current}` (ARIA standard)
- [ ] `aria-valuemax={total}` (ARIA standard)

## Implementation Example

```tsx
// Before
export function ListItemRow({ item }: ListItemRowProps) {
  return (
    <div className="flex items-center p-4">
      <span>{item.name}</span>
      <span>{item.status}</span>
    </div>
  );
}

// After
export function ListItemRow({ item }: ListItemRowProps) {
  return (
    <div
      className="flex items-center p-4"
      data-testid="list-item"
      data-item-id={item.id}
      data-status={item.status}
    >
      <span data-testid="list-item-name">{item.name}</span>
      <button
        data-testid="status-button"
        onClick={handleStatusChange}
      >
        {item.status}
      </button>
    </div>
  );
}
```

## Benefits

1. **Test Reliability**: Tests won't break when copy changes
2. **Maintainability**: Easier to update tests when UI changes
3. **Debugging**: Clear intent of what element tests are targeting
4. **Documentation**: Self-documenting component structure
5. **Accessibility**: Often pairs well with ARIA attributes

## Notes

- Use kebab-case for data-testid values
- Keep names semantic and descriptive
- Prefix with component/section name for clarity
- Avoid dynamic values in data-testid (use data-* for dynamic data)
- These attributes are removed in production builds (no performance impact)

## Next Steps

1. Add HIGH priority attributes first (critical path components)
2. Run tests to verify they pass with new attributes
3. Add MEDIUM priority attributes for stability
4. Add LOW priority attributes as time permits
5. Update this checklist as attributes are added
