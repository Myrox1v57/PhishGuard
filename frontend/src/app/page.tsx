import styles from "./page.module.css";
import { createClient } from './utils/superbase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <main className={styles.main}>
      <h1>Hello World</h1>
    </main>
  )
}
