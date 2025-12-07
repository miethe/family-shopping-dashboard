# Identified Enhancements and Unexpected Behaviors

## Listed Items

1. When marking a Gift as Select or Purchased from any view, a field should appear allowing the user to assign a Person to who is giving the Gift. This should be a dropdown of existing People, with an option to add a New Person inline.
   - This Person assignment should be saved to the Gift entity as a new field: Assigned to (Person ID) - UI changing to "Purchased by" once marked purchased, but as the same backend field.
   - This field should be visible on the Gift modal's Overview tab, as well as in the Gift list views as a column option.
   - This assignment should display on /assignments page.
2. Every Person should have 2 budgets per occasion: Gifts Assigned (total value of Gifts assigned to give) and Gifts to Purchase (total value of Gifts marked as selected/purchased). These should be displayed on the Person modal and Person Card on /people page.
    - These should work similar to occasion budgets, with a target budget amount settable per Person, and 2 progress bars showing total assigned to give vs target, and total selected/purchased vs target.
    - Purchaser budgets and bars should only show if the person has any selected/purchased assignments. Same for assigned to give.
3. When viewing /gifts page, there should be a "Select" option which allows selecting multiple Gifts via checkboxes on the left side of each Gift Card/Row.
   - When one or more Gifts are selected, a bulk action bar should appear at the top of the page allowing the following actions:
     - Mark as Purchased
     - Assign Recipient (opens dialog to select Person to assign to all selected Gifts)
     - Assign Purchaser (opens dialog to select Person to assign as purchaser to all selected Gifts)
     - Delete
   - The bulk action bar should show the number of selected Gifts and have a "Clear Selection" button.
4. When creating a Gift, there should be an option to Assign Recipient (Person) and Assign Purchaser (Person) inline during the creation flow.
   - These fields should be multi-select dropdowns allowing selection of existing People, with an option to add New Person inline.
   - These fields should default to empty if no selection is made.
   - If multiple recipients are selected, there should be a dialog that opens asking the user if they want to create separate Gift entries for each recipient, or a single Gift entry with multiple recipients. It should ask "Separate or Shared" with options "Separate Gifts (doubles quantity)" and "Shared Gift". If multiple, then the quantity should be updated accordingly.
5. When viewing a Person modal, on the Linked Entities tab, there should be a section for Gifts where Gifts linked to that Person as Recipient or Purchaser are displayed.
   - There should be an "Add Gift" button which opens the Gift creation flow with the Person pre-selected as Recipient.
   - There should be an option to link existing Gifts to the Person as Recipient or Purchaser from this tab.
   - Each Gift listed should show whether the Person is the Recipient or Purchaser.
   - The modal in view mode on the Overview tab should show a count of all Gifts linked to that Person as Recipient and another as Purchaser. There should be a tooltip on hover showing a list of mini cards of the Gifts, each being clickable to open the Gift modal.
   - The Person Card on /people page should show counts of Gifts as Recipient and Purchaser, with tooltips showing mini cards of the Gifts on hover.
6. When viewing Cards for Gifts on /gifts page, each card should have a small button in the bottom right to quickly assign a recipient via dropdown with existing People.
7. When viewing Cards for Gifts on /gifts page, each card should have a small button in the bottom right, to the left of the assign recipient button, to quickly update status with a dropdown of available status options.
8. When viewing Cards for Gifts on /gifts page, each card should have a small button in the top right to quickly open the Product URL in a new tab, if available.
9. In the Gift modal, the "Mark as Purchased" button should be updated to "Mark as..." with a dropdown of status options.
10. Users should be able to assign People to Occasions as Recipients. This should be a multi-select dropdown on the Occasion create/edit flows, allowing selection of existing People or adding New Person inline.
    - When viewing an Occasion modal, on the Linked Entities tab, there should be a section for People showing all assigned Recipients.
    - The Occasion modal in view mode on the Overview tab should show a count of assigned Recipients, with a tooltip on hover showing mini cards of the People, each being clickable to open the Person modal.
    - The Person modal on the Linked Entities tab should show all Occasions the Person is assigned to as Recipient.
    - The Person Card on /people page should show a count of Occasions assigned to that Person, with a tooltip showing mini cards of the Occasions on hover.
    - On /occasions/{id} detail page, there should be a section below Gift Lists which shows assigned Recipients with mini Person cards. Each card should be clickable to open the Person modal.

