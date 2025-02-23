"use client";

import { useState, useEffect } from 'react';
import styles from './styles.module.css';
import { Window } from './components/Window';
import { TextEditor } from './components/TextEditor';
import { DrawingCanvas } from './components/DrawingCanvas';
import { WindowToolbar } from './components/WindowToolbar';

interface WindowData {
  id: string;
  type: 'text' | 'drawing';
  title: string;
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMinimized: boolean;
  isMaximized: boolean;
}

export default function NotedOS() {
  const [mounted, setMounted] = useState(false);
  const [windows, setWindows] = useState<WindowData[]>([]);
  const [gridEnabled, setGridEnabled] = useState(true);

  // Handle hydration and initial load
  useEffect(() => {
    setMounted(true);
    try {
      const savedWindows = localStorage.getItem('notedos-windows');
      if (savedWindows) {
        setWindows(JSON.parse(savedWindows));
      }
    } catch (error) {
      console.warn('Failed to load saved windows:', error);
    }
  }, []);

  // Save windows
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem('notedos-windows', JSON.stringify(windows));
    } catch (error) {
      console.warn('Failed to save windows:', error);
    }
  }, [mounted, windows]);

  const createNewWindow = (type: 'text' | 'drawing') => {
    const newWindow: WindowData = {
      id: Date.now().toString(),
      type,
      title: type === 'text' ? 'New Note' : 'New Drawing',
      content: '',
      position: { x: Math.random() * 200, y: Math.random() * 200 },
      size: { width: 400, height: 300 },
      isMinimized: false,
      isMaximized: false,
    };
    setWindows(prev => [...prev, newWindow]);
  };

  const updateWindowPosition = (id: string, x: number, y: number) => {
    setWindows(prev => prev.map(window => {
      if (window.id === id) {
        return {
          ...window,
          position: { 
            x: gridEnabled ? Math.round(x / 20) * 20 : x,
            y: gridEnabled ? Math.round(y / 20) * 20 : y
          }
        };
      }
      return window;
    }));
  };

  const updateWindowContent = (id: string, content: string) => {
    setWindows(prev => prev.map(window => {
      if (window.id === id) {
        const title = content.split('\n')[0].slice(0, 20) || window.title;
        return { ...window, content, title };
      }
      return window;
    }));
  };

  const toggleWindowState = (id: string, state: 'isMinimized' | 'isMaximized') => {
    setWindows(prev => prev.map(window => {
      if (window.id === id) {
        return { ...window, [state]: !window[state] };
      }
      return window;
    }));
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(window => window.id !== id));
  };

  // Don't render until hydration is complete
  if (!mounted) {
    return <div className={styles.container} />;
  }

  return (
    <div className={styles.container}>
      <WindowToolbar
        onNewText={() => createNewWindow('text')}
        onNewDrawing={() => createNewWindow('drawing')}
        gridEnabled={gridEnabled}
        onToggleGrid={() => setGridEnabled(!gridEnabled)}
      />
      <main className={styles.desktop}>
        {windows.map((window) => (
          <Window
            key={window.id}
            data={window}
            onMove={updateWindowPosition}
            onClose={() => closeWindow(window.id)}
            onMinimize={() => toggleWindowState(window.id, 'isMinimized')}
            onMaximize={() => toggleWindowState(window.id, 'isMaximized')}
          >
            {window.type === 'text' ? (
              <TextEditor
                content={window.content}
                onChange={(content) => updateWindowContent(window.id, content)}
              />
            ) : (
              <DrawingCanvas
                content={window.content}
                onChange={(content) => updateWindowContent(window.id, content)}
              />
            )}
          </Window>
        ))}
      </main>
    </div>
  );
} 