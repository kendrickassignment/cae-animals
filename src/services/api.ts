const getBackendUrl = (): string => {
  return localStorage.getItem("cae_backend_url") || import.meta.env.VITE_BACKEND_URL || "https://cae-backend-7g72.onrender.com";
};

export function sanitizeErrorMessage(message: string): string {
  // Remove URLs (including those with API keys in query params)
  let sanitized = message.replace(/https?:\/\/[^\s'")]+/gi, "[external service]");
  // Remove standalone API key patterns (long alphanumeric strings 20+ chars)
  sanitized = sanitized.replace(/[A-Za-z0-9_-]{20,}/g, "[redacted]");
  // Remove "For more information check:" references
  sanitized = sanitized.replace(/For more information check:\s*\S*/gi, "");
  // Remove "for url" references
  sanitized = sanitized.replace(/for url\s*'[^']*'/gi, "");
  // Clean up extra whitespace
  sanitized = sanitized.replace(/\s{2,}/g, " ").trim();
  return sanitized;
}

const getProviderConfig = (): { provider: string | null; apiKey: string | null } => {
  return {
    provider: localStorage.getItem("cae_llm_provider"),
    apiKey: localStorage.getItem("cae_api_key"),
  };
};

async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${getBackendUrl()}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    mode: "cors",
    headers: {
      ...options?.headers,
    },
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: "Network error" }));
    throw new Error(sanitizeErrorMessage(error.detail || `API error: ${response.status}`));
  }
  return response.json();
}

export async function uploadReport(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  return apiFetch<{ report_id: string; file_name: string; status: string; message: string }>("/upload", { method: "POST", body: formData });
}

export async function analyzeReport(reportId: string, companyName?: string, reportYear?: number) {
  const { provider, apiKey } = getProviderConfig();
  return apiFetch<{ report_id: string; status: string; message: string; provider: string }>("/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ report_id: reportId, company_name: companyName || null, report_year: reportYear || null, provider: provider || null, api_key: apiKey || null }),
  });
}

export async function getReportStatus(reportId: string, signal?: AbortSignal) {
  return apiFetch<{ id: string; file_name: string; company_name: string | null; status: string; page_count: number | null; analysis_id?: string; error?: string }>(`/reports/${reportId}`, { signal });
}

export async function getAnalysis(analysisId: string) {
  return apiFetch<any>(`/analysis/${analysisId}`);
}

export async function exportAnalysisCsv(analysisId: string) {
  return apiFetch<{ csv: string; company: string; findings_count: number; risk_level: string }>(`/analysis/${analysisId}/export`);
}

export async function listProviders() {
  return apiFetch<{ default: string; available: Record<string, any> }>("/providers");
}

export async function testProvider(provider: string, apiKey?: string) {
  return apiFetch<{ status: string; provider: string; model?: string; message: string; error?: string }>("/providers/test", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ provider, api_key: apiKey || null }),
  });
}

export async function analyzeMultiReport(
  reportIds: string[],
  companyName?: string,
  reportYear?: number,
) {
  const { provider, apiKey } = getProviderConfig();
  return apiFetch<{ report_id: string; status: string; merged_files: number; message: string }>("/analyze-multi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      report_ids: reportIds,
      company_name: companyName || null,
      report_year: reportYear || null,
      provider: provider || null,
      api_key: apiKey || null,
    }),
  });
}

export async function healthCheck() {
  const url = `${getBackendUrl()}/`;
  const response = await fetch(url, { mode: "cors" });
  if (!response.ok) throw new Error(`Backend error: ${response.status}`);
  return response.json();
}

const ALLOWED_BACKENDS = [
  "https://cae-backend-7g72.onrender.com",
  "http://localhost:8000",
];

export function saveBackendUrl(url: string) {
  const cleanUrl = url.replace(/\/$/, "");
  try {
    const parsed = new URL(cleanUrl);
    // Only allow HTTPS (or HTTP for localhost)
    if (parsed.protocol !== "https:" && parsed.hostname !== "localhost") {
      throw new Error("Backend URL must use HTTPS");
    }
    // Reject internal/private IPs
    if (/^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.)/.test(parsed.hostname)) {
      throw new Error("Internal IP addresses are not allowed");
    }
  } catch (err: any) {
    if (err.message.includes("HTTPS") || err.message.includes("Internal")) throw err;
    throw new Error("Invalid backend URL format");
  }
  localStorage.setItem("cae_backend_url", cleanUrl);
}

export function isAllowlistedBackend(url: string): boolean {
  return ALLOWED_BACKENDS.includes(url.replace(/\/$/, ""));
}
export function saveProviderConfig(provider: string, apiKey: string) { localStorage.setItem("cae_llm_provider", provider); localStorage.setItem("cae_api_key", apiKey); }
export function clearSensitiveStorage() { localStorage.removeItem("cae_backend_url"); localStorage.removeItem("cae_api_key"); localStorage.removeItem("cae_llm_provider"); }
export function getStoredBackendUrl(): string { return localStorage.getItem("cae_backend_url") || "https://cae-backend-7g72.onrender.com"; }
export function getStoredProvider(): string { return localStorage.getItem("cae_llm_provider") || "gemini"; }
