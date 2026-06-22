"use client";

import { FormEvent, useMemo, useState } from "react";
import dashboardStyles from "../dashboard.module.css";
import styles from "./scan.module.css";

type Signal = {
  category: "lexical" | "domain" | "reputation" | "browser" | "ai" | "override";
  key: string;
  triggered: boolean;
  value?: number;
  weight: number;
  reason: string;
};

type ScanResponse = {
  jobId: string;
  result: {
    risk_score: number;
    confidence: number;
    verdict: "safe" | "suspicious" | "phishing_likely" | "malicious_likely";
    final_url: string;
    urlscan_uuid?: string;
    urlscan_source?: "none" | "search" | "scan";
    urlscan_score?: number;
    reasons: string[];
    signals: Signal[];
    components: {
      lexical: number;
      domain: number;
      reputation: number;
      browser: number;
      ai: number;
    };
    override_flags: string[];
  };
};

const verdictLabel: Record<ScanResponse["result"]["verdict"], string> = {
  safe: "Safe",
  suspicious: "Suspicious",
  phishing_likely: "Phishing Likely",
  malicious_likely: "Malicious Likely",
};


export default function DashboardScanPage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResponse | null>(null);
  const [imageLoading, setImageLoading] = useState(true); 

  const riskColorClass = useMemo(() => {
    const score = result?.result.risk_score ?? 0;
    if (score >= 75) {
      return styles.riskDanger;
    }
    if (score >= 50) {
      return styles.riskWarning;
    }
    if (score >= 25) {
      return styles.riskCaution;
    }
    return styles.riskSafe;
  }, [result]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);
    setImageLoading(true); // Reset image loading state when a new scan is initiated

    try {
      const response = await fetch("/api/scanner/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const payload = (await response.json()) as ScanResponse | { error: string };

      if (!response.ok || "error" in payload) {
        throw new Error("error" in payload ? payload.error : "Failed to scan URL.");
      }

      setResult(payload);
    } catch (requestError) {
      setResult(null);
      setError(requestError instanceof Error ? requestError.message : "Failed to scan URL.");
    } finally {
      setLoading(false);
    }
  }
  return (
    <section>
      <h1 className={dashboardStyles.title}>URL Scanner</h1>
      <p className={dashboardStyles.sectionDescription}>
        Scan URLs and domains to detect phishing risks using lexical, domain, reputation, browser, and AI signals.
      </p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="scan-url" className={styles.label}>Website URL</label>
        <div className={styles.inputRow}>
          <input
            id="scan-url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com"
            className={styles.input}
            required
          />
          <button type="submit" className={styles.button} disabled={loading}>
            {loading ? "Scanning..." : "Scan URL"}
          </button>
        </div>
      </form>

      {error && <p className={styles.error}>{error}</p>}

      {result && (
        <article className={styles.resultCard}>
          <header className={styles.resultHeader}>
            <div>
              <h2 className={styles.verdict}>{verdictLabel[result.result.verdict]}</h2>
            </div>
            <div className={`${styles.riskBadge} ${riskColorClass}`}>
              <span>Risk</span>
              <strong>{result.result.risk_score}</strong>
            </div>
          </header>

          <p className={styles.metaText}>
            Confidence: <strong>{result.result.confidence}</strong> / 100
          </p>
          <p className={styles.metaText}>
            Final URL: {result.result.final_url}
          </p>
          
         
        {result.result.urlscan_uuid && (
           <div className={styles.sectionBlock}>
              <h3 className={styles.blockTitle}>Preview</h3>
             <div className={styles.screenshotContainer}>
            {imageLoading && (
            <div className={styles.screenshotPlaceholder}>
          <div className={styles.pulse}></div>
          <p>Retrieving site screenshot...</p>
          </div>
        )}
        <img
          src={`https://urlscan.io/screenshots/${result.result.urlscan_uuid}.png`}
          alt="Site Screenshot"
          className={`${styles.screenshotImage} ${!imageLoading ? styles.screenshotImageLoaded : ""}`}
          onLoad={() => setImageLoading(false)}
          onError={() => {
          // If a live scan was just started, the image might not be ready.
          // You could implement a retry logic here.
        }}
      />
    </div>
  </div>
)}
          <div className={styles.sectionBlock}>
            <h3 className={styles.blockTitle}>Why this score</h3>
            <ul className={styles.reasonList}>
              {result.result.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>

          <div className={styles.sectionBlock}>
            <h3 className={styles.blockTitle}>Component scores</h3>
            <div className={styles.componentGrid}>
              {Object.entries(result.result.components).map(([name, score]) => (
                <div key={name} className={styles.componentCard}>
                  <span>{name}</span>
                  <strong>{Math.round(score * 100)}</strong>
                </div>
              ))}
            </div>
          </div>

          <div className={styles.sectionBlock}>
            <h3 className={styles.blockTitle}>Triggered signals</h3>
            <ul className={styles.signalList}>
              {result.result.signals.filter((entry) => entry.triggered).map((entry) => (
                <li key={entry.key} className={styles.signalItem}>
                  <span className={styles.signalCategory}>{entry.category}</span>
                  <span>{entry.reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      )}
    </section>
  );
}