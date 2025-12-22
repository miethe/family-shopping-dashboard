---
title: "Managing Dropdown Options: Admin Guide"
description: "Step-by-step guide for family members who manage the gift dashboard's dropdown options. Learn how to add new options, edit existing ones, and delete unused choices."
audience: [family-members, non-technical-users, admins]
tags: [guide, admin, user-guide, how-to, dropdown-options]
created: 2025-12-22
updated: 2025-12-22
category: user-documentation
---

# Managing Dropdown Options: Admin Guide

Welcome to the admin guide for managing dropdown options in your family's gifting dashboard. This guide explains how to add, edit, and remove the choices that appear in dropdown menus throughout the app.

## What Are Dropdown Options?

Dropdown options are the choices you see when filling out forms. For example:
- When adding a wine preference to someone's profile, you see "Red", "White", "Rosé"
- When creating a gift, you select its priority from "Low", "Medium", "High"
- When creating an occasion, you pick a type like "Holiday", "Birthday", "Other"

Instead of requiring a developer to add new options, you can now manage these choices yourself through the admin page.

## Accessing the Admin Page

### Step 1: Open the Dashboard
Log into your family's gifting dashboard as you normally would.

### Step 2: Click the Settings Icon
In the sidebar (left side on desktop, accessible from the menu on mobile), look for the **Settings icon** (gear symbol) near the bottom of the navigation menu. Click it.

### Step 3: You're Now in the Admin Page
You'll see a tabbed interface with four tabs:
- **Person** - Options for personal preferences (wine types, hobbies, cuisines, etc.)
- **Gift** - Options for gift details (priority, status)
- **Occasion** - Options for occasion types
- **List** - Options for list types

## Understanding the Interface

### The Main Areas

**Entity Tabs** (Top)
- Click to switch between Person, Gift, Occasion, and List
- Shows which entity's options you're currently managing

**Fields List** (Left side on desktop, top on mobile)
- Shows all the field categories for the selected entity
- Each field has a count of how many options it contains
- Click a field to expand and see its options

**Options List** (Main area)
- Shows all the options for the currently selected field
- Each option has a label (what users see) and a value (internal code)
- Shows badges indicating if an option is in use

## Adding a New Option

### Example: Adding "Sake" to Wine Types

**Step 1: Navigate to the Right Field**
1. Click the **Person** tab (if not already selected)
2. In the fields list, find and click **wine_types**
3. You'll see the current wine options: Red, White, Rosé, Sparkling

**Step 2: Click "Add Option" Button**
- A form will pop up titled "Add New Option"

**Step 3: Fill in the Form**

The form has two important fields:

**Value** (What the System Uses)
- This is the internal code, like "sake" or "dry-white"
- Use lowercase letters and hyphens (no spaces)
- You cannot change this after creating the option
- Examples: "sake", "champagne", "brandy"

**Display Label** (What Users See)
- This is the friendly name, like "Sake" or "Dry White Wine"
- This is what appears in the dropdown menu
- You can change this later if you want to improve the wording
- Examples: "Sake", "Champagne", "Brandy"

**Step 4: Save**
- Click the **Save** button
- The modal closes and your new option appears in the list
- Within a few seconds, all dropdown menus throughout the app will show your new option

### Real-World Examples

**Adding a hobby:**
- Value: "homelab-maintenance"
- Display Label: "Homelab Maintenance"

**Adding a cuisine:**
- Value: "thai"
- Display Label: "Thai Food"

**Adding a budget preference:**
- Value: "luxury"
- Display Label: "Luxury Items (500+)"

## Editing an Option

### What You Can Change
- **Display Label** - The text users see in dropdowns
- **Display Order** - The position in the dropdown list (lower numbers appear first)

### What You Cannot Change
- **Value** - The internal code is locked to preserve data integrity
- **System Options** - Options marked with a blue "System" badge cannot be edited (these are core defaults)

### How to Edit

**Step 1: Find the Option**
1. Navigate to the correct entity and field
2. Find the option you want to edit in the list

**Step 2: Click the Edit Icon**
- Look for the pencil icon next to the option
- Click it to open the edit form

**Step 3: Make Your Changes**
- Update the Display Label if needed
- Change the Display Order if you want to reorder it
- The Value field will be grayed out (read-only)

**Step 4: Save**
- Click **Save**
- Changes appear immediately throughout the app

### Example: Editing a Label
- Original: "Red Wine"
- Updated: "Red Wine (Bold Flavors)"
- This helps users understand the nuance better

## Deleting an Option

Deleting options requires some care to protect your data. The system uses two different deletion methods depending on whether the option is in use.

### Two Types of Deletion

**Soft Delete** (Recommended for used options)
- The option is hidden from all dropdown menus
- Existing records that use this option are NOT deleted
- Users who already selected this option still see it on their profile
- New forms won't show the soft-deleted option
- You can still archive or restore it later if needed

**Hard Delete** (Only for unused options)
- The option is completely removed
- Only works if no one has selected it yet
- Cannot be undone
- This is permanent

### How to Delete

**Step 1: Find the Option**
1. Navigate to the correct entity and field
2. Find the option you want to delete

**Step 2: Check the Usage Badge**
- Look for a badge showing "In use (N)" or "Unused"
- This tells you if anyone has selected this option

