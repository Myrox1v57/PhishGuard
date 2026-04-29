"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "../../../utils/superbase/client";
import styles from "./RegisterForm.module.css";

export default function RegisterForm() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setLoading(false);
    window.location.href = "/check-email";
  }

  return (
    <div className={styles.container}>
      <Link href="/" className={styles.backButton} aria-label="Back to home">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Link>
      <div className={styles.title}>
        <h1><span className={styles.highlight}>PhishGurd</span></h1>
        <p>Defend your digital life</p>
      </div>
      <div className={styles.registerForm}>
        <div className={styles.action}>
          <Link href="/login" className={styles.loginLink}>Sign in</Link>
          <Link href="/register" className={styles.registerLink}>Sign up</Link>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="fullName" className={styles.label}>Full Name</label>
            <input id="fullName" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required className={styles.input} placeholder="Your Name" />
          </div>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className={styles.input} placeholder="you@example.com" />
          </div>
          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className={styles.input} placeholder="••••••••" />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          <button type="submit" disabled={loading} className={styles.button}>
            {loading ? "Creating account..." : "Create Account"}
          </button>
          <div className={styles.footer}>
            <div className={styles.seperate}>
              <span className={styles.line}></span>
              <p>OR</p>
              <span className={styles.line}></span>
            </div>
            <div className={styles.oAuth}>
              <button type="button" className={styles.links}>Google</button>
              <button type="button" className={styles.links}>GitHub</button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

