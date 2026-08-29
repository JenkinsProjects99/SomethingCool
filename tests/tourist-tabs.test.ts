import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { publishedEventsFromSeedFile } from "@/lib/seed/published-from-file";
import { eventsForThumb } from "@/lib/tourist-feed";

const NOW = new Date("2026-08-29T15:00:00-04:00");

describe("tourist first screen and category tabs", () => {
  const events = publishedEventsFromSeedFile();

  it("shows photo cards and Sep 4 tourist events on Friday Aug 29, 2026", () => {
    const weekend = eventsForThumb(events, "weekend", NOW);
    expect(weekend.length).toBeGreaterThan(0);
    expect(
      weekend.some((event) => event.id === "ashland-tomcats-volleyball-johnson-central-2026-08-29"),
    ).toBe(true);
    expect(weekend.some((event) => !event.image)).toBe(true);
    const phone = readFileSync(path.join(process.cwd(), "src/components/PhoneApp.tsx"), "utf8");
    expect(phone).toContain("cardImageSrc(event.image)");
    expect(phone).toContain("MonthCalendar");
    expect(phone).toContain('setView("calendar")');
  });

  it("filters music, sports, and family tabs instead of no-ops", () => {
    const music = eventsForThumb(events, "music", NOW);
    const sports = eventsForThumb(events, "sports", NOW);
    const family = eventsForThumb(events, "family", NOW);
    expect(music.map((event) => event.id)).toContain("deana-carter");
    expect(music.every((event) => event.category === "music")).toBe(true);
    expect(sports.map((event) => event.id)).toContain("ashland-tomcats-football-2026-09-04");
    expect(sports.every((event) => event.category === "sports")).toBe(true);
    expect(family.map((event) => event.id)).toContain("sesame-street-live");
    expect(family.every((event) => event.category === "family")).toBe(true);
    expect(new Set([music[0]?.id, sports[0]?.id, family[0]?.id]).size).toBeGreaterThan(1);
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
