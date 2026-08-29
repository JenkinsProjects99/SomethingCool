import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  eventInWindow,
  parseToBound,
  parseWindowBound,
  serializeWindowBound,
} from "@/lib/filters";
import { InvalidQueryError } from "@/lib/tenant";

describe("frozen from/to query window", () => {
  it("is wired on GET /v1/:tenant/events", () => {
    const route = readFileSync(
      path.join(process.cwd(), "src/app/v1/[tenant]/events/route.ts"),
      "utf8",
    );
    expect(route).toContain('url.searchParams.get("from")');
    expect(route).toContain('url.searchParams.get("to")');
    expect(route).toContain("from: fromOut");
    expect(route).toContain("to: toOut");
  });

  it("parses date-only and offset bounds, inclusive from and exclusive to", () => {
    const from = parseWindowBound("2026-09-18");
    const to = parseWindowBound("2026-09-21");
    const poage = new Date("2026-09-18T00:00:00-04:00");
    const later = new Date("2026-09-21T00:00:00-04:00");
    expect(eventInWindow(poage, { from, to })).toBe(true);
    expect(eventInWindow(later, { from, to })).toBe(false);
    expect(serializeWindowBound(from)).toBe("2026-09-18");
    expect(serializeWindowBound(to)).toBe("2026-09-21");
  });

  it("treats date-only to as including that calendar day in America/New_York", () => {
    const from = parseWindowBound("2026-08-29");
    const to = parseToBound("2026-08-31");
    expect(eventInWindow(new Date("2026-08-31T20:00:00-04:00"), { from, to })).toBe(true);
    expect(eventInWindow(new Date("2026-09-01T00:00:00-04:00"), { from, to })).toBe(false);
  });

  it("rejects a malformed from/to value", () => {
    expect(() => parseWindowBound("next-friday")).toThrow(InvalidQueryError);
  });
});
