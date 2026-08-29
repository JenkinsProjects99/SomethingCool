import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

describe("installable PWA", () => {
  it("ships a standalone manifest and service worker", () => {
    const manifest = JSON.parse(
      readFileSync(path.join(process.cwd(), "public/manifest.webmanifest"), "utf8"),
    ) as { display: string; start_url: string; name: string };
    expect(manifest.display).toBe("standalone");
    expect(manifest.start_url).toBe("/");
    expect(manifest.name).toBe("Visit AKY");
    const sw = readFileSync(path.join(process.cwd(), "public/sw.js"), "utf8");
    expect(sw).toContain("serviceWorker");
    const layout = readFileSync(path.join(process.cwd(), "src/app/layout.tsx"), "utf8");
    expect(layout).toContain('manifest: "/manifest.webmanifest"');
    expect(layout).toContain("RegisterServiceWorker");
  });
});
