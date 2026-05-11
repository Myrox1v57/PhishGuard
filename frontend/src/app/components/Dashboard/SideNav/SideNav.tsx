"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './SideNav.module.css';

type SideNavProps = {
    onSignOut?: () => void;
    isCollapsed?: boolean;
};

const icons = {
    overview: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h5A1.5 1.5 0 0 1 12 5.5v5A1.5 1.5 0 0 1 10.5 12h-5A1.5 1.5 0 0 1 4 10.5z" />
            <path d="M12 13.5A1.5 1.5 0 0 1 13.5 12h5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-5a1.5 1.5 0 0 1-1.5-1.5z" />
            <path d="M12 5.5A1.5 1.5 0 0 1 13.5 4h5A1.5 1.5 0 0 1 20 5.5v3A1.5 1.5 0 0 1 18.5 10h-5A1.5 1.5 0 0 1 12 8.5z" />
            <path d="M4 15.5A1.5 1.5 0 0 1 5.5 14h3A1.5 1.5 0 0 1 10 15.5v3A1.5 1.5 0 0 1 8.5 20h-3A1.5 1.5 0 0 1 4 18.5z" />
        </svg>
    ),
    scanner: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 4H6a2 2 0 0 0-2 2v2" />
            <path d="M16 4h2a2 2 0 0 1 2 2v2" />
            <path d="M8 20H6a2 2 0 0 1-2-2v-2" />
            <path d="M16 20h2a2 2 0 0 0 2-2v-2" />
            <path d="M7 12h10" />
        </svg>
    ),
    history: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.708" />
            <path d="M3 4v5h5" />
            <path d="M12 7v5l3 2" />
        </svg>
    ),
    learn: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="m3 8 9-4 9 4-9 4z" />
            <path d="M7 10.5V15c0 1.5 2.5 3 5 3s5-1.5 5-3v-4.5" />
        </svg>
    ),
    settings: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M12 8.75A3.25 3.25 0 1 0 12 15.25A3.25 3.25 0 1 0 12 8.75Z" />
            <path d="M19.4 15a1 1 0 0 0 .2 1.1l.1.1a1 1 0 0 1 0 1.4l-1.2 1.2a1 1 0 0 1-1.4 0l-.1-.1a1 1 0 0 0-1.1-.2 1 1 0 0 0-.6.9V20a1 1 0 0 1-1 1h-1.7a1 1 0 0 1-1-1v-.2a1 1 0 0 0-.7-.9 1 1 0 0 0-1.1.2l-.1.1a1 1 0 0 1-1.4 0l-1.2-1.2a1 1 0 0 1 0-1.4l.1-.1a1 1 0 0 0 .2-1.1 1 1 0 0 0-.9-.6H4a1 1 0 0 1-1-1v-1.7a1 1 0 0 1 1-1h.2a1 1 0 0 0 .9-.7 1 1 0 0 0-.2-1.1l-.1-.1a1 1 0 0 1 0-1.4l1.2-1.2a1 1 0 0 1 1.4 0l.1.1a1 1 0 0 0 1.1.2 1 1 0 0 0 .6-.9V4a1 1 0 0 1 1-1h1.7a1 1 0 0 1 1 1v.2a1 1 0 0 0 .7.9 1 1 0 0 0 1.1-.2l.1-.1a1 1 0 0 1 1.4 0l1.2 1.2a1 1 0 0 1 0 1.4l-.1.1a1 1 0 0 0-.2 1.1 1 1 0 0 0 .9.6h.2a1 1 0 0 1 1 1v1.7a1 1 0 0 1-1 1h-.2a1 1 0 0 0-.9.7Z" />
        </svg>
    ),
    logout: (
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M14 7l5 5-5 5" />
            <path d="M19 12H9" />
            <path d="M11 19H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h5" />
        </svg>
    ),
};

export default function SideNav({ onSignOut, isCollapsed = false }: SideNavProps) {
    const pathname = usePathname();
    const navLinks = [
        { name: 'Overview', href: '/dashboard', icon: icons.overview },
        { name: 'Scanner', href: '/dashboard/scan', icon: icons.scanner },
        { name: 'History', href: '/dashboard/history', icon: icons.history },
        { name: 'Learn', href: '/dashboard/learn', icon: icons.learn },
        { name: 'Settings', href: '/dashboard/settings', icon: icons.settings },
    ];

    return (
        <nav className={`${styles.sideNav} ${isCollapsed ? styles.sideNavCollapsed : ''}`}>
            
             <div className={styles.menuBlock}>
                    <p className={styles.menuLabel}>Menu</p>
                    <div className={styles.menuGlow} aria-hidden="true" />
                </div>
            <ul className={styles.navList}>
                {navLinks.map((link) => {
                    const isActive = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));

                    return (
                    <li key={link.name} className={`${styles.navItem} ${link.name === 'Settings' ? styles.navItemBottom : ''}`}>
                        <Link
                            href={link.href}
                            className={`${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
                            title={isCollapsed ? link.name : undefined}
                            data-tooltip={isCollapsed ? link.name : undefined}
                        >
                            <span className={styles.navIcon}>{link.icon}</span>
                            {!isCollapsed && <span>{link.name}</span>}
                        </Link>
                    </li>
                );})}
            </ul>
            <div className={styles.footerBlock}>
                <button
                    type="button"
                    className={styles.logoutButton}
                    onClick={onSignOut}
                    title={isCollapsed ? 'Log out' : undefined}
                    data-tooltip={isCollapsed ? 'Log out' : undefined}
                >
                    <span className={styles.navIcon}>{icons.logout}</span>
                    {!isCollapsed && <span>Log out</span>}
                </button>
            </div>
        </nav>
    );
}