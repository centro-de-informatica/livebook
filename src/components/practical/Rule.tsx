import React, { type CSSProperties } from "react";

export interface RuleProps {
  /** Section break style with asterisks */
  sectionBreak?: boolean;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Horizontal rule following Practical Typography principles
 *
 * - Use sparingly
 * - Half point to one point thickness
 * - Can use section break style (asterisks) for major breaks
 */
export function Rule({ sectionBreak = false, className = "", style }: RuleProps) {
  if (sectionBreak) {
    const breakStyle: CSSProperties = {
      border: "none",
      textAlign: "center",
      margin: "var(--pt-space-xxl) 0",
      color: "var(--pt-color-text-muted)",
      letterSpacing: "0.5em",
      ...style,
    };

    return (
      <div
        className={`pt-section-break ${className}`}
        style={breakStyle}
        role="separator"
        aria-hidden="true"
      >
        * * *
      </div>
    );
  }

  const hrStyle: CSSProperties = {
    border: "none",
    borderTop: "1px solid var(--pt-color-rule)",
    margin: "var(--pt-space-xl) 0",
    ...style,
  };

  return <hr className={`pt-rule ${className}`} style={hrStyle} />;
}

export default Rule;
