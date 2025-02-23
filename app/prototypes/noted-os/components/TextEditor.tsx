"use client";

import { useEffect, useRef, useState } from 'react';
import styles from '../styles.module.css';

interface TextEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export function TextEditor({ content, onChange }: TextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!editorRef.current || isInitialized) return;

    const editor = editorRef.current;
    editor.innerHTML = content;
    setIsInitialized(true);

    const handleInput = () => {
      onChange(editor.innerHTML);
    };

    editor.addEventListener('input', handleInput);

    return () => {
      editor.removeEventListener('input', handleInput);
    };
  }, [content, onChange, isInitialized]);

  const handleFormat = (tag: string) => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const element = document.createElement(tag);
    
    try {
      range.surroundContents(element);
      onChange(editorRef.current.innerHTML);
    } catch (e) {
      console.warn('Could not format selection:', e);
    }
  };

  const handleList = (type: 'ul' | 'ol') => {
    if (!editorRef.current) return;
    
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const list = document.createElement(type);
    const item = document.createElement('li');
    
    try {
      item.appendChild(range.extractContents());
      list.appendChild(item);
      range.insertNode(list);
      onChange(editorRef.current.innerHTML);
    } catch (e) {
      console.warn('Could not create list:', e);
    }
  };

  return (
    <div className={styles.editorContainer}>
      <div className={styles.editorToolbar}>
        <button
          className={styles.canvasButton}
          onClick={() => handleFormat('strong')}
          title="Bold"
        >
          B
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => handleFormat('em')}
          title="Italic"
        >
          I
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => handleFormat('u')}
          title="Underline"
        >
          U
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => handleList('ul')}
          title="Bullet List"
        >
          •
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => handleList('ol')}
          title="Numbered List"
        >
          1.
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => handleFormat('h1')}
          title="Heading 1"
        >
          H1
        </button>
        <button
          className={styles.canvasButton}
          onClick={() => handleFormat('h2')}
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
          const selection = window.getSelection();
          if (!selection || !selection.rangeCount) return;
          
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(text));
          
          if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
          }
        }}
      />
    </div>
  );
} 