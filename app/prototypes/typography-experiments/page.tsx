"use client";

// Template for creating a new prototype
// To use this template:
// 1. Create a new folder in app/prototypes with your prototype name
// 2. Copy this file and styles.module.css into your new folder
// 3. Create an 'images' folder for your prototype's images
// 4. Rename and customize the component and styles as needed

import { useState, useEffect } from 'react';
import styles from './styles.module.css';

interface Sparkle {
  id: number;
  top: string;
  left: string;
  animationDuration: string;
  size: string;
}

export default function TypographyExperiments() {
  const [text, setText] = useState('Type something amazing here');
  const effects = ['circle', 'skewed', 'wavy', 'variable'];
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  useEffect(() => {
    const generateSparkles = () => {
      const newSparkles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        top: `${Math.random() * 100}%`,
        left: `${Math.random() * 100}%`,
        animationDuration: `${1 + Math.random() * 2}s`,
        size: `${5 + Math.random() * 10}px`
      }));
      setSparkles(newSparkles);
    };

    generateSparkles();
    const interval = setInterval(generateSparkles, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      {sparkles.map((sparkle) => (
        <div
          key={sparkle.id}
          className={styles.sparkle}
          style={{
            top: sparkle.top,
            left: sparkle.left,
            animationDuration: sparkle.animationDuration,
            width: sparkle.size,
            height: sparkle.size
          }}
        >
          ✨
        </div>
      ))}
      <main className={styles.main}>
        <input 
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className={styles.input}
          placeholder="Type your text here..."
        />
        
        <div className={styles.typographyContainer}>
          {text.split(' ').map((word, wordIndex) => {
            const effect = effects[wordIndex % effects.length];
            
            if (effect === 'circle') {
              return (
                <div 
                  key={`word-${wordIndex}`} 
                  className={`${styles.textEffect} ${styles.circleText}`} 
                  aria-label={word}
                >
                  {word.split('').map((char, i) => (
                    <span 
                      key={`circle-${i}`}
                      style={{ 
                        transform: `rotate(${i * (360 / word.length)}deg)` 
                      }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              );
            }

            if (effect === 'wavy') {
              return (
                <div 
                  key={`word-${wordIndex}`} 
                  className={`${styles.textEffect} ${styles.wavyText}`}
                >
                  {word.split('').map((char, i) => (
                    <span 
                      key={`wavy-${i}`} 
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              );
            }

            return (
              <div 
                key={`word-${wordIndex}`} 
                className={`${styles.textEffect} ${
                  effect === 'skewed' ? styles.skewedText : styles.variableText
                }`} 
                data-text={word}
              >
                {word}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
} 