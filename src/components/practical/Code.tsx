import React from "react";
import type { CSSProperties, ReactNode } from "react";

export interface CodeBlockProps {
  children: ReactNode;
  /** Language for syntax highlighting */
  language?: string;
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
  className = "",
  style,
}: CodeBlockProps) {
  const preStyle: CSSProperties = {
    margin: "var(--pt-space-lg) 0",
    marginLeft: "2em",
    padding: "var(--pt-space-md)",
    paddingLeft: "1em",
    backgroundColor: "var(--pt-color-code-bg)",
    borderLeft: "2px solid var(--pt-color-rule)",
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

  return (
    <pre
      className={`pt-code-block ${className}`}
      style={preStyle}
      data-language={language}
    >
      <code style={codeStyle}>{children}</code>
    </pre>
  );
}

export default CodeBlock;
