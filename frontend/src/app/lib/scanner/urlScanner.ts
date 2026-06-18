import { analyzeUrlWithAi } from "../openrouter";
import type { UrlScannerComponents, UrlScannerResult, UrlSignal } from "./urlScannerTypes";

const SUSPICIOUS_TLDS = new Set(["zip", "top", "click", "xyz", "work", "gq", "tk", "ml", "cf"]);
const SUSPICIOUS_KEYWORDS = ["login", "verify", "secure", "account", "password", "update", "confirm", "wallet"];
const URGENCY_KEYWORDS = ["urgent", "immediately", "suspended", "verify now", "action required"];

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function isIpAddress(hostname: string): boolean {
  return /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
}

function normalizeUrl(input: string): URL {
  const trimmed = input.trim();
  if (!trimmed) {
    throw new Error("URL is required.");
  }

  const hasScheme = /^https?:\/\//i.test(trimmed);
  const candidate = hasScheme ? trimmed : `https://${trimmed}`;
  return new URL(candidate);
}

function signal(category: UrlSignal["category"], key: string, triggered: boolean, weight: number, reason: string, value?: number, evidence?: Record<string, unknown>): UrlSignal {
  return {
    category,
    key,
    triggered,
    value,
    weight,
    reason,
    evidence,
  };
}

function normalizeComponentScore(signals: UrlSignal[]): number {
  const sumWeight = signals.reduce((acc, current) => acc + current.weight, 0);
  if (sumWeight === 0) {
    return 0;
  }

  const triggeredWeight = signals.reduce((acc, current) => {
    if (!current.triggered) {
      return acc;
    }

    const value = current.value ?? 1;
    return acc + current.weight * clamp(value, 0, 1);
  }, 0);

  return clamp(triggeredWeight / sumWeight, 0, 1);
}

async function followRedirects(initialUrl: URL): Promise<{ finalUrl: URL; chain: string[]; html: string }> {
  const chain: string[] = [initialUrl.toString()];
  let currentUrl = initialUrl;
  let html = "";

  for (let i = 0; i < 5; i += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(currentUrl.toString(), {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
        headers: {
          "User-Agent": "PhishGuard-Scanner/1.0",
        },
      });

      const location = response.headers.get("location");
      if (response.status >= 300 && response.status < 400 && location) {
        const nextUrl = new URL(location, currentUrl);
        chain.push(nextUrl.toString());
        currentUrl = nextUrl;
        continue;
      }

      html = await response.text();
      break;
    } catch {
      break;
    } finally {
      clearTimeout(timer);
    }
  }

  return {
    finalUrl: currentUrl,
    chain,
    html,
  };
}

