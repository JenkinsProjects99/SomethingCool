# Seed import how-to

The v0 seed is `data/seed/ashland-ky-events.v0.json`. One reloadable file. Public nine fields plus additive `image` and `category`. Seed-only: `slug`, `summary`, `status`.

## Count

| Stage | Rows |
| --- | --- |
| Official published rows | **230** (Sean’s 225 + official Poage main-stage times + Thanksgiving Eve at 10am ET) |
| Official Paramount / Visit AKY images | **at most 14** |
| Remaining images | `null` in JSON (client shows the Visit AKY logo; do not write the logo URL into the seed) |

The file keeps the original editorial 27, specified school/facebook rows, official Paramount extras (Shrek, Festival of Trees & Trains), official MaxPreps Ashland home games, and published [thebookplace.org](https://www.thebookplace.org/) programs (161+). Closings and meeting-room reservations were not copied. Do not invent Jerk Riley’s, Kel’s, or other pub nights.

`category` is stored per row (`music` | `sports` | `family` | `arts` | `community` | `food` | `outdoor`). Do not infer it from `source`. Kids Paramount shows are `family`.

Poage Landing Days keeps the date-only festival row (`2026-09-18`–`2026-09-20`) plus official Main Stage times from [poagelandingdays.com/main-stage.html](https://www.poagelandingdays.com/main-stage.html): Opening Ceremony Sat 7:00 PM, JigJam Sat 7:15 PM, The Kentucky Headhunters Sat 9:00 PM, House of Grace Sun 11:00 AM.

Thanksgiving Eve at Sandy’s is `2026-11-25T10:00:00-05:00`. A tentative 8pm downtown NYE was removed; do not invent a replacement NYE row.

`GET /v1/ashland-ky/events` returns every **published** row for the range. It does not cap at 27. Date-only `to` includes that calendar day in Eastern Time.

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

`tests/frozen-fields.test.ts` validates every row against the public nine plus `image` and `category`. `tests/seed-sources.test.ts` blocks Ohio library URLs and invented pub nights. `tests/this-weekend.test.ts` locks `from=2026-08-29&to=2026-08-31` to Sean’s volleyball, Exacta, soccer, and Novel Tea rows.

## Do not

- Do not invent events or fake photos as content.
- Do not infer `category` from `source`.
- Do not write the Visit AKY logo URL into the seed. Null `image` stays null; the logo fallback is client-only.
- Never drop a row because a photo is missing.
- Do not treat a complete row as published.
- Do not put real API tokens in the seed file.
