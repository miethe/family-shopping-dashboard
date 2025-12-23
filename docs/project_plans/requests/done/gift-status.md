# Gift Status Issues

**Date:** 2025-12-09

## Context

- Gift Status was recently refactored to use GiftStatus enum in git commit `a6096daacd17db324de382bd9215ed17e4e2aecc`.

There are still numerous issues with the Gift status implementation. All Gift status fields MUST use the new GiftStatus enum values, and updating status through any method must reflect correctly in the database and UI. The Gift filtering on the /gifts page must also work correctly based on the updated status.

## Issues and Enhancements

1. There are multiple methods for updating Gift status, none of which seem to translate to the actual status of the gift. We must ensure that all utilize the new GiftStatus enum and that updating the status through any method reflects correctly in the database and UI, then being filterable on the /gifts page.
    - The methods include:
      - Gift status dropdown on /gifts page cards
      - On the Gift modal, using the "Mark as Purchased" button
      - On the Gift modal, using the Status dropdown to change status
      - Status during Gift creation/editing flows
2. The Gift status dropdown on /gifts cards renders below cards beneath it, making it difficult to use. This should be fixed so that the dropdown appears above other elements.
3. The Gift status field during Gift creation and editing have diverged. We should remove both and replace them with a single status dropdown that uses the GiftStatus enum values.
    - This dropdown field should be located between 'Price' and 'Product URL' fields in the creation/editing flows.
4. Whenever status is updated, there should be a toast notification confirming the update was successful, or an error message if it failed.
5. The status dropdowns in every location, per #1 above, should display the current status as the displayed value, indicating the current status.
6. There should be NO Gift status field associated with Gift Lists. Gift Lists do not have a status; only Gifts do.
7. The Gift modal and card should clearly indicate the current status of the Gift, using both text and color coding per the GiftStatus enum, in an easily visible location.
8. Whenever a Gift's status is updated, it should reflect in all locations immediately without needing a page refresh.