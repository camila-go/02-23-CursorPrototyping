import Link from "next/link";
import styles from './styles/home.module.css';
import { instrumentSans } from './fonts';

export default function Home() {
  // Add your prototypes to this array
  const prototypes = [
    {
      title: 'Getting started',
      description: 'How to create a prototype',
      path: '/prototypes/example'
    },
    {
      title: 'Design library',
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
    <div className={`${styles.container} ${instrumentSans.className}`}>
      <header className={styles.header}>
        <h1>Elizabeth's prototypes</h1>
      </header>

      <main>
        <section className={styles.grid}>
          {/* Goes through the prototypes list (array) to create cards */}
          {prototypes.map((prototype, index) => (
            <Link 
              key={index}
              href={prototype.path} 
              className={styles.card}
            >
              <h3>{prototype.title}</h3>
              <p>{prototype.description}</p>
            </Link>
          ))}
        </section>
      </main>
    </div>
  );
}
