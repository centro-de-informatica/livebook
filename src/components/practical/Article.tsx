import React, { type CSSProperties, type ReactNode } from "react";

export interface ArticleProps {
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

export interface ArticleHeaderProps {
  /** Article title */
  title: string;
  /** Article subtitle */
  subtitle?: string;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

export interface ArticleContentProps {
  children: ReactNode;
  /** Use first-line indents for paragraphs */
  useIndents?: boolean;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Article container following Practical Typography principles
 *
 * - Proper max-width for line length (45-90 characters)
 * - Centered layout
 */
export function Article({ children, className = "", style }: ArticleProps) {
  const articleStyle: CSSProperties = {
    maxWidth: "min(42em, calc(100% - 2rem))",
    margin: "0 auto",
    ...style,
  };

  return (
    <article className={`pt-article ${className}`} style={articleStyle}>
      {children}
    </article>
  );
}

/**
 * Article header with title and optional subtitle
 * Following Practical Typography style: left-aligned title area with content flowing beside it
 */
export function ArticleHeader({
  title,
  subtitle,
  className = "",
  style,
}: ArticleHeaderProps) {
  const headerStyle: CSSProperties = {
    display: "block",
    marginBottom: "var(--pt-space-lg)",
    paddingTop: "var(--pt-space-sm)",
    borderTop: "1px solid var(--pt-color-text)",
    ...style,
  };

  const titleStyle: CSSProperties = {
    fontFamily: "var(--pt-font-sans)",
    fontSize: "1.3rem",
    fontWeight: 700,
    lineHeight: 1.2,
    margin: 0,
    marginTop: "var(--pt-space-xs)",
  };

  const subtitleStyle: CSSProperties = {
    fontSize: "0.9rem",
    color: "var(--pt-color-text-muted)",
    margin: 0,
    marginTop: "0.3rem",
    fontStyle: "italic",
    fontFamily: "var(--pt-font-serif)",
  };

  return (
    <header className={`pt-article-header ${className}`} style={headerStyle}>
      <h1 style={titleStyle}>{title}</h1>
      {subtitle && <p style={subtitleStyle}>{subtitle}</p>}
    </header>
  );
}

/**
 * Article content wrapper with optional first-line indents
 */
export function ArticleContent({
  children,
  useIndents = true,
  className = "",
  style,
}: ArticleContentProps) {
  const contentStyle: CSSProperties = {
    ...style,
  };

  const classes = [
    "pt-article-content",
    useIndents ? "pt-indent" : "pt-space-between",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={classes} style={contentStyle}>
      {children}
    </div>
  );
}

export default Article;
