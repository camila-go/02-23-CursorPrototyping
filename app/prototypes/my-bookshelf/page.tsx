'use client';

import { useEffect, useState } from 'react';
import styles from './styles.module.css';

interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  coverImage: string;
  allCoverImages: { url: string; type: string; }[];
  rating: number;
  review: string;
  status: string;
  dateStarted: string | null;
  dateFinished: string | null;
}

interface ErrorDetails {
  error: string;
  details?: {
    hasApiKey: boolean;
    hasDatabaseId: boolean;
    timestamp: string;
  };
}

function BookCover({ src, title, allImages }: { src: string; title: string; allImages: { url: string; type: string; }[] }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const hasMultipleImages = allImages.length > 1;

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  if (!src && !hasMultipleImages) {
    return (
      <div className={styles.placeholderCover}>
        <span>{title}</span>
      </div>
    );
  }

  return (
    <div className={styles.coverContainer}>
      <img 
        src={hasMultipleImages ? allImages[currentImageIndex].url : src}
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
      {hasMultipleImages && (
        <div className={styles.imageControls}>
          <button onClick={previousImage} className={styles.imageButton}>&lt;</button>
          <span className={styles.imageCounter}>{currentImageIndex + 1}/{allImages.length}</span>
          <button onClick={nextImage} className={styles.imageButton}>&gt;</button>
        </div>
      )}
    </div>
  );
}

export default function MyBookshelf() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        console.log('Fetching books...');
        const response = await fetch('/prototypes/my-bookshelf/api/books');
        const data = await response.json();

        if (!response.ok) {
          console.error('API Error:', data);
          throw new Error(data.error || 'Failed to fetch books');
        }

        console.log('Books fetched:', data);
        setBooks(data);
      } catch (err) {
        console.error('Error in component:', err);
        throw err;
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  const filteredBooks = filter === 'all' 
    ? books 
    : books.filter(book => book.status.toLowerCase() === filter);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <h2>Loading your bookshelf...</h2>
          <p>Connecting to Notion database...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Error Loading Books</h2>
          <p className={styles.errorMessage}>{error.error}</p>
          {error.details && (
            <div className={styles.errorDetails}>
              <p>Debug Information:</p>
              <ul>
                <li>Notion API Key: {error.details.hasApiKey ? 'Present' : 'Missing'}</li>
                <li>Database ID: {error.details.hasDatabaseId ? 'Present' : 'Missing'}</li>
                <li>Time: {new Date(error.details.timestamp).toLocaleString()}</li>
              </ul>
              <p className={styles.errorHelp}>
                Please make sure you have:
                <ol>
                  <li>Added your Notion API key to .env.local</li>
                  <li>Added the correct database ID to .env.local</li>
                  <li>Shared the database with your Notion integration</li>
                </ol>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

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
        {filteredBooks.length === 0 ? (
          <div className={styles.noBooks}>
            <p>No books found. Make sure you have:</p>
            <ol>
              <li>Connected to the correct Notion database</li>
              <li>Shared the database with your integration</li>
              <li>Added some books to your database</li>
            </ol>
          </div>
        ) : (
          filteredBooks.map((book) => (
            <div key={book.id} className={styles.book}>
              <div className={styles.status}>{book.status}</div>
              <div className={styles.coverWrapper}>
                <BookCover 
                  src={book.coverImage} 
                  title={book.title} 
                  allImages={book.allCoverImages} 
                />
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
          ))
        )}
      </div>
    </div>
  );
} 