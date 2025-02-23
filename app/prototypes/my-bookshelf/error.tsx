'use client';

import { useEffect } from 'react';
import styles from './styles.module.css';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Bookshelf Error:', error);
  }, [error]);

  const isNotionError = error.message.includes('Notion');
  const isAuthError = error.message.toLowerCase().includes('unauthorized') || 
                     error.message.toLowerCase().includes('auth');

  return (
    <div className={styles.container}>
      <div className={styles.errorState}>
        <h2>Error Loading Your Bookshelf</h2>
        <p className={styles.errorMessage}>{error.message}</p>
        
        {isNotionError && (
          <div className={styles.errorDetails}>
            <p>Please check:</p>
            <ul>
              {isAuthError ? (
                <>
                  <li>You have created a Notion integration</li>
                  <li>Your Notion API key is correct in .env.local</li>
                  <li>You have shared the database with your integration</li>
                </>
              ) : (
                <>
                  <li>Your database ID is correct</li>
                  <li>Your database has the required properties (Name, Author, etc.)</li>
                  <li>Your database is accessible to the integration</li>
                </>
              )}
            </ul>
          </div>
        )}

        <button
          className={styles.filterButton}
          onClick={() => reset()}
        >
          Try again
        </button>
      </div>
    </div>
  );
} 