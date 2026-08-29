import { describe, expect, it } from "vitest";
import {
  eventInRange,
  eventInWindow,
  filterEventsByRange,
  firstScreenEvents,
  parseEmbedRange,
  parsePublicRange,
  thisWeekendWindow,
} from "@/lib/filters";

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

  it("rolls this weekend forward when the current Fri–Sun is empty", () => {
    const deana = { startsAt: new Date("2026-09-04T20:00:00-04:00") };
    const window = thisWeekendWindow(now, [deana]);
    expect(eventInWindow(deana.startsAt, window)).toBe(true);
    expect(eventInWindow(new Date("2026-08-29T12:00:00-04:00"), window)).toBe(false);
  });

  it("fills the first screen with upcoming tourist events when this weekend is empty", () => {
    const deana = { startsAt: new Date("2026-09-04T20:00:00-04:00"), id: "deana-carter" };
    const fridayIfAug29IsFriday = new Date("2026-08-29T15:00:00-04:00");
    const shown = firstScreenEvents([deana], fridayIfAug29IsFriday);
    expect(shown.map((event) => event.id)).toContain("deana-carter");
  });

  it("pads a sparse weekend with the next upcoming rows so the first screen is not empty", () => {
    const weekendOnly = { startsAt: new Date("2026-08-30T12:00:00-04:00"), id: "one" };
    const later = [
      { startsAt: new Date("2026-09-04T20:00:00-04:00"), id: "deana-carter" },
      { startsAt: new Date("2026-09-10T20:00:00-04:00"), id: "ashley-mcbryde" },
      { startsAt: new Date("2026-09-12T09:00:00-04:00"), id: "makers" },
      { startsAt: new Date("2026-09-18T00:00:00-04:00"), id: "poage" },
      { startsAt: new Date("2026-09-19T10:00:00-04:00"), id: "walk" },
    ];
    const shown = firstScreenEvents([weekendOnly, ...later], now);
    expect(shown.length).toBeGreaterThanOrEqual(6);
    expect(shown[0]?.id).toBe("one");
    expect(shown.map((event) => event.id)).toContain("deana-carter");
  });
});
