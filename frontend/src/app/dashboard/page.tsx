"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../utils/superbase/client";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Dashboard</h1>
      <button onClick={handleSignOut} className={styles.signOut}>
        Sign Out
      </button>
    </main>
  );
}
