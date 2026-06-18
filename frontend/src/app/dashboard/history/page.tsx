import styles from "../dashboard.module.css";

export default function DashboardHistoryPage() {
  return (
    <section>
      <h1 className={styles.title}>History</h1>
      <p className={styles.sectionDescription}>
        Review your previous scans and security checks.
      </p>
    </section>
  );
}