async function checkSafeBrowsing(url: string): Promise<{ hit: boolean; details?: unknown }> {
  const apiKey = process.env.GOOGLE_SAFE_BROWSING_API_KEY;
  if (!apiKey) {
    return { hit: false };
  }

  try {
    const response = await fetch(`https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        client: {
          clientId: "phishguard",
          clientVersion: "1.0.0",
        },
        threatInfo: {
          threatTypes: ["MALWARE", "SOCIAL_ENGINEERING", "UNWANTED_SOFTWARE", "POTENTIALLY_HARMFUL_APPLICATION"],
          platformTypes: ["ANY_PLATFORM"],
          threatEntryTypes: ["URL"],
          threatEntries: [{ url }],
        },
      }),
    });

    if (!response.ok) {
      return { hit: false };
    }

    const json = (await response.json()) as { matches?: unknown[] };
    return {
      hit: Array.isArray(json.matches) && json.matches.length > 0,
      details: json.matches,
    };
  } catch {
    return { hit: false };
  }
}

export async function runUrlScanner(inputUrl: string): Promise<UrlScannerResult> {
  const normalized = normalizeUrl(inputUrl);
  const redirectData = await followRedirects(normalized);

  const pathnameAndQuery = `${redirectData.finalUrl.pathname}${redirectData.finalUrl.search}`.toLowerCase();
  const hostname = redirectData.finalUrl.hostname.toLowerCase();
  const tld = hostname.split(".").pop() ?? "";

  const lexicalSignals: UrlSignal[] = [
    signal("lexical", "ip_host", isIpAddress(hostname), 0.2, "URL host is an IP address", undefined, { hostname }),
    signal("lexical", "punycode", hostname.includes("xn--"), 0.18, "Host contains punycode characters", undefined, { hostname }),
    signal("lexical", "long_url", redirectData.finalUrl.toString().length > 120, 0.12, "URL length is unusually high", undefined, { length: redirectData.finalUrl.toString().length }),
    signal("lexical", "many_subdomains", hostname.split(".").length > 4, 0.14, "Host has many subdomains", undefined, { hostname }),
    signal("lexical", "encoded_obfuscation", (redirectData.finalUrl.toString().match(/%[0-9a-f]{2}/gi)?.length ?? 0) >= 4, 0.16, "URL contains heavy encoded characters"),
    signal("lexical", "credential_keywords", SUSPICIOUS_KEYWORDS.some((word) => pathnameAndQuery.includes(word)), 0.2, "URL path/query contains credential-related keywords", undefined, { pathnameAndQuery }),
  ];

  const domainSignals: UrlSignal[] = [
    signal("domain", "http_only", redirectData.finalUrl.protocol === "http:", 0.35, "URL is using HTTP instead of HTTPS"),
    signal("domain", "suspicious_tld", SUSPICIOUS_TLDS.has(tld), 0.2, "Domain uses high-risk TLD", undefined, { tld }),
    signal("domain", "many_hyphens", (hostname.match(/-/g)?.length ?? 0) >= 3, 0.18, "Host contains many hyphens", undefined, { hostname }),
    signal("domain", "contains_at_symbol", redirectData.finalUrl.toString().includes("@"), 0.12, "URL contains @ symbol obfuscation"),
    signal("domain", "brand_like_pattern", /paypa|micros0ft|g00gle|appleid|banking|secure-verify/.test(hostname), 0.15, "Host resembles common brand impersonation patterns", undefined, { hostname }),
  ];

  const safeBrowsing = await checkSafeBrowsing(redirectData.finalUrl.toString());
  const reputationSignals: UrlSignal[] = [
    signal("reputation", "safe_browsing_hit", safeBrowsing.hit, 1, "Threat feed reported the URL as malicious", undefined, { matches: safeBrowsing.details ?? null }),
  ];

  const hasPasswordInput = /<input[^>]*type=["']password["'][^>]*>/i.test(redirectData.html);
  const hasSuspiciousIframes = /<iframe[^>]*(display\s*:\s*none|visibility\s*:\s*hidden)[^>]*>/i.test(redirectData.html);
  const hasUrgencyLanguage = URGENCY_KEYWORDS.some((word) => redirectData.html.toLowerCase().includes(word));

  const browserSignals: UrlSignal[] = [
    signal("browser", "redirect_chain_long", redirectData.chain.length >= 4, 0.25, "Multiple redirects before final page", undefined, { redirects: redirectData.chain.length - 1 }),
    signal("browser", "credential_form_present", hasPasswordInput, 0.35, "Password input detected in page content"),
    signal("browser", "hidden_iframe", hasSuspiciousIframes, 0.2, "Hidden iframe pattern detected"),
    signal("browser", "urgency_language", hasUrgencyLanguage, 0.2, "Urgency language found in page content"),
  ];

  const aiSignals: UrlSignal[] = [];
  let aiScore = 0;
  let model: UrlScannerResult["model"];

  const aiResult = await analyzeUrlWithAi({
    url: redirectData.finalUrl.toString(),
    htmlSnippet: redirectData.html.slice(0, 2500),
  });

  if (aiResult) {
    aiScore = clamp(aiResult.aiScore, 0, 1);
    model = {
      provider: "openrouter",
      name: aiResult.model,
      version: "1",
    };

    aiSignals.push(
      signal("ai", "semantic_social_engineering", aiScore >= 0.4, 1, aiResult.reasons.join(" "), aiScore, {
        confidence: aiResult.confidence,
      }),
    );
  }

  const components: UrlScannerComponents = {
    lexical: normalizeComponentScore(lexicalSignals),
    domain: normalizeComponentScore(domainSignals),
    reputation: normalizeComponentScore(reputationSignals),
    browser: normalizeComponentScore(browserSignals),
    ai: aiScore,
  };

  const overrideFlags: string[] = [];

  if (safeBrowsing.hit) {
    overrideFlags.push("known_blocklist_hit");
  }

  if (components.domain >= 0.6 && hasPasswordInput && components.lexical >= 0.45) {
    overrideFlags.push("brand_impersonation_with_credential_trap");
  }

  const weightedRisk = 100 * (
    0.3 * components.lexical +
    0.25 * components.domain +
    0.2 * components.reputation +
    0.15 * components.browser +
    0.1 * components.ai
  );

  let riskScore = Math.round(weightedRisk);
  if (overrideFlags.includes("known_blocklist_hit")) {
    riskScore = Math.max(riskScore, 90);
  }
  if (overrideFlags.includes("brand_impersonation_with_credential_trap")) {
    riskScore = Math.max(riskScore, 80);
  }
  riskScore = clamp(riskScore, 0, 100);

  const confidenceParts = [
    components.lexical > 0 ? 18 : 0,
    components.domain > 0 ? 18 : 0,
    safeBrowsing.hit || process.env.GOOGLE_SAFE_BROWSING_API_KEY ? 22 : 0,
    redirectData.html.length > 0 ? 22 : 0,
    aiResult ? 20 : 0,
  ];

  let confidence = clamp(confidenceParts.reduce((sum, value) => sum + value, 0), 0, 100);
  if (riskScore >= 75 || riskScore <= 15) {
    confidence = clamp(confidence + 5, 0, 100);
  }

  let verdict: UrlScannerResult["verdict"] = "safe";
  if (riskScore >= 75) {
    verdict = "malicious_likely";
  } else if (riskScore >= 50) {
    verdict = "phishing_likely";
  } else if (riskScore >= 25) {
    verdict = "suspicious";
  }

  const allSignals = [...lexicalSignals, ...domainSignals, ...reputationSignals, ...browserSignals, ...aiSignals];
  const reasons = allSignals.filter((entry) => entry.triggered).map((entry) => entry.reason);

  if (!reasons.length) {
    reasons.push("No major phishing indicators were triggered.");
  }

  return {
    requestedUrl: inputUrl,
    normalizedUrl: normalized.toString(),
    finalUrl: redirectData.finalUrl.toString(),
    riskScore,
    confidence,
    verdict,
    reasons,
    signals: allSignals,
    components,
    overrideFlags,
    model,
  };
}