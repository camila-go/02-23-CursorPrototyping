"use client";

import { useEffect, useRef } from 'react';
import styles from '../styles.module.css';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TextEditor({ content, onChange }: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const editor = editorRef.current;
    editor.innerHTML = content;

    const handleInput = () => {
      onChange(editor.innerHTML);
    };

    editor.addEventListener('input', handleInput);

    return () => {
      editor.removeEventListener('input', handleInput);
    };
  }, [content, onChange]);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value || '');
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorToolbar}>
        <button
          className={styles.canvasButton}
          onClick={() => execCommand('bold')}
          title="Bold"
        >
          B
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => execCommand('italic')}
          title="Italic"
        >
          I
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => execCommand('underline')}
          title="Underline"
        >
          U
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        >
          •
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        >
          1.
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => execCommand('formatBlock', 'h1')}
          title="Heading 1"
        >
          H1
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => execCommand('formatBlock', 'h2')}
          title="Heading 2"
        >
          H2
        </button>
      </div>
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        onPaste={(e) => {
          e.preventDefault();
          const text = e.clipboardData.getData('text/plain');
          document.execCommand('insertText', false, text);
        }}
      />
    </div>
  );
} 