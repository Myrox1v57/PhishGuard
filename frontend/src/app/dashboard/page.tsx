import Link from "next/link";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  return (
    <section>
      <h1 className={styles.title}>Dashboard</h1>
      <p className={styles.sectionDescription}>Welcome back. Choose a section from the side navigation.</p>
      <Link href="/" className={styles.goHome}>
        Go to Home Page
      </Link>
    </section>
  );
}
