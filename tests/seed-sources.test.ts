import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { MAXPREPS_FOOTBALL_ROWS, TARGET_SEED_ROWS } from "@/lib/seed/import-seed";
import { assertAllowedEventUrl } from "@/lib/sources";

const seed = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/seed/ashland-ky-events.v0.json"), "utf8"),
) as { events: Array<{ id: string; source: string; url: string; startsAt: string; title: string }> };

describe("seed source rules", () => {
  it("documents 173 as the current target and does not invent boyd-library rows", () => {
    expect(TARGET_SEED_ROWS).toBe(173);
    const library = seed.events.filter((event) => event.source === "boyd-library");
    expect(library).toHaveLength(0);
  });

  it("includes only the two specified maxpreps football games", () => {
    const football = seed.events.filter((event) => event.source === "maxpreps");
    expect(football).toHaveLength(MAXPREPS_FOOTBALL_ROWS);
    expect(football.map((event) => event.id).sort()).toEqual([
      "ashland-tomcats-football-2026-09-04",
      "boyd-lions-football-2026-09-11",
    ]);
    expect(
      football.find((event) => event.id === "ashland-tomcats-football-2026-09-04"),
    ).toMatchObject({
      title: "Ashland Tomcats Football vs. Lawrence County",
      startsAt: "2026-09-04T19:30:00-04:00",
    });
    expect(
      football.find((event) => event.id === "boyd-lions-football-2026-09-11"),
    ).toMatchObject({
      title: "Boyd County Lions Football vs. Mason County",
      startsAt: "2026-09-11T19:30:00-04:00",
    });
  });

  it("rejects the Ohio library calendar host", () => {
    expect(() =>
      assertAllowedEventUrl(
        "boyd-library",
        "https://ashland.librarycalendar.com/event/storytime",
      ),
    ).toThrow(/Ohio library calendar/);
  });

  it("requires boyd-library urls to be thebookplace.org", () => {
    expect(() =>
      assertAllowedEventUrl("boyd-library", "https://example.com/event"),
    ).toThrow(/thebookplace.org/);
    expect(() =>
      assertAllowedEventUrl("boyd-library", "https://www.thebookplace.org/events/storytime"),
    ).not.toThrow();
  });

  it("keeps every current row on an allowed host", () => {
    for (const event of seed.events) {
      expect(() => assertAllowedEventUrl(event.source, event.url)).not.toThrow();
    }
  });
});
