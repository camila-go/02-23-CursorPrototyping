"use client";

import { useEffect, useState } from 'react';
import styles from './styles.module.css';

const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const OCTAVE = 4;

export default function DigitalPiano() {
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [activeNotes, setActiveNotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const playNote = (note: string) => {
    if (!audioContext) return;

    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    // Calculate frequency using equal temperament
    const noteIndex = NOTES.indexOf(note.replace(/\d/, ''));
    const octave = parseInt(note.slice(-1));
    const frequency = 440 * Math.pow(2, (noteIndex - 9 + (octave - OCTAVE) * 12) / 12);
    
    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.5, audioContext.currentTime);
    
    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
    oscillator.stop(audioContext.currentTime + 1);

    setActiveNotes(prev => new Set([...prev, note]));
    setTimeout(() => {
      setActiveNotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(note);
        return newSet;
      });
    }, 200);
  };

  return (
    <div className={styles.container}>
      <div className={styles.pianoWrapper}>
        <h1 className={styles.title}>Lisa Frank Digital Piano</h1>
        <div className={styles.keyboard}>
          {NOTES.map((note) => {
            const isSharp = note.includes('#');
            const fullNote = `${note}${OCTAVE}`;
            return (
              <button
                key={fullNote}
                className={`${styles.key} ${isSharp ? styles.black : styles.white} ${
                  activeNotes.has(fullNote) ? styles.active : ''
                }`}
                onClick={() => playNote(fullNote)}
                onMouseDown={() => playNote(fullNote)}
                data-note={note}
              >
                <span className={styles.noteLabel}>{note}</span>
              </button>
            );
          })}
        </div>
        <div className={styles.decorations}>
          <div className={styles.star1} />
          <div className={styles.star2} />
          <div className={styles.heart1} />
          <div className={styles.heart2} />
          <div className={styles.rainbow} />
        </div>
      </div>
    </div>
  );
} 