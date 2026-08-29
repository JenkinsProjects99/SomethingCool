# Architecture

v0 is a single Next.js App Router service with PostgreSQL. Primary surface is an installable tourist phone PWA (not React Native, not a fork). The iframe widget is secondary. One tenant ships in the seed (`ashland-ky` / Visit AKY). The PWA, iframe, and partner API all read the same published rows as `GET /v1/ashland-ky/events`.

## Surfaces

| Route | Role |
| --- | --- |
| `/` | Tourist phone PWA (installable, photo cards, client filters) |
| `/embed` | Secondary 360px iframe widget |
| `/embed/{slug}` | Single published event embed |
| `GET /v1/ashland-ky/events` | Partner feed, Bearer token |
| `GET /api/health` | Liveness + request id |

There is no React Native app and no second repo. Playlist script stays with the logo file on visitaky.com.

The PWA loads published events on the server with the same tenant-scoped query as the partner feed. The Bearer token never goes to the browser.

## Public event contract

Nine frozen fields (do not rename):

1. `id`
2. `title`
3. `startsAt`
4. `endsAt`
5. `timezone`
6. `venue`
7. `address`
8. `url`
9. `source`

Additive field only: `image` (URL or `null`). `image` is `null` on every seed row until Sean has photos.

`startsAt` / `endsAt` may be `YYYY-MM-DD` (date-only, no invented clock time) or an offset datetime. `status`, `slug`, and `summary` stay internal. Never auto-publish.

`source` is a `.st-d-subheading` string, not a chip.

## Seed

One reloadable file: `data/seed/ashland-ky-events.v0.json`. Upsert on `id`.

Target **225** = 27 original + 161 `boyd-library` (thebookplace.org only) + 27 maxpreps home games + specified school/facebook rows. This file holds official rows only. Do not invent library rows, remaining kickoffs, or pub nights (including Jerk Riley’s and Kel’s). Specified facebook rows: Poage Landing Days (date-only) and the two Sandy’s nights.

## PWA

`public/manifest.webmanifest` + `public/sw.js`. Phone UI uses Visit AKY photo cards, a centered logo, and Design 96 tokens. Rank and filter in the client: date, category, upcoming vs all. Festivals and music sort ahead of library storytimes.

## Tenancy

Bearer token tenant must match the URL slug. Queries always include `tenantId` from the authenticated token.

## Logs

JSON lines with `requestId`. Middleware sets `x-request-id`.
