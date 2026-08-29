import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EVENT_CATEGORIES, isFirstFridayEvent, isSportsEvent, sortForTourist } from "@/lib/categories";

const seed = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/seed/ashland-ky-events.v0.json"), "utf8"),
) as {
  events: Array<{ id: string; source: string; title: string; category: string }>;
};

describe("stored category", () => {
  it("uses the frozen additive set and does not infer category from source", () => {
    expect(EVENT_CATEGORIES).toEqual([
      "music",
      "sports",
      "family",
      "arts",
      "community",
      "food",
      "outdoor",
    ]);
    const paramount = seed.events.filter((event) => event.source === "paramount");
    expect(paramount.some((event) => event.category === "music")).toBe(true);
    expect(paramount.some((event) => event.category === "family")).toBe(true);
    expect(new Set(paramount.map((event) => event.category)).size).toBeGreaterThan(1);
  });

  it("marks kids Paramount shows as family", () => {
    const kids = ["beetlejuice-jr", "sesame-street-live", "blippi", "ashland-youth-ballet-nutcracker"];
    for (const id of kids) {
      const row = seed.events.find((event) => event.id === id);
      expect(row?.source).toBe("paramount");
      expect(row?.category).toBe("family");
    }
    expect(seed.events.find((event) => event.id === "deana-carter")?.category).toBe("music");
  });

  it("sorts music and family ahead of sports", () => {
    const ranked = sortForTourist([
      { category: "sports", startsAtDate: new Date("2026-09-04T19:30:00-04:00") },
      { category: "family", startsAtDate: new Date("2026-09-04T17:00:00-04:00") },
      { category: "music", startsAtDate: new Date("2026-09-04T20:00:00-04:00") },
    ]);
    expect(ranked.map((event) => event.category)).toEqual(["music", "family", "sports"]);
  });

  it("never treats First Friday as a sports event", () => {
    expect(
      seed.events.some((event) => /first[\s-]?friday/i.test(`${event.id} ${event.title}`)),
    ).toBe(false);
    expect(
      isSportsEvent({
        category: "sports",
        id: "first-friday-september",
        title: "First Friday September",
      }),
    ).toBe(false);
    expect(isFirstFridayEvent({ id: "first-friday-august", title: "First Friday August" })).toBe(
      true,
    );
    expect(isSportsEvent({ category: "sports", id: "tomcats-football-2026-08-28", title: "Ashland Tomcats Football" })).toBe(
      true,
    );
  });
});
