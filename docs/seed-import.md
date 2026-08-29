# Seed import how-to

The v0 seed is `data/seed/ashland-ky-events.v0.json`. One reloadable file. Public nine fields plus additive `image`. Seed-only: `slug`, `summary`, `status`.

## Count

| Stage | Rows |
| --- | --- |
| Original editorial set | 27 |
| Specified maxpreps football | +2 (in the file now) |
| Specified school rows | +4 (published times only) |
| Poage Landing Days | +1 date-only facebook row |
| Specified Sandy’s facebook nights | +2 |
| Target | 225 = 27 + 161 `boyd-library` + 27 maxpreps + specified school/facebook rows |

Sean’s complete seed is 225 rows / ~108KB on this same reloadable path. This workspace does not have that file yet. The committed file is official rows only (original 27, specified sports, Poage Landing Days date-only, specified Sandy’s nights). Do not invent the missing library or kickoff rows to fake 108KB.

The 161 library rows come only from [thebookplace.org](https://www.thebookplace.org/). They are not scraped or invented here. Remaining MaxPreps kickoffs wait for official payloads. Do not invent Jerk Riley’s, Kel’s, or other pub nights.

`image` is `null` on every row until Sean has photos. Poage Landing Days is date-only (`2026-09-18`–`2026-09-20`), no invented clock times.

`GET /v1/ashland-ky/events` returns every **published** row for the range. It does not cap at 27 and it does not invent unpublished library/sports rows to force 225.

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

First insert uses the `status` written in the JSON file. That value is editorial, not inferred. Draft rows stay off the public PWA, iframe, and API.

The command refuses to overwrite existing ids. That keeps a first run from clobbering live edits.

## Reload

```bash
npm run seed:reload
```

Reload is upsert-by-`id`:

- Inserts any new ids
- Updates title, slug, times, timezone, venue, address, source, url, image, summary, and date-only flag
- **Leaves `status` alone** unless you pass `--update-status`

```bash
npx tsx scripts/import-seed.ts --reload --update-status
```

`--update-status` is an explicit editorial overwrite. It is never the default.

## Checks

```bash
npm test
```

`tests/frozen-fields.test.ts` validates every row against the public nine plus `image`. `tests/seed-sources.test.ts` blocks Ohio library URLs and invented Boyd Library rows.

## Do not

- Do not scrape thebookplace.org or ashland.librarycalendar.com.
- Do not invent `boyd-library` payloads.
- Do not invent remaining MaxPreps kickoffs or pub nights.
- Do not treat a complete row as published.
- Do not put real API tokens in the seed file.
