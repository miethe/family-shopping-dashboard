# Identified Enhancements and Unexpected Behaviors

**Date:** 2025-12-06

## Listed Items

1. When viewing a Gift modal on the Linked Entities tab, if a user clicks to link a Person and hits Save, it does not update the Gift's linked entities, even after refreshing the page. The PATCH API call is noted in the backend traces with a 200 response, but the linked Person is not actually added, or at least isn't reflected in the modal. This should be fixed to properly link the Person to the Gift.
   - Whenever linking any entity to another entity from within a modal, the linked entity should immediately reflect in the modal upon Save, without needing to refresh the page. This should be consistent across all entity types and modals.
2. Whenever viewing Linked Entities tab on any entity modal, if there are  linked entities, each entity line item should have a small trash/delete icon/button to allow unlinking that entity from the current entity. This should prompt for confirmation before unlinking, and upon confirmation, should immediately remove the entity from the list without needing to refresh the page.
3. All dialogs in the app should use a consistent dialog component from one of our existing component libraries, rather than using the browser dialog. This includes confirmation dialogs, alert dialogs, and any other modal dialog types. This will ensure all UX has consistent styling and behavior across the app.
4. The Gift title should include a hyperlink to the Product URL when available, allowing users to click directly on the title to navigate to the product page. This should open in a new tab. This should be updated everywhere the Gift title is displayed, including in lists and modals.
5. The Gift modal's Overview tab should be updated to include the following additional fields:
   - For: if a Person is linked to the Gift, display "For: {Person's Avatar} {Person Name} ({Relation})" below the Gift title as a hyperlink to that Person's modal, along with their avatar as a small circular image.
   - Description: A multi-line text area to provide a detailed description of the Gift, located below the 'For' field.
   - Quantity: A number input field to specify how many of the Gift were purchased.
   - Sale Price: A number input field to specify the sale price of the Gift.
6. On the Gift modal's Overview tab, the 'MSRP Price', 'Sale Price', 'Quantity', and 'Status', should be overlayed at the bottom of the Gift image.
   - These fields should be centered and bottom aligned with padding within the image area. Row 1: MSRP Price and Sale Price side by side, ie {MSRP Price} / {Sale Price}. Row 2: Quantity ('Quantity {Purchased}/{Total Needed}') and Status side by side.
7. Gifts should have an additional field for Additional URLs. This field should accept adding multiple URLs, each with a label (e.g., "Store Page", "Review Page", etc.).
   - The Additional URLs field should default to one entry with a '+' button to add more URLs as needed. Each URL entry should have a label and URL input.
   - These URLs should be displayed in the Gift modal on the Overview tab and should be clickable links opening in new tabs. They should be displayed under the new Description field under a collapsible section 'Other Links', with each displayed as a hyperlink, using the label as the link text.
8. All entities should support adding images from either a URL or via file upload from the user's device. This should be supported in both creation and editing flows, and the images should be displayed in the entity modals and lists where applicable.
   - The image upload should support common image formats (JPEG, PNG, GIF) and should include basic validation for file size and type.
   - Uploaded images should be stored and served efficiently to optimize load times and performance.
   - When uploading, users should be able to paste an image, drag and drop, or select from a file picker.
   - If an entity does not have an image, the user should be able to click the image placeholder in the modal to open the upload dialog.
9. The site should support breadcrumb navigation at the top of each page, showing the current page's hierarchy within the app. This should allow users to easily navigate back to parent pages.
   - The breadcrumb should dynamically update based on the current page and should be clickable links for each level in the hierarchy.
   - The breadcrumb should be styled consistently with the app's design system and should be responsive for mobile and desktop views.
10. When adding a Gift, the 'From URL' should be greyed out, with a tooltip on hover stating "Coming Soon". This indicates to users that this feature is not yet available but is planned for future implementation.
    - The 'Manual' option should be the only selectable option for now and updated to be the default option, ensuring users can still add Gifts without confusion.
11. On the Gift modal, we should add a new button at the bottom next to 'View Product' called 'Mark as Purchased'. This should open a dialog over the modal allow the user to select the Quantity (number dropdown).
    - Upon confirming, this should update the Gift's status to 'Purchased', if Quantity >= Total Needed, otherwise set to 'Partially Purchased', set the Purchase Date (current date), and close the dialog.
    - The Gift modal should then reflect the updated status and needed quantity fields immediately without needing to refresh the page.
