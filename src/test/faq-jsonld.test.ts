import { describe, it, expect } from "vitest";
import { faqJsonLd } from "@/components/landing/FAQSection";

describe("faqJsonLd structured data", () => {
  it("has correct schema type", () => {
    expect(faqJsonLd["@context"]).toBe("https://schema.org");
    expect(faqJsonLd["@type"]).toBe("FAQPage");
  });

  it("contains mainEntity array with questions", () => {
    expect(Array.isArray(faqJsonLd.mainEntity)).toBe(true);
    expect(faqJsonLd.mainEntity.length).toBeGreaterThan(5);
  });

  it("each entry has correct Question/Answer structure", () => {
    faqJsonLd.mainEntity.forEach((entry: any) => {
      expect(entry["@type"]).toBe("Question");
      expect(typeof entry.name).toBe("string");
      expect(entry.acceptedAnswer["@type"]).toBe("Answer");
      expect(typeof entry.acceptedAnswer.text).toBe("string");
    });
  });

  it("includes key questions", () => {
    const questions = faqJsonLd.mainEntity.map((e: any) => e.name);
    expect(questions).toContain("What is CAE?");
    expect(questions).toContain("How does CAE work?");
    expect(questions).toContain("Is CAE free to use?");
  });
});
