import styles from './styles.module.css';

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.loadingState}>
        <h2>Loading your bookshelf...</h2>
        <p>Connecting to Notion database...</p>
      </div>
    </div>
  );
} 