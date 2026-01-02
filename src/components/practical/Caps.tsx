import type { CSSProperties, ReactNode } from 'react';

export interface SmallCapsProps {
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

export interface AbbrProps {
  children: ReactNode;
  /** Full expansion for tooltip */
  title?: string;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Small caps following Practical Typography principles
 *
 * - Requires letterspacing (0.05em)
 * - Use for acronyms and initialisms
 */
export function SmallCaps({ children, className = '', style }: SmallCapsProps) {
  const capsStyle: CSSProperties = {
    fontVariant: 'small-caps',
    textTransform: 'lowercase',
    letterSpacing: '0.05em',
    ...style,
  };

  return (
    <span className={`pt-small-caps ${className}`} style={capsStyle}>
      {children}
    </span>
  );
}

/**
 * Abbreviation component with small caps styling
 */
export function Abbr({ children, title, className = '', style }: AbbrProps) {
  const abbrStyle: CSSProperties = {
    fontVariant: 'small-caps',
    textTransform: 'lowercase',
    letterSpacing: '0.05em',
    cursor: title ? 'help' : 'default',
    textDecoration: 'none',
    ...style,
  };

  return (
    <abbr className={`pt-abbr ${className}`} title={title} style={abbrStyle}>
      {children}
    </abbr>
  );
}
