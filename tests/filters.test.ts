import { describe, expect, it } from "vitest";
import { eventInRange, filterEventsByRange, parseEmbedRange, parsePublicRange } from "@/lib/filters";

describe("calendar ranges", () => {
  const now = new Date("2026-08-29T15:00:00-04:00");

  it("defaults public range to this month and embed range to upcoming", () => {
    expect(parsePublicRange(undefined)).toBe("month");
    expect(parseEmbedRange(undefined)).toBe("upcoming");
  });

  it("keeps Deana Carter in September month and upcoming from late August", () => {
    const deana = new Date("2026-09-04T20:00:00-04:00");
    expect(eventInRange(deana, "month", now)).toBe(false);
    expect(eventInRange(deana, "upcoming", now)).toBe(true);
    expect(eventInRange(deana, "all", now)).toBe(true);
    expect(eventInRange(deana, "month", new Date("2026-09-01T08:00:00-04:00"))).toBe(true);
  });

  it("rolls this month forward when the current month has no remaining events", () => {
    const augustPast = { startsAt: new Date("2026-08-07T17:00:00-04:00") };
    const deana = { startsAt: new Date("2026-09-04T20:00:00-04:00") };
    const rolled = filterEventsByRange([augustPast, deana], "month", now);
    expect(rolled).toEqual([deana]);
  });

  it("treats this week as the current Sunday-Saturday window", () => {
    const friday = new Date("2026-08-28T12:00:00-04:00");
    const nextFriday = new Date("2026-09-04T12:00:00-04:00");
    expect(eventInRange(friday, "week", now)).toBe(true);
    expect(eventInRange(nextFriday, "week", now)).toBe(false);
  });
});
