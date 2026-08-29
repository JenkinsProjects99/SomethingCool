import { describe, expect, it } from "vitest";
import { splitFeatured, type CalendarEvent } from "@/lib/events";

function event(slug: string, startsAt: string): CalendarEvent {
  return {
    title: slug,
    slug,
    startsAt,
    endsAt: null,
    venue: "Paramount Theater Ashland",
    source: "Paramount Theater Ashland",
    url: "https://example.com",
    summary: "test",
    status: "published",
    startsAtDate: new Date(startsAt),
    endsAtDate: null,
  };
}

describe("featured split", () => {
  it("prefers upcoming events even when past rows sort first", () => {
    const now = new Date("2026-08-29T15:00:00-04:00");
    const { featured, rest } = splitFeatured(
      [
        event("sammy-kershaw", "2026-05-15T19:30:00-04:00"),
        event("first-friday-september", "2026-09-04T17:00:00-04:00"),
        event("deana-carter", "2026-09-04T20:00:00-04:00"),
      ],
      2,
      now,
    );
    expect(featured.map((row) => row.slug)).toEqual([
      "first-friday-september",
      "deana-carter",
    ]);
    expect(rest.map((row) => row.slug)).toEqual(["sammy-kershaw"]);
  });
});
