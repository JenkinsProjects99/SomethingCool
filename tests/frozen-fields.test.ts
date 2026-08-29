import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  extraPublicKeys,
  FROZEN_NINE_FIELDS,
  FrozenEventSchema,
  pickFrozenNine,
} from "@/lib/fields";
import { EXPECTED_SEED_ROWS } from "@/lib/seed/import-seed";

const seed = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/seed/ashland-ky-events.v0.json"), "utf8"),
) as { events: unknown[] };

describe("frozen nine fields", () => {
  it("locks the public contract to nine keys", () => {
    expect(FROZEN_NINE_FIELDS).toEqual([
      "title",
      "slug",
      "startsAt",
      "endsAt",
      "venue",
      "source",
      "url",
      "summary",
      "status",
    ]);
  });

  it("validates every seed row against the frozen schema", () => {
    expect(seed.events).toHaveLength(EXPECTED_SEED_ROWS);
    for (const row of seed.events) {
      const parsed = FrozenEventSchema.parse(row);
      expect(extraPublicKeys(row as Record<string, unknown>)).toEqual([]);
      expect(Object.keys(pickFrozenNine(parsed))).toEqual([...FROZEN_NINE_FIELDS]);
    }
  });

  it("rejects an eleventh public field on the wire shape", () => {
    const [first] = seed.events as Array<Record<string, unknown>>;
    expect(
      extraPublicKeys({
        ...first,
        category: "concert",
      }),
    ).toEqual(["category"]);
  });
});
