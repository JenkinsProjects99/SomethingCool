import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { hashToken } from "../auth";
import { SeedEventSchema, type SeedEvent } from "../fields";
import { log } from "../logger";
import { resolveWriteStatus } from "../publish";
import { assertAllowedEventUrl } from "../sources";
import { ASHLAND_KY_SLUG } from "../tenant";

export const SEED_PATH = path.join(
  process.cwd(),
  "data/seed/ashland-ky-events.v0.json",
);

/** Original editorial set. Library and remaining MaxPreps rows append when official payloads arrive. */
export const ORIGINAL_SEED_ROWS = 27;
export const SPECIFIED_MAXPREPS_ROWS = 2;
export const TARGET_BOYD_LIBRARY_ROWS = 161;
export const TARGET_MAXPREPS_ROWS = 15;
/** 27 original + 161 boyd-library (thebookplace.org) + 15 maxpreps home games. */
export const TARGET_SEED_ROWS = 203;

export interface SeedFile {
  tenant: { slug: string; name: string };
  notes?: string;
  events: SeedEvent[];
}

export interface ImportOptions {
  reload?: boolean;
  updateStatus?: boolean;
  ashlandToken?: string;
  requestId?: string;
}

export async function loadSeedFile(filePath = SEED_PATH): Promise<SeedFile> {
  const raw = JSON.parse(await readFile(filePath, "utf8")) as SeedFile;
  if (raw.tenant.slug !== ASHLAND_KY_SLUG) {
    throw new Error(`Seed tenant must be ${ASHLAND_KY_SLUG}`);
  }
  if (raw.events.length < ORIGINAL_SEED_ROWS) {
    throw new Error(`Seed must keep the original ${ORIGINAL_SEED_ROWS} rows`);
  }
  raw.events = raw.events.map((event) => SeedEventSchema.parse(event));
  const ids = new Set(raw.events.map((event) => event.id));
  const slugs = new Set(raw.events.map((event) => event.slug));
  if (ids.size !== raw.events.length) {
    throw new Error("Seed ids must be unique");
  }
  if (slugs.size !== raw.events.length) {
    throw new Error("Seed slugs must be unique");
  }
  for (const event of raw.events) {
    assertAllowedEventUrl(event.source, event.url);
  }
  return raw;
}

export async function importSeed(
  db: PrismaClient,
  options: ImportOptions = {},
): Promise<{ inserted: number; updated: number; unchangedStatus: number }> {
  const seed = await loadSeedFile();
  const requestId = options.requestId ?? "seed";
  const token = options.ashlandToken ?? process.env.ASHLAND_KY_API_TOKEN;
  if (!token) {
    throw new Error("ASHLAND_KY_API_TOKEN is required to import seed");
  }

  const tenant = await db.tenant.upsert({
    where: { slug: seed.tenant.slug },
    create: { slug: seed.tenant.slug, name: seed.tenant.name },
    update: { name: seed.tenant.name },
  });

  await db.apiToken.upsert({
    where: { tokenHash: hashToken(token) },
    create: {
      tenantId: tenant.id,
      label: "ashland-ky-v0",
      tokenHash: hashToken(token),
    },
    update: {
      tenantId: tenant.id,
      revokedAt: null,
    },
  });

  let inserted = 0;
  let updated = 0;
  let unchangedStatus = 0;

  for (const event of seed.events) {
    const existing = await db.event.findUnique({
      where: { id: event.id },
    });

    const intent = existing ? "reload" : "import";
    if (existing && !options.reload) {
      throw new Error(
        `Refusing to overwrite ${event.id}. Re-run with --reload for a reloadable import.`,
      );
    }

    const decision = resolveWriteStatus({
      intent,
      explicitStatus: event.status,
      existingStatus: existing?.status,
      updateStatus: options.updateStatus,
    });
    if (existing && decision.status === existing.status) {
      unchangedStatus += 1;
    }

    const data = {
      id: event.id,
      title: event.title,
      slug: event.slug,
      startsAt: new Date(event.startsAt),
      endsAt: event.endsAt ? new Date(event.endsAt) : null,
      venue: event.venue,
      source: event.source,
      url: event.url,
      summary: event.summary,
      status: decision.status,
      tenantId: tenant.id,
    };

    await db.event.upsert({
      where: { id: event.id },
      create: data,
      update: {
        title: data.title,
        slug: data.slug,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        venue: data.venue,
        source: data.source,
        url: data.url,
        summary: data.summary,
        tenantId: data.tenantId,
        ...(options.updateStatus ? { status: data.status } : {}),
      },
    });

    if (existing) {
      updated += 1;
    } else {
      inserted += 1;
    }
  }

  log.info("seed.import.complete", {
    requestId,
    tenant: tenant.slug,
    count: seed.events.length,
    inserted,
    updated,
    unchangedStatus,
    updateStatus: Boolean(options.updateStatus),
  });

  return { inserted, updated, unchangedStatus };
}
