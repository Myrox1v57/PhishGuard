"use client";

import { useRouter } from "next/navigation";
import { createClient } from "../utils/superbase/client";
import styles from "./dashboard.module.css";
import SideNav from "../components/Dashboard/SideNav/SideNav";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }
  function handeGoHome() {
    router.push("/");
  }
  return (
    <main className={styles.page}>
      <SideNav onSignOut={handleSignOut} />
      <div className={styles.content}>
        <h1 className={styles.title}>Dashboard</h1>
       <button onClick={handeGoHome} className={styles.goHome}>
        Go to Home Page
      </button>
      </div>
    </main>
  );
}
