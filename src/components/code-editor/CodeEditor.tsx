import { useEffect, useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine, highlightActiveLineGutter, highlightSpecialChars, drawSelection, dropCursor, rectangularSelection, crosshairCursor, placeholder as placeholderExt } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import type { Extension } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { bracketMatching, indentOnInput, syntaxHighlighting, defaultHighlightStyle, foldGutter, foldKeymap, HighlightStyle } from '@codemirror/language';
import { closeBrackets, closeBracketsKeymap, autocompletion, completionKeymap } from '@codemirror/autocomplete';
import { searchKeymap, highlightSelectionMatches } from '@codemirror/search';
import { lintKeymap } from '@codemirror/lint';
import { oneDark } from '@codemirror/theme-one-dark';
import { tags } from '@lezer/highlight';

// Language imports
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';

export type SupportedLanguage = 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'python' | 'html' | 'css' | 'json' | 'markdown' | 'plaintext';

export type ThemeType = 'light' | 'dark' | 'oneDark';

export interface CodeEditorProps {
  /** Initial content of the editor */
  initialValue?: string;
  /** Language mode for syntax highlighting */
  language?: SupportedLanguage;
  /** Theme: 'light', 'dark', or 'oneDark' */
  theme?: ThemeType;
  /** Show line numbers gutter */
  lineNumbers?: boolean;
  /** Enable bracket auto-closing */
  closeBrackets?: boolean;
  /** Enable undo/redo history */
  history?: boolean;
  /** Enable bracket matching highlighting */
  bracketMatching?: boolean;
  /** Enable autocompletion */
  autocompletion?: boolean;
  /** Enable code folding */
  foldGutter?: boolean;
  /** Enable search functionality */
  search?: boolean;
  /** Enable highlight selection matches */
  highlightSelectionMatches?: boolean;
  /** Enable active line highlighting */
  highlightActiveLine?: boolean;
  /** Enable tab key for indentation */
  indentWithTab?: boolean;
  /** Make editor read-only */
  readOnly?: boolean;
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Custom CSS class for the container */
  className?: string;
  /** Custom inline styles for the container */
  style?: React.CSSProperties;
  /** Callback when content changes */
  onChange?: (value: string) => void;
  /** Callback when editor is ready */
  onReady?: (view: EditorView) => void;
  /** Additional CodeMirror extensions */
  extensions?: Extension[];
  /** Tab size in spaces */
  tabSize?: number;
  /** Editor height (CSS value) */
  height?: string;
  /** Editor min-height (CSS value) */
  minHeight?: string;
  /** Editor max-height (CSS value) */
  maxHeight?: string;
  /** Enable line wrapping */
  lineWrapping?: boolean;
}

export interface CodeEditorRef {
  /** Get the EditorView instance */
  getView: () => EditorView | null;
  /** Get current editor content */
  getValue: () => string;
  /** Set editor content */
  setValue: (value: string) => void;
  /** Focus the editor */
  focus: () => void;
  /** Get current selection */
  getSelection: () => string;
  /** Insert text at cursor position */
  insertText: (text: string) => void;
  /** Set language mode */
  setLanguage: (language: SupportedLanguage) => void;
  /** Set theme */
  setTheme: (theme: ThemeType) => void;
}

function getLanguageExtension(language: SupportedLanguage): Extension {
  switch (language) {
    case 'javascript':
      return javascript();
    case 'typescript':
      return javascript({ typescript: true });
    case 'jsx':
      return javascript({ jsx: true });
    case 'tsx':
      return javascript({ jsx: true, typescript: true });
    case 'python':
      return python();
    case 'html':
      return html();
    case 'css':
      return css();
    case 'json':
      return json();
    case 'markdown':
      return markdown();
    case 'plaintext':
    default:
      return [];
  }
}

function createLightTheme(): Extension {
  return EditorView.theme({
    '&': {
      backgroundColor: '#ffffff',
      color: '#24292e',
    },
    '.cm-content': {
      caretColor: '#24292e',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#24292e',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#c8c8fa',
    },
    '.cm-gutters': {
      backgroundColor: '#f6f8fa',
      color: '#6a737d',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#e8e8e8',
    },
    '.cm-activeLine': {
      backgroundColor: '#f6f8fa',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: '#e1e4e8',
      border: 'none',
      color: '#6a737d',
    },
  }, { dark: false });
}

