import styles from "../dashboard.module.css";

export default function DashboardLearnPage() {
  return (
    <section>
      <h1 className={styles.title}>Learn</h1>
      <p className={styles.sectionDescription}>
        Explore practical guidance to recognize and avoid phishing attacks.
      </p>
    </section>
  );
}