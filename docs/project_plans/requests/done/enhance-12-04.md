# Enhancements

**Date:** 2025-12-04

## Listed Items

1. The /gifts modals in view mode should display all available details on the Overview tab, except for Linked Entities.
2. Gifts should be linkable to People entities. This support should be added to both the Gift creation/editing flow, as well as the Linked Entities tab within the Gift modal.
3. Gifts should support additional fields, displaying them on the Gift modal (per #2 above), and allowing population during Gift creation/editing. The fields to be added are:
    - Store (multi-select from existing Stores, allowing users to add new inline)
    - Purchase Date (date)
    - Notes (text)
    - Description (text)
    - Priority (enum: Low, Medium, High)
    - Quantity (number)
    - Sale Price (number)
    - URL (string) - existing field should be updated with a `+` button to add additional links.
4. On /people page, the people Cards should all have a consistent size.
5. We should add a new field to People entities: Group. This should be a multi-select field which allows adding new options inline, allowing users to categorize People into arbitrary groups (e.g., "Johnson Family", "Extended Family", "Church Group", etc.). This field should be filterable on the /people page, and visible/editable within the Person modal. All existing Groups should be displayed in a separate section on the /people page below the "catalog" of people cards. These should be structured similar to People, with a card for each Group, displaying the Group name and number of People within that Group. Clicking on a Group card should filter the /people page to only show People within that Group.