function createDarkTheme(): Extension {
  return EditorView.theme({
    '&': {
      backgroundColor: '#1e1e1e',
      color: '#d4d4d4',
    },
    '.cm-content': {
      caretColor: '#aeafad',
    },
    '.cm-cursor, .cm-dropCursor': {
      borderLeftColor: '#aeafad',
    },
    '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
      backgroundColor: '#264f78',
    },
    '.cm-gutters': {
      backgroundColor: '#1e1e1e',
      color: '#858585',
      border: 'none',
    },
    '.cm-activeLineGutter': {
      backgroundColor: '#2a2d2e',
    },
    '.cm-activeLine': {
      backgroundColor: '#2a2d2e',
    },
    '.cm-foldPlaceholder': {
      backgroundColor: '#3c3c3c',
      border: 'none',
      color: '#858585',
    },
  }, { dark: true });
}

function getThemeExtension(theme: ThemeType): Extension[] {
  switch (theme) {
    case 'oneDark':
      return [oneDark];
    case 'dark':
      return [createDarkTheme(), syntaxHighlighting(defaultHighlightStyle, { fallback: true })];
    case 'light':
    default:
      return [createLightTheme(), syntaxHighlighting(defaultHighlightStyle, { fallback: true })];
  }
}

const CodeEditor = forwardRef<CodeEditorRef, CodeEditorProps>(function CodeEditor(props, ref) {
  const {
    initialValue = '',
    language = 'plaintext',
    theme = 'light',
    lineNumbers: showLineNumbers = true,
    closeBrackets: enableCloseBrackets = true,
    history: enableHistory = true,
    bracketMatching: enableBracketMatching = true,
    autocompletion: enableAutocompletion = true,
    foldGutter: enableFoldGutter = true,
    search: enableSearch = true,
    highlightSelectionMatches: enableHighlightSelectionMatches = true,
    highlightActiveLine: enableHighlightActiveLine = true,
    indentWithTab: enableIndentWithTab = true,
    readOnly = false,
    placeholder,
    className,
    style,
    onChange,
    onReady,
    extensions: customExtensions = [],
    tabSize = 2,
    height,
    minHeight,
    maxHeight,
    lineWrapping = false,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const languageCompartment = useRef(new Compartment());
  const themeCompartment = useRef(new Compartment());
  const onChangeRef = useRef(onChange);

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Build extensions array
  const buildExtensions = useCallback((): Extension[] => {
    const exts: Extension[] = [];

    // Core features
    exts.push(highlightSpecialChars());
    exts.push(drawSelection());
    exts.push(dropCursor());
    exts.push(rectangularSelection());
    exts.push(crosshairCursor());
    exts.push(indentOnInput());

    // Optional features (opt-in via props)
    if (showLineNumbers) {
      exts.push(lineNumbers());
      if (enableHighlightActiveLine) {
        exts.push(highlightActiveLineGutter());
      }
    }

    if (enableHistory) {
      exts.push(history());
      exts.push(keymap.of(historyKeymap));
    }

    if (enableCloseBrackets) {
      exts.push(closeBrackets());
      exts.push(keymap.of(closeBracketsKeymap));
    }

    if (enableBracketMatching) {
      exts.push(bracketMatching());
    }

    if (enableAutocompletion) {
      exts.push(autocompletion());
      exts.push(keymap.of(completionKeymap));
    }

    if (enableFoldGutter) {
      exts.push(foldGutter());
      exts.push(keymap.of(foldKeymap));
    }

    if (enableSearch) {
      exts.push(keymap.of(searchKeymap));
    }

    if (enableHighlightSelectionMatches) {
      exts.push(highlightSelectionMatches());
    }

    if (enableHighlightActiveLine) {
      exts.push(highlightActiveLine());
    }

    if (enableIndentWithTab) {
      exts.push(keymap.of([indentWithTab]));
    }

    if (placeholder) {
      exts.push(placeholderExt(placeholder));
    }

    if (lineWrapping) {
      exts.push(EditorView.lineWrapping);
    }

    // Tab size
    exts.push(EditorState.tabSize.of(tabSize));

    // Read-only mode
    exts.push(EditorState.readOnly.of(readOnly));

    // Default keymap
    exts.push(keymap.of([...defaultKeymap, ...lintKeymap]));

    // Language (compartmentalized for dynamic updates)
    exts.push(languageCompartment.current.of(getLanguageExtension(language)));

    // Theme (compartmentalized for dynamic updates)
    exts.push(themeCompartment.current.of(getThemeExtension(theme)));

    // Change listener
    exts.push(EditorView.updateListener.of((update) => {
      if (update.docChanged && onChangeRef.current) {
        onChangeRef.current(update.state.doc.toString());
      }
    }));

    // Custom height/sizing
    const editorStyles: Record<string, string> = {};
    const scrollerStyles: Record<string, string> = {};
    
    if (height) {
      editorStyles.height = height;
      scrollerStyles.overflow = 'auto';
    }
    if (minHeight) {
      editorStyles.minHeight = minHeight;
    }
    if (maxHeight) {
      editorStyles.maxHeight = maxHeight;
      scrollerStyles.overflow = 'auto';
    }

    if (Object.keys(editorStyles).length > 0 || Object.keys(scrollerStyles).length > 0) {
      exts.push(EditorView.theme({
        '&': editorStyles,
        '.cm-scroller': scrollerStyles,
      }));
    }

    // Custom extensions from props
    exts.push(...customExtensions);

    return exts;
  }, [
    showLineNumbers,
    enableHistory,
    enableCloseBrackets,
    enableBracketMatching,
    enableAutocompletion,
    enableFoldGutter,
    enableSearch,
    enableHighlightSelectionMatches,
    enableHighlightActiveLine,
    enableIndentWithTab,
    readOnly,
    placeholder,
    lineWrapping,
    tabSize,
    language,
    theme,
    customExtensions,
    height,
    minHeight,
    maxHeight,
  ]);

  // Initialize editor
  useEffect(() => {
    if (!containerRef.current) return;

    const state = EditorState.create({
      doc: initialValue,
      extensions: buildExtensions(),
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    if (onReady) {
      onReady(view);
    }

    // Cleanup
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Only run on mount/unmount - use compartments for dynamic updates
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update language dynamically
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: languageCompartment.current.reconfigure(getLanguageExtension(language)),
      });
    }
  }, [language]);

  // Update theme dynamically
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.dispatch({
        effects: themeCompartment.current.reconfigure(getThemeExtension(theme)),
      });
    }
  }, [theme]);

  // Expose imperative handle
  useImperativeHandle(ref, () => ({
    getView: () => viewRef.current,
    getValue: () => viewRef.current?.state.doc.toString() ?? '',
    setValue: (value: string) => {
      if (viewRef.current) {
        viewRef.current.dispatch({
          changes: {
            from: 0,
            to: viewRef.current.state.doc.length,
            insert: value,
          },
        });
      }
    },
    focus: () => viewRef.current?.focus(),
    getSelection: () => {
      if (!viewRef.current) return '';
      const { from, to } = viewRef.current.state.selection.main;
      return viewRef.current.state.sliceDoc(from, to);
    },
    insertText: (text: string) => {
      if (viewRef.current) {
        const { from } = viewRef.current.state.selection.main;
        viewRef.current.dispatch({
          changes: { from, insert: text },
        });
      }
    },
    setLanguage: (newLanguage: SupportedLanguage) => {
      if (viewRef.current) {
        viewRef.current.dispatch({
          effects: languageCompartment.current.reconfigure(getLanguageExtension(newLanguage)),
        });
      }
    },
    setTheme: (newTheme: ThemeType) => {
      if (viewRef.current) {
        viewRef.current.dispatch({
          effects: themeCompartment.current.reconfigure(getThemeExtension(newTheme)),
        });
      }
    },
  }), []);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        border: '1px solid #e1e4e8',
        borderRadius: '4px',
        overflow: 'hidden',
        ...style,
      }}
    />
  );
});

export default CodeEditor;
