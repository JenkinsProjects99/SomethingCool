import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("source is a subheading, not a chip", () => {
  const card = readFileSync(path.join(process.cwd(), "src/components/EventCard.tsx"), "utf8");
  const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  it("renders source with st-d-subheading", () => {
    expect(card).toContain('className="st-d-subheading">{event.source}');
    expect(card).not.toMatch(/chip|pill|badge/i);
  });

  it("does not paint source with purple or mint fills", () => {
    expect(css).toContain(".st-d-subheading");
    expect(css).toMatch(/\.st-d-subheading[\s\S]*?color:\s*var\(--st-ink\)/);
  });
});
