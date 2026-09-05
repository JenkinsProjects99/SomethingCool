import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { EventStatusSchema } from "@/lib/fields";
import { resolveWriteStatus } from "@/lib/publish";
import {
  getTenantConfig,
  listTenantConfigSlugs,
  tryGetTenantConfig,
  UnknownTenantConfigError,
  withReviewer,
} from "@/lib/tenant-config";

describe("tenant-config schema", () => {
  it("loads ashland-ky pack #1 with Sean as pilot-coordinator", () => {
    expect(listTenantConfigSlugs()).toEqual(["ashland-ky"]);
    const pack = getTenantConfig("ashland-ky");
    expect(pack.slug).toBe("ashland-ky");
    expect(pack.timezone).toBe("America/New_York");
    expect(pack.lookbackDays).toBe(7);
    expect(pack.reviewerDesignate).toEqual({ displayName: "Sean (Data Coordinator)" });
    expect(pack.reviewerRole).toBe("pilot-coordinator");
    expect(pack.publishQueue).toEqual({
      scope: "tenant",
      workflow: ["draft", "pin", "published"],
      autoPublish: false,
    });
    expect(pack.ingestAdapters).toEqual([]);
    expect(pack.embedApiKeyRef).toBe("ASHLAND_KY_API_TOKEN");
    expect(pack.featuredRules.placement).toBe("above-time-views");
    expect(pack.featuredRules.pinEventIds).toEqual([
      "deana-carter",
      "facebook-first-friday-2026-09-04",
      "makers-market",
    ]);
    expect(pack.featuredRules.maxCards).toBe(2);
    expect(pack.sourceAllowlist).toContain("paramount");
    expect(pack.geoFence.kind).toBe("bbox");
    expect(pack.geoFence.namedVenueExceptions.map((row) => row.name)).toEqual([
      "Greenbo Lake State Resort Park",
      "Rush Off Road Park",
      "Grayson Lake State Park",
      "Carter Caves State Resort Park",
    ]);
    expect(pack.brand.primary).toBe("#326DCD");
  });

  it("looks up packs by slug and does not special-case a city name in the loader", () => {
    expect(tryGetTenantConfig("missing-city")).toBeNull();
    expect(() => getTenantConfig("missing-city")).toThrow(UnknownTenantConfigError);
    const loader = readFileSync(
      path.join(process.cwd(), "src/lib/tenant-config/index.ts"),
      "utf8",
    );
    expect(loader).not.toMatch(/if\s*\(.*ashland/i);
  });

  it("keeps the publish queue per-tenant when the designate swaps", () => {
    const pack = getTenantConfig("ashland-ky");
    const handed = withReviewer(
      pack,
      { displayName: "Visit AKY Tenant Admin" },
      "tenant-admin",
    );
    expect(handed.reviewerRole).toBe("tenant-admin");
    expect(handed.reviewerDesignate.displayName).toBe("Visit AKY Tenant Admin");
    expect(handed.publishQueue).toEqual(pack.publishQueue);
    expect(handed.slug).toBe(pack.slug);
    expect(handed.ingestAdapters).toEqual([]);
  });

  it("locks Draft → Pin → Publish and never auto-publishes", () => {
    expect(EventStatusSchema.options).toEqual(["draft", "pin", "published"]);
    expect(resolveWriteStatus({ intent: "pin" })).toEqual({
      status: "pin",
      reason: "explicit-pin-action",
    });
    expect(
      resolveWriteStatus({
        intent: "create",
        explicitStatus: "pin",
      }),
    ).toEqual({
      status: "draft",
      reason: "create-ignores-pin-without-pin-intent",
    });
    expect(resolveWriteStatus({ intent: "create", explicitStatus: "published" }).status).toBe(
      "draft",
    );
    expect(getTenantConfig("ashland-ky").publishQueue.autoPublish).toBe(false);
  });
});
