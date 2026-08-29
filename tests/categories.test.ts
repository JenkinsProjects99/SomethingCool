import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  EVENT_CATEGORIES,
  isCommunityEvent,
  isFirstFridayEvent,
  isSportsEvent,
  sortForTourist,
} from "@/lib/categories";

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

  it("sorts by date first so sports today beat later music", () => {
    const ranked = sortForTourist([
      { category: "music", startsAtDate: new Date("2026-09-04T20:00:00-04:00") },
      { category: "sports", startsAtDate: new Date("2026-08-29T11:00:00-04:00") },
      { category: "family", startsAtDate: new Date("2026-09-04T17:00:00-04:00") },
    ]);
    expect(ranked.map((event) => event.category)).toEqual(["sports", "family", "music"]);
  });

  it("uses category rank only when start times match", () => {
    const sameTime = new Date("2026-09-04T19:30:00-04:00");
    const ranked = sortForTourist([
      { category: "sports", startsAtDate: sameTime },
      { category: "music", startsAtDate: sameTime },
    ]);
    expect(ranked.map((event) => event.category)).toEqual(["music", "sports"]);
  });

  it("puts stored family rows in the Community bucket without reading the title", () => {
    expect(isCommunityEvent({ category: "family" })).toBe(true);
    expect(isCommunityEvent({ category: "community" })).toBe(true);
    expect(isCommunityEvent({ category: "music" })).toBe(false);
    expect(isCommunityEvent({ category: "sports" })).toBe(false);
    const sesame = seed.events.find((event) => event.id === "sesame-street-live");
    expect(sesame?.category).toBe("family");
    expect(isCommunityEvent({ category: sesame!.category as "family" })).toBe(true);
  });

  it("never treats First Friday as a sports event", () => {
    const firstFriday = seed.events.find(
      (event) => event.id === "facebook-first-friday-2026-09-04",
    );
    expect(firstFriday?.category).toBe("community");
    expect(
      isSportsEvent({
        category: firstFriday!.category as "community",
        id: firstFriday!.id,
        title: firstFriday!.title,
      }),
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
