export type ScanVerdict = "safe" | "suspicious" | "phishing_likely" | "malicious_likely";

export type SignalCategory = "lexical" | "domain" | "reputation" | "browser" | "ai" | "override";

export type UrlSignal = {
  category: SignalCategory;
  key: string;
  triggered: boolean;
  value?: number;
  weight: number;
  reason: string;
  evidence?: Record<string, unknown>;
};

export type UrlScannerComponents = {
  lexical: number;
  domain: number;
  reputation: number;
  browser: number;
  ai: number;
};

export type UrlScannerResult = {
  requestedUrl: string;
  normalizedUrl: string;
  finalUrl: string;
  riskScore: number;
  confidence: number;
  verdict: ScanVerdict;
  reasons: string[];
  signals: UrlSignal[];
  components: UrlScannerComponents;
  overrideFlags: string[];
  urlscanUuid?: string;
  urlscanSource?: "none" | "search" | "scan";
  urlscanScore?: number;
  model?: {
    provider: string;
    name: string;
    version: string;
  };
};