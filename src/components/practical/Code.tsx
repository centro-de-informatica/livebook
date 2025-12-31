import React from "react";
import type { CSSProperties, ReactNode } from "react";

export interface CodeBlockProps {
  children: ReactNode;
  /** Language for syntax highlighting */
  language?: string;
  /** Expand beyond main content to full width (aside + main + aside) on large screens */
  wide?: boolean;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

export interface InlineCodeProps {
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Inline code following Practical Typography principles
 *
 * - Monospaced font
 * - Reduced size (0.9em)
 * - Subtle background
 */
export function InlineCode({ children, className = "", style }: InlineCodeProps) {
  const codeStyle: CSSProperties = {
    fontFamily: "var(--pt-font-mono)",
    fontSize: "0.88em",
    backgroundColor: "var(--pt-color-code-bg)",
    padding: "0.1em 0.35em",
    borderRadius: "2px",
    ...style,
  };

  return (
    <code className={`pt-code ${className}`} style={codeStyle}>
      {children}
    </code>
  );
}

/**
 * Code block following Practical Typography principles
 *
 * - Monospaced font
 * - Left border like blockquotes
 * - Proper line height for code
 * - Subtle background
 */
export function CodeBlock({
  children,
  language,
  wide = false,
  className = "",
  style,
}: CodeBlockProps) {
  const baseStyle: CSSProperties = {
    marginTop: "var(--pt-space-lg)",
    marginBottom: "var(--pt-space-lg)",
    marginLeft: wide ? 0 : "2em",
    padding: "var(--pt-space-md)",
    paddingLeft: "1em",
    backgroundColor: "var(--pt-color-code-bg)",
    borderLeft: wide ? "none" : "2px solid var(--pt-color-rule)",
    overflowX: "auto",
    lineHeight: 1.45,
    ...style,
  };

  const codeStyle: CSSProperties = {
    fontFamily: "var(--pt-font-mono)",
    fontSize: "0.88em",
    background: "none",
    padding: 0,
  };

  const wideClass = wide ? "pt-code-block--wide" : "";

  return (
    <>
      {wide && (
        <style>{`
          .pt-code-block--wide {
            position: relative;
          }
          @media (min-width: 75em) {
            .pt-code-block--wide {
              --wide-extra: calc(var(--pt-aside-width, 10rem) + var(--pt-aside-gap, 1.5rem));
              --wide-width: calc(100% + var(--wide-extra) * 2);
              width: var(--wide-width) !important;
              margin-left: calc(-1 * var(--wide-extra)) !important;
              margin-right: calc(-1 * var(--wide-extra)) !important;
              max-width: calc(100vw - 2rem);
              box-sizing: border-box;
              border-radius: 3px;
            }
          }
        `}</style>
      )}
      <pre
        className={`pt-code-block ${wideClass} ${className}`.trim()}
        style={baseStyle}
        data-language={language}
      >
        <code style={codeStyle}>{children}</code>
      </pre>
    </>
  );
}

export default CodeBlock;
