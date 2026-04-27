import styles from "./page.module.css";
import { createClient } from "./utils/superbase/client";
import HeaderSection from "./components/HomePage/HeaderSection/HeaderSection";

export default function Page() {
  const supabase = createClient();
  return (
    <section className={styles.page}>
      <HeaderSection />
      
    </section>
  );
}
