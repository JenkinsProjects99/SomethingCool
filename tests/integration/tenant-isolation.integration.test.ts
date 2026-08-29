import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaClient } from "@prisma/client";
import { authenticateRequest } from "@/lib/api-auth";
import { hashToken } from "@/lib/auth";
import { listPublishedEvents, publicEventPayload } from "@/lib/events";
import { importSeed } from "@/lib/seed/import-seed";
import { TenantScopeError } from "@/lib/tenant";

const hasDatabase = Boolean(process.env.DATABASE_URL);

describe.skipIf(!hasDatabase)("tenant isolation against postgres", () => {
  const db = new PrismaClient();
  const peerToken = process.env.PEER_TENANT_API_TOKEN ?? "dev-peer-tenant-local-token";

  beforeAll(async () => {
    await importSeed(db, {
      reload: true,
      ashlandToken: process.env.ASHLAND_KY_API_TOKEN ?? "dev-ashland-ky-local-token",
      requestId: "test-seed",
    });

    const peer = await db.tenant.upsert({
      where: { slug: "huntington-wv" },
      create: { slug: "huntington-wv", name: "Peer Tenant" },
      update: { name: "Peer Tenant" },
    });

    await db.apiToken.upsert({
      where: { tokenHash: hashToken(peerToken) },
      create: {
        tenantId: peer.id,
        label: "peer-v0",
        tokenHash: hashToken(peerToken),
      },
      update: { tenantId: peer.id, revokedAt: null },
    });

    await db.event.upsert({
      where: { tenantId_slug: { tenantId: peer.id, slug: "other-city-festival" } },
      create: {
        tenantId: peer.id,
        title: "Other City Festival",
        slug: "other-city-festival",
        startsAt: new Date("2026-09-12T12:00:00-04:00"),
        endsAt: null,
        venue: "Somewhere Else",
        source: "Peer Tenant",
        url: "https://example.com/other-city-festival",
        summary: "Must never leak into ashland-ky.",
        status: "published",
      },
      update: { status: "published" },
    });
  });

  afterAll(async () => {
    await db.$disconnect();
  });

  it("lists only ashland-ky published events for an ashland token", async () => {
    const auth = await authenticateRequest(
      db,
      `Bearer ${process.env.ASHLAND_KY_API_TOKEN ?? "dev-ashland-ky-local-token"}`,
      "ashland-ky",
    );
    const events = await listPublishedEvents(db, auth.tenantId, "all");
    const slugs = events.map((event) => event.slug);

    expect(slugs).toContain("deana-carter");
    expect(slugs).not.toContain("other-city-festival");
    expect(slugs).not.toContain("winter-makers-market");
    expect(events.every((event) => event.status === "published")).toBe(true);
    expect(events.map(publicEventPayload).every((row) => !("tenantId" in row))).toBe(true);
  });

  it("forbids an ashland token from reading another tenant slug", async () => {
    await expect(
      authenticateRequest(
        db,
        `Bearer ${process.env.ASHLAND_KY_API_TOKEN ?? "dev-ashland-ky-local-token"}`,
        "huntington-wv",
      ),
    ).rejects.toBeInstanceOf(TenantScopeError);
  });
});
