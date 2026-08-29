import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { startOfLookback } from "@/lib/filters";
import { publishedEventsFromSeedFile } from "@/lib/seed/published-from-file";
import { eventsForThumb } from "@/lib/tourist-feed";

const NOW = new Date("2026-08-29T15:00:00-04:00");

describe("tourist upcoming bar and calendar tab", () => {
  const events = publishedEventsFromSeedFile();

  it("shows upcoming-only photo cards in ET including Sean's weekend rows", () => {
    const upcoming = eventsForThumb(events, "upcoming", NOW);
    expect(upcoming.length).toBeGreaterThan(0);
    expect(upcoming.every((event) => event.startsAtDate >= startOfLookback(NOW))).toBe(true);
    expect(
      upcoming.some((event) => event.id === "ashland-tomcats-volleyball-johnson-central-2026-08-29"),
    ).toBe(true);
    expect(upcoming.some((event) => event.id === "sandys-exacta-giveaway-bronco-sport-2026-08-29")).toBe(
      true,
    );
    expect(upcoming.some((event) => event.id === "tomcats-football-2026-08-28")).toBe(true);
    expect(upcoming.some((event) => event.id === "sammy-kershaw")).toBe(false);
    expect(upcoming.some((event) => !event.image)).toBe(true);
    const phone = readFileSync(path.join(process.cwd(), "src/components/PhoneApp.tsx"), "utf8");
    expect(phone).toContain('event.image ?? "/brand/visit-aky-logo.png"');
    expect(phone).toContain("MonthCalendar");
    expect(phone).toContain('setView("calendar")');
    expect(phone).toContain('useState<TouristThumb>("upcoming")');
  });

  it("filters music, sports, and family tabs from upcoming rows", () => {
    const music = eventsForThumb(events, "music", NOW);
    const sports = eventsForThumb(events, "sports", NOW);
    const family = eventsForThumb(events, "family", NOW);
    expect(music.map((event) => event.id)).toContain("deana-carter");
    expect(music.every((event) => event.category === "music")).toBe(true);
    expect(sports.every((event) => event.category === "sports")).toBe(true);
    expect(family.every((event) => event.category === "family")).toBe(true);
  });

  it("renders a month grid a tourist can read", () => {
    const calendar = readFileSync(
      path.join(process.cwd(), "src/components/MonthCalendar.tsx"),
      "utf8",
    );
    expect(calendar).toContain('role="grid"');
    expect(calendar).toContain("month-cal__list");
    expect(calendar).toContain("WEEKDAYS");
  });
});
