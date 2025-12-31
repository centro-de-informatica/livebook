import type { CSSProperties, ReactNode } from "react";

export interface ParagraphProps {
  children: ReactNode;
  /** Lead paragraph - larger size, no indent */
  lead?: boolean;
  /** Remove first-line indent */
  noIndent?: boolean;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Paragraph component following Practical Typography principles
 *
 * - Body text uses serif font
 * - Line spacing: 120-145% of point size
 * - Hyphenation enabled (via body styles)
 * - First-line indents for consecutive paragraphs
 */
export function Paragraph({
  children,
  lead = false,
  noIndent = false,
  className = "",
  style,
}: ParagraphProps) {
  const baseStyle: CSSProperties = {
    margin: 0,
    marginBottom: "var(--pt-space-sm)",
  };

  const leadStyle: CSSProperties = lead
    ? {
        fontSize: "1.05em",
        lineHeight: "var(--pt-line-height-loose)",
      }
    : {};

  const combinedStyle: CSSProperties = {
    ...baseStyle,
    ...leadStyle,
    ...style,
  };

  const classes = [
    "pt-paragraph",
    lead ? "pt-lead" : "",
    noIndent ? "pt-no-indent" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <p className={classes} style={combinedStyle}>
      {children}
    </p>
  );
}

export default Paragraph;
