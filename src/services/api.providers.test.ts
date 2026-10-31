import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import { analyzeReport, analyzeMultiReport, getStoredProvider, saveProviderConfig } from "./api";

describe("two-provider configuration", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ status: "processing" }) }));
  });
  afterEach(() => vi.unstubAllGlobals());

  it.each(["openai", "groq", "mistral", "unknown"])("does not forward a legacy %s key to Gemini", async (provider) => {
    localStorage.setItem("cae_llm_provider", provider);
    localStorage.setItem("cae_api_key", "old-secret");
    expect(getStoredProvider()).toBe("gemini");
    await analyzeReport("report-1");
    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(body.provider).toBe("gemini");
    expect(body.api_key).toBeNull();
  });

  it.each(["gemini", "qwen"])("preserves the selected %s provider and key in both request paths", async (provider) => {
    saveProviderConfig(provider, "provider-key");
    expect(getStoredProvider()).toBe(provider);
    await analyzeReport("report-1");
    await analyzeMultiReport(["report-1", "report-2"]);
    for (const [, options] of vi.mocked(fetch).mock.calls) {
      expect(JSON.parse(options!.body as string)).toMatchObject({ provider, api_key: "provider-key" });
    }
  });

  it("rejects unsupported saves and does not reuse an unassociated key", async () => {
    expect(() => saveProviderConfig("openai", "key")).toThrow();
    localStorage.setItem("cae_api_key", "orphan-secret");
    await analyzeReport("report-1");
    expect(JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string).api_key).toBeNull();
  });
});
