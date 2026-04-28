import styles from './HeaderSection.module.css';
import NavHeader from '../../ui/NavHeader/NavHeader';
import HeaderBackground from '../../ui/HeaderBackground/HeaderBackground';
import HeaderUrlScanner from '../../ui/headerUrlScanner/headerUrlScanner';
export default function HeaderSection() {
    return (
        <section className={styles.headerSection}>
            <HeaderBackground />
            <NavHeader />
            <div className={styles.content}>
                <div className={styles.aiPoweredSection}>
                    <img src="./sparkles.svg" alt="" className={styles.sparkles} />
                    <p className={styles.aiPoweredText}>AI-Powered Phishing Detection</p>
                </div>
                <h1 className={styles.title}>Your Ultimate <span className={styles.highlight}>Phishing Detection</span> Solution</h1>
                <p className={styles.subtitle}>Protect yourself from phishing attacks with our powerful, easy-to-use detection tool. Scan any URL in seconds and stay one step ahead of threats.</p>
                <HeaderUrlScanner />

            </div>
        </section>
    );
}