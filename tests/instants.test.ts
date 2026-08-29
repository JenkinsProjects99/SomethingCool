import { describe, expect, it } from "vitest";
import { parseInstant, serializeInstant } from "@/lib/instants";

describe("date-only instants", () => {
  it("round-trips Poage Landing Days without inventing a clock time", () => {
    const start = parseInstant("2026-09-18", "America/New_York");
    const end = parseInstant("2026-09-20", "America/New_York");
    expect(serializeInstant(start, true, "America/New_York")).toBe("2026-09-18");
    expect(serializeInstant(end, true, "America/New_York")).toBe("2026-09-20");
  });

  it("keeps offset datetimes in the event timezone", () => {
    const kickoff = parseInstant("2026-09-04T19:30:00-04:00", "America/New_York");
    expect(serializeInstant(kickoff, false, "America/New_York")).toBe(
      "2026-09-04T19:30:00-04:00",
    );
  });
});
