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
  {
    name: "URL Deep-Scan",
    href: "/scanner/url",
    label: "Real-time redirect chain analysis",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
      </svg>
    ),
  },
  {
    name: "Email Sentinel",
    href: "/scanner/email",
    label: "Heuristic spoofing detection",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    name: "Static Binary",
    href: "/scanner/attachment",
    label: "Sandbox attachments safely",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="8" y1="13" x2="16" y2="13"/>
        <line x1="8" y1="17" x2="16" y2="17"/>
      </svg>
    ),
  },
  {
    name: "Optical Shield",
    href: "/scanner/qr-scanner",
    label: "Reveal hidden QR destinations",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7"/>
        <rect x="14" y="3" width="7" height="7"/>
        <rect x="3" y="14" width="7" height="7"/>
        <rect x="14" y="14" width="4" height="4"/>
        <rect x="18" y="18" width="3" height="3"/>
      </svg>
    ),
  },
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
              <div className={`${styles.dropdownMenu} ${isDropdownOpen ? styles.dropdownMenuOpen : ""}`} role="menu">
                <div className={styles.dropdownHeader}>
                  <span className={styles.dropdownHeaderTitle}>Security Intelligence Scanners</span>
                </div>

                <div className={styles.dropdownGrid}>
                  {scannerLinks.map((link) => (
                    <Link
                      key={link.name}
                      className={styles.dropdownCard}
                      href={link.href}
                      role="menuitem"
                      onClick={closeDropdown}
                    >
                      <div className={styles.cardIcon}>{link.icon}</div>
                      <div className={styles.cardContent}>
                        <span className={styles.cardTitle}>{link.name}</span>
                        <span className={styles.cardLabel}>{link.label}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
          </li>
        </ul>

        <div className={styles.actions}>
          <Link className={styles.loginLink} href="/login">
            Login
          </Link>
          <Link className={styles.ctaButton} href="/register">
            Get Started
          </Link>
        </div>
      </nav>
    </header>
  );
}