"use client";

import { useEffect, useRef, useState } from "react";
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
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    function onEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  function toggleDropdown() {
    setIsDropdownOpen((prev) => !prev);
  }

  function closeDropdown() {
    setIsDropdownOpen(false);
  }

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

          <li className={styles.dropdownItem} ref={dropdownRef}>
            <button
              type="button"
              className={styles.dropdownTrigger}
              aria-expanded={isDropdownOpen}
              aria-haspopup="menu"
              onClick={toggleDropdown}
            >
                Scanners
                <img
                  src="/dropdown-arrow.svg"
                  alt=""
                  className={styles.dropdownArrow}
                  aria-hidden="true"
                />
              </button>
              <ul className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.dropdownMenuOpen : ""}`} role="menu">
                {scannerLinks.map((link) => (
                  <li key={link.name} role="none">
                    <Link className={styles.dropdownLink} href={link.href} role="menuitem" onClick={closeDropdown}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
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