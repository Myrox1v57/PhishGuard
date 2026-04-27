import Link from "next/link";
import styles from "./NavHeader.module.css";

const navLinks = [
  { name: "Home", href: "/" },
  { name: "Dashboard", href: "/dashboard" },
  { name: "Alerts", href: "/alerts" },
  { name: "Reports", href: "/reports" },
];

const scannerLinks = [
  { name: "URL Scanner", href: "/scanner/url" },
  { name: "Email Scanner", href: "/scanner/email" },
  { name: "Attachment Scanner", href: "/scanner/attachment" },
];

export default function NavHeader() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav} >
        <Link href="/" className={styles.logo}>
          PhishGuard
        </Link>

        <ul className={styles.linkList}>
          {navLinks.map((link) => (
            <li key={link.name}>
              <Link className={styles.link} href={link.href}>
                {link.name}
              </Link>
            </li>
          ))}

          <li className={styles.dropdownItem}>
            <details className={styles.dropdown}>
              <summary className={styles.dropdownTrigger}>
                Scanners
                <img src="/dropdown-arrow.svg" alt="" className={styles.dropdownArrow} />
              </summary>
              <ul className={styles.dropdownMenu}>
                {scannerLinks.map((link) => (
                  <li key={link.name}>
                    <Link className={styles.dropdownLink} href={link.href}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          </li>
        </ul>

        <div className={styles.actions}>
          <Link className={styles.loginLink} href="/login">
            Login
          </Link>
          <Link className={styles.ctaButton} href="/scanner/url">
            New Scan
          </Link>
        </div>
      </nav>
    </header>
  );
}