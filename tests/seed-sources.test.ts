import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isDateOnly } from "@/lib/fields";
import {
  SPECIFIED_MAXPREPS_ROWS,
  TARGET_BOYD_LIBRARY_ROWS,
  TARGET_MAXPREPS_ROWS,
  TARGET_SEED_ROWS,
} from "@/lib/seed/import-seed";
import { assertAllowedEventUrl } from "@/lib/sources";

const seed = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/seed/ashland-ky-events.v0.json"), "utf8"),
) as {
  events: Array<{
    id: string;
    source: string;
    url: string;
    startsAt: string;
    endsAt: string | null;
    title: string;
    image: string | null;
  }>;
};

describe("seed source rules", () => {
  it("documents 225 as the target and does not invent boyd-library or pub nights", () => {
    expect(TARGET_SEED_ROWS).toBe(27 + TARGET_BOYD_LIBRARY_ROWS + TARGET_MAXPREPS_ROWS + 10);
    expect(TARGET_SEED_ROWS).toBe(225);
    expect(seed.events.filter((event) => event.source === "boyd-library")).toHaveLength(0);
    const pubNights = seed.events.filter((event) =>
      /pub night|jerk riley|kel'?s/i.test(`${event.id} ${event.title}`),
    );
    expect(pubNights).toHaveLength(0);
    expect(seed.events.every((event) => event.image === null)).toBe(true);
  });

  it("includes only the specified maxpreps football games until more kickoffs are provided", () => {
    const football = seed.events.filter((event) => event.source === "maxpreps");
    expect(football).toHaveLength(SPECIFIED_MAXPREPS_ROWS);
    expect(football.map((event) => event.id).sort()).toEqual([
      "ashland-tomcats-football-2026-09-04",
      "boyd-lions-football-2026-09-11",
    ]);
  });

  it("includes specified school rows with published times and date-only Poage Landing Days", () => {
    expect(seed.events.some((event) => event.id === "boyd-xc-invitational-2026-09-12")).toBe(
      true,
    );
    expect(seed.events.some((event) => event.id === "boyd-basketball-2026-12-01")).toBe(true);
    expect(seed.events.some((event) => event.id === "fairview-basketball-2026-12-28")).toBe(
      true,
    );
    const poage = seed.events.find((event) => event.id === "poage-landing-days-2026");
    expect(poage).toMatchObject({
      title: "Poage Landing Days",
      startsAt: "2026-09-18",
      endsAt: "2026-09-20",
      source: "facebook",
      image: null,
    });
    expect(isDateOnly(poage?.startsAt ?? "")).toBe(true);
  });

  it("includes the specified Sandy's facebook nights and no invented pub nights", () => {
    const birthday = seed.events.find((event) => event.id === "sandys-birthday-weekend-2026-10-23");
    const halloween = seed.events.find((event) => event.id === "sandys-halloween-party-2026-10-31");
    expect(birthday).toMatchObject({
      title: "Sandy's 3rd Birthday Weekend Celebration",
      startsAt: "2026-10-23T12:00:00-04:00",
      endsAt: "2026-10-25T19:00:00-04:00",
      source: "facebook",
      image: null,
    });
    expect(halloween).toMatchObject({
      title: "Sandy's Halloween Party",
      startsAt: "2026-10-31T19:00:00-04:00",
      source: "facebook",
      image: null,
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
