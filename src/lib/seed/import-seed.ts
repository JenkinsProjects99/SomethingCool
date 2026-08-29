import { readFile } from "node:fs/promises";
import path from "node:path";
import type { PrismaClient } from "@prisma/client";
import { hashToken } from "../auth";
import { isDateOnly, SeedEventSchema, type SeedEvent } from "../fields";
import { parseInstant } from "../instants";
import { log } from "../logger";
import { resolveWriteStatus } from "../publish";
import { assertAllowedEventUrl } from "../sources";
import { ASHLAND_KY_SLUG } from "../tenant";

export const SEED_PATH = path.join(
  process.cwd(),
  "data/seed/ashland-ky-events.v0.json",
);

export const ORIGINAL_SEED_ROWS = 27;
export const SPECIFIED_MAXPREPS_ROWS = 2;
export const TARGET_BOYD_LIBRARY_ROWS = 161;
export const TARGET_MAXPREPS_ROWS = 27;
export const TARGET_SEED_ROWS = 245;
export const OFFICIAL_IMAGE_ROWS = 28;

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
  const missingCategory = raw.events.filter((event) => !event?.category);
  if (missingCategory.length > 0) {
    throw new Error(
      `Import failed: category is missing on ${missingCategory.map((event) => event.id).join(", ")}`,
    );
  }
  raw.events = raw.events.map((event) => SeedEventSchema.parse(event));
  const ids = new Set(raw.events.map((event) => event.id));
  if (ids.size !== raw.events.length) {
    throw new Error("Seed ids must be unique");
  }
  if (raw.events.length !== TARGET_SEED_ROWS) {
    throw new Error(`Seed must be ${TARGET_SEED_ROWS} official rows`);
  }
  const pictured = raw.events.filter((event) => event.image !== null);
  if (pictured.length > OFFICIAL_IMAGE_ROWS) {
    throw new Error(`at most ${OFFICIAL_IMAGE_ROWS} official or Facebook photos are allowed`);
  }
  for (const event of pictured) {
    if (/visit-aky-logo|\/brand\/visit|visit\.png/i.test(event.image ?? "")) {
      throw new Error(`${event.id} must not store the Visit AKY logo URL`);
    }
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

    const dateOnly = isDateOnly(event.startsAt);
    const data = {
      id: event.id,
      title: event.title,
      slug: event.slug ?? event.id,
      startsAt: parseInstant(event.startsAt, event.timezone),
      endsAt: event.endsAt ? parseInstant(event.endsAt, event.timezone) : null,
      timezone: event.timezone,
      venue: event.venue,
      address: event.address,
      source: event.source,
      url: event.url,
      image: event.image,
      category: event.category,
      summary: event.summary ?? event.title,
      dateOnly,
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
        timezone: data.timezone,
        venue: data.venue,
        address: data.address,
        source: data.source,
        url: data.url,
        image: data.image,
        category: data.category,
        summary: data.summary,
        dateOnly: data.dateOnly,
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
