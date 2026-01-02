import type { CSSProperties, ReactNode } from 'react';

export interface ListProps {
  children: ReactNode;
  /** List type: unordered or ordered */
  type?: 'unordered' | 'ordered';
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

export interface ListItemProps {
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * List component following Practical Typography principles
 *
 * - Automated lists, not manual
 * - Arrow bullets for unordered lists (PT style)
 * - Circled numbers for ordered lists
 * - Proper indentation and spacing
 */
export function List({ children, type = 'unordered', className = '', style }: ListProps) {
  const Tag = type === 'ordered' ? 'ol' : 'ul';

  const listStyle: CSSProperties = {
    margin: 'var(--pt-space-md) 0',
    paddingLeft: type === 'ordered' ? '2.5em' : '1.5em',
    listStyleType: 'none',
    counterReset: type === 'ordered' ? 'pt-list-counter' : undefined,
    ...style,
  };

  return (
    <>
      <Tag className={`pt-list pt-list-${type} ${className}`} style={listStyle}>
        {children}
      </Tag>
      <style>{`
        .pt-list-unordered .pt-list-item {
          position: relative;
        }
        .pt-list-unordered .pt-list-item::before {
          content: "\\2192";
          position: absolute;
          left: -1.5em;
          color: var(--pt-color-text-muted);
        }
        .pt-list-ordered .pt-list-item {
          position: relative;
          counter-increment: pt-list-counter;
        }
        .pt-list-ordered .pt-list-item::before {
          content: counter(pt-list-counter);
          position: absolute;
          left: -2.2em;
          top: 0.1em;
          width: 1.4em;
          height: 1.4em;
          border: 1.5px solid var(--pt-color-text-muted);
          border-radius: 50%;
          font-size: 0.75em;
          line-height: 1.35em;
          text-align: center;
          color: var(--pt-color-text-muted);
          font-family: var(--pt-font-sans);
          font-weight: 400;
        }
      `}</style>
    </>
  );
}

export function ListItem({ children, className = '', style }: ListItemProps) {
  const itemStyle: CSSProperties = {
    marginBottom: 'var(--pt-space-sm)',
    paddingLeft: 0,
    lineHeight: 'var(--pt-line-height)',
    ...style,
  };

  return (
    <li className={`pt-list-item ${className}`} style={itemStyle}>
      {children}
    </li>
  );
}

export default List;
