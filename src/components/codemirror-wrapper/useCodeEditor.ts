import { useRef, useCallback, useEffect } from 'react';
import { EditorView } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import type { Extension } from '@codemirror/state';

export interface UseCodeEditorOptions {
  /** Initial document content */
  initialValue?: string;
  /** Extensions to configure the editor */
  extensions?: Extension[];
  /** Callback when content changes */
  onChange?: (value: string) => void;
}

export interface UseCodeEditorReturn {
  /** Ref to attach to the container element */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** Get the EditorView instance */
  getView: () => EditorView | null;
  /** Get current editor content */
  getValue: () => string;
  /** Set editor content */
  setValue: (value: string) => void;
  /** Focus the editor */
  focus: () => void;
  /** Check if editor is focused */
  hasFocus: () => boolean;
  /** Get current selection text */
  getSelection: () => string;
  /** Insert text at cursor position */
  insertText: (text: string) => void;
  /** Replace current selection with text */
  replaceSelection: (text: string) => void;
  /** Get cursor position */
  getCursorPosition: () => number;
  /** Set cursor position */
  setCursorPosition: (pos: number) => void;
  /** Dispatch effects to reconfigure extensions */
  reconfigure: (effects: Parameters<EditorView['dispatch']>[0]['effects']) => void;
}

/**
 * Custom hook for managing CodeMirror EditorView lifecycle.
 * Abstracts creation, destruction, and provides utility functions.
 */
export function useCodeEditor(options: UseCodeEditorOptions = {}): UseCodeEditorReturn {
  const { initialValue = '', extensions = [], onChange } = options;

  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);

  // Keep onChange ref updated
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Initialize and cleanup EditorView
  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of((update) => {
      if (update.docChanged && onChangeRef.current) {
        onChangeRef.current(update.state.doc.toString());
      }
    });

    const state = EditorState.create({
      doc: initialValue,
      extensions: [...extensions, updateListener],
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Extensions array reference may change, but we only want to run on mount
    // Dynamic extension updates should use reconfigure
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getView = useCallback(() => viewRef.current, []);

  const getValue = useCallback(() => {
    return viewRef.current?.state.doc.toString() ?? '';
  }, []);

  const setValue = useCallback((value: string) => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({
      changes: {
        from: 0,
        to: view.state.doc.length,
        insert: value,
      },
    });
  }, []);

  const focus = useCallback(() => {
    viewRef.current?.focus();
  }, []);

  const hasFocus = useCallback(() => {
    return viewRef.current?.hasFocus ?? false;
  }, []);

  const getSelection = useCallback(() => {
    const view = viewRef.current;
    if (!view) return '';

    const { from, to } = view.state.selection.main;
    return view.state.sliceDoc(from, to);
  }, []);

  const insertText = useCallback((text: string) => {
    const view = viewRef.current;
    if (!view) return;

    const { from } = view.state.selection.main;
    view.dispatch({
      changes: { from, insert: text },
    });
  }, []);

  const replaceSelection = useCallback((text: string) => {
    const view = viewRef.current;
    if (!view) return;

    const { from, to } = view.state.selection.main;
    view.dispatch({
      changes: { from, to, insert: text },
    });
  }, []);

  const getCursorPosition = useCallback(() => {
    return viewRef.current?.state.selection.main.head ?? 0;
  }, []);

  const setCursorPosition = useCallback((pos: number) => {
    const view = viewRef.current;
    if (!view) return;

    const clampedPos = Math.max(0, Math.min(pos, view.state.doc.length));
    view.dispatch({
      selection: { anchor: clampedPos },
    });
  }, []);

  const reconfigure = useCallback((effects: Parameters<EditorView['dispatch']>[0]['effects']) => {
    const view = viewRef.current;
    if (!view) return;

    view.dispatch({ effects });
  }, []);

  return {
    containerRef,
    getView,
    getValue,
    setValue,
    focus,
    hasFocus,
    getSelection,
    insertText,
    replaceSelection,
    getCursorPosition,
    setCursorPosition,
    reconfigure,
  };
}

export default useCodeEditor;
