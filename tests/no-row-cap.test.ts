import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("no hardcoded 27-row feed cap", () => {
  it("lists every published row the query returns", () => {
    const events = readFileSync(path.join(process.cwd(), "src/lib/events.ts"), "utf8");
    const route = readFileSync(
      path.join(process.cwd(), "src/app/v1/[tenant]/events/route.ts"),
      "utf8",
    );
    const calendar = readFileSync(
      path.join(process.cwd(), "src/components/CalendarView.tsx"),
      "utf8",
    );
    expect(events).not.toMatch(/take\(\s*27\s*\)/);
    expect(events).not.toMatch(/slice\(\s*0\s*,\s*27\s*\)/);
    expect(route).toContain("events.map(publicEventPayload)");
    expect(route).not.toMatch(/slice\(\s*0\s*,\s*27/);
    expect(calendar).toContain("events={events}");
    expect(calendar).not.toMatch(/slice\(\s*0\s*,\s*27/);
  });
});
