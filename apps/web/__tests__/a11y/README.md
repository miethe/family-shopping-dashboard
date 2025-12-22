# Accessibility Testing

## Overview

This directory contains accessibility tests for the Family Gifting Dashboard web app. Tests use Playwright + axe-core to validate WCAG 2.1 AA compliance.

## Test Files

- `admin-accessibility.spec.ts` - Admin Field Options page accessibility audit

## Running Tests

### Prerequisites

```bash
# From project root, navigate to web app
cd apps/web

# Ensure dependencies are installed
pnpm install
```

### Run All Accessibility Tests

```bash
# Run all a11y tests
pnpm test:e2e __tests__/a11y

# Run with UI for interactive debugging
pnpm test:e2e:ui __tests__/a11y

# Run in headed mode (see browser)
pnpm test:e2e:headed __tests__/a11y

# Debug mode (step through tests)
pnpm test:e2e:debug __tests__/a11y
```

### Run Specific Test File

```bash
# Run admin page tests only
pnpm test:e2e __tests__/a11y/admin-accessibility.spec.ts

# With HTML report
pnpm test:e2e __tests__/a11y/admin-accessibility.spec.ts && pnpm test:e2e:report
```

### Run on Specific Browser

```bash
# Chrome only
pnpm test:e2e __tests__/a11y --project=chromium

# Safari only (important for iOS testing)
pnpm test:e2e __tests__/a11y --project=webkit

# Mobile Safari (iPhone simulation)
pnpm test:e2e __tests__/a11y --project=mobile-safari
```

## Test Structure

### Admin Accessibility Tests

Tests for `/admin` page and all modals:

1. **Automated Scans**
   - axe-core violation detection (WCAG 2.1 AA)
   - Color contrast checks
   - Form label associations
   - ARIA attribute validation

2. **Keyboard Navigation**
   - Tab order verification
   - Arrow key navigation (tabs)
   - Modal focus trapping
   - Escape key behavior

3. **Screen Reader Support**
   - Semantic HTML structure
   - ARIA roles and attributes
   - Form labeling
   - Modal announcements

4. **Visual Accessibility**
   - Color contrast ratios
   - Focus indicators
   - Touch target sizes (44x44px)

## WCAG 2.1 AA Compliance

All tests verify compliance with:

- **Perceivable**: Text alternatives, adaptable content, distinguishable elements
- **Operable**: Keyboard accessible, enough time, seizure-safe, navigable
- **Understandable**: Readable, predictable, input assistance
- **Robust**: Compatible with assistive technologies

## Test Coverage

### Current Coverage
- ✅ Admin Page (`/admin`)
- ✅ Entity tabs (Person, Gift, Occasion, List)
- ✅ Add Option Modal
- ✅ Edit Option Modal
- ✅ Delete Confirmation Modal

### Planned Coverage
- ⏳ Dashboard page
- ⏳ Gift catalog
- ⏳ List detail page
- ⏳ Person detail page

## Interpreting Results

### Success
```
  ✓ should not have any automatically detectable accessibility violations
  ✓ should support keyboard navigation through tabs
  ✓ should have adequate touch targets (44x44px minimum)
```

All tests pass = WCAG 2.1 AA compliant

### Failures

If tests fail, check:

1. **axe violations**: Review `accessibilityScanResults.violations` in error output
2. **Severity**: Critical > Serious > Moderate > Minor
3. **Fix**: Refer to axe documentation for specific rule violations

### Example Violation

```json
{
  "id": "color-contrast",
  "impact": "serious",
  "description": "Elements must have sufficient color contrast",
  "nodes": [
    {
      "html": "<button class=\"text-gray-400\">Edit</button>",
      "target": ["button.edit"]
    }
  ]
}
```

**Fix**: Increase contrast by using darker text color (e.g., `text-gray-600`)

## Manual Testing

While automated tests catch many issues, also perform manual testing:

### Keyboard Navigation
1. Start at page load
2. Press Tab - verify focus moves logically
3. Test all interactive elements
4. Open/close modals
5. Verify no keyboard traps

### Screen Reader (VoiceOver)
1. Enable VoiceOver: `Cmd + F5`
2. Navigate with `VO + arrow keys`
3. Verify all content is announced
4. Test form inputs, buttons, modals

### Mobile Testing
1. Test on real iOS device (Safari)
2. Enable VoiceOver on iOS
3. Verify touch targets are tappable
4. Test with zoom enabled

## Continuous Integration

In CI/CD pipeline, accessibility tests should:

1. Run on every PR
2. Block merge if violations found
3. Generate HTML reports
4. Fail build on critical/serious violations

## Resources

- [axe-core documentation](https://github.com/dequelabs/axe-core)
- [Playwright Accessibility Testing](https://playwright.dev/docs/accessibility-testing)
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

## Audit Reports

Full accessibility audit reports are in `/docs/audits/`:

- `admin-field-options-accessibility-audit.md` - Complete audit of admin page (Dec 2025)

## Support

For questions or issues:
1. Check the audit report in `/docs/audits/`
2. Review component accessibility in `/apps/web/CLAUDE.md`
3. Consult WCAG 2.1 guidelines for specific criteria
