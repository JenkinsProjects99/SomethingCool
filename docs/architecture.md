# Architecture

v0 is a single Next.js App Router service with PostgreSQL. Primary surface is an installable tourist phone PWA (not React Native, not a fork). The iframe widget is secondary. One tenant ships in the seed (`ashland-ky` / Visit AKY). The PWA, iframe, and partner API all read the same published rows as `GET /v1/ashland-ky/events`.

## Surfaces

| Route | Role |
| --- | --- |
| `/` | Tourist phone PWA (installable, photo cards, This Week default, calendar) |
| `/dana.html` | Shareable Dana preview of this weekend’s official rows (static, no localhost) |
| `/embed` | Secondary 360px iframe widget |
| `/embed/{slug}` | Single published event embed |
| `GET /v1/ashland-ky/events` | Partner feed, Bearer token. Frozen `from`/`to` window; additive `range` |
| `GET /api/health` | Liveness + request id |

There is no React Native app and no second repo. Playlist script stays with the logo file on visitaky.com.

The PWA loads published events on the server with the same tenant-scoped query as the partner feed. If Postgres is not provisioned, `/` falls back to published rows in the seed file so the phone preview still renders. The Bearer token never goes to the browser.

`GET /v1/ashland-ky/events` always accepts frozen `from` and `to` query params (`YYYY-MM-DD` or offset datetime; `from` inclusive). Date-only `to` includes that calendar day in America/New_York (exclusive the next midnight ET). The JSON body echoes `from` and `to`. Additive `range` (`month` | `week` | `upcoming` | `all`) may be used when a named window is enough.

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

Additive fields: `image` (official URL or `null`) and `category` (`music` | `sports` | `family` | `arts` | `community` | `food` | `outdoor`). Category is stored on the row. Do not infer it from `source`. Kids Paramount shows are `family`.

`startsAt` / `endsAt` may be `YYYY-MM-DD` (date-only, no invented clock time) or an offset datetime. `status`, `slug`, and `summary` stay internal. Never auto-publish.

`source` is a `.st-d-subheading` string, not a chip.

## Seed

One reloadable file: `data/seed/ashland-ky-events.v0.json`. Upsert on `id`. Official published rows only (Sean’s 225, Poage main-stage times, Thanksgiving Eve and NYE at 10am ET). Do not invent events.

At most 14 rows carry official Paramount (`cdn.saffire.com`) or Visit AKY (`static.showit.co`) image URLs. Every other row is `image: null` in JSON. The PWA draws the Visit AKY logo as a client-only fallback. Never drop a row for a missing photo. Do not write the logo URL into the seed. Do not invent events or fake photos as content.

Library rows come from published [thebookplace.org](https://www.thebookplace.org/) programs. MaxPreps rows are official Ashland home games. Do not invent pub nights (including Jerk Riley’s and Kel’s). Specified facebook rows include Poage Landing Days (date-only festival plus official main-stage times from poagelandingdays.com) and the Sandy’s nights.

## PWA

`public/manifest.webmanifest` + `public/sw.js`. Phone UI uses Visit AKY full-bleed photo cards (title/time overlay; official image or Visit AKY logo fallback), a centered logo, Design 96 tokens, and a Calendar tab. Default thumb is **Upcoming**. Public UI is upcoming first, then a **7-day ET lookback** — not the full seed history. Music and family sort ahead of sports. Times are America/New_York.

## Tenancy

Bearer token tenant must match the URL slug. Queries always include `tenantId` from the authenticated token.

## Logs

JSON lines with `requestId`. Middleware sets `x-request-id`.
