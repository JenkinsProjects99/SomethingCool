import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cardImageSrc, VISIT_AKY_LOGO_SRC } from "@/lib/card-image";
import { TARGET_SEED_ROWS } from "@/lib/seed/import-seed";
import { publishedEventsFromSeedFile } from "@/lib/seed/published-from-file";

const seedRaw = readFileSync(
  path.join(process.cwd(), "data/seed/ashland-ky-events.v0.json"),
  "utf8",
);

describe("null image never drops a row", () => {
  it("keeps all 225 seed rows and never writes the logo URL into JSON", () => {
    const seed = JSON.parse(seedRaw) as { events: Array<{ image: string | null }> };
    expect(seed.events).toHaveLength(TARGET_SEED_ROWS);
    expect(seedRaw).not.toMatch(/visit-aky-logo|\/brand\/visit/i);
    expect(seed.events.some((event) => event.image === null)).toBe(true);
    expect(seed.events.every((event) => event.image !== VISIT_AKY_LOGO_SRC)).toBe(true);
  });

  it("loads every published row from the file even when image is null", () => {
    const published = publishedEventsFromSeedFile();
    expect(published.length).toBeGreaterThan(200);
    expect(published.some((event) => event.image === null)).toBe(true);
    expect(published.every((event) => event.image !== VISIT_AKY_LOGO_SRC)).toBe(true);
  });

  it("uses the Visit AKY logo only in the PWA and widget clients", () => {
    expect(cardImageSrc(null)).toBe(VISIT_AKY_LOGO_SRC);
    expect(cardImageSrc("https://cdn.saffire.com/photo.jpg")).toBe(
      "https://cdn.saffire.com/photo.jpg",
    );
    const phone = readFileSync(path.join(process.cwd(), "src/components/PhoneApp.tsx"), "utf8");
    const widget = readFileSync(path.join(process.cwd(), "src/components/EventCard.tsx"), "utf8");
    expect(phone).toContain("cardImageSrc(event.image)");
    expect(widget).toContain("cardImageSrc(event.image)");
    expect(phone).not.toMatch(/if\s*\(\s*!event\.image/);
    expect(widget).not.toMatch(/if\s*\(\s*!event\.image/);
  });
});
