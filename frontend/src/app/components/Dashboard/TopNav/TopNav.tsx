import Link from 'next/link';
import styles from './TopNav.module.css';

type TopNavProps = {
    isSideNavCollapsed: boolean;
    onToggleSideNav: () => void;
    profileInitial: string;
};

export default function TopNav({ isSideNavCollapsed, onToggleSideNav, profileInitial }: TopNavProps) {
    return (
        <nav className={styles.nav}>
            
            <div className={styles.leftControls}>
                <div className={styles.brandBlock}>
                <Link href="/" className={styles.logoLink}>
                    <span className={styles.logoText}>PhishGuard</span>
                </Link>
            </div>
            <span className={styles.text}>My Space</span>
             <button
                    type="button"
                    className={styles.toggleButton}
                    onClick={onToggleSideNav}
                    aria-label={isSideNavCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                    title={isSideNavCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M4 6.5h16" />
                        <path d="M4 12h16" />
                        <path d="M4 17.5h16" />
                    </svg>
                </button>
            </div>
            <div className={styles.rightControls}>
                  
                <Link
                    href="/dashboard/settings"
                    className={styles.profileButton}
                    aria-label="Open settings"
                    title="Open settings"
                >
                    {profileInitial}
                </Link>
            </div>
        </nav>
    );
}