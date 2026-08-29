import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isDateOnly } from "@/lib/fields";
import {
  OFFICIAL_IMAGE_ROWS,
  ORIGINAL_SEED_ROWS,
  SPECIFIED_MAXPREPS_ROWS,
  TARGET_BOYD_LIBRARY_ROWS,
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
    category: string;
  }>;
};

describe("seed source rules", () => {
  it("ships official rows without invented pub nights", () => {
    expect(TARGET_SEED_ROWS).toBe(231);
    expect(seed.events).toHaveLength(TARGET_SEED_ROWS);
    expect(seed.events.length).toBeGreaterThanOrEqual(ORIGINAL_SEED_ROWS);
    expect(seed.events.filter((event) => event.source === "boyd-library").length).toBeGreaterThanOrEqual(
      TARGET_BOYD_LIBRARY_ROWS,
    );
    const pubNights = seed.events.filter((event) =>
      /pub night|jerk riley|kel'?s/i.test(`${event.id} ${event.title}`),
    );
    expect(pubNights).toHaveLength(0);
  });

  it("keeps at most 14 official Paramount/Visit AKY image URLs and nulls the rest", () => {
    const withImages = seed.events.filter((event) => event.image);
    expect(withImages.length).toBeGreaterThan(0);
    expect(withImages.length).toBeLessThanOrEqual(OFFICIAL_IMAGE_ROWS);
    for (const event of withImages) {
      const host = new URL(event.image as string).hostname;
      expect(["cdn.saffire.com", "static.showit.co"]).toContain(host);
      expect(["paramount", "visit-aky"]).toContain(event.source);
    }
    expect(seed.events.filter((event) => event.image === null)).toHaveLength(
      TARGET_SEED_ROWS - withImages.length,
    );
    expect(JSON.stringify(seed.events)).not.toMatch(/visit-aky-logo|\/brand\/visit|visit\.png/i);
  });

  it("keeps the specified maxpreps football games", () => {
    const specified = seed.events.filter((event) =>
      [
        "ashland-tomcats-football-2026-09-04",
        "boyd-lions-football-2026-09-11",
      ].includes(event.id),
    );
    expect(specified).toHaveLength(SPECIFIED_MAXPREPS_ROWS);
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
    expect(
      seed.events.find((event) => event.id === "poage-landing-days-opening-ceremony-2026-09-19"),
    ).toMatchObject({ startsAt: "2026-09-19T19:00:00-04:00", category: "community" });
    expect(
      seed.events.find((event) => event.id === "poage-landing-days-jigjam-2026-09-19"),
    ).toMatchObject({ startsAt: "2026-09-19T19:15:00-04:00", category: "music" });
    expect(
      seed.events.find((event) => event.id === "poage-landing-days-kentucky-headhunters-2026-09-19"),
    ).toMatchObject({ startsAt: "2026-09-19T21:00:00-04:00", category: "music" });
    expect(
      seed.events.find((event) => event.id === "poage-landing-days-house-of-grace-2026-09-20"),
    ).toMatchObject({ startsAt: "2026-09-20T11:00:00-04:00", category: "music" });
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
    const thanksgiving = seed.events.find(
      (event) => event.id === "sandys-thanksgiving-eve-2026-11-25",
    );
    const nye = seed.events.find((event) => event.id === "sandys-new-years-eve-2026-12-31");
    expect(thanksgiving).toMatchObject({
      title: "Thanksgiving Eve at Sandy's",
      startsAt: "2026-11-25T10:00:00-05:00",
      source: "facebook",
      image: null,
      category: "food",
    });
    expect(nye).toMatchObject({
      title: "New Year's Eve at Sandy's",
      startsAt: "2026-12-31T10:00:00-05:00",
      source: "facebook",
      image: null,
      category: "food",
    });
    for (const event of [thanksgiving, nye]) {
      expect(event).toHaveProperty("id");
      expect(event).toHaveProperty("title");
      expect(event).toHaveProperty("startsAt");
      expect(event).toHaveProperty("endsAt");
      expect(event).toHaveProperty("timezone");
      expect(event).toHaveProperty("venue");
      expect(event).toHaveProperty("address");
      expect(event).toHaveProperty("url");
      expect(event).toHaveProperty("source");
      expect(event).toHaveProperty("image");
      expect(event).toHaveProperty("category");
    }
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
