import { describe, expect, it } from "vitest";
import { categoryForEvent, isFamilyEvent, sortForTourist } from "@/lib/categories";

describe("client ranking", () => {
  it("ranks from the explicit category field, not source", () => {
    const ranked = sortForTourist([
      {
        category: "sports" as const,
        startsAtDate: new Date("2026-09-04T10:00:00-04:00"),
      },
      {
        category: "family" as const,
        startsAtDate: new Date("2026-09-18T00:00:00-04:00"),
      },
      {
        category: "music" as const,
        startsAtDate: new Date("2026-09-04T20:00:00-04:00"),
      },
    ]);
    expect(ranked.map((event) => event.category)).toEqual(["music", "family", "sports"]);
  });

  it("keeps Sesame, Blippi, Nutcracker, and Festival of Trees on family", () => {
    expect(isFamilyEvent({ category: "family" })).toBe(true);
    expect(isFamilyEvent({ category: "music" })).toBe(false);
    expect(categoryForEvent({ source: "paramount", title: "Sesame Street Live" })).toBe("family");
    expect(categoryForEvent({ source: "paramount", title: "The Nutcracker" })).toBe("family");
    expect(categoryForEvent({ source: "paramount", title: "Blippi" })).toBe("family");
    expect(categoryForEvent({ source: "paramount", title: "Festival of Trees" })).toBe("family");
  });

  it("infers music and sports when the stored category is the community default", () => {
    expect(
      categoryForEvent({
        category: "community",
        source: "paramount",
        title: "Deana Carter",
      }),
    ).toBe("music");
    expect(
      categoryForEvent({
        category: "community",
        source: "maxpreps",
        title: "Ashland Tomcats Football vs. Lawrence County",
      }),
    ).toBe("sports");
    expect(
      categoryForEvent({
        category: "community",
        source: "paramount",
        title: "Sesame Street Live",
      }),
    ).toBe("family");
  });
});
