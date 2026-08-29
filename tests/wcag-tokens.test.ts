import { describe, expect, it } from "vitest";
import { contrastRatio, meetsWcagAa } from "@/lib/contrast";

describe("Visit AKY WCAG 2.2 AA tokens", () => {
  it("keeps primary blue readable on paper", () => {
    const check = meetsWcagAa("#326DCD", "#FFFFFF", 14, true);
    expect(check.ratio).toBeGreaterThanOrEqual(4.5);
    expect(check.pass).toBe(true);
  });

  it("keeps primary label readable on primary blue", () => {
    const check = meetsWcagAa("#F5F5F5", "#326DCD", 14, true);
    expect(check.ratio).toBeGreaterThanOrEqual(4.5);
    expect(check.pass).toBe(true);
  });

  it("keeps nav hover purple readable on paper", () => {
    expect(contrastRatio("#7B5BBB", "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("does not use mint as text on paper", () => {
    expect(contrastRatio("#7AD68D", "#FFFFFF")).toBeLessThan(4.5);
  });
});
