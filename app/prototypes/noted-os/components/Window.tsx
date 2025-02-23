"use client";

import { useState, useRef, useEffect } from 'react';
import styles from '../styles.module.css';

interface WindowProps {
  data: {
    id: string;
    title: string;
    position: { x: number; y: number };
    size: { width: number; height: number };
    isMinimized: boolean;
    isMaximized: boolean;
  };
  children: React.ReactNode;
  onMove: (id: string, x: number, y: number) => void;
  onClose: () => void;
  onMinimize: () => void;
  onMaximize: () => void;
}

export function Window({ data, children, onMove, onClose, onMinimize, onMaximize }: WindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  const previousPosition = useRef(data.position);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      
      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);
      
      // Only update if position has changed
      if (newX !== previousPosition.current.x || newY !== previousPosition.current.y) {
        previousPosition.current = { x: newX, y: newY };
        onMove(data.id, newX, newY);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    // Handle cases where mouse moves outside window
    const handleBlur = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isDragging, dragOffset, data.id, onMove]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!windowRef.current || e.button !== 0) return; // Only handle left click
    
    const rect = windowRef.current.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    
    // Prevent text selection while dragging
    e.preventDefault();
  };

  if (data.isMinimized) {
    return null;
  }

  const style: React.CSSProperties = {
    transform: `translate(${data.position.x}px, ${data.position.y}px)`,
    width: data.isMaximized ? '100%' : data.size.width,
    height: data.isMaximized ? '100%' : data.size.height,
    top: data.isMaximized ? 0 : undefined,
    left: data.isMaximized ? 0 : undefined,
    zIndex: isDragging ? 1000 : 1
  };

  return (
    <div 
      ref={windowRef} 
      className={styles.window} 
      style={style}
      onMouseDown={(e) => {
        // Bring window to front on click
        if (e.currentTarget === e.target) {
          e.currentTarget.style.zIndex = '1000';
        }
      }}
    >
      <div 
        className={styles.windowHeader} 
        onMouseDown={handleMouseDown}
        onDoubleClick={onMaximize}
      >
        <div className={styles.windowControls}>
          <button
            className={`${styles.windowControl} ${styles.closeButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            title="Close"
          />
          <button
            className={`${styles.windowControl} ${styles.minimizeButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onMinimize();
            }}
            title="Minimize"
          />
          <button
            className={`${styles.windowControl} ${styles.maximizeButton}`}
            onClick={(e) => {
              e.stopPropagation();
              onMaximize();
            }}
            title="Maximize"
          />
        </div>
        <div className={styles.windowTitle}>{data.title}</div>
      </div>
      <div className={styles.windowContent}>
        {children}
      </div>
    </div>
  );
} 