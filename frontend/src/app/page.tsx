import styles from "./page.module.css";
import { createClient } from "./utils/superbase/client";
import Home from "./pages/Home/Home";
export default function Page() {
  const supabase = createClient();
  return (
    <section className={styles.page}>
      <Home />
      
    </section>
  );
}
