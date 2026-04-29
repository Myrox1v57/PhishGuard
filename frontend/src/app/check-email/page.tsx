import Link from "next/link";
import styles from "./check-email.module.css";

export default function CheckEmailPage() {
  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <div className={styles.iconWrapper}>
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="2" y="4" width="20" height="16" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        </div>
        <h1 className={styles.title}>Check your email</h1>
        <p className={styles.description}>
          We sent a confirmation link to your email address. Please open it to activate your account before signing in.
        </p>
        <p className={styles.hint}>
          Didn&apos;t receive it? Check your spam folder.
        </p>
        <Link href="/login" className={styles.button}>
          Back to Sign In
        </Link>
      </div>
    </main>
  );
}
