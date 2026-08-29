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
      where: { id: "other-city-festival" },
      create: {
        id: "other-city-festival",
        tenantId: peer.id,
        title: "Other City Festival",
        slug: "other-city-festival",
        startsAt: new Date("2026-09-12T12:00:00-04:00"),
        endsAt: null,
        timezone: "America/New_York",
        venue: "Somewhere Else",
        address: "Huntington, WV",
        source: "Peer Tenant",
        url: "https://example.com/other-city-festival",
        image: null,
        category: "community",
        summary: "Must never leak into ashland-ky.",
        dateOnly: false,
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
    const payload = events.map(publicEventPayload);

    expect(slugs).toContain("deana-carter");
    expect(slugs).toContain("poage-landing-days-2026");
    expect(slugs).not.toContain("other-city-festival");
    expect(slugs).not.toContain("winter-makers-market");
    expect(payload.every((row) => !("tenantId" in row))).toBe(true);
    expect(payload.every((row) => !("status" in row) && !("slug" in row))).toBe(true);
    const deana = payload.find((row) => row.id === "deana-carter");
    expect(deana?.image).toMatch(/^https:\/\/cdn\.saffire\.com\//);
    expect(deana?.category).toBe("music");
    expect(payload.filter((row) => row.image).length).toBe(28);
    const sesame = payload.find((row) => row.id === "sesame-street-live");
    expect(sesame?.category).toBe("family");
    const poage = payload.find((row) => row.id === "poage-landing-days-2026");
    expect(poage?.startsAt).toBe("2026-09-18");
    expect(poage?.endsAt).toBe("2026-09-20");
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
