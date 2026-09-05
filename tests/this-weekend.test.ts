import { writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parseToBound, parseWindowBound } from "@/lib/filters";
import { publishedEventsFromSeedQuery } from "@/lib/published-feed";
import { loadSeedFile } from "@/lib/seed/import-seed";
import { publicEventPayload } from "@/lib/events";

const WEEKEND_IDS = [
  "ashland-tomcats-volleyball-johnson-central-2026-08-29",
  "fairview-eagles-volleyball-rose-hill-2026-08-29",
  "ashland-tomcats-volleyball-wolfe-county-2026-08-29",
  "sandys-exacta-giveaway-bronco-sport-2026-08-29",
  "boyd-library-midland-novel-tea-book-club-2026-08-31",
  "boyd-lions-girls-soccer-greenup-2026-08-31",
  "boyd-lions-boys-soccer-greenup-2026-08-31",
] as const;

describe("this-weekend GET window", () => {
  it("returns the seven specified Aug 29–31 rows with category and image", () => {
    const events = publishedEventsFromSeedQuery({
      from: parseWindowBound("2026-08-29"),
      to: parseToBound("2026-08-31"),
    });
    const ids = events.map((event) => event.id);
    for (const id of WEEKEND_IDS) {
      expect(ids).toContain(id);
    }
    const exacta = events.find((event) => event.id === WEEKEND_IDS[3]);
    expect(exacta?.startsAt).toBe("2026-08-29T23:30:00-04:00");
    for (const event of events) {
      const payload = publicEventPayload(event);
      expect(payload).toHaveProperty("category");
      expect(payload).toHaveProperty("image");
      expect(payload.category).toBeTruthy();
    }
    expect(events.find((event) => event.id === WEEKEND_IDS[3])?.image).toBeNull();
  });

  it("fails import when any row is missing category", async () => {
    const seed = await loadSeedFile();
    const broken = {
      ...seed,
      events: seed.events.map((event, index) =>
        index === 0 ? { ...event, category: undefined } : event,
      ),
    };
    const filePath = path.join(os.tmpdir(), `ashland-missing-category-${Date.now()}.json`);
    writeFileSync(filePath, JSON.stringify(broken));
    await expect(loadSeedFile(filePath)).rejects.toThrow(/Import failed: category is missing/);
  });
});
