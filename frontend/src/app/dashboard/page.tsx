"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../utils/superbase/client";
import styles from "./dashboard.module.css";
import SideNav from "../components/Dashboard/SideNav/SideNav";
import TopNav from "../components/Dashboard/TopNav/TopNav";

export default function DashboardPage() {
  const router = useRouter();
  const supabase = createClient();
  const [isSideNavCollapsed, setIsSideNavCollapsed] = useState(false);
  const [profileInitial, setProfileInitial] = useState("U");

  useEffect(() => {
    let isMounted = true;

    async function loadUserInitial() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!isMounted || !user) {
        return;
      }

      const metadataName =
        (typeof user.user_metadata?.username === "string" && user.user_metadata.username) ||
        (typeof user.user_metadata?.full_name === "string" && user.user_metadata.full_name) ||
        (typeof user.user_metadata?.name === "string" && user.user_metadata.name) ||
        "";
      const fallbackName = user.email ?? "";
      const source = (metadataName || fallbackName).trim();
      const initial = source ? source.charAt(0).toUpperCase() : "U";

      setProfileInitial(initial);
    }

    void loadUserInitial();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }
  function handleToggleSideNav() {
    setIsSideNavCollapsed((prev) => !prev);
  }

  function handeGoHome() {
    router.push("/");
  }

  return (
    <main className={styles.page}>
      <TopNav
        isSideNavCollapsed={isSideNavCollapsed}
        onToggleSideNav={handleToggleSideNav}
        profileInitial={profileInitial}
      />
      <div className={styles.layout}>
        <SideNav onSignOut={handleSignOut} isCollapsed={isSideNavCollapsed} />
        <div className={styles.content}>
          <h1 className={styles.title}>Dashboard</h1>
          <button onClick={handeGoHome} className={styles.goHome}>
            Go to Home Page
          </button>
        </div>
      </div>
    </main>
  );
}
