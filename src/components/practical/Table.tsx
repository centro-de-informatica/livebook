import type { CSSProperties, ReactNode } from 'react';

export interface TableProps {
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

export interface TableHeadProps {
  children: ReactNode;
}

export interface TableBodyProps {
  children: ReactNode;
}

export interface TableRowProps {
  children: ReactNode;
}

export interface TableCellProps {
  children: ReactNode;
  /** Is this a header cell */
  header?: boolean;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Table components following Practical Typography principles
 *
 * - Clean, minimal borders (or none)
 * - Increased cell margins for legibility
 * - Default tables have two defects to fix: cell borders and cell margins
 */
export function Table({ children, className = '', style }: TableProps) {
  const tableStyle: CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
    margin: 'var(--pt-space-lg) 0',
    fontSize: '0.92rem',
    ...style,
  };

  return (
    <table className={`pt-table ${className}`} style={tableStyle}>
      {children}
    </table>
  );
}

export function TableHead({ children }: TableHeadProps) {
  return <thead className="pt-table-head">{children}</thead>;
}

export function TableBody({ children }: TableBodyProps) {
  return <tbody className="pt-table-body">{children}</tbody>;
}

export function TableRow({ children }: TableRowProps) {
  return <tr className="pt-table-row">{children}</tr>;
}

export function TableCell({ children, header = false, className = '', style }: TableCellProps) {
  const Tag = header ? 'th' : 'td';

  const cellStyle: CSSProperties = {
    padding: '0.4em 0.8em',
    textAlign: 'left',
    verticalAlign: 'top',
    borderBottom: header ? '1.5px solid var(--pt-color-text)' : 'none',
    fontWeight: header ? 600 : 'normal',
    fontFamily: header ? 'var(--pt-font-sans)' : 'inherit',
    ...style,
  };

  return (
    <Tag className={`pt-table-cell ${className}`} style={cellStyle}>
      {children}
    </Tag>
  );
}

export default Table;
