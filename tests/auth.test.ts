import { describe, expect, it } from "vitest";
import { hashToken, parseBearer, tokensEqual } from "@/lib/auth";
import { UnauthorizedError } from "@/lib/tenant";

describe("bearer auth", () => {
  it("parses a bearer header", () => {
    expect(parseBearer("Bearer dev-ashland-ky-local-token")).toBe(
      "dev-ashland-ky-local-token",
    );
  });

  it("rejects missing or malformed headers", () => {
    expect(() => parseBearer(null)).toThrow(UnauthorizedError);
    expect(() => parseBearer("Basic abc")).toThrow(UnauthorizedError);
    expect(() => parseBearer("Bearer")).toThrow(UnauthorizedError);
  });

  it("hashes tokens stably and compares them in constant time", () => {
    const hash = hashToken("dev-ashland-ky-local-token");
    expect(hash).toHaveLength(64);
    expect(hashToken("dev-ashland-ky-local-token")).toBe(hash);
    expect(tokensEqual(hash, hash)).toBe(true);
    expect(tokensEqual(hash, hashToken("other"))).toBe(false);
  });
});