**Step 3: Click the Delete Icon**
- Look for the trash icon next to the option
- Click it

**Step 4: Review the Warning**
- A confirmation dialog appears
- If the option is in use, it shows: "This option is in use by X records. It will be soft-deleted and hidden from new selections."
- If unused, it shows: "This option is not in use. Click below to permanently delete."

**Step 5: Confirm**
- Read the warning carefully
- Click **Confirm Delete** to proceed
- The option is deleted or soft-deleted

### What Happens After Delete

**For Soft Deletion:**
- The option disappears from dropdowns for new selections
- Existing records keep their selection (no data loss)
- Everyone's profiles remain intact

**For Hard Deletion:**
- The option is gone completely
- No one's profile is affected (since no one was using it)

## Understanding System Options

Some options have a blue badge labeled "System". These are:
- Built-in defaults that came with the application
- Cannot be edited or deleted
- Form the foundation of your options

You'll see system options like:
- Gift priorities: "Low", "Medium", "High"
- Gift status: "Idea", "Selected", "Purchased", "Received"
- Occasion types: "Holiday", "Birthday", "Other"

These are locked to ensure consistency. If you want different wording, you can add your own custom option instead.

## Frequently Asked Questions

### Q: I added an option but don't see it in the dropdown forms
**A:** Wait 5-10 seconds and refresh the page. The app updates dropdowns automatically after you add an option. If it still doesn't appear, try logging out and back in.

### Q: Can I delete a system option (the ones with blue badges)?
**A:** No. System options are locked to maintain consistency. If you don't want to use one, you can add your own custom option instead. For example, if you don't like "Low Priority", you could add "Not Urgent".

### Q: What if I accidentally delete something?
**A:** If you soft-deleted an option (it showed as "in use"), it's not really deleted—it's just hidden. However, there's no way to un-hide it from the admin page currently. If you hard-deleted an unused option and need it back, contact the person who manages the system.

### Q: How long before changes appear in the app?
**A:** Usually within 5 seconds. The app automatically fetches updated options when you:
- Refresh the page
- Come back to a form after making changes
- Switch between different sections of the app

### Q: Why can't I change the value field?
**A:** The value is the internal code that links to people's actual data. If we let you change it, old records might not match anymore. Think of it like changing someone's ID number—it breaks the connection. That's why it's locked.

## Reordering Options

Options appear in dropdown menus in order based on their "Display Order" number. Lower numbers appear first.

### How to Reorder

**Step 1: Edit the Option**
- Click the pencil icon to open the edit form

**Step 2: Change the Display Order**
- The number field shows the current order
- Lower = appears earlier in the dropdown
- Type a new number (examples: 1, 5, 10, 100)

**Step 3: Save**
- Click **Save**
- The dropdown order updates throughout the app

### Tips for Ordering
- Put the most common choices first (lowest numbers)
- Keep numbers in groups of 10 (10, 20, 30) for easy reordering later
- For wines, you might use: Red (10), White (20), Rosé (30), Sparkling (40)

## Troubleshooting

### Problem: Option Not Appearing in Dropdown
**Possible causes:**
1. The option is soft-deleted (hidden) - check for strike-through text or "inactive" badge
2. You haven't refreshed the page yet - try reloading
3. You selected the wrong field - verify you're in the right entity/field combo
4. The form might be caching old data - log out and back in

### Problem: Delete Button Not Working
**Possible causes:**
1. The option is a system option (blue badge) - system options can't be deleted
2. You might not have permission - only admins can delete options
3. The server might be busy - try again in a few seconds

### Problem: Error Messages

**"Option with this value already exists"**
- You're trying to add an option with the same value (internal code) that already exists
- Each value must be unique for that field
- Try using a slightly different value, like "sake-dry" instead of "sake"

**"Cannot change the value field"**
- This is normal - value fields are always locked
- You can only change the Display Label

## Best Practices

### When Adding Options
- Use clear, descriptive labels that family members will understand
- Be consistent with capitalization (use Title Case or lowercase consistently)
- Add related options in one go (don't add them one at a time over multiple days)
- Test the dropdown after adding to make sure it appears correctly

### When Editing Options
- Update labels when the meaning becomes unclear
- Don't change labels frequently—consistency helps users
- Document changes informally in a family chat or notes

### When Deleting Options
- If unsure about an option, soft-delete it instead of hard-deleting
- Check the usage count before deleting (it shows how many records use it)
- You can always re-add it later if needed

### Keeping Options Organized
- Delete soft-deleted options periodically to keep the list clean
- Group similar options (put all wine types together)
- Use consistent naming (don't mix "Red Wine" and "red_wine")
- Keep the display order logical (most used first)

## What Happens When You Make Changes

When you add, edit, or delete an option:

1. **You save the change** in the admin page
2. **The system updates the database** with your change
3. **All dropdowns are notified** of the change
4. **Within 5 seconds**, all forms throughout the app show the updated options
5. **No app restart is needed** - changes are live immediately

## Getting Help

If you encounter issues:
- Try refreshing the page and trying again
- Make sure you're logged in as an admin
- Contact the person who manages the system if something seems broken
- Take note of any error messages to share when asking for help

---

**Last Updated**: December 22, 2025

**Questions?** This guide covers the most common admin tasks. If you need to do something not described here, ask the developer who set up your dashboard.
