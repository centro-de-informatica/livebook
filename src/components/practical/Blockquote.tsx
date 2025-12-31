import React from "react";
import type { CSSProperties, ReactNode } from "react";

export interface BlockquoteProps {
  children: ReactNode;
  /** Citation text */
  cite?: string;
  /** Citation source URL */
  citeUrl?: string;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Block quotation following Practical Typography principles
 *
 * - Reduced point size and line spacing slightly
 * - Indented on the left (2-5 ems on web)
 * - No quotation marks (they're redundant)
 * - Left border as visual indicator
 * - No background color (cleaner)
 */
export function Blockquote({
  children,
  cite,
  citeUrl,
  className = "",
  style,
}: BlockquoteProps) {
  const blockquoteStyle: CSSProperties = {
    margin: "var(--pt-space-lg) 0",
    marginLeft: "2em",
    paddingLeft: "1em",
    borderLeft: "2px solid var(--pt-color-rule)",
    fontSize: "0.94rem",
    lineHeight: "var(--pt-line-height)",
    ...style,
  };

  const footerStyle: CSSProperties = {
    marginTop: "var(--pt-space-sm)",
    fontSize: "0.9em",
    color: "var(--pt-color-text-muted)",
  };

  const citeStyle: CSSProperties = {
    fontStyle: "normal",
  };

  return (
    <blockquote className={`pt-blockquote ${className}`} style={blockquoteStyle}>
      {children}
      {cite && (
        <footer style={footerStyle}>
          <span style={{ marginRight: "0.25em" }}>{"\u2014"}</span>
          {citeUrl ? (
            <cite style={citeStyle}>
              <a href={citeUrl}>{cite}</a>
            </cite>
          ) : (
            <cite style={citeStyle}>{cite}</cite>
          )}
        </footer>
      )}
      <style>{`
        .pt-blockquote p:last-of-type {
          margin-bottom: 0;
        }
      `}</style>
    </blockquote>
  );
}

export default Blockquote;
