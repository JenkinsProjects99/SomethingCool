import { describe, expect, it } from "vitest";
import { startOfLookback, startOfToday } from "@/lib/filters";
import { publishedEventsFromSeedFile } from "@/lib/seed/published-from-file";
import { eventsForThumb, touristWindowEvents } from "@/lib/tourist-feed";

const NOW = new Date("2026-08-29T15:00:00-04:00");

describe("tourist 7-day lookback", () => {
  const events = publishedEventsFromSeedFile();

  it("keeps upcoming first and last week in ET, not all history", () => {
    const today = startOfToday(NOW);
    const lookback = startOfLookback(NOW);
    const windowed = touristWindowEvents(events, NOW);
    expect(lookback.toISOString()).toBe(new Date("2026-08-22T00:00:00-04:00").toISOString());
    expect(windowed.every((event) => event.startsAtDate >= lookback)).toBe(true);
    expect(windowed.some((event) => event.id === "tomcats-football-2026-08-28")).toBe(true);
    expect(windowed.some((event) => event.id === "sammy-kershaw")).toBe(false);

    const upcoming = eventsForThumb(events, "upcoming", NOW);
    const firstPast = upcoming.findIndex((event) => event.startsAtDate < today);
    const lastUpcoming = [...upcoming]
      .map((event, index) => ({ event, index }))
      .filter((row) => row.event.startsAtDate >= today)
      .at(-1)?.index;
    expect(upcoming.some((event) => event.id === "ashland-tomcats-volleyball-johnson-central-2026-08-29")).toBe(
      true,
    );
    if (firstPast !== -1 && lastUpcoming !== undefined) {
      expect(lastUpcoming).toBeLessThan(firstPast);
    }
  });
});
