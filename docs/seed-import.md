# Seed import how-to

The v0 seed is `data/seed/ashland-ky-events.v0.json`: **27 rows**, frozen nine fields, tenant `ashland-ky`.

## Prerequisites

```bash
cp .env.example .env
docker compose up -d postgres
npx prisma migrate deploy
```

Or point `DATABASE_URL` at any Postgres 16 database and run the same migrate command.

`ASHLAND_KY_API_TOKEN` in `.env` is hashed (SHA-256) and stored on the tenant. The example value is a local placeholder, not a production secret.

## First import

```bash
npm run seed
```

First insert uses the `status` written in the JSON file. That value is editorial, not inferred. Four rows ship as `draft` on purpose so the calendar cannot accidentally show unconfirmed dates.

The command refuses to overwrite existing slugs. That keeps a first run from clobbering live edits.

## Reload

```bash
npm run seed:reload
```

Reload is upsert-by-`(tenantId, slug)`:

- Inserts any new slugs
- Updates title, times, venue, source, url, and summary
- **Leaves `status` alone** unless you pass `--update-status`

```bash
npx tsx scripts/import-seed.ts --reload --update-status
```

`--update-status` is an explicit editorial overwrite. It is never the default.

## Checks

```bash
npm test
```

`tests/frozen-fields.test.ts` asserts the file still has 27 valid rows and no extra public keys. `tests/never-auto-publish.test.ts` locks the status rules.

## Do not

- Do not scrape or cron-publish from Paramount or Visit AKY.
- Do not treat a complete row as published.
- Do not put real API tokens in the seed file.
