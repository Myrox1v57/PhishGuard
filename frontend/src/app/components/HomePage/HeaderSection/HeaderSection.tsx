import styles from './HeaderSection.module.css';
import NavHeader from '../../ui/NavHeader/NavHeader';
import HeaderBackground from '../../ui/HeaderBackground/HeaderBackground';
export default function HeaderSection() {
    return (
        <section className={styles.headerSection}>
            <HeaderBackground />
            <NavHeader />
            <div className={styles.content}>
                <h1 className={styles.title}>PhishGuard: Your Ultimate Phishing Detection Solution</h1>
                <p className={styles.subtitle}>Protect yourself from phishing attacks with our powerful and easy-to-use detection tool.</p>
                <a href="/scanner/url" className={styles.ctaButton}>Get Started</a>
            </div>
        </section>
    );
}