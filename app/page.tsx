import Link from "next/link";
import styles from './styles/home.module.css';

export default function Home() {
  // Add your prototypes to this array
  const prototypes = [
    {
      title: '✨ Getting started',
      description: 'How to create a prototype',
      path: '/prototypes/example'
    },
    {
      title: '🎨 Design library',
      description: 'Reusable components that you can use in your prototypes',
      path: '/prototypes/design-library'
    },
    // Add your new prototypes here like this:
    // {
    //   title: 'Your new prototype',
    //   description: 'A short description of what this prototype does',
    //   path: '/prototypes/my-new-prototype'
    // },
  ];

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>
          <span aria-label="Camila's">Camila&apos;s</span>{' '}
          <span aria-label="prototypes">prototypes</span>
        </h1>
        <p className="sr-only">Welcome to my collection of interactive prototypes and experiments</p>
      </header>

      <main>
        <section className={styles.grid} aria-label="Prototype cards">
          {prototypes.map((prototype, index) => (
            <Link 
              key={index}
              href={prototype.path} 
              className={styles.card}
              aria-labelledby={`title-${index} desc-${index}`}
            >
              <h2 id={`title-${index}`} className={styles.cardTitle}>
                {prototype.title}
              </h2>
              <p id={`desc-${index}`}>{prototype.description}</p>
              <span className="sr-only">
                Click to explore {prototype.title.replace(/[✨🎨]/g, '')}
              </span>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
