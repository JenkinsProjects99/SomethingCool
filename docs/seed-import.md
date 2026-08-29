# Seed import how-to

The v0 seed is `data/seed/ashland-ky-events.v0.json`. One reloadable file. Frozen nine public fields plus a seed-only `id`.

## Count

| Stage | Rows |
| --- | --- |
| Original editorial set | 27 |
| Specified maxpreps football | +2 (in the file now) |
| Target | 215 = 27 + 161 `boyd-library` + 27 maxpreps |

The 161 library rows come only from [thebookplace.org](https://www.thebookplace.org/). They are not scraped or invented here. The remaining MaxPreps home kickoffs are not in this file until their payloads arrive. Do not invent pub nights. Facebook dated nights may append later on this same file.

Intended source mix for 215: 27 original + 161 boyd-library + 27 maxpreps.

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

First insert uses the `status` written in the JSON file. That value is editorial, not inferred. Draft rows stay off the public calendar and API.

The command refuses to overwrite existing ids. That keeps a first run from clobbering live edits.

## Reload

```bash
npm run seed:reload
```

Reload is upsert-by-`id`:

- Inserts any new ids
- Updates title, slug, times, venue, source, url, and summary
- **Leaves `status` alone** unless you pass `--update-status`

```bash
npx tsx scripts/import-seed.ts --reload --update-status
```

`--update-status` is an explicit editorial overwrite. It is never the default.

## Checks

```bash
npm test
```

`tests/frozen-fields.test.ts` validates every row against the frozen nine. `tests/seed-sources.test.ts` blocks Ohio library URLs and invented Boyd Library rows.

`GET /v1/ashland-ky/events` returns all published rows for the range. The calendar list renders the full filtered set.

## Do not

- Do not scrape thebookplace.org or ashland.librarycalendar.com.
- Do not invent `boyd-library` payloads.
- Do not treat a complete row as published.
- Do not put real API tokens in the seed file.
