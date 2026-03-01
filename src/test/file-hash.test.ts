import { describe, it, expect, vi } from "vitest";
import { computeFileHash } from "@/lib/file-hash";

describe("computeFileHash", () => {
  it("returns a hex string for valid input", async () => {
    const content = new TextEncoder().encode("hello world");
    const mockFile = {
      arrayBuffer: vi.fn().mockResolvedValue(content.buffer),
    } as unknown as File;

    const hash = await computeFileHash(mockFile);
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns same hash for identical content", async () => {
    const content = new TextEncoder().encode("same content");
    const mockFile1 = { arrayBuffer: vi.fn().mockResolvedValue(content.buffer) } as unknown as File;
    const mockFile2 = { arrayBuffer: vi.fn().mockResolvedValue(content.buffer) } as unknown as File;

    const hash1 = await computeFileHash(mockFile1);
    const hash2 = await computeFileHash(mockFile2);
    expect(hash1).toBe(hash2);
  });

  it("returns different hash for different content", async () => {
    const a = new TextEncoder().encode("content A");
    const b = new TextEncoder().encode("content B");
    const mockA = { arrayBuffer: vi.fn().mockResolvedValue(a.buffer) } as unknown as File;
    const mockB = { arrayBuffer: vi.fn().mockResolvedValue(b.buffer) } as unknown as File;

    const hashA = await computeFileHash(mockA);
    const hashB = await computeFileHash(mockB);
    expect(hashA).not.toBe(hashB);
  });
});
