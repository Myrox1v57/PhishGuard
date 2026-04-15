import styles from "./page.module.css";
export default function Home() {
  return (
    
    <header className={styles.header}>
        <h1 className={styles.title}>Welcome to PhishGuard</h1>
        <p className={styles.description}>
          Your AI-powered phishing detection and prevention tool
        </p>
      
    </header>
  );
}
