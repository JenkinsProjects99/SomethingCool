import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { eventsForThumb } from "@/lib/tourist-feed";
import { parseToBound, parseWindowBound, startOfToday, upcomingOnly } from "@/lib/filters";
import { publishedEventsFromSeedQuery } from "@/lib/published-feed";
import { publishedEventsFromSeedFile } from "@/lib/seed/published-from-file";

const NOW = new Date("2026-08-29T15:00:00-04:00");

describe("public UI is upcoming only", () => {
  const seed = publishedEventsFromSeedFile();

  it("hides past rows from the phone PWA, calendar, and embed on 2026-08-29 ET", () => {
    const tourist = upcomingOnly(seed, NOW);
    expect(tourist.some((event) => event.id === "sammy-kershaw")).toBe(false);
    expect(tourist.some((event) => event.id === "beetlejuice-jr")).toBe(false);
    expect(tourist.some((event) => event.id === "shrek-the-musical")).toBe(false);
    expect(tourist.some((event) => event.id === "tomcats-football-2026-08-28")).toBe(false);
    expect(tourist.some((event) => event.id === "ashland-tomcats-volleyball-johnson-central-2026-08-29")).toBe(
      true,
    );
    const weekend = eventsForThumb(seed, "weekend", NOW);
    expect(weekend.every((event) => event.startsAtDate >= startOfToday(NOW))).toBe(true);
    const calendar = readFileSync(path.join(process.cwd(), "src/components/CalendarView.tsx"), "utf8");
    const phone = readFileSync(path.join(process.cwd(), "src/components/PhoneApp.tsx"), "utf8");
    const embed = readFileSync(path.join(process.cwd(), "src/app/embed/page.tsx"), "utf8");
    expect(calendar).toContain("upcomingOnly");
    expect(phone).toContain("upcomingOnly");
    expect(embed).toContain("CalendarView");
  });

  it("still returns past rows on the partner feed when from/to asks for the past", () => {
    const may = publishedEventsFromSeedQuery({
      from: parseWindowBound("2026-05-01"),
      to: parseToBound("2026-06-01"),
    });
    expect(may.some((event) => event.id === "sammy-kershaw")).toBe(true);
  });
});
