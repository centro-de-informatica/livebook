import type { CSSProperties, ReactNode } from 'react';
import { CodeEditor } from '../codemirror-wrapper';
import type { CodeEditorProps } from '../codemirror-wrapper';

export interface InlineCodeProps {
  children: ReactNode;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Inline code following Practical Typography principles
 *
 * - Monospaced font
 * - Reduced size (0.88em)
 * - Subtle background
 */
export function InlineCode({ children, className = '', style }: InlineCodeProps) {
  const codeStyle: CSSProperties = {
    fontFamily: 'var(--pt-font-mono)',
    fontSize: '0.88em',
    backgroundColor: 'var(--pt-color-code-bg)',
    padding: '0.1em 0.35em',
    borderRadius: '2px',
    ...style,
  };

  return (
    <code className={`pt-code ${className}`} style={codeStyle}>
      {children}
    </code>
  );
}

export interface CodeEditorBlockProps extends Omit<CodeEditorProps, 'style' | 'className'> {
  /** Expand beyond main content to full width (aside + main + aside) on large screens */
  wide?: boolean;
  /** Additional className */
  className?: string;
  /** Inline style override */
  style?: CSSProperties;
}

/**
 * Code editor block following Practical Typography proportions
 *
 * - Left border like blockquotes (when not wide)
 * - Proper spacing
 * - Wide mode for full-width layouts
 */
export function CodeEditorBlock({
  wide = false,
  className = '',
  style,
  height = '400px',
  ...editorProps
}: CodeEditorBlockProps) {
  const baseStyle: CSSProperties = {
    marginTop: 'var(--pt-space-lg)',
    marginBottom: 'var(--pt-space-lg)',
    marginLeft: wide ? 0 : '2em',
    overflow: 'hidden',
    lineHeight: 1.45,
    ...style,
  };

  const wideClass = wide ? 'pt-code-editor-block--wide' : '';

  return (
    <>
      {wide && (
        <style>{`
          .pt-code-editor-block--wide {
            position: relative;
          }
          @media (min-width: 75em) {
            .pt-code-editor-block--wide {
              --wide-extra: calc(var(--pt-aside-width, 10rem) + var(--pt-aside-gap, 1.5rem));
              --wide-width: calc(100% + var(--wide-extra) * 2);
              width: var(--wide-width) !important;
              margin-left: calc(-1 * var(--wide-extra)) !important;
              margin-right: calc(-1 * var(--wide-extra)) !important;
              max-width: calc(100vw - 2rem);
              box-sizing: border-box;
              border-radius: 3px;
            }
          }
        `}</style>
      )}
      <div className={`pt-code-editor-block ${wideClass} ${className}`.trim()} style={baseStyle}>
        <CodeEditor height={height} {...editorProps} />
      </div>
    </>
  );
}

export default CodeEditorBlock;
