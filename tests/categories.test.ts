import { describe, expect, it } from "vitest";
import { categoryForSource, isFamilyEvent, sortForTourist } from "@/lib/categories";

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

  it("treats downtown and kid shows as family without defaulting to library", () => {
    expect(isFamilyEvent({ source: "visit-aky", title: "First Friday September" })).toBe(true);
    expect(isFamilyEvent({ source: "paramount", title: "Sesame Street Live" })).toBe(true);
    expect(isFamilyEvent({ source: "paramount", title: "Deana Carter" })).toBe(false);
  });
});
