/**
 * Practical Typography CSS-in-JS Style System
 * Based on https://practicaltypography.com
 *
 * Key principles:
 * - Line length: 45-90 characters
 * - Line spacing: 120-145% of point size
 * - First-line indents OR space between paragraphs (not both)
 * - Generous page margins
 * - Serif for body, sans-serif for headings
 * - Justified text with hyphenation
 */

export const PT_TOKENS = {
  // Font Families
  fontSerif:
    '"Source Serif 4", "Charter", "Bitstream Charter", "Sitka Text", Cambria, Georgia, serif',
  fontSans:
    '"Source Sans 3", "Concourse", "Gill Sans", "Gill Sans MT", "Helvetica Neue", Helvetica, Arial, sans-serif',
  fontMono: '"Source Code Pro", "Triplicate", "Consolas", "Monaco", "Andale Mono", monospace',

  // Colors - Warm tones like practicaltypography.com
  colorText: '#1a1a1a',
  colorTextMuted: '#666',
  colorBackground: '#fffff8',
  colorLink: 'inherit',
  colorLinkHover: '#777',
  colorBorder: '#ccc',
  colorRule: '#333',
  colorAsideBorder: '#ccc',
  colorCodeBg: '#f5f5f0',

  // Line height: 120-145% (unitless for proper inheritance)
  lineHeight: 1.4,
  lineHeightTight: 1.25,
  lineHeightLoose: 1.5,

  // First-line indent: 1-4x point size
  indent: '1.5em',

  // Content width in em units (scales with font-size for consistent line length)
  // 42em at ~18px font = ~75 chars per line (within 45-90 optimal range)
  contentMaxWidth: '42em',

  // Aside dimensions
  asideWidth: '12em',
  asideGap: '1.5em',

  // Spacing (using em for proportional scaling)
  spaceXs: '0.25em',
  spaceSm: '0.5em',
  spaceMd: '1em',
  spaceLg: '1.5em',
  spaceXl: '2em',
  spaceXxl: '2.5em',
} as const;

export type PTTokens = typeof PT_TOKENS;

/**
 * CSS custom properties string for use in style tags
 */
export const PT_CSS_VARS = `
  --pt-font-serif: ${PT_TOKENS.fontSerif};
  --pt-font-sans: ${PT_TOKENS.fontSans};
  --pt-font-mono: ${PT_TOKENS.fontMono};
  --pt-color-text: ${PT_TOKENS.colorText};
  --pt-color-text-muted: ${PT_TOKENS.colorTextMuted};
  --pt-color-background: ${PT_TOKENS.colorBackground};
  --pt-color-link: ${PT_TOKENS.colorLink};
  --pt-color-link-hover: ${PT_TOKENS.colorLinkHover};
  --pt-color-border: ${PT_TOKENS.colorBorder};
  --pt-color-rule: ${PT_TOKENS.colorRule};
  --pt-color-aside-border: ${PT_TOKENS.colorAsideBorder};
  --pt-color-code-bg: ${PT_TOKENS.colorCodeBg};
  --pt-line-height: ${PT_TOKENS.lineHeight};
  --pt-line-height-tight: ${PT_TOKENS.lineHeightTight};
  --pt-line-height-loose: ${PT_TOKENS.lineHeightLoose};
  --pt-indent: ${PT_TOKENS.indent};
  --pt-content-max-width: ${PT_TOKENS.contentMaxWidth};
  --pt-aside-width: ${PT_TOKENS.asideWidth};
  --pt-aside-gap: ${PT_TOKENS.asideGap};
  --pt-space-xs: ${PT_TOKENS.spaceXs};
  --pt-space-sm: ${PT_TOKENS.spaceSm};
  --pt-space-md: ${PT_TOKENS.spaceMd};
  --pt-space-lg: ${PT_TOKENS.spaceLg};
  --pt-space-xl: ${PT_TOKENS.spaceXl};
  --pt-space-xxl: ${PT_TOKENS.spaceXxl};
`;

/**
 * Utility to create inline styles from token values
 */
export function ptStyle(styles: React.CSSProperties): React.CSSProperties {
  return styles;
}
