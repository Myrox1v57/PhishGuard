import styles from "./headerUrlScanner.module.css";

export default function HeaderUrlScanner() {
    return (
        <section>
            <div className={styles.urlScanner}>
            <img src="./search.svg" alt="" className={styles.searchIcon}/>
            <input type="text" placeholder="Paste URL to scan , e.g. https://example.com"  className={styles.urlInput}/>
            <button type="button" className={styles.scanButton}>Scan now <img src="./arrowRight.svg" alt="" /></button>
        </div>
        <div className={styles.trustedBy}>
            <img src="./shieldCheck.svg" alt="" />
            <span>Free forever · Easy to use · Results in 2s </span>
        </div>
        </section>
        
    );
}