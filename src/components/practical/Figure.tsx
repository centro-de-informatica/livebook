import { type CSSProperties, type ReactNode } from 'react';

export interface FigureProps {
  children: ReactNode;
  /** Caption text */
  caption?: ReactNode;
  /** Expand beyond main content to full width (aside + main + aside) on large screens */
  wide?: boolean;
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
export function Figure({ children, caption, wide = false, className = '', style }: FigureProps) {
  const figureStyle: CSSProperties = {
    marginTop: 'var(--pt-space-xl)',
    marginBottom: 'var(--pt-space-xl)',
    ...style,
  };

  const captionStyle: CSSProperties = {
    marginTop: 'var(--pt-space-sm)',
    fontSize: '0.9rem',
    color: 'var(--pt-color-text-muted)',
  };

  const wideClass = wide ? 'pt-figure--wide' : '';

  return (
    <>
      {wide && (
        <style>{`
          .pt-figure--wide {
            position: relative;
          }
          .pt-figure--wide img,
          .pt-figure--wide video,
          .pt-figure--wide iframe {
            width: 100%;
            height: auto;
          }
          @media (min-width: 75em) {
            .pt-figure--wide {
              --wide-extra: calc(var(--pt-aside-width, 10rem) + var(--pt-aside-gap, 1.5rem));
              --wide-width: calc(100% + var(--wide-extra) * 2);
              width: var(--wide-width) !important;
              margin-left: calc(-1 * var(--wide-extra)) !important;
              margin-right: calc(-1 * var(--wide-extra)) !important;
              max-width: calc(100vw - 2rem);
              box-sizing: border-box;
            }
          }
        `}</style>
      )}
      <figure className={`pt-figure ${wideClass} ${className}`.trim()} style={figureStyle}>
        {children}
        {caption && (
          <figcaption className="pt-figure-caption" style={captionStyle}>
            {caption}
          </figcaption>
        )}
      </figure>
    </>
  );
}

export default Figure;
