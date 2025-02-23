'use client';

import { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverImage: string;
  rating: number;
  review: string;
  status: string;
  dateStarted: string | null;
  dateFinished: string | null;
}

function BookCover({ src, title }: { src: string; title: string }) {
  if (!src) {
    return (
      <div className={styles.placeholderCover}>
        <span>{title}</span>
      </div>
    );
  }

  return (
    <img 
      src={src} 
      alt={`Cover of ${title}`} 
      className={styles.cover}
      onError={(e) => {
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        target.parentElement?.classList.add(styles.placeholderCover);
        const span = document.createElement('span');
        span.textContent = title;
        target.parentElement?.appendChild(span);
      }}
    />
  );
}

export default function MyBookshelf() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch('/api/books');
        if (!response.ok) {
          throw new Error('Failed to fetch books');
        }
        const data = await response.json();
        setBooks(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch books');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = filter === 'all' 
    ? books 
    : books.filter(book => book.status.toLowerCase() === filter);

  if (loading) return <div className={styles.container}>Loading...</div>;
  if (error) return <div className={styles.container}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>My Bookshelf</h1>
        <div className={styles.filters}>
          <button 
            className={`${styles.filterButton} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'reading' ? styles.active : ''}`}
            onClick={() => setFilter('reading')}
          >
            Reading
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'completed' ? styles.active : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button 
            className={`${styles.filterButton} ${filter === 'want to read' ? styles.active : ''}`}
            onClick={() => setFilter('want to read')}
          >
            Want to Read
          </button>
        </div>
      </div>
      <div className={styles.grid}>
        {filteredBooks.map((book) => (
          <div key={book.id} className={styles.book}>
            <div className={styles.status}>{book.status}</div>
            <div className={styles.coverWrapper}>
              <BookCover src={book.coverImage} title={book.title} />
            </div>
            <h2>{book.title}</h2>
            <p className={styles.author}>by {book.author}</p>
            <div className={styles.meta}>
              <span className={styles.genre}>{book.genre}</span>
              {book.rating > 0 && (
                <span className={styles.rating}>
                  {'★'.repeat(book.rating)}{'☆'.repeat(5-book.rating)}
                </span>
              )}
            </div>
            {book.dateStarted && (
              <p className={styles.date}>
                Started: {new Date(book.dateStarted).toLocaleDateString()}
              </p>
            )}
            {book.dateFinished && (
              <p className={styles.date}>
                Finished: {new Date(book.dateFinished).toLocaleDateString()}
              </p>
            )}
            {book.review && (
              <p className={styles.review}>{book.review}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 