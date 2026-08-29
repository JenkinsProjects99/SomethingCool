import { describe, expect, it } from "vitest";
import { parseToBound, parseWindowBound } from "@/lib/filters";
import {
  preferOfficialSeedFile,
  publishedEventsFromSeedQuery,
  shouldPreferOfficialSeedFile,
} from "@/lib/published-feed";
import { publishedEventsFromSeedFile } from "@/lib/seed/published-from-file";

describe("reload uses Sean’s 225-row file, not a stale stub", () => {
  it("prefers the official file when Postgres still has the ~32-row stub", () => {
    const seed = publishedEventsFromSeedFile();
    const stub = seed.slice(0, 32);
    expect(shouldPreferOfficialSeedFile(stub.length)).toBe(true);
    expect(preferOfficialSeedFile(seed, stub)).toBe(seed);
    expect(preferOfficialSeedFile(seed, seed)).toBe(seed);
  });

  it("does not let a month-window stub out-count the official file", () => {
    expect(shouldPreferOfficialSeedFile(32)).toBe(true);
    const weekend = publishedEventsFromSeedQuery({
      from: parseWindowBound("2026-08-29"),
      to: parseToBound("2026-08-31"),
    });
    expect(weekend.map((event) => event.id)).toEqual([
      "ashland-tomcats-volleyball-johnson-central-2026-08-29",
      "fairview-eagles-volleyball-rose-hill-2026-08-29",
      "ashland-tomcats-volleyball-wolfe-county-2026-08-29",
      "sandys-exacta-giveaway-bronco-sport-2026-08-29",
      "boyd-library-midland-novel-tea-book-club-2026-08-31",
      "boyd-lions-girls-soccer-greenup-2026-08-31",
      "boyd-lions-boys-soccer-greenup-2026-08-31",
    ]);
  });

  it("keeps category on every published seed payload", () => {
    const all = publishedEventsFromSeedQuery({ range: "all" });
    expect(all.length).toBeGreaterThan(200);
    expect(all.every((event) => Boolean(event.category))).toBe(true);
  });
});
