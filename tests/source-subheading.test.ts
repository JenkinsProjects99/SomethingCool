import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("source is a subheading, not a chip", () => {
  const card = readFileSync(path.join(process.cwd(), "src/components/EventCard.tsx"), "utf8");
  const phone = readFileSync(path.join(process.cwd(), "src/components/PhoneApp.tsx"), "utf8");
  const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");

  it("renders source with st-d-subheading", () => {
    expect(card).toContain('className="st-d-subheading">{sourceLabel(event.source)}');
    expect(phone).toContain('className="st-d-subheading">{sourceLabel(event.source)}');
    expect(phone).toContain("photo-card__body");
    expect(phone).toContain('event.image ?? "/brand/visit-aky-logo.png"');
    expect(card).not.toMatch(/chip|pill|badge/i);
    expect(phone).not.toMatch(/chip|pill|badge/i);
  });

  it("does not paint source with purple or mint fills", () => {
    expect(css).toContain(".st-d-subheading");
    expect(css).toMatch(/\.st-d-subheading[\s\S]*?color:\s*var\(--st-ink\)/);
  });
});
