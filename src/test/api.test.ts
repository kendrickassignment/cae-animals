import { describe, it, expect } from "vitest";
import { sanitizeErrorMessage } from "@/services/api";

describe("sanitizeErrorMessage", () => {
  it("removes URLs from error messages", () => {
    const msg = "Failed to connect to https://api.example.com/v1/chat";
    const result = sanitizeErrorMessage(msg);
    expect(result).not.toContain("https://");
    expect(result).toContain("[external service]");
  });

  it("redacts long API key patterns", () => {
    const msg = "Invalid key: sk_test_abcdefghijklmnopqrstuvwxyz123456";
    const result = sanitizeErrorMessage(msg);
    expect(result).toContain("[redacted]");
    expect(result).not.toContain("abcdefghijklmnopqrstuvwxyz");
  });

  it("removes 'For more information check' references", () => {
    const msg = "Error occurred For more information check: https://docs.example.com";
    const result = sanitizeErrorMessage(msg);
    expect(result).not.toContain("For more information check");
  });

  it("cleans up extra whitespace", () => {
    const msg = "Error   occurred   here";
    const result = sanitizeErrorMessage(msg);
    expect(result).not.toContain("  ");
  });

  it("handles clean messages without modification", () => {
    const msg = "Network error";
    expect(sanitizeErrorMessage(msg)).toBe("Network error");
  });
});
