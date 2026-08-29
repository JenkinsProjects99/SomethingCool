# Seed import how-to

The v0 seed is `data/seed/ashland-ky-events.v0.json`. One reloadable file. Public nine fields plus additive `image` and `category`. Seed-only: `slug`, `summary`, `status`.

## Count

Sean’s 225 official rows are on this path. `category` is required on every row. Import fails if any row is missing `category`. Do not default missing category to `community`.

First Friday, proposed winter makers, tentative NYE, and Music Trail weekend are not in this file.

A few Paramount/Visit AKY rows keep official image URLs. Every other row is `image: null`. The Visit AKY logo is a client fallback only. Never write that logo URL into JSON. Never drop a row for a missing photo.

Library rows come only from [thebookplace.org](https://www.thebookplace.org/). Do not invent Jerk Riley’s, Kel’s, or other pub nights.

Poage Landing Days and Festival of Trees & Trains are date-only.

`GET /v1/ashland-ky/events` returns every **published** row for the range, including additive `image` and `category`. Default public UI is upcoming only, `America/New_York`.

This-weekend window for Dana:

`GET /v1/ashland-ky/events?from=2026-08-29&to=2026-08-31`

Date-only `to` includes that calendar day.

## Prerequisites

```bash
cp .env.example .env
docker compose up -d postgres
npx prisma migrate deploy
```

Or point `DATABASE_URL` at any Postgres 16 database and run the same migrate command.

`ASHLAND_KY_API_TOKEN` in `.env` is hashed (SHA-256) and stored on the tenant. The example value is a local placeholder, not a production secret. The phone UI and GET fall back to this seed file when Postgres is empty or down.

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

`tests/this-weekend.test.ts` locks the Aug 29–31 GET ids. `tests/frozen-fields.test.ts` validates every row against the public nine plus `image` and `category`.

## Do not

- Do not scrape thebookplace.org or ashland.librarycalendar.com.
- Do not invent `boyd-library` payloads.
- Do not invent remaining MaxPreps kickoffs or pub nights.
- Do not treat a complete row as published.
- Do not put real API tokens in the seed file.
- Do not write `/brand/visit-aky-logo.png` into JSON.
