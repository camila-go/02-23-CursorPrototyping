'use client';

import { useEffect } from 'react';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Root Error:', error);
  }, [error]);

  return (
    <div style={{
      padding: '2rem',
      maxWidth: '1200px',
      margin: '0 auto',
      textAlign: 'center',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '2rem',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <h2 style={{ marginBottom: '1rem' }}>Something went wrong!</h2>
        <p style={{ color: '#dc2626', marginBottom: '1rem' }}>{error.message}</p>
        <button
          onClick={() => reset()}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '999px',
            border: '1px solid #e0e0e0',
            background: 'white',
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </div>
    </div>
  );
} 