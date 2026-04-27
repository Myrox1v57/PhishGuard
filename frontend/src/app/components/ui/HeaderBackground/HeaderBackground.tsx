import styles from './HeaderBackgorund.module.css';

export default function HeaderBackground() {
    return (
        <div className={styles.bgCircles} aria-hidden="true">
                <span className={styles.circle1} />
                <span className={styles.circle2} />
                <span className={styles.circle3} />
                <span className={styles.circle4} />
                <span className={styles.circle5} />
                <span className={styles.circle6} />
                <span className={styles.circle7} />
                <span className={styles.circle8} />
                <span className={styles.circle9} />
                <span className={styles.circle10} />
            </div>
    );
}