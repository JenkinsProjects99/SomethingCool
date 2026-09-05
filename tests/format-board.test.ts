import { describe, expect, it } from "vitest";
import { formatCardWhen, formatKickerDay, formatWeekSpan } from "@/lib/format";

const DEANA = new Date("2026-09-04T20:00:00-04:00");
const VOLLEY = new Date("2026-08-29T11:00:00-04:00");
const NOW = new Date("2026-08-29T15:00:00-04:00");

describe("Joanna board date labels", () => {
  it("prints featured and week times as FRI • SEP 4 • 8:00 PM", () => {
    expect(formatCardWhen(DEANA)).toBe("FRI • SEP 4 • 8:00 PM");
    expect(formatCardWhen(VOLLEY, false, null, "full")).toBe("SAT • AUG 29 • 11:00 AM");
  });

  it("shortens weekend and today cards", () => {
    expect(formatCardWhen(VOLLEY, false, null, "weekday-time")).toBe("SAT • 11:00 AM");
    expect(formatCardWhen(VOLLEY, false, null, "time")).toBe("11:00 AM");
  });

  it("labels Today and This Week kickers from the locked window", () => {
    expect(formatKickerDay(NOW)).toBe("SAT AUG 29");
    expect(
      formatWeekSpan(new Date("2026-08-29T00:00:00-04:00"), new Date("2026-09-05T00:00:00-04:00")),
    ).toBe("SAT 29–FRI 4");
  });
});
