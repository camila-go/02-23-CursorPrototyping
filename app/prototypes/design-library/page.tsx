'use client';

import React from 'react';
import Link from 'next/link';
import styles from './styles.module.css';
import { Button } from '../../components/button';

export default function DesignLibrary() {
  const [loading, setLoading] = React.useState(false);

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <Link href="/" className={styles.backLink}>← Back to prototypes</Link>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>Component library</h1>
        
        <section className={styles.section}>
          <h2>Buttons</h2>
          
          <div className={styles.subsection}>
            <h3>Variants</h3>
            <div className={styles.buttonGrid}>
              <Button>Primary button</Button>
              <Button variant="secondary">Secondary button</Button>
            </div>
          </div>

          <div className={styles.subsection}>
            <h3>States</h3>
            <div className={styles.buttonGrid}>
              <Button disabled>Disabled button</Button>
              <Button isLoading={loading} onClick={handleLoadingClick}>
                {loading ? 'Loading...' : 'Click to load'}
              </Button>
              <Button variant="secondary" disabled>Disabled secondary</Button>
            </div>
          </div>

          <div className={styles.subsection}>
            <h3>Usage examples</h3>
            <div className={styles.buttonGrid}>
              <Button onClick={() => alert('Clicked!')}>Interactive button</Button>
              <Button variant="secondary" onClick={() => alert('Clicked!')}>
                Interactive secondary
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
} 