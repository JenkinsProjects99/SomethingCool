import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extraSeedKeys,
  FROZEN_NINE_FIELDS,
  pickFrozenNine,
  SeedEventSchema,
} from "@/lib/fields";
import { ORIGINAL_SEED_ROWS } from "@/lib/seed/import-seed";

const seed = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/seed/ashland-ky-events.v0.json"), "utf8"),
) as { events: Array<Record<string, unknown>> };

describe("frozen nine fields", () => {
  it("locks the public contract to the tourist nine plus image", () => {
    expect(FROZEN_NINE_FIELDS).toEqual([
      "id",
      "title",
      "startsAt",
      "endsAt",
      "timezone",
      "venue",
      "address",
      "url",
      "source",
    ]);
  });

  it("validates every seed row and keeps category plus image on the public shape", () => {
    expect(seed.events.length).toBeGreaterThanOrEqual(ORIGINAL_SEED_ROWS);
    const ids = new Set<string>();
    for (const row of seed.events) {
      const parsed = SeedEventSchema.parse(row);
      ids.add(parsed.id);
      expect(extraSeedKeys(row)).toEqual([]);
      expect(parsed.category).toBeTruthy();
      const publicRow = pickFrozenNine(parsed);
      expect(publicRow.category).toBe(parsed.category);
      expect(publicRow.image).toBe(parsed.image);
      expect(Object.keys(publicRow).sort()).toEqual(
        [...FROZEN_NINE_FIELDS, "image", "category"].sort(),
      );
      expect(Object.keys(publicRow)).not.toContain("status");
      expect(Object.keys(publicRow)).not.toContain("slug");
    }
    expect(ids.size).toBe(seed.events.length);
  });

  it("rejects an eleventh public field on the wire shape", () => {
    const [first] = seed.events;
    expect(extraSeedKeys({ ...first, mood: "concert" })).toEqual(["mood"]);
  });
});
