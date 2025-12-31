import React, { type CSSProperties, type ReactNode } from "react";

export interface FigureProps {
  children: ReactNode;
  /** Caption text */
  caption?: ReactNode;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Figure component following Practical Typography principles
 *
 * - Proper margins
 * - Caption with smaller text and muted color
 */
export function Figure({
  children,
  caption,
  className = "",
  style,
}: FigureProps) {
  const figureStyle: CSSProperties = {
    margin: "var(--pt-space-xl) 0",
    ...style,
  };

  const captionStyle: CSSProperties = {
    marginTop: "var(--pt-space-sm)",
    fontSize: "0.9rem",
    color: "var(--pt-color-text-muted)",
  };

  return (
    <figure className={`pt-figure ${className}`} style={figureStyle}>
      {children}
      {caption && (
        <figcaption className="pt-figure-caption" style={captionStyle}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

export default Figure;
