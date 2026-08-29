import { describe, expect, it } from "vitest";
import { splitFeatured, type CalendarEvent } from "@/lib/events";

function event(id: string, startsAt: string): CalendarEvent {
  return {
    id,
    title: id,
    slug: id,
    startsAt,
    endsAt: null,
    timezone: "America/New_York",
    venue: "Paramount Theater Ashland",
    address: "1300 Winchester Ave, Ashland, KY 41101",
    source: "paramount",
    url: "https://example.com",
    image: null,
    category: "music",
    startsAtDate: new Date(startsAt),
    endsAtDate: null,
    dateOnly: false,
  };
}

describe("featured split", () => {
  it("prefers upcoming events even when past rows sort first", () => {
    const now = new Date("2026-08-29T15:00:00-04:00");
    const { featured, rest } = splitFeatured(
      [
        event("sammy-kershaw", "2026-05-15T19:30:00-04:00"),
        event("ashland-tomcats-football-2026-09-04", "2026-09-04T19:30:00-04:00"),
        event("deana-carter", "2026-09-04T20:00:00-04:00"),
      ],
      2,
      now,
    );
    expect(featured.map((row) => row.id)).toEqual([
      "ashland-tomcats-football-2026-09-04",
      "deana-carter",
    ]);
    expect(rest.map((row) => row.id)).toEqual(["sammy-kershaw"]);
  });
});
