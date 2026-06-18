import styles from "../dashboard.module.css";

export default function DashboardSettingsPage() {
  return (
    <section>
      <h1 className={styles.title}>Settings</h1>
      <p className={styles.sectionDescription}>
        Manage your account and dashboard preferences.
      </p>
    </section>
  );
}