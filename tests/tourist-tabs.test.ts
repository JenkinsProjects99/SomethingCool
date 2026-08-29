import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { startOfLookback } from "@/lib/filters";
import { publishedEventsFromSeedFile } from "@/lib/seed/published-from-file";
import { eventsForThumb, eventsForTouristView, THIS_WEEK_HEADLINERS } from "@/lib/tourist-feed";

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
    expect(phone).toContain('useState<TimeTab>("week")');
    expect(phone).toContain("This Week");
    expect(phone).toContain("Community");
    expect(phone).not.toContain('label: "Family"');
    expect(phone).toContain("{event.venue}");
    expect(phone).toContain("Event Details");
  });

  it("pins Paramount and Visit AKY headliners above the date-first This Week list", () => {
    const week = eventsForTouristView(events, "week", "all", NOW);
    expect(THIS_WEEK_HEADLINERS).toEqual([
      "deana-carter",
      "facebook-first-friday-2026-09-04",
      "makers-market",
    ]);
    expect(week.slice(0, 7).map((event) => event.id)).toEqual([
      "deana-carter",
      "facebook-first-friday-2026-09-04",
      "makers-market",
      "ashland-tomcats-volleyball-johnson-central-2026-08-29",
      "fairview-eagles-volleyball-rose-hill-2026-08-29",
      "ashland-tomcats-volleyball-wolfe-county-2026-08-29",
      "sandys-exacta-giveaway-bronco-sport-2026-08-29",
    ]);
    expect(week.filter((event) => event.id === "deana-carter")).toHaveLength(1);
    expect(week.some((event) => event.id === "tomcats-football-2026-08-28")).toBe(false);
    expect(week[5]?.title).toMatch(/Wolfe County/);
  });

  it("does not pin headliners onto Sports This Week", () => {
    const sports = eventsForTouristView(events, "week", "sports", NOW);
    expect(sports[0]?.id).toBe("ashland-tomcats-volleyball-johnson-central-2026-08-29");
    expect(sports.every((event) => !(THIS_WEEK_HEADLINERS as readonly string[]).includes(event.id))).toBe(
      true,
    );
    expect(sports.every((event) => !/first[\s-]?friday/i.test(`${event.id} ${event.title}`))).toBe(true);
  });

  it("sorts upcoming by date so this weekend beats later music", () => {
    const upcoming = eventsForThumb(events, "upcoming", NOW);
    const volleyball = upcoming.findIndex(
      (event) => event.id === "ashland-tomcats-volleyball-johnson-central-2026-08-29",
    );
    const deana = upcoming.findIndex((event) => event.id === "deana-carter");
    expect(volleyball).toBe(0);
    expect(deana).toBeGreaterThan(volleyball);
    expect(upcoming.slice(0, 7).map((event) => event.id)).toEqual([
      "ashland-tomcats-volleyball-johnson-central-2026-08-29",
      "fairview-eagles-volleyball-rose-hill-2026-08-29",
      "ashland-tomcats-volleyball-wolfe-county-2026-08-29",
      "sandys-exacta-giveaway-bronco-sport-2026-08-29",
      "boyd-library-midland-novel-tea-book-club-2026-08-31",
      "boyd-lions-girls-soccer-greenup-2026-08-31",
      "boyd-lions-boys-soccer-greenup-2026-08-31",
    ]);
    expect(upcoming[7]?.startsAtDate.getTime()).toBeGreaterThan(
      new Date("2026-08-31T23:59:59-04:00").getTime(),
    );
  });

  it("filters music, sports, and community (family bucket) from upcoming rows", () => {
    const music = eventsForThumb(events, "music", NOW);
    const sports = eventsForThumb(events, "sports", NOW);
    const communityUpcoming = eventsForThumb(events, "community", NOW);
    expect(music.map((event) => event.id)).toContain("deana-carter");
    expect(music.every((event) => event.category === "music")).toBe(true);
    expect(sports.every((event) => event.category === "sports")).toBe(true);
    expect(
      sports.every(
        (event) => !/first[\s-]?friday/i.test(`${event.id} ${event.title}`),
      ),
    ).toBe(true);
    expect(sports.some((event) => event.id.includes("first-friday"))).toBe(false);
    expect(
      communityUpcoming.every(
        (event) => event.category === "community" || event.category === "family",
      ),
    ).toBe(true);
    expect(communityUpcoming.some((event) => event.category === "family")).toBe(true);
    const sesame = communityUpcoming.find((event) => event.id === "sesame-street-live");
    expect(sesame?.category).toBe("family");
    const community = eventsForTouristView(events, "week", "community", NOW);
    expect(community.length).toBeGreaterThan(0);
    expect(
      community.every((event) => event.category === "community" || event.category === "family"),
    ).toBe(true);
    expect(community.some((event) => event.category === "family")).toBe(true);
    expect(community.slice(0, 2).map((event) => event.id)).toEqual([
      "facebook-first-friday-2026-09-04",
      "makers-market",
    ]);
    expect(community.some((event) => event.id === "boyd-library-storytime-midland-ages-3-5-12469")).toBe(
      true,
    );
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
