import type { CSSProperties, ReactNode } from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export interface HeadingProps {
  level: HeadingLevel;
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
  /** ID for anchor links */
  id?: string;
}

const HEADING_STYLES: Record<HeadingLevel, CSSProperties> = {
  1: {
    fontSize: '1.5rem',
    marginTop: 0,
    letterSpacing: '-0.01em',
  },
  2: {
    fontSize: '1.1rem',
    marginTop: 'var(--pt-space-xl)',
    fontWeight: 700,
  },
  3: {
    fontSize: '1rem',
    marginTop: 'var(--pt-space-lg)',
    fontWeight: 700,
  },
  4: {
    fontSize: '0.95rem',
    marginTop: 'var(--pt-space-lg)',
    fontWeight: 700,
  },
  5: {
    fontSize: '0.9rem',
    fontWeight: 700,
    marginTop: 'var(--pt-space-md)',
  },
  6: {
    fontSize: '0.85rem',
    fontWeight: 700,
    marginTop: 'var(--pt-space-md)',
  },
};

/**
 * Heading component following Practical Typography principles
 *
 * - Sans-serif font for contrast with body serif
 * - Space above > space below (heading relates to following text)
 * - Keep with next paragraph (break-after: avoid)
 * - Bold weight for emphasis
 */
export function Heading({ level, children, className = '', style, id }: HeadingProps) {
  const Tag = `h${level}` as const;

  const baseStyle: CSSProperties = {
    fontFamily: 'var(--pt-font-sans)',
    fontWeight: 700,
    lineHeight: 'var(--pt-line-height-tight)',
    marginBottom: 'var(--pt-space-sm)',
    color: 'var(--pt-color-text)',
    breakAfter: 'avoid',
  };

  const combinedStyle: CSSProperties = {
    ...baseStyle,
    ...HEADING_STYLES[level],
    ...style,
  };

  return (
    <Tag id={id} className={`pt-heading pt-h${level} ${className}`} style={combinedStyle}>
      {children}
    </Tag>
  );
}

export default Heading;
