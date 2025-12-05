# Enhancements and Identified Issues - 12-03

## Requests

1. Currently, Occasions display their date as N-1 the date set on the entity. This should be resolved to be the correct date.
2. We should have a set of standard Occasions already created in the app for key Holidays which often involve gifting (e.g., Christmas, Hanukkah, Easter, Valentine's Day). These should be created automatically on a new Family Dashboard. They should be editable/deletable by users as needed.
3. When a recipient has a birthdate or anniversary set, an Occasion should be automatically created for that date each year, and auto-linked to the recipient entity. If the date is updated, the Occasion should update accordingly. If the recipient is deleted, the Occasion should also be deleted.
4. There should be 3 types of Occasion: Holiday, Recurring (annual), and Other. Holiday and Recurring Occasions repeat every year on the given date or day of the week (We will add enhanced support for movable dates like Easter in future), while Other Occasions occur only once on the specified date. Recurring Occasions should have logic to generate the next occurrence each year, after the current year's date has passed. All flows should be updated to support adding/editing these types.
5. We should generally only display Occasions occurring within the next 3 months on the Home Dashboard. The next-up Occasion should be clickable to open that occasion's modal. The "View Occasion" link should be updated to 'View All Occasions' to see the full list.