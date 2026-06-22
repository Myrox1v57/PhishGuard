"use client";

import { useState } from "react";
import styles from "./CookieBanner.module.css";

export default function CookieBanner() {
  const [visible, setVisible] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return !localStorage.getItem("cookie_consent");
  });

  function handleAccept() {
    localStorage.setItem("cookie_consent", "accepted");
    setVisible(false);
  }

  function handleDecline() {
    localStorage.setItem("cookie_consent", "declined");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className={styles.banner} role="dialog" aria-label="Cookie consent">
      <div className={styles.content}>
        <p className={styles.text}>
          We use cookies to keep you signed in and improve your experience.
          By continuing, you agree to our use of essential cookies.
        </p>
        <div className={styles.actions}>
          <button onClick={handleDecline} className={styles.decline}>
            Decline
          </button>
          <button onClick={handleAccept} className={styles.accept}>
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
