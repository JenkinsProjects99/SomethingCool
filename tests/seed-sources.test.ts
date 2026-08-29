import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TARGET_SEED_ROWS } from "@/lib/seed/import-seed";
import { assertAllowedEventUrl } from "@/lib/sources";

const seed = JSON.parse(
  readFileSync(path.join(process.cwd(), "data/seed/ashland-ky-events.v0.json"), "utf8"),
) as { events: Array<{ id: string; source: string; url: string }> };

describe("seed source rules", () => {
  it("documents 171 as the post-library target and does not invent boyd-library rows", () => {
    expect(TARGET_SEED_ROWS).toBe(171);
    const library = seed.events.filter((event) => event.source === "boyd-library");
    expect(library).toHaveLength(0);
  });

  it("rejects the Ohio library calendar host", () => {
    expect(() =>
      assertAllowedEventUrl(
        "boyd-library",
        "https://ashland.librarycalendar.com/event/storytime",
      ),
    ).toThrow(/Ohio library calendar/);
  });

  it("requires boyd-library urls to be thebookplace.org", () => {
    expect(() =>
      assertAllowedEventUrl("boyd-library", "https://example.com/event"),
    ).toThrow(/thebookplace.org/);
    expect(() =>
      assertAllowedEventUrl("boyd-library", "https://www.thebookplace.org/events/storytime"),
    ).not.toThrow();
  });

  it("keeps every current row on an allowed host", () => {
    for (const event of seed.events) {
      expect(() => assertAllowedEventUrl(event.source, event.url)).not.toThrow();
    }
  });
});
