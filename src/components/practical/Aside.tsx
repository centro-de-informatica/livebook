import React, { type CSSProperties, type ReactNode } from "react";

export interface AsideProps {
  children: ReactNode;
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
  className = "",
  style,
}: AsideProps) {
  return (
    <>
      <style>{`
        .pt-aside {
          display: block;
          position: absolute;
          left: 2.5rem;
          width: var(--pt-aside-width, 7.5rem);
          text-align: right;
          margin-bottom: 1rem;
          font-variant-numeric: normal;
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
        @media all and (min-width: 1200px) {
          .pt-aside {
            left: 0;
            width: calc(var(--pt-aside-width, 7.5rem) + 2.5rem);
          }
        }
        @media all and (max-width: 520px) {
          .pt-aside {
            position: relative;
            left: 0;
            width: 100%;
            text-align: left;
            background: #fefefe;
            padding: 0.3rem 0.5rem;
            border: 1px solid var(--pt-color-border, #ccc);
            border-left: 3px solid var(--pt-color-border, #ccc);
            margin-bottom: 1em;
          }
        }
        @media (prefers-color-scheme: dark) {
          .pt-aside {
            background: transparent;
          }
          @media all and (max-width: 520px) {
            .pt-aside {
              background: #252520;
            }
          }
        }
      `}</style>
      <aside className={`pt-aside ${className}`.trim()} style={style}>
        {children}
      </aside>
    </>
  );
}

export default Aside;
