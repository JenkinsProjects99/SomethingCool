# Seed import how-to

The v0 seed is `data/seed/ashland-ky-events.v0.json`. One reloadable file. Public nine fields plus additive `image` and `category`. Seed-only: `slug`, `summary`, `status`.

## Count

| Stage | Rows |
| --- | --- |
| Official published rows | **225** |
| Official Paramount / Visit AKY images | **14** |
| Remaining images | `null` (Visit AKY photo-card fallback in the PWA) |

The file keeps the original editorial 27, specified school/facebook rows, official Paramount extras (Shrek, Festival of Trees & Trains), official MaxPreps Ashland home games, and published [thebookplace.org](https://www.thebookplace.org/) programs (161+). Closings and meeting-room reservations were not copied. Do not invent Jerk Riley’s, Kel’s, or other pub nights.

`category` is stored per row (`music` | `sports` | `family` | `arts` | `community` | `food` | `outdoor`). Do not infer it from `source`. Kids Paramount shows are `family`.

Poage Landing Days is date-only (`2026-09-18`–`2026-09-20`), no invented clock times.

`GET /v1/ashland-ky/events` returns every **published** row for the range. It does not cap at 27.

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
- Updates title, slug, times, timezone, venue, address, source, url, image, category, summary, and date-only flag
- **Leaves `status` alone** unless you pass `--update-status`

```bash
npx tsx scripts/import-seed.ts --reload --update-status
```

`--update-status` is an explicit editorial overwrite. It is never the default.

## Checks

```bash
npm test
```

`tests/frozen-fields.test.ts` validates every row against the public nine plus `image` and `category`. `tests/seed-sources.test.ts` blocks Ohio library URLs and invented pub nights.

## Do not

- Do not invent events or fake photos as content.
- Do not infer `category` from `source`.
- Do not put unofficial stock photos on rows. Null images use the Visit AKY photo-card fallback.
- Do not treat a complete row as published.
- Do not put real API tokens in the seed file.
