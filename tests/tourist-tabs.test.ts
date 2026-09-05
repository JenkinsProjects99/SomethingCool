import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { startOfLookback } from "@/lib/filters";
import { publishedEventsFromSeedFile } from "@/lib/seed/published-from-file";
import {
  eventsForThumb,
  eventsForTouristView,
  featuredForTouristView,
  THIS_WEEK_HEADLINERS,
} from "@/lib/tourist-feed";

const NOW = new Date("2026-08-29T15:00:00-04:00");

const WEEKEND_SAT = [
  "ashland-tomcats-volleyball-johnson-central-2026-08-29",
  "fairview-eagles-volleyball-rose-hill-2026-08-29",
  "ashland-tomcats-volleyball-wolfe-county-2026-08-29",
  "sandys-exacta-giveaway-bronco-sport-2026-08-29",
] as const;

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
    expect(phone).toContain('useState<TimeTab>("weekend")');
    expect(phone).toContain("Weekend");
    expect(phone).toContain("Community");
    expect(phone).not.toContain('label: "Family"');
    expect(phone).toContain("{event.venue}");
    expect(phone).toContain("Event Details");
  });

  it("pins Paramount and Visit AKY headliners in FEATURED above date-first time lists", () => {
    expect(THIS_WEEK_HEADLINERS).toEqual([
      "deana-carter",
      "facebook-first-friday-2026-09-04",
      "makers-market",
    ]);
    const featured = featuredForTouristView(events, "all", NOW);
    expect(featured.map((event) => event.id)).toEqual([
      "deana-carter",
      "facebook-first-friday-2026-09-04",
    ]);
    const week = eventsForTouristView(events, "week", "all", NOW);
    expect(week.slice(0, 4).map((event) => event.id)).toEqual([...WEEKEND_SAT]);
    expect(week.filter((event) => event.id === "deana-carter")).toHaveLength(1);
    expect(week.some((event) => event.id === "tomcats-football-2026-08-28")).toBe(false);
    expect(week.find((event) => event.id === "ashland-tomcats-volleyball-wolfe-county-2026-08-29")?.title).toMatch(
      /Wolfe County/,
    );
  });

  it("keeps this weekend date-first: Johnson Central, Fairview, Wolfe, Exacta", () => {
    const weekend = eventsForTouristView(events, "weekend", "all", NOW);
    const sat = weekend.filter((event) => WEEKEND_SAT.includes(event.id as (typeof WEEKEND_SAT)[number]));
    expect(sat.map((event) => event.id)).toEqual([...WEEKEND_SAT]);
    for (let index = 1; index < weekend.length; index += 1) {
      expect(weekend[index]!.startsAtDate.getTime()).toBeGreaterThanOrEqual(
        weekend[index - 1]!.startsAtDate.getTime(),
      );
    }
  });

  it("lists today in startsAt order without mixing featured into the stack", () => {
    const today = eventsForTouristView(events, "today", "all", NOW);
    expect(today.map((event) => event.id)).toEqual([...WEEKEND_SAT]);
  });

  it("does not pin headliners onto Sports This Week", () => {
    const sports = eventsForTouristView(events, "week", "sports", NOW);
    const featured = featuredForTouristView(events, "sports", NOW);
    expect(featured).toEqual([]);
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
      sports.every((event) => !/first[\s-]?friday/i.test(`${event.id} ${event.title}`)),
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
    expect(featuredForTouristView(events, "community", NOW).map((event) => event.id)).toEqual([
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
    expect(calendar).toContain("Event Details");
  });
});
