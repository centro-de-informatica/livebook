import React, { type CSSProperties, type ReactNode } from "react";

export interface AsideProps {
  children: ReactNode;
  /** Position of the aside: 'left' (default) or 'right' */
  position?: 'left' | 'right';
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Aside component following Practical Typography style
 *
 * - Positioned absolutely on the left side of main content
 * - Right-aligned text
 * - Used for supplementary information, notes, and references
 */
export function Aside({
  children,
  position = 'left',
  className = "",
  style,
}: AsideProps) {
  const positionClass = position === 'right' ? 'pt-aside--right' : 'pt-aside--left';
  
  return (
    <>
      <style>{`
        .pt-aside {
          display: block;
          position: absolute;
          width: var(--pt-aside-width, 7.5rem);
          margin-bottom: 1rem;
          font-variant-numeric: normal;
        }
        .pt-aside--left {
          left: calc(-1 * var(--pt-aside-width, 7.5rem) - var(--pt-aside-gap, 1.5rem));
          text-align: right;
        }
        .pt-aside--right {
          right: calc(-1 * var(--pt-aside-width, 7.5rem) - var(--pt-aside-gap, 1.5rem));
          text-align: left;
        }
        .pt-aside,
        .pt-aside p {
          font-family: var(--pt-font-sans);
          font-size: 0.83rem;
          line-height: 1.4;
          color: var(--pt-color-text-muted, #667);
          letter-spacing: 0.015em;
          hyphens: none;
          font-feature-settings: "liga";
        }
        .pt-aside p {
          margin-bottom: 0.5em;
        }
        .pt-aside p:last-child {
          margin-bottom: 0;
        }
        .pt-aside em,
        .pt-aside i {
          font-weight: 600;
          font-style: normal;
        }
        .pt-aside strong {
          font-weight: 600;
        }
        /* Medium screens and below: inline asides */
        @media (max-width: 74.99em) {
          .pt-aside {
            position: relative;
            left: auto;
            right: auto;
            width: 100%;
            text-align: left;
            background: var(--pt-color-background, #fffff8);
            padding: 0.5rem 0.75rem;
            border: 1px solid var(--pt-color-border, #ccc);
            margin-bottom: 1em;
            margin-top: 0.5em;
          }
          .pt-aside--left {
            border-left: 3px solid var(--pt-color-border, #ccc);
          }
          .pt-aside--right {
            border-right: 3px solid var(--pt-color-border, #ccc);
          }
        }
        @media (prefers-color-scheme: dark) {
          .pt-aside {
            background: transparent;
          }
          @media (max-width: 74.99em) {
            .pt-aside {
              background: var(--pt-color-code-bg, #252520);
            }
          }
        }
      `}</style>
      <aside className={`pt-aside ${positionClass} ${className}`.trim()} style={style}>
        {children}
      </aside>
    </>
  );
}

export default Aside;
