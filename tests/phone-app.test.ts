import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("tourist phone preview", () => {
  const phone = readFileSync(path.join(process.cwd(), "src/components/PhoneApp.tsx"), "utf8");

  it("defaults to this weekend with date, category, and upcoming thumbs", () => {
    expect(phone).toContain('useState<DateThumb>("weekend")');
    expect(phone).toContain('This weekend');
    expect(phone).toContain('This week');
    expect(phone).toContain('This month');
    expect(phone).toContain('Upcoming');
    expect(phone).toContain("EVENT_CATEGORIES");
    expect(phone).toContain("photo-card__fallback");
    expect(phone).toContain("event.image");
  });
});
