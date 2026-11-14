/**
 * Typography Token System
 *
 * Centralized typography token definitions for the Soft Modernity Design System.
 * Provides consistent scaling and styling across all components.
 *
 * Complies with Material Design 3 typography scale and optimized for mobile-first
 * design with emphasis on readability and accessibility.
 *
 * @example
 * ```tsx
 * import { typography } from '@/lib/typography';
 *
 * // Use in styled components
 * const title = css`
 *   ${typography.heading1}
 * `;
 *
 * // Use in component props
 * <Text variant="bodyLarge" />
 * ```
 */

/**
 * Core typography token definitions
 * Each token includes: fontSize, lineHeight, fontWeight, and optional styling
 */
export const typography = {
  /**
   * Display Large - Hero headlines, page titles (48px)
   * Used for primary page titles and maximum emphasis content
   * Letter-spacing: -0.02em for tighter appearance
   */
  displayLarge: {
    fontSize: '3rem',           // 48px
    lineHeight: '3.5rem',       // 56px (1.167)
    fontWeight: 800,            // Extra-bold
    letterSpacing: '-0.02em',   // Tighter tracking
  },

  /**
   * Display Medium - Section headers, large emphasis (36px)
   * Used for section introductions and secondary titles
   * Letter-spacing: -0.01em for subtle tracking adjustment
   */
  displayMedium: {
    fontSize: '2.25rem',        // 36px
    lineHeight: '2.75rem',      // 44px (1.222)
    fontWeight: 800,            // Extra-bold
    letterSpacing: '-0.01em',   // Slightly tighter tracking
  },

  /**
   * Display Small - Subsection headers (28px)
   * Used for tertiary headers and emphasized content blocks
   */
  displaySmall: {
    fontSize: '1.75rem',        // 28px
    lineHeight: '2.25rem',      // 36px (1.286)
    fontWeight: 700,            // Bold
    letterSpacing: '0em',       // Normal tracking
  },

  /**
   * Heading 1 - Primary headings (24px)
   * Used for main section headings and dialog titles
   * Optimal for h1 tags and primary content hierarchy
   */
  heading1: {
    fontSize: '1.5rem',         // 24px
    lineHeight: '2rem',         // 32px (1.333)
    fontWeight: 700,            // Bold
    letterSpacing: '0em',       // Normal tracking
  },

  /**
   * Heading 2 - Secondary headings (20px)
   * Used for subsections, card headers, and list headings
   * Optimal for h2 tags and secondary content hierarchy
   */
  heading2: {
    fontSize: '1.25rem',        // 20px
    lineHeight: '1.75rem',      // 28px (1.4)
    fontWeight: 600,            // Semi-bold
    letterSpacing: '0em',       // Normal tracking
  },

  /**
   * Heading 3 - Tertiary headings (18px)
   * Used for subheadings, form sections, and items within lists
   * Optimal for h3 tags and tertiary content hierarchy
   */
  heading3: {
    fontSize: '1.125rem',       // 18px
    lineHeight: '1.625rem',     // 26px (1.444)
    fontWeight: 600,            // Semi-bold
    letterSpacing: '0em',       // Normal tracking
  },

  /**
   * Body Large - Main body text (16px)
   * Primary text size for longer-form content and descriptions
   * Ideal for paragraphs, list items, and primary content
   * Line height: 1.5 ensures excellent readability
   */
  bodyLarge: {
    fontSize: '1rem',           // 16px
    lineHeight: '1.5rem',       // 24px (1.5)
    fontWeight: 400,            // Regular
    letterSpacing: '0em',       // Normal tracking
  },

  /**
   * Body Medium - Secondary body text (14px)
   * Used for secondary descriptions, metadata, and supporting text
   * Maintains readability while providing visual hierarchy
   */
  bodyMedium: {
    fontSize: '0.875rem',       // 14px
    lineHeight: '1.25rem',      // 20px (1.429)
    fontWeight: 400,            // Regular
    letterSpacing: '0em',       // Normal tracking
  },

  /**
   * Body Small - Tertiary text, captions (12px)
   * Used for timestamps, helper text, and fine print
   * Semi-bold weight maintains clarity at small size
   */
  bodySmall: {
    fontSize: '0.75rem',        // 12px
    lineHeight: '1rem',         // 16px (1.333)
    fontWeight: 500,            // Medium-weight for clarity
    letterSpacing: '0em',       // Normal tracking
  },

  /**
   * Label Large - Primary labels and action text (14px)
   * Used for button text, form labels, and prominent labels
   * Uppercase styling with increased letter-spacing for emphasis
   */
  labelLarge: {
    fontSize: '0.875rem',       // 14px
    lineHeight: '1.25rem',      // 20px (1.429)
    fontWeight: 600,            // Semi-bold for emphasis
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',    // 0.8px wider for uppercase
  },

  /**
   * Label Small - Secondary labels and metadata (12px)
   * Used for badges, tags, secondary labels, and helper text
   * Uppercase styling with increased letter-spacing for consistency
   */
  labelSmall: {
    fontSize: '0.75rem',        // 12px
    lineHeight: '1rem',         // 16px (1.333)
    fontWeight: 600,            // Semi-bold for emphasis
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',    // 0.6px wider for uppercase
  },
} as const;

/**
 * Type utilities for working with typography tokens
 */

/**
 * Type-safe typography key
 * Ensures you can only use valid typography token names
 *
 * @example
 * ```tsx
 * const variant: TypographyKey = 'heading1'; // OK
 * const variant: TypographyKey = 'invalidKey'; // Type error
 * ```
 */
export type TypographyKey = keyof typeof typography;

/**
 * Individual typography style object
 * Represents a complete typography style definition
 *
 * @example
 * ```tsx
 * const style: TypographyStyle = typography.bodyLarge;
 * ```
 */
export type TypographyStyle = typeof typography[TypographyKey];

/**
 * Get a typography style by key
 * Type-safe utility for accessing typography styles
 *
 * @param key - The typography token key
 * @returns The complete typography style object
 *
 * @example
 * ```tsx
 * const headingStyle = getTypography('heading1');
 * ```
 */
export function getTypography(key: TypographyKey): TypographyStyle {
  return typography[key];
}

/**
 * Convert typography token to CSS properties
 * Useful for generating inline styles or CSS-in-JS
 *
 * @param key - The typography token key
 * @returns CSS property object compatible with React style prop
 *
 * @example
 * ```tsx
 * <div style={typographyToCss('heading1')}>Title</div>
 * ```
 */
export function typographyToCss(key: TypographyKey): React.CSSProperties {
  const style = typography[key];
  const css: React.CSSProperties = {
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    fontWeight: style.fontWeight,
    letterSpacing: style.letterSpacing || undefined,
  };

  if ('textTransform' in style && style.textTransform) {
    css.textTransform = style.textTransform as React.CSSProperties['textTransform'];
  }

  return css;
}

/**
 * All available typography keys in order of visual hierarchy
 * Display > Heading > Body > Label
 */
export const TYPOGRAPHY_KEYS = Object.keys(typography) as TypographyKey[];

/**
 * Typography by category for easier access
 * Organized by semantic usage rather than size
 */
export const typographyCategories = {
  display: ['displayLarge', 'displayMedium', 'displaySmall'] as const,
  heading: ['heading1', 'heading2', 'heading3'] as const,
  body: ['bodyLarge', 'bodyMedium', 'bodySmall'] as const,
  label: ['labelLarge', 'labelSmall'] as const,
} as const;

