"use client";

import styles from '../styles.module.css';

interface WindowToolbarProps {
  onNewText: () => void;
  onNewDrawing: () => void;
  gridEnabled: boolean;
  onToggleGrid: () => void;
}

export function WindowToolbar({ onNewText, onNewDrawing, gridEnabled, onToggleGrid }: WindowToolbarProps) {
  return (
    <div className={styles.toolbar}>
      <button
        className={styles.toolbarButton}
        onClick={onNewText}
        title="Create new text note"
      >
        New Note
      </button>
      <button
        className={styles.toolbarButton}
        onClick={onNewDrawing}
        title="Create new drawing"
      >
        New Drawing
      </button>
      <button
        className={`${styles.toolbarButton} ${gridEnabled ? styles.active : ''}`}
        onClick={onToggleGrid}
        title="Toggle grid snap"
      >
        {gridEnabled ? 'Grid: On' : 'Grid: Off'}
      </button>
    </div>
  );
} 