import { getPrisma } from "../src/lib/db";
import { createRequestId, log } from "../src/lib/logger";
import { importSeed } from "../src/lib/seed/import-seed";

async function main() {
  const args = new Set(process.argv.slice(2));
  const requestId = createRequestId();
  const reload = args.has("--reload");
  const updateStatus = args.has("--update-status");

  log.info("seed.import.start", { requestId, reload, updateStatus });

  const db = getPrisma();
  try {
    const result = await importSeed(db, { reload, updateStatus, requestId });
    log.info("seed.import.ok", { requestId, ...result });
  } finally {
    await db.$disconnect();
  }
}

main().catch((error: unknown) => {
  log.error("seed.import.failed", {
    err: error instanceof Error ? error.message : String(error),
  });
  process.exit(1);
});
