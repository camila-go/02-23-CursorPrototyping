"use client";

import { useEffect, useRef, useState } from 'react';
import styles from '../styles.module.css';

interface DrawingCanvasProps {
  content: string;
  onChange: (content: string) => void;
}

interface DrawingState {
  isDrawing: boolean;
  lastX: number;
  lastY: number;
}

export function DrawingCanvas({ content, onChange }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    isDrawing: false,
    lastX: 0,
    lastY: 0,
  });
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(2);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (!container) return;
      
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight - 40; // Account for toolbar height
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load saved content if any
    if (content) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = content;
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [content]);

  const saveState = () => {
    if (!canvasRef.current) return;
    const newState = canvasRef.current.toDataURL();
    setHistory(prev => [...prev.slice(0, historyIndex + 1), newState]);
    setHistoryIndex(prev => prev + 1);
    onChange(newState);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    setDrawingState({
      isDrawing: true,
      lastX: e.clientX - rect.left,
      lastY: e.clientY - rect.top,
    });
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(drawingState.lastX, drawingState.lastY);
    ctx.lineTo(x, y);
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.stroke();

    setDrawingState(prev => ({
      ...prev,
      lastX: x,
      lastY: y,
    }));
  };

  const stopDrawing = () => {
    if (drawingState.isDrawing) {
      setDrawingState(prev => ({ ...prev, isDrawing: false }));
      saveState();
    }
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
      onChange(history[newIndex]);
    };
    img.src = history[newIndex];
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      if (!canvasRef.current) return;
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      ctx.drawImage(img, 0, 0);
      onChange(history[newIndex]);
    };
    img.src = history[newIndex];
  };

  const clear = () => {
    if (!canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveState();
  };

  return (
    <div className={styles.canvasContainer}>
      <div className={styles.canvasToolbar}>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
          title="Color"
          className={styles.canvasButton}
        />
        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={(e) => setLineWidth(Number(e.target.value))}
          title="Line Width"
          className={styles.canvasButton}
        />
        <button
          className={styles.canvasButton}
          onClick={undo}
          disabled={historyIndex <= 0}
          title="Undo"
        >
          Undo
        </button>
        <button
          className={styles.canvasButton}
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          title="Redo"
        >
          Redo
        </button>
        <button
          className={styles.canvasButton}
          onClick={clear}
          title="Clear"
        >
          Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
    </div>
  );
} 