# 12-1 Enhancements

## Summary

1. The Idea Inbox and Recent Activity modules on the Home Dashboard are current non-functional placeholders. Both should be fully wired into the app:
   1. Idea Inbox: Fetch and display ideas added by any family member, sorted by most recent. This all shows gifts not currently in a dedicated list. Each idea should show the title, who added it, and when. The button to "Add to List" should open a modal allowing selection of an existing list or creation of a new one.
   2. Recent Activity: Fetch and display a chronological list of actions taken by any family member in the app (adding ideas, marking gifts as purchased, etc). Each activity should show what was done, by whom, and when. Each linked entity (Lists added, Gifts Purchased, etc) should be clickable to navigate to that item.
2. When opening a /list modal, it should show a simple catalog of cards for all gifts in that list, with the ability to filter by status (Idea, Purchased, Gifted). Each gift should show its title, image (if available), status, and who added it. Clicking a gift should open its detail view.
   1. There should also be an empty card at the start of the catalog with a '+' icon and "Add New Gift" text. Clicking this should open the Add Gift flow, pre-selecting the current list.
3. If a gift has an image URL but it is failing, it should fallback to no image, rather than showing a broken image icon.
4. When dragging gifts on the Kanban views, cards must be able to be moved even if a column has no cards. Currently, if a column is empty, cards cannot be dragged into it. This is a bug.