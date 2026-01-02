/**
 * Practical Typography Components
 *
 * A React component library following the principles from
 * https://practicaltypography.com by Matthew Butterick
 */

// Article
export { Article, ArticleHeader, ArticleContent } from './Article';
export type { ArticleProps, ArticleHeaderProps, ArticleContentProps } from './Article';

// Aside
export { Aside } from './Aside';
export type { AsideProps } from './Aside';

// Blockquote
export { Blockquote } from './Blockquote';
export type { BlockquoteProps } from './Blockquote';

// Caps
export { SmallCaps, Abbr } from './Caps';
export type { SmallCapsProps, AbbrProps } from './Caps';

// CodeEditorBlock
export { CodeEditorBlock, InlineCode } from './CodeEditorBlock';
export type { CodeEditorBlockProps, InlineCodeProps } from './CodeEditorBlock';

// Figure
export { Figure } from './Figure';
export type { FigureProps } from './Figure';

// Heading
export { Heading } from './Heading';
export type { HeadingProps } from './Heading';

// List
export { List, ListItem } from './List';
export type { ListProps, ListItemProps } from './List';

// Paragraph
export { Paragraph } from './Paragraph';
export type { ParagraphProps } from './Paragraph';

// Rule
export { Rule } from './Rule';
export type { RuleProps } from './Rule';

// Styles
export { PT_TOKENS, PT_CSS_VARS, ptStyle } from './styles';
export type { PTTokens } from './styles';

// Table
export { Table, TableHead, TableBody, TableRow, TableCell } from './Table';
export type {
  TableProps,
  TableHeadProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
} from './Table';
