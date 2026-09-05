import { describe, expect, it } from "vitest";
import {
  assertTenantScope,
  eventBelongsToTenant,
  isolatePublishedEvents,
  scopedEventWhere,
  TenantScopeError,
} from "@/lib/tenant";

const ashland = { tenantId: "tenant-ashland", tenantSlug: "ashland-ky" };
const peer = { tenantId: "tenant-peer", tenantSlug: "huntington-wv" };

const mixed = [
  {
    tenantId: ashland.tenantId,
    slug: "deana-carter",
    status: "published" as const,
  },
  {
    tenantId: ashland.tenantId,
    slug: "winter-makers-market",
    status: "draft" as const,
  },
  {
    tenantId: ashland.tenantId,
    slug: "pinned-not-public",
    status: "pin" as const,
  },
  {
    tenantId: peer.tenantId,
    slug: "other-city-festival",
    status: "published" as const,
  },
];

describe("tenant isolation", () => {
  it("rejects a bearer tenant that does not match the URL tenant", () => {
    expect(() => assertTenantScope(ashland, "huntington-wv")).toThrow(TenantScopeError);
    expect(() => assertTenantScope(ashland, "ashland-ky")).not.toThrow();
  });

  it("never returns another tenant's events from a mixed set", () => {
    const visible = isolatePublishedEvents(mixed, ashland.tenantId);
    expect(visible.map((event) => event.slug)).toEqual(["deana-carter"]);
    expect(visible.every((event) => event.tenantId === ashland.tenantId)).toBe(true);
  });

  it("never returns drafts or pins through the public tenant scope", () => {
    const visible = isolatePublishedEvents(mixed, ashland.tenantId);
    expect(visible.some((event) => event.status === "draft")).toBe(false);
    expect(visible.some((event) => event.status === "pin")).toBe(false);
  });

  it("scopes queries by authenticated tenant id, not a client-supplied tenant id", () => {
    const where = scopedEventWhere(ashland.tenantId);
    expect(where).toEqual({ tenantId: ashland.tenantId, status: "published" });
    expect(eventBelongsToTenant(mixed.find((row) => row.slug === "other-city-festival")!, ashland.tenantId)).toBe(
      false,
    );
    expect(JSON.stringify(where)).not.toContain(peer.tenantId);
  });

  it("does not allow URL slug alone to select events", () => {
    const leaked = isolatePublishedEvents(mixed, "ashland-ky");
    expect(leaked).toEqual([]);
  });
});
