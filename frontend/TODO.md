# URL Scanner Build Plan (Phase 1)

## 1. Define Scoring Contract
- Output fields: `risk_score` (0-100), `confidence` (0-100), `verdict`, `reasons[]`, `signals[]`
- `risk_score`: higher means more dangerous
- `verdict` values: `safe`, `suspicious`, `phishing_likely`, `malicious_likely`

## 2. Build Deterministic Checks (MVP)
- URL format: IP host, punycode, very long URL, too many subdomains, encoded characters
- Domain signals: domain age, registrar reputation, newly registered domain
- Brand mismatch: hostname looks like brand but is not official domain
- Protocol signals: HTTP only, invalid TLS
- Path/query signals: credential words + tracking + obfuscation
- Goal: useful first scanner without AI

## 3. Add Reputation Layer
- Check free/limited threat feeds (Safe Browsing-style list, known blocklists)
- Add domain/IP reputation lookups
- Cache reputation results to reduce cost and latency

## 4. Add Browser Behavior Layer (Puppeteer in Isolation)
- Redirect chain length and final destination drift
- Login form + password field on unknown domains
- Hidden iframe/script injection patterns
- Suspicious JS behavior patterns and fake urgency UI

## 5. Add AI Reasoning as Secondary Signal
- AI summarizes social-engineering cues from page text/screenshot
- Force strict JSON output
- Never let AI be sole final verdict

## 6. Store Everything for Calibration
- Save raw signals + weights + final score + verdict + confidence
- Save user feedback (`correct` / `false_positive`) to tune later

## 7. Calibrate Thresholds from Real Data
- Start with fixed thresholds
- Every 1-2 weeks, tune weights/thresholds using feedback

---

## Best Practical Scoring Model

Use weighted components:

```text
risk = 100 x (0.30L + 0.25D + 0.20R + 0.15B + 0.10A)
```

Where:
- `L` = lexical URL risk (0..1)
- `D` = domain/infrastructure risk (0..1)
- `R` = reputation risk (0..1)
- `B` = browser-behavior risk (0..1)
- `A` = AI semantic risk (0..1)

Round to integer 0-100.

---

## Verdict Thresholds (Starting Point)
- `0-24`: `safe`
- `25-49`: `suspicious`
- `50-74`: `phishing_likely`
- `75-100`: `malicious_likely`

### Hard Overrides
- Known phishing/malware blocklist hit: set minimum score to `90`
- Brand impersonation + credential form + new domain: set minimum score to `80`
- Drive-by download/executable pattern detected: set minimum score to `85`

### Confidence Bands
- `0-39`: low confidence
- `40-69`: medium confidence
- `70-100`: high confidence

Use both score and confidence in UI:
- Example: `62 (medium confidence)` is not the same as `62 (high confidence)`

---

## Phishing Decision Rule
Mark as phishing when either condition is true:
1. `risk_score >= 60` and `confidence >= 60`
2. Any hard override trigger is true (blocklist hit, impersonation + credential trap, malware pattern)

This reduces missed attacks while limiting false positives.

---

## Quick Examples
- Official banking site, strong TLS, no suspicious redirects:
	- Score: `8-20`
	- Verdict: `safe`
- New domain `paypaI-security-check...` (letter spoof), login form, urgent text:
	- Score: `72-88`
	- Verdict: `phishing_likely`
- Known phishing URL from feed:
	- Score: `90-100`
	- Verdict: `malicious_likely`