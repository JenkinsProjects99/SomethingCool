import { describe, expect, it } from "vitest";
import { categoryForSource, sortForTourist } from "@/lib/categories";

describe("client ranking", () => {
  it("keeps festivals and music ahead of library storytimes", () => {
    expect(categoryForSource("facebook")).toBe("festivals");
    expect(categoryForSource("paramount")).toBe("music");
    expect(categoryForSource("boyd-library")).toBe("library");
    const ranked = sortForTourist([
      {
        source: "boyd-library",
        startsAtDate: new Date("2026-09-04T10:00:00-04:00"),
      },
      {
        source: "facebook",
        startsAtDate: new Date("2026-09-18T00:00:00-04:00"),
      },
      {
        source: "paramount",
        startsAtDate: new Date("2026-09-04T20:00:00-04:00"),
      },
    ]);
    expect(ranked.map((event) => event.source)).toEqual([
      "facebook",
      "paramount",
      "boyd-library",
    ]);
  });
});
