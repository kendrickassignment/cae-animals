import { describe, it, expect } from "vitest";
import { fuzzyMatch, fuzzyMatchName } from "@/lib/fuzzy-search";

describe("fuzzyMatch", () => {
  it("returns true for empty query", () => {
    expect(fuzzyMatch("", "anything")).toBe(true);
    expect(fuzzyMatch("  ", "anything")).toBe(true);
  });

  it("matches exact substrings", () => {
    expect(fuzzyMatch("nest", "Nestlé Corporation")).toBe(true);
    expect(fuzzyMatch("sustainability", "Corporate Sustainability Report")).toBe(true);
  });

  it("is case insensitive", () => {
    expect(fuzzyMatch("IKEA", "ikea holdings")).toBe(true);
    expect(fuzzyMatch("ikea", "IKEA Holdings")).toBe(true);
  });

  it("handles typos with Levenshtein tolerance", () => {
    expect(fuzzyMatch("nestle", "nestlé")).toBe(true);
    expect(fuzzyMatch("mcdonals", "mcdonalds")).toBe(true);
  });

  it("rejects non-matching strings", () => {
    expect(fuzzyMatch("zebra", "corporate sustainability")).toBe(false);
    expect(fuzzyMatch("xyz123", "nestlé report")).toBe(false);
  });

  it("matches multi-word queries where all words match", () => {
    expect(fuzzyMatch("cage free", "cage-free egg commitment")).toBe(true);
  });
});

describe("fuzzyMatchName", () => {
  it("returns true for empty query", () => {
    expect(fuzzyMatchName("", "Company")).toBe(true);
  });

  it("matches exact company names", () => {
    expect(fuzzyMatchName("McDonald's", "McDonald's Corporation")).toBe(true);
  });

  it("matches with prefix", () => {
    expect(fuzzyMatchName("Nest", "Nestlé")).toBe(true);
  });

  it("tolerates typos in company names", () => {
    expect(fuzzyMatchName("mcdonals", "mcdonalds")).toBe(true);
  });

  it("rejects completely unrelated names", () => {
    expect(fuzzyMatchName("zebra", "nestlé")).toBe(false);
  });
});
