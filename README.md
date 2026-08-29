# Ashland Calendar (Visit AKY) — v0

Installable Visit AKY phone PWA (Next.js, not React Native) plus a secondary iframe widget for [visitaky.com](https://visitaky.com). Design 96.

Centered Visit AKY logo, Open Sans 800 titles, Glacial Indifference body, source as a subheading (not a chip), `.st-primary` `#326DCD`, `.st-secondary` 2px.

## What ships in v0

- PostgreSQL schema with tenant-scoped events
- Installable PWA at `/` (full-bleed photo cards; Upcoming / This Week / Calendar; All / Music / Sports / Community / Family)
- Dana-only phone preview (This Week default, date-first sort, photo cards, blue/purple logo fallback, Sports without First Friday, Calendar): `/dana.html` on this branch. Do not send localhost.
- Secondary iframe at `/embed`
- Reloadable official seed (Sean’s 225, Poage main-stage times, Thanksgiving Eve and NYE at 10am ET). At most 14 rows have official Paramount/Visit AKY image URLs; others stay `image: null` in JSON. Photo cards show the Visit AKY logo when `image` is null (client-only; the logo URL is not in the seed). Never drop a row for a missing photo. Category is stored (`music|sports|family|arts|community|food|outdoor`) and is not inferred from source. Kids Paramount shows are family.
- `GET /v1/ashland-ky/events` with Bearer auth
- Public nine fields plus additive `image` and `category`
- Never auto-publish
- Structured JSON logs and `x-request-id`
- WCAG 2.2 AA token pairing
- CI: lint, typecheck, tests (including tenant isolation)
- `public/manifest.webmanifest` + `public/sw.js`

## Quick start

```bash
cp .env.example .env
docker compose up -d postgres
npm install
npx prisma migrate deploy
npm run seed
npm run dev
```

Open the phone app at [http://localhost:3000](http://localhost:3000). Secondary widget: [http://localhost:3000/embed](http://localhost:3000/embed). Dana preview (no app server): [http://localhost:3000/dana.html](http://localhost:3000/dana.html).

The tourist page also renders from the seed file if Postgres is not up.

## Partner API

```bash
curl -s -H "Authorization: Bearer dev-ashland-ky-local-token" \
  "http://localhost:3000/v1/ashland-ky/events?from=2026-08-29&to=2026-08-31"
```

`from` and `to` are the frozen window (`from` inclusive; date-only `to` includes that Eastern Time calendar day). Additive `range` (`month` | `week` | `upcoming` | `all`) may be used when `from`/`to` are omitted. Drafts never appear. The weekend query above must return Sean’s volleyball, Exacta, soccer, and Novel Tea rows. Each payload includes `category`. Null `image` stays null.

The example token is a local placeholder. Rotate it before any shared host. A token for another tenant receives `403` even if the URL says `ashland-ky`.

## Iframe

```html
<iframe
  src="https://YOUR_HOST/embed"
  title="Visit AKY What's Happening"
  width="360"
  height="840"
  style="border:0"
></iframe>
```

Single listing:

```html
<iframe
  src="https://YOUR_HOST/embed/deana-carter"
  title="Deana Carter — Visit AKY"
  width="360"
  height="520"
  style="border:0"
></iframe>
```

## Docs

- [Architecture](docs/architecture.md)
- [Seed import how-to](docs/seed-import.md)
- [Visit AKY tokens](docs/visit-aky-tokens.md)

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Vitest, including tenant isolation and never-auto-publish |
| `npm run seed` | First import (upsert on `id`) |
| `npm run seed:reload` | Upsert content, preserve status |

## Product rules

- Source is a subheading, not a pill. Purple and mint are hover / themed outlines only.
- Playlist script stays in the logo file, not as a widget type.
- Events do not auto-publish.
- Do not invent events or fake photos as content.
- **Upcoming** is the default tourist view. Cards and calendar are upcoming first, then a 7-day Eastern Time lookback — not the full seed history.
